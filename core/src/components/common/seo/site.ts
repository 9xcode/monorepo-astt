/**
 * Site-Wide Schema Builders
 *
 * Builds the WebSite and Organization JSON-LD schemas
 * that are injected on every page via BaseLayout.astro.
 */

import type { WebSiteSchemaInput, OrganizationSchemaInput } from "./types";

/**
 * Build a Schema.org WebSite schema.
 * Declares the site entity with name, URL, description and publisher.
 *
 * Previously inline in BaseLayout.astro L89-103.
 */
export function buildWebSiteSchema(
	input: WebSiteSchemaInput
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: input.name,
		url: input.url,
		description: input.description,
		publisher: {
			"@type": "Organization",
			name: input.publisherName,
			logo: {
				"@type": "ImageObject",
				url: input.publisherLogoUrl,
			},
		},
	};
}

/**
 * Build a standalone Schema.org Organization schema.
 * Establishes the brand entity with topical authority (knowsAbout)
 * and a customer support contact point.
 *
 * Previously inline in BaseLayout.astro L106-118.
 *
 * Note: The `logo` field here is a plain URL string (not an ImageObject)
 * to match the original output exactly. The publisher sub-objects in
 * WebSite and Article schemas use ImageObject format instead.
 */
export function buildOrganizationSchema(
	input: OrganizationSchemaInput
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: input.name,
		url: input.url,
		logo: input.logoUrl,
		knowsAbout: input.knowsAbout,
		contactPoint: {
			"@type": "ContactPoint",
			email: input.contactEmail,
			contactType: "customer support",
		},
	};
}
