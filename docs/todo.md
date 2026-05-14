==== Note for AI or LLM Models ===
IMPORTANT: Do not Read this file and do not choose any task or feature from the list below by yourself. I will tell you what to do. You can suggest me then new task or feature to do but do not choose by yourself.
==========


==== FUTURE TASK ======

- [ ] Create tsconfig.sites.json at the root and shrink each site's tsconfig.json to a single extends line. read plan [tsconfig-files-centralization-plan](tsconfig-files-centralization-plan.md)

- [ ] Add sitemap: false/true feature in content/tools/.../index.md frontmatter so that page will be included or excluded from sitemap.xml

- [ ] Add Robots index management feature in content/tools/.../index.md frontmatter so that we can manage index/noindex etc

- [ ] In Future Add `<xhtml:link rel="alternate" hreflang="...">` if you offer tools in multiple languages.

- [ ] **SEO Schema Update:** Integrate `aggregateRating` and review JSON-LD into `ToolSEOSchemas.astro` once the real Supabase/Turso rating system backend is fully built.


### 📢 Ads & Core Web Vitals (implement when real ad network is added) (Skip for now)
- [ ] **Lazy-load ad slots via GPT API** — Use `googletag.pubads().enableLazyLoad()` so ads only fire when their slot enters the viewport. Standard approach at NYT, Forbes, etc.
- [ ] **Load ad SDK with `async` + `defer`** — Never load `googletag.js` synchronously. Always `<script async src="...">` to prevent render-blocking.
- [ ] **Explicit ad slot dimensions** — Already done (`min-height` on placeholders). When real ads are wired in, add fixed `width`/`height` to prevent CLS.



letter do ad this : https://www.google.com/preferences/source?q=https://redeemcodetoday.com  (just like levelgeeks did)

==============

## Task's and New Features to add in future

- Copy/download result button

- Download as PDF/Image is an active feature you build and users discover. It adds real value — user gets a branded document they can save, share, or show to a bank. Your branding and URL appear on every downloaded file which is passive marketing. For financial calculators specifically this is genuinely useful — mortgage results, loan amortization tables, retirement projections are all things people want to keep.

- add charts/graphs to aall the tools

- [later] remove boilerplate code from the pages (about, contact, privacy, terms, etc)

- Segregate the code and complete project structure
- Improve and combine the documentation

=========

## Fix (I will tell you what to fix, don't choose by yourself)

- [] change support page completley

===============
## Fixes


### ⚠️ Real Gaps (Evidence-Based)


**4. `WebSiteSchema` is missing `potentialAction` (Sitelinks Searchbox)**

```ts
// site.ts — current
export function buildWebSiteSchema(...)  {
  return { "@type": "WebSite", name, url, description, publisher }
  // ← no potentialAction
}
```

If you have a search feature (`features.search.enabled`), you're missing the Sitelinks Searchbox signal:

```json
"potentialAction": {
  "@type": "SearchAction",
  "target": { "@type": "EntryPoint", "urlTemplate": "https://yourdomain.com/?q={search_term_string}" },
  "query-input": "required name=search_term_string"
}
```

This is conditional — only emit when search is enabled.

---

**5. `SoftwareAppSchema` (mobile-app page) is missing `url`-level `offers` clarity**

```ts
// software-app.ts
offers: buildOfferSchema({ priceCurrency: input.priceCurrency }),
// missing: availability, url pointing to app store listing
```

Minor, but the `offers` for a mobile app should ideally include `"availability": "https://schema.org/InStock"` so it validates cleanly in Google's Rich Results Test.

---

**6. `WebApplicationSchemaInput.datePublished` is missing**

```ts
// types.ts — WebApplicationSchemaInput
dateModified: string;   // ✅ present
// datePublished: string  ← MISSING
```

`WebApplication` schema should have both `datePublished` and `dateModified`. You pass `datePublished` to the Article schema co-located on tool pages, but not to the WebApplication schema itself. Google [recommends both](https://developers.google.com/search/docs/appearance/structured-data/software-app).

---

**7. Static pages have duplicate `description` — defined twice, no single source**

In `about.astro`:
```astro
// line 15 — in buildWebPageSchema()
description: `Learn more about ${siteConfig.name}, our mission...`

// line 19 — in BaseLayout description prop
description={`Learn more about ${siteConfig.name}, our mission...`}
```

Same string literal written twice. If someone updates one, the other becomes stale. Should be extracted to a `const`.
