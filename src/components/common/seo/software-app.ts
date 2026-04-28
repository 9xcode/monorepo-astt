/**
 * SoftwareApplication Schema Builder
 *
 * Builds a Schema.org SoftwareApplication JSON-LD schema
 * for the mobile app landing page.
 *
 * Previously inline in mobile-app.astro L18-31.
 */

import type { SoftwareAppSchemaInput } from "./types";
import { buildOfferSchema } from "./primitives";

/**
 * Build a Schema.org SoftwareApplication schema.
 */
export function buildSoftwareAppSchema(
	input: SoftwareAppSchemaInput
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: input.name,
		description: input.description,
		operatingSystem: input.operatingSystem,
		applicationCategory: input.applicationCategory,
		offers: buildOfferSchema({ priceCurrency: input.priceCurrency }),
		url: input.url,
	};
}
