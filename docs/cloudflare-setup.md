# Cloudflare Setup

## 1. ローカル認証
```bash
bunx wrangler login
bunx wrangler whoami
```

## 2. D1 データベース作成
- `schale-ledger-dev`
- `schale-ledger-prod`

作成後に database id を控え、GitHub Secrets に設定します。

## 3. Workers 設定
- `apps/web/wrangler.jsonc` をベースに `dev` / `prod` の binding を設定する
- `CF_ACCESS_AUD`
- `CF_ACCESS_TEAM_DOMAIN`
- `SESSION_COOKIE_SECRET`

## 4. Cloudflare Access
- UI に Access を適用する
- ログイン方式: One-time PIN
- `CF_ACCESS_AUD_DEV` / `CF_ACCESS_AUD_PROD` を取得する

## 5. GitHub Secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID_DEV`
- `CLOUDFLARE_D1_DATABASE_ID_PROD`
- `CF_ACCESS_AUD_DEV`
- `CF_ACCESS_AUD_PROD`
- `CF_ACCESS_TEAM_DOMAIN`
- `SESSION_COOKIE_SECRET_DEV`
- `SESSION_COOKIE_SECRET_PROD`

## 6. デプロイ
- `dev` push -> CI -> dev migration + dev deploy
- `main` push -> CI -> prod migration + prod deploy

## 7. 事前確認
```bash
bun install
bun test
bun run check
bun run build
bun run db:migrate:local
bun run db:migrate:local
```
