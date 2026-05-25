// index.ts — contentDates() Astro Integration
//
// Resolves publishedAt and updatedAt for every tool and blog content file
// using the following hierarchy (highest → lowest trust):
//
//   1. Frontmatter `publishedAt` / `updatedAt`  ← author explicitly sets
//   2. Git first-commit / last-commit date       ← auto, accurate, rebuild-safe
//   3. publishedAt fallback for updatedAt        ← "content never modified"
//   Never: build time                            ← artificial freshening, removed
//
// LIFECYCLE:
//   astro:config:setup (async, awaited by Astro before Vite starts)
//     → reads all src/content/tools/*/index.md and src/content/blog/*/index.md
//     → runs ONE batch git log command to get all file dates
//     → generates src/generated/content-dates.json
//     → registers addWatchFile() on src/content/tools/ and src/content/blog/
//
// USAGE (automatic — registered in createAstroConfig, sites need nothing extra):
//   import { contentDates } from '@mtools/core/integrations/content-dates';
//   export default defineConfig({ integrations: [contentDates()] });
//
// CI/CD REQUIREMENT:
//   Git history must be available for automatic date resolution.
//   In GitHub Actions, use: actions/checkout@v4 with fetch-depth: 0
//   Without full history, falls back to frontmatter-only (logs a warning, no crash).
//
// WATCH BEHAVIOUR:
//   During `astro dev`, modifying any content file triggers a dev server restart.
//   The generator re-runs and picks up the new/changed dates automatically.
//   writeIfChanged() prevents unnecessary HMR when content hasn't changed.

import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { generateContentDates, getGeneratedDir } from './generator.ts';

export { getGeneratedDir } from './generator.ts';

export function contentDates(): AstroIntegration {
  return {
    name: '@mtools/content-dates',
    hooks: {
      'astro:config:setup': async ({ config, updateConfig, addWatchFile, logger, command, isRestart }) => {
        const siteRoot = fileURLToPath(config.root);

        // ── @content-dates Vite alias ──────────────────────────────────────
        // Resolves '@content-dates' → <siteRoot>/src/generated/content-dates.json
        // This lets resolver.ts do:  import contentDatesJson from '@content-dates'
        // without hard-coding any path. The alias must be registered here (not in
        // astro-config.ts) because config.root (site root) is only known at hook time.
        const contentDatesJsonPath = join(getGeneratedDir(config.root), 'content-dates.json');
        updateConfig({
          vite: {
            resolve: {
              alias: {
                '@content-dates': contentDatesJsonPath,
              },
            },
          },
        });
        logger.debug(`@mtools/content-dates: @content-dates → ${contentDatesJsonPath}`);

        // Run the generator. writeIfChanged inside means this is a no-op
        // when nothing has changed — fast on dev server restarts.
        const result = generateContentDates(siteRoot, logger);

        // ── Logging ────────────────────────────────────────────────────────
        const total = result.tools + result.blog;
        if (total === 0) {
          logger.warn('[content-dates] No content files found. Check src/content/tools/ and src/content/blog/');
        } else {
          const sources = [];
          if (result.fromFrontmatter > 0) sources.push(`${result.fromFrontmatter} frontmatter`);
          if (result.fromGit > 0)         sources.push(`${result.fromGit} git`);

          logger.info(
            `[content-dates] Resolved ${result.tools} tools + ${result.blog} blog posts` +
            (sources.length > 0 ? ` (${sources.join(', ')})` : '') +
            ` — copyright year: ${result.copyrightYear}`,
          );

          if (result.gitUnavailable) {
            logger.warn(
              '[content-dates] Git history unavailable — dates from frontmatter only. ' +
              'In CI, add `fetch-depth: 0` to your checkout step for full accuracy.',
            );
          }
        }

        // ── Dev-mode file watching ─────────────────────────────────────────
        // Watch content directories so the generator re-runs when content changes.
        // Only register in dev — build runs once, no watching needed.
        if (command === 'dev') {
          if (!isRestart) {
            logger.debug(
              '[content-dates] watching src/content/tools/ and src/content/blog/ for changes',
            );
          }
          addWatchFile(new URL('src/content/tools/', config.root));
          addWatchFile(new URL('src/content/blog/', config.root));
        }
      },
    },
  };
}
