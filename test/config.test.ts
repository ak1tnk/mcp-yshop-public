import assert from "node:assert/strict";
import test from "node:test";
import { loadRuntime, parseAuth, parseProxy, readConfig } from "../src/config.js";
import { safeMessage } from "../src/errors.js";

const auth = { ClientID: "test-client", ClientSecret: "test-value", RefreshToken: "test-refresh", SellerID: "example-store" };

test("the seller must be explicit; public defaults use a direct connection", () => {
  const config = readConfig({ YSHOP_SELLER_ID: "example-store" });
  assert.equal(config.authParameter, "/YShopAuth");
  assert.equal(config.publicKeyParameter, "/YShopPublicKeyPem");
  assert.equal(config.sellerId, "example-store");
  assert.equal(config.useProxy, false);
  assert.throws(() => readConfig({}), /YSHOP_SELLER_ID/);
  assert.equal(readConfig({ YSHOP_SELLER_ID: "example-store", YSHOP_ENVIRONMENT: "test" }).baseUrl, "https://test.circus.shopping.yahooapis.jp/ShoppingWebService/V1/");
  assert.throws(() => readConfig({ YSHOP_SELLER_ID: "example-store", YSHOP_USE_PROXY: "yes" }), /YSHOP_USE_PROXY/);
});

test("auth rejects a different seller and malformed JSON without echoing the input", () => {
  assert.deepEqual(parseAuth(JSON.stringify(auth), auth.SellerID), auth);
  assert.throws(() => parseAuth(JSON.stringify(auth), "other-store"), /一致しません/);
  assert.throws(() => parseAuth("private-input", auth.SellerID), error => !safeMessage(error).includes("private-input"));
});

test("existing /Proxy object uses the first host and encodes authentication", () => {
  const value = parseProxy(JSON.stringify({ hosts: ["proxy.example", "backup.example"], port: 8080, username: "test@user", password: "test:/value", api_key: "unused" }));
  const url = new URL(value);
  assert.equal(url.hostname, "proxy.example");
  assert.equal(url.port, "8080");
  assert.equal(decodeURIComponent(url.username), "test@user");
  assert.equal(decodeURIComponent(url.password), "test:/value");
  assert.ok(!value.includes("unused"));
  assert.equal(parseProxy("http://proxy.example:8080"), "http://proxy.example:8080/");
  assert.equal(parseProxy(JSON.stringify("https://proxy.example")), "https://proxy.example/");
});

test("invalid proxy input is rejected with a value-free error", () => {
  for (const raw of ["socks5://private-input:1080", "https://proxy.example/path", "https://proxy.example?q=private-input", '{"hosts":[]}']) {
    assert.throws(() => parseProxy(raw), error => !safeMessage(error).includes("private-input") && safeMessage(error).includes("形式"));
  }
});

test("SSM /Proxy is never fetched unless enabled", async () => {
  const names: string[] = [];
  const store = { get: async (name: string) => { names.push(name); return name === "/YShopAuth" ? JSON.stringify(auth) : name === "/Proxy" ? "http://proxy.example:8080" : "test-public-key"; } };
  const direct = await loadRuntime(readConfig({ YSHOP_SELLER_ID: "example-store", YSHOP_USE_PROXY: "false", YSHOP_SIGNATURE_VERSION: "2" }), store);
  assert.deepEqual(names.sort(), ["/YShopAuth", "/YShopPublicKeyPem"].sort());
  await direct.close();
  names.length = 0;
  const proxied = await loadRuntime(readConfig({ YSHOP_SELLER_ID: "example-store", YSHOP_USE_PROXY: "true", YSHOP_SIGNATURE_VERSION: "2" }), store);
  assert.ok(names.includes("/Proxy"));
  await proxied.close();
});
