<svelte:head>
  <title>Schale Ledger</title>
</svelte:head>

<script lang="ts">
  import { Badge, Button, Card, StatCard } from "@schale-ledger/ui";

  const message = "Workers + D1 migration in progress";
</script>

<main class="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
  <section class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-2">
        <Badge>Mission Control</Badge>
        <h1 class="text-4xl font-semibold tracking-tight">Schale Ledger</h1>
        <p class="max-w-2xl text-sm text-[var(--color-muted-foreground)]">{message}</p>
      </div>

      <Button>Open dashboard</Button>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <StatCard label="Students" value="0" description="Imported roster will appear here" />
      <StatCard label="Teams" value="0" description="Saved teams will appear here" />
      <StatCard label="Readiness" value="WIP" description="UI primitives are now wired into the app" />
    </div>

    <Card title="Scaffold status" description="Tailwind v4 and the shared UI package are connected.">
      <p class="text-sm text-[var(--color-muted-foreground)]">
        Next tasks will replace this placeholder with dashboard data, auth, and D1-backed features.
      </p>
    </Card>
  </section>
</main>
