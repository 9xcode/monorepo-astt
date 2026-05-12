// Type stub for virtual:site-config used by core/tsconfig.json path alias.
// This lets core's own type checker (astro check, tsc) resolve the module
// without needing a real Vite build context.
//
// The actual runtime module is a Vite virtual plugin in createAstroConfig().
// Sites resolve it via the ambient 'declare module' in their env.d.ts.
import type { SiteConfig } from './config/types.ts';
export const siteConfig: SiteConfig;
