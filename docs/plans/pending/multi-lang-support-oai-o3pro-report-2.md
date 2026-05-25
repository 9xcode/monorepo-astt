After re-evaluating every option from the standpoint of  

• 100 % static generation (no backend)  
• the smallest possible JS payload / fastest Time-to-First-Byte  
• perfect SEO (crawlable, locale–specific URLs, canonical & hreflang)  
• easy re-configuration when you want to make German the default  

there is one plan that beats the others on every axis.

--------------------------------------------------------------------
🚀  The Winner:  
Astro’s **built-in static i18n routing**  +  **Paraglide JS for UI strings**  +  **locale-split content collections**
--------------------------------------------------------------------

Why this combination?

1. Zero runtime work  
   • Astro bakes the language prefix directly into every HTML file at build time – nothing to detect or redirect in the browser.  
   • Paraglide removes translations for the other languages during tree-shaking, so each locale bundle only contains its own strings (≈0 kB overhead).

2. Smallest asset size  
   - i18next or other runtime libraries add 3-18 kB gzipped + the cost of shipping every language’s JSON.  
   - Paraglide adds <1 kB of compile-time helper code; unused locales = 0 B.

3. Perfect SEO, automatically  
   • Clean, language-scoped URLs (`/tools/…` for the default, `/de/tools/…` for German).  
   • Astro i18n + `@astrojs/sitemap` autogenerates `<link rel="alternate" hreflang>` and a multilingual sitemap.xml.  
   • If a translation is missing, Astro can optionally fall back to the English HTML copy – search engines never hit a 404.

4. Fully static CDN-friendly output  
   Every locale/page becomes a plain HTML file you can cache forever on any CDN; no edge-functions or headers required.

5. Future-proof default-locale switch  
   Flip two lines in `astro.config.mjs` (`defaultLocale` and `prefixDefaultLocale`) and the “clean” URL instantly changes from English to German.  Because nothing happens at runtime, no component code changes.

6. Developer experience  
   • Type-safe translation keys with autocompletion.  
   • Non-developers can use Inlang’s (optional) visual editor to provide translations.  
   • Content writers keep using Markdown; they only add a sibling file or folder for each language.

--------------------------------------------------------------------
Concise Implementation Checklist
--------------------------------------------------------------------

1. astro.config.mjs

```ts
export default defineConfig({
  site: 'https://your-site.com',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: { prefixDefaultLocale: false },
    fallback: { de: 'en' }
  },
  integrations: [
    // i18n-aware sitemap
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en-US', de: 'de-DE' } }
    })
  ]
})
```

2. Paraglide

```bash
npx @inlang/paraglide-astro@latest init
```

`messages/en.json`, `messages/de.json` hold UI strings.
Use in Svelte/Astro:

```ts
import * as m from '$paraglide/messages'
<p>{m.hero_title()}</p>
```

3. Content folders

```
content/
└── tools/
    ├── en/  <-- move all existing .md files here
    └── de/  <-- add translated files as you go
```

4. Update `content/config.ts` to include a `locale` field (optional but nice).

5. Language switcher component → use Astro’s `getRelativeLocaleUrl()` for zero-JS switching.

6. When you’re ready to make German the default:

```diff
- defaultLocale: 'en',
+ defaultLocale: 'de',
```

Add 301 redirects from old English URLs to `/en/...` and deploy – done.

--------------------------------------------------------------------
Result
--------------------------------------------------------------------

• HTML served instantly from the edge, one file per locale  
• JS bundles as small as today; no extra runtime libs  
• Search engines see the proper language pages and hreflang hints  
• You keep full flexibility to add languages or change the default without refactoring.

This is the fastest, leanest, and most future-proof path for your completely static Astro + Svelte site.