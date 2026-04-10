<script lang="ts">
  import Card from "./card.svelte";

  export let label: string;
  export let value: string;
  export let description = "";
</script>

<Card>
  <div class="space-y-2">
    <p class="text-sm text-[var(--color-muted-foreground)]">{label}</p>
    <p class="text-3xl font-semibold tracking-tight">{value}</p>
    {#if description}
      <p class="text-sm text-[var(--color-muted-foreground)]">{description}</p>
    {/if}
  </div>
</Card>
