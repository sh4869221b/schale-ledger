# Cloudflare Setup

## 1. ローカル認証
```bash
bunx wrangler login
bunx wrangler whoami
```

## 2. Hyperdrive 作成（Neon）
```bash
# prod
bunx wrangler hyperdrive create schale-ledger-neon-prod \
  --connection-string="postgres://<user>:<password>@<host>/<db>?sslmode=require" \
  --caching-disabled=true

# dev
bunx wrangler hyperdrive create schale-ledger-neon-dev \
  --connection-string="postgres://<user>:<password>@<host>/<db>?sslmode=require" \
  --caching-disabled=true
```

## 3. Pages プロジェクト作成
- `schale-ledger-prod`
- `schale-ledger-dev`

## 4. Cloudflare Access
- UI に Access を適用する
- ログイン方式: One-time PIN

## 5. GitHub Secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `HYPERDRIVE_PROD_ID`
- `HYPERDRIVE_DEV_ID`
- `NEON_DATABASE_URL_PROD`
- `NEON_DATABASE_URL_DEV`

## 6. デプロイ
- `dev` push -> dev migration + dev deploy
- `main` push -> prod migration + prod deploy
