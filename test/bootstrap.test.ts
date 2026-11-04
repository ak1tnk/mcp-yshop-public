import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, rm, stat, symlink } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { prepareApplication } from "../src/bootstrap.js";
import { readConfig, loadRuntime } from "../src/config.js";
import { readLocalSettings, saveLocalSettings } from "../src/local.js";

const sample = { ClientID: "example-client", ClientSecret: "example-value", RefreshToken: "example-refresh", SellerID: "example-store", environment: "production" as const };
const env = { YSHOP_AUTH_SOURCE: "env", YSHOP_SELLER_ID: sample.SellerID, YSHOP_CLIENT_ID: sample.ClientID,
  YSHOP_CLIENT_SECRET: sample.ClientSecret, YSHOP_REFRESH_TOKEN: sample.RefreshToken };

test("environment authentication works without AWS or a public key; incomplete input never falls back", async () => {
  const application = await prepareApplication(env);
  const runtime = await application.load();
  assert.deepEqual(runtime.auth, { ClientID: sample.ClientID, ClientSecret: sample.ClientSecret, RefreshToken: sample.RefreshToken, SellerID: sample.SellerID });
  assert.equal(runtime.publicKey, "");
  await runtime.close(); application.close();
  const partial = await prepareApplication({ YSHOP_SELLER_ID: sample.SellerID, YSHOP_CLIENT_ID: "example-client" });
  assert.equal(partial.config.authSource, "env");
  await assert.rejects(partial.load(), /すべて設定/);
  await assert.rejects(prepareApplication({ ...env, YSHOP_AUTH_SOURCE: "invalid" }), /YSHOP_AUTH_SOURCE/);
});

test("SSM signature can be disabled and a custom proxy parameter is fetched only when enabled", async () => {
  const names: string[] = [];
  const config = readConfig({ YSHOP_SELLER_ID: sample.SellerID, YSHOP_USE_SIGNATURE: "false", YSHOP_USE_PROXY: "true", YSHOP_PROXY_PARAMETER: "/Example/Proxy" });
  const runtime = await loadRuntime(config, { get: async name => { names.push(name); return name === "/YShopAuth" ? JSON.stringify(sample) : "http://proxy.example:8080"; } });
  assert.deepEqual(names.sort(), ["/Example/Proxy", "/YShopAuth"]);
  assert.equal(runtime.publicKey, "");
  await runtime.close();
});

test("local settings stay outside the project, have private permissions, and reject symlinks and seller mismatch", async t => {
  const directory = await mkdtemp(join(realpathSync(tmpdir()), "yshop-settings-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, "settings.json");
  assert.equal(await readLocalSettings(path), undefined);
  await saveLocalSettings(path, sample);
  assert.deepEqual(await readLocalSettings(path), sample);
  if (process.platform !== "win32") assert.equal((await stat(path)).mode & 0o777, 0o600);
  const application = await prepareApplication({ YSHOP_AUTH_SOURCE: "local", YSHOP_CONFIG_PATH: path });
  assert.equal(application.config.sellerId, sample.SellerID);
  const runtime = await application.load(); await runtime.close();
  const mismatch = await prepareApplication({ YSHOP_AUTH_SOURCE: "local", YSHOP_CONFIG_PATH: path, YSHOP_SELLER_ID: "example-other-store" });
  await assert.rejects(mismatch.load(), /一致しません/);
  await assert.rejects(saveLocalSettings(join(process.cwd(), "settings.json"), sample), /プロジェクト外/);
  if (process.platform !== "win32") {
    await chmod(directory, 0o755);
    await assert.rejects(readLocalSettings(path), /700/);
    await chmod(directory, 0o700);
    await chmod(path, 0o644);
    await assert.rejects(readLocalSettings(path), /600/);
    await chmod(path, 0o600);
    const target = join(directory, "other.json");
    await rm(path);
    await symlink(target, path);
    await assert.rejects(readLocalSettings(path), /読み込めません/);
    await saveLocalSettings(path, sample);
    assert.equal(JSON.parse(await readFile(path, "utf8")).SellerID, sample.SellerID);
    await assert.rejects(readFile(target));
  }
});
