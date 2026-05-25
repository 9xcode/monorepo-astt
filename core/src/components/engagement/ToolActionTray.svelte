<script lang="ts">
  import { Heart, Share2, Coffee, MessageSquarePlus, Smartphone } from '@lucide/svelte';

  let {
    slug,
    toolTitle,
    toolDescription = "",
    toolUrl,
    toolImageUrl = "",
    showFavourite = true,
    showShare = true,
    showSupport = true,
    supportUrl = "",
    supportLabel = "Support Us",
    showFeedback = true,
    showGetApp = true,
    getAppHref = "/mobile-app",
    favouriteStorageKey = "favourites",
  } = $props<{
    slug: string;
    toolTitle: string;
    toolDescription?: string;
    toolUrl: string;
    toolImageUrl?: string;
    showFavourite?: boolean;
    showShare?: boolean;
    showSupport?: boolean;
    supportUrl?: string;
    supportLabel?: string;
    showFeedback?: boolean;
    showGetApp?: boolean;
    getAppHref?: string;
    favouriteStorageKey?: string;
  }>();

  import { siteConfig } from 'virtual:site-config';

  // ── Favourite ──
  let isFavourited = $state(false);

  $effect(() => {
    try {
      const fullKey = siteConfig.localStoragePrefix + favouriteStorageKey;
      const saved: string[] = JSON.parse(localStorage.getItem(fullKey) || "[]");
      isFavourited = saved.includes(slug);
    } catch { isFavourited = false; }
  });

  function toggleFavourite() {
    try {
      const fullKey = siteConfig.localStoragePrefix + favouriteStorageKey;
      const saved: string[] = JSON.parse(localStorage.getItem(fullKey) || "[]");
      const idx = saved.indexOf(slug);
      if (idx === -1) saved.unshift(slug);
      else saved.splice(idx, 1);
      localStorage.setItem(fullKey, JSON.stringify(saved));
      isFavourited = idx === -1;
    } catch { /* localStorage unavailable */ }
  }

  // ── Share ──
  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: toolTitle, text: toolDescription || toolTitle, url: toolUrl }).catch(() => {});
    } else {
      window.dispatchEvent(new CustomEvent('open-share', {
        detail: { title: toolTitle, url: toolUrl, imageUrl: toolImageUrl }
      }));
    }
  }

  // ── Feedback ──
  function openFeedback() {
    window.dispatchEvent(new CustomEvent('open-feature-request'));
  }
</script>



<div class="tray-root" role="toolbar" aria-label="Tool actions">

  {#if showFavourite}
    <button
      class="tray-btn"
      class:tray-btn--fav={isFavourited}
      onclick={toggleFavourite}
      aria-label={isFavourited ? "Remove from saved tools" : "Save this tool"}
      aria-pressed={isFavourited}
    >
      <Heart class="tray-icon" fill={isFavourited ? "currentColor" : "none"} />
      <span class="tray-label">{isFavourited ? "Saved" : "Save"}</span>
    </button>
  {/if}

  {#if showShare}
    <button
      class="tray-btn"
      onclick={handleShare}
      aria-label="Share this tool"
    >
      <Share2 class="tray-icon" />
      <span class="tray-label">Share</span>
    </button>
  {/if}

  {#if showSupport && supportUrl}
    <a class="tray-btn tray-btn--support" href={supportUrl}
      target={supportUrl.startsWith("http") ? "_blank" : undefined}
      rel={supportUrl.startsWith("http") ? "noopener noreferrer" : undefined}
      aria-label="Support this project"
    >
      <Coffee class="tray-icon" />
      <span class="tray-label">{supportLabel}</span>
    </a>
  {/if}

  {#if showFeedback}
    <button class="tray-btn" onclick={openFeedback} aria-label="Send feedback or request a feature">
      <MessageSquarePlus class="tray-icon" />
      <span class="tray-label">Feedback</span>
    </button>
  {/if}

  {#if showGetApp}
    <a class="tray-btn" href={getAppHref} aria-label="Get the mobile app">
      <Smartphone class="tray-icon" />
      <span class="tray-label">Get App</span>
    </a>
  {/if}

</div>

<style>
  .tray-root {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1.5rem 0;
  }

  .tray-root::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  /* ── Buttons ── */
  .tray-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4rem 0.75rem;
    border-radius: var(--radius);
    background: var(--muted);
    color: var(--muted-foreground);
    font-size: 0.8125rem;
    font-weight: 500;
    border: 1px solid transparent;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
    white-space: nowrap;
    line-height: 1;
    user-select: none;
  }

  .tray-btn:hover {
    background: var(--muted);
    color: var(--foreground);
    border-color: var(--border);
  }

  .tray-btn:active { transform: scale(0.96); }

  /* Saved/active state */
  .tray-btn--fav {
    background: color-mix(in oklch, var(--primary) 8%, transparent);
    color: var(--primary);
    border-color: color-mix(in oklch, var(--primary) 30%, transparent);
  }
  .tray-btn--fav:hover {
    background: color-mix(in oklch, var(--primary) 14%, transparent);
    color: var(--primary);
    border-color: color-mix(in oklch, var(--primary) 40%, transparent);
  }



  /* Support warm tint */
  .tray-btn--support {
    background: color-mix(in oklch, var(--warning) 8%, transparent);
    color: var(--warning-foreground);
    border-color: color-mix(in oklch, var(--warning) 25%, transparent);
  }
  .tray-btn--support:hover {
    background: color-mix(in oklch, var(--warning) 14%, transparent);
    border-color: color-mix(in oklch, var(--warning) 35%, transparent);
  }

  :global(.dark) .tray-btn--support {
    color: var(--warning-foreground);
  }

  :global(.tray-icon) {
    width: 0.9375rem;
    height: 0.9375rem;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    .tray-label { display: none; }
    .tray-btn { padding: 0.5rem; border-radius: 50%; } /* Circle buttons on mobile */
    .tray-root { padding: 0.5rem; justify-content: center; }
  }
</style>
