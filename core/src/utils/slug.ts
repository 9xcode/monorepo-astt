/**
 * Slug utilities — shared slug generation functions.
 * Eliminates duplicated slug logic across components and pages.
 */

/**
 * Converts a category name to a URL-safe slug.
 * e.g. "Finance & Tax" → "finance-tax"
 */
export function categoryToSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Strips the /index suffix from a content entry id to produce a clean URL slug.
 * This is the single canonical normalisation used by both tools and blog entries.
 *
 * e.g. "sip-calculator/index" → "sip-calculator"
 *      "sip-calculator"       → "sip-calculator"  (no-op if already clean)
 */
export function resolveSlug(id: string): string {
    return id.replace(/\/index$/, '');
}
