// ─────────────────────────────────────────────────────────────────────────────
// @mtools/core — Site Configuration Types
//
// These interfaces define the shape of every site's siteConfig object.
// The config object itself lives in each site's src/config.ts.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SiteContent — All user-facing UI text that varies by site niche.
//
// Every field is required (no `?`). TypeScript will error at build time if any
// key is missing in a site's config.ts — no runtime surprises.
//
// Structure mirrors i18n namespace conventions (pages.*, components.*).
// When i18n is added later, this shape maps directly to a locale resource file.
// ─────────────────────────────────────────────────────────────────────────────

/** Site-specific user-facing text, grouped by page and component scope.
 *  All fields are required — missing any will cause a TypeScript build error.
 *  i18n-forward: this shape maps 1:1 to a locale resource file (e.g. en.json). */
export interface SiteContent {

  // ── Page-level content ─────────────────────────────────────────────────────
  pages: {

    home: {
      /** <title> tag for the homepage */
      title: string;
    };

    tools: {
      /** <title> tag for /tools */
      title: string;
      /** meta description for /tools */
      description: string;
      /** Small badge pill above the hero H1 */
      heroBadge: string;
      /** Hero section H1 */
      heroTitle: string;
    };

    blog: {
      /** <title> tag for /blog */
      title: string;
      /** meta description for /blog */
      description: string;
    };

    categories: {
      /** <title> tag for /categories */
      title: string;
      /** meta description for /categories */
      description: string;
      /** Small badge pill above the hero H1 */
      heroBadge: string;
      /** Hero section H1 */
      heroTitle: string;
    };

    /** Dynamic /categories/[category] page — use `{category}` as a placeholder.
     *  Core replaces it at render time via `.replace('{category}', categoryName)`. */
    categoryPage: {
      /** e.g. "Free {category} Tools – Online Utilities" */
      titleTemplate: string;
      /** e.g. "Explore our free {category} tools. No sign-up required." */
      descriptionTemplate: string;
      /** Small badge pill above the hero H1 */
      heroBadge: string;
    };

    getApp: {
      /** <title> tag for /get-app */
      title: string;
      /** meta description for /get-app */
      description: string;
    };

  };

  // ── Component-level content ────────────────────────────────────────────────
  components: {

    hero: {
      /** First line of the homepage hero H1 */
      headline: string;
      /** Second line prefix (e.g. 'Safer ' before the accent) */
      headline2: string;
      /** Second line — rendered in italic gradient style */
      headlineAccent: string;
      /** Subtitle paragraph below the H1 */
      subtitle: string;
    };

    bottomCta: {
      getApp: {
        title: string;
        description: string;
        buttonLabel: string;
      };
      featureRequest: {
        title: string;
        description: string;
        buttonLabel: string;
      };
      supportUs: {
        title: string;
        description: string;
      };
    };

    toolsGrid: {
      /** H2 title for the main tools discovery grid on the homepage */
      sectionTitle: string;
      /** Subtitle below the tools grid H2 */
      sectionSubtitle: string;
    };

    toolPage: {
      /** Title of the article section below the tool widget (e.g. "About this Tool") */
      aboutSectionTitle: string;
    };

    getAppCard: {
      /** Description text in the sidebar get-app promo card */
      description: string;
    };

    sidebar: {
      /** Description text in the blog sidebar "Explore Tools" card */
      exploreToolsDescription: string;
    };

    search: {
      /** Placeholder text for the search dialog input */
      placeholder: string;
    };

    getApp: {
      hero: {
        /** Social proof user count — e.g. "10,000+" */
        userCount: string;
        /** Rating display text — e.g. "4.9/5 on App Stores" */
        ratingText: string;
      };
      tools: {
        /** Subtitle under the tools section heading */
        subtitle: string;
        /** Grid items — include the "And X+ More" tile as the last entry */
        items: Array<{ label: string }>;
      };
      testimonials: Array<{
        /** Full review quote — without surrounding quotation marks */
        quote: string;
        /** Initials for avatar — e.g. "AJ" */
        initials: string;
        /** Reviewer display name — e.g. "Amit J." */
        name: string;
        /** Source platform — e.g. "App Store Review" */
        platform: string;
        /** Star rating 1–5 */
        rating: number;
      }>;
    };
  };
}

/** A single navigation link entry — children are one level deep max */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  /** Optional child links — renders as dropdown (header) or indented list (mobile) */
  children?: Omit<NavItem, 'children'>[];
}

/** All SEO-related config: meta, schemas, and author */
export interface SeoConfig {
  /** Default page description (used when a page doesn't provide its own) */
  description: string;
  /** HTML lang attribute and OG locale */
  language: string;
  /** Site-wide keyword tail appended to per-tool keywords */
  defaultKeywords: string[];
  /** Fallback author slug — used when a blog post or tool has no author set.
   *  The slug must match a file in src/content/authors/ (e.g. "abhishek" → abhishek.md).
   *  Author data (name, bio, avatar, socials) lives entirely in the Content Collection. */
  defaultAuthorSlug: string;
  /** Site-wide Twitter/X handle for twitter:site meta tag.
   *  Format: "@handle" or "handle" (the @ is added automatically if missing).
   *  Author-specific social links are stored in the Content Collection. */
  twitterHandle?: string;
  /** Schema.org SoftwareApplication fields */
  softwareApplication: {
    operatingSystem: string;
    isAccessibleForFree: boolean;
    browserRequirements: string;
  };
  /** Schema.org Organization fields */
  organization: {
    knowsAbout: string[];
  };
  /** Maps tool category slugs to appCategory / additionalType values */
  categoryMappings: Record<string, { appCategory: string; additionalType?: string }>;
  /**
   * Separator used between tool/page title and the descriptor suffix in SERP <title> tags.
   */
  titleSeparator: string;
  /**
   * Keyword-rich descriptor appended to tool page titles that have no custom seoTitle.
   * Keyed by category name (must match categoryMappings keys). Use "_default" as fallback.
   * Do NOT include the separator here — buildToolTitle() prepends it automatically.
   */
  titleDescriptors: Record<string, string>;
}

/** Header, footer, and mobile sidebar navigation */
export interface NavigationConfig {
  /** Desktop header — items with `children` render a hover dropdown */
  header: NavItem[];
  /** Footer — always flat and minimal */
  footer: NavItem[];
  /** Mobile sidebar — items with `children` render as parent link + indented children */
  mobile: NavItem[];
}

/** Sidebar layout toggles — reusable across page types */
export interface SidebarConfig {
  showAllToolsList: boolean;
  showGetAppCard: boolean;
  showSupportCard: boolean;
  /** Show the "Explore Tools" cross-promo card in the blog sidebar */
  showExploreToolsCard: boolean;
}

/** Floating actions configuration */
export interface FloatingActionsConfig {
  enabled: boolean;
  showSearch: boolean;
  showBackToTop: boolean;
  showShare: boolean;
  showToc: boolean;
}

/** Theme configuration */
export interface ThemeConfig {
  /** Default color mode: 'dark' | 'light' | 'system' */
  defaultMode: 'dark' | 'light' | 'system';
  /** The active color theme stylesheet (matches filename in styles/themes/) */
  name: string;  // Must match a file in core/src/styles/themes/<name>.css
}

/** Per-section visibility toggles for the /get-app landing page */
export interface GetAppUiConfig {
  sections: {
    /** AppFeatures — "Why download the app?" 4-feature grid */
    showFeatures: boolean;
    /** AppTools — "Everything You Need, In One App" tools grid */
    showTools: boolean;
    /** AppHowItWorks — "Simplicity at its finest" 3-step section */
    showHowItWorks: boolean;
    /** AppTestimonials — "Loved by Thousands" reviews grid */
    showTestimonials: boolean;
    /** AppFAQ — Frequently Asked Questions grid */
    showFaq: boolean;
  };
}

/** Cross-page UI / layout primitives */
export interface UiConfig {
  navigation: NavigationConfig;
  sidebar: SidebarConfig;
  floatingActions: FloatingActionsConfig;
  theme: ThemeConfig;
  /** /get-app landing page UI controls */
  getApp: GetAppUiConfig;
}

/** Google AdSense configuration */
export interface AdsConfig {
  /** Master switch — set false to strip all ad placeholders */
  enabled: boolean;
  /** Enable AdSense Auto Ads */
  autoAds: boolean;
  publisherId: string;
  /** Per-slot overrides — false hides that individual slot */
  slots: Record<string, boolean>;
}

/** Support / monetisation CTA */
export interface SupportConfig {
  /** Set to "" to hide all support buttons site-wide */
  url: string;
  label: string;
  label2: string;
}

/** Table-of-contents settings (tool pages) */
export interface TocConfig {
  enabled: boolean;
  title: string;
  /** Minimum number of headings before TOC is shown */
  minHeadings: number;
  maxDepth: number;
}

/** Blog feature configuration */
export interface BlogConfig {
  /** Master switch — when false, no blog pages are generated */
  enabled: boolean;
  /** Posts per page on the blog index */
  postsPerPage: number;
  /** Show "Related Articles" section below each blog post */
  showRelatedPosts: boolean;
  /** Show the author card below each blog post */
  showAuthorCard: boolean;
}

/** Search feature configuration */
export interface SearchConfig {
  enabled: boolean;
  defaultTab: 'all' | 'tools' | 'blog';
  showTabs: {
    all: boolean;
    tools: boolean;
    blog: boolean;
  };
}

/** App Download Landing Page feature configuration */
export interface GetAppConfig {
  /** Master switch — when false, hides all get-app UI across the entire site */
  enabled: boolean;
  /** Internal URL path for the Get App landing page — e.g. "/get-app" */
  landingPageUrl: string;
  /** iOS App Store deep link — e.g. "https://apps.apple.com/app/id..." */
  appStoreUrl: string;
  /** Google Play Store deep link — e.g. "https://play.google.com/store/apps/details?id=..." */
  playStoreUrl: string;
}

/** Opt-in feature capabilities, grouped by page scope */
export interface FeaturesConfig {
  search: SearchConfig;
  homepage: {
    toolWidgetSection: {
      /** Show a specific interactive tool directly on the homepage */
      enabled: boolean;
      /** The slug of the tool to embed (e.g. 'word-counter') */
      toolSlug: string;
    };
    featuredSection: {
      /** Show the Featured Tools section */
      enabled: boolean;
      /** Max tools to display in the featured section */
      maxTools: number;
    };
    toolsDiscovery: {
      /** 0 = show all; positive = show N then "Show More" */
      initialDisplayCount: number;
    };
    bottomCta: {
      /** Master switch — when false, the entire bottom CTA section (including its padding) is not rendered */
      enabled: boolean;
      /** Show the "Get App / Download App" card in the homepage bottom CTA section */
      showGetApp: boolean;
      /** Show the "Feature Request" card in the homepage bottom CTA section */
      showFeatureRequest: boolean;
      /** Show the "Support Us / Buy me a Coffee" card in the homepage bottom CTA section */
      showSupportCard: boolean;
    };
  };
  toolPage: {
    /** Set default full width for tool page */
    defaultFullWidth: boolean;
    toc: TocConfig;
    /** Show the "Related Tools" section below the tool article */
    showRelatedTools: boolean;
    /** Show the author card below the tool article */
    showAuthorCard: boolean;
  };
  favouriteTools: {
    enabled: boolean;
    storageKey: string;
    showInMobileMenu: boolean;
    maxDisplayHomepage: number;
    maxDisplayMobileMenu: number;
  };
  recentTools: {
    enabled: boolean;
    maxItems: number;
    storageKey: string;
    showInMobileMenu: boolean;
    maxDisplayHomepage: number;
    maxDisplayMobileMenu: number;
  };
  toolActionTray: {
    enabled: boolean;
    showFavourite: boolean;
    showShare: boolean;
    showSupport: boolean;
    showFeedback: boolean;
    showGetApp: boolean;
  };
  /** Google AdSense — opt-in monetisation feature */
  ads: AdsConfig;
  /** Support / donations CTA — opt-in feature */
  support: SupportConfig;
  /** Blog — article publishing system */
  blog: BlogConfig;
  /** App Download Landing Page — opt-in feature */
  getApp: GetAppConfig;
}

/** Root site configuration shape — every site must satisfy this contract */
export interface SiteConfig {
  // ── Core Identity ──────────────────────────────────────────────────────────
  name: string;
  domain: string;
  url: string;
  /** Prefix for all localStorage keys — ensures uniqueness per deployment */
  localStoragePrefix: string;

  // ── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    shortName: string;
    /** Brand tagline / value proposition */
    tagline: string;
  };

  // ── Legal ──────────────────────────────────────────────────────────────────
  companyName: string;

  /**
   * Legal pages configuration.
   * - `lastUpdated`: Displayed as "Last updated" on all legal pages.
   *   Format: human-readable month + year, e.g. "June 2025"
   * - `toolDisclaimers`: Optional site-specific tool category disclaimer entries
   *   appended to Section 7 of the Disclaimer page. Use these to add
   *   niche-relevant limitations beyond the shared defaults.
   *   Leave as an empty array [] if no additional entries are needed.
   */
  legal: {
    lastUpdated: string;
    toolDisclaimers: Array<{
      /** Bold category label, e.g. "Finance & Investment Tools" */
      category: string;
      /** One or two sentences describing the limitation for this tool type */
      description: string;
    }>;
  };

  // ── Contact ────────────────────────────────────────────────────────────────
  contact: {
    email: string;
    location: string;
  };

  // ── Localization ───────────────────────────────────────────────────────────
  localization: {
    currencySymbol: string;
    currencyCode: string;
  };

  // ── API Keys ───────────────────────────────────────────────────────────────
  apiKeys: {
    web3Forms: string;
    web3FormsEndpoint: string;
  };

  // ── SEO ────────────────────────────────────────────────────────────────────
  seo: SeoConfig;

  // ── UI / Layout ────────────────────────────────────────────────────────────
  ui: UiConfig;

  // ── Features ───────────────────────────────────────────────────────────────
  features: FeaturesConfig;

  // ── Content ────────────────────────────────────────────────────────────────
  /** Site-specific user-facing text. All fields required — missing any causes
   *  a TypeScript build error. i18n-forward: same shape as a locale resource file. */
  content: SiteContent;
}
