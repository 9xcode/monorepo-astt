#!/usr/bin/env node
// generate-widget-map.mjs
//
// Generates per-tool widget wrapper files for zero-bloat code splitting.
//
// WHY PER-TOOL FILES INSTEAD OF ONE BIG FILE:
//   The old approach put all 24 imports into one WidgetRenderer.astro.
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
//     'load' → client:load (default)
//     'idle' → client:idle (heavy tools, below fold)
//     'visible' → client:visible (tools deep in the page)
//     'only' → client:only="svelte" (localStorage/window/browser API tools)
//
// HOW TO ADD A NEW TOOL:
//   1. Create src/content/tools/<slug>/index.md
//   2. Create src/features/<slug>/Widget.svelte
//   Done. Generator handles everything else automatically.
//
// Run: node core/scripts/generate-widget-map.mjs  (from the site root)
// Runs automatically before dev/build/validate via package.json scripts.
//
// Phase 12: moved from scripts/generate-widget-map.mjs to core/scripts/.
//   Path resolution refactored from __dirname-based to process.cwd()-based
//   so it works correctly when run from any site's root directory.

import { readdirSync, existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// Phase 12: replaced `__dirname`-based root with process.cwd().
// process.cwd() is the site root (e.g. sites/finance-tools/) when the script
// is invoked from package.json, which is exactly what we need.
const projectRoot = process.cwd();
const featuresDir = join(projectRoot, 'src', 'features');
const contentDir  = join(projectRoot, 'src', 'content', 'tools');
const generatedDir = join(projectRoot, 'src', 'generated');
const widgetsDir  = join(generatedDir, 'widgets');
const rendererFile = join(generatedDir, 'WidgetRenderer.astro');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse the YAML frontmatter from a markdown file without an external dep.
 * Returns a plain object with string values for each key found.
 */
function parseFrontmatter(mdPath) {
  if (!existsSync(mdPath)) return {};
  const text = readFileSync(mdPath, 'utf-8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+)\s*:\s*"?([^"#\r\n]*)"?\s*$/);
    if (kv) result[kv[1].trim()] = kv[2].trim();
  }
  return result;
}

/**
 * Map loadPriority value → Astro client:* directive string.
 *
 * DEFAULT CHANGED: 'load' → 'only' (client:only="svelte")
 * Reason: slot="fallback" — the mechanism that renders the WidgetSkeleton
 * while JS loads — only works with client:only, not client:load.
 * These are pure reactive Svelte widgets with no SSR value, so the swap
 * is safe and enables a CLS-free skeleton fallback for all tools.
 */
function clientDirective(priority) {
  switch (priority) {
    case 'idle':    return 'client:idle';
    case 'visible': return 'client:visible';
    case 'load':    return 'client:only="svelte"'; // Remapped: load → only for slot="fallback" support
    case 'only':
    default:        return 'client:only="svelte"';
  }
}

/**
 * Write a file only if its content has actually changed (avoids unnecessary rebuilds).
 */
function writeIfChanged(filePath, content) {
  const existing = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';
  if (existing !== content) {
    writeFileSync(filePath, content, 'utf-8');
    return true; // changed
  }
  return false; // unchanged
}

// ---------------------------------------------------------------------------
// Discover tools that have a Widget.svelte
// ---------------------------------------------------------------------------

const widgetSlugs = new Set(
  readdirSync(featuresDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(featuresDir, d.name, 'Widget.svelte')))
    .map(d => d.name)
    .sort()
);

// ---------------------------------------------------------------------------
// Discover all content tool slugs (to find aliases using widgetSlug)
// ---------------------------------------------------------------------------

// A content slug is any folder inside src/content/tools/ with an index.md
const contentSlugs = readdirSync(contentDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(contentDir, d.name, 'index.md')))
  .map(d => d.name)
  .sort();

// ---------------------------------------------------------------------------
// Build per-tool info map
// ---------------------------------------------------------------------------

// For each content slug, resolve what widget it actually uses and its loadPriority.
const toolInfos = contentSlugs.map(slug => {
  const mdPath   = join(contentDir, slug, 'index.md');
  const fm       = parseFrontmatter(mdPath);

  // If widgetSlug is set, this tool is an alias — use the target tool's widget.
  const widgetSlug = fm.widgetSlug?.trim() || slug;

  // Only include tools that have an actual Widget.svelte to render.
  const hasWidget = widgetSlugs.has(widgetSlug);

  // Validation Warning: if they asked for an alias but it doesn't exist!
  if (fm.widgetSlug && !hasWidget) {
    console.warn(`⚠️  WARNING: Tool '${slug}' requests widgetSlug '${fm.widgetSlug}', but no such widget exists in src/features/`);
  }

  // loadPriority from frontmatter, validated to known values.
  const validPriorities = ['load', 'idle', 'visible', 'only'];
  const rawPriority = fm.loadPriority?.trim() || 'load';
  const priority = validPriorities.includes(rawPriority) ? rawPriority : 'load';

  return { slug, widgetSlug, hasWidget, priority };
}).filter(t => t.hasWidget); // Only generate wrappers for tools that have a widget

// ---------------------------------------------------------------------------
// Step 1: Ensure output directories exist
// ---------------------------------------------------------------------------

if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true });
if (!existsSync(widgetsDir))   mkdirSync(widgetsDir,   { recursive: true });

// ---------------------------------------------------------------------------
// Step 2: Generate per-tool wrapper files in src/generated/widgets/
// ---------------------------------------------------------------------------

let wrapperChanges = 0;

for (const { slug, widgetSlug, priority } of toolInfos) {
  const directive = clientDirective(priority);

  // Paths from the widgets/ dir
  const importPath  = `../../features/${widgetSlug}/Widget.svelte`;
  const skeletonPath = `../../components/common/ui/skeletons/WidgetSkeleton.astro`;

  // Only inject skeleton fallback for client:only directives (slot="fallback" is unsupported on client:load/idle/visible)
  const supportsSlotFallback = directive === 'client:only="svelte"';

  const content = supportsSlotFallback
    ? `---
// AUTO-GENERATED — do not edit manually.
// Regenerate: node core/scripts/generate-widget-map.mjs
// Tool: ${slug}${widgetSlug !== slug ? `  (uses widget from: ${widgetSlug})` : ''}
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
// Regenerate: node core/scripts/generate-widget-map.mjs
// Tool: ${slug}${widgetSlug !== slug ? `  (uses widget from: ${widgetSlug})` : ''}
// Hydration: ${directive}
import Widget from '${importPath}';
---
<Widget ${directive} />
`;

  const outPath = join(widgetsDir, `${slug}.astro`);
  if (writeIfChanged(outPath, content)) wrapperChanges++;
}

// Clean up stale wrapper files for tools that no longer exist
const existingWrappers = readdirSync(widgetsDir).filter(f => f.endsWith('.astro'));
const expectedWrappers = new Set(toolInfos.map(t => `${t.slug}.astro`));
let removals = 0;
for (const file of existingWrappers) {
  if (!expectedWrappers.has(file)) {
    unlinkSync(join(widgetsDir, file));
    removals++;
  }
}

// ---------------------------------------------------------------------------
// Step 3: Generate the WidgetRenderer.astro glob router
// ---------------------------------------------------------------------------

// List all generated wrapper slugs for the comment header
const wrapperList = toolInfos.map(t => t.slug).join(', ');

const rendererContent = `---
// AUTO-GENERATED — do not edit manually.
// Regenerate: node core/scripts/generate-widget-map.mjs
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

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const total = toolInfos.length;
const aliases = toolInfos.filter(t => t.widgetSlug !== t.slug).length;
const byPriority = {
  load:    toolInfos.filter(t => t.priority === 'load').length,
  idle:    toolInfos.filter(t => t.priority === 'idle').length,
  visible: toolInfos.filter(t => t.priority === 'visible').length,
  only:    toolInfos.filter(t => t.priority === 'only').length,
};

if (wrapperChanges > 0 || removals > 0 || rendererChanged) {
  console.log(`✅ Widget map generated:`);
  console.log(`   ${total} tools (${aliases} aliases)`);
  console.log(`   Directives — load: ${byPriority.load}, idle: ${byPriority.idle}, visible: ${byPriority.visible}, only: ${byPriority.only}`);
  if (wrapperChanges) console.log(`   ${wrapperChanges} wrapper file(s) updated`);
  if (removals)       console.log(`   ${removals} stale wrapper(s) removed`);
  if (rendererChanged) console.log(`   WidgetRenderer.astro updated`);
} else {
  console.log(`⏭️  Widget map up to date (${total} tools, ${aliases} aliases)`);
}
