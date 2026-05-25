<script lang="ts">
  /**
   * UserWorkspace.svelte
   */
  import { Heart, Clock, ArrowRight, ChevronRight } from '@lucide/svelte';
  import { siteConfig } from 'virtual:site-config';

  let {
    tools = [],
    recentStorageKey = "recents",
    favouriteStorageKey = "favourites",
    recentEnabled = true,
    favouriteEnabled = true,
  } = $props<{
    tools: { slug: string; data: { title: string; category?: string } }[];
    recentStorageKey?: string;
    favouriteStorageKey?: string;
    recentEnabled?: boolean;
    favouriteEnabled?: boolean;
  }>();

  // Get configured display limits from config (0 means show all)
  const recentMax = siteConfig.features.recentTools.maxDisplayHomepage ?? 0;
  const favMax = siteConfig.features.favouriteTools.maxDisplayHomepage ?? 0;

  let recentSlugs = $state<string[]>([]);
  let favouriteSlugs = $state<string[]>([]);

  $effect(() => {
    const fullRecentKey = siteConfig.localStoragePrefix + recentStorageKey;
    const fullFavKey = siteConfig.localStoragePrefix + favouriteStorageKey;

    function safeParseArray(val: string | null) {
      if (!val) return [];
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
      } catch {
        return [];
      }
    }

    if (recentEnabled) {
      recentSlugs = safeParseArray(localStorage.getItem(fullRecentKey));
    }
    if (favouriteEnabled) {
      favouriteSlugs = safeParseArray(localStorage.getItem(fullFavKey));
    }

    function onStorage(e: StorageEvent) {
      if (recentEnabled && e.key === fullRecentKey) {
        recentSlugs = safeParseArray(e.newValue);
      }
      if (favouriteEnabled && e.key === fullFavKey) {
        favouriteSlugs = safeParseArray(e.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  });

  type Tool = typeof tools[number];
  let recentTools = $derived(recentSlugs.map((slug) => tools.find((t: Tool) => t.slug === slug)).filter(Boolean) as Tool[]);
  let favouriteTools = $derived(favouriteSlugs.map((slug) => tools.find((t: Tool) => t.slug === slug)).filter(Boolean) as Tool[]);
  
  let showWorkspace = $derived(recentTools.length > 0 || favouriteTools.length > 0);
  let dualMode = $derived((recentEnabled && recentTools.length > 0) && (favouriteEnabled && favouriteTools.length > 0));
</script>

{#if showWorkspace}
  <section class="pt-8 pb-16 relative" id="user-workspace">
    <div class="container mx-auto px-4 space-y-6 relative z-10 w-full">
      
        <div class="space-y-1.5 text-center lg:text-left">
          <h2 class="text-3xl font-extrabold tracking-tight text-foreground">Your Workspace</h2>
          <p class="text-muted-foreground text-base">Quickly access your saved and recently used tools</p>
        </div>

      <div class="grid grid-cols-1 {dualMode ? 'lg:grid-cols-2' : ''} gap-8">
        
        <!-- Recents -->
        {#if recentEnabled && recentTools.length > 0}
          <div class="space-y-4">
            <div class="flex items-center gap-2 px-1">
              <Clock class="size-4.5 text-muted-foreground" />
              <h3 class="font-bold text-base text-foreground tracking-tight">Recently Used</h3>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 {dualMode ? '' : 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'} gap-2 sm:gap-3">
              {#each (recentMax > 0 ? recentTools.slice(0, dualMode ? recentMax : recentMax * 2) : recentTools) as tool (tool.slug)}
                <a href={`/tools/${tool.slug}`} class="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-card border border-border/50 shadow-sm hover:border-border hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <span class="font-semibold text-xs sm:text-sm text-foreground truncate w-full">{tool.data.title}</span>
                  <ChevronRight class="size-3.5 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-foreground transition-all shrink-0 ml-1.5 -mr-0.5" />
                </a>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Saved -->
        {#if favouriteEnabled && favouriteTools.length > 0}
          <div class="space-y-4">
            <div class="flex items-center justify-between px-1">
              <div class="flex items-center gap-2">
                <Heart class="size-4.5 text-primary" fill="currentColor" />
                <h3 class="font-bold text-base text-foreground tracking-tight">Saved Tools</h3>
              </div>
              <span class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary">
                {favouriteTools.length} Saved
              </span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 {dualMode ? '' : 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'} gap-2 sm:gap-3">
              {#each (favMax > 0 ? favouriteTools.slice(0, dualMode ? favMax : favMax * 2) : favouriteTools) as tool (tool.slug)}
                <a href={`/tools/${tool.slug}`} class="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-primary/5 border border-primary/10 shadow-sm hover:border-primary/30 hover:shadow-md hover:bg-primary/10 hover:-translate-y-0.5 transition-all">
                  <span class="font-semibold text-xs sm:text-sm text-foreground truncate w-full">{tool.data.title}</span>
                  <ArrowRight class="size-3 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5 -mr-0.5" />
                </a>
              {/each}
            </div>
          </div>
        {/if}

      </div>
    </div>
  </section>
{/if}
