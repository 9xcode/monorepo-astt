/**
 * FAQPage Schema Builder
 *
 * Builds a Schema.org FAQPage JSON-LD schema from structured data.
 * Use this builder when you have pre-structured FAQ data (e.g., from a CMS).
 *
 * For extracting FAQ data from markdown content, use parseFaqSchema()
 * from ./parsers.ts instead — it handles markdown parsing AND schema
 * construction in one step.
 */

import type { FaqItem } from "./types";

/**
 * Build a Schema.org FAQPage schema from structured question-answer pairs.
 *
 * @param questions - Array of { question, answer } objects.
 * @returns FAQPage JSON-LD schema, or null if no questions provided.
 */
export function buildFaqPageSchema(
	questions: FaqItem[]
): Record<string, unknown> | null {
	if (questions.length === 0) return null;

	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: questions.map((q) => ({
			"@type": "Question",
			name: q.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: q.answer,
			},
		})),
	};
}
