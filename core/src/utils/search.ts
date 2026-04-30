/**
 * Search Types — shared type definitions for the search API and search store.
 *
 * Extracted from src/pages/api/search-tools.json.ts so that:
 * - SearchItem is importable from @mtools/core without touching Astro page files
 * - searchStore.svelte.ts can import from core (not from an Astro endpoint)
 * - Both search endpoints (tools + blog) share one canonical type
 *
 * Phase 10: new file in @mtools/core/utils/search.
 */

export type SearchItem = {
  type: 'tool' | 'blog';
  slug: string;
  href: string;
  data: {
    title: string;
    description: string;
    icon?: string;
    category?: string;
    tags?: readonly string[];
  };
};
