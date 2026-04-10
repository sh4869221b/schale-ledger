# Workers + D1 MVP Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `schale-ledger` as a Cloudflare Workers + D1 SvelteKit app with a redesigned Mission Control UI and an MVP feature set.

**Architecture:** Create a new `apps/web` SvelteKit application for Workers, move reusable business rules into `packages/core`, move D1/Drizzle concerns into `packages/db`, and centralize UI primitives in `packages/ui`. Keep the legacy Pages/Neon code in place until the new MVP is verified, then perform a single cutover and remove old infrastructure.

**Tech Stack:** Bun workspaces, SvelteKit, Cloudflare Workers, Cloudflare Vite plugin, Tailwind CSS v4, shadcn-svelte, Drizzle ORM, D1, Cloudflare Access, GitHub Actions

---

## Spec Reference
- Design spec: `docs/superpowers/specs/2026-04-10-workers-d1-redesign-design.md`

## Target File Structure

### Root
- Modify: `package.json` — switch workspace entries from `services/*` to `apps/*`, add root scripts for check/test/build/migrate/deploy.
- Modify: `tsconfig.base.json` — shared compiler options and path aliases for new packages.
- Modify: `.gitignore` — ignore `.superpowers/`, `apps/web/.svelte-kit`, `apps/web/.wrangler`, local D1 artifacts.
- Modify: `README.md` — rewrite setup/build/deploy docs after cutover.

### Application
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/svelte.config.js`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/wrangler.jsonc`
- Create: `apps/web/src/app.html`
- Create: `apps/web/src/app.d.ts`
- Create: `apps/web/src/app.css`
- Create: `apps/web/src/hooks.server.ts`
- Create: `apps/web/src/lib/server/auth/access.ts`
- Create: `apps/web/src/lib/server/auth/access.test.ts`
- Create: `apps/web/src/lib/server/auth/session.ts`
- Create: `apps/web/src/lib/server/auth/require-user.ts`
- Create: `apps/web/src/lib/server/db.ts`
- Create: `apps/web/src/lib/features/dashboard/get-dashboard.ts`
- Create: `apps/web/src/lib/features/students/get-students.ts`
- Create: `apps/web/src/lib/features/students/get-student-detail.ts`
- Create: `apps/web/src/lib/features/progress/save-progress.ts`
- Create: `apps/web/src/lib/features/teams/get-teams.ts`
- Create: `apps/web/src/lib/features/teams/save-team.ts`
- Create: `apps/web/src/routes/+layout.server.ts`
- Create: `apps/web/src/routes/+layout.svelte`
- Create: `apps/web/src/routes/+page.server.ts`
- Create: `apps/web/src/routes/+page.svelte`
- Create: `apps/web/src/routes/students/+page.server.ts`
- Create: `apps/web/src/routes/students/+page.svelte`
- Create: `apps/web/src/routes/students/[studentId]/+page.server.ts`
- Create: `apps/web/src/routes/students/[studentId]/+page.svelte`
- Create: `apps/web/src/routes/teams/+page.server.ts`
- Create: `apps/web/src/routes/teams/+page.svelte`
- Create: `apps/web/src/routes/teams/[teamId]/+page.server.ts`
- Create: `apps/web/src/routes/teams/[teamId]/+page.svelte`
- Create: `apps/web/src/routes/logout/+server.ts`
- Create: `apps/web/src/routes/api/teams/[teamId]/+server.ts` (only if needed in Task 9)

### Shared Packages
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/src/students.ts`
- Create: `packages/core/src/progress.ts`
- Create: `packages/core/src/teams.ts`
- Create: `packages/core/src/dashboard.ts`
- Create: `packages/core/src/errors.ts`
- Create: `packages/core/src/validation.ts`
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/drizzle.config.ts`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/schema.ts`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/repositories/users.ts`
- Create: `packages/db/src/repositories/students.ts`
- Create: `packages/db/src/repositories/progress.ts`
- Create: `packages/db/src/repositories/teams.ts`
- Create: `packages/db/migrations/0001_initial.sql`
- Create: `packages/db/migrations/0002_seed_rules.sql`
- Create: `packages/db/migrations/0003_seed_students.sql`
- Create: `packages/db/seeds/students.json`
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/components.json`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/src/lib/utils.ts`
- Create: `packages/ui/src/lib/components/button.svelte`
- Create: `packages/ui/src/lib/components/card.svelte`
- Create: `packages/ui/src/lib/components/input.svelte`
- Create: `packages/ui/src/lib/components/form.svelte`
- Create: `packages/ui/src/lib/components/dialog.svelte`
- Create: `packages/ui/src/lib/components/sheet.svelte`
- Create: `packages/ui/src/lib/components/tabs.svelte`
- Create: `packages/ui/src/lib/components/table.svelte`
- Create: `packages/ui/src/lib/components/badge.svelte`
- Create: `packages/ui/src/lib/components/command.svelte`
- Create: `packages/ui/src/lib/components/sidebar.svelte`
- Create: `packages/ui/src/lib/components/stat-card.svelte`

### Infrastructure
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy-workers.yml`
- Create: `infrastructure/wrangler/README.md`
- Create: `infrastructure/wrangler/cutover-checklist.md`
- Modify: `docs/cloudflare-setup.md`
- Delete (final task only): `.github/workflows/deploy-cloudflare.yml`

### Legacy Removal Targets (final task only)
- Delete: `services/app/**`
- Delete: `packages/application/**`
- Delete: `packages/contracts/**`
- Delete: `packages/domain/**`
- Delete: `packages/infrastructure/**`
- Delete: `db/**`

### Test Files
- Create: `packages/core/src/students.test.ts`
- Create: `packages/core/src/progress.test.ts`
- Create: `packages/core/src/teams.test.ts`
- Create: `packages/core/src/dashboard.test.ts`
- Create: `packages/db/src/schema.test.ts`
- Create: `apps/web/src/lib/server/auth/access.test.ts`
- Create: `apps/web/src/lib/server/auth/session.test.ts`
- Create: `apps/web/src/lib/features/dashboard/get-dashboard.test.ts`
- Create: `apps/web/src/lib/features/students/get-students.test.ts`
- Create: `apps/web/src/lib/features/progress/save-progress.test.ts`
- Create: `apps/web/src/lib/features/teams/save-team.test.ts`

## Commit Policy
- Every task below ends with its own commit.
- Keep commits focused: workspace, db, auth, UI, CI, and cleanup should not be mixed unless the task explicitly says so.
- Do not amend old commits during execution unless a formatter/hook modifies files in the just-created commit.

### Task 1: Scaffold the new workspace and Workers app

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.base.json`
- Modify: `.gitignore`
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/svelte.config.js`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/wrangler.jsonc`
- Create: `apps/web/src/app.html`
- Create: `apps/web/src/app.d.ts`
- Create: `apps/web/src/routes/+layout.svelte`
- Create: `apps/web/src/routes/+page.svelte`

- [ ] **Step 1: Switch the root workspace to the new layout**

Update root `package.json` to use `apps/*` and `packages/*`, and add scripts like:

```json
{
  "scripts": {
    "dev": "bun --filter @schale-ledger/web run dev",
    "check": "bun --filter @schale-ledger/web run check",
    "build": "bun --filter @schale-ledger/web run build",
    "test": "bun test",
    "db:migrate:local": "bun --filter @schale-ledger/db run migrate:local",
    "deploy:dev": "bun --filter @schale-ledger/web run deploy:dev",
    "deploy:prod": "bun --filter @schale-ledger/web run deploy:prod"
  }
}
```

- [ ] **Step 2: Create the minimal Workers-compatible SvelteKit app**

`apps/web/package.json` should declare the new app and include the base runtime pieces:

```json
{
  "name": "@schale-ledger/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "svelte-kit sync && vite build",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "deploy:dev": "wrangler deploy --env dev",
    "deploy:prod": "wrangler deploy --env prod"
  }
}
```

- [ ] **Step 3: Wire SvelteKit to Cloudflare Workers with explicit adapter/plugin choices**

Use `cloudflare()` from `@cloudflare/vite-plugin` in `apps/web/vite.config.ts`, and use `@sveltejs/adapter-cloudflare` in `apps/web/svelte.config.js`.

`apps/web/svelte.config.js` should look like:

```js
import adapter from "@sveltejs/adapter-cloudflare";

const config = {
  kit: {
    adapter: adapter()
  }
};

export default config;
```

`apps/web/wrangler.jsonc` should include placeholder `d1_databases`, `vars.CF_ACCESS_AUD`, and `vars.CF_ACCESS_TEAM_DOMAIN` entries for `dev` and `prod`.

- [ ] **Step 4: Add a smoke page and verify the new app builds**

Run: `bun install && bun --filter @schale-ledger/web run check && bun --filter @schale-ledger/web run build`

Expected: install succeeds, `svelte-check` exits 0, and Vite produces a Worker build for `apps/web`.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.base.json .gitignore apps/web
git commit -m "feat: scaffold workers-based web app"
```

### Task 2: Add Tailwind v4, shadcn-svelte, and shared UI primitives

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/src/app.css`
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/components.json`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/src/lib/utils.ts`
- Create: `packages/ui/src/lib/components/button.svelte`
- Create: `packages/ui/src/lib/components/card.svelte`
- Create: `packages/ui/src/lib/components/input.svelte`
- Create: `packages/ui/src/lib/components/form.svelte`
- Create: `packages/ui/src/lib/components/dialog.svelte`
- Create: `packages/ui/src/lib/components/sheet.svelte`
- Create: `packages/ui/src/lib/components/tabs.svelte`
- Create: `packages/ui/src/lib/components/table.svelte`
- Create: `packages/ui/src/lib/components/badge.svelte`
- Create: `packages/ui/src/lib/components/command.svelte`
- Create: `packages/ui/src/lib/components/sidebar.svelte`
- Create: `packages/ui/src/lib/components/stat-card.svelte`
- Test: `packages/ui/src/lib/utils.test.ts`

- [ ] **Step 1: Write a failing utility test for shared class merging**

```ts
import { expect, test } from "bun:test";
import { cn } from "./utils";

test("cn merges falsy and duplicate classes", () => {
  expect(cn("px-2", false && "hidden", "px-2", "py-1")).toBe("px-2 py-1");
});
```

- [ ] **Step 2: Run the utility test and verify it fails**

Run: `bun test packages/ui/src/lib/utils.test.ts`

Expected: FAIL because `cn` and the package files do not exist yet.

- [ ] **Step 3: Implement Tailwind v4 and the first UI package primitives**

`apps/web/src/app.css` should import Tailwind v4 directly:

```css
@import "tailwindcss";

@theme {
  --color-background: oklch(0.17 0.02 255);
  --color-panel: oklch(0.24 0.03 255);
  --color-accent: oklch(0.72 0.17 235);
}
```

Initialize shadcn-svelte so generated primitives land in `packages/ui/src/lib/components`, then implement/export `Button`, `Card`, `Input`, `Form`, `Dialog`, `Sheet`, `Tabs`, `Table`, `Badge`, `Command`, `Sidebar`, and `StatCard`.

- [ ] **Step 4: Verify the UI package and app compile**

Run: `bun test packages/ui/src/lib/utils.test.ts && bun --filter @schale-ledger/web run check`

Expected: the utility test passes and `apps/web` compiles with Tailwind classes and package imports.

- [ ] **Step 5: Commit**

```bash
git add apps/web/package.json apps/web/src/app.css packages/ui
git commit -m "feat: add tailwind and shared ui primitives"
```

### Task 3: Build the D1 + Drizzle package and local migration flow

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/drizzle.config.ts`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/schema.ts`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/repositories/users.ts`
- Create: `packages/db/src/repositories/students.ts`
- Create: `packages/db/src/repositories/progress.ts`
- Create: `packages/db/src/repositories/teams.ts`
- Create: `packages/db/migrations/0001_initial.sql`
- Create: `packages/db/migrations/0002_seed_rules.sql`
- Create: `packages/db/migrations/0003_seed_students.sql`
- Create: `packages/db/seeds/students.json`
- Modify: `apps/web/wrangler.jsonc`
- Test: `packages/db/src/schema.test.ts`

- [ ] **Step 1: Write a failing schema test for the D1 data model**

```ts
import { expect, test } from "bun:test";
import { tableNames } from "./schema";

test("schema exposes MVP tables including sessions", () => {
  expect(tableNames).toEqual([
    "users",
    "sessions",
    "students",
    "student_progress",
    "teams",
    "team_members"
  ]);
});
```

- [ ] **Step 2: Run the schema test and verify it fails**

Run: `bun test packages/db/src/schema.test.ts`

Expected: FAIL because the D1 schema package does not exist yet.

- [ ] **Step 3: Implement the D1 schema, repository shell, and migrations**

Use `sqliteTable` definitions in `packages/db/src/schema.ts`, including `sessions` for cookie-backed auth:

```ts
export const sessions = sqliteTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});
```

Also add `createDb(env.DB)` in `packages/db/src/client.ts` and local migration scripts in `packages/db/package.json` using Wrangler/D1.

- [ ] **Step 4: Verify the schema tests and local migrations**

Run: `bun test packages/db/src/schema.test.ts && bun run db:migrate:local`

Expected: schema test passes and a fresh local D1 database accepts all migrations without Postgres-only SQL errors.

- [ ] **Step 5: Commit**

```bash
git add packages/db apps/web/wrangler.jsonc package.json
git commit -m "feat: add drizzle d1 foundation"
```

### Task 4: Rebuild the core business package for MVP rules

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/src/students.ts`
- Create: `packages/core/src/progress.ts`
- Create: `packages/core/src/teams.ts`
- Create: `packages/core/src/dashboard.ts`
- Create: `packages/core/src/errors.ts`
- Create: `packages/core/src/validation.ts`
- Test: `packages/core/src/students.test.ts`
- Test: `packages/core/src/progress.test.ts`
- Test: `packages/core/src/teams.test.ts`
- Test: `packages/core/src/dashboard.test.ts`

- [ ] **Step 1: Write failing unit tests for students, progress, teams, and dashboard rules**

```ts
import { expect, test } from "bun:test";
import { clampProgressInput, normalizeTeamMembers, sortStudentsByName, toDashboardCards } from "./index";

test("sortStudentsByName sorts by localized display name", () => {
  expect(sortStudentsByName([{ name: "Shiroko" }, { name: "Aru" }]).map((student) => student.name))
    .toEqual(["Aru", "Shiroko"]);
});

test("clampProgressInput clamps level and memo", () => {
  expect(clampProgressInput({ level: 999, memo: undefined }).level).toBeLessThanOrEqual(100);
});

test("normalizeTeamMembers removes empty slots and keeps order", () => {
  expect(normalizeTeamMembers(["a", "", "b"]))
    .toEqual([{ position: 0, studentId: "a" }, { position: 2, studentId: "b" }]);
});

test("toDashboardCards creates stable summary labels", () => {
  expect(toDashboardCards({ studentCount: 10, teamCount: 2, overdueCount: 1 })[0].label).toBe("Students");
});
```

- [ ] **Step 2: Run the unit tests and verify they fail**

Run: `bun test packages/core/src/*.test.ts`

Expected: FAIL because the package APIs do not exist yet.

- [ ] **Step 3: Implement minimal business logic for students, progress, teams, and dashboard summaries**

Keep `packages/core` HTTP-free and DB-free. Export Zod-based validation helpers, normalization functions, and summary mappers only.

- [ ] **Step 4: Run the core test suite**

Run: `bun test packages/core/src/*.test.ts`

Expected: PASS for all MVP rule tests.

- [ ] **Step 5: Commit**

```bash
git add packages/core
git commit -m "feat: rebuild core mvp business rules"
```

### Task 5: Implement Workers-native auth and session management

**Files:**
- Create: `apps/web/src/hooks.server.ts`
- Create: `apps/web/src/lib/server/auth/access.ts`
- Create: `apps/web/src/lib/server/auth/access.test.ts`
- Create: `apps/web/src/lib/server/auth/session.ts`
- Create: `apps/web/src/lib/server/auth/require-user.ts`
- Create: `apps/web/src/lib/server/db.ts`
- Create: `apps/web/src/routes/logout/+server.ts`
- Modify: `apps/web/src/app.d.ts`
- Modify: `packages/db/src/repositories/users.ts`
- Modify: `apps/web/wrangler.jsonc`
- Test: `apps/web/src/lib/server/auth/access.test.ts`
- Test: `apps/web/src/lib/server/auth/session.test.ts`

- [ ] **Step 1: Write failing auth tests for Access JWT verification, session reuse, and logout**

```ts
import { expect, test } from "bun:test";
import { verifyAccessJwt } from "./access";
import { resolveRequestUser } from "./session";

test("verifyAccessJwt rejects tokens with the wrong audience", async () => {
  await expect(verifyAccessJwt("bad-token", {
    teamDomain: "example.cloudflareaccess.com",
    audience: "expected-aud"
  })).rejects.toThrow("invalid access token");
});

test("resolveRequestUser reuses a valid session cookie before re-reading access headers", async () => {
  const result = await resolveRequestUser({
    cookies: { get: (name: string) => name === "session" ? "sess_123" : undefined },
    headers: new Headers()
  } as never);

  expect(result.sessionId).toBe("sess_123");
});

test("logout clears the session cookie", async () => {
  const response = new Response();
  response.headers.set("set-cookie", "session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax");
  expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
});
```

- [ ] **Step 2: Run the auth test and verify it fails**

Run: `bun test apps/web/src/lib/server/auth/session.test.ts`

Expected: FAIL because `resolveRequestUser` and the auth layer do not exist yet.

- [ ] **Step 3: Implement Access verification, session issuance, rolling refresh, logout, and locals population**

Required behavior:
- If a valid `session` cookie exists, load the user from D1.
- Else, verify `cf-access-jwt-assertion` with `jose` against `https://${CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`, upsert the user, create a session row, and issue a secure cookie.
- Refresh the session expiry on authenticated requests before the expiry window closes.
- Store `event.locals.user` and `event.locals.session` in `hooks.server.ts`.
- Use cookie flags `httpOnly: true`, `secure: true`, `sameSite: "lax"`, `path: "/"`.
- `/logout` must invalidate the D1 session row and expire the cookie.

- [ ] **Step 4: Verify auth behavior, session refresh, logout, and app type safety**

Run: `bun test apps/web/src/lib/server/auth/access.test.ts apps/web/src/lib/server/auth/session.test.ts && bun --filter @schale-ledger/web run check`

Expected: Access verification tests pass, session refresh and logout paths are covered, and `App.Locals` is typed correctly.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/hooks.server.ts apps/web/src/lib/server/auth apps/web/src/lib/server/db.ts apps/web/src/routes/logout/+server.ts apps/web/src/app.d.ts apps/web/wrangler.jsonc packages/db/src/repositories/users.ts
git commit -m "feat: add workers auth and session handling"
```

### Task 6: Build the Mission Control app shell and dashboard

**Files:**
- Create: `apps/web/src/lib/features/dashboard/get-dashboard.ts`
- Create: `apps/web/src/lib/features/dashboard/get-dashboard.test.ts`
- Create: `apps/web/src/routes/+layout.server.ts`
- Create: `apps/web/src/routes/+layout.svelte`
- Create: `apps/web/src/routes/+page.server.ts`
- Create: `apps/web/src/routes/+page.svelte`
- Modify: `packages/ui/src/lib/components/sidebar.svelte`
- Modify: `packages/ui/src/lib/components/stat-card.svelte`

- [ ] **Step 1: Write a failing dashboard aggregation test**

```ts
import { expect, test } from "bun:test";
import { toDashboardModel } from "./get-dashboard";

test("toDashboardModel creates summary cards and recent team sections", () => {
  const model = toDashboardModel({ studentCount: 3, activeTeams: 2, overdueProgress: 1 });
  expect(model.cards).toHaveLength(3);
  expect(model.cards[0].label).toBe("Students");
});
```

- [ ] **Step 2: Run the dashboard test and verify it fails**

Run: `bun test apps/web/src/lib/features/dashboard/get-dashboard.test.ts`

Expected: FAIL because the dashboard model mapper does not exist yet.

- [ ] **Step 3: Implement the authenticated app shell and dashboard route**

`+layout.server.ts` should redirect anonymous users, load sidebar navigation, and expose the signed-in user. `+page.server.ts` should call `get-dashboard.ts` and return Mission Control summary sections.

- [ ] **Step 4: Verify dashboard tests and app compilation**

Run: `bun test apps/web/src/lib/features/dashboard/get-dashboard.test.ts && bun --filter @schale-ledger/web run check && bun --filter @schale-ledger/web run build`

Expected: the dashboard tests pass and the dashboard route builds successfully.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/features/dashboard apps/web/src/routes/+layout.server.ts apps/web/src/routes/+layout.svelte apps/web/src/routes/+page.server.ts apps/web/src/routes/+page.svelte packages/ui/src/lib/components/sidebar.svelte packages/ui/src/lib/components/stat-card.svelte
git commit -m "feat: add mission control dashboard shell"
```

### Task 7: Implement students list and detail flows

**Files:**
- Create: `apps/web/src/lib/features/students/get-students.ts`
- Create: `apps/web/src/lib/features/students/get-student-detail.ts`
- Create: `apps/web/src/lib/features/students/get-students.test.ts`
- Create: `apps/web/src/routes/students/+page.server.ts`
- Create: `apps/web/src/routes/students/+page.svelte`
- Create: `apps/web/src/routes/students/[studentId]/+page.server.ts`
- Create: `apps/web/src/routes/students/[studentId]/+page.svelte`
- Modify: `packages/db/src/repositories/students.ts`

- [ ] **Step 1: Write a failing test for student list filtering**

```ts
import { expect, test } from "bun:test";
import { toStudentListModel } from "./get-students";

test("toStudentListModel preserves query and groups filters", () => {
  const model = toStudentListModel({ q: "Hoshino", students: [] });
  expect(model.query.q).toBe("Hoshino");
});
```

- [ ] **Step 2: Run the student feature test and verify it fails**

Run: `bun test apps/web/src/lib/features/students/get-students.test.ts`

Expected: FAIL because the student feature files do not exist yet.

- [ ] **Step 3: Implement student repositories, list/detail loaders, and pages**

Required behavior:
- `/students` supports `q`, `school`, `role`, `position`, and `page` search params.
- `/students/[studentId]` shows student master data plus the signed-in user's current progress snapshot.
- D1 queries stay simple: filter, sort by name or id, paginate in app code if needed.

- [ ] **Step 4: Verify student tests, route type checks, and build**

Run: `bun test apps/web/src/lib/features/students/get-students.test.ts && bun --filter @schale-ledger/web run check && bun --filter @schale-ledger/web run build`

Expected: PASS for student tests and app build.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/features/students apps/web/src/routes/students packages/db/src/repositories/students.ts
git commit -m "feat: add student explorer screens"
```

### Task 8: Implement progress editing on the student detail flow

**Files:**
- Create: `apps/web/src/lib/features/progress/save-progress.ts`
- Create: `apps/web/src/lib/features/progress/save-progress.test.ts`
- Modify: `apps/web/src/routes/students/[studentId]/+page.server.ts`
- Modify: `apps/web/src/routes/students/[studentId]/+page.svelte`
- Modify: `packages/core/src/progress.ts`
- Modify: `packages/db/src/repositories/progress.ts`

- [ ] **Step 1: Write a failing test for progress normalization and save payload creation**

```ts
import { expect, test } from "bun:test";
import { toProgressMutation } from "./save-progress";

test("toProgressMutation coerces blank memo to empty string", () => {
  expect(toProgressMutation({ memo: "" }).memo).toBe("");
});
```

- [ ] **Step 2: Run the progress feature test and verify it fails**

Run: `bun test apps/web/src/lib/features/progress/save-progress.test.ts`

Expected: FAIL because the save-progress module does not exist yet.

- [ ] **Step 3: Implement the form action and D1 repository write path**

Required behavior:
- `+page.server.ts` exposes a default form action for save.
- Validate with `packages/core` helpers before writing.
- Upsert `student_progress` by `(user_id, student_id)`.
- Return field-level errors for invalid form values.

- [ ] **Step 4: Verify progress tests and page checks**

Run: `bun test apps/web/src/lib/features/progress/save-progress.test.ts && bun --filter @schale-ledger/web run check`

Expected: progress tests pass and the student detail form compiles cleanly.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/features/progress apps/web/src/routes/students/[studentId] packages/core/src/progress.ts packages/db/src/repositories/progress.ts
git commit -m "feat: add student progress editing"
```

### Task 9: Implement teams list and team editing flows

**Files:**
- Create: `apps/web/src/lib/features/teams/get-teams.ts`
- Create: `apps/web/src/lib/features/teams/save-team.ts`
- Create: `apps/web/src/lib/features/teams/save-team.test.ts`
- Create: `apps/web/src/routes/teams/+page.server.ts`
- Create: `apps/web/src/routes/teams/+page.svelte`
- Create: `apps/web/src/routes/teams/[teamId]/+page.server.ts`
- Create: `apps/web/src/routes/teams/[teamId]/+page.svelte`
- Create: `apps/web/src/routes/api/teams/[teamId]/+server.ts` (only if external JSON consumers appear during implementation)
- Modify: `packages/core/src/teams.ts`
- Modify: `packages/db/src/repositories/teams.ts`

- [ ] **Step 1: Write a failing team save test for ordered slots and deduplication**

```ts
import { expect, test } from "bun:test";
import { toTeamMutation } from "./save-team";

test("toTeamMutation preserves slot order", () => {
  const mutation = toTeamMutation({ slots: ["s1", "", "s2"] });
  expect(mutation.members.map((member) => member.position)).toEqual([0, 2]);
});
```

- [ ] **Step 2: Run the team test and verify it fails**

Run: `bun test apps/web/src/lib/features/teams/save-team.test.ts`

Expected: FAIL because the team feature module does not exist yet.

- [ ] **Step 3: Implement list/detail pages, form actions, and repository writes**

Required behavior:
- `/teams` lists the signed-in user's teams with mode, member count, and updated timestamp.
- `/teams/[teamId]` supports create/update of name, memo, and member slots.
- Only add `GET /api/teams/[teamId]` if another consumer actually needs JSON in MVP.

- [ ] **Step 4: Verify team tests and app build**

Run: `bun test apps/web/src/lib/features/teams/save-team.test.ts && bun --filter @schale-ledger/web run check && bun --filter @schale-ledger/web run build`

Expected: PASS for team tests and app build.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/features/teams apps/web/src/routes/teams apps/web/src/routes/api/teams/[teamId]/+server.ts packages/core/src/teams.ts packages/db/src/repositories/teams.ts
git commit -m "feat: add team planner flows"
```

### Task 10: Add CI, Workers deploy flow, and operator documentation

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy-workers.yml`
- Create: `infrastructure/wrangler/README.md`
- Create: `infrastructure/wrangler/cutover-checklist.md`
- Modify: `README.md`
- Modify: `docs/cloudflare-setup.md`
- Modify: `package.json`

- [ ] **Step 1: Write a failing CI expectation by documenting the required commands**

Record the required pipeline sequence in `README.md` and `infrastructure/wrangler/README.md` first:

```md
bun install
bun test
bun run check
bun run build
bun run db:migrate:local
```

This makes the intended CI gate explicit before editing workflow files.

- [ ] **Step 2: Replace the old Pages workflow with Workers CI/deploy workflows**

`ci.yml` should run install, test, check, build, local migration validation, and a second local migration application to confirm idempotent migration tracking. `deploy-workers.yml` should deploy `dev` on `dev` branch and `prod` on `main`, using Worker/D1/Access secrets instead of Neon/Hyperdrive secrets.

- [ ] **Step 3: Rewrite docs and remove legacy Pages/Neon references**

Update `README.md`, `docs/cloudflare-setup.md`, and `infrastructure/wrangler/cutover-checklist.md` to mention Workers, D1, Cloudflare Access, `CF_ACCESS_AUD`, `CF_ACCESS_TEAM_DOMAIN`, and the new workspace paths. Remove references to Pages, Neon, Hyperdrive, and `services/app` from active docs.

- [ ] **Step 4: Verify CI/deploy commands before any destructive cleanup**

Run: `bun test && bun run check && bun run build && bun run db:migrate:local && bun run db:migrate:local && bun --filter @schale-ledger/web run deploy:prod --dry-run`

Expected: CI commands pass, local migrations are repeatable, and the production deploy command resolves configuration without using Pages/Neon artifacts.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows README.md docs/cloudflare-setup.md infrastructure/wrangler/README.md infrastructure/wrangler/cutover-checklist.md package.json
git commit -m "chore: add workers ci and deploy workflow"
```

### Task 11: Perform the final cutover and remove legacy Pages/Neon code

**Files:**
- Delete: `.github/workflows/deploy-cloudflare.yml`
- Delete: `services/app/**`
- Delete: `packages/application/**`
- Delete: `packages/contracts/**`
- Delete: `packages/domain/**`
- Delete: `packages/infrastructure/**`
- Delete: `db/**`
- Modify: `README.md`
- Modify: `docs/cloudflare-setup.md`
- Modify: `infrastructure/wrangler/cutover-checklist.md`

- [ ] **Step 1: Re-run the cutover verification checklist and document the result**

Run: `bun test && bun run check && bun run build && bun run db:migrate:local && bun --filter @schale-ledger/web run deploy:prod --dry-run`

Expected: the new Workers/D1 stack is the only passing implementation path.

- [ ] **Step 2: Verify auth-specific cutover requirements**

Check all of the following before deleting legacy code:
- session bootstrap from `cf-access-jwt-assertion`
- rolling session refresh on authenticated requests
- `/logout` cookie invalidation
- missing/expired session handling

- [ ] **Step 3: Delete legacy Pages/Neon/Hyperdrive code and configs**

Remove the old app, old packages, old db directory, and Pages workflow only after Step 1 and Step 2 are complete.

- [ ] **Step 4: Update operator docs to state that cutover is complete**

Mark `infrastructure/wrangler/cutover-checklist.md` as completed and update `README.md`/`docs/cloudflare-setup.md` so they no longer mention legacy recovery steps as active instructions.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/cloudflare-setup.md infrastructure/wrangler/cutover-checklist.md
git rm -r services/app packages/application packages/contracts packages/domain packages/infrastructure db .github/workflows/deploy-cloudflare.yml
git commit -m "chore: cut over to workers d1 runtime"
```

## Final Verification Checklist
- [ ] `bun install`
- [ ] `bun test`
- [ ] `bun run check`
- [ ] `bun run build`
- [ ] `bun run db:migrate:local`
- [ ] `bun run db:migrate:local` again to confirm migration tracking is stable
- [ ] `bun --filter @schale-ledger/web run deploy:dev` (dry-run or dev env verification as appropriate)
- [ ] `bun --filter @schale-ledger/web run deploy:prod --dry-run`
- [ ] Verify session bootstrap, rolling refresh, expired-session handling, and `/logout`

## Notes for Execution
- Use `@superpowers/subagent-driven-development` if you want one isolated worker per task with reviews between tasks.
- Use `@superpowers/executing-plans` if you want to execute this inline in the current session.
- Do not remove legacy directories before Task 10 Step 4.
- If a task reveals that `GET /api/teams/[teamId]` is unnecessary, skip creating that file and update the task checklist during execution.
