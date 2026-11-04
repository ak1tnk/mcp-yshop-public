import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { prepareApplication } from "../src/bootstrap.js";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const root = fileURLToPath(new URL("../", import.meta.url));
const live = process.argv.includes("--live");
if (process.argv.includes("--orders") && !live) throw new Error("--orders requires --live");
const application = live ? await prepareApplication() : undefined;
const transport = new StdioClientTransport({
  command: process.execPath, args: [fileURLToPath(new URL("../dist/index.js", import.meta.url))], cwd: root,
  env: { ...Object.fromEntries(Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined)),
    ...(!live ? { YSHOP_AUTH_SOURCE: "env", YSHOP_SELLER_ID: "example-store" } : {}),
  },
  stderr: "pipe",
});
// Do not forward SDK/process exceptions or child stderr containing request data.
const client = new Client({ name: "yshop-smoke", version: "0.1.0" });

async function call(name: string, args: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: args });
  if (!("content" in result) || result.isError) {
    const message = "content" in result && Array.isArray(result.content) ? result.content.filter(c => c.type === "text").map(c => c.text).join(" ") : "MCP応答形式エラー";
    throw new Error(`${name}: ${message}`);
  }
  const data = result.structuredContent as Record<string, unknown>;
  assert.ok(data);
  console.log(JSON.stringify({ tool: name, operation: args.operation, ok: true, dry_run: data.dry_run }));
  return data;
}

try {
  await client.connect(transport);
  const tools = await client.listTools();
  assert.equal(tools.tools.length, 18);
  console.log(JSON.stringify({ tools: tools.tools.length, stdio: "ok" }));
  const catalog = await call("yshop_api_catalog", {});
  assert.equal(catalog.total, 104);
  const stock = await call("yshop_set_stock", { items: [{ item_code: "mcp-preview", quantity: 0 }] });
  assert.equal(stock.dry_run, true);
  const update = await call("yshop_update_items", { items: [{ item_code: "mcp-preview", price: 1000, sale_price: "" }] });
  assert.equal(update.dry_run, true);
  const publish = await call("yshop_reserve_publish", {});
  assert.equal(publish.dry_run, true);
  if (live) {
    await call("yshop_list_store_categories", {});
    const items = await call("yshop_list_items", { query: process.env.YSHOP_SMOKE_QUERY ?? "shirt", results: 1 });
    const root = (items.data as Record<string, unknown>)?.ResultSet as Record<string, unknown> | undefined;
    const item = (Array.isArray(root?.Result) ? root.Result[0] : root?.Result) as Record<string, unknown> | undefined;
    if (typeof item?.ItemCode === "string") {
      await call("yshop_get_item", { item_code: item.ItemCode });
      await call("yshop_get_stock", { item_codes: [item.ItemCode] });
    }
    await call("yshop_get_publish_reservation", {});
    await call("yshop_list_publish_history", { publish_id: 0, results: 1 });
    await call("yshop_read_api", { operation: "libDirectoryList" });
    await call("yshop_read_api", { operation: "getShopBrandList", parameters: { query: "shirt", results: 1 } });
    const history = await call("yshop_read_api", { operation: "dataCheckHistorySummaryV2", parameters: { dataType: "STOCK", limit: 1 } });
    const checks = (history.data as { results?: { bulkId?: string }[] } | undefined)?.results;
    if (checks?.[0]?.bulkId) await call("yshop_read_api", { operation: "dataCheckHistoryDetailV2", parameters: { bulkId: checks[0].bulkId, dataType: "STOCK", limit: 1 } });
    await call("yshop_read_api", { operation: "itemSearch", parameters: { seller_id: application!.config.sellerId, results: 1 } });
    await call("yshop_read_api", { operation: "subscriptionOriginList", parameters: { countFrom: 1, countTo: 1 } });
    await call("yshop_read_api", { operation: "subscriptionChangeRequestList", parameters: { countFrom: 1, countTo: 1 } });
    await call("yshop_read_api", { operation: "externalTalkList", parameters: { result: 1 } });
    await call("yshop_read_api", { operation: "getCustomPageList" });
    await call("yshop_read_api", { operation: "getRealStore" });
    await call("yshop_read_api", { operation: "getRealStockList", parameters: { items: [{ srId: typeof item?.ItemCode === "string" ? item.ItemCode : "mcp-read-verification", skuId: null }] } });
  }
  if (process.argv.includes("--orders")) {
    const compact = (date: Date) => new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().replace(/\D/g, "").slice(0, 14);
    const orders = await call("yshop_list_orders", { from: compact(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), to: compact(new Date()), results: 1, fields: ["OrderId"] });
    function findOrderId(value: unknown): string | undefined {
      if (!value || typeof value !== "object") return undefined;
      if ("OrderId" in value && typeof value.OrderId === "string") return value.OrderId;
      for (const child of Object.values(value)) { const id = findOrderId(child); if (id) return id; }
      return undefined;
    }
    const id = findOrderId(orders.data);
    if (id) await call("yshop_get_order", { order_id: id });
    else console.log(JSON.stringify({ tool: "yshop_get_order", skipped: "no orders in the last 7 days" }));
  }
} catch (error) {
  // Tool errors have already been sanitized by the server.
  console.error(error instanceof Error && error.message.startsWith("yshop_") ? error.message : "MCP smoke check failed.");
  process.exitCode = 1;
} finally { await client.close(); application?.close(); }
