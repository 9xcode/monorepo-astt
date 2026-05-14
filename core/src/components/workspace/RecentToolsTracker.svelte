<script lang="ts">
  /**
   * RecentToolsTracker — invisible component, zero UI.
   * Placed on every tool page via ToolLayout.astro.
   * Writes the current tool slug to localStorage on mount.
   */
  import { siteConfig } from 'virtual:site-config';

  let { slug, storageKey = "recents", maxItems = 8 } = $props<{
    slug: string;
    storageKey?: string;
    maxItems?: number;
  }>();

  $effect(() => {
    if (!slug) return;
    try {
      const fullKey = siteConfig.localStoragePrefix + storageKey;
      const existing: string[] = JSON.parse(localStorage.getItem(fullKey) || "[]");
      // Remove slug if already present (to re-insert at front)
      const filtered = existing.filter((s) => s !== slug);
      // Prepend and cap
      const updated = [slug, ...filtered].slice(0, maxItems);
      localStorage.setItem(fullKey, JSON.stringify(updated));
    } catch {
      // localStorage unavailable — silent fail
    }
  });
</script>
<!-- No UI — this component only writes to localStorage -->
