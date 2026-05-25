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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ResolvedDates {
  publishedAt: string;
  updatedAt: string;
}

interface ContentDatesManifest {
  _meta: {
    copyrightYear: number;
    generatedAt: string;
  };
  [key: string]: ResolvedDates | { copyrightYear: number; generatedAt: string };
}

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
    throw new Error(
      `[content-dates] No resolved dates found for "${key}". ` +
      'Ensure the content file exists and the content-dates integration has run. ' +
      'If git history is unavailable, add publishedAt to frontmatter.',
    );
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
