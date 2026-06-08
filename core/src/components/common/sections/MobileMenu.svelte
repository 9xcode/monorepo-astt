<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Menu, X, PlusCircle, Smartphone, Clock, Heart } from '@lucide/svelte';
  import { navIconMap } from "$lib/icons";

  import Logo from "@site-logo";
  import { siteConfig } from 'virtual:site-config';

  let open = $state(false);
  // Only mount the full Dialog content after the first open — avoids
  // rendering the entire sidebar DOM tree on every page load.
  let hasOpened = $state(false);
  $effect(() => { if (open) hasOpened = true; });

  function formatTitle(slug: string) {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // — Personalised sections (Favourites + Recents) —
  const favConfig = siteConfig.features.favouriteTools;
  const recentConfig = siteConfig.features.recentTools;
  
  const recentMax = recentConfig.maxDisplayMobileMenu ?? 6;
  const favMax = favConfig.maxDisplayMobileMenu ?? 6;

  let favouriteSlugs = $state<string[]>([]);
  let recentSlugs = $state<string[]>([]);

  $effect(() => {
    if (favConfig?.enabled && favConfig?.showInMobileMenu) {
      try { favouriteSlugs = JSON.parse(localStorage.getItem(siteConfig.localStoragePrefix + favConfig.storageKey) || "[]"); } catch { favouriteSlugs = []; }
    }
    if (recentConfig?.enabled && recentConfig?.showInMobileMenu) {
      try { recentSlugs = JSON.parse(localStorage.getItem(siteConfig.localStoragePrefix + recentConfig.storageKey) || "[]"); } catch { recentSlugs = []; }
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger
    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 text-muted-foreground hover:text-foreground"
  >
    <Menu class="size-6" />
    <span class="sr-only">Toggle Menu</span>
  </Dialog.Trigger>
  
  <Dialog.Content showCloseButton={false} class="fixed inset-y-0 left-0 w-[85vw] max-w-[320px] rounded-r-3xl border-r border-border/40 bg-background/95 backdrop-blur-sm p-0 shadow-2xl sm:rounded-r-3xl m-0 duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left h-full flex flex-col translate-x-0 translate-y-0 sm:max-w-[320px]">
    {#if hasOpened}
    <div class="flex flex-col h-full overflow-y-auto overflow-x-hidden">
        
        <Dialog.Header class="px-6 py-5 border-b border-border/20 text-left bg-transparent z-10 flex flex-row items-center justify-between space-y-0">
          <div class="flex flex-row items-center gap-3">
              <div class="size-8 rounded-lg bg-primary flex flex-shrink-0 items-center justify-center shadow-md">
                <Logo class="size-5 text-primary-foreground" />
              </div>
              <Dialog.Title class="font-bold text-xl tracking-tight text-foreground">
                  {siteConfig.brand.shortName}
              </Dialog.Title>
          </div>
          <Dialog.Close class="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X class="size-5" />
              <span class="sr-only">Close</span>
          </Dialog.Close>
          <Dialog.Description class="sr-only">Navigation sidebar</Dialog.Description>
        </Dialog.Header>

        <!-- Menu Links -->
        <div class="flex-1 py-6 px-4 overflow-y-auto">
            
            <!-- Personalised: Recent Tools (hidden if empty) -->
            {#if recentConfig?.enabled && recentConfig?.showInMobileMenu && recentSlugs.length > 0}
              <div class="mb-5">
                <div class="flex items-center justify-between mb-2 px-2">
                    <h4 class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Clock class="size-3.5" /> Recently Used
                    </h4>
                </div>
                <!-- 2-Column Mobile Grid -->
                <div class="grid grid-cols-2 gap-1.5 px-1">
                  {#each (recentMax > 0 ? recentSlugs.slice(0, recentMax) : recentSlugs) as slug (slug)}
                    <a
                      href={`/tools/${slug}`}
                      onclick={() => open = false}
                      class="flex flex-col items-start gap-1 py-1.5 px-2.5 rounded-lg bg-card border border-border/50 text-foreground hover:bg-muted/60 active:bg-muted transition-colors shadow-sm"
                    >
                        <span class="text-[11px] font-semibold text-foreground/80 truncate w-full">{formatTitle(slug)}</span>
                    </a>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Personalised: Favourite Tools (hidden if empty) -->
            {#if favConfig?.enabled && favConfig?.showInMobileMenu && favouriteSlugs.length > 0}
              <div class="mb-6">
                <div class="flex items-center justify-between mb-2 px-2">
                    <h4 class="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                      <Heart class="size-3.5" fill="currentColor" /> Saved Tools
                    </h4>
                    <span class="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{favouriteSlugs.length}</span>
                </div>
                <!-- 2-Column Mobile Grid -->
                <div class="grid grid-cols-2 gap-1.5 px-1">
                  {#each (favMax > 0 ? favouriteSlugs.slice(0, favMax) : favouriteSlugs) as slug (slug)}
                    <a
                      href={`/tools/${slug}`}
                      onclick={() => open = false}
                      class="flex flex-col items-start gap-1 py-1.5 px-2.5 rounded-lg bg-primary/5 border border-primary/10 text-foreground hover:bg-primary/10 active:bg-primary/20 transition-colors shadow-sm"
                    >
                        <span class="text-[11px] font-semibold text-foreground/90 truncate w-full">{formatTitle(slug)}</span>
                    </a>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Navigation Links -->
            <nav class="flex flex-col gap-0.5 text-sm font-medium mb-4">
              {#each siteConfig.ui.navigation.mobile as item (item.label)}
                {@const Icon = item.icon ? navIconMap[item.icon] : null}
                <!-- Parent link -->
                <a
                  href={item.href}
                  onclick={() => open = false}
                  class="flex items-center gap-3 rounded-lg px-3 py-1.5 text-foreground/80 font-medium transition-all duration-200 hover:bg-muted/80 hover:text-foreground active:scale-95 my-0.5"
                >
                  {#if Icon}
                    <Icon class="size-4 shrink-0" />
                  {/if}
                  {item.label}
                </a>
                <!-- Indented children (if any) -->
                {#if item.children && item.children.length > 0}
                  <div class="flex flex-col gap-0 ml-3 pl-3 mb-1 border-l border-border/40">
                    {#each item.children as child (child.label)}
                      {@const ChildIcon = child.icon ? navIconMap[child.icon] : null}
                      <a
                        href={child.href}
                        onclick={() => open = false}
                        class="flex items-center gap-2.5 rounded-md px-3 py-1 text-[13px] text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground active:scale-95 my-0.5"
                      >
                        {#if ChildIcon}
                          <ChildIcon class="size-3.5 shrink-0" />
                        {/if}
                        {child.label}
                      </a>
                    {/each}
                  </div>
                {/if}
              {/each}
            </nav>
        </div>
        
        <!-- Action Buttons -->
        <div class="p-4 border-t border-border/40 bg-muted/5 flex flex-col gap-3 mt-auto">
            
            <div class="flex flex-row items-center justify-between gap-2 w-full">
              {#if siteConfig.features.support?.url}
              <Button
                  variant="outline" 
                  href={siteConfig.features.support.url}
                  class="flex-1 justify-center border-border/60 bg-background/60 hover:bg-muted/80 hover:text-foreground shadow-sm px-2 text-xs font-medium"
              >
                  <Heart class="size-3.5 mr-1.5" /> Support
              </Button>
              {/if}
  
              <Button
                  variant="outline"
                  class="flex-1 justify-center border-border/60 bg-background/60 hover:bg-muted/80 hover:text-foreground shadow-sm px-2 text-xs font-medium"
                  onclick={() => window.dispatchEvent(new CustomEvent('open-feature-request'))}
              >
                  <PlusCircle class="size-3.5 mr-1.5" /> Request
              </Button>
            </div>

            {#if siteConfig.features.getApp?.enabled !== false}
            <div class="mt-1 rounded-xl bg-primary/10 overflow-hidden relative border border-primary/20">
                <!-- Background decoration -->
                <div class="absolute -right-6 -top-6 size-20 bg-primary/20 rounded-full blur-2xl"></div>
                <div class="p-4 relative z-10">
                  <h5 class="text-sm font-bold text-foreground mb-1">Get the App</h5>
                  <p class="text-[11px] text-muted-foreground mb-2.5 leading-relaxed">Experience {siteConfig.brand.shortName} offline.</p>
                  <Button href="/get-app" size="sm" class="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-medium justify-center gap-2 h-8">
                      <Smartphone class="size-3.5" /> Download App
                  </Button>
                </div>
            </div>
            {/if}
        </div>

    </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
