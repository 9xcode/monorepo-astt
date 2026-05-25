# Internationalization (i18n) Strategy for Your Astro Site

Let me do a thorough analysis of all viable approaches before giving you the final recommendation.

---

## The Landscape of i18n Approaches

### Approach 1: Astro's Built-in i18n Routing (v4.0+)

Astro has native i18n support with `i18n` config in `astro.config.mjs`. It handles routing like `/en/tools/mortgage-calculator` and `/de/tools/mortgage-calculator` automatically.

**How it works:**
- You configure `defaultLocale` and `locales` in astro config
- Astro generates locale-prefixed routes automatically
- You use `getRelativeLocaleUrl()` and `Astro.currentLocale` helpers built-in
- Content collections can be organized by locale folder

**Pros:**
- Zero extra dependencies, it's baked in
- Official support, will be maintained long-term
- Works perfectly with Astro 5's content layer
- `prefixDefaultLocale: false` means English stays at `/tools/mortgage-calculator` (no `/en/` prefix) while German goes to `/de/tools/mortgage-calculator`
- Very clean routing model

**Cons:**
- You still have to wire up all the translation logic yourself (UI strings, date formats, etc.)
- No automatic translation — you write all copy manually
- Content (MDX/MD files) still needs to be duplicated per locale

---

### Approach 2: Paraglide JS (by Inlang)

[Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) is a next-gen i18n library built specifically for compile-time translation. There's an official Astro integration.

**How it works:**
- Translations are stored in `.json` message files (`messages/en.json`, `messages/de.json`)
- At build time, Paraglide tree-shakes unused translations — only the strings for the current locale are bundled
- Each locale gets its own JS bundle with zero dead weight
- Works with Svelte components too via `@inlang/paraglide-svelte`

**Pros:**
- Extremely small bundle size — unused locale strings are completely removed at build time
- Type-safe translations — you get autocomplete on every translation key
- Works seamlessly with both Astro and Svelte 5
- The Inlang ecosystem has a visual editor (Fink) for non-developers to translate
- Split bundles per locale means `/de/` pages never load English strings

**Cons:**
- Newer tooling, smaller community vs. i18next
- The Astro integration is still maturing
- More complex initial setup than a simple JSON approach

---

### Approach 3: i18next / react-i18next Pattern (adapted for Svelte)

The classic battle-tested approach — `i18next` with a Svelte adapter or a simpler roll-your-own store.

**How it works:**
- Translation JSONs per language (`locales/en/common.json`, `locales/de/common.json`)
- A Svelte store holds the current language and exposes a `t()` function
- Components call `$t('key')` to get translated strings

**Pros:**
- Massive ecosystem, tons of plugins (pluralization, interpolation, namespace splitting)
- Most developers already know it
- Very flexible

**Cons:**
- Runtime overhead — all locale strings are loaded at runtime, not tree-shaken
- For a static site, this adds unnecessary JS weight
- Doesn't integrate natively with Astro's routing

---

### Approach 4: File-based Content Duplication Only (No Library)

The simplest possible approach: duplicate your content MD files per locale, use Astro's built-in i18n routing, and handle UI strings with a simple TypeScript dictionary.

```
content/tools/mortgage-calculator/
├── index.en.md
└── index.de.md
```

Or:
```
content/
├── en/
│   └── tools/
└── de/
    └── tools/
```

**Pros:**
- Zero runtime JS overhead
- Full control
- Easy to understand

**Cons:**
- You manually maintain a TypeScript `translations.ts` file for UI strings
- No type safety on keys unless you do it yourself
- Scales poorly — every new string needs manual addition in every language file

---

### Approach 5: Hybrid — Astro i18n Routing + Paraglide for UI Strings + Content Collections per Locale

This is the "best of all worlds" approach combining Astro's native routing backbone with Paraglide's compile-time type-safe translations for UI strings, and content collections organized by locale.

---

## The Final Recommended Plan

After analyzing all options against your specific stack (Astro 5 + Svelte 5 Runes + static site + potential future default locale change), here is the definitive plan:

### **Astro Native i18n Routing + Paraglide JS + Locale-split Content Collections**

This is the best plan because it gives you: native routing (no extra dep), type-safe compile-time UI translations (Paraglide), zero bundle bloat, clean locale switching, and full flexibility to change the default locale in the future without touching a single component.

---

## Full Implementation Plan

### Step 1: Configure Astro's Native i18n

```js
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: {
      prefixDefaultLocale: false, // English stays at /tools/..., German at /de/tools/...
    },
    fallback: {
      de: 'en', // If a DE page doesn't exist yet, fall back to EN
    },
  },
})
```

The `prefixDefaultLocale: false` is critical for your use case. English stays clean (`/tools/mortgage-calculator`), German gets prefixed (`/de/tools/mortgage-calculator`). When you want to switch the default to German in the future, you just change `defaultLocale: 'de'` and set `prefixDefaultLocale: false` — German becomes the clean URL and English gets prefixed. **No component changes needed.**

---

### Step 2: Install Paraglide for UI String Translations

```bash
npx @inlang/paraglide-astro@latest init
```

This sets up the Vite plugin and creates your messages folder:

```
project.inlang/
messages/
├── en.json
└── de.json
```

Your `en.json` contains all UI strings:
```json
{
  "nav_home": "Home",
  "nav_tools": "Tools",
  "hero_title": "Financial Tools",
  "hero_subtitle": "Free, fast, and accurate.",
  "tool_calculate_btn": "Calculate",
  "footer_rights": "All rights reserved"
}
```

In your Astro/Svelte components you use:
```ts
import * as m from '$paraglide/messages'

// In Svelte 5 runes style:
// m.nav_home() → "Home" in EN, "Startseite" in DE
```

It's fully type-safe — TypeScript will error if you use a key that doesn't exist in your messages files.

---

### Step 3: Restructure Content Collections

Reorganize your `content/tools/` into locale subfolders:

```
content/
└── tools/
    ├── en/
    │   ├── mortgage-calculator/
    │   │   └── index.md
    │   ├── compound-interest-calculator/
    │   │   └── index.md
    │   └── ... (all your current tools)
    └── de/
        ├── mortgage-calculator/
        │   └── index.md  ← German translated content
        └── ... (add as you translate)
```

Update `content/config.ts` to use a locale-aware schema:

```ts
import { defineCollection, z } from 'astro:content'

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    locale: z.enum(['en', 'de']).default('en'),
    // ... rest of your schema
  }),
})
```

---

### Step 4: Update Dynamic Route `[tool].astro`

Your `pages/tools/[tool].astro` becomes locale-aware. You'll also create `pages/de/tools/[tool].astro` (or use a `[...locale]/tools/[tool].astro` catch-all pattern):

```
pages/
├── tools/
│   └── [tool].astro        ← English (default)
└── de/
    └── tools/
        └── [tool].astro    ← German
```

In `getStaticPaths()` you filter content by locale:

```ts
// pages/tools/[tool].astro
export async function getStaticPaths() {
  const tools = await getCollection('tools', (entry) => 
    entry.id.startsWith('en/')
  )
  return tools.map(tool => ({
    params: { tool: tool.slug.replace('en/', '') },
    props: { tool }
  }))
}
```

---

### Step 5: Language Switcher Component

Create a `LanguageSwitcher.svelte` that uses Astro's `getRelativeLocaleUrl`:

```svelte
<!-- components/shared/LanguageSwitcher.svelte -->
<script lang="ts">
  let { currentPath, currentLocale } = $props()
  
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
  ]
</script>

{#each languages as lang}
  <a 
    href={getLocaleUrl(lang.code, currentPath)}
    class:active={lang.code === currentLocale}
  >
    {lang.label}
  </a>
{/each}
```

---

### Step 6: Sitemap & SEO with hreflang

Install `@astrojs/sitemap` (if not already) and configure it for i18n — it will automatically generate `hreflang` alternate tags which are critical for Google to understand your multilingual structure:

```js
// astro.config.mjs
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://yoursite.com',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          de: 'de-DE',
        },
      },
    }),
  ],
  i18n: { ... }
})
```

Also update your `seo.ts` util to add `<link rel="alternate" hreflang="...">` tags in `<head>`.

---

### Step 7: Svelte 5 Widget Translation

For your feature widgets (e.g., `features/mortgage-calculator/Widget.svelte`), use Paraglide directly in Svelte with the `@inlang/paraglide-svelte` adapter:

```svelte
<script lang="ts">
  import * as m from '$paraglide/messages'
</script>

<button>{m.tool_calculate_btn()}</button>
<label>{m.mortgage_loan_amount()}</label>
```

Since Paraglide is compile-time, the Svelte bundle for German users only contains German strings — **no runtime locale detection overhead.**

---

### Future Default Locale Switch (English → German)

When you're ready to make German the default, the change is literally 2 lines in `astro.config.mjs`:

```js
i18n: {
  defaultLocale: 'de',  // ← change this
  locales: ['en', 'de'],
  routing: {
    prefixDefaultLocale: false, // German is now the clean URL
  },
  fallback: {
    en: 'de',
  },
}
```

German moves to `/tools/mortgage-calculator`, English moves to `/en/tools/mortgage-calculator`. Add 301 redirects for the old English URLs and you're done. **Zero component refactoring.**

---

## Summary of the Final Plan

| Concern | Solution |
|---|---|
| **Routing** | Astro native i18n (`prefixDefaultLocale: false`) |
| **UI Strings** | Paraglide JS (compile-time, type-safe, tree-shaken) |
| **Content (MD files)** | Locale subfolders in content collections (`en/`, `de/`) |
| **Svelte Widgets** | Paraglide Svelte adapter, same message keys |
| **SEO** | `@astrojs/sitemap` with i18n + hreflang meta tags |
| **Future locale swap** | Change 2 lines in astro config + 301 redirects |
| **Fallback** | Astro fallback config (`de` falls back to `en` while translating) |

The main work you need to do upfront is: reorganize `content/tools/` into `content/tools/en/` (move all existing files), set up Paraglide and extract all UI strings into `messages/en.json`, and create the `pages/de/` route structure. After that, adding German is just translating the JSON files and MD content — no structural changes ever again.