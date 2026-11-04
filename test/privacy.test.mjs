import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { blockedPath, inspectText, checkRepository } from "../scripts/privacy-check.mjs";

const run = () => ({ status: 0 });
function repository(t) {
  const root = mkdtempSync(join(realpathSync(tmpdir()), "yshop-guard-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git("init", "-q"); git("config", "user.name", "example-contributor");
  git("config", "user.email", "example-contributor@users.noreply.github.com");
  git("config", "core.hooksPath", ".disabled-hooks");
  function save(text) { writeFileSync(join(root, "data.txt"), text); git("add", "--", "data.txt"); }
  function commit() { git("commit", "-qm", "example change"); return git("rev-parse", "HEAD"); }
  return { root, git, save, commit, check: options => checkRepository({ root, run, ...options }) };
}

test("protected filenames are rejected without needing their contents", () => {
  for (const path of ["config.pem", ".aws/config", ".ssh/config", "refresh" + "token.json", "privacy.local.json", ".env.production", "settings.json"]) assert.equal(blockedPath(path), true);
  assert.equal(blockedPath("src/config.ts"), false);
});

test("PII and authentication findings contain only rules and line numbers", () => {
  const email = ["operator", "personal.test"].join("@");
  const phone = ["090", "1234", "5678"].join("-");
  const home = ["", "Users", "operator", "project"].join("/");
  const assignment = ["Client", "Secret"].join("") + ': "private-value"';
  const text = [email, phone, home, assignment].join("\n");
  const findings = inspectText(text);
  assert.deepEqual(new Set(findings.map(f => f.rule)), new Set(["email", "phone", "home-path", "auth-literal"]));
  const serialized = JSON.stringify(findings);
  for (const value of [email, phone, home, "private-value"]) assert.equal(serialized.includes(value), false);
  assert.deepEqual(inspectText('ClientID: "example-client"\ncontact@example.com\nexample@users.noreply.github.com\n127.0.0.1'), []);
});

test("private policy detects raw and encoded values without disclosing them", () => {
  const phrase = "example private phrase";
  for (const text of [phrase, phrase.toUpperCase(), encodeURIComponent(phrase), Buffer.from(phrase).toString("base64")]) {
    assert.equal(inspectText(text, [phrase])[0]?.rule, "private-policy");
    assert.equal(JSON.stringify(inspectText(text, [phrase])).includes(phrase), false);
  }
});

test("public and private key material are rejected even inside source files", () => {
  for (const type of ["PUBLIC", "PRIVATE", "RSA PRIVATE"]) {
    const marker = ["-----BEGIN", `${type} KEY-----`].join(" ");
    assert.equal(inspectText(marker)[0]?.rule, "key-material");
  }
});

test("Windows JSON paths and environment assignments are checked", () => {
  const path = ["C:", "Users", "operator", "project"].join(String.fromCharCode(92));
  for (const value of [path, JSON.stringify(path), path.replaceAll(String.fromCharCode(92), "/")]) {
    assert.equal(inspectText(value)[0]?.rule, "home-path");
  }
  const field = ["YSHOP", "CLIENT", "SECRET"].join("_");
  for (const value of [JSON.stringify({ [field]: "private-value" }), JSON.stringify(JSON.stringify({ [field]: "private-value" }))]) {
    assert.equal(inspectText(value)[0]?.rule, "auth-literal");
  }
});

test("pre-commit checks staged content even if the working file was replaced", t => {
  const r = repository(t);
  const email = ["operator", "personal.test"].join("@");
  r.save(email); writeFileSync(join(r.root, "data.txt"), "safe working content");
  assert.equal(r.check({ mode: "staged" }).ok, false);
  r.save("safe staged content"); writeFileSync(join(r.root, "data.txt"), email);
  assert.equal(r.check({ mode: "staged" }).ok, true);
});

test("pre-push checks intermediate commits, not just the final tree", t => {
  const r = repository(t);
  r.save("safe"); const base = r.commit();
  r.save(["operator", "personal.test"].join("@")); r.commit();
  r.save("safe again"); const head = r.commit();
  assert.equal(r.check({ mode: "tree", ref: head }).ok, true);
  const input = `refs/heads/main ${head} refs/heads/main ${base}\n`;
  assert.equal(r.check({ mode: "pre-push", input }).ok, false);
  const freshRemote = `refs/heads/main ${head} refs/heads/main ${"0".repeat(40)}\n`;
  assert.equal(r.check({ mode: "pre-push", input: freshRemote }).ok, false);
});

test("commit emails and commit messages are included in the check", t => {
  const r = repository(t);
  r.save("safe"); r.git("config", "user.email", ["operator", "personal.test"].join("@")); r.commit();
  assert.ok(r.check({ mode: "tree" }).findings.some(f => f.rule === "git-email"));
  r.git("config", "user.email", "example-contributor@users.noreply.github.com");
  r.save("safe change"); r.git("commit", "-qm", ["operator", "personal.test"].join("@"));
  assert.ok(r.check({ mode: "tree" }).findings.some(f => f.rule === "email"));
});

test("missing scanners and unknown revisions fail closed without raw exceptions", t => {
  const r = repository(t); r.save("safe"); r.commit();
  assert.throws(() => r.check({ mode: "tree", run: () => ({ status: null, error: new Error("private-detail") }) }), /検査を完了できません/);
  assert.throws(() => r.check({ mode: "tree", ref: "missing-revision" }), /検査を完了できません/);
  assert.throws(() => r.check({ mode: "range", range: "--all" }), /検査を完了できません/);
  const result = r.check({ mode: "tree", run: () => ({ status: 1, stdout: "private-detail", stderr: "private-detail" }) });
  assert.equal(result.ok, false); assert.equal(JSON.stringify(result).includes("private-detail"), false);
});

test("an explicitly missing policy is not silently ignored", t => {
  const r = repository(t); r.save("safe"); r.commit();
  assert.throws(() => r.check({ mode: "tree", policyPath: join(r.root, "missing.json") }), /検査を完了できません/);
});
