
/**
 * SEO Utility
 * 
 * Replaces dynamic placeholders in SEO strings (like titles and descriptions)
 * with the current build-time dates. This creates "Evergreen" search results
 * similar to Rank Math's placeholder feature.
 * 
 * Supported placeholders:
 * - [month] -> "March", "April"
 * - [year]  -> "2026", "2027"
 * - [month_year] -> "March 2026"
 */

// Captured once when the module loads during the Astro build.
// Using a module-level constant ensures every replaceSeoPlaceholders()
// call within a build sees the same month/year — and avoids repeated
// Date allocations.
const _buildDate = new Date();

export function replaceSeoPlaceholders(text: string | undefined): string {
    if (!text) return "";

    const month = _buildDate.toLocaleString('en-US', { month: 'long' }); // e.g., "March"
    const year  = _buildDate.getFullYear().toString();                    // e.g., "2026"

    return text
        .replace(/\[month_year\]/gi, `${month} ${year}`)
        .replace(/\[month\]/gi, month)
        .replace(/\[year\]/gi, year);
}

/**
 * Builds the SERP <title> for a tool page.
 *
 * Decision tree:
 *  1. If the tool author provided a `seoTitle` in frontmatter → use it verbatim.
 *     Authors who write seoTitle already crafted the full keyword-rich title.
 *  2. Otherwise → append a category-specific descriptor from siteConfig.seo.titleDescriptors.
 *     This replaces the old "| MultiTools" brand suffix with useful intent keywords,
 *     reclaiming ~12 chars of the 60-char budget for better click-through rates.
 *
 * Example outputs:
 *  - seoTitle set: "SIP Calculator — Calculate SIP Returns, Growth & Maturity"
 *  - no seoTitle:  "SIP Calculator — Free Tax & Finance Calculator"
 */
export function buildToolTitle(title: string, seoTitle: string | undefined, category: string): string {
    if (seoTitle) return seoTitle;

    const { titleDescriptors, titleSeparator } = siteConfig.seo;
    const sep = (titleSeparator ?? '-').trim();
    const suffix = titleDescriptors[category] ?? titleDescriptors['_default'] ?? '';
    const result = suffix ? `${title} ${sep} ${suffix}` : title;

    // Warn at build time if the title exceeds the SERP sweet spot.
    // Titles between 51-60 chars have the lowest Google rewrite rate (Zyppy 2023 study).
    // Above 62 chars, truncation and rewrites become likely.
    if (result.length > 62) {
        console.warn(`[SEO] Title may be too long (${result.length} chars): "${result}"`);
    }

    return result;
}

/**
 * Builds the SERP <title> for a blog post page.
 *
 * Decision tree:
 *  1. If the post author provided a `seoTitle` in frontmatter → use it verbatim.
 *  2. Otherwise → use the post title as-is. Blog titles are self-descriptive and
 *     adding "| MultiTools Blog" wastes characters that Google would strip anyway.
 *
 * Example outputs:
 *  - seoTitle set: "How to Save ₹10L in 2025 — Proven Tax-Saving Strategies"
 *  - no seoTitle:  "How to Save Money in 2025"
 */
export function buildBlogTitle(title: string, processedSeoTitle: string): string {
    return processedSeoTitle || title;
}
