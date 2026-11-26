# Cloudflare へのリリース

## 構成

| 環境 | Worker と D1 の名前 | URL |
| --- | --- | --- |
| プレビュー | `schale-ledger-v2-preview` | https://schale-ledger-v2-preview.sh4869221b.workers.dev |
| 本番 | `schale-ledger-v2` | https://schale-ledger-v2.sh4869221b.workers.dev |

環境ごとに独立した D1 と Cloudflare Access アプリを使う。Access アプリは hostname 全体に適用する。旧本番と同じメール許可条件を用い、24時間のアプリセッションを設定する。Workers の自動生成バージョン URL は無効。環境に合った D1 ID、Access 発行元、各アプリの audience は Cloudflare の管理画面で確認できる。

## 旧 Worker のビルドと PR #1

旧 Worker `schale-ledger-prod` の稼働版、D1、URL を復旧用に保持する。旧 Git integration には `main` 用の本番トリガーと、全ブランチを対象とする旧方式の非本番トリガーがある。PR #1 の失敗は後者が `rewrite/ledger-v2` で旧 `apps/web/wrangler.jsonc` を読み込むためだった。

Cloudflare Builds API で旧方式の非本番トリガーだけを更新し、既存の除外 `main` に `rewrite/ledger-v2` を追加した。再現するときは Worker tag でトリガーを一覧取得し、同じ GitHub リポジトリを参照する `branch_includes: ["*"]` のトリガーを特定する。現在の除外リストに対象ブランチを追記した `branch_excludes` だけを `PATCH /builds/triggers/{trigger_uuid}` で送る。以前の一覧を控え、取得結果で本番用のトリガー全体・旧 Worker の稼働バージョンが一致することを確認する。復元する場合は、同じ非本番トリガーから追加したブランチだけを除く。

刷新ブランチは GitHub Actions で検証し、新プレビューと新本番へ明示的に配置する。別の刷新ブランチを使うときも、旧非本番トリガーとの重複を先に確認する。将来 `main` に取り込むときは、旧コードを指す Git の復旧参照と稼働版 ID を先に記録し、旧本番トリガーが新しい `main` を拾わない運用を別途決めてからマージする。本番トリガーの変更は今回の対象外。

[Cloudflare Workers Builds のブランチ条件](https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/#invalid-request-body-12002-when-updating-branch-patterns)

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
5. 本番用の変数に差し替え、`node scripts/release-config.mjs production` で同じコミットを配置する。公開 URL で Access、起動、読み取りを確認する。アップグレード時は追加マイグレーションだけを適用し、既存の利用者と記録を保持する。

## 切り戻し

新しい URL の利用を中止し、既存利用者には旧 URL を案内する。新 Worker のバージョンを切り戻す場合は Cloudflare Dashboard または `wrangler rollback --config wrangler.release.json` を使い、選ぶバージョンと現在の D1 の互換性を確認する。D1 の復元が必要なときは対象 DB の Time Travel を別途判断する。旧・新間でデータの同期や移送は行われない。

- [D1 のマイグレーション](https://developers.cloudflare.com/d1/reference/migrations/)
- [Worker のロールバック](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
