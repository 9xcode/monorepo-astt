<script lang="ts">
    let { categories = [], onSelect }: { categories: string[]; onSelect?: (category: string) => void } = $props();

    let selectedCategory = $state('All Tools');
    let scrollContainer = $state<HTMLElement | null>(null);

    // Add "All Tools" to the front of the categories list
    let allCategories = $derived(['All Tools', ...categories]);

    function selectCategory(category: string, event: MouseEvent) {
        selectedCategory = category;

        // Auto scroll to center the selected category
        const button = event.currentTarget as HTMLButtonElement;
        if (button && scrollContainer) {
            button.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }

        // Invoke callback if provided (Svelte-native approach)
        onSelect?.(category);
    }
</script>

<div class="w-full overflow-hidden relative">
    <div bind:this={scrollContainer} class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x relative">
        {#each allCategories as category (category)}
            <button
                type="button"
                class="snap-start shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border
                {selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 border-transparent'
                    : 'bg-background hover:bg-accent hover:text-accent-foreground border-border/50 text-muted-foreground'}"
                onclick={(e) => selectCategory(category, e)}
            >
                {category}
            </button>
        {/each}
    </div>
</div>
