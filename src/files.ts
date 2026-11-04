import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { mkdir, open, realpath, unlink } from "node:fs/promises";
import { basename, extname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { unzipSync } from "fflate";
import type { Response } from "undici";
import type { ApiDefinition, Operation } from "./definitions.js";
import { SafeError } from "./errors.js";
import type { ImageUpload } from "./images.js";

const MB = 1024 * 1024;
export function assertSafeFileName(path: string): void {
  if (/(^|[/\\])(\.aws|\.ssh|\.gcp)([/\\]|$)|(^|[/\\])\.env([./\\]|$)|secret|credential|token|private_key|id_rsa|id_ed25519|\.(pem|key|crt|p12|pfx)(\.|$)/i.test(path)) {
    throw new SafeError("機密ファイル・認証ファイルは扱えません。");
  }
}
function imageType(bytes: Uint8Array): string | undefined {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (["GIF87a", "GIF89a"].includes(Buffer.from(bytes.subarray(0, 6)).toString("ascii"))) return "image/gif";
  return undefined;
}
function checkImage(bytes: Uint8Array, name: string): string {
  const mime = imageType(bytes);
  const expected = extname(name).toLowerCase();
  if (bytes.length > 2 * MB || !mime || !({ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/gif": [".gif"] }[mime]?.includes(expected))) {
    throw new SafeError("画像は内容と拡張子が一致する2MB以下のJPEG/PNG/GIFを指定してください。");
  }
  return mime;
}

export async function readUpload(path: string, filename: string | undefined, kind: NonNullable<ApiDefinition["uploadKind"]>): Promise<ImageUpload> {
  assertSafeFileName(path);
  if (!isAbsolute(path)) throw new SafeError("アップロードには絶対パスを指定してください。");
  const allowed = kind === "csv" ? [".csv"] : kind === "zip" ? [".zip"] : kind === "attachment" ? [".jpg", ".jpeg", ".png", ".gif", ".pdf"] : [".jpg", ".jpeg", ".png", ".gif"];
  const name = filename ?? basename(path);
  assertSafeFileName(name);
  if (basename(name) !== name || !allowed.includes(extname(name).toLowerCase()) || Buffer.byteLength(name) > 255 || !allowed.includes(extname(path).toLowerCase())) {
    throw new SafeError("このAPIに対応するファイル形式・ファイル名を指定してください。");
  }
  let resolved: string;
  try { resolved = await realpath(path); } catch { throw new SafeError("送信ファイルを確認できません。"); }
  assertSafeFileName(resolved);
  if (!allowed.includes(extname(resolved).toLowerCase())) throw new SafeError("リンク先のファイル形式が対応していません。");
  let bytes: Buffer;
  try {
    const file = await open(resolved, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const stat = await file.stat();
      if (!stat.isFile() || stat.size <= 0 || stat.size > 25 * MB) throw new SafeError("送信ファイルは25MB以下の通常ファイルを指定してください。");
      bytes = await file.readFile();
      if (bytes.length > 25 * MB) throw new SafeError("送信ファイルが25MBを超えています。");
    } finally { await file.close(); }
  } catch (error) { if (error instanceof SafeError) throw error; throw new SafeError("送信ファイルを読み込めません。"); }
  let mime: string;
  if (kind === "zip") {
    let total = 0;
    try {
      const images = unzipSync(bytes, { filter: file => {
        assertSafeFileName(file.name);
        if (file.name.endsWith("/")) return false;
        if (file.name.includes("/") || file.name.includes("\\") || ![".jpg", ".jpeg", ".png", ".gif"].includes(extname(file.name).toLowerCase()) || file.originalSize > 2 * MB) throw new SafeError("画像ZIPは直下の2MB以下の画像だけにしてください。");
        total += file.originalSize;
        if (total > 250 * MB) throw new SafeError("画像ZIPの展開後サイズが250MBを超えています。");
        return true;
      } });
      if (!Object.keys(images).length) throw new SafeError("ZIPに画像がありません。");
      for (const [name, data] of Object.entries(images)) checkImage(data, name);
    } catch (error) { if (error instanceof SafeError) throw error; throw new SafeError("画像ZIPの形式を確認できません。"); }
    mime = "application/zip";
  } else if (kind === "csv") {
    if (bytes.includes(0) || bytes[0] === 0x50 && bytes[1] === 0x4b || bytes.subarray(0, 5).toString() === "%PDF-") throw new SafeError("CSVの形式を確認してください。");
    mime = "text/csv"; // Preserve the source encoding, including the official Shift_JIS CSV format.
  } else if (extname(name).toLowerCase() === ".pdf") {
    if (bytes.subarray(0, 5).toString() !== "%PDF-" || /\/Encrypt\b/.test(bytes.toString("latin1"))) throw new SafeError("暗号化されていないPDFを指定してください。");
    mime = "application/pdf";
  } else mime = checkImage(bytes, name);
  return { bytes, filename: name, mime };
}

/** Save binary/CSV responses without exposing their body or trusting a remote filename. */
export async function saveDownload(response: Response, operation: Operation, directory = fileURLToPath(new URL("../out/", import.meta.url))): Promise<Record<string, unknown>> {
  const mediaType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "application/octet-stream";
  const extension = mediaType.includes("zip") ? ".zip" : mediaType === "application/pdf" ? ".pdf" : mediaType === "image/jpeg" ? ".jpg" : mediaType === "image/png" ? ".png" : mediaType === "image/gif" ? ".gif" : operation === "externalTalkFileDownload" ? ".bin" : ".csv";
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const resolvedDirectory = await realpath(directory);
  assertSafeFileName(resolvedDirectory);
  const path = join(resolvedDirectory, `${operation}-${randomUUID()}${extension}`);
  assertSafeFileName(path);
  const file = await open(path, "wx", 0o600);
  let size = 0;
  const hash = createHash("sha256");
  try {
    if (!response.body) throw new Error();
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 256 * MB) throw new SafeError("ダウンロードが256MBを超えました。");
      // Some errors are mislabeled as a download. Never save them as a successful file.
      if (size === chunk.length && /^\s*(?:<\?xml|<Error\b|<ResultSet\b|<!DOCTYPE|<html\b|\{\s*"(?:Error|error|message)")/i.test(Buffer.from(chunk.subarray(0, 512)).toString("utf8"))) throw new SafeError("ダウンロードの代わりにエラー応答を受信しました。取得条件・権限を確認してください。");
      hash.update(chunk);
      let offset = 0;
      while (offset < chunk.length) { const written = await file.write(chunk, offset); offset += written.bytesWritten; }
    }
    if (!size) throw new SafeError("空のダウンロード応答です。");
    await file.close();
    return { file: { path, bytes: size, sha256: hash.digest("hex"), media_type: mediaType } };
  } catch (error) {
    await file.close().catch(() => {});
    await unlink(path).catch(() => {});
    if (error instanceof SafeError) throw error;
    throw new SafeError("ダウンロードを保存できませんでした。");
  }
}
