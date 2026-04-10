<script lang="ts">
  import { cn } from "../utils";

  export let ariaLabel = "Form";
</script>

<form class={cn("space-y-4", $$props.class)} aria-label={ariaLabel} {...$$restProps}>
  <slot />
</form>
