==== Note for AI or LLM Models ===
IMPORTANT: Do not Read this file and do not choose any task or feature from the list below by yourself. I will tell you what to do. You can suggest me then new task or feature to do but do not choose by yourself.
==========


==== FUTURE TASK ======

- [ ] Create tsconfig.sites.json at the root and shrink each site's tsconfig.json to a single extends line. read plan [tsconfig-files-centralization-plan](tsconfig-files-centralization-plan.md)

- [ ] Add sitemap: false/true feature in content/tools/.../index.md frontmatter so that page will be included or excluded from sitemap.xml (right now its done by `canonical`, `isDraft` and `noindex` formatters) and i don't think we still need this `sitemap: true/false` feature)

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

- [ ] **Mobile App Issue**: Capacitor's internal web server is not as smart as a cloud server (like Vercel). When Astro generates your web app, it creates folders with index.html files inside (e.g., dist/tools/sip-calculator/index.html). On the web, if you visit /tools/sip-calculator, Vercel is smart enough to serve the index.html file silently. However, Capacitor's local Android server strictly maps URLs to literal files. When it receives a request for /tools/sip-calculator, it looks for a file named exactly sip-calculator. When it doesn't find it, it 404s, and its built-in SPA-fallback mechanism reloads the homepage index.html instead.
  - (Side note: The Javascript interceptor I gave you failed because Svelte/UI frameworks use event delegation that stops the click event before it reaches the document. While fixable with { capture: true }, you are completely right—we should use a proper architectural solution that natively handles all links like about, privacy, etc.)


===============
## Fixes

- change the stretagy fro build time (modifiedDate)

--------
