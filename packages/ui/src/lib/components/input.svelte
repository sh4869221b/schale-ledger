<script lang="ts">
  import { cn } from "../utils";

  export let value = "";
  export let type: "text" | "email" | "number" | "search" = "text";

  function handleInput(event: Event) {
    value = (event.currentTarget as HTMLInputElement).value;
  }
</script>

<input {value} {type} on:input={handleInput} class={cn("flex h-10 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-panel-foreground)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]", $$props.class)} {...$$restProps} />
