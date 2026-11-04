import { createHash } from "node:crypto";
import type { CallToolResult, McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { ApiCall, ApiClient, Parameters } from "./client.js";
import { retiredApis } from "./catalog.js";
import type { Config } from "./config.js";
import { operations, operationNames } from "./definitions.js";
import type { JsonObject, JsonValue, Operation } from "./definitions.js";
import { SafeError, safeMessage } from "./errors.js";
import { readUpload } from "./files.js";

const primitive = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const jsonValue: z.ZodType<JsonValue> = z.lazy(() => z.union([primitive, z.array(jsonValue), z.record(z.string(), jsonValue)]));
const objectSchema = z.record(z.string(), jsonValue);
const inputShape = {
  operation: z.enum(operationNames),
  parameters: objectSchema.default({}).describe("公式パラメータ。XMLはReqの内側、JSONはボディ、form/queryはフラットなオブジェクト。"),
  query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}).describe("本文とは別のURLクエリ。問い合わせのtopicIdなど。"),
  path_parameters: z.record(z.string(), z.string()).default({}).describe("URL内のitem_id/subscription_id/history_id/changeRequestId等。"),
  upload: z.object({ path: z.string(), filename: z.string().optional() }).strict().optional(),
};
export const apiInput = z.object(inputShape).strict();
export type ApiInput = z.infer<typeof apiInput>;

function validateData(value: JsonValue | Record<string, string>, config: Config, depth = 0, publicApi = false): void {
  if (depth > 24) throw new SafeError("パラメータの階層が深すぎます。");
  if (Array.isArray(value)) { for (const item of value) validateData(item, config, depth + 1, publicApi); return; }
  if (value === null || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(key) || /secret|credential|token|authorization/i.test(key) || ["appid", "client_id", "ClientID"].includes(key)) {
      throw new SafeError("パラメータに認証情報や不正な項目名は指定できません。");
    }
    if (!publicApi && /^seller_?id$/i.test(key) && child !== config.sellerId) throw new SafeError("パラメータのストアIDが設定されたストアと一致しません。");
    if (/^order_?id$/i.test(key) && typeof child === "string" && child && !child.startsWith(`${config.sellerId}-`)) throw new SafeError("注文IDが設定されたストアのIDではありません。");
    validateData(child, config, depth + 1, publicApi);
  }
}
function hasPath(value: JsonValue | undefined, path: string[]): boolean {
  if (!path.length) return value !== undefined && value !== null && value !== "";
  if (Array.isArray(value)) return value.length > 0 && value.every(item => hasPath(item, path));
  if (!value || typeof value !== "object") return false;
  return hasPath(value[path[0]!], path.slice(1));
}
function flat(value: JsonObject): Parameters {
  const result: Parameters = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === null) result[key] = "";
    else if (typeof item === "object") throw new SafeError("query/formパラメータは文字列・数値・真偽値で指定してください。");
    else result[key] = item;
  }
  return result;
}

/** Compile only a catalogued operation; request URLs/headers are never supplied by the caller. */
export async function prepareApiCall(input: ApiInput, config: Config, write: boolean): Promise<ApiCall> {
  if (!Object.hasOwn(operations, input.operation)) throw new SafeError("未登録のAPIです。");
  const definition = operations[input.operation];
  const parameters = structuredClone(input.parameters);
  validateData(parameters, config, 0, definition.group === "public");
  validateData(input.query, config, 0, definition.group === "public");
  if (definition.encoding === "xml" && "Req" in parameters) throw new SafeError("XMLパラメータにはReqの内側を指定してください。");
  const isReadMode = definition.readMode && String(parameters[definition.readMode.field]) === String(definition.readMode.value);
  if (!write && !definition.readOnly && !isReadMode) throw new SafeError("この操作は更新APIです。yshop_write_apiでドライランから確認してください。");
  const pathKeys = [...definition.url.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map(m => m[1]!);
  if (Object.keys(input.path_parameters).some(key => !pathKeys.includes(key))) throw new SafeError("このAPIに存在しないパスパラメータです。");
  for (const key of pathKeys) {
    if (!/^[a-zA-Z0-9_-]{1,200}$/.test(input.path_parameters[key] ?? "")) throw new SafeError(`パスパラメータ ${key} を指定してください。`);
  }
  if (definition.sellerField) delete parameters[definition.sellerField];
  const query: Parameters = { ...input.query };
  for (const key of definition.queryFields ?? []) {
    if (key in parameters) { query[key] = flat({ [key]: parameters[key]! })[key]!; delete parameters[key]; }
  }
  const merged = { ...parameters, ...query };
  for (const required of definition.required) {
    if (!hasPath(merged, required.split("/"))) throw new SafeError(`必須パラメータ ${required} を指定してください。`);
  }
  if (input.operation === "reservePublish" && ![1, 2, 3].includes(Number(parameters.mode))) throw new SafeError("modeは1（予約）・2（取消）・3（確認）です。");
  if (input.operation === "orderShipStatusChange" && (parameters.Target as JsonObject | undefined)?.IsPointFix !== true && (parameters.Target as JsonObject | undefined)?.IsPointFix !== "true") {
    throw new SafeError("ポイント確定要否を確認し、Target.IsPointFix=trueを明示してください。");
  }
  if (input.operation === "orderStatusChange" && String((parameters.Order as JsonObject | undefined)?.OrderStatus) === "5" && ![true, "true"].includes((parameters.Target as JsonObject | undefined)?.IsPointFix as boolean | string)) throw new SafeError("注文を完了にする場合はTarget.IsPointFix=trueを明示してください。");
  if (input.operation === "externalAucStoreTopic") {
    if (parameters.orderId && (parameters.aucId || parameters.preOrderId)) throw new SafeError("orderId指定時はaucId・preOrderIdを指定しません。");
    if (!parameters.orderId && (!parameters.aucId || !parameters.preOrderId)) throw new SafeError("注文前の問い合わせにはaucIdとpreOrderIdが必要です。");
  }
  if (definition.uploadKind) {
    if ("file" in parameters) throw new SafeError("送信ファイルはparameters.fileではなくupload.pathで指定してください。");
    if (!input.upload) throw new SafeError("このAPIにはupload.pathが必要です。");
  } else if (input.upload) throw new SafeError("このAPIはファイルアップロードに対応していません。");
  const call: ApiCall = { operation: input.operation, query, pathParameters: input.path_parameters };
  if (definition.encoding === "xml") call.xml = parameters;
  else if (definition.encoding === "json") call.json = parameters;
  else call.parameters = flat(parameters);
  if (definition.uploadKind && input.upload) call.image = await readUpload(input.upload.path, input.upload.filename, definition.uploadKind);
  return call;
}

function result(data: Record<string, unknown>): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data };
}

export function registerCatalogTools(server: McpServer, config: Config, client: ApiClient): void {
  server.registerTool("yshop_api_catalog", {
    description: "公式の全現行APIを検索・確認。operation省略は一覧、指定はHTTP形式・必須項目・公式URL・既知の仕様不整合を取得。実データへの通信は行いません。",
    inputSchema: z.object({ operation: z.enum(operationNames).optional(), group: z.string().optional() }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, ({ operation, group }) => {
    if (operation) return result({ operation, ...operations[operation],
      usage: { parameters: "XMLはReq内をそのまま指定。JSONはボディをそのまま指定。配列・null・空文字も保持。seller/appid/署名はSSMから自動設定。", path_parameters: "URLの{...}に対応するID。", upload: "multipartはローカルファイルの絶対パスと任意のfilename。" } });
    return result({ total: operationNames.length, operations: operationNames.filter(op => !group || operations[op].group === group).map(op => ({ operation: op, title: operations[op].title, group: operations[op].group, read_only: operations[op].readOnly, read_mode: operations[op].readMode })), retired: retiredApis });
  });

  async function execute(input: ApiInput, write: boolean, dryRun: boolean): Promise<CallToolResult> {
    try {
      const call = await prepareApiCall(input, config, write);
      const definition = operations[input.operation];
      const common = { operation: input.operation, seller_id: config.sellerId, environment: config.environment };
      if (write && dryRun) return result({ ...common, dry_run: true, method: definition.method, encoding: definition.encoding,
        parameters: call.parameters, query: call.query, path_parameters: call.pathParameters, body: call.xml ?? call.json,
        upload: call.image ? { filename: call.image.filename, bytes: call.image.bytes.length, sha256: createHash("sha256").update(call.image.bytes).digest("hex") } : undefined,
        source: definition.source, api_notes: definition.notes, note: "送信していません。更新・削除・メッセージ送信・公開などの影響を確認し、依頼された操作だけdry_run=falseで実行してください。" });
      return result({ ...common, dry_run: false, data: await client.request(call) });
    } catch (error) { return { isError: true, content: [{ type: "text", text: safeMessage(error) }] }; }
  }
  const readOperations = operationNames.filter(op => operations[op].readOnly || operations[op].readMode) as [Operation, ...Operation[]];
  const writeOperations = operationNames.filter(op => !operations[op].readOnly) as [Operation, ...Operation[]];
  server.registerTool("yshop_read_api", {
    description: "全カテゴリの参照API。先にyshop_api_catalogで操作IDと入力形式を確認。XML/JSON/ファイル取得に対応。ファイルはプロジェクトoutへ保存。reservePublishはmode=3のみ。",
    inputSchema: z.object({ ...inputShape, operation: z.enum(readOperations) }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  }, input => execute(input, false, false));
  server.registerTool("yshop_write_api", {
    description: "全カテゴリの更新API。注文・入金・内容変更、分割、商品削除・移動、カテゴリ、画像ZIP/CSV、問い合わせ送信、定期購入、店舗在庫、デザイン等。全公式パラメータを指定可能。dry_run既定true。本番影響・顧客への送信・ポイント/決済確定を確認して使用。",
    inputSchema: z.object({ ...inputShape, operation: z.enum(writeOperations), dry_run: z.boolean().default(true) }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  }, ({ dry_run, ...input }) => execute(input, true, dry_run));
}
