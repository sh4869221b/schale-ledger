# シャーレ育成手帳 (`schale-ledger`)

生徒育成情報と編成情報を管理する、Cloudflare Workers + D1 ベースの SvelteKit アプリです。

> Legacy Pages / Neon / Hyperdrive implementation has been removed from the active runtime path.

## 構成
- `apps/web`: SvelteKit（UI + Workers server routes）
- `packages/core`: ビジネスルール / validation
- `packages/db`: Drizzle schema / D1 migrations / repositories
- `packages/ui`: Tailwind v4 / shared UI primitives
- `infrastructure/wrangler`: deploy / cutover 運用メモ
- `docs/spec`: 仕様書

## 必須確認コマンド
```bash
bun install
bun test
bun run check
bun run build
bun run db:migrate:local
bun run db:migrate:local
```

## 開発
```bash
bun install
bun run dev
```

## マイグレーション
```bash
bun run db:migrate:local
bun run --cwd ./packages/db migrate:dev
bun run --cwd ./packages/db migrate:prod
```

## デプロイ
```bash
bun run deploy:dev
bun run deploy:prod
```

Cloudflare Access / D1 / Workers の詳細は `docs/cloudflare-setup.md` と `infrastructure/wrangler/README.md` を参照してください。

## 仕様
実装前提の正本は `docs/superpowers/specs/` を参照してください。

`docs/spec/` は旧 Pages/Neon 構成の凍結資料として扱います。
