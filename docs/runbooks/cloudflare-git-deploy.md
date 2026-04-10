# Cloudflare Git Deploy Runbook

## Goal
- Use Cloudflare Workers Git integration as the primary deploy path.
- Keep branch mapping fixed:
  - `dev` -> dev
  - `main` -> prod

## Cloudflare Workers Project Setup

### Dev project
- project name: `schale-ledger-dev`
- production branch: `dev`
- root directory: repository root
- app directory / deploy target: `apps/web`
- build command: `bun install && bun run build`

### Prod project
- project name: `schale-ledger-prod`
- production branch: `main`
- root directory: repository root
- app directory / deploy target: `apps/web`
- build command: `bun install && bun run build`

## Required project settings

### D1
- dev project -> dev D1 binding
- prod project -> prod D1 binding

### Required environment variables / secrets
- `CF_ACCESS_AUD`
- `CF_ACCESS_TEAM_DOMAIN`
- `SESSION_COOKIE_SECRET`

## Operator checklist

### Dev
- [ ] repository connected
- [ ] branch `dev` selected
- [ ] root directory correct
- [ ] build command correct
- [ ] D1 binding points to dev database
- [ ] `CF_ACCESS_AUD` set
- [ ] `CF_ACCESS_TEAM_DOMAIN` set
- [ ] `SESSION_COOKIE_SECRET` set

### Prod
- [ ] repository connected
- [ ] branch `main` selected
- [ ] root directory correct
- [ ] build command correct
- [ ] D1 binding points to prod database
- [ ] `CF_ACCESS_AUD` set
- [ ] `CF_ACCESS_TEAM_DOMAIN` set
- [ ] `SESSION_COOKIE_SECRET` set

## Manual migration commands
```bash
bun run db:migrate:local
bun run --cwd ./packages/db migrate:dev
bun run --cwd ./packages/db migrate:prod
```

## Done means
- `dev` push deploys to the dev Cloudflare Workers project
- `main` push deploys to the prod Cloudflare Workers project
- GitHub Actions is CI-only
- migration remains manual
