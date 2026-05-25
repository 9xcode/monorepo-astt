/**
 * Content Utilities — shared helpers for both tools and blog collections.
 *
 * Functions here have NO dependency on a specific content collection type.
 * They operate on generic markdown data (headings, body text) and
 * site-level config — making them safe to import from any page or layout.
 *
 * Phase 10: moved to @mtools/core/utils/content.
 * siteConfig now comes from virtual:site-config (build-time constant).
 */
import type { MarkdownHeading } from 'astro';
// Phase 10: replaced `import { siteConfig } from '../config'`
import { siteConfig } from 'virtual:site-config';

// ─── TOC ──────────────────────────────────────────────────────────────────────

/**
 * Resolves the final list of headings to display in a Table of Contents.
 *
 * Logic (identical for tools and blog):
 * 1. If `frontmatterToc` is explicitly set (true/false), honour it.
 *    If omitted (undefined), fall back to the site-global toc.enabled setting.
 * 2. Filter headings to the configured max depth (default: h2 + h3).
 * 3. Return an empty array if the filtered list is below the minimum threshold
 *    (prevents a TOC that lists only 1–2 headings, which looks awkward).
 *
 * @param headings       Raw heading list from Astro's `render()`.
 * @param frontmatterToc `toc` value from the content frontmatter (true/false/undefined).
 * @returns              The headings to render, or [] if TOC should be hidden.
 */
export function filterTocHeadings(
    headings: MarkdownHeading[],
    frontmatterToc: boolean | undefined,
): MarkdownHeading[] {
    const tocConfig = siteConfig.features.toolPage.toc;
    const globalEnabled = tocConfig?.enabled ?? false;
    const maxDepth     = tocConfig?.maxDepth   ?? 3;
    const minHeadings  = tocConfig?.minHeadings ?? 3;

    // Frontmatter `toc` overrides the global default; undefined → use global.
    const showToc = frontmatterToc !== undefined ? frontmatterToc : globalEnabled;

    if (!showToc) return [];

    const filtered = headings.filter(h => h.depth <= maxDepth);
    return filtered.length >= minHeadings ? filtered : [];
}

// ─── Read Time ────────────────────────────────────────────────────────────────

/**
 * Estimates reading time in minutes from raw markdown body text.
 * Returns a minimum of 1 to avoid showing "0 min read".
 *
 * Word-per-minute rate: 230 (typical adult silent reading speed).
 */
export function getReadTime(body: string | undefined): number {
    if (!body) return 1;
    const wordsPerMinute = 230;
    const wordCount = body.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
