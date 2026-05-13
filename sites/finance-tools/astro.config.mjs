// @ts-check
// Finance-Tools — Astro configuration
//
// This is intentionally thin. All shared Astro/Vite config lives in the
// createAstroConfig factory in @mtools/core/config/astro-config.
// Site-specific overrides (e.g. extra integrations, redirects, etc) can be passed
// as the second argument: createAstroConfig(siteConfig, { integrations: [...], redirects: { '/old': '/new' } })
import { createAstroConfig } from '@mtools/core/config/astro-config';
import { siteConfig } from './src/config.ts';

export default createAstroConfig(siteConfig);
