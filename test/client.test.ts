import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import type { File } from "node:buffer";
import test from "node:test";
import { FormData, Response } from "undici";
import { YShopClient, parseResponse } from "../src/client.js";
import type { HttpFetch, Runtime } from "../src/config.js";
import { readConfig } from "../src/config.js";
import { safeMessage } from "../src/errors.js";

// Ephemeral test material is generated in memory and never written to disk.
const { publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const key = publicKey.export({ type: "spki", format: "pem" }).toString();
const auth = { ClientID: "test-client", ClientSecret: "test-value", RefreshToken: "test-refresh", SellerID: "example-store" };
const ok = "<ResultSet><Result><Status>OK</Status></Result></ResultSet>";
const access = () => new Response(JSON.stringify({ access_token: "test-access", expires_in: 3600 }));

function setup(responses: (Response | Error)[]) {
  const calls: { url: URL; init: Parameters<HttpFetch>[1] }[] = [];
  const waits: number[] = [];
  let now = 100_000;
  const fetch: HttpFetch = async (url, init) => {
    calls.push({ url: new URL(String(url)), init });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    if (!next) throw new Error("Unexpected test request");
    return next;
  };
  const runtime: Runtime = { auth, publicKey: key, signatureVersion: "5", fetch, close: async () => {} };
  const client = new YShopClient(readConfig({ YSHOP_SELLER_ID: "example-store" }), async () => runtime, {
    now: () => now, wait: async ms => { waits.push(ms); now += ms; },
  });
  return { calls, client, waits, advance: (ms: number) => { now += ms; } };
}

test("GET requests sign version 5, scope the store and cache the access value", async () => {
  const { client, calls } = setup([access(), new Response("<ResultSet totalResultsReturned=\"0\"/>"), new Response(ok)]);
  await client.request({ operation: "myItemList", parameters: { query: "a b+", seller_id: "example-other" } });
  await client.request({ operation: "getItem", parameters: { item_code: "abc" } });
  assert.equal(calls.length, 3);
  assert.equal(calls[0]?.url.hostname, "auth.login.yahoo.co.jp");
  assert.equal(calls[1]?.init?.method, "GET");
  assert.equal(calls[1]?.url.searchParams.get("seller_id"), auth.SellerID);
  assert.equal(calls[1]?.url.searchParams.get("query"), "a b+");
  assert.equal((calls[1]?.init?.headers as Record<string, string>)["X-sws-signature-version"], "5");
  assert.ok((calls[1]?.init?.headers as Record<string, string>)["X-sws-signature"]);
  assert.equal(calls[1]?.init?.redirect, "error");
});

test("OAuth-only accounts omit both RSA headers", async () => {
  const calls: Record<string, string>[] = [];
  const runtime: Runtime = { auth, publicKey: "", close: async () => {}, fetch: async (url, init) => {
    if (String(url).includes("auth.login.yahoo.co.jp")) return access();
    calls.push(init?.headers as Record<string, string>);
    return new Response(ok);
  } };
  const client = new YShopClient(readConfig({ YSHOP_SELLER_ID: "example-store" }), async () => runtime, { now: () => 100_000, wait: async () => {} });
  await client.request({ operation: "getItem", parameters: { item_code: "example" } });
  assert.equal(calls[0]?.Authorization, "Bearer test-access");
  assert.equal(calls[0]?.["X-sws-signature"], undefined);
  assert.equal(calls[0]?.["X-sws-signature-version"], undefined);
  await client.close();
});

test("POST stock keeps code/quantity order, zero quantity and leading zeros", async () => {
  const { client, calls } = setup([access(), new Response("<ResultSet><Result><ItemCode>001</ItemCode><Quantity>0</Quantity></Result></ResultSet>")]);
  const result = await client.request({ operation: "setStock", parameters: { item_code: "001:a,001:b", quantity: "0,2" } });
  const params = calls[1]?.init?.body as URLSearchParams;
  assert.equal(params.get("quantity"), "0,2");
  assert.equal(params.get("seller_id"), auth.SellerID);
  assert.equal((result.ResultSet as { Result: { ItemCode: string } }).Result.ItemCode, "001");
});

test("order XML escapes content and injects the pinned seller", async () => {
  const { client, calls } = setup([access(), new Response(ok)]);
  await client.request({ operation: "orderShipStatusChange", xml: { SellerId: "example-other", Target: { OrderId: "example-store-10001", IsPointFix: true }, Order: { Ship: { ShipStatus: 3, ShipNotes: 'A&B <test> "' } } } });
  const xml = calls[1]?.init?.body as string;
  assert.ok(xml.includes("<SellerId>example-store</SellerId>"));
  assert.ok(xml.includes("A&amp;B &lt;test&gt;"));
  assert.ok(xml.includes("<IsPointFix>true</IsPointFix>"));
  assert.equal((calls[1]?.init?.headers as Record<string, string>)["Content-Type"], "application/xml; charset=UTF-8");
});

test("image upload puts seller in the query and lets FormData set its boundary", async () => {
  const { client, calls } = setup([access(), new Response(ok)]);
  await client.request({ operation: "uploadLibImage", image: { bytes: new Uint8Array([0xff, 0xd8, 0xff]), filename: "item.jpg", mime: "image/jpeg", directory: "パーツ" } });
  assert.equal(calls[1]?.url.searchParams.get("seller_id"), auth.SellerID);
  const form = calls[1]?.init?.body as FormData;
  assert.equal(form.get("directory"), "パーツ");
  assert.equal((calls[1]?.init?.headers as Record<string, string>)["Content-Type"], undefined);
  assert.equal((form.get("file") as File).name, "item.jpg");
});

test("concurrent calls are serialized at one request per second", async () => {
  const { client, calls, waits } = setup([access(), new Response(ok), new Response(ok), new Response(ok)]);
  await Promise.all([1, 2, 3].map(n => client.request({ operation: "getItem", parameters: { item_code: String(n) } })));
  assert.equal(calls.length, 4);
  assert.deepEqual(waits, [0, 1000, 1000]);
  assert.deepEqual(calls.slice(1).map(c => c.url.searchParams.get("item_code")), ["1", "2", "3"]);
});

test("access is refreshed after expiry", async () => {
  const { client, calls, advance } = setup([access(), new Response(ok), access(), new Response(ok)]);
  await client.request({ operation: "getItem", parameters: { item_code: "abc" } });
  advance(3_600_000);
  await client.request({ operation: "getItem", parameters: { item_code: "abc" } });
  assert.equal(calls.filter(c => c.url.hostname === "auth.login.yahoo.co.jp").length, 2);
});

test("uncertain writes are not retried and do not expose transport details", async () => {
  const { client, calls } = setup([access(), new Error("private-transport-details")]);
  await assert.rejects(client.request({ operation: "editItem", parameters: { item_code: "abc" } }), error => {
    assert.ok(safeMessage(error).includes("再実行前"));
    assert.ok(!safeMessage(error).includes("private-transport-details"));
    return true;
  });
  assert.equal(calls.length, 2);
});

test("401 clears the cache for a later call without retrying a write", async () => {
  const { client, calls } = setup([access(), new Response("<Error><Code>expired</Code></Error>", { status: 401 }), access(), new Response(ok)]);
  await assert.rejects(client.request({ operation: "editItem" }), /401/);
  assert.equal(calls.length, 2);
  await client.request({ operation: "getItem", parameters: { item_code: "abc" } });
  assert.equal(calls.length, 4);
});

test("failed authentication never exposes the body or request details", async () => {
  for (const response of [new Error("test-auth-details"), new Response("test-auth-details", { status: 400 }), new Response(JSON.stringify({ access_token: "test-auth-details" }))]) {
    const { client, calls } = setup([response]);
    await assert.rejects(client.request({ operation: "getItem" }), error => !safeMessage(error).includes("test-auth-details"));
    assert.equal(calls.length, 1);
  }
});

test("HTTP 200 application errors and stock 207 are failures; warning text is retained on success", () => {
  assert.throws(() => parseResponse("<ResultSet><Result><Status>NG</Status><Error><Code>it-01001</Code><Message>private-message</Message></Error></Result></ResultSet>", 200, "editItem", false), error => safeMessage(error).includes("it-01001") && !safeMessage(error).includes("private-message"));
  assert.throws(() => parseResponse("<ResultSet><Result><ItemCode>abc</ItemCode><ErrorCode>st-02108</ErrorCode></Result></ResultSet>", 207, "setStock", false), /st-02108/);
  const warning = parseResponse("<ResultSet><Status>OK</Status><Warning><Code>od91113</Code><Message>warning</Message></Warning></ResultSet>", 200, "orderShipStatusChange", false);
  assert.ok(JSON.stringify(warning).includes("od91113"));
});

test("read formats preserve empty inventory and order ID strings", () => {
  assert.deepEqual(parseResponse("<ResultSet><Result><ItemCode>001</ItemCode><Status>0</Status><Quantity/></Result></ResultSet>", 200, "getStock", true), { ResultSet: { Result: { ItemCode: "001", Status: "0", Quantity: "" } } });
  assert.ok(parseResponse("<Result><Status>OK</Status><Search><TotalCount>0</TotalCount></Search></Result>", 200, "orderList", true).Result);
});

test("malformed, unexpected, DTD and missing success responses fail closed", () => {
  for (const xml of ["<html>bad</html>", "<ResultSet>", '<!DOCTYPE x [<!ENTITY a "data">]><ResultSet/>', "<ResultSet><Result/></ResultSet>"]) {
    assert.throws(() => parseResponse(xml, 200, "editItem", false));
  }
  assert.throws(() => parseResponse("<ResultSet><Result><ItemCode>abc</ItemCode></Result></ResultSet>", 200, "setStock", false), /在庫/);
  assert.throws(() => parseResponse("<Error><Code>px-04102</Code></Error>", 200, "orderList", true), /再認可/);
});
