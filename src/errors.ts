/** Only deliberate, value-free messages may cross the MCP boundary. */
export class SafeError extends Error {}

export function safeMessage(error: unknown): string {
  return error instanceof SafeError ? error.message : "処理に失敗しました。認証値・通信内容は出力しません。";
}
