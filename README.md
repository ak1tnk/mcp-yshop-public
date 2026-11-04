# mcp-yshop

Yahoo!ショッピングの公式APIを操作する、TypeScript・stdio方式のローカルMCPサーバーです。

公開リポジトリ: [ak1tnk/mcp-yshop-public](https://github.com/ak1tnk/mcp-yshop-public)。開発用の非公開コピーからは、[公開側との同期手順](docs/publication.md)に従って検査済みソースをPRとして送れます。

公開前・運営中の認証情報と個人情報の混入防止には[コミット前・push前チェックの設定](docs/privacy-checks.md)を使用してください。Windowsでの追加チェックの依頼手順も含みます。

2026-11-04時点の公式一覧にある**現行104エンドポイント**に対応しています。注文・定期購入・商品・在庫・画像・SHPカテゴリ/ブランド・ストアカテゴリ・出品管理・デザイン・問い合わせ・店舗在庫・公開情報を含みます。[公式仕様へのリンク付き対応表](docs/api-coverage.md)

## 初回セットアップ（AWS不要）

Node.js 22.19以降のLTS（推奨24）を用意し、取得したリポジトリ内で実行します。

```sh
git clone https://github.com/ak1tnk/mcp-yshop-public.git
cd mcp-yshop-public
npm ci
npm run setup
```

セットアップではストアアカウント、Yahoo!デベロッパーネットワークで発行したサーバーサイドアプリのClient ID / Client Secretを入力します。自分のアプリについて、利用するショッピングAPIの利用申請とストア管理者の権限を準備してください。[公式の導入手順](https://developer.yahoo.co.jp/webapi/shopping/help/)

認可方法は次から選べます。

- `browser`：表示されたYahoo! JAPAN公式URLをブラウザで開き、ストア管理者のIDで同意します。アプリに登録済みのコールバックURLを正確に入力し、遷移後のURL全体をターミナルへ貼り付けます。MCPはランダムなstateと戻り先を照合してから認可コードを交換します。コールバック先は自分で管理するURLを使ってください。ローカルURLを登録していてページが開けない場合も、アドレス欄の遷移後URLを使用できます。
- `existing`：すでに取得したRefresh Tokenを非表示で入力します。

認証値と認可結果URLの入力は非表示です。ブラウザ用の認可URLには公開識別子のClient IDが含まれます。認証値をチャット・コマンド引数・リポジトリへ記載しないでください。セットアップはSSMへアクセスしません。再認可も`npm run setup`で行い、MCPを再起動します。ブラウザでの認可は利用者が行い、自動ログインは行いません。[公式の認可フロー](https://developer.yahoo.co.jp/yconnect/v2/authorization_code/)・[コード交換](https://developer.yahoo.co.jp/yconnect/v2/base/token.html)

ローカル設定はプロジェクトの外へ保存します。

| OS | 保存先 |
| --- | --- |
| macOS | `~/Library/Application Support/mcp-yshop/settings.json` |
| Linux | `${XDG_CONFIG_HOME:-~/.config}/mcp-yshop/settings.json` |
| Windows | `%APPDATA%\mcp-yshop\settings.json` |

保存内容は暗号化されていません。macOS / Linuxはファイル権限600、新規ディレクトリ700を使用します。Windowsでは専用ユーザーのAppDataに保存し、共有アカウントで使う場合は所有者だけがアクセスできるACLを設定してください。プロジェクト内への保存やシンボリックリンク経由の読み込みは拒否します。`.env`は読み込みません。

署名用公開鍵とバージョン、Proxy URLは任意です。公開鍵はストアクリエイターProで発行された値を使い、改行を`\n`にした文字列として入力します。**バージョン番号を固定値で流用しないでください。** 公開鍵なしでもYahoo! ID認証を使用できますが、注文などのAPIでは再認可までの期間が短くなります。公開鍵の有効期限とYahoo!側での再認可は別途管理してください。[公開鍵認証の公式説明](https://developer.yahoo.co.jp/webapi/shopping/help/)

## MCPクライアントへの登録

セットアップ後、Claude Desktopなどのstdioクライアントへ以下を登録します。`args`は自分が取得したディレクトリの絶対パスに置き換えてください。`node`がクライアントのPATHにない場合はNode.js本体の絶対パスを使います。

```json
{
  "mcpServers": {
    "yshop": {
      "command": "node",
      "args": ["/absolute/path/mcp-yshop/dist/index.js"],
      "env": { "YSHOP_AUTH_SOURCE": "local" }
    }
  }
}
```

ローカルプラグイン向けの`plugin.json`と`${PLUGIN_ROOT}`を使う`mcp.json`も同梱しています。インストールとビルド後に使用します。実行時に他のローカルプロジェクトへ依存しません。

```sh
codex mcp add yshop --env YSHOP_AUTH_SOURCE=local -- node /absolute/path/mcp-yshop/dist/index.js
```

`npm start`は標準入力でMCPメッセージを待ちます。通常はMCPクライアントから起動します。stdoutはMCPプロトコル専用です。

## 認証元と設定

`YSHOP_AUTH_SOURCE`で`local` / `env` / `ssm`を選びます。未指定の場合は認証用環境変数が一つでもあれば`env`、ストアIDのみ指定されていれば既存構成向けに`ssm`、それ以外は`local`を使います。不完全な認証を別の認証元で補うことはありません。ストアIDの個人用既定値はありません。

| 環境変数 | 用途 |
| --- | --- |
| `YSHOP_AUTH_SOURCE` | 認証元 `local` / `env` / `ssm` |
| `YSHOP_SELLER_ID` | 対象ストアID。env / ssmで必須。localで指定すると保存済みストアとの一致を確認 |
| `YSHOP_CLIENT_ID`・`YSHOP_CLIENT_SECRET`・`YSHOP_REFRESH_TOKEN` | env認証。3項目すべて必要。OSの安全な起動環境から渡す |
| `YSHOP_PUBLIC_KEY` | env用の署名公開鍵。省略可。改行は実改行または`\n` |
| `YSHOP_SIGNATURE_VERSION` | 署名公開鍵を使用する場合に必須の発行バージョン |
| `YSHOP_USE_SIGNATURE` | 既定`true`。`false`で公開鍵を使わない。SSMの公開鍵取得も省略 |
| `YSHOP_USE_PROXY` | env / ssmは既定`false`。localは保存したProxyの有無に従う。明示`false`で直接接続 |
| `YSHOP_PROXY_URL` | env認証でProxyを有効にする場合のHTTP(S) URL |
| `YSHOP_ENVIRONMENT` | 既定`production`。`test`で公式テスト環境を使用。テスト用アプリとストアが必要 |
| `YSHOP_CONFIG_PATH` | local設定を標準の保存先から変更。プロジェクト外の専用ディレクトリの`settings.json`を指定 |

ProxyはYahoo! ID認証と全APIの通信に適用します。注文APIなど接続元IPの登録が必要なAPIでは、自分の固定IPまたはProxyの出口IPをYahoo!側へ登録してください。[公式共通エラー一覧](https://developer.yahoo.co.jp/webapi/shopping/help/errorcode.html)

### AWS SSMを使う場合

従来のSSM認証も利用できます。認証値は実行時に復号してメモリ上で使い、ローカル設定へ書き出しません。AWSのアクセスキーをコードやMCP設定に記載せず、既存のAWS認証経路を利用してください。

| 環境変数 | 既定値 | 用途 |
| --- | --- | --- |
| `AWS_REGION` | `ap-northeast-1` | Parameter Storeのリージョン |
| `AWS_PROFILE` | AWS SDKの既定 | 必要な場合だけ既存のプロファイルを指定 |
| `YSHOP_AUTH_PARAMETER` | `/YShopAuth` | SecureString JSON。`ClientID`・`ClientSecret`・`RefreshToken`・`SellerID` |
| `YSHOP_PUBLIC_KEY_PARAMETER` | `/YShopPublicKeyPem` | 署名用公開鍵文字列。署名無効時は取得しない |
| `YSHOP_PROXY_PARAMETER` | `/Proxy` | Proxy有効時だけ取得。HTTP(S) URL、または`hosts: string[]`・`port`・`username`・`password`のJSON |

SSMのProxyオブジェクトは先頭ホストを使い、リクエストごとに出口IPを変更しません。追加項目は使いません。必要な権限は対象パラメータへの`ssm:GetParameter`と、カスタムKMSキー使用時の`kms:Decrypt`です。SSMへの書き込み権限は不要です。

SSM用MCP設定の`env`には、認証値を含めず次の項目を指定します。ストアIDと署名バージョンは自分の設定へ置き換えてください。

```json
{
  "YSHOP_AUTH_SOURCE": "ssm",
  "AWS_REGION": "ap-northeast-1",
  "YSHOP_SELLER_ID": "example-store",
  "YSHOP_SIGNATURE_VERSION": "1",
  "YSHOP_USE_PROXY": "true"
}
```

0.2から更新する場合は、MCPクライアント側に`YSHOP_SIGNATURE_VERSION`と必要な`YSHOP_USE_PROXY=true`を明示してください。公開鍵バージョンとストアIDをコードの既定値から取り除いています。SSM・環境変数・ローカル設定を更新したらMCPを再起動します。

## ツール

全API向けの共通ツール3個と、従来の補助ツール15個を提供します。APIごとの固定URL・HTTPメソッド・XML/JSON/form・ストアIDの位置はサーバー側で管理します。

| 共通ツール | 用途 |
| --- | --- |
| `yshop_api_catalog` | 全操作の一覧。`operation`指定で入力形式・必須項目・公式仕様・注意点を確認 |
| `yshop_read_api` | 全カテゴリの参照API。POSTで検索するAPIにも対応 |
| `yshop_write_api` | 全カテゴリの更新API。`dry_run=true`が既定 |

共通ツールでは公式のパラメータ名をそのまま渡します。`parameters`はXMLなら`Req`の内側、JSONなら本文、GET/formならフラットなパラメータです。`query`で本文とは別のURLクエリ、`path_parameters`でURL内の`{subscription_id}`などを指定できます。`seller_id`・`sellerId`・`SellerId`・`appid`・署名は選択した認証元とストア設定から自動設定します。任意のURLや認証ヘッダーは指定できません。公開情報APIのストア検索条件は他ストアも指定できます。

注文ステータス変更のドライラン例（`yshop_write_api`）：

```json
{
  "operation": "orderStatusChange",
  "parameters": {
    "Target": { "OrderId": "example-store-10000000", "IsPointFix": false },
    "Order": { "OrderStatus": 4, "CancelReason": 210 }
  }
}
```

実行時は対象注文とキャンセル理由を確認し、依頼された操作にだけ`dry_run=false`を指定します。注文完了と出荷変更は公式仕様に従って`IsPointFix=true`を明示します。問い合わせ送信・添付ファイル投稿・注文変更・公開も同じドライランの対象です。

CSV・画像ZIP・問い合わせ添付の送信には`upload`を使用します。CSVの文字コードは変換せず保持します。画像ZIPは含まれる画像名・形式・展開サイズ、PDFは暗号化の有無を送信前に確認します。

```json
{
  "operation": "uploadItemFile",
  "parameters": { "type": 1 },
  "upload": { "path": "/absolute/path/products.csv" }
}
```

ダウンロードAPIは`yshop_read_api`で実行すると、このプロジェクトの`out/`へ保存し、パス・サイズ・SHA-256を返します。データの文字コードとバイナリは保持します。サーバーのファイル名はローカル保存先に使用せず、生成した名前で保存します。取得上限は256MB、アップロードは25MB（単体画像は2MB）、画像ZIPの展開合計は250MBです。ファイル転送のタイムアウトは120秒なので、大きいファイルを扱うクライアントではツールの実行時間も合わせて設定してください。

JSON配列を返すAPIは`data.results`に配列を格納します。データチェック履歴の`ErrorCode`は検証結果のデータとして返し、呼び出し自体のAPIエラーと区別します。

既存の補助ツールは以下のとおりです。

| ツール | 公式API | 用途 |
| --- | --- | --- |
| `yshop_list_items` | `myItemList` | 商品コード・商品名・ストアカテゴリで商品を検索 |
| `yshop_get_item` | `getItem` | 商品詳細の参照 |
| `yshop_edit_item` | `editItem` | 新規登録・全項目の保存 |
| `yshop_update_items` | `updateItems` | 価格・名称・表示・販売期間などの部分更新（最大100商品） |
| `yshop_get_stock` | `getStock` | 在庫の参照（最大1,000コード） |
| `yshop_set_stock` | `setStock` | 在庫数の絶対値更新（最大1,000コード） |
| `yshop_list_store_categories` | `stCategoryList` | ストアカテゴリの参照 |
| `yshop_upload_image` | `uploadItemImage` / `uploadLibImage` | 商品画像・追加画像の登録 |
| `yshop_submit_item` | `submitItem` | 既存商品1件の本番反映 |
| `yshop_get_publish_reservation` | `reservePublish` mode=3 | 全反映予約の確認 |
| `yshop_reserve_publish` | `reservePublish` mode=1 | 全未反映変更の本番反映予約 |
| `yshop_list_publish_history` | `publishHistorySummary` | 反映履歴・未反映項目の参照 |
| `yshop_list_orders` | `orderList` | 注文日時範囲で検索 |
| `yshop_get_order` | `orderInfo` | 注文1件の詳細参照 |
| `yshop_update_shipping` | `orderShipStatusChange` | 出荷ステータス・伝票番号の更新 |

全更新ツールは`dry_run=true`が既定です。まず送信内容を確認し、依頼された変更に`dry_run=false`を指定すると送信します。ドライランはSSM取得・Yahoo API通信を行いません。画像のドライランでは指定画像の形式・サイズを検証し、SHA-256を返します。

価格変更の確認例：

```json
{
  "items": [{ "item_code": "example-shirt", "price": 5900, "sale_price": "" }]
}
```

`yshop_update_items`は`price`と`sale_price`の同時指定が必要です。特価を維持する場合は、先に取得した現在の特価を渡してください。特価を設定しない場合は空文字を明示します。省略した他の項目は変更しません。[部分更新の公式仕様](https://developer.yahoo.co.jp/webapi/shopping/updateItems.html)

`yshop_edit_item`は全体保存です。**省略した項目はデフォルト値に上書きされます。** 既存商品の説明・バリエーション等を保つ場合は、それらを含む完全な`fields`が必要です。`name`・`path`・`product_category`・`price`を必須とし、追加の商品項目は公式のパラメータ名で渡せます。[全体保存の公式仕様](https://developer.yahoo.co.jp/webapi/shopping/editItem.html)

在庫は`商品コード:個別商品コード`形式にも対応します。補助ツール`yshop_set_stock`は絶対数を受け付けます。共通ツールの`setStock`では加算・減算・超過購入設定・在庫クローズ解除も公式パラメータで指定できます。存在しないコードにも在庫が作成されるため、更新前に対象コードを確認してください。`Quantity`が空文字の参照結果は無限在庫です。[在庫更新の公式仕様](https://developer.yahoo.co.jp/webapi/shopping/setStock.html)

商品保存と公開は別操作です。全反映予約はストア全体の保留変更が対象なので、先に`yshop_list_publish_history`の`publish_id=0`で内容を確認します。公開APIの正常応答も受付を示すため、完了は反映履歴で確認します。追加画像はアップロード時に本番反映される場合があります。[個別反映](https://developer.yahoo.co.jp/webapi/shopping/submitItem.html)・[全反映予約](https://developer.yahoo.co.jp/webapi/shopping/reservePublish.html)・[追加画像](https://developer.yahoo.co.jp/webapi/shopping/uploadLibImage.html)

出荷変更は公式要件に従い`IsPointFix=true`を送信します。ポイント確定や、支払い方法によっては売上確定を伴います。出荷済みへの変更には出荷日を指定してください。APIの警告も応答に含めて返します。[出荷変更の公式仕様](https://developer.yahoo.co.jp/webapi/shopping/orderShipStatusChange.html)

API呼び出しは1プロセス内で直列に実行し、前の完了から1秒空けます。複数MCPプロセスや既存スクリプトを同時実行した場合の制限は共有しないため、同じストアの操作は並行起動しないでください。HTTP 200内のNG・エラー、在庫のHTTP 207も失敗として扱います。更新APIは自動再送しません。通信結果が不明な場合は対象状態を参照してから判断してください。

## 検証

```sh
npm run build
npm run check
npm run smoke

# 設定した認証元と公式APIの参照操作だけを実接続で確認
npm run smoke -- --live --orders
```

通常のテスト・smokeは外部サービスへ接続しません。実接続smokeでも更新ツールはドライランだけです。認証値・Proxy値・購入者情報・APIレスポンス本文を検証ログへ出力しません。GitHub ActionsもAWS認証なしでビルドとテストを実行します。

ローカルテストでは104操作すべての通信形式・URL・ストア認証の付与と、更新APIを参照ツールから実行できないことを確認します。本番で全更新APIを実行したという意味ではありません。契約・利用申請・ビジネスID権限によって実際に使用できるAPIは異なります。公式本文とサンプルの不一致は対応表へ記録しています。提供終了済みの商品検索V1・おすすめ情報モジュール・商品レビュー検索は対象外です。

認証ファイル・秘密鍵・`.env`・ローカルログ・依存パッケージ・ビルド生成物は`.gitignore`で追跡から除外しています。`package.json`は`private: true`でnpm公開を無効にしています。
