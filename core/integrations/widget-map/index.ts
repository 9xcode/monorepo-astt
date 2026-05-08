// index.ts — widgetMap() Astro Integration
//
// Replaces the shell pre-command pattern:
//   "dev":   "generate-widget-map && astro dev"
//   "build": "generate-widget-map && astro build"
//
// The integration hooks into astro:config:setup — which runs before Vite
// initializes — so the generated files exist by the time the @widget-renderer
// alias (set by corePages()) is needed for module resolution.
//
// LIFECYCLE:
//   astro:config:setup (async, awaited by Astro before Vite starts)
//     → generates src/generated/widgets/*.astro
//     → generates src/generated/WidgetRenderer.astro
//     → registers addWatchFile() on src/features/ and src/content/tools/
//        (triggers dev server restart when new tools/widgets are added)
//
// USAGE (automatic — registered in createAstroConfig, sites need nothing):
//   import { widgetMap } from '@mtools/core/integrations/widget-map';
//   export default defineConfig({ integrations: [widgetMap()] });
//
// WATCH BEHAVIOUR:
//   During `astro dev`, adding a new src/features/<slug>/Widget.svelte or
//   a new src/content/tools/<slug>/index.md triggers a dev server restart.
//   The generator re-runs and picks up the new entry automatically.
//   This causes a ~1-3s restart — intentional, not a bug. Code generation
//   must complete before Vite rebuilds the module graph.

import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import { generateWidgetMap } from './generator.ts';

export { getGeneratedDir } from './generator.ts';

export function widgetMap(): AstroIntegration {
  return {
    name: '@mtools/widget-map',
    hooks: {
      'astro:config:setup': async ({ config, addWatchFile, logger, command, isRestart }) => {
        const siteRoot = fileURLToPath(config.root);

        // Run the generator. writeIfChanged guards inside mean this is
        // effectively a no-op when nothing has changed — fast on restarts.
        const result = generateWidgetMap(siteRoot, logger);

        // Log output
        if (result.wrapperChanges > 0 || result.removals > 0 || result.rendererChanged) {
          const { load, idle, visible, only } = result.byPriority;
          
          const statsParts = [];
          if (load > 0) statsParts.push(`load:${load}`);
          if (idle > 0) statsParts.push(`idle:${idle}`);
          if (visible > 0) statsParts.push(`visible:${visible}`);
          if (only > 0) statsParts.push(`only:${only}`);

          logger.info(`Generated widget map for ${result.total} tools (${result.aliases} aliases)`);
          if (statsParts.length > 0) logger.info(`  Hydration: ${statsParts.join(' | ')}`);
          
          const changes = [];
          if (result.wrapperChanges > 0) changes.push(`${result.wrapperChanges} wrapper(s) updated`);
          if (result.removals > 0) changes.push(`${result.removals} stale file(s) removed`);
          if (result.rendererChanged) changes.push(`renderer updated`);
          
          if (changes.length > 0) {
            logger.info(`  Changes: ${changes.join(', ')}`);
          }
        } else if (result.total === 0) {
          logger.warn(`No tools with widgets found. Check src/features/ and src/content/tools/`);
        } else {
          logger.info(`Widget map up to date (${result.total} tools, ${result.aliases} aliases)`);
        }

        // ── Dev-mode file watching ──────────────────────────────────────────
        // Watch the directories that feed the generator. When a new
        // Widget.svelte or index.md appears, Astro restarts the dev server
        // which re-runs this hook and regenerates the widget map.
        // Only register in dev — build runs once, no watching needed.
        if (command === 'dev') {
          // Log only on first start, not restarts, to avoid noise
          if (!isRestart) {
            logger.debug(
              `@mtools/widget-map: watching src/features/ and src/content/tools/ for new entries`,
            );
          }
          addWatchFile(new URL('src/features/', config.root));
          addWatchFile(new URL('src/content/tools/', config.root));
        }
      },
    },
  };
}
