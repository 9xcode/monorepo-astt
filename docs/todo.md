==== Note for AI or LLM Models ===
IMPORTANT: Do not Read this file and do not choose any task or feature from the list below by yourself. I will tell you what to do. You can suggest me then new task or feature to do but do not choose by yourself.
==========


==== FUTURE TASK ======
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

- core have author image in assets but i think its site specific

- theme styles also found in evey site but its core feature and we can change theme from the config so i don't think that we still need styles in evey sites 
🔵 LOW-3: sites/finance-tools/src/styles/ May Contain Stale Theme Files
The site's src/styles/ contains 10 theme CSS files. These should have been moved entirely to core/src/styles/themes/ (which also has 10 theme files). Since @active-theme alias points to core, the site-level copies are unreferenced.
Action: Verify they are identical. If so, delete sites/finance-tools/src/styles/ to remove dead CSS.


- fonts in public folder of sites, but that is not related to site, its core feature for the og image generation 

- user images in evey site assets folder but i don't know where it should be, in evey site or in core so tell me ?

- i think core also should have integration component ? what you think ?

- is there any way that we can do with the content.config.ts and categories and tags are defind inside core but its site specific! right ?

- other files like tsconfig, astro config, svelte config and etc are correctly managed or we can do more that can make it more global like 


===============
## Fixes

### ⚠️ Real Gaps (Evidence-Based)

**1. `JsonLd.astro` renders unescaped HTML via `set:html`**

```astro
<script is:inline type="application/ld+json" set:html={JSON.stringify(schema)} />
```

`JSON.stringify` does **not** escape `</script>` sequences. If any schema field contains the string `</script>` (e.g., a tool description), it will break the JSON-LD block and potentially the page. The fix is one line:

```ts
JSON.stringify(schema).replace(/<\/script>/gi, '<\\/script>')
```

This is a real XSS-class bug, low probability but real.

---

**2. `WebPageSchema` is incomplete — missing `isPartOf` and `breadcrumb`**

Your `buildWebPageSchema()` returns only `name`, `description`, `url`. Google's [WebPage documentation](https://schema.org/WebPage) expects `isPartOf` linking back to the WebSite entity and ideally a `breadcrumb`. This matters for the static pages (about, privacy, terms, contact, disclaimer, support). These pages get no breadcrumb JSON-LD at all currently.

---

**3. `buildOrganizationSchema` uses a bare string for `logo`, inconsistent with other schemas**

```ts
// site.ts — standalone Organization
logo: input.logoUrl,   // plain string

// primitives.ts — publisher in Article
logo: { "@type": "ImageObject", url: input.logoUrl }  // ImageObject
```

The comment in `site.ts` line 43 acknowledges this. Google's structured data [requires `ImageObject` for `logo`](https://developers.google.com/search/docs/appearance/structured-data/logo) — the plain string variant may not get recognized. Both should use `ImageObject`.

---

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
