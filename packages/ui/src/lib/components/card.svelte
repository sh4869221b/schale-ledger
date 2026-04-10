<script lang="ts">
  import { cn } from "../utils";

  export let title = "";
  export let description = "";
</script>

<section class={cn("rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-5 text-[var(--color-panel-foreground)] shadow-sm", $$props.class)} {...$$restProps}>
  {#if title}
    <header class="mb-4 space-y-1">
      <h2 class="text-lg font-semibold tracking-tight">{title}</h2>
      {#if description}
        <p class="text-sm text-[var(--color-muted-foreground)]">{description}</p>
      {/if}
    </header>
  {/if}

  <slot />
</section>
