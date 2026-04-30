/**
 * SEO Schema Types
 *
 * TypeScript interfaces for all JSON-LD schema builder inputs.
 * Builders accept plain data — no siteConfig dependency — making them
 * independently testable and i18n-ready (callers resolve locale-specific values).
 */

// ── Shared Types ─────────────────────────────────────────────────────────────

/** Heading extracted from markdown content (used for TOC and Article hasPart) */
export interface Heading {
	slug: string;
	text: string;
	depth: number;
}

/** Maps a tool category to its Schema.org application type(s) */
export interface CategoryMapping {
	appCategory: string;
	additionalType?: string;
}

// ── Primitive Input Types ────────────────────────────────────────────────────

/** Input for building a Schema.org Person object (author) */
export interface PersonSchemaInput {
	name: string;
	jobTitle: string;
	description: string;
	knowsAbout: string[];
	url?: string;
	imageUrl: string;
	sameAs: string[];
}

/** Input for building a compact Schema.org Organization reference (publisher/creator) */
export interface OrganizationRefInput {
	name: string;
	url: string;
	logoUrl?: string;
	knowsAbout?: string[];
}

/** Input for building a Schema.org Offer object */
export interface OfferInput {
	price?: string;
	priceCurrency?: string;
}

// ── Builder Input Types ─────────────────────────────────────────────────────

/** Input for buildWebSiteSchema() */
export interface WebSiteSchemaInput {
	name: string;
	url: string;
	description: string;
	publisherName: string;
	publisherLogoUrl: string;
}

/** Input for buildOrganizationSchema() — the full standalone Organization */
export interface OrganizationSchemaInput {
	name: string;
	url: string;
	logoUrl: string;
	knowsAbout: string[];
	contactEmail: string;
}

/** Input for buildWebPageSchema() — generic page types */
export interface WebPageSchemaInput {
	type: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
	name: string;
	description: string;
	url: string;
}

/** Input for buildArticleSchema() */
export interface ArticleSchemaInput {
	headline: string;
	description: string;
	imageUrl: string;
	datePublished: string;
	dateModified: string;
	author: PersonSchemaInput;
	publisher: OrganizationRefInput;
	tocHeadings?: Heading[];
	pageUrl: string;
}

/** A single breadcrumb level */
export interface BreadcrumbItem {
	name: string;
	url: string;
}

/** Input for buildWebApplicationSchema() — tool pages */
export interface WebApplicationSchemaInput {
	name: string;
	url: string;
	description: string;
	screenshotUrl: string;
	dateModified: string;
	categoryMapping: CategoryMapping;
	operatingSystem: string;
	browserRequirements: string;
	isAccessibleForFree: boolean;
	softwareVersion: string;
	creator: OrganizationRefInput;
	priceCurrency: string;
	tags?: readonly string[];
	featureList?: string[];
	defaultKeywords?: string[];
	/** The display name of the tool (used in keyword generation) */
	toolTitle: string;
	/** The category name (used in keyword generation) */
	category: string;
}

/** A single item within an ItemList */
export interface ItemListItemInput {
	name: string;
	url: string;
	categoryMapping: CategoryMapping;
	operatingSystem: string;
	priceCurrency: string;
}

/** Input for buildItemListSchema() — homepage featured, category pages */
export interface ItemListSchemaInput {
	name: string;
	description: string;
	url: string;
	items: ItemListItemInput[];
}

/** Input for buildSoftwareAppSchema() — mobile app page */
export interface SoftwareAppSchemaInput {
	name: string;
	description: string;
	url: string;
	operatingSystem: string;
	applicationCategory: string;
	priceCurrency: string;
}

/** A single FAQ question-answer pair */
export interface FaqItem {
	question: string;
	answer: string;
}

/** A single HowTo step */
export interface HowToStepInput {
	name: string;
	text: string;
}

/** Input for buildHowToSchema() */
export interface HowToSchemaInput {
	name: string;
	description: string;
	steps: HowToStepInput[];
}
