# Workers / Wrangler operations

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

## Deploy commands

```bash
bun run deploy:dev
bun run deploy:prod
```

## Required GitHub secrets

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID_DEV`
- `CLOUDFLARE_D1_DATABASE_ID_PROD`
- `CF_ACCESS_AUD_DEV`
- `CF_ACCESS_AUD_PROD`
- `CF_ACCESS_TEAM_DOMAIN`
- `SESSION_COOKIE_SECRET_DEV`
- `SESSION_COOKIE_SECRET_PROD`
