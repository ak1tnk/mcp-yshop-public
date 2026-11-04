import assert from "node:assert/strict";
import test from "node:test";
import { Response } from "undici";
import { authorizationRequest, callbackCode, exchangeAuthorization } from "../src/oauth.js";
import { safeMessage } from "../src/errors.js";

test("authorization uses unpredictable state and validates the complete callback URL", () => {
  const redirect = "https://app.example/callback";
  const a = authorizationRequest("example-client", redirect);
  const b = authorizationRequest("example-client", redirect);
  assert.notEqual(a.state, b.state);
  assert.equal(new URL(a.url).searchParams.get("scope"), "openid");
  assert.equal(callbackCode(`${redirect}?state=${a.state}&code=example-code`, redirect, a.state), "example-code");
  for (const url of [`${redirect}?state=wrong&code=example-code`, `https://other.example/callback?state=${a.state}&code=example-code`,
    `${redirect}?state=${a.state}&state=${a.state}&code=example-code`, `${redirect}?state=${a.state}&error=example-private-error`,
    `${redirect}?state=${a.state}&code=first&code=second`]) assert.throws(() => callbackCode(url, redirect, a.state), error => !safeMessage(error).includes("example-private-error"));
  assert.throws(() => authorizationRequest("example-client", "http://remote.example/callback"), /HTTPS/);
});

test("authorization exchange uses the registered redirect and Basic authentication without exposing failures", async () => {
  const value = await exchangeAuthorization(async (url, init) => {
    assert.equal(String(url), "https://auth.login.yahoo.co.jp/yconnect/v2/token");
    assert.equal(init?.redirect, "error");
    assert.equal((init?.body as URLSearchParams).get("redirect_uri"), "https://app.example/callback");
    assert.equal((init?.body as URLSearchParams).get("grant_type"), "authorization_code");
    assert.equal((init?.headers as Record<string, string>).Authorization, `Basic ${Buffer.from("example-client:example-value").toString("base64")}`);
    return new Response(JSON.stringify({ refresh_token: "example-refresh" }));
  }, "example-client", "example-value", "example-code", "https://app.example/callback");
  assert.equal(value, "example-refresh");
  for (const response of [new Response("private-response", { status: 401 }), new Response("not-json"), new Response("{}")]) {
    await assert.rejects(exchangeAuthorization(async () => response, "a", "b", "c", "https://app.example/callback"), error => !safeMessage(error).includes("private-response"));
  }
});
