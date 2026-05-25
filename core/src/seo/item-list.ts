/**
 * ItemList Schema Builder
 *
 * Builds a Schema.org ItemList JSON-LD schema for pages that display
 * curated lists of tools (homepage featured section, category pages).
 *
 * Previously duplicated inline in:
 * - index.astro L77-107 (homepage featured tools)
 * - categories/[category].astro L44-67 (category tool lists)
 *
 * Both had identical categoryMapping → schemaType → Offer nesting logic.
 * This builder eliminates that duplication.
 */

import type { ItemListSchemaInput } from "./types";
import { buildOfferSchema, resolveSchemaType } from "./primitives";

/**
 * Build a Schema.org ItemList schema.
 *
 * Each item is rendered as a ListItem containing a typed WebApplication
 * (with the correct appCategory and additionalType resolved from its
 * category mapping).
 */
export function buildItemListSchema(
	input: ItemListSchemaInput
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: input.name,
		description: input.description,
		url: input.url,
		numberOfItems: input.items.length,
		itemListElement: input.items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": resolveSchemaType("WebApplication", item.categoryMapping),
				name: item.name,
				url: item.url,
				applicationCategory: item.categoryMapping.appCategory,
				operatingSystem: item.operatingSystem,
				offers: buildOfferSchema({ priceCurrency: item.priceCurrency }),
			},
		})),
	};
}
