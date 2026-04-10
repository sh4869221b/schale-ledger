<script lang="ts">
  import Card from "./card.svelte";

  export let open = false;
  export let title = "Sheet";
  export let description = "";
</script>

{#if open}
  <div class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md bg-black/50 p-4" role="presentation">
    <Card {title} class="ml-auto h-full w-full" role="dialog" aria-modal="true" aria-label={title}>
      {#if description}
        <p class="mb-4 text-sm text-[var(--color-muted-foreground)]">{description}</p>
      {/if}
      <slot />
    </Card>
  </div>
{/if}
