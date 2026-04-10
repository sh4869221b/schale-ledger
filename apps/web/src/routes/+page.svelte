<svelte:head>
  <title>Schale Ledger</title>
</svelte:head>

<script lang="ts">
  import { Badge, Card, StatCard } from "@schale-ledger/ui";
  import type { PageData } from "./$types";

  export let data: PageData;

  const pageData = data as {
    dashboard: null | {
      cards: Array<{ label: string; value: string; description: string }>;
      recentTeams: Array<{ teamId: string; name: string; mode: string; memo: string; updatedAt: string }>;
      attentionItems: Array<{ label: string; value: string }>;
    };
  };
</script>

<section class="flex flex-col gap-6">
    <div class="space-y-2">
      <Badge>Mission Control</Badge>
      <h2 class="text-3xl font-semibold tracking-tight">Dashboard</h2>
      <p class="text-sm text-[var(--color-muted-foreground)]">Overview of roster, teams, and follow-up work.</p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      {#each pageData.dashboard?.cards ?? [] as card}
        <StatCard label={card.label} value={card.value} description={card.description} />
      {/each}
    </div>

    <div class="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card title="Recent teams" description="Most recently updated formations for this operator.">
        {#if (pageData.dashboard?.recentTeams ?? []).length === 0}
          <p class="text-sm text-[var(--color-muted-foreground)]">No teams saved yet.</p>
        {:else}
          <div class="space-y-3">
            {#each pageData.dashboard?.recentTeams ?? [] as team}
              <a class="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 transition hover:border-[var(--color-accent)]" href={`/teams/${team.teamId}`}>
                <div>
                  <p class="font-medium">{team.name}</p>
                  <p class="text-sm text-[var(--color-muted-foreground)]">{team.mode} · {team.updatedAt}</p>
                </div>
                <span class="text-sm text-[var(--color-muted-foreground)]">Open</span>
              </a>
            {/each}
          </div>
        {/if}
      </Card>

      <Card title="Attention" description="Short list of follow-up items.">
        <div class="space-y-3">
          {#each pageData.dashboard?.attentionItems ?? [] as item}
            <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3">
              <p class="font-medium">{item.label}</p>
              <p class="text-sm text-[var(--color-muted-foreground)]">{item.value}</p>
            </div>
          {/each}
        </div>
      </Card>
    </div>
</section>
