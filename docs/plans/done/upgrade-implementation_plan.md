# Astro 5 → 6 & Full Tech Stack Upgrade Plan

## Executive Summary

This document is a comprehensive pre-upgrade analysis and phased implementation plan for migrating the **multitools-astssl-1** project from Astro 5 to Astro 6, along with all companion dependencies. Based on deep codebase analysis and upstream research, **the upgrade is safe and recommended** — the breaking changes are minimal for this project's usage patterns, and the security posture improves significantly.

> [!IMPORTANT]
> **Verdict: ✅ SAFE TO UPGRADE** — No critical blockers found. All breaking changes are either non-applicable or have clear, low-effort migration paths. No supply chain issues detected with target versions. Node.js 22 is already satisfied.

---

## Current → Target Version Matrix

| Package | Current | Target | Change Type | Risk |
|---|---|---|---|---|
| `astro` | ^5.17.1 | ^6.1.0 | **Major** | 🟡 Medium |
| `@astrojs/svelte` | ^7.2.5 | ^8.0.4 | **Major** | 🟢 Low |
| `@astrojs/sitemap` | ^3.7.0 | ^3.7.0 (latest) | Keep | 🟢 Low |
| `@astrojs/check` | ^0.9.6 | ^0.9.8 | Patch | 🟢 Low |
| `typescript` | ^5.9.3 | ^5.9.3 (keep) | None | 🟢 None |
| `svelte` | ^5.50.3 | ^5.55.x (latest) | Minor | 🟢 Low |
| `tailwindcss` | ^4.1.18 | ^4.2.x (latest) | Minor | 🟢 Low |
| `@tailwindcss/vite` | ^4.1.18 | ^4.2.x (latest) | Minor | 🟢 Low |
| `@tailwindcss/typography` | ^0.5.19 | ^0.5.x (latest) | Patch | 🟢 Low |
| `tailwindcss-animate` | ^1.0.7 | Remove → native | **Migration** | 🟡 Medium |
| `tailwind-variants` | ^3.2.2 | ^3.x (latest) | Minor | 🟢 Low |
| `tailwind-merge` | ^3.4.0 | ^3.x (latest) | Minor | 🟢 Low |
| `lucide-svelte` | ^0.563.0 | `@lucide/svelte` | **Rename** | 🟡 Medium |
| `bits-ui` | ^2.15.5 | ^2.x (latest) | Minor | 🟢 Low |
| `eslint` | ^9.39.4 | ^9.x (latest) | Minor | 🟢 Low |
| `eslint-plugin-astro` | ^1.6.0 | ^1.x (latest) | Minor | 🟢 Low |
| `eslint-plugin-svelte` | ^3.16.0 | ^3.x (latest) | Minor | 🟢 Low |
| `@typescript-eslint/*` | ^8.58.0 | ^8.x (latest) | Minor | 🟢 Low |
| `svelte-check` | ^4.4.4 | ^4.x (latest) | Minor | 🟢 Low |
| Node.js | 22.14.0 ✅ | 22.12.0+ | Already met | 🟢 None |

> [!WARNING]
> ### TypeScript 6 — NOT upgrading now
> TypeScript 6 was announced as a "stepping-stone" release toward the Go-based TS 7.0. However:
> - `@astrojs/check` v0.9.8 has a **peer dependency of `typescript: ^5.0.0`** — it will reject TS 6.
> - TS 6 introduces subtle inference changes that could cause false positives across the codebase.
> - The Astro team has not officially certified TS 6 compatibility with Astro 6 yet.
> 
> **Decision: Stay on TypeScript 5.9.x** until `@astrojs/check` and the broader ecosystem officially support TS 6.

---

## Breaking Changes Analysis — Mapped to Our Codebase

### Astro 6 Breaking Changes

#### ✅ Non-Applicable (No Action Needed)

| Breaking Change | Why N/A |
|---|---|
| Removed `Astro.glob()` | Not used — we use `getCollection()` from `astro:content` |
| Removed `<ViewTransitions />` component | Not imported — we only reference "ViewTransitions" in a comment |
| Removed `handleForms` prop for `<ClientRouter />` | Not used |
| Removed `prefetch()` with option | Not used programmatically |
| Removed `emitESMImage()` | Not used |
| Removed legacy content collections | Already using v5-style loader-based collections |
| Removed `routes` on `astro:build:done` hook | Our custom `ogCache` integration uses `astro:build:start`, not `astro:build:done` |
| Removed `entryPoints` on `astro:build:ssr` hook | Not used |
| Removed `rewrite()` from Actions context | Not using Actions |
| Removed old `app.render()` signature | Not building an adapter |
| Removed `App.setManifestData()` | Not building an adapter |
| Removed CommonJS config files | Already using ESM (`.mjs`) |
| Removed percent-encoding in routes | Not using encoded routes |
| Changed `getStaticPaths()` — no `number` type params | Our params are strings (tool slugs, category names) ✅ |
| Changed `i18n.routing.redirectToDefaultLocale` default | Not using i18n |
| Changed SVG rasterization behavior | Not passing SVGs through the image pipeline |
| Deprecated `Astro` in `getStaticPaths()` | Not using the `Astro` global inside `getStaticPaths()` |
| Deprecated `import.meta.env.ASSETS_PREFIX` | Not using `ASSETS_PREFIX` |
| Deprecated exposed `astro:transitions` internals | Not importing transition internals |
| Deprecated exposed `astro:actions` internals | Not using Actions |
| Deprecated `createExports()` and `start()` (Adapter API) | Not building an adapter |
| Deprecated `NodeApp` from `astro/app/node` | Not building an adapter |
| Deprecated `loadManifest()` and `loadApp()` from `astro/app/node` | Not building an adapter |
| Deprecated session driver string signature | Not using sessions |

#### 🟡 Action Required

| Breaking Change | Impact | Action |
|---|---|---|
| **Zod import path deprecated** | `import { z } from 'astro:content'` is deprecated → use `import { z } from 'astro/zod'` | Update `src/content.config.ts` |
| **Content Config Location** | Astro 6 requires `src/content.config.ts` instead of `src/content/config.ts` | Move/rename config file |
| **Vite 7 upgrade** | Bundled with Astro 6 — our manual `rollupOptions.output.manualChunks` must be verified | Test that the `svelte-runtime` and `vendor-ui` chunks still work as expected |
| **Shiki 4 upgrade** | Bundled with Astro 6 — powers `<Code />` and Markdown code blocks | We don't customize Shiki — auto-upgrade should work |
| **Node 22 minimum** | Requires Node.js ≥22.12.0 | Already running 22.14.0 ✅ |
| **TypeScript configuration changes** | tsconfig `extends` path may change | Update `tsconfig.json` if required by the new Astro template defaults |
| **`import.meta.env` values always inlined** | We use `import.meta.env.PROD` and `import.meta.env.DEV` — these are already statically inlined | No action, but verify build |
| **`<script>` and `<style>` render order changed** | Now rendered in definition order | Review if any components depend on CSS load ordering |
| **Markdown heading ID generation changed** | Heading anchors may change | If we have deep-links to `#heading-ids` in our content, verify they still work |
| **`@astrojs/sitemap` major upgrade** | `ChangeFreqEnum` import may change in v4 | Verify the export still exists; update import if needed |
| **`getImage()` throws on client** | Not used on the client side currently | No action |

---

### Zod 4 Breaking Changes (Bundled via Astro 6)

> [!NOTE]
> Astro 6 bundles Zod 4 internally. You access it via `import { z } from 'astro/zod'`. Our content schemas use basic Zod patterns that are **fully backward compatible** with Zod 4.

| Our Zod Usage | Zod 4 Status |
|---|---|
| `z.string()`, `z.number()`, `z.boolean()` | ✅ Unchanged |
| `z.enum([...])` | ✅ Unchanged |
| `z.array(...)` | ✅ Unchanged |
| `z.object({...})` | ✅ Unchanged |
| `z.union([z.string(), z.date()])` | ✅ Unchanged |
| `.optional()`, `.default(value)` | ⚠️ `.default()` behavior changed — now applies whenever input is `undefined`. Our usage with `.default(false)` and `.default('load')` is safe because these are frontmatter fields. |

**Verdict: No schema changes needed.**

---

### Tailwind CSS Ecosystem

Our project is **already on Tailwind CSS v4** with the Vite plugin. No major Tailwind migration necessary.

| Item | Status |
|---|---|
| `tailwindcss` v4.1 → v4.2 | Minor bump, no breaking changes |
| `@tailwindcss/vite` v4.1 → v4.2 | Minor bump |
| `@tailwindcss/typography` v0.5 | Compatible with v4 |
| `tailwind-merge` v3 | Compatible |
| `tailwind-variants` v3 | Compatible |
| `tailwindcss-animate` v1 | ⚠️ **Not natively compatible with TW v4** — designed for v3's config architecture. Since our project is already on TW v4 and this package is likely loaded but possibly unused/working differently, we need to audit usage and either replace with native `@theme`/`@keyframes` or use `tw-animate-css` |

---

### Svelte & Component Ecosystem

| Item | Status | Action |
|---|---|---|
| `svelte` ^5.50 → ^5.55 | Minor, compatible | Simple bump |
| `@astrojs/svelte` v7 → v8 | Major, but designed for Svelte 5 + Astro 6 | Direct upgrade |
| `bits-ui` v2 | Compatible with Svelte 5 | Keep, requires `resolve.noExternal` config wrapper |
| `lucide-svelte` → `@lucide/svelte` | **Package renamed** and **Brand Icons Relocated** | Uninstall old, update imports. Removed brand icons must be handled manually |
| `svelte-check` v4 | Compatible | Minor bump |

---

## Supply Chain Security Audit

> [!CAUTION]
> Based on research into recent supply chain attacks (Axios compromise March 2026, Shai-Hulud worm late 2025), I performed a targeted security review of all packages being upgraded.

### Target Version Security Assessment

| Package | Maintainer | Org-Backed? | Recent CVEs? | Verdict |
|---|---|---|---|---|
| `astro` 6.1.x | withastro (team of 20+) | ✅ Astro Technology Inc. | SSR-only CVEs patched in 6.x | ✅ Safe |
| `@astrojs/svelte` 8.x | withastro | ✅ Same org | None | ✅ Safe |
| `@astrojs/sitemap` 4.x | withastro | ✅ Same org | None | ✅ Safe |
| `svelte` 5.55.x | sveltejs (Rich Harris + Vercel) | ✅ Vercel | Jan 2026 XSS patch (5.46.4+) — 5.55 includes fix | ✅ Safe |
| `tailwindcss` 4.2.x | tailwindlabs (Adam Wathan) | ✅ Tailwind Labs | None | ✅ Safe |
| `typescript` 5.9.x | Microsoft | ✅ Microsoft | None | ✅ Safe |
| `lucide-svelte` / `@lucide/svelte` | lucide-icons | ⚠️ Community project, many contributors | None known | 🟢 Acceptable |
| `bits-ui` 2.x | huntabyte (individual) | ⚠️ Single maintainer | None known | 🟡 Monitor |
| `satori` 0.26.x | vercel | ✅ Vercel | None | ✅ Safe |
| `satori-html` 0.3.x | natemoo-re | ⚠️ Individual (Astro core team member) | None known | 🟢 Acceptable |
| `tailwindcss-animate` 1.x | jamiebuilds | ⚠️ Individual maintainer, low activity | None known | 🟡 Consider replacing |
| `gray-matter` 4.x | jonschlinkert | ⚠️ Individual, package is mature/stable | None known | 🟢 Acceptable |
| `fast-glob` 3.x | mrmlnc | ⚠️ Individual, widely used | None known | 🟢 Acceptable |

### Key Security Findings

1. **No active CVEs** in any of the target versions we're upgrading to.
2. **Svelte 5.46.4+ patches** a client-side XSS (CVE-2025-15265) — our target 5.55.x includes this fix. ✅
3. **Astro 6.x patches** multiple SSR-related CVEs (URL handling, SSRF) — these are only relevant for SSR mode, and our site is **statically generated**, but having the patches is still a positive. ✅
4. **`tailwindcss-animate`** is a single-maintainer project with low activity — recommend replacing with native TW v4 animations or the community `tw-animate-css` package.
5. **`bits-ui`** is single-maintainer (huntabyte) — this is a known accepted risk in the Svelte ecosystem. The maintainer is active and well-known. Monitor but proceed.

> [!TIP]
> **No packages in our upgrade target are known to be compromised.** The Axios attack (March 2026) does not affect us — we don't use Axios. The Shai-Hulud worm targeted packages via stolen credentials, primarily affecting cloud SDK packages — none of our dependencies were impacted.

---

## Compatibility Matrix

```
┌────────────────────────────────────────────────────────────────────┐
│                    COMPATIBILITY MATRIX                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Node.js 22.14 ✅                                                  │
│    └── Astro 6.1 (requires Node 22.12+)                           │
│          ├── Vite 7 (bundled) ✅                                   │
│          │     └── @tailwindcss/vite 4.2 ✅                        │
│          ├── Zod 4 (bundled via astro/zod) ✅                      │
│          ├── Shiki 4 (bundled) ✅                                  │
│          ├── @astrojs/svelte 8 ✅                                  │
│          │     └── Svelte 5.55 ✅                                  │
│          │           ├── bits-ui 2.x ✅                            │
│          │           ├── @lucide/svelte ✅ (migrated)              │
│          │           └── svelte-check 4.x ✅                       │
│          ├── @astrojs/sitemap 4.x ✅                               │
│          ├── @astrojs/check 0.9.8 ✅                               │
│          │     └── TypeScript 5.9 ✅ (TS 6 NOT compatible)         │
│          └── Tailwind CSS 4.2 ✅                                   │
│                ├── tailwind-merge 3.x ✅                           │
│                ├── tailwind-variants 3.x ✅                        │
│                └── @tailwindcss/typography 0.5 ✅                  │
│                                                                    │
│  TypeScript 6.0 ❌ BLOCKED by @astrojs/check peerDep              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## User Review Required

> [!IMPORTANT]
> ### Decision Points That Need Your Input
>
> 1. **TypeScript 6**: I recommend staying on TS 5.9.x. Do you agree, or do you want to force it with `--legacy-peer-deps`?
>
> 2. **`tailwindcss-animate`**: This package is v3-era and may not be working correctly with your TW v4 setup. Should I:
>    - (a) Audit current usage and replace with native `@theme`/`@keyframes` definitions?
>    - (b) Replace with `tw-animate-css` (TW v4 compatible drop-in)?
>    - (c) Leave it as-is if it still works?
>
> 3. **`lucide-svelte` → `@lucide/svelte`**: This is a package rename. I'll need to update every file that imports from `lucide-svelte` to `@lucide/svelte`. Are there any icons you want to change while we're at it?

---

## Proposed Changes — 5-Phase Implementation

### Phase 0: Pre-Flight Safety Net
- Create a Git branch `upgrade/astro-6`
- Run current build and validate it passes (`npm run build`)
- Take a snapshot of the `dist/` output for before/after comparison
- Run `npm audit` on current state

---

### Phase 1: Core Astro Upgrade

#### [MODIFY] [package.json](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/package.json)
- Bump `astro` from `^5.17.1` to `^6.1.0`
- Bump `@astrojs/svelte` from `^7.2.5` to `^8.0.4`
- Bump `@astrojs/sitemap` from `^3.7.0` to `^4.x`
- Bump `@astrojs/check` from `^0.9.6` to `^0.9.8`

#### [MODIFY] [src/content.config.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/content.config.ts)
- Rename `src/content/config.ts` to `src/content.config.ts`
- Change Zod import from `import { defineCollection, z } from 'astro:content'` to:
  ```ts
  import { defineCollection } from 'astro:content';
  import { z } from 'astro/zod';
  ```

#### [MODIFY] [tsconfig.json](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/tsconfig.json)
- Verify and update the `extends` value if the Astro 6 base tsconfig path changed
- Astro 6 changes TypeScript configuration defaults — will need to check if the `astro/tsconfigs/strict` preset is still valid

#### [MODIFY] [astro.config.mjs](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/astro.config.mjs)
- Verify `ChangeFreqEnum` import from `@astrojs/sitemap` v4 still works
- If the export was removed/renamed, update to use string literals (`'weekly'`, `'monthly'`, etc.)

---

### Phase 2: Svelte & Component Library Migration

#### [MODIFY] [package.json](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/package.json)
- Bump `svelte` from `^5.50.3` to `^5.55.x`
- Remove `lucide-svelte` dependency
- Add `@lucide/svelte` dependency

#### [MODIFY] All files importing `lucide-svelte`
- Global find-and-replace: `from 'lucide-svelte'` → `from '@lucide/svelte'`
- Resolve the removed Brand Icons manually (AuthorCard.astro uses Twitter, Github, Linkedin, Facebook — these must be replaced with inline SVGs).

#### [MODIFY] [astro.config.mjs](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/astro.config.mjs)  
- Svelte components need to be exposed to Vite compilation. Astro 6 uses Vite 7 Environment API:
  ```js
  vite: {
    resolve: {
      noExternal: ['@lucide/svelte', 'bits-ui', 'svelte-toolbelt', 'runed']
    }
  }
  ```

---

### Phase 3: Tailwind Ecosystem Alignment

#### [MODIFY] [package.json](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/package.json)
- Bump `tailwindcss` from `^4.1.18` to `^4.2.x`
- Bump `@tailwindcss/vite` from `^4.1.18` to `^4.2.x`
- Audit and resolve `tailwindcss-animate` (based on user decision)

#### [MODIFY] CSS files (if replacing `tailwindcss-animate`)
- Move custom animation definitions to native `@theme` blocks in the global CSS
- Or install and import `tw-animate-css`

---

### Phase 4: ESLint & Dev Tooling

#### [MODIFY] [package.json](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/package.json)
- Bump `eslint-plugin-astro` to latest ^1.x
- Bump `eslint-plugin-svelte` to latest ^3.x
- Bump `@typescript-eslint/*` to latest ^8.x
- Bump `svelte-check` to latest ^4.x
- Bump `svelte-eslint-parser` to latest

#### [MODIFY] [eslint.config.js](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/eslint.config.js)
- Verify flat config compatibility after upgrading plugins
- No structural changes expected

---

### Phase 5: Verification & Smoke Testing

#### Automated Tests
```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Type checking
npx astro check
npx svelte-check
npx tsc --noEmit

# 3. Lint
npm run lint

# 4. Full build
npm run build

# 5. Preview and manual spot-check
npm run preview
```

#### Manual Verification
- [ ] Homepage renders with all tool widgets loading correctly
- [ ] Tool detail pages render (test 3 different tools)
- [ ] Category pages render with correct filtering
- [ ] Blog pages render (if any exist)
- [ ] Sitemap XML is valid (`/sitemap-index.xml`)
- [ ] OG images generate correctly (check `.og-manifest.json` and `public/images/og/`)
- [ ] Search JSON endpoint works (`/api/search.json`)
- [ ] KaTeX math rendering works on tools with `hasMath: true`
- [ ] No console errors in dev mode
- [ ] Markdown heading anchor links still work
- [ ] Svelte component hydration works (test interactive tools)
- [ ] Bundle size comparison (before vs after)

#### Rollback Plan
```bash
# If anything goes wrong:
git checkout main
rm -rf node_modules
npm install
```

---

## Open Questions

> [!IMPORTANT]
> 1. **`tailwindcss-animate` decision** — see Decision Point #2 above
> 2. **`ChangeFreqEnum` in sitemap v4** — Need to verify at install time if this export still exists. If not, fallback to raw strings is trivial.
> 3. **Bits-UI build compatibility** — May need the `ssr.noExternal` workaround. Won't know until we attempt the build.

## Verification Plan

### Automated Tests
- `astro check` — validates all `.astro` files type-check
- `svelte-check` — validates all `.svelte` files
- `tsc --noEmit` — validates TypeScript compilation
- `npm run lint` — ESLint validation
- `npm run build` — full production build
- Compare `dist/` output sizes and file counts

### Manual Verification  
- Visual inspection of homepage, tool pages, and category pages
- Sitemap XML validation
- OG image generation verification
- Lighthouse audit (before/after)
