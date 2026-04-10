# Workers + D1 Cutover Checklist

Current status: cutover complete, legacy Pages / Neon code paths should remain removed.

Deploy model:
- primary deploy path: Cloudflare Workers Git integration
- branch mapping: `dev` -> dev, `main` -> prod
- GitHub Actions: CI-only
- migrations: manual

- [ ] `bun install`
- [ ] `bun test`
- [ ] `bun run check`
- [ ] `bun run build`
- [ ] `bun run db:migrate:local`
- [ ] `bun run db:migrate:local` again confirms idempotent migration tracking
- [ ] Cloudflare dev project tracks `dev`
- [ ] Cloudflare prod project tracks `main`
- [ ] root directory is repository root in both projects
- [ ] build command is `bun install && bun run build` in both projects
- [ ] Cloudflare Access values are configured for each project
- [ ] D1 binding is configured for each project
- [ ] Session cookie secret is configured for each project
