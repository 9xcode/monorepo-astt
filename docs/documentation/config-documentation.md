# Site Configuration (`siteConfig`) Documentation

This document provides a comprehensive breakdown of the `src/config.ts` file. The `siteConfig` object acts as the central control panel for the entire MultiTools project, allowing you to quickly toggle features, update site metadata, control advertisements, and alter UI behavior without modifying any component source code.

---

## 1. Base Details
The core identification properties for the website.
* **`name`**: The full name of the site (e.g., "MultiTools"). Used in titles, schemas, and main headers.
* **`domain`**: The bare domain name (e.g., "multitools.app").
* **`url`**: The absolute URL of the production website (e.g., "https://multitools.app"). Critical for canonical URLs, sitemaps, and OG images.
* **`version`**: The current semantic version of the site build.
* **`localStoragePrefix`**: A short string prefix (e.g., "mt_") applied to all `localStorage` keys used by the site. This ensures our stored data doesn't clash with other apps running on the same domain (like in local development).

## 2. Brand & UI Configuration
* **`brand.shortName`**: A compressed version of the site name, utilized in tight UI spaces like the mobile menu or compact headers.
* **`brand.tagline`**: The site's main marketing slogan / value proposition (e.g., "Faster than AI, Safer than Cloud").

## 3. Localization Settings
* **`localization.currencySymbol`**: The default currency symbol used across calculators (e.g., "₹").
* **`localization.currencyCode`**: The standard ISO currency code (e.g., "INR").

## 4. SEO & Content
* **`seo.description`**: The global meta description used as a fallback for SEO and social sharing.
* **`seo.language`**: The default HTML lang attribute value (e.g., "en").
* **`seo.defaultKeywords`**: An array of fallback keyword strings appended to tool-specific keywords in the `WebApplication` JSON-LD schema and used for SEO enrichment. These are merged with auto-generated tag keywords to produce a dense, deduplicated keyword set.

## 5. Advanced SEO Schemas
The `seo` object powers all structured data (JSON-LD) generated for tool pages, the homepage, and the base layout.

### 5.1. Software Application Defaults (`seo.softwareApplication`)
These values are injected into every tool's `WebApplication` JSON-LD schema.
* **`operatingSystem`**: Comma-separated list of supported operating systems (e.g., "Windows, macOS, Linux, iOS, Android").
* **`isAccessibleForFree`**: Boolean indicating the tool is free to use. Drives the `Offer` price schema.
* **`browserRequirements`**: A human-readable string describing browser requirements (e.g., "Requires JavaScript").

### 5.2. Organization Knowledge (`seo.organization`)
* **`knowsAbout`**: An array of topic strings (e.g., "Data Conversion", "Software Applications") passed to the `Organization` JSON-LD schema on every page. This tells search engines what subject areas the site is an authority on.

### 5.3. Category Mappings (`seo.categoryMappings`)
A `Record<string, { appCategory, additionalType? }>` that maps content categories to Schema.org application types.
* **Key**: The exact category name as it appears in tool frontmatter (e.g., "Finance/Tax", "Calculators").
* **`appCategory`**: The Schema.org application category (e.g., "FinanceApplication", "UtilitiesApplication").
* **`additionalType`** (optional): An additional Schema.org type to produce a multi-typed `@type` array (e.g., `["WebApplication", "FinancialProduct"]`).
* If a tool's category has no mapping, it falls back to `{ appCategory: "UtilitiesApplication" }`.

### 5.4. Title Configuration (`seo.titleSeparator` & `seo.titleDescriptors`)
* **`seo.titleSeparator`**: Separator used between tool/page title and the descriptor suffix in SERP `<title>` tags.
* **`seo.titleDescriptors`**: Keyword-rich descriptor appended to tool page titles that have no custom `seoTitle`. Keyed by category name (must match `categoryMappings` keys), with `_default` as a fallback.

## 6. Dates & Timezones
* **`defaultTimezone`**: The fallback timezone applied when a date is written without an explicit offset (e.g., "UTC" or "+05:30"). Ensure consistency across schemas and sitemaps.
* **`datePublished`**: A global fallback date for the Article schema, representing when the site or original base content was published.
* **`buildTime`**: A strictly managed variable that freezes the timestamp at the exact moment the Astro build process starts. **Do not alter this to `new Date()`**, as doing so will break synchronization between sitemap generation, HTML meta tags, and schema outputs.

## 7. Company & Copyright
* **`companyName`**: The legal name of the entity operating the site.
* **`copyrightYear`**: Dynamically grabs the year from the `buildTime` to ensure the footer copyright is always up-to-date.

## 8. Contact Information
* **`contact.email`**: The primary support email address.
* **`contact.location`**: The physical or generalized location (e.g., "San Francisco, CA") displayed on the Contact page.

## 9. Author Fallback & Socials
The primary author configuration has been migrated to Astro Content Collections (`src/content/authors/`). However, the `siteConfig` still holds important fallback and site-wide social settings:
* **`seo.defaultAuthorSlug`**: The slug of the author used as a fallback if a blog post or tool doesn't explicitly define an author in its frontmatter. This must reference a valid `.md` file in `src/content/authors/`.
* **`seo.twitterHandle`**: The site-wide Twitter handle (e.g., "@multitools") used for the `twitter:site` meta tag and social sharing.

## 10. API Keys and Endpoints
* **`apiKeys.web3Forms`**: Uses environment variables (`import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY`) to securely manage the key for the Contact Form.
* **`apiKeys.web3FormsEndpoint`**: The API destination URL for form submissions.

## 11. Advertisement Configuration (`features.ads`)
Centralized control over Google AdSense (or alternative ad network) placement.
* **`features.ads.enabled`**: The master switch. Setting this to `false` disables all auto and manual ad slots globally.
* **`features.ads.autoAds`**: Injects the Google AdSense Auto Ads script into the `<head>` of every page when `true`.
* **`features.ads.publisherId`**: Your unique AdSense Publisher ID (e.g., "ca-pub-XXXXXXXX").
* **`features.ads.slots`**: A mapping of named placement areas (like `home-hero-bottom`, `tool-sidebar-top`) to booleans. Set individual slots to `false` to disable ads in specific UI locations.

## 12. Navigation & Layout Items
Arrays dictating the links rendered in various menus. Navigation items can support a single level of nesting via a `children` array, rendering as dropdowns on desktop and indented lists on mobile. now icons are also supported.
* **`navigation.header`**: Primary nav links. Supports nested children.
* **`navigation.footer`**: Links rendered in the standard footer layout. Flat list only.
* **`navigation.mobile`**: Links surfaced explicitly in the mobile hamburger drawer. Supports nested children.

### 12.1. UI Toggles
* **`ui.sidebar.showAllToolsList`**: Toggles the scrollable directory list in the sidebar.
* **`ui.sidebar.showMobileAppCard`**: Shows/hides the "Download App" card in the sidebar.
* **`ui.sidebar.showSupportCard`**: Shows/hides the "Support Us" card in the sidebar.
* **`ui.floatingActions`**: Controls the sticky utility buttons (Search, Back to Top, Share, TOC) that appear on scroll.
* **`ui.theme.defaultMode`**: Default color mode ('dark', 'light', or 'system').
* **`ui.theme.name`**: The active color theme stylesheet.

## 13. Feature Toggles

The `features` object controls the visibility and behavior of major UI components without requiring edits to `.astro` or `.svelte` files.

### 13.1. Search Configuration
* **`search.enabled`**: Master switch for the search system.
* **`search.defaultTab`**: The active tab when the search modal opens ('all', 'tools', or 'blog').
* **`search.showTabs`**: Toggle individual tabs (All, Tools, Blog) within the search modal.

### 13.2. Homepage Features
* **`homepage.toolWidgetSection`**: Allows embedding a full interactive tool widget directly onto the homepage (e.g., a Loan Calculator) via `toolSlug`.
* **`homepage.featuredSection.enabled`**: Toggles the "Featured Tools" row.
* **`homepage.featuredSection.maxTools`**: Capping limit for how many tools can be featured.
* **`homepage.toolsDiscovery.initialDisplayCount`**: Controls the frontend pagination of the main tool grid. E.g., setting to `20` shows 20 tools initially with a "Show More" button. Setting to `0` renders all tools immediately.

### 13.3. Table of Contents (TOC) (`toolPage.toc`)
* **`toolPage.toc.enabled`**: Global switch for generating TOCs on markdown content. Tools can individually override this via their frontmatter (`toc: false`).
* **`toolPage.toc.title`**: The UI heading for the TOC card.
* **`toolPage.toc.minHeadings`**: The minimum number of markdown headings required in a tool before the TOC card actually renders.
* **`toolPage.toc.maxDepth`**: Controls how deep the TOC parses (e.g., `3` parses H2 and H3 tags).

### 13.4. User Workspace (Favourites & Recents)
These modules use purely client-side `localStorage` to create a personalized experience with zero backend database.
* **`favouriteTools`**: Lookups for explicitly saved tools. Includes options to rename the `storageKey`, toggle its appearance in the mobile menu, and cap how many are displayed on the homepage vs. the mobile drawer.
* **`recentTools`**: Tracks visited tool pages. Has a `maxItems` limit to prevent `localStorage` overflow (deletes oldest automatically).

### 13.5. Tool Action Tray
Governs the sticky/inline bar found immediately below a tool's primary widget.
* Allows individual toggling of the Favorite, Share, Support, Feedback, and Get App buttons.
* **`getAppHref`**: Configurable destination URL for the "Get App" mobile banner.

### 13.6. Blog Configuration
* **`blog.enabled`**: Master switch. If `false`, the blog system is disabled and pages are hidden.
* **`blog.postsPerPage`**: Number of posts visible on the main blog index before pagination.

## 14. Support / Monetization (`features.support`)
A dedicated object connecting "Support Us" or "Buy me a Coffee" links to various buttons scattered across the UI (the sidebar `SupportCard`, the `ToolActionTray` support button, and the `/support` page).
* **`features.support.url`**: The destination link. Setting this to an empty string (`""`) will automatically hide all support buttons across the site regardless of other config settings.
* **`features.support.label`**: The text rendered on the buttons (e.g., "Support Us").
