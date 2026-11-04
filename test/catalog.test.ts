import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { mkdtemp, readFile, realpath, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { zipSync, strToU8 } from "fflate";
import { Response } from "undici";
import { apiInput, prepareApiCall } from "../src/catalog-tools.js";
import type { ApiInput } from "../src/catalog-tools.js";
import { YShopClient, parseJsonResponse, parseResponse } from "../src/client.js";
import { operations, operationNames } from "../src/definitions.js";
import type { JsonObject, Operation } from "../src/definitions.js";
import type { HttpFetch, Runtime } from "../src/config.js";
import { readConfig } from "../src/config.js";
import { readUpload, saveDownload } from "../src/files.js";
import { createServer } from "../src/server.js";

const config = readConfig({ YSHOP_SELLER_ID: "example-store" });
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0x00]);
function leaf(path: string): string | number | boolean {
  if (/orderid$/i.test(path)) return "example-store-10001";
  if (path.endsWith("IsPointFix")) return true;
  if (path.endsWith("IsQuotation")) return false;
  if (path === "mode") return 1;
  return "1";
}
function setPath(root: JsonObject, path: string, value: string | number | boolean) {
  const parts = path.split("/");
  let node = root;
  for (const part of parts.slice(0, -1)) { if (!node[part] || typeof node[part] !== "object") node[part] = {}; node = node[part] as JsonObject; }
  node[parts.at(-1)!] = value;
}
function minimal(operation: Operation): ApiInput {
  const definition = operations[operation];
  const parameters: JsonObject = {};
  for (const required of definition.required) setPath(parameters, required, leaf(required));
  if (operation === "externalAucStoreTopic") { parameters.aucId = "123456789"; parameters.preOrderId = "example-before-order"; }
  const path_parameters = Object.fromEntries([...definition.url.matchAll(/\{(\w+)\}/g)].map(m => [m[1]!, "example-1"]));
  return { operation, parameters, query: {}, path_parameters };
}

test("inventory covers every current entry from all 12 official API groups", async () => {
  const inventory = JSON.parse(await readFile(new URL("./api-inventory.json", import.meta.url), "utf8")) as { source: string }[];
  assert.equal(operationNames.length, 104);
  assert.deepEqual(new Set(operationNames.map(op => operations[op].source)), new Set(inventory.map(d => d.source)));
  const counts: Record<string, number> = {};
  for (const name of operationNames) { const d = operations[name]; counts[d.group] = (counts[d.group] ?? 0) + 1; }
  assert.deepEqual(counts, { order: 12, subscription: 17, item: 9, stock: 3, image: 12, product: 5, stCategory: 6, selling: 11, design: 7, question: 11, real: 6, public: 5 });
  for (const op of operationNames) {
    const d = operations[op];
    assert.equal(new URL(d.url).protocol, "https:");
    assert.ok(["circus.shopping.yahooapis.jp", "shopping.yahooapis.jp"].includes(new URL(d.url).hostname));
  }
});

test("all 104 request bindings use their verified method, body format and automatic store authentication", async t => {
  const dir = await mkdtemp(join(tmpdir(), "yshop-contract-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const fixtures = { image: join(dir, "product.jpg"), zip: join(dir, "images.zip"), csv: join(dir, "products.csv"), attachment: join(dir, "guide.pdf") };
  await writeFile(fixtures.image, jpeg);
  await writeFile(fixtures.zip, zipSync({ "product.jpg": jpeg }));
  await writeFile(fixtures.csv, "code,name\r\nitem,商品\r\n");
  await writeFile(fixtures.attachment, "%PDF-1.4\n%%EOF");
  const { publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  let current: Operation = "getItem";
  const captures: { operation: Operation; url: URL; init: Parameters<HttpFetch>[1] }[] = [];
  const runtime: Runtime = {
    auth: { ClientID: "fixture-client", ClientSecret: "fixture-value", RefreshToken: "fixture-refresh", SellerID: config.sellerId },
    publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(), signatureVersion: "2", close: async () => {},
    fetch: async (url, init) => {
      if (String(url).includes("auth.login.yahoo.co.jp")) return new Response(JSON.stringify({ access_token: "fixture-access", expires_in: 360000 }));
      captures.push({ operation: current, url: new URL(String(url)), init });
      const d = operations[current];
      if (d.response === "file") return new Response(current === "externalTalkFileDownload" ? "%PDF-1.4\n%%EOF" : "code,name\nitem,商品", { headers: { "content-type": current === "externalTalkFileDownload" ? "application/pdf" : "text/csv; charset=Shift_JIS" } });
      if (d.encoding === "json" || d.group === "question" || d.group === "real" || current.endsWith("V2") || d.group === "public") {
        const marker = d.jsonSuccess;
        return new Response(JSON.stringify(marker ? { [marker]: marker === "results" ? [{ result: "OK" }] : ["status", "result"].includes(marker) ? "OK" : "fixture-id" } : { results: [] }));
      }
      if (current === "setStock") return new Response("<ResultSet><Result><ItemCode>item</ItemCode><Quantity>1</Quantity></Result></ResultSet>");
      return new Response("<ResultSet><Status>OK</Status></ResultSet>");
    },
  };
  let now = 100_000;
  const client = new YShopClient(config, async () => runtime, { now: () => now, wait: async ms => { now += ms; } });
  t.after(() => client.close());
  for (const operation of operationNames) {
    current = operation;
    const d = operations[operation];
    const input = minimal(operation);
    if (d.uploadKind) input.upload = { path: fixtures[d.uploadKind] };
    const call = await prepareApiCall(input, config, !d.readOnly);
    const data = await client.request(call);
    const capture = captures.at(-1)!;
    assert.equal(capture.operation, operation);
    assert.equal(capture.init?.method, d.method, operation);
    assert.equal(capture.url.pathname, new URL(d.url.replace(/\{\w+\}/g, "example-1")).pathname, operation);
    const headers = capture.init?.headers as Record<string, string>;
    if (d.group === "public") {
      assert.equal(headers.Authorization, undefined);
      assert.equal(capture.url.searchParams.get("appid"), "fixture-client");
    } else assert.equal(headers["X-sws-signature-version"], "2");
    if (d.encoding === "xml") assert.ok(String(capture.init?.body).includes("<Req>"), operation);
    if (d.encoding === "json") assert.equal(headers["Content-Type"], "application/json; charset=UTF-8");
    if (d.sellerLocation === "query" && d.sellerField && d.group !== "public") assert.equal(capture.url.searchParams.get(d.sellerField), config.sellerId, operation);
    if (d.response === "file") { const file = data.file as { path: string; bytes: number }; assert.ok(file.bytes > 0); await unlink(file.path); }
  }
  assert.equal(captures.length, 104);
});

test("read dispatcher rejects every mutation including reserve/cancel modes", async () => {
  for (const operation of operationNames.filter(op => !operations[op].readOnly)) await assert.rejects(prepareApiCall(minimal(operation), config, false), /更新API/);
  const reservation = await prepareApiCall(apiInput.parse({ operation: "reservePublish", parameters: { mode: 3 } }), config, false);
  assert.equal(reservation.parameters?.mode, 3);
});

test("raw caller cannot override authentication, leave the store, change route or send arbitrary files", async () => {
  for (const raw of [
    { operation: "getItem", parameters: { item_code: "item", seller_id: "example-another" } },
    { operation: "getItem", query: { appid: "arbitrary" }, parameters: { item_code: "item" } },
    { operation: "orderInfo", parameters: { Target: { OrderId: "other-10001", Field: "OrderId" } } },
    { operation: "subscriptionOriginDetail", path_parameters: { subscription_id: "../order" } },
    { operation: "getItem", upload: { path: "/tmp/data.csv" }, parameters: { item_code: "item" } },
    { operation: "getItem", parameters: { item_code: "item", Authorization: "arbitrary" } },
  ]) await assert.rejects(prepareApiCall(apiInput.parse(raw), config, true));
  assert.throws(() => apiInput.parse({ operation: "getItem", url: "https://example.com" }));
  const publicSearch = await prepareApiCall(apiInput.parse({ operation: "itemSearch", parameters: { seller_id: "example-another-public-store" } }), config, false);
  assert.equal(publicSearch.parameters?.seller_id, "example-another-public-store");
});

test("XML arrays and JSON null/false/zero survive preparation; topicId goes in the URL", async () => {
  const split = minimal("orderSplit");
  split.parameters.Order = [{ SplitId: 1, Detail: { PayCharge: 0, ShipCharge: 0, GiftWrapCharge: 0, Discount: 0, UsePoint: 0 }, Item: [{ LineId: 1, Quantity: 1 }] }];
  const call = await prepareApiCall(split, config, true);
  assert.deepEqual(call.xml?.Order, split.parameters.Order);
  const real = await prepareApiCall(apiInput.parse({ operation: "setRealStock", parameters: { stocks: [{ srId: "item", skuId: null, storeInStock: "1:0", storeInStockFew: "", storeInStockUpdatedTime: "2026-11-04 00:00:00", extraFlag: false, extraNumber: 0 }] } }), config, true);
  assert.deepEqual(real.json?.stocks, [{ srId: "item", skuId: null, storeInStock: "1:0", storeInStockFew: "", storeInStockUpdatedTime: "2026-11-04 00:00:00", extraFlag: false, extraNumber: 0 }]);
  const inquiry = await prepareApiCall(apiInput.parse({ operation: "externalTalkAdd", parameters: { topicId: "example-topic", body: "確認 & ご案内" } }), config, true);
  assert.equal(inquiry.query?.topicId, "example-topic");
  assert.equal(inquiry.json?.topicId, undefined);
  assert.equal(inquiry.json?.body, "確認 & ご案内");
  const auction = await prepareApiCall(apiInput.parse({ operation: "externalAucStoreTopic", parameters: { categoryId: 46, orderId: "example-store-10001", title: "確認", body: "ご案内" } }), config, true);
  assert.equal(auction.json?.orderId, "example-store-10001");
  await assert.rejects(prepareApiCall(apiInput.parse({ operation: "externalAucStoreTopic", parameters: { categoryId: 46, orderId: "example-store-10001", aucId: "123", title: "確認", body: "ご案内" } }), config, true), /指定しません/);
});

test("JSON arrays, per-target cancellation outcomes and validation-history error data are parsed correctly", () => {
  assert.deepEqual(parseJsonResponse("[]", 200, "dataCheckHistorySummaryV2", true), { results: [] });
  const errors = parseJsonResponse('[{"errorCode":"mkwrite-stock-1005"}]', 200, "dataCheckHistoryDetailV2", true);
  assert.ok(errors.results);
  assert.throws(() => parseJsonResponse('{"errorCode":"ERR-00105"}', 200, "dataCheckHistoryDetailV2", true), /ERR-00105/);
  assert.ok(parseResponse("<ResultSet><Result><ErrorCode>X-0001</ErrorCode></Result></ResultSet>", 200, "dataCheckHistoryDetail", true));
  assert.ok(parseJsonResponse('{"results":[{"result":"OK"}]}', 200, "subscriptionCancelMulti", false));
  assert.throws(() => parseJsonResponse('{"results":[{"result":"OK"},{"result":"NG"}]}', 200, "subscriptionCancelMulti", false), /APIエラー/);
  assert.throws(() => parseJsonResponse('{"message":"no success marker"}', 200, "externalTalkRead", false), /成功/);
  assert.throws(() => parseJsonResponse('{"error":"SUBSCRIPTION-ORDER-API-1001","message":"private-details"}', 200, "subscriptionSkip", false), error => error instanceof Error && error.message.includes("SUBSCRIPTION-ORDER-API-1001") && !error.message.includes("private-details"));
});

test("preview HTML can contain a DOCTYPE inside CDATA, while actual XML entities are rejected", () => {
  const html = "<ResultSet><Result><Html><![CDATA[<!DOCTYPE html><html><body>test</body></html>]]></Html></Result></ResultSet>";
  assert.ok(parseResponse(html, 200, "getPreviewHtml", true));
  assert.throws(() => parseResponse('<!DOCTYPE x [<!ENTITY y "data">]><ResultSet/>', 200, "getPreviewHtml", true));
});

test("CSV, image ZIP and PDF validation rejects other files before any upload", async t => {
  const dir = await mkdtemp(join(tmpdir(), "yshop-files-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const csv = join(dir, "items.csv");
  await writeFile(csv, new Uint8Array([0x63, 0x6f, 0x64, 0x65, 0x2c, 0x96, 0xbc, 0x0a]));
  assert.equal((await readUpload(csv, undefined, "csv")).mime, "text/csv");
  const zip = join(dir, "images.zip");
  await writeFile(zip, zipSync({ "item.jpg": jpeg }));
  assert.equal((await readUpload(zip, undefined, "zip")).mime, "application/zip");
  await writeFile(zip, zipSync({ "data.json": strToU8("test") }));
  await assert.rejects(readUpload(zip, undefined, "zip"), /画像ZIP/);
  const pdf = join(dir, "guide.pdf");
  await writeFile(pdf, "%PDF-1.4\n/Encrypt 1 0 R\n%%EOF");
  await assert.rejects(readUpload(pdf, undefined, "attachment"), /暗号化/);
  await assert.rejects(readUpload("/tmp/secret.csv", undefined, "csv"), /機密/);
});

test("download artifacts preserve bytes, ignore remote names and discard HTTP-200 error bodies", async t => {
  const dir = await mkdtemp(join(tmpdir(), "yshop-download-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const bytes = new Uint8Array([0x63, 0x6f, 0x64, 0x65, 0x2c, 0x96, 0xbc, 0x0a]);
  const result = await saveDownload(new Response(bytes, { headers: { "content-type": "text/csv", "content-disposition": 'attachment; filename="../../other.csv"' } }), "downloadSubmit", dir);
  const file = result.file as { path: string; bytes: number; sha256: string };
  assert.equal(file.bytes, bytes.length);
  assert.ok(file.path.startsWith(await realpath(dir)));
  assert.deepEqual(new Uint8Array(await readFile(file.path)), bytes);
  await assert.rejects(saveDownload(new Response('<Error><Code>px-04306</Code></Error>', { headers: { "content-type": "application/octet-stream" } }), "downloadSubmit", dir), /エラー応答/);
});

test("MCP exposes all operations and write previews never contact AWS or APIs", async t => {
  let requests = 0;
  const server = createServer(config, { request: async () => { requests++; return {}; } });
  const client = new Client({ name: "catalog-test", version: "0.2.0" });
  const [local, remote] = InMemoryTransport.createLinkedPair();
  await server.connect(remote); await client.connect(local);
  t.after(async () => { await client.close(); await server.close(); });
  const catalog = await client.callTool({ name: "yshop_api_catalog", arguments: {} });
  assert.ok("content" in catalog);
  assert.equal((catalog.structuredContent as Record<string, unknown>).total, 104);
  for (const operation of operationNames.filter(op => !operations[op].readOnly && !operations[op].uploadKind)) {
    const input = minimal(operation);
    const result = await client.callTool({ name: "yshop_write_api", arguments: input });
    assert.ok("content" in result);
    assert.ok(!result.isError, `${operation}: ${JSON.stringify(result)}`);
    assert.equal((result.structuredContent as Record<string, unknown>).dry_run, true);
  }
  assert.equal(requests, 0);
});
