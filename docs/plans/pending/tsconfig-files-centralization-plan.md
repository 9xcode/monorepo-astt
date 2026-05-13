# Plan: Centralize Site `tsconfig.json` via `tsconfig.sites.json`

**Status:** Pending  
**Priority:** Low (do when adding site #3 or later)  
**Risk:** Low — purely TypeScript config, no runtime impact  
**TypeScript requirement:** 5.5+ (`${configDir}` feature) — already satisfied (current: 5.9.3)  
**TypeScript v6 compatibility:** Yes. `${configDir}` is a stable config feature. TypeScript has never broken backwards-compatible config resolution. This plan is forward-compatible.

---

## Why This Exists

Each site's `tsconfig.json` is byte-for-byte identical:

```json
{
  "extends": ["astro/tsconfigs/strict", "../../tsconfig.base.json"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "$lib":           ["../../core/src/lib"],
      "$lib/*":         ["../../core/src/lib/*"],
      "@mtools/core/*": ["../../core/src/*"]
    }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

At 2 sites this is fine. At 10 sites, any change (e.g. adding a new path alias) requires editing 10 files. This plan centralizes it into a single `tsconfig.sites.json` at the monorepo root that all sites extend.

---

## Research Summary (Don't Repeat This)

### Files that were audited — what CAN and CANNOT be centralized

| File | Identical across sites? | Can centralize? | Reason |
|---|---|---|---|
| `src/env.d.ts` | Yes | ❌ No | Contains `/// <reference path="../.astro/types.d.ts" />` which points to a per-site generated file. Structurally required per-site. |
| `src/content.config.ts` | Structurally yes | ❌ No | Astro requires it in the site root. Glob paths are site-local. Schema logic already in `core/src/content-schemas/`. |
| `src/content-enums.ts` | No — different data per site | ❌ N/A | Intentionally site-specific (categories, tags differ per site). |
| `svelte.config.js` | Yes | ❌ Not worth it | 7 lines, never changes. `svelte-check` requires it in project root. Relative path coupling adds more complexity than it saves. |
| `tsconfig.json` | Yes | ✅ **Yes** | This is the change this plan implements. |
| `astro.config.mjs` | Yes (1-liner) | ✅ Already done | Factory pattern (`createAstroConfig`) already handles all shared config. |

- [ ] Don't touch: env.d.ts, content.config.ts, svelte.config.js — these are structurally required to be per-site and the 7-line boilerplate is the correct tradeoff.

- [ ] Already optimal: astro.config.mjs factory pattern — the biggest win you could have made, and you already made it. The tsconfig.json consolidation is the one concrete, safe improvement available to you right now with your current stack.

**Bottom line on `env.d.ts`:** The suggestion to move `virtual:site-config` declaration into `core/src/virtual-site-config.d.ts` (and expose it to sites) is **wrong**. TypeScript ambient `declare module` declarations are scoped to the tsconfig project they're included in. Core's declarations don't propagate to site compilations. Each site needs its own `env.d.ts`. Core already uses a separate mechanism (tsconfig `paths` alias to the stub file) for its own type-checking.

---

## How `${configDir}` Works (The Critical Detail)

TypeScript 5.5 introduced `${configDir}` as a template variable in tsconfig path fields. **When it appears in a base config file, it resolves to the directory of the extending (consuming) project, not the base file itself.**

This is the feature that makes centralization possible.

### Resolution rules per field type

| Field | Without `${configDir}` | With `${configDir}` |
|---|---|---|
| `compilerOptions.paths` | Relative to base file dir | Relative to **extending site's dir** ✓ |
| `compilerOptions.baseUrl` | Relative to base file dir | Relative to **extending site's dir** ✓ |
| `include` array | Relative to **base file dir** ⚠️ | Relative to **extending site's dir** ✓ |
| `exclude` array | Relative to **base file dir** ⚠️ | Relative to **extending site's dir** ✓ |
| `extends` references | Always relative to the file declaring them | N/A |

**Critical:** `include` and `exclude` without `${configDir}` resolve relative to the **base file**, not the extending site. This would break Astro's `.astro/types.d.ts` reference. You must use `${configDir}` in all four field types.

---

## The Implementation

### Step 1 — Create `tsconfig.sites.json` at monorepo root

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": ["astro/tsconfigs/strict", "./tsconfig.base.json"],
  "compilerOptions": {
    "baseUrl": "${configDir}",
    "paths": {
      "$lib":           ["${configDir}/../../core/src/lib"],
      "$lib/*":         ["${configDir}/../../core/src/lib/*"],
      "@mtools/core/*": ["${configDir}/../../core/src/*"]
    }
  },
  "include": ["${configDir}/.astro/types.d.ts", "${configDir}/**/*"],
  "exclude": ["${configDir}/dist", "${configDir}/node_modules"]
}
```

**Resolution verification for `sites/finance-tools`:**
- `${configDir}` = `/path/to/monorepo/sites/finance-tools`
- `baseUrl` = `sites/finance-tools/` ✓
- `$lib` = `sites/finance-tools/../../core/src/lib` = `core/src/lib` ✓
- `include[0]` = `sites/finance-tools/.astro/types.d.ts` ✓
- `include[1]` = `sites/finance-tools/**/*` ✓
- `exclude[0]` = `sites/finance-tools/dist` ✓

### Step 2 — Replace every site's `tsconfig.json`

```json
{
  "extends": "../../tsconfig.sites.json"
}
```

That is the entire file. Every site gets the same one.

### Step 3 — Verify (run these from inside each site)

```bash
# Inside sites/finance-tools:
pnpm check:astro
pnpm check:svelte
pnpm check:tsc

# From monorepo root:
pnpm turbo check
```

All checks should pass with zero errors. No behaviour change.

---

## Execution Contexts — All Safe

| How you run | What happens | Safe? |
|---|---|---|
| `turbo build` from root | Turbo executes `astro build` from each site's dir. Site reads its own `tsconfig.json` → extends `../../tsconfig.sites.json` → `${configDir}` = site dir | ✓ |
| `astro dev` from inside site | Reads `tsconfig.json` from CWD → same resolution | ✓ |
| `astro check` from inside site | Uses TypeScript compiler API, honours `${configDir}` | ✓ |
| `svelte-check --tsconfig ./tsconfig.json` | Delegates to TypeScript Language Service | ✓ |
| `tsc --noEmit` from inside site | Reads site tsconfig → extends → same | ✓ |
| Root `tsconfig.json` (IDE awareness) | Completely separate file, unaffected | ✓ |

---

## Known Caveat

Tools that parse `tsconfig.json` as raw JSON — without using the TypeScript compiler API — will not substitute `${configDir}` and will fail silently or with wrong paths.

**Tools in this monorepo's toolchain that are safe** (all use the TS compiler API):
- `astro check`
- `svelte-check`
- `tsc`
- Vite (via Astro's Vite integration)
- VS Code TypeScript language server

**Tools that would be a problem** (not currently used):
- Some ESLint parsers that read tsconfig as JSON directly
- Some custom bundler plugins
- Certain CI tools that inspect tsconfig without running tsc

If you add a new tool in the future and it has path issues after this change, check whether it uses the TS compiler API or raw JSON parsing.

---

## TypeScript v6 Note

This plan works identically on TypeScript v6. The `${configDir}` substitution is a stable config resolution feature introduced in 5.5 and TypeScript has a strong backwards-compatibility policy for config files. No changes to this plan are needed when upgrading from 5.x to 6.x.
