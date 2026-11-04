import assert from "node:assert/strict";
import test from "node:test";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import type { ApiCall } from "../src/client.js";
import { readConfig } from "../src/config.js";
import { createServer } from "../src/server.js";

async function setup(t: test.TestContext) {
  const calls: ApiCall[] = [];
  const server = createServer(readConfig({ YSHOP_SELLER_ID: "example-store" }), { request: async call => { calls.push(call); return { ResultSet: { Status: "OK" } }; } });
  const client = new Client({ name: "test", version: "0.1.0" });
  const [local, remote] = InMemoryTransport.createLinkedPair();
  await server.connect(remote);
  await client.connect(local);
  t.after(async () => { await client.close(); await server.close(); });
  async function call(name: string, args: Record<string, unknown>) {
    const result = await client.callTool({ name, arguments: args });
    assert.ok("content" in result);
    return result;
  }
  return { calls, client, call };
}

test("all 18 tools advertise accurate read/write annotations", async t => {
  const { client } = await setup(t);
  const { tools } = await client.listTools();
  assert.equal(tools.length, 18);
  assert.equal(tools.find(t => t.name === "yshop_get_stock")?.annotations?.readOnlyHint, true);
  assert.equal(tools.find(t => t.name === "yshop_get_publish_reservation")?.annotations?.readOnlyHint, true);
  assert.equal(tools.find(t => t.name === "yshop_reserve_publish")?.annotations?.destructiveHint, true);
});

test("all ordinary write previews work without AWS or API calls", async t => {
  const { calls, call } = await setup(t);
  for (const [name, args] of [
    ["yshop_edit_item", { item_code: "abc", fields: { name: "Test", path: "Tops", product_category: 1, price: 1000 } }],
    ["yshop_update_items", { items: [{ item_code: "abc", price: 1000, sale_price: "" }] }],
    ["yshop_set_stock", { items: [{ item_code: "abc:size-s", quantity: 0 }] }],
    ["yshop_submit_item", { item_code: "abc" }],
    ["yshop_reserve_publish", {}],
    ["yshop_update_shipping", { order_id: "example-store-10000", ship_status: 3, ship_date: "20261104", tracking_number: "AB123456" }],
  ] as const) {
    const result = await call(name, args);
    assert.ok(!result.isError);
    assert.equal((result.structuredContent as Record<string, unknown>)?.dry_run, true);
  }
  assert.equal(calls.length, 0);
});

test("partial update uses RFC3986 inner encoding and requires both price fields", async t => {
  const { calls, call } = await setup(t);
  const result = await call("yshop_update_items", { items: [{ item_code: "abc", name: "a b+&=服", price: 1500, sale_price: "" }], dry_run: false });
  assert.ok(!result.isError);
  const inner = calls[0]?.parameters?.item1 as string;
  assert.ok(inner.includes("%20"));
  assert.equal(new URLSearchParams(inner).get("name"), "a b+&=服");
  assert.equal(new URLSearchParams(inner).get("sale_price"), "");
  assert.equal(calls[0]?.operation, "updateItems");
  const invalid = await call("yshop_update_items", { items: [{ item_code: "abc", price: 1000 }], dry_run: false });
  assert.equal(invalid.isError, true);
  assert.equal(calls.length, 1);
});

test("invalid input never reaches the API", async t => {
  const { calls, call } = await setup(t);
  for (const [name, args] of [
    ["yshop_list_items", {}],
    ["yshop_set_stock", { items: [{ item_code: "abc", quantity: -1 }], dry_run: false }],
    ["yshop_set_stock", { items: [{ item_code: "abc", quantity: 1 }, { item_code: "abc", quantity: 2 }], dry_run: false }],
    ["yshop_edit_item", { item_code: "abc", fields: { price: 1 }, dry_run: false }],
    ["yshop_edit_item", { item_code: "abc", fields: { name: "a", path: "b", product_category: 1, price: 1, seller_id: "example-other" }, dry_run: false }],
    ["yshop_get_order", { order_id: "other-store-1000" }],
    ["yshop_update_shipping", { order_id: "other-store-1000", ship_status: 1, dry_run: false }],
    ["yshop_update_shipping", { order_id: "example-store-1000", ship_status: 3, dry_run: false }],
    ["yshop_update_shipping", { order_id: "example-store-1000", ship_status: 1, tracking_number: "AB123", no_tracking_reason: "101", dry_run: false }],
    ["yshop_list_orders", { from: "20261104000000", to: "20261101000000" }],
  ] as const) {
    const result = await call(name, args);
    assert.equal(result.isError, true, name);
  }
  assert.equal(calls.length, 0);
});

test("stock absolute assignment and shipping include no implicit publish request", async t => {
  const { calls, call } = await setup(t);
  await call("yshop_set_stock", { items: [{ item_code: "abc:s", quantity: 0 }, { item_code: "abc:m", quantity: 5 }], dry_run: false });
  await call("yshop_update_shipping", { order_id: "example-store-1000", ship_status: 3, ship_date: "20261104", tracking_number: "AB123456", dry_run: false });
  assert.deepEqual(calls[0]?.parameters, { item_code: "abc:s,abc:m", quantity: "0,5" });
  assert.equal((calls[1]?.xml?.Target as Record<string, unknown>).IsPointFix, true);
  assert.deepEqual(calls.map(c => c.operation), ["setStock", "orderShipStatusChange"]);
});

test("read-only reservation uses mode 3 and order filters keep false", async t => {
  const { calls, call } = await setup(t);
  await call("yshop_get_publish_reservation", {});
  await call("yshop_list_orders", { from: "20261101000000", to: "20261104235959", is_seen: false, results: 1 });
  assert.deepEqual(calls[0]?.parameters, { mode: 3 });
  const search = calls[1]?.xml?.Search as Record<string, unknown>;
  assert.equal((search.Condition as Record<string, unknown>).IsSeen, false);
  assert.ok(!(search.Field as string).includes("Bill"));
});
