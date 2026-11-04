import { createRuntime, loadRuntime, parseAuth, readConfig, SsmStore } from "./config.js";
import { SafeError } from "./errors.js";
import { localPath, readLocalSettings } from "./local.js";

const authFields = ["YSHOP_CLIENT_ID", "YSHOP_CLIENT_SECRET", "YSHOP_REFRESH_TOKEN"] as const;

/** An explicit source never falls back to another account when configuration is incomplete. */
export async function prepareApplication(env: NodeJS.ProcessEnv = process.env) {
  const source = env.YSHOP_AUTH_SOURCE ?? (authFields.some(key => env[key] !== undefined) ? "env"
    : env.YSHOP_SELLER_ID ? "ssm" : "local");
  if (source === "local") {
    const local = await readLocalSettings(localPath(env));
    if (!local) throw new SafeError("認証が未設定です。ターミナルでnpm run setupを実行するか、環境変数またはSSM認証を設定してください。");
    const config = readConfig({ ...env, YSHOP_AUTH_SOURCE: source, YSHOP_SELLER_ID: env.YSHOP_SELLER_ID ?? local.SellerID,
      YSHOP_ENVIRONMENT: env.YSHOP_ENVIRONMENT ?? local.environment,
      YSHOP_USE_PROXY: env.YSHOP_USE_PROXY ?? String(Boolean(local.proxyUrl)),
      YSHOP_SIGNATURE_VERSION: env.YSHOP_SIGNATURE_VERSION ?? local.signatureVersion });
    return { config, load: async () => {
      const auth = parseAuth(JSON.stringify(local), config.sellerId);
      if (config.useProxy && !local.proxyUrl) throw new SafeError("ローカル設定のProxy URLを設定してください。");
      return createRuntime(auth, config.useSignature ? local.publicKey : "", config.useProxy ? local.proxyUrl : undefined, config.signatureVersion);
    }, close: () => {} };
  }
  const config = readConfig({ ...env, YSHOP_AUTH_SOURCE: source });
  if (source === "env") {
    return { config, load: async () => {
      if (authFields.some(key => !env[key])) throw new SafeError("YSHOP_CLIENT_ID・YSHOP_CLIENT_SECRET・YSHOP_REFRESH_TOKENをすべて設定してください。");
      const auth = parseAuth(JSON.stringify({ ClientID: env.YSHOP_CLIENT_ID, ClientSecret: env.YSHOP_CLIENT_SECRET,
        RefreshToken: env.YSHOP_REFRESH_TOKEN, SellerID: config.sellerId }), config.sellerId);
      if (config.useProxy && !env.YSHOP_PROXY_URL) throw new SafeError("YSHOP_PROXY_URLを設定してください。");
      return createRuntime(auth, config.useSignature ? env.YSHOP_PUBLIC_KEY?.replace(/\\n/g, "\n") : "",
        config.useProxy ? env.YSHOP_PROXY_URL : undefined, config.signatureVersion);
    }, close: () => {} };
  }
  const store = new SsmStore(config.region);
  return { config, load: () => loadRuntime(config, store), close: () => store.close() };
}
