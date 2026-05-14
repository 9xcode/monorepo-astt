/**
 * WebApplication Schema Builder
 *
 * Builds a Schema.org WebApplication JSON-LD schema for tool pages.
 * Handles category type resolution, auto-keyword generation from tags,
 * subcategory extraction, and optional feature lists.
 *
 * Previously inline in ToolSEOSchemas.astro L50-103.
 * This is the most complex schema — tool-page specific.
 */

import type { WebApplicationSchemaInput } from "./types";
import { buildOrganizationRef, buildOfferSchema, resolveSchemaType } from "./primitives";

/**
 * Build a Schema.org WebApplication schema.
 *
 * Tag processing (automatic):
 * - Raw tags like "compound-interest" → formatted "Compound Interest"
 * - Auto-generates applicationSubCategory from formatted tags
 * - Auto-generates keywords: [toolTitle, category, ...tagTools, ...defaultKeywords]
 * - Deduplicates keywords via Set
 */
export function buildWebApplicationSchema(
	input: WebApplicationSchemaInput
): Record<string, unknown> {
	const schemaType = resolveSchemaType("WebApplication", input.categoryMapping);

	// Auto-generate keywords and subcategories from tags
	// e.g., 'compound-interest' -> 'Compound Interest'
	const formattedTags = input.tags
		? input.tags.map((tag) =>
				tag
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ")
			)
		: [];
	const autoKeywords = formattedTags.map((tag) => `${tag} Tool`);
	const appSubCategories = formattedTags;

	const schema: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": schemaType,
		name: input.name,
		url: input.url,
		applicationCategory: input.categoryMapping.appCategory,
		operatingSystem: input.operatingSystem,
		browserRequirements: input.browserRequirements,
		isAccessibleForFree: input.isAccessibleForFree,
		softwareVersion: input.softwareVersion,
		screenshot: input.screenshotUrl,
		description: input.description,
		offers: buildOfferSchema({ priceCurrency: input.priceCurrency }),
		creator: buildOrganizationRef(input.creator),
		potentialAction: {
			"@type": "UseAction",
			target: input.url,
		},
		dateModified: input.dateModified,
	};

	// Conditional: applicationSubCategory from formatted tags
	if (appSubCategories.length > 0) {
		schema["applicationSubCategory"] = appSubCategories;
	}

	// Conditional: deduplicated keyword string
	if (autoKeywords.length > 0 || (input.defaultKeywords && input.defaultKeywords.length > 0)) {
		const allKeywords = [
			input.toolTitle,
			input.category,
			...autoKeywords,
			...(input.defaultKeywords || []),
		];
		schema["keywords"] = [...new Set(allKeywords)].join(", ");
	}

	// Conditional: explicit feature list parsed from markdown
	if (input.featureList && input.featureList.length > 0) {
		schema["featureList"] = input.featureList;
	}

	return schema;
}
