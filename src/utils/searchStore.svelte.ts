/**
 * searchStore.svelte.ts — Shared Svelte 5 rune-based cache for search data.
 *
 * MUST be a `.svelte.ts` file so the Svelte compiler processes the $state runes.
 *
 * Both SearchDialog (pre-fetcher) and SearchDialogContent (consumer) import
 * from here, so the JSON is fetched AND parsed exactly once per browser session
 * no matter how many times the modal is opened or closed.
 *
 * SearchItem is defined in search-tools.json.ts and reused by search-blog.json.ts —
 * both endpoints return the same shape, so one type import covers both.
 */

import type { SearchItem } from '../pages/api/search-tools.json';

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
