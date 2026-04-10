<script lang="ts">
  import { cn } from "../utils";
  import { createEventDispatcher } from "svelte";

  export let tabs: Array<{ id: string; label: string }> = [];
  export let active = "";

  const dispatch = createEventDispatcher<{ select: { id: string } }>();
</script>

<div class={cn("inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-1", $$props.class)} role="tablist" {...$$restProps}>
  {#each tabs as tab}
    <button
      type="button"
      role="tab"
      aria-selected={active === tab.id}
      class={cn("rounded-lg px-3 py-1.5 text-sm", active === tab.id ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]" : "text-[var(--color-muted-foreground)]")}
      on:click={() => dispatch("select", { id: tab.id })}
    >
      {tab.label}
    </button>
  {/each}
</div>
