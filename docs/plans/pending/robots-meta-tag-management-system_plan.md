# Robots Meta Tag Management System

A layered, priority-based crawling control system. Think of it like CSS specificity — the most specific rule wins, unless the site-wide rule is an absolute global override.

---

## How the Logic Works (Cascade)

```
Site-wide noindex (siteConfig)   ← ABSOLUTE OVERRIDE. Overrules everything.
        ↓ (if site allows indexing)
Per-tool robots (frontmatter)    ← If set, uses this. Full noindex possible here.
        ↓ (if not set per-tool)
Site-wide default (siteConfig)   ← The default fallback for all tools.
```

**Key rule**: If `siteConfig.seo.robots.globalNoindex = true`, no per-tool override can override it. The whole site goes noindex. This is the "staging environment" or "maintenance mode" switch.

---

## Research — What robots directives matter?

The `<meta name="robots">` tag accepts a comma-separated list of directives. The most useful for an tools site:

| Directive | Meaning |
|---|---|
| `index` | Allow indexing (default) |
| `noindex` | Tell crawlers to not index this page |
| `follow` | Follow links on this page |
| `nofollow` | Don't follow links |
| `max-snippet:-1` | No limit on text snippet length in results |
| `max-image-preview:large` | Show large image previews in results |
| `max-video-preview:-1` | No limit on video preview |
| `noarchive` | Don't show cached copy in results |
| `noimageindex` | Don't index images on this page |

The **current default** in `BaseLayout.astro` is already excellent:
```
index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1
```

We will keep this as the default and layer overrides on top of it.

---

## Proposed Changes

### 1. `src/config.ts` — Site-wide robots settings

#### [MODIFY] [config.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/config.ts)

Add a `robots` block to the `seo` config section:

```typescript
seo: {
  robots: {
    // Set to true to force noindex on the ENTIRE site — overrides all per-page settings.
    // Use for: staging environments, pre-launch sites, maintenance mode.
    globalNoindex: false,

    // The default robots directives applied to ALL pages that don't override them.
    // These are the site-wide defaults used as the base.
    defaultDirectives: {
      index: true,
      follow: true,
      maxSnippet: -1,          // -1 = no limit
      maxImagePreview: 'large', // 'none' | 'standard' | 'large'
      maxVideoPreview: -1,      // -1 = no limit
    }
  },
  // ...existing softwareApplication, organization, categoryMappings...
}
```

---

### 2. `src/content/config.ts` — Per-tool frontmatter schema

#### [MODIFY] [config.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/content/config.ts)

Add a `robots` object to the tool Zod schema:

```typescript
robots: z.object({
  index:  z.boolean().optional(),   // true=index, false=noindex
  follow: z.boolean().optional(),   // true=follow, false=nofollow
  // Advanced overrides (uncommon but useful)
  noarchive:     z.boolean().optional(), // Don't show cached copy
  noimageindex:  z.boolean().optional(), // Don't index images on this page
  maxSnippet:    z.number().optional(),  // Custom snippet length limit
}).optional(),
```

**Frontmatter usage examples:**
```yaml
# Fully noindex this page (keep following links)
robots:
  index: false

# Noindex AND nofollow (max isolation)
robots:
  index: false
  follow: false

# Allow indexing but suppress cached copy link
robots:
  noarchive: true

# No images from this page in Google Images
robots:
  noimageindex: true
```

---

### 3. New utility — `src/utils/robots.ts` [NEW]

#### [NEW] [robots.ts](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/utils/robots.ts)

A pure function that resolves the final robots string given site config + per-page override:

```typescript
import { siteConfig } from '../config';

interface RobotsOverride {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  noimageindex?: boolean;
  maxSnippet?: number;
}

export function resolveRobotsContent(pageOverride?: RobotsOverride): string {
  // Rule 1: Global noindex always wins — no per-page override possible
  if (siteConfig.seo.robots.globalNoindex) {
    return 'noindex, nofollow';
  }

  const defaults = siteConfig.seo.robots.defaultDirectives;

  // Start from site defaults, then merge per-page overrides
  const index    = pageOverride?.index  ?? defaults.index;
  const follow   = pageOverride?.follow ?? defaults.follow;

  const parts: string[] = [];
  parts.push(index  ? 'index'   : 'noindex');
  parts.push(follow ? 'follow'  : 'nofollow');

  // Only include advanced directives when indexing is allowed
  if (index) {
    const snippet = pageOverride?.maxSnippet ?? defaults.maxSnippet;
    const imgPrev = defaults.maxImagePreview;
    const vidPrev = defaults.maxVideoPreview;
    parts.push(`max-snippet:${snippet}`);
    parts.push(`max-image-preview:${imgPrev}`);
    parts.push(`max-video-preview:${vidPrev}`);
  }

  if (pageOverride?.noarchive)    parts.push('noarchive');
  if (pageOverride?.noimageindex) parts.push('noimageindex');

  return parts.join(', ');
}
```

---

### 4. `src/layouts/BaseLayout.astro` — Use site-wide robots default

#### [MODIFY] [BaseLayout.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/layouts/BaseLayout.astro)

- Add `robots?: string` as a prop.
- Replace the hardcoded `<meta name="robots">` tag with a dynamic one.
- Pages that don't pass a `robots` prop use the `resolveRobotsContent()` with no override (= site defaults).

```astro
---
import { resolveRobotsContent } from '../utils/robots';
// ...
interface Props {
  title?: string;
  description?: string;
  canonicalURL: string;
  image?: string;
  type?: string;
  robots?: string; // Pre-resolved robots string, passed from parent layouts
}
const { ..., robots } = Astro.props;
const robotsContent = robots ?? resolveRobotsContent(); // fallback = site defaults
---
<!-- In <head>: -->
<meta name="robots" content={robotsContent} />
```

---

### 5. `src/pages/tools/[tool].astro` — Resolve robots and pass down

#### [MODIFY] [[tool].astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/pages/tools/[tool].astro)

Compute the resolved robots string for this specific tool, then pass it all the way down to `BaseLayout` via `ToolLayout`:

```astro
import { resolveRobotsContent } from '../../utils/robots';

// Resolve robots string: site-config → per-tool override
const robotsContent = resolveRobotsContent(entry.data.robots);
```

---

### 6. `src/layouts/ToolLayout.astro` — Thread robots prop through

#### [MODIFY] [ToolLayout.astro](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/src/layouts/ToolLayout.astro)

Add `robots?: string` to props interface and pass it through to `<BaseLayout>`.

---

### 7. `astro.config.mjs` — Sitemap exclusion

#### [MODIFY] [astro.config.mjs](file:///media/kumar/code/my-business/webprojects/multitools-astssl-1/astro.config.mjs)

When a tool has `robots.index: false`, it shouldn't appear in the sitemap either. Update the sitemap `filter` option to exclude such tools:

```javascript
sitemap({
  filter: (page) => {
    // Exclude tools that have per-page noindex set in frontmatter
    const toolMatch = page.match(/\/tools\/([^\/]+)\/?$/);
    if (toolMatch) {
      const slug = toolMatch[1];
      const mdPath = path.resolve(process.cwd(), `src/content/tools/${slug}/index.md`);
      if (fs.existsSync(mdPath)) {
        const content = fs.readFileSync(mdPath, 'utf8');
        // If robots.index is explicitly false, exclude from sitemap
        if (/^robots:\s*$/m.test(content) && /index:\s*false/m.test(content)) {
          return false;
        }
      }
    }
    return true;
  },
  serialize(item) { /* existing logic */ }
})
```

> [!NOTE]
> The sitemap filter approach reads raw frontmatter text (same pattern already used in the existing `serialize` function for `lastModified`). This keeps the logic self-contained and avoids running a full Astro content collection query inside the config file.

---

## User Review Required

> [!IMPORTANT]
> **Decision: Should `globalNoindex` also suppress the sitemap entirely?**
> If `siteConfig.seo.robots.globalNoindex = true`, we can also add a `filter: () => false` to the sitemap plugin to suppress all URLs from XML output. This would be the correct behavior for a staging site. Should we implement this too?

> [!IMPORTANT]
> **Decision: Should noindex tools also be excluded from `llms-full.txt` and search API?**
> Currently, the search API (`search.json.ts`) and LLM export (`llms-full.txt.ts`) filter by `isDraft`. Should tools with `robots: { index: false }` also be excluded from these endpoints? These are content endpoints that AI crawlers use — a noindex tool may still want to be visible to search.

---

## Open Questions

- Should `robots.follow: false` also suppress the tool from the sidebar "related tools" list?
- Do you want a shorthand field `noindex: true` for common use, instead of nesting `robots: { index: false }`?

---

## Verification Plan

### Automated Tests
- Run `npx astro check` to verify schema types are correct.
- Run `npm run build` to confirm the sitemap correctly excludes noindex tools.
- Inspect built HTML of a tool with `robots: { index: false }` to verify `noindex, nofollow` is in `<head>`.
- Inspect built HTML of a regular tool to confirm default directives match site config.

### Manual Verification
- Check `dist/sitemap-0.xml` to confirm noindex tools are absent.
- Confirm `globalNoindex: true` produces `noindex, nofollow` on ALL pages including homepage.
