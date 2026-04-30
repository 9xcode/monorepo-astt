/**
 * searchStore.svelte.ts — Shared Svelte 5 rune-based cache for search data.
 *
 * MUST be a `.svelte.ts` file so the Svelte compiler processes the $state runes.
 *
 * Both SearchDialog (pre-fetcher) and SearchDialogContent (consumer) import
 * from here, so the JSON is fetched AND parsed exactly once per browser session
 * no matter how many times the modal is opened or closed.
 *
 * Phase 10: moved to @mtools/core/utils/searchStore.svelte.ts.
 * SearchItem type now imported from ./search (core) instead of an Astro page file.
 */

// Phase 10: replaced `import type { SearchItem } from '../pages/api/search-tools.json'`
import type { SearchItem } from './search';

type FetchState = 'idle' | 'loading' | 'done' | 'error';

// ── Tools ─────────────────────────────────────────────────────────────────────

export const toolsStore = $state<{
  items: SearchItem[];
  status: FetchState;
}>({
  items: [],
  status: 'idle',
});

export async function fetchTools(): Promise<void> {
  if (toolsStore.status !== 'idle' && toolsStore.status !== 'error') return;
  toolsStore.status = 'loading';
  try {
    const res = await fetch('/api/search-tools.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    toolsStore.items = await res.json();
    toolsStore.status = 'done';
  } catch {
    toolsStore.status = 'error';
  }
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export const blogsStore = $state<{
  items: SearchItem[];
  status: FetchState;
}>({
  items: [],
  status: 'idle',
});

export async function fetchBlogs(): Promise<void> {
  if (blogsStore.status !== 'idle' && blogsStore.status !== 'error') return;
  blogsStore.status = 'loading';
  try {
    const res = await fetch('/api/search-blog.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    blogsStore.items = await res.json();
    blogsStore.status = 'done';
  } catch {
    blogsStore.status = 'error';
  }
}
