/**
 * SEO Schema Primitives
 *
 * Shared sub-objects used across multiple JSON-LD schemas.
 * These eliminate duplication of Person, Organization, and Offer blocks
 * that were previously hardcoded in 4+ separate locations.
 */

import type {
	PersonSchemaInput,
	OrganizationRefInput,
	OfferInput,
	CategoryMapping,
} from "./types";

/**
 * Build a Schema.org Person object.
 * Used as the `author` field in Article schemas.
 */
export function buildPersonSchema(
	input: PersonSchemaInput
): Record<string, unknown> {
	const person: Record<string, unknown> = {
		"@type": "Person",
		name: input.name,
		jobTitle: input.jobTitle,
		description: input.description,
		knowsAbout: input.knowsAbout,
		image: input.imageUrl,
	};

	if (input.url) {
		person["url"] = input.url;
	}

	const validSameAs = input.sameAs.filter(Boolean);
	if (validSameAs.length > 0) {
		person["sameAs"] = validSameAs;
	}

	return person;
}

/**
 * Build a compact Schema.org Organization reference.
 * Used as `publisher` (Article), `creator` (WebApplication), and `publisher` (WebSite).
 *
 * Fields are optional because different contexts need different shapes:
 * - WebSite publisher:        name + logo
 * - WebApplication creator:   name + url + knowsAbout (no logo)
 * - Article publisher:        name + url + knowsAbout + logo
 */
export function buildOrganizationRef(
	input: OrganizationRefInput
): Record<string, unknown> {
	const org: Record<string, unknown> = {
		"@type": "Organization",
		name: input.name,
		url: input.url,
	};

	if (input.logoUrl) {
		org["logo"] = {
			"@type": "ImageObject",
			url: input.logoUrl,
		};
	}

	if (input.knowsAbout && input.knowsAbout.length > 0) {
		org["knowsAbout"] = input.knowsAbout;
	}

	return org;
}

/**
 * Build a Schema.org Offer object (free tool/app offering).
 * Currently hardcoded in WebApplication, SoftwareApplication, and ItemList schemas.
 */
export function buildOfferSchema(
	input?: OfferInput
): Record<string, unknown> {
	return {
		"@type": "Offer",
		price: input?.price ?? "0",
		priceCurrency: input?.priceCurrency ?? "USD",
	};
}

/**
 * Resolve a category mapping to the correct Schema.org @type value.
 *
 * For categories with an `additionalType`, returns an array (multi-type):
 *   ["WebApplication", "FinancialProduct"]
 * Otherwise, returns a single string:
 *   "WebApplication"
 */
export function resolveSchemaType(
	baseType: string,
	categoryMapping: CategoryMapping
): string | string[] {
	return categoryMapping.additionalType
		? [baseType, categoryMapping.additionalType]
		: baseType;
}
