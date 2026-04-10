<script lang="ts">
  import { Badge, Card } from "@schale-ledger/ui";

  export let data: unknown;

  const pageData = data as {
    model: null | {
      teams: Array<{
        teamId: string;
        name: string;
        mode: string;
        memo: string;
        memberCount: number;
        updatedAt: string;
      }>;
    };
  };
</script>

{#if pageData.model}
  <section class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-2">
        <Badge>Teams</Badge>
        <h2 class="text-3xl font-semibold tracking-tight">Team planner</h2>
        <p class="text-sm text-[var(--color-muted-foreground)]">Create and maintain raid / JFD formations.</p>
      </div>

      <form method="POST">
        <button class="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-foreground)]" type="submit">Create team</button>
      </form>
    </div>

    <Card title="Saved teams" description={`${pageData.model.teams.length} teams`}>
      <div class="space-y-3">
        {#if pageData.model.teams.length === 0}
          <p class="text-sm text-[var(--color-muted-foreground)]">No teams saved yet.</p>
        {:else}
          {#each pageData.model.teams as team}
            <a class="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 transition hover:border-[var(--color-accent)]" href={`/teams/${team.teamId}`}>
              <div>
                <p class="font-medium">{team.name}</p>
                <p class="text-sm text-[var(--color-muted-foreground)]">{team.mode} · {team.memberCount} members</p>
              </div>
              <span class="text-sm text-[var(--color-muted-foreground)]">{team.updatedAt}</span>
            </a>
          {/each}
        {/if}
      </div>
    </Card>
  </section>
{/if}
