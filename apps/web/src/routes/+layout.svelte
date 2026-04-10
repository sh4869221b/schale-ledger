<script lang="ts">
  import "../app.css";
  import { Sidebar, Badge } from "@schale-ledger/ui";
  import type { LayoutData } from "./$types";
  import type { Snippet } from "svelte";

  export let data: LayoutData;
  export let children: Snippet;

  const layoutData = data as {
    navigation: Array<{ href: string; label: string; enabled: boolean }>;
    user: { userId: string; email: string | null };
  };
</script>

<div class="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
  <div class="mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-6">
    <Sidebar>
      <div class="space-y-2">
        <Badge>Mission Control</Badge>
        <div>
          <h1 class="text-lg font-semibold tracking-tight">Schale Ledger</h1>
          <p class="text-sm text-[var(--color-muted-foreground)]">Operators dashboard</p>
        </div>
      </div>

      <nav class="mt-4 flex flex-col gap-2">
        {#each layoutData.navigation as item}
          {#if item.enabled}
            <a class="rounded-lg px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]" href={item.href}>
              {item.label}
            </a>
          {:else}
            <span class="cursor-not-allowed rounded-lg px-3 py-2 text-sm text-[var(--color-muted-foreground)] opacity-50">
              {item.label}
            </span>
          {/if}
        {/each}
      </nav>

      <div class="mt-auto space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] p-3">
        <div>
          <p class="text-sm font-medium">{layoutData.user.email ?? layoutData.user.userId}</p>
          <p class="text-xs text-[var(--color-muted-foreground)]">Authenticated via Cloudflare Access</p>
        </div>
        <a class="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-sm font-medium text-[var(--color-panel-foreground)] transition hover:bg-[var(--color-muted)]" href="/logout">Sign out</a>
      </div>
    </Sidebar>

    <div class="flex min-w-0 flex-1 flex-col gap-6">
      <header class="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-4">
        <p class="text-sm text-[var(--color-muted-foreground)]">Mission Control workspace</p>
      </header>

      {@render children?.()}
    </div>
  </div>
</div>
