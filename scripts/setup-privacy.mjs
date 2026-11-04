import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const version = "8.30.1";
const directory = join(root, ".cache", "privacy");
const executable = join(directory, process.platform === "win32" ? "gitleaks.exe" : "gitleaks");
async function download(url, limit) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok || Number(response.headers.get("content-length")) > limit) throw new Error();
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > limit) throw new Error();
  return bytes;
}

try {
  const toolsOnly = process.argv.slice(2).join(" ") === "--tools-only";
  if (process.argv.length > 2 && !toolsOnly) throw new Error();
  if (!toolsOnly) {
    const configured = spawnSync("git", ["-C", root, "config", "--get", "core.hooksPath"], { encoding: "utf8" });
    if (configured.stdout.trim() && configured.stdout.trim() !== ".githooks") throw new Error();
    for (const hook of ["pre-commit", "pre-push"]) {
      const path = execFileSync("git", ["-C", root, "rev-parse", "--git-path", `hooks/${hook}`], { encoding: "utf8" }).trim();
      if (!configured.stdout.trim() && existsSync(resolve(root, path))) throw new Error();
    }
  }
  mkdirSync(directory, { recursive: true });
  const installed = existsSync(executable) && spawnSync(executable, ["version"], { encoding: "utf8", windowsHide: true }).stdout?.trim() === version;
  if (!installed) {
    const os = { darwin: "darwin", linux: "linux", win32: "windows" }[process.platform];
    const arch = { x64: "x64", arm64: "arm64" }[process.arch];
    if (!os || !arch) throw new Error();
    const suffix = process.platform === "win32" ? "zip" : "tar.gz";
    const name = `gitleaks_${version}_${os}_${arch}.${suffix}`;
    const base = `https://github.com/gitleaks/gitleaks/releases/download/v${version}/`;
    const [archive, checksums] = await Promise.all([download(base + name, 40 * 1024 * 1024), download(base + `gitleaks_${version}_checksums.txt`, 64 * 1024)]);
    const expected = checksums.toString("utf8").split("\n").map(line => line.trim().split(/\s+/)).find(parts => parts[1] === name)?.[0];
    if (!expected || createHash("sha256").update(archive).digest("hex") !== expected) throw new Error();
    if (process.platform === "win32") {
      const { unzipSync } = await import("fflate");
      const bytes = unzipSync(archive)["gitleaks.exe"];
      if (!bytes) throw new Error();
      writeFileSync(executable, bytes);
    } else {
      const temporary = mkdtempSync(join(directory, "install-"));
      try {
        const path = join(temporary, "gitleaks.tar.gz");
        writeFileSync(path, archive);
        execFileSync("tar", ["-xzf", path, "-C", temporary, "gitleaks"], { stdio: "pipe" });
        writeFileSync(executable, readFileSync(join(temporary, "gitleaks")), { mode: 0o700 });
      } finally { rmSync(temporary, { recursive: true, force: true }); }
    }
    chmodSync(executable, 0o700);
  }
  if (!toolsOnly) {
    for (const hook of ["pre-commit", "pre-push"]) chmodSync(join(root, ".githooks", hook), 0o755);
    execFileSync("git", ["-C", root, "config", "core.hooksPath", ".githooks"], { stdio: "pipe" });
  }
  console.log(`privacy: gitleaks ${version}を準備しました。${toolsOnly ? "" : "このリポジトリのコミット前・push前検査を有効にしました。"}`);
} catch {
  process.stderr.write("privacy: セットアップできません。ネットワーク・Git・既存フック・対応OS（macOS/Linux/Windows x64/arm64）を確認してください。既存フックは上書きしません。\n");
  process.exitCode = 1;
}
