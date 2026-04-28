/**
 * BreadcrumbList Schema Builder
 *
 * Builds a Schema.org BreadcrumbList JSON-LD schema from an ordered
 * array of crumb items. Positions are assigned automatically.
 *
 * Previously hardcoded as a 4-level tool-specific breadcrumb in
 * ToolSEOSchemas.astro L153-182. Now generic — works for any page type
 * and any depth (tools, blog, projects, etc.).
 */

import type { BreadcrumbItem } from "./types";

/**
 * Build a Schema.org BreadcrumbList schema.
 *
 * @param items - Ordered array of breadcrumb levels (first = root, last = current page).
 *
 * Usage for tool pages:
 *   buildBreadcrumbSchema([
 *     { name: 'Home', url: siteConfig.url },
 *     { name: 'Tools', url: '...' },
 *     { name: 'Finance/Tax', url: '...' },
 *     { name: 'SIP Calculator', url: '...' },
 *   ])
 *
 * Usage for future blog:
 *   buildBreadcrumbSchema([
 *     { name: 'Home', url: siteConfig.url },
 *     { name: 'Blog', url: '...' },
 *     { name: 'Post Title', url: '...' },
 *   ])
 */
export function buildBreadcrumbSchema(
	items: BreadcrumbItem[]
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
}
