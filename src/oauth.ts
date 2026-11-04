import { randomBytes } from "node:crypto";
import type { HttpFetch } from "./config.js";
import { SafeError } from "./errors.js";

function redirectURL(value: string): URL {
  try {
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash
      || !(url.protocol === "https:" || (url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)))) throw new Error();
    return url;
  } catch { throw new SafeError("登録済みコールバックURLを指定してください（HTTPS、またはローカルのHTTP。クエリ・フラグメントなし）。"); }
}

export function authorizationRequest(clientId: string, redirectUri: string) {
  redirectURL(redirectUri);
  const state = randomBytes(32).toString("hex");
  const url = new URL("https://auth.login.yahoo.co.jp/yconnect/v2/authorization");
  url.search = new URLSearchParams({ response_type: "code", client_id: clientId, redirect_uri: redirectUri,
    scope: "openid", state, bail: "1", prompt: "consent" }).toString();
  return { url: url.toString(), state };
}

export function callbackCode(value: string, redirectUri: string, state: string): string {
  try {
    const expected = redirectURL(redirectUri);
    const actual = new URL(value);
    if (actual.origin !== expected.origin || actual.pathname !== expected.pathname || actual.hash || actual.username || actual.password
      || actual.searchParams.getAll("state").length !== 1 || actual.searchParams.get("state") !== state
      || actual.searchParams.has("error") || actual.searchParams.getAll("code").length !== 1 || !actual.searchParams.get("code")) throw new Error();
    return actual.searchParams.get("code")!;
  } catch { throw new SafeError("認可結果URLを確認できません。今回開いた画面で認可し、遷移後のURL全体を貼り付けてください。"); }
}

export async function exchangeAuthorization(fetch: HttpFetch, clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<string> {
  try {
    redirectURL(redirectUri);
    const response = await fetch("https://auth.login.yahoo.co.jp/yconnect/v2/token", {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(30_000),
      headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
    });
    if (!response.ok) throw new SafeError(`Yahoo! IDの認可に失敗しました（HTTP ${response.status}）。アプリ設定・登録済みコールバックURLを確認してください。`);
    const data = await response.json() as { refresh_token?: unknown };
    if (typeof data.refresh_token !== "string" || !data.refresh_token) throw new SafeError("Yahoo! IDの認可応答を確認できません。");
    return data.refresh_token;
  } catch (error) {
    if (error instanceof SafeError) throw error;
    throw new SafeError("Yahoo! IDの認可結果を取得できません。ネットワーク・Proxyを確認し、認可をやり直してください。");
  }
}
