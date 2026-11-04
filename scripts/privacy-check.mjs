import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, mkdtempSync, rmSync, lstatSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_FILE = 2 * 1024 * 1024;
const MAX_TOTAL = 48 * 1024 * 1024;
const defaultRoot = fileURLToPath(new URL("../", import.meta.url));
const hash = value => createHash("sha256").update(value).digest("hex").slice(0, 12);
const failure = () => new Error("検査を完了できません。Git・gitleaks・指定範囲を確認してください。元の例外は表示しません。");

const restrictedPath = path => path.split(/[\\/]/).some(part => /secret|credential|token|^\.(aws|ssh|gcp)$|^(id_rsa|id_ed25519)$|^service-account.*\.json$|^private_key|\.(pem|key|crt|p12|pfx)$/i.test(part));
export const blockedPath = path => restrictedPath(path) || path.split(/[\\/]/).some(part =>
  /^\.env(?:\.|$)|\.local\.json$|^settings\.json$|^\.settings-.*\.json$/i.test(part));
const exampleValue = value => /^(?:(?:example|test|fixture)(?:[-_.:/@]+[a-z0-9]+)*|pending)$/i.test(value)
  || /^<[^<>]+>$/.test(value);
const publicEmail = value => /@users\.noreply\.github\.com$/i.test(value) || /^noreply@github\.com$/i.test(value);
const exampleEmail = value => /@(?:[a-z0-9-]+\.)?(?:example\.(com|net|org)|example|invalid)$/i.test(value);

/** Findings never contain matched values or source excerpts. */
export function inspectText(text, blockedText = []) {
  const findings = [];
  const add = (rule, index) => findings.push({ rule, line: text.slice(0, index).split("\n").length });
  for (const match of text.matchAll(/[a-z0-9._%+\-[\]]+@[a-z0-9.-]+\.[a-z]{2,}/gi)) {
    if (!publicEmail(match[0]) && !exampleEmail(match[0])) add("email", match.index);
  }
  const rules = [
    ["home-path", /(?:\/Users\/|\/home\/)[\p{L}\p{N}._-]+|[a-z]:[\\/]+Users[\\/]+[\p{L}\p{N}._-]+/giu],
    ["phone", /(?<!\d)(?:\+81[- ]?|0)(?:70|80|90)[- ]?\d{4}[- ]?\d{4}(?!\d)/g],
    ["key-material", /-----BEGIN (?:(?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY|(?:RSA )?PUBLIC KEY)-----/g],
  ];
  for (const [rule, pattern] of rules) for (const match of text.matchAll(pattern)) add(rule, match.index);
  for (const match of text.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)) {
    const ip = match[0];
    if (ip.split(".").every(p => Number(p) <= 255) && !/^(?:127\.|0\.0\.0\.0$|192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(ip)) add("ip-address", match.index);
  }
  for (const match of text.matchAll(/\\?["']?\b(?:(?:yshop_)?(?:client_?id|client_?secret|refresh_?token|access_?token|proxy_?url|seller_?id)|password)\\?["']?\s*[:=]\s*\\?["'`]([^"'`\r\n]+)\\?["'`]/gi)) {
    if (!exampleValue(match[1].replace(/\\$/, ""))) add("auth-literal", match.index);
  }
  const lower = text.normalize("NFKC").toLowerCase();
  for (const value of blockedText) {
    const variants = [value, encodeURIComponent(value), JSON.stringify(value).slice(1, -1), Buffer.from(value).toString("base64")];
    for (const variant of variants) {
      const index = lower.indexOf(variant.normalize("NFKC").toLowerCase());
      if (index >= 0) { add("private-policy", index); break; }
    }
  }
  return findings;
}

function git(root, ...args) {
  try { return execFileSync("git", ["--literal-pathspecs", "-C", root, ...args], { maxBuffer: MAX_TOTAL, stdio: ["ignore", "pipe", "pipe"] }); }
  catch { throw failure(); }
}
function commitId(root, value) {
  if (!/^[a-z0-9][a-z0-9_./-]*$/i.test(value)) throw failure();
  const oid = git(root, "rev-parse", "--verify", "--end-of-options", `${value}^{commit}`).toString().trim();
  if (!/^[a-f0-9]{40,64}$/.test(oid)) throw failure();
  return oid;
}
function revisionList(root, value) {
  if (!/^[a-f0-9]{40,64}(?:\.\.[a-f0-9]{40,64})?$/.test(value)) throw failure();
  return git(root, "rev-list", value).toString().trim().split("\n").filter(Boolean);
}

export function checkRepository({ root, mode = "tree", ref = "HEAD", range, input = "", policyPath, binary, run = spawnSync }) {
  root = resolve(root);
  const policyFile = policyPath ? resolve(policyPath) : join(root, "privacy.local.json");
  if (restrictedPath(policyFile) || policyPath && !existsSync(policyFile)) throw failure();
  let blockedText = [];
  if (existsSync(policyFile)) {
    try {
      const info = lstatSync(policyFile);
      if (!info.isFile() || info.isSymbolicLink() || info.size > 64 * 1024 || realpathSync(dirname(policyFile)) !== dirname(policyFile)) throw failure();
      const policy = JSON.parse(readFileSync(policyFile, "utf8"));
      if (!Array.isArray(policy.blockedText) || policy.blockedText.length > 100 || !policy.blockedText.every(v => typeof v === "string" && v.length >= 3 && v.length <= 512)) throw failure();
      blockedText = policy.blockedText;
    } catch { throw failure(); }
  }
  const findings = [];
  const documents = [];
  const visited = new Set();
  let total = 0;
  function document(file, text) {
    total += Buffer.byteLength(text);
    if (total > MAX_TOTAL) throw failure();
    const filenameFindings = inspectText(file, blockedText);
    const label = filenameFindings.length ? `file-${hash(file)}` : file;
    for (const finding of filenameFindings) findings.push({ file: label, rule: `filename-${finding.rule}` });
    for (const finding of inspectText(text, blockedText)) findings.push({ file: label, ...finding });
    documents.push({ file: label, text });
  }
  function blob(file, oid, fileMode) {
    if (blockedPath(file)) { findings.push({ file: `file-${hash(file)}`, rule: "blocked-filename" }); return; }
    if (!["100644", "100755"].includes(fileMode)) { findings.push({ file: `file-${hash(file)}`, rule: "symlink-or-submodule" }); return; }
    if (visited.has(oid)) return;
    visited.add(oid);
    if (Number(git(root, "cat-file", "-s", oid).toString()) > MAX_FILE) throw failure();
    const bytes = git(root, "cat-file", "blob", oid);
    if (bytes.includes(0)) {
      findings.push({ file: `file-${hash(file)}`, rule: "binary-needs-review" }); return;
    }
    let text;
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
    catch { findings.push({ file: `file-${hash(file)}`, rule: "binary-needs-review" }); return; }
    document(file, text);
  }
  function email(value, identity) {
    if (!publicEmail(value.trim())) findings.push({ file: identity, rule: "git-email" });
  }
  let commits = [];
  if (mode === "staged") {
    for (const type of ["AUTHOR", "COMMITTER"]) {
      const ident = git(root, "var", `GIT_${type}_IDENT`).toString();
      email(ident.match(/<([^>]+)>/)?.[1] ?? "", type.toLowerCase());
    }
    const paths = git(root, "diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z").toString().split("\0").filter(Boolean);
    for (const file of paths) {
      if (blockedPath(file)) { findings.push({ file: `file-${hash(file)}`, rule: "blocked-filename" }); continue; }
      const entry = git(root, "ls-files", "--stage", "-z", "--", file).toString().split("\t")[0].split(" ");
      blob(file, entry[1], entry[0]);
    }
  } else {
    if (mode === "tree") commits = [commitId(root, ref)];
    else if (mode === "range") commits = revisionList(root, range);
    else if (mode === "all") commits = git(root, "rev-list", "--all").toString().trim().split("\n").filter(Boolean);
    else if (mode === "pre-push") {
      for (const row of input.trim().split("\n").filter(Boolean)) {
        const fields = row.trim().split(/\s+/);
        if (fields.length !== 4 || ![fields[1], fields[3]].every(v => /^[a-f0-9]{40,64}$/.test(v))) throw failure();
        const [, local, , remote] = fields;
        if (/^0+$/.test(local)) continue;
        commits.push(...revisionList(root, /^0+$/.test(remote) ? local : `${remote}..${local}`));
      }
    } else throw failure();
    for (const commit of new Set(commits)) {
      const [author, committer, message] = git(root, "show", "-s", "--format=%ae%x00%ce%x00%B", commit).toString().split("\0");
      email(author, `commit-${commit.slice(0, 12)}-author`); email(committer, `commit-${commit.slice(0, 12)}-committer`);
      document(`commit-${commit.slice(0, 12)}`, message);
      for (const entry of git(root, "ls-tree", "-rz", "--full-tree", commit).toString().split("\0").filter(Boolean)) {
        const separator = entry.indexOf("\t");
        const header = entry.slice(0, separator), file = entry.slice(separator + 1);
        const [fileMode, , oid] = header.split(" ");
        blob(file, oid, fileMode);
      }
    }
  }
  if (findings.length) return { ok: false, findings: findings.slice(0, 50), commits: new Set(commits).size };
  if (!documents.length) return { ok: true, findings: [], commits: 0 };
  const directory = mkdtempSync(join(tmpdir(), "yshop-privacy-"));
  try {
    const env = { ...process.env, GITLEAKS_CONFIG_TOML: "[extend]\nuseDefault = true\n" };
    delete env.GITLEAKS_CONFIG;
    const executable = binary ?? process.env.GITLEAKS_BIN ?? (existsSync(join(defaultRoot, ".cache", "privacy", process.platform === "win32" ? "gitleaks.exe" : "gitleaks"))
      ? join(defaultRoot, ".cache", "privacy", process.platform === "win32" ? "gitleaks.exe" : "gitleaks") : "gitleaks");
    const joined = documents.map(d => `${d.file}\n${d.text}`).join("\n\n");
    const result = run(executable, ["stdin", "--redact=100", "--no-banner", "--log-level=error", "--ignore-gitleaks-allow", "--timeout=60"],
      { cwd: directory, input: joined, encoding: "utf8", env, maxBuffer: 1024 * 1024, timeout: 65_000, windowsHide: true });
    if (result.status === 1) return { ok: false, findings: [{ rule: "gitleaks", file: "scanned-content" }], commits: new Set(commits).size };
    if (result.error || result.status !== 0) throw failure();
  } finally { rmSync(directory, { recursive: true, force: true }); }
  return { ok: true, findings: [], commits: new Set(commits).size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const options = { root: defaultRoot, policyPath: process.env.YSHOP_PRIVACY_POLICY };
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === "--repo") options.root = args[++i];
      else if (arg === "--policy") options.policyPath = args[++i];
      else if (arg === "--tree") { options.mode = "tree"; options.ref = args[++i]; }
      else if (arg === "--range") { options.mode = "range"; options.range = args[++i]; }
      else if (["--staged", "--all", "--pre-push"].includes(arg)) options.mode = arg.slice(2);
      else throw failure();
    }
    if (options.mode === "pre-push") options.input = readFileSync(0, "utf8");
    const result = checkRepository(options);
    console.log(JSON.stringify({ check: "privacy", ...result }));
    process.exitCode = result.ok ? 0 : 1;
  } catch {
    process.stderr.write("privacy: 検査を完了できません。npm run privacy:setup、Git・指定範囲・ローカルポリシーを確認してください。秘密値や元の例外は表示しません。\n");
    process.exitCode = 2;
  }
}
