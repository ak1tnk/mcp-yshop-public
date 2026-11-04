import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { ProxyAgent, fetch as httpFetch } from "undici";
import { z } from "zod";
import { SafeError } from "./errors.js";

const settings = z.object({
  AWS_REGION: z.string().min(1).default("ap-northeast-1"),
  YSHOP_SELLER_ID: z.string().regex(/^[a-z0-9_-]{1,128}$/),
  YSHOP_AUTH_SOURCE: z.enum(["ssm", "env", "local"]).default("ssm"),
  YSHOP_AUTH_PARAMETER: z.string().startsWith("/").default("/YShopAuth"),
  YSHOP_PUBLIC_KEY_PARAMETER: z.string().startsWith("/").default("/YShopPublicKeyPem"),
  YSHOP_PROXY_PARAMETER: z.string().startsWith("/").default("/Proxy"),
  YSHOP_USE_PROXY: z.enum(["true", "false"]).default("false"),
  YSHOP_SIGNATURE_VERSION: z.string().regex(/^[1-9][0-9]{0,8}$/).optional(),
  YSHOP_USE_SIGNATURE: z.enum(["true", "false"]).default("true"),
  YSHOP_ENVIRONMENT: z.enum(["production", "test"]).default("production"),
});

export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = settings.safeParse(env);
  if (!parsed.success) throw new SafeError(`設定を確認してください: ${parsed.error.issues.map(i => i.path.join(".")).join(", ")}`);
  const value = parsed.data;
  return {
    region: value.AWS_REGION,
    sellerId: value.YSHOP_SELLER_ID,
    authSource: value.YSHOP_AUTH_SOURCE,
    authParameter: value.YSHOP_AUTH_PARAMETER,
    publicKeyParameter: value.YSHOP_PUBLIC_KEY_PARAMETER,
    proxyParameter: value.YSHOP_PROXY_PARAMETER,
    useProxy: value.YSHOP_USE_PROXY === "true",
    useSignature: value.YSHOP_USE_SIGNATURE === "true",
    signatureVersion: value.YSHOP_SIGNATURE_VERSION,
    environment: value.YSHOP_ENVIRONMENT,
    baseUrl: value.YSHOP_ENVIRONMENT === "test"
      ? "https://test.circus.shopping.yahooapis.jp/ShoppingWebService/V1/"
      : "https://circus.shopping.yahooapis.jp/ShoppingWebService/V1/",
  };
}
export type Config = ReturnType<typeof readConfig>;

export interface ParameterStore {
  get(name: string): Promise<string>;
}

export class SsmStore implements ParameterStore {
  private readonly client: SSMClient;
  constructor(region: string) { this.client = new SSMClient({ region }); }
  async get(name: string): Promise<string> {
    try {
      const response = await this.client.send(new GetParameterCommand({ Name: name, WithDecryption: true }));
      if (response.Parameter?.Value) return response.Parameter.Value;
    } catch { /* AWS exceptions can contain sensitive request details. */ }
    throw new SafeError("SSMパラメータを取得できません。AWSの認証・リージョン・GetParameter/kms:Decrypt権限を確認してください。");
  }
  close() { this.client.destroy(); }
}

const authSchema = z.object({
  ClientID: z.string().min(1),
  ClientSecret: z.string().min(1),
  RefreshToken: z.string().min(1),
  SellerID: z.string().min(1),
});
export type Auth = z.infer<typeof authSchema>;

export function parseAuth(raw: string, expectedSeller: string): Auth {
  try {
    const auth = authSchema.parse(JSON.parse(raw));
    if (auth.SellerID !== expectedSeller) throw new SafeError("認証設定のSellerIDが設定されたストアと一致しません。");
    return auth;
  } catch (error) {
    if (error instanceof SafeError) throw error;
    throw new SafeError("認証設定にClientID・ClientSecret・RefreshToken・SellerIDが必要です。");
  }
}

/** /Proxy's existing hosts/port/username/password format, or an HTTP(S) URL. */
export function parseProxy(raw: string): string {
  try {
    let value: unknown;
    try { value = JSON.parse(raw); } catch { value = raw; }
    let uri: URL;
    if (typeof value === "string") {
      uri = new URL(value);
    } else {
      const proxy = z.object({
        hosts: z.array(z.string().min(1)).min(1),
        port: z.coerce.number().int().min(1).max(65535),
        username: z.string().min(1),
        password: z.string().min(1),
      }).parse(value);
      // Use a stable egress address for Yahoo's IP restrictions; never rotate per request.
      uri = new URL(`http://${proxy.hosts[0]}`);
      if (uri.username || uri.password || uri.pathname !== "/" || uri.search || uri.hash) throw new Error();
      uri.port = String(proxy.port);
      uri.username = proxy.username;
      uri.password = proxy.password;
    }
    if (!["http:", "https:"].includes(uri.protocol) || !uri.hostname || uri.search || uri.hash || uri.pathname !== "/") throw new Error();
    return uri.toString();
  } catch { throw new SafeError("Proxyの形式を確認してください。hosts/port/username/password、またはHTTP(S) Proxy URLに対応しています。"); }
}

export type HttpFetch = typeof httpFetch;
export interface Runtime {
  auth: Auth;
  publicKey: string;
  signatureVersion?: string;
  fetch: HttpFetch;
  close(): Promise<void>;
}

export function createRuntime(auth: Auth, publicKey = "", rawProxy?: string, signatureVersion?: string): Runtime {
  if (publicKey && !signatureVersion) throw new SafeError("公開鍵を使う場合はYSHOP_SIGNATURE_VERSIONに発行したバージョンを設定してください。");
  let dispatcher: ProxyAgent | undefined;
  if (rawProxy !== undefined) {
    try { dispatcher = new ProxyAgent(parseProxy(rawProxy)); }
    catch (error) { if (error instanceof SafeError) throw error; throw new SafeError("Proxyを初期化できません。"); }
  }
  return {
    auth, publicKey, signatureVersion,
    fetch: (url, init) => httpFetch(url, { ...init, ...(dispatcher ? { dispatcher } : {}), redirect: "error" }),
    close: async () => { await dispatcher?.close(); },
  };
}

export async function loadRuntime(config: Config, store: ParameterStore): Promise<Runtime> {
  const [rawAuth, rawKey, rawProxy] = await Promise.all([
    store.get(config.authParameter),
    config.useSignature ? store.get(config.publicKeyParameter) : "",
    config.useProxy ? store.get(config.proxyParameter) : undefined,
  ]);
  const auth = parseAuth(rawAuth, config.sellerId);
  return createRuntime(auth, rawKey, rawProxy, config.signatureVersion);
}
