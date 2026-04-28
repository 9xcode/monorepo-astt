<script lang="ts">
	import { type ButtonProps, buttonVariants } from "./index";
	import { cn } from "$lib/utils.js";
	import { Button as BitsButton } from "bits-ui";

	let {
		class: className,
		variant = "default",
		size = "default",
		children,
		href,
		type = "button",
		...restProps
	}: ButtonProps & { children?: any, href?: string, type?: "button" | "submit" | "reset" } = $props();
</script>

{#if href}
	<a href={href} class={cn(buttonVariants({ variant, size, className }))} {...restProps}>
		{@render children?.()}
	</a>
{:else}
	<BitsButton.Root
		class={cn(buttonVariants({ variant, size, className }))}
		type={type}
		{...restProps}
	>
		{@render children?.()}
	</BitsButton.Root>
{/if}
