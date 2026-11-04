import { constants } from "node:fs";
import { mkdir, open, realpath, rename, rm, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { SafeError } from "./errors.js";

const schema = z.object({
  ClientID: z.string().min(1), ClientSecret: z.string().min(1),
  RefreshToken: z.string().min(1), SellerID: z.string().regex(/^[a-z0-9_-]{1,128}$/),
  publicKey: z.string().optional(), signatureVersion: z.string().regex(/^[1-9][0-9]{0,8}$/).optional(),
  proxyUrl: z.string().optional(), redirectUri: z.string().optional(),
  environment: z.enum(["production", "test"]).default("production"),
});
export type LocalSettings = z.infer<typeof schema>;

export function localPath(env: NodeJS.ProcessEnv = process.env): string {
  if (env.YSHOP_CONFIG_PATH) return resolve(env.YSHOP_CONFIG_PATH);
  const base = process.platform === "darwin" ? join(homedir(), "Library", "Application Support")
    : process.platform === "win32" ? env.APPDATA ?? join(homedir(), "AppData", "Roaming")
      : env.XDG_CONFIG_HOME ?? join(homedir(), ".config");
  return join(base, "mcp-yshop", "settings.json");
}

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
function insideProject(path: string): boolean {
  const part = relative(projectRoot, path);
  return part === "" || (!part.startsWith(`..${sep}`) && part !== ".." && !isAbsolute(part));
}
async function validatePath(path: string): Promise<void> {
  // Keep account data out of source trees, and never accept key/auth files as input.
  if (!isAbsolute(path) || path.split(sep).at(-1) !== "settings.json" || insideProject(path)
    || path.split(sep).some(p => /secret|credential|token|^\.(aws|ssh|gcp)$|\.(pem|key|crt|p12|pfx)$/i.test(p))) {
    throw new SafeError("ローカル設定はプロジェクト外の専用ディレクトリにあるsettings.jsonを指定してください。");
  }
  try {
    if (await realpath(dirname(path)) !== dirname(path)) throw new SafeError("設定ディレクトリにシンボリックリンクを使用できません。");
    const info = await stat(dirname(path));
    if (process.platform !== "win32" && ((info.mode & 0o077) !== 0 || info.uid !== process.getuid?.())) {
      throw new SafeError("ローカル設定の専用ディレクトリは所有者だけがアクセスできる権限（700）にしてください。");
    }
  } catch (error) {
    if (error instanceof SafeError) throw error;
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new SafeError("設定ディレクトリを確認できません。");
  }
}

export function parseLocalSettings(value: unknown): LocalSettings {
  const result = schema.safeParse(value);
  if (!result.success) throw new SafeError("ローカル設定の形式を確認してください。npm run setupで設定できます。");
  if (result.data.publicKey && !result.data.signatureVersion) throw new SafeError("公開鍵とそのバージョンを組で設定してください。");
  return result.data;
}

export async function readLocalSettings(path: string): Promise<LocalSettings | undefined> {
  await validatePath(path);
  let file;
  try {
    file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const info = await file.stat();
    if (!info.isFile() || info.size > 64 * 1024) throw new SafeError("ローカル設定ファイルを確認してください。");
    if (process.platform !== "win32" && ((info.mode & 0o077) !== 0 || info.uid !== process.getuid?.())) {
      throw new SafeError("ローカル設定ファイルは所有者のみ読み書きできる権限（600）にしてください。");
    }
    return parseLocalSettings(JSON.parse(await file.readFile("utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    if (error instanceof SafeError) throw error;
    throw new SafeError("ローカル設定を読み込めません。ファイル形式と権限を確認してください。");
  } finally { await file?.close(); }
}

export async function saveLocalSettings(path: string, value: LocalSettings): Promise<void> {
  const data = parseLocalSettings(value);
  await validatePath(path);
  const temporary = join(dirname(path), `.settings-${randomUUID()}.json`);
  try {
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    await validatePath(path);
    // Atomic replacement never follows an existing file symlink.
    const file = await open(temporary, "wx", 0o600);
    try { await file.writeFile(`${JSON.stringify(data, null, 2)}\n`); }
    finally { await file.close(); }
    await rename(temporary, path);
  } catch (error) {
    if (error instanceof SafeError) throw error;
    throw new SafeError("ローカル設定を保存できません。ディレクトリの権限を確認してください。");
  } finally { await rm(temporary, { force: true }).catch(() => {}); }
}
