# Workers / Wrangler operations

Deploy model:
- primary deploy path: Cloudflare Workers Git integration
- branch mapping: `dev` -> dev, `main` -> prod
- GitHub Actions: CI-only
- migrations: manual
- Cloudflare Dashboard is the source of truth for runtime env/secrets
- prod uses the top-level Wrangler config, dev uses `env.dev`

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
bun run --cwd ./packages/db migrate:remote:dev
bun run --cwd ./packages/db migrate:remote:prod
```

## Cloudflare Dashboard deploy command values

- prod: `bunx wrangler deploy --config apps/web/wrangler.jsonc --keep-vars`
- dev: `bunx wrangler deploy --config apps/web/wrangler.jsonc --env dev --keep-vars`

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
