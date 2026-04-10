# Workers / Wrangler operations

Deploy model:
- primary deploy path: Cloudflare Workers Git integration
- branch mapping: `dev` -> dev, `main` -> prod
- GitHub Actions: CI-only
- migrations: manual

## Required local verification

```bash
bun install
bun test
bun run check
bun run build
bun run db:migrate:local
bun run db:migrate:local
```

## Local development

```bash
bun run dev
```

## Manual migration commands

```bash
bun run db:migrate:local
bun run --cwd ./packages/db migrate:dev
bun run --cwd ./packages/db migrate:prod
```

## Required Cloudflare project settings

- dev project
  - branch `dev`
  - D1 binding: dev DB
  - `CF_ACCESS_AUD`
  - `CF_ACCESS_TEAM_DOMAIN`
  - `SESSION_COOKIE_SECRET`
- prod project
  - branch `main`
  - D1 binding: prod DB
  - `CF_ACCESS_AUD`
  - `CF_ACCESS_TEAM_DOMAIN`
  - `SESSION_COOKIE_SECRET`
