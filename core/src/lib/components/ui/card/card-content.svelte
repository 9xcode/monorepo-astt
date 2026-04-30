<script lang="ts">
	import { cn } from "$lib/utils.js";

	import type { Snippet } from "svelte";

	let { class: className = "", children, ...restProps }: { class?: string, children?: Snippet } & Record<string, any> = $props();
</script>

<div class={cn("p-6 pt-0", className)} {...restProps}>
	{@render children?.()}
</div>
