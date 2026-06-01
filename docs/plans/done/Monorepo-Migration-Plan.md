# Monorepo Migration Plan — FINAL (Part 1: Architecture & Issues)

> [!IMPORTANT]
> This plan is split into two files due to its size:
> - **Part 1** (this file): Architecture, design decisions, verified issues
> - **Part 2** ([implementation_plan_part2.md](file:///home/kumar/.gemini/antigravity/brain/f67e6208-b018-4d79-bc2e-c0508d9e53ab/implementation_plan_part2.md)): All 16 migration phases with verification checkpoints

## Execution Guidelines (READ FIRST)

1. **Before starting any phase**, read all related files mentioned in that phase to understand current state.
2. **Complete one phase at a time.** After each phase, provide a commit message and wait for user approval before proceeding.
3. **Never skip phases.** Each depends on the previous.
4. **Do NOT run any npm/pnpm commands.** Provide commands to the user — they will run them and share output.
5. **If a phase is too large**, break it into sub-commits within the phase.

---

## Decisions Locked

| Decision | Choice |
|---|---|
| Workspace tooling | pnpm workspaces + Turborepo (`workspace:*` protocol) |
| Package strategy | **ONE** `@mtools/core` package |
| Mobile framework | Capacitor (wraps site `dist/`) |
| German finance | i18n feature in base project, not separate site |
| Domains | Mix of own domains + subdomains per-site |
| Content | Each site owns all its own content (authors, blog, tools) |
| Hosting | Netcup VPS + Cloudflare primary, some Vercel/Netlify |
| Pages | ALL pages (static + dynamic) injected via `injectRoute` from core |
| Config injection | `virtual:site-config` Vite virtual module + `Astro.locals` via `addMiddleware` |

---

## Architecture: ONE Core Package

### 1. The `siteConfig` Flow — Virtual Module Pattern

> [!IMPORTANT]
> **Why not a closure?** Astro's `addMiddleware()` takes an `entrypoint` string/URL — NOT a function. You cannot pass `siteConfig` via closure. The virtual module pattern is the standard Astro solution.

**How it works:**

1. Each site's `astro.config.mjs` calls `createAstroConfig(siteConfig)` from core
2. Inside `createAstroConfig`, a Vite plugin registers `virtual:site-config`:
   ```ts
   // Vite plugin inside createAstroConfig
   resolveId(id) { if (id === 'virtual:site-config') return '\0virtual:site-config'; },
   load(id) { if (id === '\0virtual:site-config') return `export const siteConfig = ${JSON.stringify(siteConfig)};`; }
   ```
3. Core's middleware imports from `virtual:site-config` and injects into `context.locals.siteConfig`
4. **ALL components** (Astro AND Svelte) can import directly:
   ```ts
   import { siteConfig } from 'virtual:site-config';
   ```

**Why this is better than `$props()` prop-drilling:**
- 50+ Astro components currently import siteConfig — all just change to `import { siteConfig } from 'virtual:site-config'`
- 21+ Svelte widgets also import it — same one-line change, NO `$props()` refactoring needed
- `Astro.locals.siteConfig` remains available for pages that need it (e.g., for passing to content utilities)

**Serialization constraints (all safe for our case):**
- Functions on `siteConfig` will be stripped → our config has none
- Circular references will throw → our config has none
- Config becomes a build-time constant → changes require rebuild (normal for static sites)

**TypeScript support:**
```ts
// core/src/env.d.ts
declare module 'virtual:site-config' {
  import type { SiteConfig } from './config/types';
  export const siteConfig: SiteConfig;
}
```

### 2. Tailwind CSS v4 Monorepo Strategy

> [!IMPORTANT]
> Tailwind v4 auto-scans files from the **project root** where `@tailwindcss/vite` runs. When building `sites/finance-tools/`, it auto-scans `sites/finance-tools/src/**`. Core components in `core/src/` are **outside** that root.

**Correct `@source` direction** (sites → core, NOT core → sites):

```css
/* core/src/styles/global.css — imported by each site */
@import "tailwindcss";

/* Tell Tailwind to scan core's component directories */
@source "../../components";
@source "../../layouts";
@source "../../lib";
@source "../../pages";
@source "../../og";
```

The `@source` paths are relative to the CSS file location (`core/src/styles/`). Each site's own `src/features/` and `src/content/` are within the site's project root, so they're auto-scanned.

### 3. Content Schema Portability

> [!CAUTION]
> Three Astro-specific APIs cannot be used directly in a plain TS package:
> 1. **`image()`** — only available via `SchemaContext` in `defineCollection`
> 2. **`reference()`** — imported from `astro:content` virtual module
> 3. **`z` from `astro/zod`** — won't resolve outside Astro project

**Solution — factory functions that accept these as parameters:**

```ts
// core/src/content-schemas/tools.ts
import { z } from 'zod';  // NOT 'astro/zod'
type ReferenceFn = (collection: string) => any;

export const createToolSchema = (reference: ReferenceFn) => z.object({
  title: z.string(),
  author: reference('authors').optional(),
  coAuthors: z.array(reference('authors')).default([]),
  // ... rest of schema
});
```

```ts
// core/src/content-schemas/authors.ts
import { z } from 'zod';
import type { SchemaContext } from 'astro:content';

export const createAuthorSchema = ({ image }: SchemaContext) => z.object({
  name: z.string(),
  avatar: image(),
  // ... rest of schema
});
```

```ts
// sites/finance-tools/src/content.config.ts
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { createToolSchema, createBlogSchema, createAuthorSchema } from '@mtools/core/content-schemas';

export const collections = {
  tools: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
    schema: createToolSchema(reference),
  }),
  blog: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
    schema: createBlogSchema(reference),
  }),
  authors: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
    schema: (context) => createAuthorSchema(context),
  }),
};
```

**`core/package.json` must include `"zod"` as a dependency.**

### 4. `$lib` Alias Strategy

> [!IMPORTANT]
> 164+ import statements use `$lib/` across both core components AND site-specific features. In the monorepo, `$lib` must always resolve to `core/src/lib/`.

**Dual-sync required** — both Vite AND TypeScript must agree:
- **Vite alias** (in `createAstroConfig`): `'$lib': path.resolve(coreRoot, 'src/lib')`
- **tsconfig.json paths** (per site): `"$lib/*": ["../../core/src/lib/*"]`

The `createAstroConfig()` factory handles the Vite alias automatically. Each site's `tsconfig.json` must extend `tsconfig.base.json` and add the `$lib` path.

### 5. Widget Map Script Path Resolution

> [!WARNING]
> The script currently uses `__dirname` (relative to script location). When moved to `core/scripts/`, it must use `process.cwd()`.

```js
// BEFORE (current — breaks in monorepo)
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// AFTER (works in monorepo — resolves to site root)
const projectRoot = process.cwd();
const featuresDir = join(projectRoot, 'src', 'features');
const contentDir  = join(projectRoot, 'src', 'content', 'tools');
const generatedDir = join(projectRoot, 'src', 'generated');
```

Script exposed via `core/package.json` `"bin"` field:
```json
{ "bin": { "generate-widget-map": "./scripts/generate-widget-map.mjs" } }
```

Sites call it in their npm scripts: `"dev": "generate-widget-map && astro dev"`

The `#!/usr/bin/env node` shebang is already present — must be preserved.

### 6. Widget Wrapper `siteConfig` Access

The generated widget wrappers (`.astro` files in `src/generated/widgets/`) are Astro components. They can access `virtual:site-config` directly. The `generate-widget-map.mjs` script template does NOT need updating for siteConfig — the widgets themselves will import from the virtual module.

---

## What's in `@mtools/core`

- All layouts, components, UI primitives, utilities
- All styles and themes (Tailwind v4 base CSS with `@source` directives)
- Content collection Zod schema **factory functions** (not raw schemas)
- SEO schema builders, sitemap config, OG cache integration + templates
- Widget map generation script (exposed via `bin`, uses `process.cwd()`)
- ALL pages (static + dynamic) — injected via `injectRoute`
- Astro config factory (`createAstroConfig(siteConfig, overrides?)`)
- Virtual module Vite plugin for `virtual:site-config`
- Middleware that injects `siteConfig` into `Astro.locals`

## What's per-site (minimal)

- `src/config.ts` — **THE only required unique file**
- `src/content/` — site-specific markdown
- `src/features/` — site-specific Svelte widgets
- `public/` — site-specific assets
- `src/pages/` — **ONLY if overriding** a core page (local routes take priority)
- Thin boilerplate (never manually edited): `astro.config.mjs`, `content.config.ts`, `svelte.config.js`, `tsconfig.json`, `package.json`

---

## Verified Issues Table

| # | Issue | Severity | Source | Phase | Fix |
|---|---|---|---|---|---|
| 1 | `@source` direction wrong (core→sites should be sites→core) | **HIGH** | Research | 7 | Point `@source` to core dirs from `global.css` |
| 2 | Middleware needs virtual module (can't pass closure) | **HIGH** | Research | 5,6 | Vite virtual module `virtual:site-config` |
| 3 | `reference()` can't export from core | **HIGH** | Independent | 8 | Schema factories accept `reference` param |
| 4 | Zod import: `zod` not `astro/zod` in core | Medium | Research | 8 | Add `zod` to core deps, import from `zod` |
| 5 | tsconfig paths must sync with Vite alias | Medium | Research | 7 | Update both Vite + tsconfig simultaneously |
| 6 | `turbo.json` content missing | Low | Research | 2 | Add task definitions with `dependsOn` |
| 7 | `bin` script shebang | Low | Research | 12 | Already present — preserve on move |
| 8 | `glob` base path in content.config | None | Independent | — | Confirmed working — no fix needed |

## Version Compatibility

| Dependency | Version | Compatible? |
|---|---|---|
| Astro | ^6.1.5 | ✅ `addMiddleware`, `injectRoute`, Vite plugins all available |
| Svelte | ^5.55.3 | ✅ Runes stable, virtual module imports work |
| Tailwind CSS | ^4.2.2 | ✅ `@source` directive, `@import "tailwindcss"` |
| @tailwindcss/vite | ^4.2.2 | ✅ Required for Vite-based Astro builds |
| TypeScript | ^5.9.3 | ✅ Workspace project references, path aliases |
| bits-ui | ^2.17.3 | ✅ Svelte 5 runes compatible |

---

## Folder Structure

```
monorepo-astt/
│
├── docs/                                # Global documents
│
├── core/                                # @mtools/core
│   ├── src/
│   │   ├── layouts/                     # BaseLayout, ToolLayout, BlogLayout
│   │   ├── components/                  # All shared component dirs
│   │   ├── lib/
│   │   │   ├── components/ui/           # shadcn-svelte primitives
│   │   │   ├── icons.ts
│   │   │   └── utils.ts                 # cn()
│   │   ├── seo/                         # Schema builders, parsers, types
│   │   ├── og/templates/                # blog.ts, tools.ts
│   │   ├── utils/                       # slug, prng, w3c-date, content, seo, og,
│   │   │                                # blog, tools, authors, searchStore
│   │   ├── styles/                      # global.css (TW v4 + @source), common.css, themes/
│   │   ├── pages/                       # ALL pages (injected via core integration)
│   │   ├── content-schemas/             # Schema factory functions
│   │   ├── config/                      # types.ts, defaults.ts, factory.ts,
│   │   │                                # astro-config.ts, sitemap.ts
│   │   ├── middleware/                  # config-injector.ts
│   │   └── env.d.ts                     # virtual:site-config type declaration
│   ├── integrations/
│   │   ├── og-cache/                    # OG image cache integration
│   │   └── core-pages.ts               # injectRoute + addMiddleware
│   ├── scripts/
│   │   └── generate-widget-map.mjs      # Uses process.cwd(), exposed via bin
│   ├── package.json                     # name: "@mtools/core", exports + bin
│   ├── svelte.config.js
│   └── tsconfig.json
│
├── sites/
│   ├── _template/                       # Scaffold for new sites
│   ├── finance-tools/                   # Current site, migrated
│   ├── dev-tools/                       # Future
│   └── ...
│
├── mobile/                              # Capacitor apps (future)
│
├── pnpm-workspace.yaml
├── turbo.json                           # Build/dev/check task definitions
├── tsconfig.base.json
├── package.json                         # Root: private, devDeps: turbo
└── .gitignore
```

---

> **Continue to [Part 2: Migration Phases](file:///home/kumar/.gemini/antigravity/brain/f67e6208-b018-4d79-bc2e-c0508d9e53ab/implementation_plan_part2.md)**

# Monorepo Migration Plan — FINAL (Part 2: Migration Phases)

> **Architecture & design decisions are in [Part 1](file:///home/kumar/.gemini/antigravity/brain/f67e6208-b018-4d79-bc2e-c0508d9e53ab/implementation_plan.md)**

---

## Phased Migration Plan

### Phase 1 — Create docs/ folder ✅
*(Already completed)*
- **Commit:** `docs: create global documents directory structure`

---

### Phase 2 — Root workspace setup
- Create root `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - 'core'
    - 'sites/*'
    - 'mobile/*'
  ```
- Create root `package.json` (private: true, devDeps: turbo + typescript)
- Create `turbo.json`:
  ```json
  {
    "tasks": {
      "build": {
        "dependsOn": ["^build"],
        "outputs": ["dist/**", ".astro/**"],
        "inputs": ["src/**", "public/**", "astro.config.*", "package.json"]
      },
      "dev": {
        "cache": false,
        "persistent": true
      },
      "check": {
        "dependsOn": ["^build"]
      }
    }
  }
  ```
- Create `tsconfig.base.json` (shared compiler options)
- Update `.gitignore` for monorepo (node_modules in all workspaces, .turbo cache)
- **Commit:** `chore: initialize pnpm workspace + turborepo`

---

### Phase 3 — Create `core/` package skeleton
- Create `core/package.json` with:
  - `"name": "@mtools/core"`
  - `exports` map for all entry points
  - `"bin": { "generate-widget-map": "./scripts/generate-widget-map.mjs" }`
  - `"dependencies": { "zod": "..." }` (for content schemas)
- Create `core/tsconfig.json` extending `../tsconfig.base.json`, with `$lib` path alias → `./src/lib`
- Create `core/svelte.config.js`
- Create `core/src/env.d.ts` with `declare module 'virtual:site-config'` type
- Create empty directory structure inside `core/src/` (all dirs from folder structure)
- **Commit:** `chore: scaffold @mtools/core package`

---

### Phase 4 — Move pure utilities to core
- Move: `slug.ts`, `prng.ts`, `w3c-date.ts`, `og.ts`
- Move: `src/lib/utils.ts` → `core/src/lib/utils.ts` (cn helper)
- **Refactor:** Any that import `siteConfig` directly → accept config as parameter
- Add temporary Vite alias in root `astro.config.mjs`: `'@mtools/core': path.resolve('./core')`
- Update imports in remaining `src/` files to use `@mtools/core/utils/...`
- **Commit:** `refactor: move pure utility functions to core package`

---

### Phase 5 — Move config types + factory + virtual module to core
- Extract ALL interfaces from `src/config.ts` → `core/src/config/types.ts`
  - `SiteConfig`, `SeoConfig`, `UiConfig`, `NavigationConfig`, `NavItem`, `SidebarConfig`, `FloatingActionsConfig`, `ThemeConfig`, `AdsConfig`, `SupportConfig`, `TocConfig`, `BlogConfig`, `SearchConfig`, `FeaturesConfig`
- Create `core/src/config/defaults.ts` with sensible defaults
- Create `core/src/config/factory.ts` with `createSiteConfig()` (deep-merge defaults + overrides)
- Create `core/src/config/astro-config.ts` with `createAstroConfig(siteConfig, overrides?)`:
  - **Includes Vite virtual module plugin** that serves `virtual:site-config`:
    ```ts
    vite: {
      plugins: [{
        name: 'mtools-site-config',
        resolveId(id) { if (id === 'virtual:site-config') return '\0virtual:site-config'; },
        load(id) { if (id === '\0virtual:site-config') return `export const siteConfig = ${JSON.stringify(siteConfig)};`; }
      }]
    }
    ```
  - Auto-includes: `$lib` Vite alias → core/src/lib, `@active-theme` alias, `noExternal` list, all standard integrations (svelte, tailwind, sitemap, ogCache, corePages)
- Define `App.Locals` type with `siteConfig` in `core/src/config/types.ts`
- Leave the config values object in `src/config.ts` for now
- **Commit:** `refactor: extract config types, factory, virtual module, and Astro config builder to core`

---

### Phase 6 — Create middleware + core-pages integration
- Create `core/src/middleware/config-injector.ts`:
  ```ts
  import { defineMiddleware } from 'astro:middleware';
  import { siteConfig } from 'virtual:site-config';

  export const onRequest = defineMiddleware(async (context, next) => {
    context.locals.siteConfig = siteConfig;
    return next();
  });
  ```
- Create `core/integrations/core-pages.ts`:
  - Uses `addMiddleware({ entrypoint: '@mtools/core/middleware/config-injector', order: 'pre' })`
  - Uses `injectRoute()` for ALL pages — entrypoints use `@mtools/core/pages/...` specifiers
- **Do NOT move pages yet** — this phase only creates the integration infrastructure
- **Commit:** `feat: create core-pages integration with middleware and route injection`

---

### Phase 7 — Move styles + UI primitives to core
- Move `src/styles/` → `core/src/styles/`
- **Update `core/src/styles/global.css`** — add `@source` directives for Tailwind v4 scanning:
  ```css
  @import "tailwindcss";
  @source "../../components";
  @source "../../layouts";
  @source "../../lib";
  @source "../../pages";
  @source "../../og";

  @import "./common.css";
  @import "@active-theme";
  @import "tw-animate-css";
  @plugin "@tailwindcss/typography";
  ```
- Move `src/lib/components/ui/` → `core/src/lib/components/ui/`
- Move `src/lib/icons.ts` → `core/src/lib/icons.ts`
- **DUAL ALIAS BRIDGE** — update BOTH simultaneously:
  1. **Vite alias** in `astro.config.mjs`: `'$lib': path.resolve('./core/src/lib')`
  2. **tsconfig.json paths**: `"$lib/*": ["core/src/lib/*"]`
- This keeps all existing `$lib/components/ui/button` imports working
- **Commit:** `refactor: move styles and shadcn-svelte UI to core with alias bridge`

---

### Phase 8 — Move content schemas to core
- Extract Zod schemas from `src/content.config.ts` into **factory functions**:
  - `core/src/content-schemas/tools.ts`:
    - Export `TOOL_TAGS`, `TOOL_CATEGORIES`, `ToolTag`, `ToolCategory` constants/types
    - Export `createToolSchema(reference)` — accepts `reference` param
  - `core/src/content-schemas/blog.ts`:
    - Export `BLOG_CATEGORIES`, `BLOG_TAGS`, `BlogCategory`, `BlogTag` constants/types
    - Export `createBlogSchema(reference)` — accepts `reference` param
  - `core/src/content-schemas/authors.ts`:
    - Export `createAuthorSchema(context: SchemaContext)` — receives `image()` from context
  - `core/src/content-schemas/index.ts` — re-exports all
- **Import `z` from `zod`** (NOT `astro/zod`) in all core schema files
- Add `"zod"` to `core/package.json` dependencies
- Update `src/content.config.ts` to import from core:
  ```ts
  import { defineCollection, reference } from 'astro:content';
  import { glob } from 'astro/loaders';
  import { createToolSchema, createBlogSchema, createAuthorSchema } from '@mtools/core/content-schemas';

  export const collections = {
    tools: defineCollection({ loader: glob({...}), schema: createToolSchema(reference) }),
    blog: defineCollection({ loader: glob({...}), schema: createBlogSchema(reference) }),
    authors: defineCollection({ loader: glob({...}), schema: (ctx) => createAuthorSchema(ctx) }),
  };
  ```
- **Commit:** `refactor: extract content collection schemas to core`

---

### Phase 9 — Move SEO + schema builders to core
- Move `src/components/common/seo/*.ts` → `core/src/seo/`
- Move `src/utils/seo.ts` → `core/src/utils/seo.ts`
- Move `src/config/sitemap.ts` → `core/src/config/sitemap.ts`
- **Refactor:** Replace `import { siteConfig } from '...'` with `import { siteConfig } from 'virtual:site-config'`
- Update all imports in remaining files
- **Commit:** `refactor: move SEO schema builders and sitemap config to core`

---

### Phase 10 — Move Astro-dependent utils to core
- Move: `blog.ts`, `tools.ts`, `authors.ts`, `content.ts`, `searchStore.svelte.ts`
- **Refactor:** Replace all `import { siteConfig } from '...'` with `import { siteConfig } from 'virtual:site-config'`
- **Commit:** `refactor: move Astro-dependent utilities to core`

---

### Phase 11 — Move layouts + components to core
- Move `src/layouts/` → `core/src/layouts/`
- Move ALL `src/components/` subdirs → `core/src/components/`
  - **EXCEPT** `src/components/integrations/` (site-specific analytics — stays per-site)
  - Dirs: `common/`, `blog/`, `tool/`, `tools-grid/`, `authors/`, `engagement/`, `workspace/`, `home/`, `get-app/`
- **Refactor ALL `siteConfig` imports** in moved components:
  - **Astro components:** Replace `import { siteConfig } from '../../../config'` with `import { siteConfig } from 'virtual:site-config'`
  - **Svelte components:** Same change — `import { siteConfig } from 'virtual:site-config'` (virtual modules work in Svelte with client directives)
- This is the largest phase — sub-commits recommended:
  1. Move `common/` components
  2. Move `blog/` + `tool/` + `tools-grid/`
  3. Move `authors/` + `engagement/` + `workspace/`
  4. Move `home/` + `get-app/`
  5. Move `layouts/`
- **Commit:** `refactor: move all shared layouts and components to core`

---

### Phase 12 — Move OG + integrations + scripts + pages + refactor widgets
- Move `src/og/` → `core/src/og/`
- Move `integrations/og-cache/` → `core/integrations/og-cache/`
- Move `scripts/generate-widget-map.mjs` → `core/scripts/generate-widget-map.mjs`
  - **Refactor path resolution:** Replace `__dirname`-based with `process.cwd()`:
    ```js
    const projectRoot = process.cwd();
    const featuresDir = join(projectRoot, 'src', 'features');
    const contentDir  = join(projectRoot, 'src', 'content', 'tools');
    const generatedDir = join(projectRoot, 'src', 'generated');
    ```
  - **Preserve** `#!/usr/bin/env node` shebang on line 1
- Move ALL `src/pages/` → `core/src/pages/`
- Wire all injected routes in core-pages integration to point to moved page files
- **Refactor ALL feature widgets** in `src/features/`:
  - Replace `import { siteConfig } from "../../config"` with `import { siteConfig } from 'virtual:site-config'`
  - This is a simple find-and-replace across 21+ widget files — no `$props()` refactoring needed
- **Commit:** `refactor: move OG, integrations, scripts, pages to core; update widget imports`

---

### Phase 13 — Create first site (`sites/finance-tools/`)
- Create `sites/finance-tools/package.json`:
  - `"@mtools/core": "workspace:*"` in dependencies
  - Also: `astro`, `svelte`, `tailwindcss`, `@tailwindcss/vite`, `@astrojs/svelte`, etc.
  - Script: `"dev": "generate-widget-map && astro dev"`
  - Script: `"build": "generate-widget-map && astro build"`
- Create thin `astro.config.mjs`:
  ```ts
  import { createAstroConfig } from '@mtools/core/config/astro-config';
  import { siteConfig } from './src/config.ts';
  export default createAstroConfig(siteConfig);
  ```
- Create thin `svelte.config.js` → re-export from core
- Create `tsconfig.json` → extends `../../tsconfig.base.json`, `$lib` paths → `../../core/src/lib`
- Create `src/config.ts` using `createSiteConfig()` with current MultiTools values
- Create `src/content.config.ts` with factory import pattern (as shown in Phase 8)
- Create `src/env.d.ts` with `App.Locals` type including `siteConfig`
- Move remaining content:
  - `src/content/` → `sites/finance-tools/src/content/`
  - `src/features/` → `sites/finance-tools/src/features/`
  - `src/generated/` → `sites/finance-tools/src/generated/`
  - `src/assets/` → `sites/finance-tools/src/assets/`
  - `public/` → `sites/finance-tools/public/`
  - `src/components/integrations/` → `sites/finance-tools/src/components/integrations/`
- Clean up old root `src/`, `public/`, config files
- **Commit:** `feat: create finance-tools site with all migrated content`

---

### Phase 14 — Create `sites/_template/`
- Copy finance-tools structure, strip site-specific content
- Minimal `src/config.ts` with placeholder values
- Empty `src/content/`, `src/features/`
- Placeholder `public/` with default favicon
- Create `docs/project/creating-new-site.md` documentation
- **Commit:** `feat: create site template for scaffolding new sites`

---

### Phase 15 — CI/CD pipeline
- Create `.github/workflows/ci.yml` with Turborepo-aware builds:
  - Uses `pnpm install --frozen-lockfile`
  - `turbo build --filter=...[HEAD~1]` for affected-only builds
  - Separate deploy jobs per site
- **Commit:** `ci: add turborepo-aware GitHub Actions pipeline`

---

### Phase 16 — Final verification + cleanup
- Verify `pnpm install` from root works
- Verify `pnpm --filter finance-tools dev` boots correctly
- Verify `pnpm --filter finance-tools build` produces working dist
- Verify `turbo build` from root succeeds
- Clean up any remaining temporary aliases, unused files
- Update root `README.md` with monorepo overview
- **Commit:** `chore: final cleanup and verification`

---

## Verification Checkpoints

| Phase | Must Pass |
|---|---|
| 2 | `pnpm install` succeeds at root |
| 4 | Site still builds after utils move (alias bridge active) |
| 7 | Site still builds after styles/UI move (dual alias bridge updated) |
| 8 | `src/content.config.ts` works with factory-imported schemas; `reference()` resolves |
| 9 | SEO schemas render correctly with virtual:site-config |
| 11 | All components using `virtual:site-config` — no direct relative imports |
| 12 | `injectRoute` pages render correctly; widgets display currency symbols |
| 13 | `pnpm --filter finance-tools dev` — site renders identically |
| 13 | `pnpm --filter finance-tools build` — dist output matches original |
| 16 | `turbo build` from root succeeds |

---

## Rollback Strategy

- Git branch per phase (`monorepo/phase-2`, `monorepo/phase-3`, etc.)
- Phases 2-3 are non-destructive (current site unaffected)
- Phases 4-12 progressively move files but alias bridges keep site functional
- Phase 13 is the "point of no return" — test exhaustively before merging

---

## Key Differences from Plan v7

| Area | v7 (previous) | Final (this plan) |
|---|---|---|
| siteConfig injection | Closure / `$props()` | `virtual:site-config` Vite module |
| Svelte widget refactor | Phase 13 — `$props()` on 21+ files | **Eliminated** — simple import swap |
| Astro component migration | `Astro.locals.siteConfig` | `import { siteConfig } from 'virtual:site-config'` (simpler) |
| `@source` direction | Core → sites | **Sites → core** (corrected) |
| Content schemas | Some accept `reference`, some don't | ALL schema factories accept dependencies |
| Alias sync | Vite only | **Dual: Vite + tsconfig** |
| `turbo.json` | Empty placeholder | Full task definitions |
| Total phases | 17 | **16** (Phase 13 widget refactor merged into Phase 12) |
