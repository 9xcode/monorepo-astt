<script lang="ts">
    import { iconMap, Calculator, ArrowRight } from '$lib/icons';
    import CategoryFilter from '../tools-grid/CategoryFilter.svelte';
    import ToolCard from '../tools-grid/ToolCard.svelte';

    interface Tool {
        slug: string;
        data: {
            title: string;
            description: string;
            icon?: string;
            category: string;
            order?: number;
        };
    }

    let {
        tools = [],
        categories = [],
        initialDisplayCount = 0,
        directoryHref = '/categories',
        sectionTitle = '',
        sectionSubtitle = '',
    } = $props<{
        tools: Tool[];
        categories: string[];
        /** 0 = show all. Any positive number limits the initial visible cards with a "Show More" button. */
        initialDisplayCount?: number;
        /** href for the "View All Directory" link. */
        directoryHref?: string;
        /** Optional heading shown above the grid (left on lg, centered on mobile) */
        sectionTitle?: string;
        sectionSubtitle?: string;
    }>();

    let selectedCategory = $state('All Tools');

    const limit = $derived(initialDisplayCount ?? 0);
    const isLimited = $derived(limit > 0);

    // Capture the initial limit as a plain const so Svelte doesn't see a reactive
    // prop reference inside $state() (which would trigger state_referenced_locally).
    // This is intentional: initialDisplayCount is a static siteConfig value that
    // never changes after mount. SSR reads `defaultShowCount` and renders the correct
    // number of visible cards without needing $effect to run.
    // svelte-ignore state_referenced_locally
    const defaultShowCount = initialDisplayCount > 0 ? initialDisplayCount : Infinity;
    let showCount = $state(defaultShowCount);

    $effect(() => {
        // Reset whenever the active category changes so "Show More" resets on filter switch.
        const _ = selectedCategory;
        showCount = defaultShowCount;
    });

    let visibleTools = $derived(
        selectedCategory === 'All Tools'
            ? tools
            : tools.filter((t: Tool) => t.data.category === selectedCategory)
    );

    let hiddenCount = $derived(
        isLimited ? Math.max(0, visibleTools.length - showCount) : 0
    );

    // Show the bottom action bar when: there are hidden tools OR always (for directory link)
    let showActions = $derived(true); // directory button always visible

    function onCategorySelect(category: string) {
        selectedCategory = category;
    }

    function showAll() {
        showCount = Infinity;
    }
</script>

<div class="flex flex-col gap-6 w-full">
    <!-- Header row: title left, filter right on lg -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {#if sectionTitle}
            <div class="text-center lg:text-left shrink-0">
                <h2 class="text-3xl font-bold tracking-tight">{sectionTitle}</h2>
                {#if sectionSubtitle}
                    <p class="text-muted-foreground mt-1">{sectionSubtitle}</p>
                {/if}
            </div>
        {/if}
        <div class="w-full lg:w-auto relative z-20 lg:max-w-[65%]">
            <CategoryFilter {categories} onSelect={onCategorySelect} />
        </div>
    </div>

    <!--
        SEO NOTE: ALL tool cards are rendered into the static HTML by Astro at build time.
        Tools beyond `showCount` get the `tool-hidden` class (display:none).
        Search crawlers see the full DOM — zero SEO impact.
    -->
    <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
        aria-live="polite"
        aria-label="Tool results"
    >
        {#each visibleTools as tool, i (tool.slug)}
            {@const isHidden = isLimited && i >= showCount}
            <ToolCard {tool} {isHidden} />
        {/each}
    </div>

    <!-- Bottom action bar — always visible (directory link), Show More appears when a limit is active -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">

        <!-- Show More — only when there are hidden tools -->
        {#if isLimited && hiddenCount > 0}
            <button
                onclick={showAll}
                class="action-btn action-btn--primary w-full sm:w-auto"
            >
                Show {hiddenCount} more tool{hiddenCount === 1 ? '' : 's'}
                <ArrowRight class="size-4 rotate-90" />
            </button>
        {/if}

        <!-- View All Directory — always visible -->
        <a
            href={directoryHref}
            class="action-btn action-btn--ghost w-full sm:w-auto"
        >
            Browse All Categories
            <ArrowRight class="size-4" />
        </a>

    </div>
</div>

<style>
    /* Shared base for both action buttons */
    .action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        padding: 0.625rem 1.375rem;
        border-radius: var(--radius);
        font-size: 0.875rem;
        font-weight: 600;
        transition: all 0.2s ease;
        cursor: pointer;
        text-decoration: none;
        white-space: nowrap;
    }

    /* Primary — Show More (filled, prominent) */
    .action-btn--primary {
        background-color: var(--primary);
        color: var(--primary-foreground);
        border: 1px solid transparent;
        box-shadow: 0 1px 4px color-mix(in oklch, var(--primary) 25%, transparent);
    }
    .action-btn--primary:hover {
        background-color: color-mix(in oklch, var(--primary) 88%, transparent);
        box-shadow: 0 4px 12px color-mix(in oklch, var(--primary) 30%, transparent);
        transform: translateY(-1px);
    }

    /* Ghost — Directory link (subtle, secondary) */
    .action-btn--ghost {
        background-color: color-mix(in oklch, var(--background) 80%, transparent);
        color: var(--muted-foreground);
        border: 1px solid color-mix(in oklch, var(--border) 70%, transparent);
        backdrop-filter: blur(8px);
    }
    .action-btn--ghost:hover {
        border-color: color-mix(in oklch, var(--primary) 50%, transparent);
        color: var(--primary);
        background-color: color-mix(in oklch, var(--accent) 50%, transparent);
        transform: translateY(-1px);
    }
</style>
