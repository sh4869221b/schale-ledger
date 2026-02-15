# シャーレ育成手帳 (`schale-ledger`)

生徒育成情報と編成情報を管理する、Cloudflare Pages(SvelteKit) + Neon(Postgres) アプリです。

## 構成
- `services/app`: SvelteKit（UI + REST + MCP）
- `packages/domain`: ドメイン型
- `packages/contracts`: DTO/エラーコード
- `packages/application`: ユースケース
- `packages/infrastructure`: Drizzle + Repository 実装
- `db/schema`: Drizzleスキーマ
- `db/migrations`: SQL migration
- `docs/spec`: 仕様書

## 開発
```bash
bun install
bun run dev
```

## マイグレーション
```bash
NEON_DATABASE_URL_DEV=... bun run db:migrate:dev
NEON_DATABASE_URL_PROD=... bun run db:migrate:prod
```

## 仕様
実装前提の仕様は `docs/spec/` を参照してください。
