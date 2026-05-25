# Implementation: Done ✅

# SEO Schema Architecture Refactoring

Centralize all scattered, hardcoded JSON-LD structured data into a single, typed, reusable schema builder system using **Option C (Hybrid)**: TypeScript builder functions + a thin `<JsonLd>` Astro renderer.

## User Review Required

> [!IMPORTANT]
> **No schema output changes.** Every page will produce byte-identical JSON-LD after refactoring. The only change is _where the code lives_, not what it outputs. We verify this in Phase 7.

> [!WARNING]
> **3 pages currently have NO schemas at all** — `privacy.astro`, `terms.astro`, `disclaimer.astro`. This plan adds `WebPage` schemas to them. Additionally, `categories/index.astro` has no schema — we'll add a `CollectionPage` schema.

> [!IMPORTANT]
> **`seo_guide_final.md` has inaccuracies.** It doesn't document the `support.astro` WebPage schema or the `mobile-app.astro` SoftwareApplication schema. The new doc we create in Phase 7 will be the single source of truth.

---

## Target Architecture

```
src/components/common/seo/           ← ONE folder for all SEO building blocks
├── JsonLd.astro                     ← Generic renderer (1 line of HTML)
├── index.ts                         ← Barrel export
├── types.ts                         ← TypeScript interfaces for all schemas
├── primitives.ts                    ← Shared sub-objects (Person, Organization ref, Offer)
├── site.ts                          ← buildWebSiteSchema() + buildOrganizationSchema()
├── page.ts                          ← buildWebPageSchema() — generic pages
├── article.ts                       ← buildArticleSchema()
├── breadcrumb.ts                    ← buildBreadcrumbSchema()
├── web-application.ts               ← buildWebApplicationSchema()
├── item-list.ts                     ← buildItemListSchema()
├── software-app.ts                  ← buildSoftwareAppSchema()
├── faq.ts                           ← buildFaqPageSchema()
├── howto.ts                         ← buildHowToSchema()
└── parsers.ts                       ← Markdown→schema extractors (moved from utils/)

src/components/tool/seo/
└── ToolPageSchemas.astro            ← Thin composition (replaces monolithic ToolSEOSchemas.astro)
                                       Calls builders → renders multiple <JsonLd> tags
```

### Why two folders?

| Folder | Purpose | Analogy |
|---|---|---|
| `common/seo/` | Reusable building blocks — builders, types, renderer. Used by ANY page type. | Lego bricks |
| `tool/seo/` | Tool-page-specific composition — selects WHICH schemas to combine. | Assembled model |

When you add `/blog/`, you'll create `components/blog/seo/BlogPageSchemas.astro` that picks `buildArticleSchema()` + `buildBreadcrumbSchema()` (no `buildWebApplicationSchema()` — that's tool-only). The builders stay in `common/seo/`.

---

## Complete File Inventory

### Files to CREATE (15 files)

| # | File | Purpose |
|---|---|---|
| 1 | `src/components/common/seo/JsonLd.astro` | Generic `<script type="application/ld+json">` renderer |
| 2 | `src/components/common/seo/types.ts` | TS interfaces for all builder inputs + schema shapes |
| 3 | `src/components/common/seo/primitives.ts` | `buildPersonSchema()`, `buildOrganizationRef()`, `buildOfferSchema()` |
| 4 | `src/components/common/seo/site.ts` | `buildWebSiteSchema()`, `buildOrganizationSchema()` |
| 5 | `src/components/common/seo/page.ts` | `buildWebPageSchema()` — configurable `@type` (AboutPage, ContactPage, WebPage) |
| 6 | `src/components/common/seo/article.ts` | `buildArticleSchema()` |
| 7 | `src/components/common/seo/breadcrumb.ts` | `buildBreadcrumbSchema()` |
| 8 | `src/components/common/seo/web-application.ts` | `buildWebApplicationSchema()` |
| 9 | `src/components/common/seo/item-list.ts` | `buildItemListSchema()` |
| 10 | `src/components/common/seo/software-app.ts` | `buildSoftwareAppSchema()` |
| 11 | `src/components/common/seo/faq.ts` | `buildFaqPageSchema()` |
| 12 | `src/components/common/seo/howto.ts` | `buildHowToSchema()` |
| 13 | `src/components/common/seo/parsers.ts` | Moved from `utils/schema-parsers.ts` (no logic changes) |
| 14 | `src/components/common/seo/index.ts` | Barrel export of all builders |
| 15 | `abhii-docs/seo-schemas-architecture.md` | New documentation (replaces relevant sections of old guide) |

### Files to MODIFY (13 files)

| # | File | Change |
|---|---|---|
| 1 | `src/layouts/BaseLayout.astro` | Replace inline WebSite + Organization JSON-LD with `<JsonLd schema={...}>` |
| 2 | `src/components/tool/seo/ToolSEOSchemas.astro` | **Rename to `ToolPageSchemas.astro`**, gut internals to use builders + `<JsonLd>` |
| 3 | `src/layouts/ToolLayout.astro` | Update import path: `ToolSEOSchemas` → `ToolPageSchemas` |
| 4 | `src/pages/tools/[tool].astro` | Update parser import path: `utils/schema-parsers` → `components/common/seo/parsers` |
| 5 | `src/pages/about.astro` | Replace inline `aboutSchema` with `buildWebPageSchema()` + `<JsonLd>` |
| 6 | `src/pages/contact.astro` | Replace inline `contactSchema` with `buildWebPageSchema()` + `<JsonLd>` |
| 7 | `src/pages/support.astro` | Replace inline `supportSchema` with `buildWebPageSchema()` + `<JsonLd>` |
| 8 | `src/pages/privacy.astro` | **ADD** missing `WebPage` schema via `buildWebPageSchema()` + `<JsonLd>` |
| 9 | `src/pages/terms.astro` | **ADD** missing `WebPage` schema via `buildWebPageSchema()` + `<JsonLd>` |
| 10 | `src/pages/disclaimer.astro` | **ADD** missing `WebPage` schema via `buildWebPageSchema()` + `<JsonLd>` |
| 11 | `src/pages/mobile-app.astro` | Replace inline `appSchema` with `buildSoftwareAppSchema()` + `<JsonLd>` |
| 12 | `src/pages/index.astro` | Replace inline `itemListSchema` with `buildItemListSchema()` + `<JsonLd>` |
| 13 | `src/pages/categories/[category].astro` | Replace inline `itemListSchema` with `buildItemListSchema()` + `<JsonLd>` |

### Files to DELETE (2 files)

| # | File | Reason |
|---|---|---|
| 1 | `src/utils/schema-parsers.ts` | Moved to `src/components/common/seo/parsers.ts` |
| 2 | `src/components/tool/seo/ToolSEOSchemas.astro` | Replaced by renamed `ToolPageSchemas.astro` |

> [!NOTE]
> `src/utils/seo.ts` (contains `replaceSeoPlaceholders`) is **NOT moved**. It's a text-processing utility used by BaseLayout and ToolLayout for meta tags — not a schema builder. It stays in `utils/`.

---

## Phase-by-Phase Implementation

---

### Phase 1: Foundation — Types, Primitives, Renderer

**Goal:** Create the base infrastructure. Zero changes to existing files. Pure additive.

---

#### [NEW] `src/components/common/seo/types.ts`

TypeScript interfaces for all builder inputs. Key types:

```ts
// Input types for each builder (what the caller passes in)
export interface WebPageSchemaInput {
  type: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
  name: string;
  description: string;
  url: string;
}

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  tocHeadings?: { slug: string; text: string; depth: number }[];
  url: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface WebApplicationSchemaInput {
  name: string;
  url: string;
  description: string;
  category: string;
  screenshotUrl: string;
  dateModified: string;
  tags?: readonly string[];
  featureList?: string[];
}

export interface ItemListSchemaInput {
  name: string;
  description: string;
  url: string;
  items: {
    name: string;
    url: string;
    category: string;
  }[];
}

export interface SoftwareAppSchemaInput {
  name: string;
  description: string;
  url: string;
  operatingSystem: string;
  applicationCategory: string;
}

// ... plus HowTo and FAQ input types
```

> [!TIP]
> Every input interface uses **plain data** — no `siteConfig` dependency. Builders receive exactly what they need. This is what makes them i18n-ready: the caller resolves locale-specific values, not the builder.

---

#### [NEW] `src/components/common/seo/primitives.ts`

Shared sub-objects used across multiple schemas:

- `buildPersonSchema()` — author Person (used by Article)
- `buildOrganizationRef()` — lightweight org reference (used by WebApplication, Article publisher)
- `buildOfferSchema()` — free Offer block (used by WebApplication, SoftwareApplication, ItemList items)
- `resolveSchemaType()` — Maps category → `@type` (WebApplication + additionalType)

These prevent duplication. Today, the Offer `{ @type: "Offer", price: "0", priceCurrency }` block is hardcoded in 4 separate places. After this, it's one function call.

---

#### [NEW] `src/components/common/seo/JsonLd.astro`

The thinnest possible renderer:

```astro
---
interface Props {
  schema: Record<string, unknown>;
}
const { schema } = Astro.props;
---
<script is:inline type="application/ld+json" set:html={JSON.stringify(schema)} />
```

That's the entire file. 4 lines. Every page uses `<JsonLd schema={mySchema} />` instead of the verbose `<script is:inline type="application/ld+json" set:html={JSON.stringify(...)} />`.

---

#### [NEW] `src/components/common/seo/index.ts`

Barrel re-export of all builders + the renderer. Starts with just Phase 1 exports, grows with each phase.

---

**Phase 1 verification:** `npm run build` passes. No existing code touched.

---

### Phase 2: Schema Builders — All Builder Functions

**Goal:** Create every builder function. Still zero changes to existing files. Pure additive.

---

#### [NEW] `src/components/common/seo/site.ts`

Extracts the logic currently inline in [BaseLayout.astro L89-118](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/layouts/BaseLayout.astro#L89-L118):

- `buildWebSiteSchema({ name, url, description, publisherName, logoUrl })` → returns the `WebSite` JSON-LD object
- `buildOrganizationSchema({ name, url, logoUrl, knowsAbout, contactEmail })` → returns the `Organization` JSON-LD object

The logic is identical to what's currently in BaseLayout — just moved into a function.

---

#### [NEW] `src/components/common/seo/page.ts`

A single versatile builder for generic page schemas:

- `buildWebPageSchema({ type, name, description, url })` → returns `AboutPage`, `ContactPage`, `WebPage`, or `CollectionPage` JSON-LD

This replaces the hardcoded schemas in [about.astro L10-16](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/about.astro#L10-L16), [contact.astro L12-18](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/contact.astro#L12-L18), [support.astro L12-18](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/support.astro#L12-L18). Also adds schemas to the 3 legal pages that currently have none.

---

#### [NEW] `src/components/common/seo/article.ts`

Extracts Article schema from [ToolSEOSchemas.astro L106-150](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/tool/seo/ToolSEOSchemas.astro#L106-L150):

- `buildArticleSchema(input)` → returns `Article` JSON-LD with author `Person`, publisher `Organization`, and `hasPart` TOC links

Uses `buildPersonSchema()` and `buildOrganizationRef()` from primitives instead of re-building them inline.

---

#### [NEW] `src/components/common/seo/breadcrumb.ts`

Extracts from [ToolSEOSchemas.astro L153-182](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/tool/seo/ToolSEOSchemas.astro#L153-L182):

- `buildBreadcrumbSchema(items: BreadcrumbItem[])` → returns `BreadcrumbList` JSON-LD

Takes an array of `{ name, url }` pairs. Automatically assigns positions. Generic — works for tools, blog, projects, any depth.

**Current (hardcoded 4-level tool-specific):**
```
Home → Categories → [Category] → [Tool]
```

**New (generic, caller decides):**
```ts
buildBreadcrumbSchema([
  { name: 'Home', url: siteConfig.url },
  { name: 'Blog', url: new URL('/blog', siteConfig.url).href },
  { name: post.title, url: postUrl },
])
```

---

#### [NEW] `src/components/common/seo/web-application.ts`

Extracts from [ToolSEOSchemas.astro L63-103](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/components/tool/seo/ToolSEOSchemas.astro#L63-L103):

- `buildWebApplicationSchema(input)` → returns `WebApplication` JSON-LD

Handles category mapping, auto-keywords from tags, subcategories, featureList, and the Offer block. Uses `resolveSchemaType()` and `buildOfferSchema()` from primitives.

---

#### [NEW] `src/components/common/seo/item-list.ts`

Deduplicates the logic currently duplicated in [index.astro L77-107](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/index.astro#L77-L107) and [[category].astro L44-67](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/categories/%5Bcategory%5D.astro#L44-L67):

- `buildItemListSchema(input)` → returns `ItemList` JSON-LD with typed `ListItem` entries

Both pages currently duplicate the same `categoryMapping` → `schemaType` → `Offer` nesting logic. One builder replaces both.

---

#### [NEW] `src/components/common/seo/software-app.ts`

Extracts from [mobile-app.astro L18-31](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/mobile-app.astro#L18-L31):

- `buildSoftwareAppSchema(input)` → returns `SoftwareApplication` JSON-LD

---

#### [NEW] `src/components/common/seo/faq.ts`

Thin wrapper around the existing `parseFaqSchema` output:

- `buildFaqPageSchema(questions: { question: string; answer: string }[])` → returns `FAQPage` JSON-LD

This is a pure builder for when you have structured data (e.g., from a CMS). The parser in `parsers.ts` still handles markdown extraction.

---

#### [NEW] `src/components/common/seo/howto.ts`

Same pattern as FAQ:

- `buildHowToSchema({ name, description, steps: { name, text }[] })` → returns `HowTo` JSON-LD

---

#### Update `src/components/common/seo/index.ts`

Add all builder exports to the barrel file.

---

**Phase 2 verification:** `npm run build` passes. All new builder files are importable. No existing code changed.

---

### Phase 3: Content Parsers Migration

**Goal:** Move `schema-parsers.ts` to the SEO folder. Update one import.

---

#### [NEW] `src/components/common/seo/parsers.ts`

Copy of [src/utils/schema-parsers.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/utils/schema-parsers.ts) — **the exact same code**, just moved to the new location in the SEO folder.

Functions: `parseFaqSchema()`, `parseHowToSchema()`, `parseFeatureList()` — zero logic changes.

---

#### [MODIFY] [src/pages/tools/[tool].astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/tools/%5Btool%5D.astro)

**Line 6 — update import path:**
```diff
-import { parseFaqSchema, parseHowToSchema, parseFeatureList } from '../../utils/schema-parsers';
+import { parseFaqSchema, parseHowToSchema, parseFeatureList } from '../../components/common/seo/parsers';
```

One line change. Nothing else in this file changes.

---

#### [DELETE] `src/utils/schema-parsers.ts`

Removed after the import is updated.

---

**Phase 3 verification:** `npm run build` passes. Tool pages still generate identical HTML.

---

### Phase 4: BaseLayout Migration — Site-Wide Schemas

**Goal:** Replace the 2 inline JSON-LD blocks in BaseLayout with builder calls + `<JsonLd>`.

---

#### [MODIFY] [src/layouts/BaseLayout.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/layouts/BaseLayout.astro)

**What changes:**

1. **Add imports** (top of frontmatter):
```ts
import JsonLd from '../components/common/seo/JsonLd.astro';
import { buildWebSiteSchema, buildOrganizationSchema } from '../components/common/seo';
```

2. **Add builder calls** (bottom of frontmatter):
```ts
const webSiteSchema = buildWebSiteSchema({
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.seo.description,
  publisherName: siteConfig.companyName,
  logoUrl: new URL('/images/logo.png', siteConfig.url).href,
});

const orgSchema = buildOrganizationSchema({
  name: siteConfig.companyName,
  url: siteConfig.url,
  logoUrl: new URL('/images/logo.png', siteConfig.url).href,
  knowsAbout: siteConfig.seo.organization.knowsAbout,
  contactEmail: siteConfig.contact.email,
});
```

3. **Replace inline JSON-LD** (L89-118) with:
```astro
{/* Base Website + Organization JSON-LD */}
<JsonLd schema={webSiteSchema} />
<JsonLd schema={orgSchema} />
```

**What does NOT change:** Everything else — meta tags, theme script, slots, body.

---

**Phase 4 verification:** `npm run build`, then `diff` the JSON-LD output of any page before/after. Must be byte-identical.

---

### Phase 5: Tool Page Migration — Decompose ToolSEOSchemas

**Goal:** Refactor `ToolSEOSchemas.astro` into a thin composition that calls builders.

---

#### [MODIFY] `src/components/tool/seo/ToolSEOSchemas.astro` → **Rename to** `ToolPageSchemas.astro`

**Complete rewrite of internals, same Props interface, same output:**

The file goes from 191 lines of inline schema construction → ~50 lines that call builders:

```astro
---
import JsonLd from '../../common/seo/JsonLd.astro';
import {
  buildWebApplicationSchema,
  buildArticleSchema,
  buildBreadcrumbSchema,
} from '../../common/seo';
import { siteConfig } from '../../../config';
import { categoryToSlug } from '../../../utils/slug';

// ... same Props interface ...
const { toolTitle, description, seoUrl, ogImageUrl, category, ... } = Astro.props;

const webAppSchema = buildWebApplicationSchema({ ... });
const articleSchema = buildArticleSchema({ ... });
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Home', url: siteConfig.url },
  { name: 'Categories', url: new URL('/categories', siteConfig.url).href },
  { name: category, url: new URL(`/categories/${categoryToSlug(category)}`, siteConfig.url).href },
  { name: rawToolTitle, url: seoUrl },
]);
---
<JsonLd schema={webAppSchema} />
<JsonLd schema={breadcrumbSchema} />
<JsonLd schema={articleSchema} />
{faqSchema && <JsonLd schema={faqSchema} />}
{howToSchema && <JsonLd schema={howToSchema} />}
```

**Key:** The Props interface stays identical. ToolLayout doesn't care how the schemas are built internally.

---

#### [MODIFY] [src/layouts/ToolLayout.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/layouts/ToolLayout.astro)

**Line 18 — update import:**
```diff
-import ToolSEOSchemas from "../components/tool/seo/ToolSEOSchemas.astro";
+import ToolPageSchemas from "../components/tool/seo/ToolPageSchemas.astro";
```

**Line 162 — update component usage:**
```diff
-		<ToolSEOSchemas
+		<ToolPageSchemas
```

Two lines. Props stay identical.

---

#### [DELETE] `src/components/tool/seo/ToolSEOSchemas.astro`

Replaced by the renamed `ToolPageSchemas.astro`.

---

**Phase 5 verification:** `npm run build`, compare JSON-LD output of any tool page. Must be identical.

---

### Phase 6: Static Page Migration — Extract + Add Missing Schemas

**Goal:** Replace inline schemas on about/contact/support and ADD schemas to the 4 pages that have none.

---

#### [MODIFY] [src/pages/about.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/about.astro)

**Remove:** Lines 10-16 (inline `aboutSchema` object)  
**Add:** Import + builder call:
```diff
+import JsonLd from '../components/common/seo/JsonLd.astro';
+import { buildWebPageSchema } from '../components/common/seo';

-const aboutSchema = {
-  "@context": "https://schema.org",
-  "@type": "AboutPage",
-  ...
-};
+const aboutSchema = buildWebPageSchema({
+  type: 'AboutPage',
+  name: `About Us - ${siteConfig.name}`,
+  description: `Learn more about ${siteConfig.name}...`,
+  url: seoUrl,
+});
```

**Template:** Replace `<script is:inline ...>` with `<JsonLd schema={aboutSchema} />`.

---

#### [MODIFY] [src/pages/contact.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/contact.astro)

Same pattern as about — `type: 'ContactPage'`.

---

#### [MODIFY] [src/pages/support.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/support.astro)

Same pattern — `type: 'WebPage'` (support is a generic WebPage, not a specialized type).

---

#### [MODIFY] [src/pages/privacy.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/privacy.astro) — **NEW SCHEMA**

Currently has zero JSON-LD. Add:
```astro
<Fragment slot="head">
  <JsonLd schema={buildWebPageSchema({
    type: 'WebPage',
    name: `Privacy Policy - ${siteConfig.name}`,
    description: `Privacy Policy for ${siteConfig.name}...`,
    url: seoUrl,
  })} />
</Fragment>
```

---

#### [MODIFY] [src/pages/terms.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/terms.astro) — **NEW SCHEMA**

Same pattern as privacy — `type: 'WebPage'`.

---

#### [MODIFY] [src/pages/disclaimer.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/disclaimer.astro) — **NEW SCHEMA**

Same pattern — `type: 'WebPage'`.

---

#### [MODIFY] [src/pages/categories/index.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/categories/index.astro) — **NEW SCHEMA**

Currently has zero JSON-LD. Add a `CollectionPage` schema:
```astro
import JsonLd from '../../components/common/seo/JsonLd.astro';
import { buildWebPageSchema } from '../../components/common/seo';

const pageSchema = buildWebPageSchema({
  type: 'CollectionPage',
  name: `All Tool Categories - ${siteConfig.name}`,
  description: 'Browse all our tool categories...',
  url: seoUrl,
});
```

---

**Phase 6 verification:** `npm run build`, check all static pages have valid JSON-LD in their `<head>`.

---

### Phase 7: List Page + Mobile App Migration, Cleanup, Documentation

**Goal:** Deduplicate ItemList logic, migrate mobile-app, verify everything, create docs.

---

#### [MODIFY] [src/pages/index.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/index.astro)

**Remove:** Lines 77-107 (inline `itemListSchema` with duplicated categoryMapping logic)  
**Add:** Import + builder call:
```diff
+import JsonLd from '../components/common/seo/JsonLd.astro';
+import { buildItemListSchema } from '../components/common/seo';

-const itemListSchema = { ... 30 lines of inline logic ... };
+const itemListSchema = buildItemListSchema({
+  name: 'Featured Tools',
+  description: 'Our most popular and essential software tools.',
+  url: seoUrl,
+  items: featuredTools.map(t => ({
+    name: t.data.title,
+    url: new URL(`/tools/${t.slug}`, siteConfig.url).href,
+    category: t.data.category,
+  })),
+});
```

---

#### [MODIFY] [src/pages/categories/[category].astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/categories/%5Bcategory%5D.astro)

**Remove:** Lines 39-67 (inline `itemListSchema` — near-duplicate of homepage logic)  
**Add:** Same `buildItemListSchema()` call with category-specific data.

---

#### [MODIFY] [src/pages/mobile-app.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/mobile-app.astro)

**Remove:** Lines 18-31 (inline `appSchema`)  
**Add:**
```ts
import JsonLd from '../components/common/seo/JsonLd.astro';
import { buildSoftwareAppSchema } from '../components/common/seo';

const appSchema = buildSoftwareAppSchema({
  name: `${siteConfig.name} Mobile App`,
  description: 'Download the official MultiTools app...',
  url: seoUrl,
  operatingSystem: 'Android, iOS',
  applicationCategory: 'UtilitiesApplication',
});
```

---

#### [NEW] `abhii-docs/seo-schemas-architecture.md`

Document covering:
- Complete schema inventory (what schemas exist, which pages have them)
- Architecture overview (builders, primitives, renderer)
- How to add a schema to a new page type (step-by-step)
- How to add a brand-new schema type (step-by-step)
- i18n readiness notes
- What was removed and why (AggregateRating, SearchAction — copied from existing guide)
- Migration notes from old system

---

**Phase 7 verification:** Full build + diff validation (see Verification Plan below).

---

## What's Removed vs. Added vs. Changed

### Removed
| Item | Reason |
|---|---|
| `src/utils/schema-parsers.ts` | Moved to `src/components/common/seo/parsers.ts` (same code, new location) |
| `src/components/tool/seo/ToolSEOSchemas.astro` | Replaced by `ToolPageSchemas.astro` using builders |
| Inline `aboutSchema` in about.astro | Replaced by `buildWebPageSchema()` call |
| Inline `contactSchema` in contact.astro | Replaced by `buildWebPageSchema()` call |
| Inline `supportSchema` in support.astro | Replaced by `buildWebPageSchema()` call |
| Inline `appSchema` in mobile-app.astro | Replaced by `buildSoftwareAppSchema()` call |
| Inline `itemListSchema` in index.astro | Replaced by `buildItemListSchema()` call |
| Inline `itemListSchema` in [category].astro | Replaced by `buildItemListSchema()` call |
| Inline WebSite JSON-LD in BaseLayout.astro | Replaced by `buildWebSiteSchema()` call |
| Inline Organization JSON-LD in BaseLayout.astro | Replaced by `buildOrganizationSchema()` call |

### Added (New Schemas)
| Schema | Page | Type |
|---|---|---|
| `WebPage` | privacy.astro | **New** — was missing entirely |
| `WebPage` | terms.astro | **New** — was missing entirely |
| `WebPage` | disclaimer.astro | **New** — was missing entirely |
| `CollectionPage` | categories/index.astro | **New** — was missing entirely |

### Not Changed
| Item | Why |
|---|---|
| `src/utils/seo.ts` | Text utility, not schema-related. Stays in `utils/`. |
| `src/utils/slug.ts` | URL utility. Stays in `utils/`. |
| `src/config.ts` | Zero changes. Builders read from it, but it doesn't change. |
| 404.astro / 500.astro | `noindex` pages — no schemas needed (correct as-is). |

---

## Open Questions

> [!IMPORTANT]
> **Categories Index schema type:** I chose `CollectionPage` for `categories/index.astro` because it's a curated list of category groups. An alternative is `ItemList` (matching what `[category].astro` uses). `CollectionPage` is semantically more accurate for a "browse all categories" page. Does this work for you?

---

## Verification Plan

### Automated (after each phase)

```bash
# 1. Build must pass
npm run build

# 2. No TypeScript errors
npx tsc --noEmit

# 3. Verify JSON-LD exists in built HTML
# (spot-check key pages in dist/)
grep -c 'application/ld+json' dist/index.html          # Homepage
grep -c 'application/ld+json' dist/about/index.html     # About page
grep -c 'application/ld+json' dist/privacy/index.html   # Privacy (NEW)
grep -c 'application/ld+json' dist/terms/index.html     # Terms (NEW)
grep -c 'application/ld+json' dist/categories/index.html # Categories index (NEW)
```

### Manual — JSON-LD Diff Validation (Phase 7, final)

1. Build the project **before** any changes: `npm run build && cp -r dist dist-before`
2. Apply all changes, build again: `npm run build`
3. For each page with pre-existing schemas, extract and compare JSON-LD:
   ```bash
   # Example for homepage
   grep 'ld+json' dist-before/index.html | python3 -m json.tool > before.json
   grep 'ld+json' dist/index.html | python3 -m json.tool > after.json
   diff before.json after.json
   # Should show zero differences for existing schemas
   ```
4. For NEW schemas (privacy, terms, disclaimer, categories/index), verify the JSON-LD is valid using [Google Rich Results Test](https://search.google.com/test/rich-results).

### Browser Verification

After final build, open the dev server and check:
- Schema renders correctly in `<head>` of each page type
- No duplicate schemas (e.g., two Organizations on the same page)
- No console errors
