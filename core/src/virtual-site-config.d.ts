// This file is referenced by core/tsconfig.json paths for "virtual:site-config"
// so TypeScript can resolve the type inside core itself.
// The actual runtime module is a Vite virtual plugin registered in createAstroConfig().
export { siteConfig } from './env.d.ts';
