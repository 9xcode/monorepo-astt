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

- is there any way that we can do with the content.config.ts and categories and tas are defind inside core but its site specific! right ?

- other files like tsconfig, astro config, svelte config and etc are correctly managed or we can do more that can make it more global like 



---
MEDIUM-1: Duplicate SEO Components in Two Locations
SEO files exist in two separate locations inside core:

core/src/seo/ — barrel file only (index.ts that re-exports from location 2)
core/src/components/common/seo/ — where the actual files live
Pages in core/src/pages/ import directly from ../../components/common/seo/.... The export @mtools/core/seo → core/src/seo/index.ts → re-exports from ../components/common/seo/. So SEO was never actually moved to core/src/seo/ — only a forwarding barrel was added.

Impact: Confusing directory layout; the core/src/seo/ directory misleads future developers.

Fix options:

Move actual files to core/src/seo/ and update all internal imports in core/src/pages/ (preferred)
OR delete core/src/seo/ barrel and update core/package.json exports to point at core/src/components/common/seo/index.ts directly

----------
🔵 LOW-1: llms-full.txt.ts Imports From Old components/common/seo Path
ts
// core/src/pages/llms-full.txt.ts
import { buildLlmsFullContent } from '../components/common/seo/llms-generator';
Works correctly but inconsistent — the plan's exported @mtools/core/seo pattern would expect this to be at core/src/seo/. This will be resolved when the duplicate SEO issue (MEDIUM-1) is fixed.


---------


💡 3. Enable Turborepo Remote Cache When CI is Activated
CI workflow already has TURBO_TOKEN and TURBO_TEAM placeholder env vars. Enables cache sharing across runs and developers. Dramatically speeds up CI when multiple sites exist.

-----
