<script lang="ts">
	import { Label as BitsLabel } from "bits-ui";
	import { cn } from "$lib/utils.js";

	import type { Snippet } from "svelte";

	let { class: className = "", children, ...restProps }: { class?: string, children?: Snippet } & Record<string, any> = $props();
</script>

<BitsLabel.Root
	class={cn(
		"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</BitsLabel.Root>
