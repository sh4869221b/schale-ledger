<script lang="ts">
  import Card from "./card.svelte";

  export let open = false;
  export let title = "Dialog";
  export let description = "";
</script>

{#if open}
  <div class="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation">
    <Card {title} class="w-full max-w-lg" role="dialog" aria-modal="true" aria-label={title}>
      {#if description}
        <p class="mb-4 text-sm text-[var(--color-muted-foreground)]">{description}</p>
      {/if}
      <slot />
    </Card>
  </div>
{/if}
