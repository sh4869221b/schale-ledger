# Cloudflare Setup

Current status: Workers + D1 is the only supported deployment target. Legacy Pages / Neon / Hyperdrive settings are no longer used.

Deploy model:
- primary deploy path: Cloudflare Workers Git integration
- branch mapping: `dev` -> dev, `main` -> prod
- GitHub Actions: CI-only
- migrations: manual

## 1. ローカル認証
```bash
bunx wrangler login
bunx wrangler whoami
```

## 2. D1 データベース作成
- `schale-ledger-dev`
- `schale-ledger-prod`

作成後に database id を控え、Cloudflare project settings に設定します。

## 3. Workers 設定
- `apps/web/wrangler.jsonc` をベースに `dev` / `prod` の binding を設定する
- `CF_ACCESS_AUD`
- `CF_ACCESS_TEAM_DOMAIN`
- `SESSION_COOKIE_SECRET`

## 4. Cloudflare Access
- UI に Access を適用する
- ログイン方式: One-time PIN
- `CF_ACCESS_AUD_DEV` / `CF_ACCESS_AUD_PROD` を取得する

## 5. Cloudflare project settings
- dev project
  - branch: `dev`
  - root/build target: `apps/web`
  - build command: `bun install && bun run build`
  - deploy command: `bunx wrangler deploy --config apps/web/wrangler.jsonc --env dev --keep-vars`
  - D1 binding: dev DB
  - `CF_ACCESS_AUD`
  - `CF_ACCESS_TEAM_DOMAIN`
  - `SESSION_COOKIE_SECRET`
- prod project
  - branch: `main`
  - root/build target: `apps/web`
  - build command: `bun install && bun run build`
  - deploy command: `bunx wrangler deploy --config apps/web/wrangler.jsonc --keep-vars`
  - D1 binding: prod DB
  - `CF_ACCESS_AUD`
  - `CF_ACCESS_TEAM_DOMAIN`
  - `SESSION_COOKIE_SECRET`

## 6. デプロイ
- `dev` push -> Cloudflare dev project deploy
- `main` push -> Cloudflare prod project deploy
- migration は deploy 前に必要に応じて手動実行する
- 上記 deploy command は Cloudflare Dashboard に設定する値であり、通常運用でローカル実行しない

## 7. 事前確認
```bash
bun install
bun test
bun run check
bun run build
bun run db:migrate:local
bun run db:migrate:local
```

## 8. 手動 migration
```bash
bun run db:migrate:local
bun run --cwd ./packages/db migrate:remote:dev
bun run --cwd ./packages/db migrate:remote:prod
```
