# Feature: Homepage Tool Widget Section

## 1. Understanding Summary
- **What is being built:** A configurable section on the homepage that embeds a fully functional, interactive tool (e.g., Word Counter), along with an excerpt of its related article and a "Read More" button that routes to the dedicated tool page.
- **Why it exists:** To give users immediate access to the primary tool of the website right from the homepage, reducing friction and bounce rates (especially useful for niche, single-purpose sites).
- **Who it is for:** Visitors who want to use the core tool instantly upon landing, without having to navigate through categories.
- **Key constraints:**
  - Placed below the Hero section and above the Featured section.
  - Interactive element functional on the homepage.
  - Svelte widget lazy loaded to preserve initial payload speed.
  - Zero cost if disabled in configuration.

## 2. Assumptions & Risks
- **Performance:** Astro's dynamic component system and `WidgetRenderer` will handle lazy loading properly. The element will be styled to minimize layout shifts.
- **Content:** Reusing `shortDescription` or `description` from the markdown frontmatter prevents duplicating text inside `config.ts`.
- **Failsafe:** If a tool slug is invalid or has no widget, the section gracefully fails and entirely omits rendering.

## 3. Decision Log
- **Decision 1: Dynamic Content Resolution (Approach A)**
  - *Alternatives considered:* Hardcoded component registry mapping.
  - *Why chosen:* Astro's collection queries and the existing `WidgetRenderer` pattern make it effortless to inject the specific Svelte component dynamically, without writing custom import statements every time the featured tool changes.
- **Decision 2: Config Placement**
  - *Alternatives considered:* Top-level feature toggle.
  - *Why chosen:* Specifically categorizing it under `features.homepage.toolWidgetSection` strictly ties it to its domain in `config.ts`.

## 4. Implementation Plan
1. **`src/config.ts`**: Update the `FeaturesConfig` type and instance to include `homepage.toolWidgetSection` with `enabled` (boolean) and `toolSlug` (string) properties.
2. **`src/components/home/sections/ToolWidgetSection.astro`**: Create the component. 
   - Accept the `toolSlug`.
   - Query the `tools` collection and retrieve the data.
   - Setup a two-column or stacked layout holding the `WidgetRenderer` on one side and the textual description snippet with a "Read More" CTA on the other. 
3. **`src/pages/index.astro`**: Import `<ToolWidgetSection />` and inject it between the `<HeroSection />` and `<FeaturedTools />` blocks, conditionally rendering it only if `config.features.homepage.toolWidgetSection.enabled` is `true`.
