# 公開前・運営中の混入チェック

公開用は旧履歴を含まない新しいリポジトリから開始してください。チェック機構を追加しても、既存コミット内の情報は削除されません。

## 初回設定

```sh
npm ci
npm run privacy:setup
npm run privacy:check
```

`privacy:setup`は公式gitleaks 8.30.1を取得し、公式チェックサムとSHA-256を照合して`.cache/privacy/`へ配置します。このリポジトリだけで`.githooks`を有効にします。既存フックは上書きしません。Windows x64/arm64、macOS、Linuxに対応します。WindowsではGit for WindowsとNode.jsを使用してください。Windows用ZIPの展開には既存の`fflate`を使います。

| 実行場所 | 検査内容 | 費用 |
| --- | --- | --- |
| コミット前 | Gitのステージ内容、著者・コミッタのメール | ローカル実行 |
| push前 | 送信する全コミットの内容・メッセージ・メール。途中で混入して後で削除した情報も対象 | ローカル実行 |
| 公開リポジトリのCI | push / PRの新しいコミット。成功後に通常のビルド・テストを実行 | 標準GitHubランナーの実行は無料 |

GitHub Actionsは公開リポジトリだけで実行します。非公開の間はジョブをスキップし、ローカル検査を使用します。大型ランナー・成果物アップロード・キャッシュ保存は使用しません。[GitHub公式料金](https://docs.github.com/en/actions/concepts/billing-and-usage)

検出対象は認証ファイル名、秘密鍵、認証値やストアIDの直書き、個人メール、ユーザーのホームパス、携帯電話番号、実IPアドレス、gitleaksの既定ルールです。例示用の`example` / `test` / `fixture`の値、例示用メール、GitHubのnoreplyメール、ループバック・文書用IPは区別します。署名公開鍵や参照結果を含む、機械で確認できないバイナリ等は自動通過させません。

検出した文字列・元の通信例外・本文は出力しません。出力するのはルール、ファイル名、行番号などです。ファイル名自体が保護対象の場合はIDに置き換えます。gitleaks未導入、検査失敗、サイズ超過、存在しない検査範囲は成功として扱いません。認証ファイル名は本文を開く前に拒否します。

## 個別の禁止語

店舗名・社内プロジェクト名などは、Git追跡対象外の`privacy.local.json`で指定します。

```json
{ "blockedText": ["example-internal-store", "example internal phrase"] }
```

実際の禁止語をREADMEやテストへ書かないでください。`privacy.local.json`は権限600などで非公開に保ち、認証値をこのファイルへ転記しないでください。生の文字列に加え、URLエンコード・Base64・JSONエスケープの表現も検査します。このファイルはGitHub CIや他のPCへ自動送信されません。GitHub側だけでは、このPC固有の禁止語を検査できません。

別PCの追加チェックでは`--policy`で専用の非公開ファイルを指定できます。

```sh
node scripts/privacy-check.mjs --repo /absolute/path/data-repository --all --policy /absolute/path/private/privacy.local.json
```

`--all`は全ブランチの履歴を調べるため、整理前のリポジトリでは旧コミットの問題も報告します。`--tree HEAD`は最新スナップショット、`--range <base-sha>..<head-sha>`は指定範囲の全コミットを調べます。

## Windows常駐サーバーとAI

Claude Code Remote ControlとSendMessageは、Windows側への作業依頼に使えます。定期検査の本体はタスクスケジューラに登録すると、AIセッションの継続に依存しません。Windowsの役割は非公開の禁止語による追加検査と、任意のローカルAIレビューです。

公開PRを常駐サーバーのself-hosted runnerで実行する構成は使用しません。外部PRのコードがサーバーや認証情報へアクセスする危険があります。[GitHub公式の説明](https://docs.github.com/en/actions/reference/security/secure-use#hardening-for-self-hosted-runners)

Windows側は、レビュー済みの固定された検査プログラムと、取得したGitデータの保存先を分けます。取得したPRのコード・npm scripts・ワークフロー・AI向け指示を実行しません。AIには禁止語や認証値を渡さず、外部AIへ未検査の差分を送信しません。AIの指摘は人が確認し、AIの合格だけで固定ルールの失敗を解除しません。モデル導入やAI API呼び出しは、この設定には含めていません。

Windows側へ渡す具体的な作業指示は[こちら](windows-review-handoff.md)です。

## GitHub側で追加する設定

公開先ではGitHubのSecret scanningとPush protectionを有効にしています。`main`はPRと`privacy`・`check`の成功を必須とし、管理者にも適用します。強制push・ブランチ削除は禁止しています。設定やワークフローの変更は管理者がレビューします。公開リポジトリのSecret scanningは無料で実行されますが、Push protectionには対応する認証値の種類・サイズ等の制限があります。[GitHub公式](https://docs.github.com/en/code-security/concepts/secret-security/push-protection)

ローカルフックは`--no-verify`などで回避でき、CIはGitHubへ送信された後に動作します。CI単体では公開前の漏えいを止められません。フック・GitHubのpush時保護・レビューを組み合わせて運用してください。未対応形式や氏名などの文脈依存の情報は、人やAIの追加レビューが必要です。
