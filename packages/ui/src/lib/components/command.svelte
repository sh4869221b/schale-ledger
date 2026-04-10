<script lang="ts">
  import Input from "./input.svelte";

  export let placeholder = "Search…";
  export let label = "Command menu";
</script>

<div class="rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-panel)] p-3" role="search" aria-label={label}>
  <Input type="search" {placeholder} aria-label={label} />
  <div class="mt-3 text-sm text-[var(--color-muted-foreground)]" role="listbox">
    <slot />
  </div>
</div>
