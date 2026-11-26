# Cloudflare へのリリース

## 構成

| 環境 | Worker と D1 の名前 | URL |
| --- | --- | --- |
| プレビュー | `schale-ledger-v2-preview` | https://schale-ledger-v2-preview.sh4869221b.workers.dev |
| 本番 | `schale-ledger-v2` | https://schale-ledger-v2.sh4869221b.workers.dev |

環境ごとに独立した D1 と Cloudflare Access アプリを使う。Access アプリは hostname 全体に適用する。旧本番と同じメール許可条件を用い、24時間のアプリセッションを設定する。Workers の自動生成バージョン URL は無効。環境に合った D1 ID、Access 発行元、各アプリの audience は Cloudflare の管理画面で確認できる。

旧 Worker・D1・URL は切り戻し用。旧 Git integration には以前のプロジェクトルートが設定されている。PR を main に取り込む前に、旧 Worker が main のビルドを開始しないよう、旧デプロイの運用設定を確認する。新 Worker は明示的に対象を選んでリリースする。

## 再実行手順

1. GitHub Actions の CI が成功したコミットをチェックアウトする。新規環境では同名の D1 と Access アプリを用意する。Access を先に作成し、旧アプリのメール許可条件を照合する。
2. Wrangler に対象アカウントを認証する。CI 用のアカウント限定トークンを使う場合は Workers Scripts Write と D1 Write を設定し、シークレットストアから注入する。
3. `LEDGER_D1_ID`、`LEDGER_ACCESS_ISSUER`（`https://<team>.cloudflareaccess.com`）、`LEDGER_ACCESS_AUDIENCE` を対象環境に合わせる。プレビューから先に配置する。

```sh
npm ci
npm run build
node scripts/release-config.mjs preview
npm exec -- wrangler d1 migrations list DB --remote --config wrangler.release.json
npm exec -- wrangler d1 migrations apply DB --remote --config wrangler.release.json
npm exec -- wrangler deploy --config wrangler.release.json
```

4. 未ログインで Access がログイン画面に誘導することを確認する。許可された利用者でログインし、`/healthz`、生徒の検索と閲覧、プレビューでの育成や編成の保存・再取得を確認する。プレビューの収録数とスクリプトのリリース番号を記録する。
5. 本番用の変数に差し替え、`node scripts/release-config.mjs production` で同じコミットを配置する。公開 URL で Access、起動、読み取りを確認する。本番の D1 には生徒マスタだけを初期登録する。

## 切り戻し

新しい URL の利用を中止し、既存利用者には旧 URL を案内する。新 Worker のバージョンを切り戻す場合は Cloudflare Dashboard または `wrangler rollback --config wrangler.release.json` を使い、選ぶバージョンと現在の D1 の互換性を確認する。D1 の復元が必要なときは対象 DB の Time Travel を別途判断する。旧・新間でデータの同期や移送は行われない。

- [D1 のマイグレーション](https://developers.cloudflare.com/d1/reference/migrations/)
- [Worker のロールバック](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
