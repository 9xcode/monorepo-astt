/**
 * Article Schema Builder
 *
 * Builds a Schema.org Article JSON-LD schema with author (Person),
 * publisher (Organization), and optional hasPart (TOC section links).
 *
 * Previously inline in ToolSEOSchemas.astro L106-150.
 * Designed for reuse on future blog/projects pages.
 */

import type { ArticleSchemaInput } from "./types";
import { buildPersonSchema, buildOrganizationRef } from "./primitives";

/**
 * Build a Schema.org Article schema.
 *
 * The `headline` and `description` should be pre-processed by the caller
 * (e.g., tool pages append "Calculator Guide" to the headline).
 * This keeps the builder generic for any article-like page.
 */
export function buildArticleSchema(
	input: ArticleSchemaInput
): Record<string, unknown> {
	const article: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: input.headline,
		description: input.description,
		image: input.imageUrl,
		datePublished: input.datePublished,
		dateModified: input.dateModified,
		author: buildPersonSchema(input.author),
		publisher: buildOrganizationRef(input.publisher),
	};

	// Generate hasPart from H2 table-of-contents headings.
	// This enables AI search engines to cite individual sub-sections.
	if (input.tocHeadings && input.tocHeadings.length > 0) {
		const majorHeadings = input.tocHeadings.filter((h) => h.depth === 2);
		if (majorHeadings.length > 0) {
			article.hasPart = majorHeadings.map((h) => ({
				"@type": "WebPageElement",
				name: h.text,
				url: `${input.pageUrl}#${h.slug}`,
			}));
		}
	}

	return article;
}
