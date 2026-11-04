# 開発用コピーと公開リポジトリの連携

公開先は[ak1tnk/mcp-yshop-public](https://github.com/ak1tnk/mcp-yshop-public)です。`public-repository.json`で同期先を管理します。

開発用の非公開コピーと公開側は、Gitの履歴を共有しません。開発用コピーの`origin`はそのまま残し、`public`リモートを公開先への参照に使います。公開側には検査済みの最新ソースだけを、別のGitリポジトリから送信します。認証設定・禁止語の非公開ポリシー・ローカルファイル・開発側のコミットIDを公開コミットへ含めません。

## 開発側から公開側へ送る

Git、GitHub CLI、Node.jsを使用します。`gh`は公開先へ書き込めるアカウントで通常のログインを済ませてください。認証値をコマンド引数へ記載する必要はありません。

```sh
npm ci
npm run privacy:setup
npm run build
npm run check
npm run smoke

# origin（開発元）へ通常のコミット・pushを済ませる
git status --short

# 送信せずに公開内容を確認
npm run public:sync

# 検査を通したソースを公開側へ送信
npm run public:sync -- --publish
```

作業ツリーに未コミットの変更がある場合は停止します。初回は旧履歴のない1コミットを`main`へ送ります。2回目以降は公開側の`main`を親にした同期ブランチとPRを作成します。自動マージ・強制pushは行いません。内容が同じ場合は何も送りません。同じ公開元・内容のPRがあれば再利用します。

PRの差分を確認し、`privacy`と`check`の成功後にマージしてください。公開側で受けた変更が開発側へ未反映の場合、同期PRに取り消しが含まれる場合があります。先に次の手順で変更を取り込みます。

検査と作業用コピーは`out/public-sync/`へ作成します。開発側のコミットと公開側の対応は`out/public-sync-state.json`へ保存し、Gitの追跡対象にはしません。初期公開後の`main`はPRと必須チェックで保護します。

## 公開側のPRを開発側へ取り込む

```sh
git fetch public main
git diff HEAD public/main -- src test scripts docs README.md AGENTS.md
```

差分をレビューし、必要なファイル・変更だけを開発側へ反映して通常のコミットを作成します。認証設定や非公開のポリシーはコピーしません。Gitの履歴が独立しているため、`git pull public main`や履歴を結合するマージは使用しません。公開側の変更を反映した後に`public:sync`を実行すると、差分がなければ追加PRは作成されません。

## 直接pushを防ぐ

開発側から公開先へ`git push public main`、`git push --all`、`git push --mirror`、強制pushを行わないでください。開発側の旧履歴を公開する原因になります。公開更新には必ず`public:sync`を使います。公開先のブランチ保護・Push protection・無料CIと、ローカルの混入チェックを併用します。
