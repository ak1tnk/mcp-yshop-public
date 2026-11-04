import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { stageSnapshot } from "../scripts/sync-public.mjs";

const run = () => ({ status: 0 });
function fixture(t) {
  const directory = mkdtempSync(join(realpathSync(tmpdir()), "yshop-public-sync-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  function git(root, ...args) { return execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(); }
  function init(name) {
    const path = join(directory, name); mkdirSync(path); git(path, "init", "-q");
    git(path, "config", "user.name", "example-contributor"); git(path, "config", "user.email", "example-contributor@users.noreply.github.com");
    git(path, "config", "core.hooksPath", ".disabled-hooks"); return path;
  }
  function commit(path) { git(path, "add", "--all"); git(path, "commit", "-qm", "example update"); return git(path, "rev-parse", "HEAD"); }
  return { source: init("source"), draft: init("draft"), git, commit };
}

test("public snapshots exclude private history and ignored local files", t => {
  const { source, draft, git, commit } = fixture(t);
  writeFileSync(join(source, "data.txt"), ["operator", "personal.test"].join("@"));
  const privateCommit = commit(source);
  writeFileSync(join(source, "data.txt"), "public data\r\n");
  writeFileSync(join(source, ".gitignore"), "out/\n*.local.json\n");
  commit(source);
  mkdirSync(join(source, "out")); writeFileSync(join(source, "out", "local.txt"), "local-only data");
  writeFileSync(join(source, "privacy.local.json"), '{"blockedText":["example-internal-word"]}');
  const snapshot = stageSnapshot(source, draft, { run });
  git(draft, "commit", "-qm", "example public snapshot");
  assert.equal(snapshot.files, 2);
  assert.equal(git(draft, "rev-list", "--count", "HEAD"), "1");
  assert.equal(git(draft, "rev-parse", "HEAD^{tree}"), git(source, "rev-parse", "HEAD^{tree}"));
  assert.equal(spawnSync("git", ["-C", draft, "cat-file", "-e", privateCommit]).status, 1);
  assert.equal(existsSync(join(draft, "privacy.local.json")), false);
  assert.equal(existsSync(join(draft, "out")), false);
});

test("snapshot updates retain only public ancestry and stage deletions", t => {
  const { source, draft, git, commit } = fixture(t);
  writeFileSync(join(draft, "removed.txt"), "old public data"); const publicBase = commit(draft);
  writeFileSync(join(source, "data.txt"), "new public data"); const sourceHead = commit(source);
  stageSnapshot(source, draft, { run });
  git(draft, "commit", "-qm", "example public update");
  assert.equal(git(draft, "rev-parse", "HEAD^"), publicBase);
  assert.equal(git(draft, "rev-parse", "HEAD^{tree}"), git(source, "rev-parse", "HEAD^{tree}"));
  assert.equal(spawnSync("git", ["-C", draft, "cat-file", "-e", sourceHead]).status, 1);
  assert.equal(git(draft, "ls-tree", "--name-only", "HEAD"), "data.txt");
});

test("uncommitted source changes cannot be published", t => {
  const { source, draft, commit } = fixture(t);
  writeFileSync(join(source, "data.txt"), "committed data"); commit(source);
  writeFileSync(join(source, "data.txt"), "uncommitted data");
  assert.throws(() => stageSnapshot(source, draft, { run }), /コミットしてから/);
});
