# SEO Schemas Architecture

> **Single source of truth** for all JSON-LD structured data in the project.
> Updated: April 2026

## Overview

All SEO schema generation is centralized in `src/components/common/seo/`. The architecture follows the **Hybrid Pattern** (Option C): TypeScript builder functions produce schema objects, and a thin `<JsonLd>` Astro component renders them.

**Key properties:**
- **Zero runtime overhead** — all schemas are built at SSG build time
- **Typed builders** — TypeScript interfaces catch invalid data at compile time
- **i18n-ready** — builders accept plain data (no global config dependency), so callers can pass locale-specific values when i18n is implemented
- **No `AggregateRating`** — explicitly excluded (not eligible without verified reviews)
- **No `SearchAction`** — explicitly excluded (client-side modal search, not a /search endpoint)

---

## Directory Structure

```
src/components/common/seo/
├── JsonLd.astro              ← Generic <script type="application/ld+json"> renderer
├── ToolPageSchemas.astro     ← Tool page composition (calls builders → renders JsonLd)
├── index.ts                  ← Barrel export for all builders + types
├── types.ts                  ← TypeScript interfaces for all builder inputs
├── primitives.ts             ← Shared sub-schemas (Person, Organization, Offer)
├── site.ts                   ← buildWebSiteSchema() + buildOrganizationSchema()
├── page.ts                   ← buildWebPageSchema() — generic page types
├── article.ts                ← buildArticleSchema()
├── breadcrumb.ts             ← buildBreadcrumbSchema()
├── web-application.ts        ← buildWebApplicationSchema()
├── item-list.ts              ← buildItemListSchema()
├── software-app.ts           ← buildSoftwareAppSchema()
├── faq.ts                    ← buildFaqPageSchema()
├── howto.ts                  ← buildHowToSchema()
└── parsers.ts                ← Markdown → schema extractors (FAQ, HowTo, Features)
```

---

## Schema Inventory — What Runs Where

| Page | Schema Type(s) | Source |
|---|---|---|
| **Every page** (via BaseLayout) | `WebSite` + `Organization` | `site.ts` |
| `/tools/[tool]` | `WebApplication` + `Article` + `BreadcrumbList` + `FAQPage`* + `HowTo`* | `ToolPageSchemas.astro` |
| `/` (homepage) | `ItemList` (featured tools) | `item-list.ts` |
| `/categories/[category]` | `ItemList` (category tools) | `item-list.ts` |
| `/categories` (index) | `CollectionPage` | `page.ts` |
| `/about` | `AboutPage` | `page.ts` |
| `/contact` | `ContactPage` | `page.ts` |
| `/support` | `WebPage` | `page.ts` |
| `/privacy` | `WebPage` | `page.ts` |
| `/terms` | `WebPage` | `page.ts` |
| `/disclaimer` | `WebPage` | `page.ts` |
| `/get-app` | `SoftwareApplication` | `software-app.ts` |
| `/404` | None (noindex) | — |

*\* FAQPage and HowTo are conditional — only rendered when the tool's markdown contains the matching sections.*

---

## How To: Add a Schema to a New Page

### Static page (e.g., `/careers`)

```astro
---
import JsonLd from '../components/common/seo/JsonLd.astro';
import { buildWebPageSchema } from '../components/common/seo';
import { siteConfig } from '../config';

const seoUrl = new URL('/careers', siteConfig.url).href;
const pageSchema = buildWebPageSchema({
  type: 'WebPage',
  name: `Careers - ${siteConfig.name}`,
  description: 'Join the team...',
  url: seoUrl,
});
---
<BaseLayout ...>
  <Fragment slot="head">
    <JsonLd schema={pageSchema} />
  </Fragment>
  ...
</BaseLayout>
```

### Blog post (future `/blog/[slug]`)

```astro
---
import JsonLd from '../../components/common/seo/JsonLd.astro';
import { buildArticleSchema, buildBreadcrumbSchema } from '../../components/common/seo';
import { getContentDates } from '../../integrations/content-dates/resolver.ts';

// Dates are pre-resolved by the content-dates integration:
//   frontmatter publishedAt/updatedAt → git → publishedAt fallback
const { publishedAt, updatedAt } = getContentDates('blog', slug);

const articleSchema = buildArticleSchema({
  headline: post.title,
  description: post.description,
  imageUrl: ogImage,
  datePublished: publishedAt,
  dateModified: updatedAt,
  author: { name: '...', jobTitle: '...', ... },
  publisher: { name: '...', url: '...', logoUrl: '...' },
  tocHeadings: headings,
  pageUrl: seoUrl,
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Home', url: siteConfig.url },
  { name: 'Blog', url: new URL('/blog', siteConfig.url).href },
  { name: post.title, url: seoUrl },
]);
---
<BaseLayout ...>
  <Fragment slot="head">
    <JsonLd schema={articleSchema} />
    <JsonLd schema={breadcrumbSchema} />
  </Fragment>
  ...
</BaseLayout>
```

**Note:** Blog pages do NOT use `buildWebApplicationSchema()` — that's tool-page-only. This is exactly why the builders are separate from the composition component.

---

## How To: Add a New Schema Type

1. Create `src/components/common/seo/your-schema.ts`:
   ```ts
   import type { YourSchemaInput } from './types';

   export function buildYourSchema(input: YourSchemaInput): Record<string, unknown> {
     return {
       "@context": "https://schema.org",
       "@type": "YourType",
       // ... build from input
     };
   }
   ```

2. Add the input interface to `types.ts`

3. Export from `index.ts`:
   ```ts
   export { buildYourSchema } from './your-schema';
   ```

4. Use in pages:
   ```astro
   <JsonLd schema={buildYourSchema({ ... })} />
   ```

---

## i18n Readiness

When i18n is implemented, the migration path is:

1. Each builder already accepts a plain `url` string — pass the locale-prefixed URL
2. Add an optional `locale` property to `ArticleSchemaInput`:
   ```ts
   // article.ts
   if (input.locale) { article["inLanguage"] = input.locale; }
   ```
3. Pass translated `name`, `description`, `headline` values from the caller
4. Breadcrumb labels come from the caller — pass translated crumb names

**No builder logic needs to change.** Only call sites resolve locale-specific data.

---

## Deleted Files (Historical Reference)

| Old File | Replacement | Why |
|---|---|---|
| `src/utils/schema-parsers.ts` | `src/components/common/seo/parsers.ts` | Moved to SEO folder (same code) |
| `src/components/tool/seo/ToolSEOSchemas.astro` | `src/components/common/seo/ToolPageSchemas.astro` | Refactored to use builders |

---

## Rules

1. **Never add `AggregateRating`** — the site has no verified review system
2. **Never add `SearchAction`** — search is a client-side JS modal, not a URL-based endpoint
3. **All schemas must use `@context: "https://schema.org"`** — builders handle this automatically
4. **Builders must NOT import from `siteConfig` directly** — callers pass resolved values
5. **All schema rendering uses `<JsonLd>`** — no raw `<script type="application/ld+json">` tags in page files
