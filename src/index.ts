import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { YShopClient } from "./client.js";
import { prepareApplication } from "./bootstrap.js";
import { safeMessage } from "./errors.js";
import { createServer } from "./server.js";

try {
  const application = await prepareApplication();
  const { config } = application;
  const client = new YShopClient(config, application.load);
  const transport = serveStdio(() => createServer(config, client), {
    onerror: () => { process.stderr.write("YShop MCP: プロトコルエラーが発生しました。\n"); },
  });
  let closing = false;
  async function close() {
    if (closing) return;
    closing = true;
    await client.close().catch(() => {});
    application.close();
    await transport.close().catch(() => {});
  }
  process.once("SIGINT", () => { void close(); });
  process.once("SIGTERM", () => { void close(); });
  process.stdin.once("end", () => { void close(); });
} catch (error) {
  process.stderr.write(`${safeMessage(error)}\n`);
  process.exitCode = 1;
}
