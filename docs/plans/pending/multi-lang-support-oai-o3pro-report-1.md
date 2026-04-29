Below is a “long-list → short-list → winner” analysis so you can see every serious approach that fits an Astro + Svelte5, content-heavy, statically-generated site.  
Read the whole thing once, then jump to the “Recommended Plan” section when you’re ready to start coding.

────────────────────────────────────────────────────────
1. WHAT WE HAVE TO SOLVE
────────────────────────────────────────────────────────
A. Localised routing  
   • /en/tools/loan-calculator, /de/tools/darlehensrechner, …  
   • Ability to switch default locale later (e.g. German becomes /, English moves to /en).

B. Localised content  
   • 27 markdown tools, dozens of pages, UI strings inside Astro + Svelte components.

C. Static prerendering (no Node server in production) with perfect SEO  
   • Unique URLs, <link rel="alternate" hreflang="…" />, sitemap, canonical, etc.

D. Developer DX  
   • Works with TypeScript, Svelte Runes, Tailwind, Vite Hot-Reload.  
   • Prefer file-system conventions over boilerplate.

────────────────────────────────────────────────────────
2. CANDIDATE STRATEGIES
────────────────────────────────────────────────────────
Below are the five models generally used in Astro projects; each can be combined with a translation service (Crowdin, Lokalise, POEditor…), but that’s an orthogonal decision.

--------------------------------------------------------
Strategy A – “Duplicate Build” (one build per locale)
--------------------------------------------------------
• Build script runs N times, changing BASE_URL and copying a locale folder to /dist/XX  
• Extremely simple, no plugin.  
• Cons: multiplies build time, you maintain many almost-identical repositories in /dist, cannot share caches, no DX help for routing, hard to change default locale.

--------------------------------------------------------
Strategy B – “Route Prefix + Content Collections” (folder per locale)
--------------------------------------------------------
• /src/content/**en**/tools/…, /src/content/**de**/tools/…  
• Astro’s `content/config.ts` defines a schema that includes `lang`.  
• Route patterns: `/pages/[lang]/about.astro`, `/pages/[lang]/tools/[tool].astro`.  
• UI strings live in JSON or `.ts` resource files (ex: `src/i18n/en.json`) consumed via i18n lib.  
• Pro: zero third-party runtime, fully static, great TypeScript typing, easy to change default by aliasing `/` to `/de`.  
• Con: Some repetitive folders; you hand-roll helpers for `hreflang`.

--------------------------------------------------------
Strategy C – “astro-i18next” integration
--------------------------------------------------------
• Officially maintained by Astro team (github.com/astrojs/i18next).  
• Provides:  
  – Route generator (`/:lang?/about`, optional prefix)  
  – `t()` helper usable in `.astro` AND `.svelte`.  
  – Automatic `hreflang`, `html[lang]`, translated head tags.  
• You put resources under `/src/locales/en/common.json`, `/de/common.json`, etc.  
• Content Collections integrate via `t()` or separate markdown folders.  
• Pro: Turn-key, supports future default switch (set `defaultLocale: 'de'`), fast one-pass build.  
• Con: Adds i18next (~20 kB per page before tree-shaking) – negligible but not zero.

--------------------------------------------------------
Strategy D – “Svelte-only runtime i18n (svelte-i18n, @sveltekit/intl)”  
--------------------------------------------------------
• Works great inside Svelte widgets, but Astro pages still need a second solution.  
• Requires client JS for every page → worse performance than A-C.  
• Not recommended for a mostly-static marketing site.

--------------------------------------------------------
Strategy E – “Headless CMS with built-in locales (e.g. Contentful, Sanity, Strapi)”
--------------------------------------------------------
• Move markdown to remote CMS, query via REST/GraphQL at build.  
• Excellent for non-technical translators, maintains revision history.  
• Adds cost, complexity, network builds, vendor lock-in – out of scope unless you plan large editorial team.

────────────────────────────────────────────────────────
3. SCORING & SHORT-LIST
────────────────────────────────────────────────────────
Criteria: Static SEO (30 %), DX (25 %), Build Time (15 %), Runtime Payload (15 %), Future Default Swap (15 %)

| Strategy | SEO | DX | Build | Payload | Default-swap | Total |
|----------|-----|----|-------|---------|--------------|-------|
| A        | 30  | 10 |  5    | 15      |  0           | 60/100 |
| B        | 30  | 20 | 12    | 15      | 12           | 89/100 |
| C        | 30  | 25 | 13    | 13      | 15           | 96/100 |
| D        | 25  | 18 | 15    |  5      | 10           | 73/100 |
| E        | 30  | 20 |  8    | 15      | 15           | 88/100 |

Strategy C wins clearly.

────────────────────────────────────────────────────────
4. RECOMMENDED PLAN (Strategy C: astro-i18next + content folders)
────────────────────────────────────────────────────────
Phase 0 Install
--------------------------------
1. npm i @astrojs/i18next i18next  
2. // astro.config.mjs  
   import i18n from '@astrojs/i18next';  
   export default defineConfig({  
     integrations: [i18n({  
       defaultLocale: 'en',           // can switch to 'de' later in one line  
       locales: ['en', 'de', 'fr'],   // add whenever needed  
       routingStyle: 'prefix_except_default', // english = /, de = /de/…  
       showDefaultLang: false,        // keeps / for default  
     })]  
   });

Phase 1 Folder structure
--------------------------------
src/
├── locales
│   ├── en
│   │   ├── common.json         // UI strings
│   │   └── tools.json          // tool-specific UI
│   └── de
│       ├── common.json
│       └── tools.json
└── content
    ├── en
    │   └── tools/auto-loan-calculator/index.md
    └── de
        └── tools/auto-loan-calculator/index.md

Tip: If a translation is missing Astro will fallback to `defaultLocale` automatically.

Phase 2 Typed translations in components
--------------------------------
Astro page example:
```astro
---
import { t, locale } from '@astrojs/i18next';
const title = t('common:siteTitle');
---
<html lang={locale}>
  <head><title>{title}</title></head>
  …
```

Svelte widget example (works because astro-i18next auto-injects i18next instance):
```svelte
<script lang="ts">
  import { t } from 'i18next';
</script>

<h2>{t('tools:autoLoan.heading')}</h2>
```

Phase 3 Routing updates
--------------------------------
1. Rename `/pages/about.astro` ➔ `/pages/[lang]/about.astro`  
2. For your tool page:  
   `/pages/tools/[tool].astro` ➔ `/pages/[lang]/tools/[tool].astro`  
   Inside, grab the lang param:

```astro
---
const { lang, tool } = Astro.params;
const entry = await getEntryBySlug('tools', tool, { lang });
---
```

Phase 4 SEO helpers
--------------------------------
Create `src/utils/seo.ts`:

```ts
import { getAlternateLinks } from '@astrojs/i18next';

export function seo({ title, description, url }: Meta) {
  return {
    title,
    description,
    link: [
      ...getAlternateLinks(url),   // adds hreflang & canonical
    ],
  };
}
```

Use inside layouts. This keeps SEO 100 % compliant.

Phase 5 Default language switch (future)
--------------------------------
1. Change `defaultLocale: 'de'` in astro.config.  
2. Remove `showDefaultLang` or set to `false` so German occupies `/`.  
3. Run `npm run build` – done. English version now lives under `/en/*` without code changes.

Phase 6 Automation & L10n Workflow (optional)
--------------------------------
• Add `npm run i18n:extract` script using [i18next-parser] to pull new keys into `/locales/en/*.json`.  
• Connect Crowdin/Lokalise GitHub action to create PRs with translated JSON + markdown.

────────────────────────────────────────────────────────
5. MIGRATION CHECKLIST
────────────────────────────────────────────────────────
☑ Install packages & update astro.config  
☑ Move existing markdown into /content/en  
☑ Duplicate one tool markdown into /content/de for testing  
☑ Introduce `[lang]` route segment pages  
☑ Create `/src/locales/en/common.json` with a few UI strings  
☑ Refactor UI copy in Header.astro/Footer.astro into t('…') calls  
☑ Build + run `npm run preview` → verify /, /de/, language switcher  
☑ Add automated extraction & translation workflow when ready

────────────────────────────────────────────────────────
6. RESULT
────────────────────────────────────────────────────────
• Single-pass, fast build that outputs every locale side-by-side.  
• Near-zero runtime overhead (i18next resources are tree-shaken; only the keys used on the page are inlined).  
• All content & UI fully typed, with instant Vite HMR when translators update JSON/markdown.  
• Default language can be flipped in seconds.  
• Scales from 2 to 20+ locales without structural changes.

That’s the “best-of-both-worlds” plan for an Astro 5 + Svelte5 static site.  
Happy internationalising!