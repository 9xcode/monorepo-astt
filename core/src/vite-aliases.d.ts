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

declare module '@site-logo' {
  /** Site-specific logo component. Each site provides its own at
   *  src/components/common/ui/Logo.svelte — registered via the @site-logo
   *  Vite alias in core-pages.ts.
   *
   *  Uses AstroComponentFactory (same as @head-scripts / @body-scripts) because
   *  Svelte's Component<Props> generic doesn't surface props correctly when
   *  Astro's type-checker resolves from a module declaration stub (core checked
   *  in isolation). Actual prop type safety comes from the real .svelte file at
   *  the site level, where finance-tools:check:astro already passes 0 errors. */
  const Logo: import('astro').AstroComponentFactory;
  export default Logo;
}

declare module '@content-dates' {
  const contentDates: import('../integrations/content-dates/generator.ts').ContentDatesManifest;
  export default contentDates;
}
