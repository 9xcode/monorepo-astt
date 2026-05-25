/**
 * Type declarations for Vite aliases registered by core-pages.ts integration.
 *
 * These aliases are resolved at build time to site-specific Astro components.
 * The declarations here satisfy `tsc --noEmit` and `astro check` so the core
 * package can be type-checked independently of any concrete site.
 */

declare module '@widget-renderer' {
  const WidgetRenderer: import('astro').AstroComponentFactory;
  export default WidgetRenderer;
}

declare module '@head-scripts' {
  const HeadScripts: import('astro').AstroComponentFactory;
  export default HeadScripts;
}

declare module '@body-scripts' {
  const BodyScripts: import('astro').AstroComponentFactory;
  export default BodyScripts;
}

declare module '@content-dates' {
  const contentDates: import('../integrations/content-dates/generator.ts').ContentDatesManifest;
  export default contentDates;
}
