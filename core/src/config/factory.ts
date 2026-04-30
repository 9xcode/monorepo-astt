import type { SiteConfig } from './types.ts';

/**
 * createSiteConfig — deep-merges site overrides on top of sensible defaults.
 *
 * Each site's src/config.ts passes its full config object here.
 * For now this is a pass-through (the site provides everything) — the deep-merge
 * pattern is here for future use when partial configs are supported.
 *
 * The buildTime field is resolved at call time from process.env.BUILD_TIME
 * (set by astro.config.mjs before anything else runs) so every page in a build
 * sees the exact same frozen timestamp.
 *
 * Usage in sites/finance-tools/src/config.ts:
 *   import { createSiteConfig } from '@mtools/core/config/factory';
 *   export const siteConfig = createSiteConfig({ ... });
 */
export function createSiteConfig(config: SiteConfig): SiteConfig {
  // Resolve buildTime from the frozen env var set by astro.config.mjs.
  // Falls back to PUBLIC_BUILD_TIME (client hydration) or current time (SSR edge case).
  const buildTime =
    (typeof process !== 'undefined' && process.env['BUILD_TIME'])
      ? process.env['BUILD_TIME']!
      : (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_BUILD_TIME)
        ? (import.meta as any).env.PUBLIC_BUILD_TIME
        : new Date().toISOString().split('.')[0] + '+00:00';

  const copyrightYear = new Date(buildTime).getFullYear();

  return {
    ...config,
    buildTime,
    copyrightYear,
  };
}
