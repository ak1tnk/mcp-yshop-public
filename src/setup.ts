import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { createRuntime, parseProxy } from "./config.js";
import { SafeError, safeMessage } from "./errors.js";
import { localPath, parseLocalSettings, readLocalSettings, saveLocalSettings } from "./local.js";
import { authorizationRequest, callbackCode, exchangeAuthorization } from "./oauth.js";

let muted = false;
const output = new Writable({ write(chunk, _encoding, callback) {
  if (!muted) process.stdout.write(chunk);
  callback();
} });

async function setup() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new SafeError("npm run setupは対話式ターミナルで実行してください。認証値をコマンド引数へ書かないでください。");
  const path = localPath();
  const previous = await readLocalSettings(path);
  const rl = createInterface({ input: process.stdin, output, terminal: true, historySize: 0 });
  rl.on("SIGINT", () => { rl.close(); });
  async function ask(label: string, fallback = "", hidden = false): Promise<string> {
    process.stdout.write(`${label}${fallback ? " [Enterで維持]" : ""}: `);
    muted = hidden;
    try { return (await rl.question("")).trim() || fallback; }
    finally { muted = false; if (hidden) process.stdout.write("\n"); }
  }
  try {
    console.log("認証値はこのPCのユーザー設定へ保存します。SSMの値は読み出しません。空のProxy・公開鍵で直接接続を使用できます。");
    const SellerID = await ask("ストアアカウント", previous?.SellerID);
    const ClientID = await ask("アプリのClient ID", previous?.ClientID, true);
    const ClientSecret = await ask("Client Secret（非表示）", previous?.ClientSecret, true);
    const proxyInput = await ask("Proxy URL（任意・非表示、-で解除）", previous?.proxyUrl, true);
    const proxyUrl = proxyInput && proxyInput !== "-" ? parseProxy(proxyInput) : undefined;
    const keyInput = await ask("署名用公開鍵（任意、改行は\\n、-で解除）", previous?.publicKey, true);
    const publicKey = keyInput && keyInput !== "-" ? keyInput.replace(/\\n/g, "\n") : undefined;
    const signatureVersion = publicKey ? await ask("公開鍵のバージョン", previous?.signatureVersion) : undefined;
    const environment = await ask("環境 production / test", previous?.environment ?? "production");
    parseLocalSettings({ ClientID, ClientSecret, RefreshToken: "pending", SellerID, publicKey, signatureVersion, proxyUrl, environment });
    const method = await ask("認可方法 browser / existing（既存Refresh Token）", "browser");
    let RefreshToken: string;
    let redirectUri: string | undefined;
    if (method === "existing") {
      RefreshToken = await ask("Refresh Token（非表示）", previous?.RefreshToken, true);
    } else if (method === "browser") {
      redirectUri = await ask("アプリに登録したコールバックURL", previous?.redirectUri);
      const request = authorizationRequest(ClientID, redirectUri);
      console.log(`次のURLをブラウザで開いてストア管理者のYahoo! JAPAN IDで認可してください。\n${request.url}\n遷移後のアドレス欄からURL全体をコピーしてください。認可結果URLは他人へ送らないでください。`);
      const code = callbackCode(await ask("遷移後のURL全体（非表示）", "", true), redirectUri, request.state);
      const connection = createRuntime({ ClientID, ClientSecret, RefreshToken: "pending", SellerID }, publicKey, proxyUrl, signatureVersion);
      try { RefreshToken = await exchangeAuthorization(connection.fetch, ClientID, ClientSecret, code, redirectUri); }
      finally { await connection.close(); }
    } else throw new SafeError("認可方法はbrowserまたはexistingを指定してください。");
    const settings = parseLocalSettings({ ClientID, ClientSecret, RefreshToken, SellerID, publicKey, signatureVersion, proxyUrl, redirectUri, environment });
    await saveLocalSettings(path, settings);
    console.log("設定を保存しました。Client Secret・Refresh Token・認可コードは表示していません。MCPクライアントを再起動してください。");
  } finally { rl.close(); }
}

try { await setup(); }
catch (error) { process.stderr.write(`${safeMessage(error)}\n`); process.exitCode = 1; }
