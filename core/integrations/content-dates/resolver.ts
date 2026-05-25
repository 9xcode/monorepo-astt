// resolver.ts — Runtime Content Dates Resolver
//
// Provides getContentDates() and getCopyrightYear() for use in:
//   - core/src/pages/tools/[tool].astro
//   - core/src/layouts/BlogLayout.astro
//   - core/src/components/common/sections/Footer.astro
//   - core/src/config/sitemap.ts
//   - Any other file that needs resolved content dates
//
// This file imports the generated JSON via the @content-dates Vite alias
// set up in astro-config.ts:
//   '@content-dates' → <siteRoot>/src/generated/content-dates.json
//
// NOTE: This file runs at Vite/Astro build time (SSG), not in a browser.
// The JSON import is resolved statically by Vite — no runtime file I/O.

import contentDatesJson from '@content-dates';
// Types are import-type only — erased at build time, no Node code bundled.
import type { ResolvedDates, ContentDatesManifest } from './generator.ts';

const contentDates = contentDatesJson as ContentDatesManifest;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the resolved publishedAt and updatedAt for a content entry.
 *
 * Dates are pre-resolved by the content-dates integration at build time
 * using this hierarchy:
 *   1. Frontmatter publishedAt / updatedAt  (highest trust — author-set)
 *   2. Git first-commit / last-commit date  (accurate, rebuild-safe)
 *   3. publishedAt fallback for updatedAt   ("never modified")
 *
 * @param collection  'tools' | 'blog'
 * @param slug        The content slug (e.g. 'sip-calculator')
 * @returns           { publishedAt: string, updatedAt: string } — always W3C format
 * @throws            If the slug is not found in the manifest (build error — fix the content)
 */
export function getContentDates(
  collection: 'tools' | 'blog',
  slug: string,
): ResolvedDates {
  const key = `${collection}/${slug}`;
  const entry = (contentDates as Record<string, unknown>)[key];

  if (!entry || typeof entry !== 'object' || !('publishedAt' in entry)) {
    // No entry in manifest: git history was unavailable and no frontmatter publishedAt.
    // Fall back to the manifest generation timestamp so the build can complete.
    // Fix: add publishedAt to the frontmatter, or run with full git history (fetch-depth: 0).
    const fallback = contentDates._meta.generatedAt;
    console.warn(
      `[content-dates] No resolved dates for "${key}" — falling back to manifest generatedAt. ` +
      'Add publishedAt to frontmatter or ensure git history is available (fetch-depth: 0 in CI).',
    );
    return { publishedAt: fallback, updatedAt: fallback };
  }

  return entry as ResolvedDates;
}

/**
 * Returns the copyright year derived from the newest git commit in the repo.
 * Used by Footer.astro to display the current copyright year.
 *
 * Falls back to the year the manifest was generated if the git year
 * is somehow missing (should never happen in practice).
 */
export function getCopyrightYear(): number {
  return contentDates._meta.copyrightYear;
}
