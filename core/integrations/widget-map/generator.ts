// generator.ts — Widget Map Core Logic
//
// Generates per-tool widget wrapper files for zero-bloat code splitting.
//
// WHY PER-TOOL FILES INSTEAD OF ONE BIG FILE:
//   The naive approach puts all N imports into one WidgetRenderer.astro.
//   Vite would bundle ALL widgets into the JS chunk for every tool page.
//   A user loading Word Counter was forced to download Mortgage Calc JS too.
//
//   This approach generates one tiny .astro file per tool in src/generated/widgets/.
//   Each file has exactly ONE import — its own widget.
//   Vite/Rollup code-splits them automatically.
//   Word Counter only downloads word-counter JS. Zero other tools load.
//
// OUTPUTS:
//   src/generated/widgets/<slug>.astro  — one per tool, single import + client: directive
//   src/generated/WidgetRenderer.astro  — glob router that picks the right wrapper by slug
//
// FEATURES HANDLED AUTOMATICALLY:
//   - widgetSlug aliases: if a tool has widgetSlug: "sip-calculator" in frontmatter,
//     its wrapper imports sip-calculator's Widget.svelte instead of its own.
//   - loadPriority: reads frontmatter to emit the correct client:* directive.
//     'load' → client:only="svelte" (remapped — only supports slot="fallback")
//     'idle' → client:idle
//     'visible' → client:visible
//     'only' → client:only="svelte"
//
// Called by the widgetMap() Astro integration in astro:config:setup.
// Ported from core/scripts/generate-widget-map.mjs (was a shell pre-command).

import {
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { AstroIntegrationLogger } from 'astro';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolInfo {
  slug: string;
  widgetSlug: string;
  hasWidget: boolean;
  priority: 'load' | 'idle' | 'visible' | 'only';
}

export interface GenerateResult {
  total: number;
  aliases: number;
  wrapperChanges: number;
  removals: number;
  rendererChanged: boolean;
  byPriority: Record<'load' | 'idle' | 'visible' | 'only', number>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse the YAML frontmatter from a markdown file without an external dependency.
 * Returns a plain object with string values for each key found.
 */
function parseFrontmatter(mdPath: string): Record<string, string> {
  if (!existsSync(mdPath)) return {};
  const text = readFileSync(mdPath, 'utf-8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match || !match[1]) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+)\s*:\s*"?([^"#\r\n]*)"?\s*$/);
    if (kv && kv[1] && kv[2] !== undefined) {
      result[kv[1].trim()] = kv[2].trim();
    }
  }
  return result;
}

/**
 * Map loadPriority value → Astro client:* directive string.
 *
 * DEFAULT: 'load' → 'client:only="svelte"'
 * Reason: slot="fallback" — which renders WidgetSkeleton while JS loads —
 * only works with client:only, not client:load/idle/visible.
 * These are pure reactive Svelte widgets with no SSR value, so the swap is
 * safe and enables a CLS-free skeleton fallback for all tools.
 */
function clientDirective(priority: string): string {
  switch (priority) {
    case 'idle':    return 'client:idle';
    case 'visible': return 'client:visible';
    case 'load':    // intentional fallthrough — remapped for slot="fallback" support
    case 'only':
    default:        return 'client:only="svelte"';
  }
}

/**
 * Write a file only if its content has actually changed.
 * Avoids touching files unnecessarily, which would cause Vite to invalidate
 * modules and trigger unnecessary HMR updates.
 */
function writeIfChanged(filePath: string, content: string): boolean {
  const existing = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';
  if (existing !== content) {
    writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Main generator function
// ---------------------------------------------------------------------------

/**
 * Scan the site's features/ and content/tools/ directories and write the
 * per-tool wrapper files + WidgetRenderer router into src/generated/.
 *
 * @param siteRoot  Absolute path to the site root (e.g. /path/to/sites/finance-tools)
 * @param logger    Astro integration logger for build output
 * @returns         Summary of what was generated/changed/removed
 */
export function generateWidgetMap(
  siteRoot: string,
  logger: Pick<AstroIntegrationLogger, 'info' | 'warn' | 'debug'>,
): GenerateResult {
  const featuresDir   = join(siteRoot, 'src', 'features');
  const contentDir    = join(siteRoot, 'src', 'content', 'tools');
  const generatedDir  = join(siteRoot, 'src', 'generated');
  const widgetsDir    = join(generatedDir, 'widgets');
  const rendererFile  = join(generatedDir, 'WidgetRenderer.astro');

  // ── Discover tools that have a Widget.svelte ──────────────────────────────

  // Guard: directory may not exist on a freshly scaffolded site.
  // readdirSync throws ENOENT without this — crash would prevent dev server from starting.
  const widgetSlugs = new Set(
    existsSync(featuresDir)
      ? readdirSync(featuresDir, { withFileTypes: true })
          .filter(d => d.isDirectory() && existsSync(join(featuresDir, d.name, 'Widget.svelte')))
          .map(d => d.name)
          .sort()
      : [],
  );

  // ── Discover all content tool slugs ───────────────────────────────────────

  // A content slug is any folder inside src/content/tools/ with an index.md.
  // Guard: same reason — directory may not exist yet.
  const contentSlugs = existsSync(contentDir)
    ? readdirSync(contentDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && existsSync(join(contentDir, d.name, 'index.md')))
        .map(d => d.name)
        .sort()
    : [];

  // ── Build per-tool info map ───────────────────────────────────────────────

  const validPriorities = new Set(['load', 'idle', 'visible', 'only']);

  const toolInfos: ToolInfo[] = contentSlugs
    .map((slug): ToolInfo => {
      const mdPath = join(contentDir, slug, 'index.md');
      const fm     = parseFrontmatter(mdPath);

      // If widgetSlug is set, this tool is an alias — use the target tool's widget.
      const widgetSlug = fm['widgetSlug']?.trim() || slug;

      const hasWidget = widgetSlugs.has(widgetSlug);

      // Warn if a widgetSlug alias points to a non-existent widget
      if (fm['widgetSlug'] && !hasWidget) {
        logger.warn(
          `Tool '${slug}' uses widgetSlug '${fm['widgetSlug']}', ` +
          `but 'src/features/${fm['widgetSlug']}/Widget.svelte' is missing.`
        );
      }

      const rawPriority = fm['loadPriority']?.trim() ?? 'load';
      const priority = (validPriorities.has(rawPriority) ? rawPriority : 'load') as ToolInfo['priority'];

      return { slug, widgetSlug, hasWidget, priority };
    })
    .filter(t => t.hasWidget);

  // ── Ensure output directories exist ──────────────────────────────────────

  if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true });
  if (!existsSync(widgetsDir))   mkdirSync(widgetsDir,   { recursive: true });

  // ── Generate per-tool wrapper files ──────────────────────────────────────

  let wrapperChanges = 0;

  for (const { slug, widgetSlug, priority } of toolInfos) {
    const directive = clientDirective(priority);
    const supportsSlotFallback = directive === 'client:only="svelte"';

    // Relative import path from widgets/ dir back to features/
    // widgets/<slug>.astro → ../../features/<widgetSlug>/Widget.svelte
    const importPath   = `../../features/${widgetSlug}/Widget.svelte`;
    const skeletonPath = `@mtools/core/components/common/ui/skeletons/WidgetSkeleton.astro`;

    const aliasComment = widgetSlug !== slug ? `  (uses widget from: ${widgetSlug})` : '';

    const content = supportsSlotFallback
      ? `---
// AUTO-GENERATED — do not edit manually.
// Regenerate: runs automatically on every dev/build via widgetMap() integration.
// Tool: ${slug}${aliasComment}
// Hydration: ${directive}
import Widget from '${importPath}';
import WidgetSkeleton from '${skeletonPath}';
---
<Widget ${directive}>
  <WidgetSkeleton slot="fallback" />
</Widget>
`
      : `---
// AUTO-GENERATED — do not edit manually.
// Regenerate: runs automatically on every dev/build via widgetMap() integration.
// Tool: ${slug}${aliasComment}
// Hydration: ${directive}
import Widget from '${importPath}';
---
<Widget ${directive} />
`;

    const outPath = join(widgetsDir, `${slug}.astro`);
    if (writeIfChanged(outPath, content)) wrapperChanges++;
  }

  // ── Clean up stale wrapper files ──────────────────────────────────────────

  const existingWrappers = readdirSync(widgetsDir).filter(f => f.endsWith('.astro'));
  const expectedWrappers = new Set(toolInfos.map(t => `${t.slug}.astro`));
  let removals = 0;
  for (const file of existingWrappers) {
    if (!expectedWrappers.has(file)) {
      unlinkSync(join(widgetsDir, file));
      removals++;
    }
  }

  // ── Generate the WidgetRenderer.astro glob router ─────────────────────────

  const wrapperList = toolInfos.map(t => t.slug).join(', ');

  const rendererContent = `---
// AUTO-GENERATED — do not edit manually.
// Regenerate: runs automatically on every dev/build via widgetMap() integration.
//
// HOW THIS WORKS (zero-bloat code splitting):
//   Each tool has its own wrapper in src/generated/widgets/<slug>.astro
//   with exactly ONE import — its own Widget.svelte.
//   Vite/Rollup code-splits each wrapper into an isolated chunk automatically.
//   This page only loads the ONE chunk it needs. Zero other tools download.
//
// Tools with wrappers (${toolInfos.length}): ${wrapperList}

interface Props { slug: string; }
const { slug } = Astro.props;

// Lazy glob — { eager: false } is intentional and critical.
// Each .astro wrapper is an independent Rollup chunk.
// Astro only fetches the chunk matching the current slug.
const wrappers = import.meta.glob<{ default: any }>('./widgets/*.astro');
const loader   = wrappers[\`./widgets/\${slug}.astro\`];

// If the slug has a wrapper, load and render it.
// If not (tool has no Widget.svelte), render nothing — page still shows content.
const WidgetWrapper = loader ? (await loader()).default : null;
---
{WidgetWrapper && <WidgetWrapper />}
`;

  const rendererChanged = writeIfChanged(rendererFile, rendererContent);

  // ── Compute stats ─────────────────────────────────────────────────────────

  const byPriority = {
    load:    toolInfos.filter(t => t.priority === 'load').length,
    idle:    toolInfos.filter(t => t.priority === 'idle').length,
    visible: toolInfos.filter(t => t.priority === 'visible').length,
    only:    toolInfos.filter(t => t.priority === 'only').length,
  };

  return {
    total: toolInfos.length,
    aliases: toolInfos.filter(t => t.widgetSlug !== t.slug).length,
    wrapperChanges,
    removals,
    rendererChanged,
    byPriority,
  };
}

/**
 * Returns the absolute path to the site's src/generated/ directory.
 * Exported so corePages() can reference the same location for the @widget-renderer alias.
 */
export function getGeneratedDir(siteRoot: URL): string {
  return fileURLToPath(new URL('src/generated/', siteRoot));
}
