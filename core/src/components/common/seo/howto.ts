/**
 * HowTo Schema Builder
 *
 * Builds a Schema.org HowTo JSON-LD schema from structured step data.
 * Use this builder when you have pre-structured step data (e.g., from a CMS).
 *
 * For extracting HowTo data from markdown content, use parseHowToSchema()
 * from ./parsers.ts instead — it handles markdown parsing AND schema
 * construction in one step.
 */

import type { HowToSchemaInput } from "./types";

/**
 * Build a Schema.org HowTo schema from structured step data.
 *
 * @param input - Name, description, and ordered steps.
 * @returns HowTo JSON-LD schema, or null if no steps provided.
 */
export function buildHowToSchema(
	input: HowToSchemaInput
): Record<string, unknown> | null {
	if (input.steps.length === 0) return null;

	return {
		"@context": "https://schema.org",
		"@type": "HowTo",
		name: input.name,
		description: input.description,
		step: input.steps.map((s, i) => ({
			"@type": "HowToStep",
			position: i + 1,
			name: s.name,
			text: s.text,
		})),
	};
}
