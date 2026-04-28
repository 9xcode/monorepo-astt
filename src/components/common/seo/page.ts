/**
 * WebPage Schema Builder
 *
 * Builds a generic Schema.org WebPage (or subtype) JSON-LD schema.
 * Works for AboutPage, ContactPage, CollectionPage, and plain WebPage.
 *
 * Previously hardcoded inline in about.astro, contact.astro, support.astro.
 * Also used to ADD missing schemas to privacy.astro, terms.astro, disclaimer.astro.
 */

import type { WebPageSchemaInput } from "./types";

/**
 * Build a Schema.org WebPage schema (or subtype).
 *
 * Supported types:
 * - "WebPage"        — generic (support, privacy, terms, disclaimer)
 * - "AboutPage"      — about page
 * - "ContactPage"    — contact page
 * - "CollectionPage" — categories index page
 */
export function buildWebPageSchema(
	input: WebPageSchemaInput
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": input.type,
		name: input.name,
		description: input.description,
		url: input.url,
	};
}
