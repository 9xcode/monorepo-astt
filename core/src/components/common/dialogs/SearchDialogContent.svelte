<script lang="ts">
  import * as Command from "$lib/components/ui/command";
  import { iconMap, Calculator } from "$lib/icons";
  import { ChevronRight } from '@lucide/svelte';

  import SearchResultsSkeleton from "../ui/skeletons/SearchResultsSkeleton.svelte";
  import { siteConfig } from 'virtual:site-config';
  import { toolsStore, blogsStore, fetchTools, fetchBlogs } from "../../../utils/searchStore.svelte";

  type Tool = typeof toolsStore.items[number];

  let { open = $bindable(false) } = $props<{ open: boolean }>();

  // Use configured tabs
  const tabsConfig = siteConfig.features.search.showTabs;
  let activeTab = $state<'all' | 'tool' | 'blog'>(
    siteConfig.features.search.defaultTab === 'tools' ? 'tool' : siteConfig.features.search.defaultTab as any
  );

  // Trigger shared fetch functions — no-ops if data is already loaded.
  $effect(() => {
    if (!open) return;

    if (activeTab === 'all' || activeTab === 'tool') fetchTools();
    if (activeTab === 'all' || activeTab === 'blog') fetchBlogs();
  });

  // Derived views reading directly from the shared store
  let currentTools = $derived.by(() => {
    if (activeTab === 'all') return [...toolsStore.items, ...blogsStore.items];
    if (activeTab === 'tool') return toolsStore.items;
    return blogsStore.items;
  });

  let isCurrentlyLoading = $derived.by(() => {
    if (activeTab === 'all') return toolsStore.status === 'loading' || blogsStore.status === 'loading';
    if (activeTab === 'tool') return toolsStore.status === 'loading';
    return blogsStore.status === 'loading';
  });

  let isCurrentlyError = $derived.by(() => {
    if (activeTab === 'all') return toolsStore.status === 'error' || blogsStore.status === 'error';
    if (activeTab === 'tool') return toolsStore.status === 'error';
    return blogsStore.status === 'error';
  });

  let groupedTools = $derived.by(() => {
    const groups: Record<string, Tool[]> = {};
    for (const tool of currentTools) {
      const cat = tool.data.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(tool);
    }
    return groups;
  });

  const availableTabs = [
    ...(tabsConfig.all ? ['all'] as const : []),
    ...(tabsConfig.tools ? ['tool'] as const : []),
    ...(tabsConfig.blog && siteConfig.features.blog.enabled ? ['blog'] as const : [])
  ];
</script>

<Command.Dialog bind:open>
  <Command.Input aria-label="Search tools and articles" placeholder="Search tools, calculators, articles..." />

  {#if availableTabs.length > 1}
    <div class="flex items-center gap-1.5 px-3 pt-2 pb-1 border-b border-border/40">
      {#each availableTabs as tab (tab)}
        <button
          type="button"
          onclick={() => activeTab = tab}
          class="px-3 py-1 rounded-full text-xs font-medium transition-colors
            {activeTab === tab
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'}"
        >
          {tab === 'all' ? 'All' : tab === 'tool' ? 'Tools' : 'Blog'}
        </button>
      {/each}
    </div>
  {/if}

  <Command.List class="max-h-[60dvh] sm:max-h-[500px] overflow-y-auto overflow-x-hidden p-3">
    {#if isCurrentlyLoading}
      <SearchResultsSkeleton />

    {:else if isCurrentlyError && currentTools.length === 0}
      <div class="py-10 text-center text-sm text-destructive">
        Failed to load results. Please try again.
      </div>

    {:else}
      <Command.Empty class="py-10 text-center text-sm text-muted-foreground">
        No results found for your search.
      </Command.Empty>

      {#each Object.entries(groupedTools) as [category, categoryTools] (category)}
        <Command.Group heading={category}>
          {#each categoryTools as tool (tool.slug + '-' + tool.type)}
            {@const ToolIcon = tool.data.icon ? (iconMap[tool.data.icon] ?? Calculator) : Calculator}
            {@const searchKeywords = [...(tool.data.tags ?? [])]}
            <Command.Item
              value={tool.data.title}
              keywords={searchKeywords}
              class="group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer my-1 transition-colors hover:bg-accent"
              onSelect={() => {
                open = false;
                window.location.href = tool.href;
              }}
            >
              <div class="flex size-10 items-center justify-center rounded-lg {tool.type === 'blog' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'} flex-shrink-0">
                {#if tool.type === 'blog'}
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                {:else}
                  <ToolIcon class="h-5 w-5" />
                {/if}
              </div>

              <div class="flex flex-col flex-1 gap-0.5 overflow-hidden">
                <span class="font-semibold text-foreground truncate">{tool.data.title}</span>
                <span class="text-xs text-muted-foreground truncate">{tool.data.description}</span>
              </div>

              <div class="opacity-0 group-aria-selected:opacity-100 -translate-x-2 group-aria-selected:translate-x-0 transition-all duration-300">
                <ChevronRight class="size-4 text-muted-foreground" />
              </div>
            </Command.Item>
          {/each}
        </Command.Group>
      {/each}
    {/if}
  </Command.List>

  <div class="hidden sm:flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
    <div class="flex items-center gap-3">
      <span class="flex items-center gap-1">
        <kbd class="rounded bg-background border border-border/60 px-1 font-sans shadow-sm">↑</kbd>
        <kbd class="rounded bg-background border border-border/60 px-1 font-sans shadow-sm">↓</kbd>
        to navigate
      </span>
      <span class="flex items-center gap-1">
        <kbd class="rounded bg-background border border-border/60 px-1 font-sans shadow-sm">↵</kbd>
        to select
      </span>
    </div>
    <span class="flex items-center gap-1">
      <kbd class="rounded bg-background border border-border/60 px-1 font-sans shadow-sm">esc</kbd>
      to close
    </span>
  </div>
</Command.Dialog>
