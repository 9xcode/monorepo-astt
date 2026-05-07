/**
 * SEO Schema Module — Barrel Export
 *
 * Central export point for all SEO schema builders, types, and utilities.
 * Import from this file to access any schema builder:
 *
 *   import { buildArticleSchema, buildBreadcrumbSchema } from '../seo';
 *
 * The JsonLd.astro renderer must be imported directly:
 *   import JsonLd from '../seo/JsonLd.astro';
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type {
	Heading,
	CategoryMapping,
	PersonSchemaInput,
	OrganizationRefInput,
	OfferInput,
	WebSiteSchemaInput,
	OrganizationSchemaInput,
	WebPageSchemaInput,
	ArticleSchemaInput,
	BreadcrumbItem,
	WebApplicationSchemaInput,
	ItemListItemInput,
	ItemListSchemaInput,
	SoftwareAppSchemaInput,
	FaqItem,
	HowToStepInput,
	HowToSchemaInput,
} from "./types";

// ── Primitives ───────────────────────────────────────────────────────────────

export {
	buildPersonSchema,
	buildOrganizationRef,
	buildOfferSchema,
	resolveSchemaType,
} from "./primitives";

// ── Schema Builders ──────────────────────────────────────────────────────────

export { buildWebSiteSchema, buildOrganizationSchema } from "./site";
export { buildWebPageSchema } from "./page";
export { buildArticleSchema } from "./article";
export { buildBreadcrumbSchema } from "./breadcrumb";
export { buildWebApplicationSchema } from "./web-application";
export { buildItemListSchema } from "./item-list";
export { buildSoftwareAppSchema } from "./software-app";
export { buildFaqPageSchema } from "./faq";
export { buildHowToSchema } from "./howto";

// ── Parsers ──────────────────────────────────────────────────────────────────

export { parseFaqSchema, parseHowToSchema, parseFeatureList } from "./parsers";
