/**
 * Tools Utilities — shared logic for all tool pages and tool-consuming components.
 *
 * Mirrors the blog.ts pattern for the tools collection.
 * Centralises collection queries, filtering, sorting, and slug resolution
 * so every page/component that needs tool data calls one function instead of
 * repeating the same inline logic.
 *
 * getCollection() is cached by Astro across the same build pass — every call
 * here returns the same in-memory reference with zero additional I/O cost.
 *
 * Common utilities (filterTocHeadings, getReadTime) live in content.ts.
 * Slug normalisation lives in slug.ts — both are used internally here.
 *
 * Phase 10: moved to @mtools/core/utils/tools. No siteConfig dependency.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { resolveSlug } from './slug';
import { cyrb128, mulberry32, seededShuffle } from './prng';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Tool = CollectionEntry<'tools'>;

/**
 * Lightweight shape passed to grids, sidebars, search, and homepage sections.
 * Contains only the fields needed for display — no markdown body.
 */
export type ToolSummary = {
    slug: string;
    data: {
        title: string;
        /** Resolved: shortDescription if set, otherwise description. */
        description: string;
        icon?: string;
        category: string;
        order?: number;
        tags?: readonly string[];
        featured?: boolean;
    };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise a tool entry id to a clean URL slug.
 * Uses the shared resolveSlug from slug.ts.
 */
export function getToolSlug(entry: Tool): string {
    return resolveSlug(entry.id);
}

/**
 * Resolves the display description for a tool.
 * Uses shortDescription when set (preferred for cards/grids), falls back to
 * the full description.
 */
export function getToolDescription(entry: Tool): string {
    return entry.data.shortDescription || entry.data.description;
}

/**
 * Comparator that sorts tools by order (ascending) then alphabetically.
 * Used internally by all query functions so callers receive pre-sorted data.
 */
function toolSortComparator(
    a: { data: { order?: number; title: string } },
    b: { data: { order?: number; title: string } },
): number {
    const ao = a.data.order ?? Infinity;
    const bo = b.data.order ?? Infinity;
    if (ao !== bo) return ao - bo;
    return a.data.title.localeCompare(b.data.title);
}

/** Maps a full Tool entry to the lightweight ToolSummary shape. */
function toSummary(entry: Tool): ToolSummary {
    return {
        slug: getToolSlug(entry),
        data: {
            title:       entry.data.title,
            description: getToolDescription(entry),
            icon:        entry.data.icon,
            category:    entry.data.category,
            order:       entry.data.order,
            tags:        entry.data.tags,
            featured:    entry.data.featured,
        },
    };
}

// ─── Collection Queries ───────────────────────────────────────────────────────

/**
 * All published tools, draft-filtered in production, sorted by order → alpha.
 * Returns full CollectionEntry objects — use this when you need entry.body
 * or need to call render(entry).
 */
export async function getAllTools(): Promise<Tool[]> {
    const raw = await getCollection('tools');
    return raw
        .filter(t => !(import.meta.env.PROD && t.data.isDraft))
        .sort(toolSortComparator);
}

/**
 * All published tools mapped to the lightweight ToolSummary shape.
 * Use this for grids, sidebars, search indexes, and homepage sections —
 * anywhere that does NOT need the full markdown body.
 */
export async function getAllToolSummaries(): Promise<ToolSummary[]> {
    const tools = await getAllTools();
    return tools.map(toSummary);
}

/**
 * Published tools for a single category, sorted by order → alpha.
 * Returns full CollectionEntry objects.
 */
export async function getToolsByCategory(category: string): Promise<Tool[]> {
    const all = await getAllTools();
    return all.filter(t => t.data.category === category);
}

/**
 * Published tools for a single category mapped to ToolSummary.
 * Use this when you need category tools for display but not the body.
 */
export async function getToolSummariesByCategory(category: string): Promise<ToolSummary[]> {
    const tools = await getToolsByCategory(category);
    return tools.map(toSummary);
}

/**
 * Published tools that include a given tag, sorted by order → alpha.
 */
export async function getToolsByTag(tag: string): Promise<Tool[]> {
    const all = await getAllTools();
    return all.filter(t => t.data.tags?.includes(tag as any));
}

/**
 * getRelatedTools — Returns up to `count` related tools for a given tool page.
 *
 * Priority (all pools seeded-shuffled for stable-but-varied results per slug):
 *   Tier 1: Tools in the same category (excluding current tool)
 *   Tier 2: Tools sharing ≥1 tag but in a different category
 *   Tier 3: Any remaining tools — ensures the list is never empty
 *
 * The seed is derived from the current tool's slug via cyrb128 + mulberry32,
 * so results are deterministic per URL (same order on every visit to that page).
 * The single `rng` instance is shared across all three tiers so each tier
 * advances the PRNG state — consistent shuffling throughout the entire selection.
 *
 * @param currentSlug     - URL slug of the currently viewed tool.
 * @param currentCategory - Category of the current tool (Tier 1 filter).
 * @param currentTags     - Tags of the current tool (Tier 2 filter). Pass [] if none.
 * @param allTools        - All published tools as ToolSummary (from getAllToolSummaries).
 * @param count           - Maximum number of related tools to return. Default: 4.
 * @returns Up to `count` ToolSummary objects.
 */
export function getRelatedTools(
    currentSlug: string,
    currentCategory: string,
    currentTags: readonly string[],
    allTools: ToolSummary[],
    count = 4,
): ToolSummary[] {
    const seed = cyrb128(currentSlug);
    const rng  = mulberry32(seed);

    // Tier 1: same category, seeded-shuffled
    const sameCat = allTools.filter(
        t => t.data.category === currentCategory && t.slug !== currentSlug,
    );
    let result = seededShuffle(sameCat, rng).slice(0, count);

    // Tier 2: different category, shares ≥1 tag with current tool
    if (result.length < count) {
        const tagSet = new Set(currentTags);
        const byTag = allTools.filter(
            t =>
                t.slug !== currentSlug &&
                t.data.category !== currentCategory &&
                !result.find(r => r.slug === t.slug) &&
                t.data.tags?.some(tag => tagSet.has(tag)),
        );
        result = [...result, ...seededShuffle(byTag, rng).slice(0, count - result.length)];
    }

    // Tier 3: any remaining tools — ensures the list is never empty
    if (result.length < count) {
        const remaining = allTools.filter(
            t => t.slug !== currentSlug && !result.find(r => r.slug === t.slug),
        );
        result = [...result, ...seededShuffle(remaining, rng).slice(0, count - result.length)];
    }

    return result;
}
