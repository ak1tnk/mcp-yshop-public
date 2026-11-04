# mcp-yshop

- 公開先は`public-repository.json`の`ak1tnk/mcp-yshop-public`。開発用コピーでは`origin`を非公開のまま維持し、`public`を公開先の参照に使う。`public`のpush URLは`disabled://use-public-sync`にして直接送信を防ぐ。作業前にリモートを確認する。
- 公開更新は`npm run public:sync`で確認し、公開を依頼されたら`npm run public:sync -- --publish`を使用する。初回以外は公開側の履歴を親にしたPRを作成する。手順は`docs/publication.md`。
- 開発側から公開先へ直接push・mirror・全ブランチ送信・履歴を結合するマージをしない。公開側のPR変更はレビューして必要な差分だけ開発側へ取り込む。ローカル設定・非公開ポリシー・開発側の履歴とコミットIDを公開しない。
- 公開PRをマージする場合もGitHub noreplyの著者メールを明示する。`main`の必須チェックやPR要件を管理者権限で回避しない。

- Yahoo!ショッピングの公式APIを使うローカルstdio MCP。`src/index.ts`が起動点。
- 認証は対話式セットアップ（プロジェクト外の専用settings.json、600）、環境変数、SSMに対応。認証値を表示・ログ保存・コミットしない。SSM値をファイルへ書き出さない。`.env`は使わない。
- ストアIDの個人用既定値を設けない。Proxyは明示的に有効化。SSMのProxyは `/Proxy`。署名バージョンは発行された値を利用者が指定する。
- 更新ツールは`dry_run=true`が既定。公開処理を他の更新へ暗黙に追加しない。結果不明の更新を自動再送しない。
- `editItem`は省略項目を初期化する全体保存。価格・名称等の部分変更には`updateItems`を使う。
- `src/catalog.ts`に公式API104操作の固定定義。対応表は`docs/api-coverage.md`。終了済みAPIを現行件数に含めない。
- 共通ツールは`yshop_api_catalog`・`yshop_read_api`・`yshop_write_api`。既存15補助ツールと合わせ18ツール。新しいAPIの通信形式は公式本文・サンプルを照合する。
- ファイル取得は`out/`へ保存。認証ファイル・非対応ファイルを送信しない。問い合わせの送信やファイル投稿の本番検証は行わない。
- stdoutはMCPプロトコル専用。生の通信例外・AWS例外・レスポンス本文をログに出さない。
- `npm run build`、`npm run check`、`npm run smoke`で検証。通常のテストは外部通信しない。
- 混入防止は`npm run privacy:setup`でGitフックを登録。コミット前はステージ内容、push前は送信する全コミットを検査。検出値を出力しない。`privacy.local.json`は非公開・Git追跡対象外。公開CIのみ標準ランナーで実行し、失敗・未実行の検査を合格と報告しない。
- `npm run smoke -- --live --orders`は参照APIだけの実接続確認。本番更新の検証は別途明示的に依頼された場合だけ行う。
