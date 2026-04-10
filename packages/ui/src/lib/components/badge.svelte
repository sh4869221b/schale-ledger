<script lang="ts">
  import { cn } from "../utils";
</script>

<span class={cn("inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-muted)] px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]", $$props.class)} {...$$restProps}>
  <slot />
</span>
