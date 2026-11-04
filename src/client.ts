import { constants, publicEncrypt } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";
import { FormData } from "undici";
import type { Config, Runtime } from "./config.js";
import { SafeError } from "./errors.js";
import type { ImageUpload } from "./images.js";
import { operations } from "./definitions.js";
import type { JsonObject, Operation } from "./definitions.js";
import { saveDownload } from "./files.js";
export { operations } from "./definitions.js";
export type { Operation } from "./definitions.js";
export type Parameters = Record<string, string | number | boolean>;
export interface ApiCall {
  operation: Operation;
  parameters?: Parameters;
  xml?: Record<string, unknown>;
  json?: JsonObject;
  query?: Parameters;
  pathParameters?: Record<string, string>;
  image?: ImageUpload;
}
export interface ApiClient {
  request(call: ApiCall): Promise<Record<string, unknown>>;
}

const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false, parseAttributeValue: false });
const builder = new XMLBuilder({ ignoreAttributes: true, format: false });

function object(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}
function list(value: unknown): unknown[] { return Array.isArray(value) ? value : value === undefined ? [] : [value]; }

/** Yahoo returns application errors inside HTTP 200 and per-item errors inside 207. */
export function parseResponse(xml: string, status: number, operation: Operation, readOnly: boolean): Record<string, unknown> {
  let data: Record<string, unknown>;
  try {
    const markup = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");
    if (xml.length > 10 * 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(markup) || XMLValidator.validate(xml) !== true) throw new Error();
    data = parser.parse(xml) as Record<string, unknown>;
  } catch { throw new SafeError(`${operation}: XML応答を確認できません（HTTP ${status}）。${readOnly ? "" : "再実行前に対象の状態を確認してください。"}`); }
  const codes = new Set<string>();
  let hasError = false;
  function scan(value: unknown): void {
    if (Array.isArray(value)) { value.forEach(scan); return; }
    const node = object(value);
    if (!node) return;
    for (const [key, child] of Object.entries(node)) {
      if (key === "Warning") continue;
      if (key === "Error" && child !== "" && child !== undefined) {
        hasError = true;
        for (const error of list(child)) {
          const code = object(error)?.Code;
          if (typeof code === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(code)) codes.add(code);
        }
      }
      if (key === "ErrorCode" && typeof child === "string" && child && operation !== "dataCheckHistoryDetail") {
        hasError = true;
        if (/^[a-zA-Z0-9_-]{1,64}$/.test(child)) codes.add(child);
      }
      if ((key === "Status" && ["NG", "ERROR", "FAIL"].includes(String(child))) || (key === "@_ng" && Number(child) > 0)) hasError = true;
      scan(child);
    }
  }
  scan(data);
  if (status < 200 || status >= 300 || status === 207 || hasError) {
    const hint = codes.has("px-04102")
      ? " Yahoo! IDの再認可または公開鍵の署名設定を確認してください。認証設定を更新した場合はサーバーを再起動してください。"
      : codes.has("px-04306") ? " 接続元IPが許可されていません。Proxy設定とYahoo!側の接続元IP登録を確認してください。" : "";
    throw new SafeError(`${operation}: APIエラー（HTTP ${status}${codes.size ? ` / ${[...codes].join(", ")}` : ""}）。${hint}${readOnly ? "" : "一部反映・結果不明の可能性があります。再実行前に対象の状態を確認してください。"}`);
  }
  const root = object(data.ResultSet) ?? object(data.Result) ?? (operations[operation].group === "public" ? object(data.high_rating_trend_ranking) : undefined);
  if (!root) throw new SafeError(`${operation}: 想定された応答形式ではありません。${readOnly ? "" : "再実行前に対象の状態を確認してください。"}`);
  const resultNodes = list(root.Result).map(object).filter((n): n is Record<string, unknown> => n !== undefined);
  if (operations[operation].success === "status" && root.Status !== "OK" && !resultNodes.some(n => n.Status === "OK")) {
    throw new SafeError(`${operation}: 成功を確認できません。再実行前に対象の状態を確認してください。`);
  }
  if (operations[operation].success === "stock" && (!resultNodes.length || resultNodes.some(n => !("ItemCode" in n) || !("Quantity" in n)))) {
    throw new SafeError("setStock: 更新後の在庫数を確認できません。getStockで状態を確認してください。");
  }
  return data;
}

export function parseJsonResponse(raw: string, status: number, operation: Operation, readOnly: boolean): Record<string, unknown> {
  let data: Record<string, unknown>;
  try {
    if (raw.length > 10 * 1024 * 1024) throw new Error();
    const jsonp = raw.match(/^\s*[A-Za-z_$][\w.$]*\s*\(([\s\S]*)\)\s*;?\s*$/);
    const parsed: unknown = JSON.parse(jsonp?.[1] ?? raw);
    if (Array.isArray(parsed)) data = { results: parsed };
    else if (object(parsed)) data = parsed as Record<string, unknown>;
    else throw new Error();
  } catch { throw new SafeError(`${operation}: JSON応答を確認できません（HTTP ${status}）。${readOnly ? "" : "再実行前に対象の状態を確認してください。"}`); }
  const codes = new Set<string>();
  let failed = status < 200 || status >= 300 || status === 207;
  function scan(value: unknown, depth = 0): void {
    if (Array.isArray(value)) { value.forEach(v => scan(v, depth + 1)); return; }
    const node = object(value);
    if (!node) return;
    for (const [key, child] of Object.entries(node)) {
      if (/^warnings?$/i.test(key)) continue;
      if (/^(errors?|error_?code)$/i.test(key) && !(operation === "dataCheckHistoryDetailV2" && depth > 0) && child !== null && child !== false && child !== 0 && child !== "" && child !== "0") {
        if (Array.isArray(child) && !child.length) continue;
        failed = true;
        for (const error of list(child)) {
          const code = typeof error === "string" ? error : object(error)?.Code ?? object(error)?.code;
          if (typeof code === "string" && /^[a-zA-Z0-9_-]{1,96}$/.test(code)) codes.add(code);
        }
      }
      if (/^(status|result)$/i.test(key) && typeof child === "string" && /^(ng|error|fail|failed|failure)$/i.test(child)) failed = true;
      scan(child, depth + 1);
    }
  }
  scan(data);
  if (typeof data.status === "number" && data.status >= 400) failed = true;
  if (failed) {
    const hint = codes.has("px-04306") ? "接続元IPとProxy設定を確認してください。" : codes.has("px-04102") ? "Yahoo! IDの再認可・署名を確認してください。" : "";
    throw new SafeError(`${operation}: APIエラー（HTTP ${status}${codes.size ? ` / ${[...codes].join(", ")}` : ""}）。${hint}${readOnly ? "" : "再実行前に対象の状態を確認してください。"}`);
  }
  const marker = operations[operation].jsonSuccess;
  if (!readOnly && marker) {
    const result = data[marker];
    if (result === undefined || result === null || result === "" || (["status", "result"].includes(marker) && String(result).toLowerCase() !== "ok") || (marker === "results" && (!Array.isArray(result) || !result.length || result.some(row => String(object(row)?.result).toLowerCase() !== "ok")))) {
      throw new SafeError(`${operation}: 更新の成功を確認できません。再実行前に対象の状態を確認してください。`);
    }
  }
  return data;
}

export class YShopClient implements ApiClient {
  private runtime?: Promise<Runtime>;
  private access = "";
  private expiresAt = 0;
  private lastRequestAt = 0;
  private queue: Promise<void> = Promise.resolve();
  constructor(
    private readonly config: Config,
    private readonly load: () => Promise<Runtime>,
    private readonly timing = { now: Date.now, wait: (ms: number) => sleep(ms) },
  ) {}

  request(call: ApiCall): Promise<Record<string, unknown>> {
    // One queue also prevents concurrent refreshes and image uploads.
    const result = this.queue.then(() => this.send(call));
    this.queue = result.then(() => {}, () => {});
    return result;
  }

  private async getRuntime(): Promise<Runtime> {
    this.runtime ??= this.load().catch(error => { this.runtime = undefined; throw error; });
    return this.runtime;
  }

  private async authorize(runtime: Runtime): Promise<void> {
    if (this.access && this.timing.now() < this.expiresAt - 60_000) return;
    try {
      const response = await runtime.fetch("https://auth.login.yahoo.co.jp/yconnect/v2/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${runtime.auth.ClientID}:${runtime.auth.ClientSecret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: runtime.auth.RefreshToken }),
        signal: AbortSignal.timeout(30_000),
        redirect: "error",
      });
      if (!response.ok) throw new SafeError(`Yahoo! ID認証に失敗しました（HTTP ${response.status}）。再認可の要否と認証設定を確認してください。ローカル設定はnpm run setupで更新できます。`);
      const data = await response.json() as { access_token?: unknown; expires_in?: unknown };
      if (typeof data.access_token !== "string" || !data.access_token || !Number.isFinite(Number(data.expires_in)) || Number(data.expires_in) <= 0) {
        throw new SafeError("Yahoo! ID認証の成功応答を確認できません。");
      }
      this.access = data.access_token;
      this.expiresAt = this.timing.now() + Number(data.expires_in) * 1000;
    } catch (error) {
      this.access = "";
      if (error instanceof SafeError) throw error;
      throw new SafeError("Yahoo! ID認証に接続できません。ネットワーク・Proxyを確認してください。");
    }
  }

  private async send(call: ApiCall): Promise<Record<string, unknown>> {
    const runtime = await this.getRuntime();
    const definition = operations[call.operation];
    const readOnly = definition.readOnly || (call.operation === "reservePublish" && String(call.parameters?.mode) === "3");
    const isPublic = definition.group === "public";
    if (!isPublic) await this.authorize(runtime);
    await this.timing.wait(Math.max(0, 1000 - (this.timing.now() - this.lastRequestAt)));
    const headers: Record<string, string> = {};
    if (!isPublic) {
      headers.Authorization = `Bearer ${this.access}`;
      if (runtime.publicKey) {
        if (!runtime.signatureVersion) throw new SafeError("Yahoo API署名用公開鍵のバージョンを設定してください。");
        try {
          headers["X-sws-signature"] = publicEncrypt({ key: runtime.publicKey, padding: constants.RSA_PKCS1_PADDING },
            Buffer.from(`${this.config.sellerId}:${Math.floor(this.timing.now() / 1000)}`)).toString("base64");
        } catch { throw new SafeError("Yahoo API署名用公開鍵を確認してください。"); }
        headers["X-sws-signature-version"] = runtime.signatureVersion;
      }
    }
    const route = definition.url.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, key: string) => {
      const value = call.pathParameters?.[key];
      if (!value || !/^[a-zA-Z0-9_-]{1,200}$/.test(value)) throw new SafeError("URLパスに必要なIDを確認してください。");
      return encodeURIComponent(value);
    });
    const url = new URL(route);
    if (this.config.environment === "test" && url.hostname === "circus.shopping.yahooapis.jp") url.hostname = "test.circus.shopping.yahooapis.jp";
    for (const [key, value] of Object.entries(call.query ?? {})) url.searchParams.set(key, String(value));
    const seller = definition.sellerField;
    const sellerValue = isPublic ? runtime.auth.ClientID : this.config.sellerId;
    if (seller && definition.sellerLocation === "query") url.searchParams.set(seller, sellerValue);
    let body: string | URLSearchParams | FormData | undefined;
    if (call.xml) {
      headers["Content-Type"] = "application/xml; charset=UTF-8";
      body = builder.build({ Req: { ...call.xml, SellerId: this.config.sellerId } }) as string;
    } else if (call.json) {
      headers["Content-Type"] = "application/json; charset=UTF-8";
      body = JSON.stringify({ ...call.json, ...(seller && definition.sellerLocation === "body" ? { [seller]: sellerValue } : {}) });
    } else if (call.image) {
      body = new FormData();
      body.set("file", new Blob([new Uint8Array(call.image.bytes)], { type: call.image.mime }), call.image.filename);
      if (call.image.directory) body.set("directory", call.image.directory);
      for (const [key, value] of Object.entries(call.parameters ?? {})) body.set(key, String(value));
    } else {
      const params = new URLSearchParams(Object.entries({ ...call.parameters, ...(seller ? { [seller]: sellerValue } : {}) }).map(([k, v]) => [k, String(v)]));
      if (definition.encoding === "query") for (const [key, value] of params) url.searchParams.set(key, value);
      else { headers["Content-Type"] = "application/x-www-form-urlencoded"; body = params; }
    }
    let status: number;
    let raw: string;
    try {
      const response = await runtime.fetch(url, { method: definition.method, headers, body, signal: AbortSignal.timeout(definition.response === "file" || call.image ? 120_000 : 30_000), redirect: "error" });
      status = response.status;
      if (status === 401) this.access = "";
      const contentType = response.headers.get("content-type") ?? "";
      if (definition.response === "file" && response.ok && status !== 207 && !/json|xml|html/i.test(contentType)) return await saveDownload(response, call.operation);
      raw = await response.text();
    } catch (error) {
      if (error instanceof SafeError) throw error;
      throw new SafeError(`${call.operation}: 通信結果を確認できません。${readOnly ? "ネットワーク・Proxyを確認してください。" : "再実行前に対象の状態を確認してください。自動再送は行いません。"}`);
    } finally { this.lastRequestAt = this.timing.now(); }
    const result = /^\s*</.test(raw) ? parseResponse(raw, status, call.operation, readOnly) : parseJsonResponse(raw, status, call.operation, readOnly);
    if (definition.response === "file") throw new SafeError(`${call.operation}: ファイル応答を取得できませんでした。ダウンロード準備状態を確認してください。`);
    return result;
  }

  async close(): Promise<void> {
    await this.queue;
    const runtime = await this.runtime?.catch(() => undefined);
    await runtime?.close();
  }
}
