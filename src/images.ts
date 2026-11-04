import { constants } from "node:fs";
import { open, realpath } from "node:fs/promises";
import { basename, extname, isAbsolute } from "node:path";
import { SafeError } from "./errors.js";

export interface ImageUpload {
  bytes: Uint8Array;
  filename: string;
  mime: string;
  directory?: string;
}

function checkPath(path: string): void {
  const blocked = /(^|[/\\])(\.aws|\.ssh|\.gcp)([/\\]|$)|secret|credential|token|private_key|id_rsa|id_ed25519/i;
  if (!isAbsolute(path) || blocked.test(path) || ![".jpg", ".jpeg", ".png", ".gif"].includes(extname(path).toLowerCase())) {
    throw new SafeError("画像には機密ファイルを含まない絶対パスのJPEG/PNG/GIFを指定してください。");
  }
}

export async function readImage(path: string, filename: string, directory?: string): Promise<ImageUpload> {
  checkPath(path);
  if (basename(filename) !== filename || !/^[a-zA-Z0-9_.-]+\.(jpg|png|gif)$/.test(filename) || Buffer.byteLength(filename) > 255) {
    throw new SafeError("アップロード名は255バイト以内の半角英数字・ハイフン・アンダーバー・ピリオドと、jpg/png/gif拡張子を指定してください。");
  }
  if (directory && Buffer.byteLength(directory) > 40) throw new SafeError("追加画像のdirectoryは40バイト以内です。");
  let resolved: string;
  try { resolved = await realpath(path); }
  catch { throw new SafeError("画像ファイルを確認できません。"); }
  checkPath(resolved);
  try {
    const file = await open(resolved, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const stat = await file.stat();
      if (!stat.isFile() || stat.size === 0 || stat.size > 2 * 1024 * 1024) throw new SafeError("画像は2MB以下の通常ファイルを指定してください。");
      const bytes = await file.readFile();
      const ext = extname(filename);
      const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const gif = ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"));
      if (!(ext === ".jpg" && jpeg) && !(ext === ".png" && png) && !(ext === ".gif" && gif)) throw new SafeError("画像の内容とアップロード名の形式が一致しません。");
      return { bytes, filename, mime: jpeg ? "image/jpeg" : png ? "image/png" : "image/gif", directory };
    } finally { await file.close(); }
  } catch (error) {
    if (error instanceof SafeError) throw error;
    throw new SafeError("画像を読み込めません。");
  }
}
