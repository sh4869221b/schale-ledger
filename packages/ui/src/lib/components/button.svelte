<script lang="ts">
  import { cn } from "../utils";

  export let variant: "primary" | "secondary" = "primary";
  export let type: "button" | "submit" | "reset" = "button";

  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary: "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90",
    secondary: "border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-panel-foreground)] hover:bg-[var(--color-muted)]"
  };
</script>

<button type={type} class={cn(base, variants[variant], $$props.class)} {...$$restProps}>
  <slot />
</button>
