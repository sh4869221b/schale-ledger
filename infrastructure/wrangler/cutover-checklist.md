# Workers + D1 Cutover Checklist

Current status: cutover complete, legacy Pages / Neon code paths should remain removed.

- [ ] `bun install`
- [ ] `bun test`
- [ ] `bun run check`
- [ ] `bun run build`
- [ ] `bun run db:migrate:local`
- [ ] `bun run db:migrate:local` again confirms idempotent migration tracking
- [ ] `bun run --cwd ./apps/web deploy:prod --dry-run` (or equivalent config verification) succeeds
- [ ] Cloudflare Access values are configured for prod
- [ ] D1 prod database id is configured in CI secrets
- [ ] Session cookie secret is configured for prod
- [ ] Workers deployment verified before legacy cleanup
