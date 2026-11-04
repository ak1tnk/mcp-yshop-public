import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync, chmodSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { blockedPath, checkRepository } from "./privacy-check.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const limit = 48 * 1024 * 1024;
class PublicSyncError extends Error {}
const fail = () => new PublicSyncError("公開同期を完了できません。GitHub接続・検査結果・公開側のブランチを確認してください。元の例外は表示しません。");
function command(name, args, cwd, input) {
  try { return execFileSync(name, args, { cwd, input, maxBuffer: limit, stdio: ["pipe", "pipe", "pipe"], windowsHide: true }); }
  catch { throw fail(); }
}
const git = (cwd, args, input) => command("git", ["--literal-pathspecs", "-C", cwd, ...args], cwd, input);
function verify(options) {
  const result = checkRepository(options);
  if (!result.ok) {
    console.error(JSON.stringify({ check: "privacy", ...result }));
    throw new PublicSyncError("混入チェックに失敗したため、公開同期を停止しました。");
  }
}

/** Copy only the checked Git tree; no source commits, refs, or local files are transferred. */
export function stageSnapshot(source, destination, { policyPath, run } = {}) {
  if (resolve(source) === resolve(destination)) throw fail();
  if (git(source, ["status", "--porcelain"]).length) throw new PublicSyncError("開発側の変更をコミットしてから公開同期を実行してください。");
  verify({ root: source, mode: "tree", policyPath, run });
  const entries = git(source, ["ls-tree", "-rz", "--full-tree", "HEAD"]).toString().split("\0").filter(Boolean).map(entry => {
    const separator = entry.indexOf("\t");
    const [mode, type, oid] = entry.slice(0, separator).split(" ");
    const path = entry.slice(separator + 1);
    if (blockedPath(path) || type !== "blob" || !["100644", "100755"].includes(mode)) throw fail();
    return { mode, oid, path };
  });
  git(destination, ["read-tree", "--empty"]);
  const index = [];
  for (const { mode, oid, path } of entries) {
    const target = resolve(destination, path);
    const part = relative(resolve(destination), target);
    if (!part || part === ".." || part.startsWith(`..${sep}`) || part.startsWith(sep)) throw fail();
    const bytes = git(source, ["cat-file", "blob", oid]);
    if (git(destination, ["hash-object", "-w", "--stdin"], bytes).toString().trim() !== oid) throw fail();
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes); chmodSync(target, mode === "100755" ? 0o755 : 0o644);
    index.push(`${mode} ${oid}\t${path}\0`);
  }
  git(destination, ["update-index", "-z", "--index-info"], Buffer.from(index.join("")));
  const tree = git(destination, ["write-tree"]).toString().trim();
  if (tree !== git(source, ["rev-parse", "HEAD^{tree}"]).toString().trim()) throw fail();
  verify({ root: destination, mode: "staged", policyPath, run });
  return { tree, files: entries.length };
}

async function synchronize(publish) {
  const config = JSON.parse(readFileSync(join(root, "public-repository.json"), "utf8"));
  if (!/^[a-z0-9-]+\/[a-z0-9_.-]+$/i.test(config.repository) || config.branch !== "main") throw fail();
  const targetUrl = `https://github.com/${config.repository}.git`;
  const metadata = JSON.parse(command("gh", ["api", `repos/${config.repository}`, "--jq", "{private,default_branch}"], root));
  if (metadata.private) throw new PublicSyncError("同期先が公開リポジトリではありません。public-repository.jsonを確認してください。");
  const identity = JSON.parse(command("gh", ["api", "user", "--jq", "{login,id}"], root));
  if (!/^[a-z0-9-]+$/i.test(identity.login) || !Number.isSafeInteger(identity.id)) throw fail();
  const baseDirectory = join(root, "out", "public-sync");
  mkdirSync(baseDirectory, { recursive: true });
  const draft = mkdtempSync(join(baseDirectory, "snapshot-"));
  command("git", ["clone", "--no-checkout", "--no-tags", targetUrl, draft], root);
  git(draft, ["config", "user.name", identity.login]);
  git(draft, ["config", "user.email", `${identity.id}+${identity.login}@users.noreply.github.com`]);
  const cacheBinary = join(root, ".cache", "privacy", process.platform === "win32" ? "gitleaks.exe" : "gitleaks");
  const policyPath = existsSync(join(root, "privacy.local.json")) ? join(root, "privacy.local.json") : undefined;
  const env = { ...process.env, ...(existsSync(cacheBinary) ? { GITLEAKS_BIN: cacheBinary } : {}), ...(policyPath ? { YSHOP_PRIVACY_POLICY: policyPath } : {}) };
  const probe = spawnSync("git", ["-C", draft, "rev-parse", "--verify", "refs/remotes/origin/main"], { encoding: "utf8", windowsHide: true });
  let base;
  if (probe.status === 0) {
    base = probe.stdout.trim();
    verify({ root: draft, mode: "tree", ref: base, policyPath });
    git(draft, ["reset", "--mixed", base]);
  } else if (git(draft, ["for-each-ref", "--format=%(refname)"]).length) throw fail();
  else git(draft, ["symbolic-ref", "HEAD", "refs/heads/main"]);
  const snapshot = stageSnapshot(root, draft, { policyPath });
  if (base && snapshot.tree === git(draft, ["rev-parse", `${base}^{tree}`]).toString().trim()) {
    return { status: "up-to-date", url: `https://github.com/${config.repository}`, ...snapshot };
  }
  if (!publish) return { status: "preview", ...snapshot, draft: relative(root, draft), next: base ? "pull-request" : "initial-main" };
  const branch = base ? `sync/${base.slice(0, 8)}-${snapshot.tree.slice(0, 12)}` : "main";
  const remoteBranch = spawnSync("git", ["-C", draft, "rev-parse", "--verify", `refs/remotes/origin/${branch}`], { encoding: "utf8", windowsHide: true });
  let publicCommit;
  if (base && remoteBranch.status === 0) {
    publicCommit = remoteBranch.stdout.trim();
    if (git(draft, ["rev-parse", `${publicCommit}^{tree}`]).toString().trim() !== snapshot.tree) throw fail();
  } else {
    if (base) git(draft, ["checkout", "-b", branch]);
    git(draft, ["config", "core.hooksPath", ".githooks"]);
    const commit = spawnSync("git", ["-C", draft, "commit", "-m", base ? "更新: 検査済みの公開用ソースを同期" : "追加: Yahoo!ショッピング公式API対応MCPを公開"],
      { env, encoding: "utf8", maxBuffer: limit, windowsHide: true });
    if (commit.status !== 0) throw fail();
    publicCommit = git(draft, ["rev-parse", "HEAD"]).toString().trim();
    verify({ root: draft, mode: "range", range: base ? `${base}..${publicCommit}` : publicCommit, policyPath });
    const push = spawnSync("git", ["-C", draft, "push", "origin", `HEAD:refs/heads/${branch}`], { env, encoding: "utf8", maxBuffer: limit, windowsHide: true });
    if (push.status !== 0) throw fail();
  }
  let url = `https://github.com/${config.repository}`;
  if (base) {
    const prs = JSON.parse(command("gh", ["pr", "list", "--repo", config.repository, "--head", branch, "--base", "main", "--state", "open", "--json", "url"], root));
    if (prs.length) url = prs[0].url;
    else {
      const bodyFile = join(draft, ".git", "public-pr-body.txt");
      writeFileSync(bodyFile, "検査済みのソースを公開用リポジトリへ同期します。\n\n- 認証情報・ローカル設定・開発側のGit履歴は含みません。\n- privacyとcheckの成功後、差分を確認してマージしてください。\n", { mode: 0o600 });
      url = command("gh", ["pr", "create", "--repo", config.repository, "--head", branch, "--base", "main", "--title", "更新: 公開用ソースを同期", "--body-file", bodyFile], root).toString().trim();
    }
  }
  const state = { sourceCommit: git(root, ["rev-parse", "HEAD"]).toString().trim(), publicCommit, tree: snapshot.tree, url, branch };
  writeFileSync(join(root, "out", "public-sync-state.json"), `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  return { status: base ? "pull-request" : "published", url, publicCommit, ...snapshot };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 1 || args[0] !== "--publish")) throw fail();
    console.log(JSON.stringify(await synchronize(args[0] === "--publish")));
  } catch (error) {
    console.error(error instanceof PublicSyncError ? error.message : "公開同期を完了できません。設定・Git・GitHub CLI・混入チェックを確認してください。");
    process.exitCode = 1;
  }
}
