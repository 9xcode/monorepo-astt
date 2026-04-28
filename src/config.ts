// ────────────────────────────────────────────────────────────────────────────
// Site Configuration — the single source of truth for all site-wide settings.
// Documentation: abhii-docs/config-documentation.md
//
// Top-level structure:
//   core         — Identity: name, domain, URL, version
//   brand        — Visual identity & voice: names, tagline
//   localization — Currency, locale
//   legal        — Company name, copyright year
//   temporal     — Dates, timezones, build time
//   contact      — Email, location, social
//   apiKeys      — Third-party integration keys
//   seo          — All SEO metadata: meta, author, schemas
//   ui           — Cross-page layout primitives: navigation, sidebar
//   features     — Opt-in functional capabilities grouped by page/scope
// ────────────────────────────────────────────────────────────────────────────

// ── Shared primitive types ───────────────────────────────────────────────────

/** A single navigation link entry — children are one level deep max */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  /** Optional child links — renders as dropdown (header) or indented list (mobile) */
  children?: Omit<NavItem, 'children'>[];
}

// ── Sub-interfaces (exported for reuse in component Props) ───────────────────

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
   * Example output: "SIP Calculator - Free Tax & Finance Calculator"
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
  showMobileAppCard: boolean;
  showSupportCard: boolean;
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
  /** The active color theme stylesheet (matches filename in src/styles/themes/) */
  name: string;
}

/** Cross-page UI / layout primitives */
export interface UiConfig {
  navigation: NavigationConfig;
  sidebar: SidebarConfig;
  floatingActions: FloatingActionsConfig;
  theme: ThemeConfig;
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
}

/** Opt-in feature capabilities, grouped by page scope */
export interface SearchConfig {
  enabled: boolean;
  defaultTab: 'all' | 'tools' | 'blog';
  showTabs: {
    all: boolean;
    tools: boolean;
    blog: boolean;
  };
}

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
  };
  toolPage: {
    toc: TocConfig;
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
    getAppHref: string;
  };
  /** Google AdSense — moved here as an opt-in monetisation feature */
  ads: AdsConfig;
  /** Support / monetisation CTA — moved here as an opt-in feature */
  support: SupportConfig;
  /** Blog — article publishing system */
  blog: BlogConfig;
}

/** Root site configuration shape */
interface SiteConfig {
  // ── Core Identity ──────────────────────────────────────────────────────────
  name: string;
  domain: string;
  url: string;
  version: string;
  /** Prefix for all localStorage keys — ensures uniqueness per deployment */
  localStoragePrefix: string;

  // ── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    shortName: string;
    /** Brand tagline / value proposition */
    tagline: string;
  };

  // ── Localization ───────────────────────────────────────────────────────────
  localization: {
    currencySymbol: string;
    currencyCode: string;
  };

  // ── Legal ──────────────────────────────────────────────────────────────────
  companyName: string;
  copyrightYear: number;

  // ── Temporal ───────────────────────────────────────────────────────────────
  /** Fallback timezone when a date has no explicit offset (e.g. "2026-03-15"). Use "UTC" or "+05:30". */
  defaultTimezone: string;
  datePublished: string;
  /** Frozen at build-start by astro.config.mjs — never use new Date() here. */
  buildTime: string;

  // ── Contact ────────────────────────────────────────────────────────────────
  contact: {
    email: string;
    location: string;
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
}

// ════════════════════════════════════════════════════════════════════════════
// ── Configuration Object ────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

export const siteConfig: SiteConfig = {

  // ─── Core Identity ──────────────────────────────────────────────────────
  name: "MultiTools",
  domain: "multitools.app",
  url: "https://multitools.app",
  // url: "http://localhost:4321",
  version: "1.0.0",
  localStoragePrefix: "mt_",

  // ─── Brand & Voice ─────────────────────────────────────────────────────
  brand: {
    shortName: "MultiTools",
    tagline: "Faster than AI, Safer than Cloud.",
  },

  // ─── Localization ───────────────────────────────────────────────────────
  localization: {
    currencySymbol: "₹",
    currencyCode: "INR",
  },

  // ─── Legal ──────────────────────────────────────────────────────────────
  companyName: "MultiTools",
  copyrightYear: new Date((typeof process !== 'undefined' && process.env.BUILD_TIME) ? process.env.BUILD_TIME : (import.meta.env?.PUBLIC_BUILD_TIME || new Date())).getFullYear(),

  // ─── Temporal ───────────────────────────────────────────────────────────
  defaultTimezone: "UTC",
  datePublished: "2026-03-08T12:00:00Z",
  buildTime: (typeof process !== 'undefined' && process.env.BUILD_TIME) ? process.env.BUILD_TIME : (import.meta.env?.PUBLIC_BUILD_TIME || new Date().toISOString().split('.')[0] + '+00:00'),

  // ─── Contact ────────────────────────────────────────────────────────────
  contact: {
    email: "support@multitools.app",
    location: "San Francisco, CA",
  },

  // ─── API Keys ───────────────────────────────────────────────────────────
  apiKeys: {
    web3Forms: import.meta.env.PUBLIC_WEB3FORMS_KEY,
    web3FormsEndpoint: "https://api.web3forms.com/submit",
  },

  // ─── SEO ────────────────────────────────────────────────────────────────
  seo: {
    description: "Discover a premium collection of privacy-focused, lightning-fast, free tools to edit, format, calculate, convert, and much more.",
    language: "en",
    defaultKeywords: ["tools", "calculators", "utilities", "free tools", "privacy-focused"],

    // Fallback author slug — used when a blog post or tool has no author: field set.
    // Must match a file in src/content/authors/ (abhishek → abhishek.md).
    // All author data (bio, avatar, socials) lives in the Content Collection.
    defaultAuthorSlug: "abhishek",

    // Site-wide Twitter/X handle for the twitter:site meta tag.
    // Author-specific Twitter URLs are stored in the author Content Collection.
    twitterHandle: "@Abhishek_Patni",

    softwareApplication: {
      operatingSystem: "Windows, macOS, Linux, iOS, Android",
      isAccessibleForFree: true,
      browserRequirements: "Requires JavaScript",
    },

    organization: {
      knowsAbout: ["Data Conversion", "Software Applications", "Personal Finance", "Web Development", "Productivity Tools"],
    },

    categoryMappings: {
      "Finance/Tax": { appCategory: "FinanceApplication", additionalType: "FinancialProduct" },
      "Calculators": { appCategory: "UtilitiesApplication", additionalType: "SoftwareApplication" },
      "Text Tools": { appCategory: "DeveloperApplication", additionalType: "SoftwareApplication" },
      "Converters": { appCategory: "UtilitiesApplication", additionalType: "DataConverter" },
      "Dummy": { appCategory: "UtilitiesApplication" },
    },


    titleSeparator: "-",
    titleDescriptors: {
      "Finance/Tax":  "Free Tax & Finance Calculator",
      "Calculators":  "Free Online Calculator",
      "Converters":   "Free Online Converter",
      "Text Tools":   "Free Online Text Tool",
      "_default":     "Free Online Tool",
    },
  },

  // ─── UI / Layout ────────────────────────────────────────────────────────
  ui: {
    navigation: {
      header: [
        { label: "Home",         href: "/" },
        {
          label: "Categories",   href: "/categories",
          children: [
            { label: "Calculators",   href: "/categories/calculators" },
            { label: "Converters",    href: "/categories/converters" },
            { label: "Finance / Tax", href: "/categories/finance-tax" },
            { label: "Text Tools",   href: "/categories/text-tools" },
          ],
        },
        { label: "Blog",         href: "/blog" },
        { label: "Support",      href: "/support" },
        { label: "Download App", href: "/mobile-app" },
      ],
      footer: [
        { label: "About Us",   href: "/about" },
        { label: "Privacy",    href: "/privacy" },
        { label: "Terms",      href: "/terms" },
        { label: "Disclaimer", href: "/disclaimer" },
        { label: "Contact",    href: "/contact" },
        { label: "Support",    href: "/support" },
      ],
      mobile: [
        { label: "Home",       href: "/" },
        {
          label: "Categories", href: "/categories",
          children: [
            { label: "Calculators",   href: "/categories/calculators" },
            { label: "Converters",    href: "/categories/converters" },
            { label: "Finance / Tax", href: "/categories/finance-tax" },
            { label: "Text Tools",   href: "/categories/text-tools" },
          ],
        },
        { label: "Blog",       href: "/blog" },
      ],
    },

    sidebar: {
      showAllToolsList: true,
      showMobileAppCard: false,
      showSupportCard: true,
    },

    floatingActions: {
      enabled: true,
      showSearch: true,
      showBackToTop: true,
      showShare: true,
      showToc: true,
    },

    theme: {
      defaultMode: "system",
      name: "slate",
    },
  },

  // ─── Features ───
  features: {
    // Search configuration
    search: {
      enabled: true,
      defaultTab: 'tools',
      showTabs: {
        all: true,
        tools: true,
        blog: true,
      },
    },

    // Homepage-scoped features
    homepage: {
      toolWidgetSection: {
        enabled: false,
        toolSlug: "loan-amortization-calculator",
      },
      featuredSection: {
        enabled: true,
        maxTools: 3,
      },
      toolsDiscovery: {
        // 0 = show all tools immediately. Positive number = show that many, then "Show More".
        initialDisplayCount: 20,
      },
    },

    // Tool-page-scoped features
    toolPage: {
      toc: {
        enabled: true,
        title: "On this page",
        minHeadings: 3,
        maxDepth: 3,
      },
    },

    // Cross-page user activity features
    favouriteTools: {
      enabled: true,
      storageKey: "favourites",
      showInMobileMenu: true,
      maxDisplayHomepage: 6,
      maxDisplayMobileMenu: 6,
    },

    recentTools: {
      enabled: true,
      maxItems: 6,
      storageKey: "recents",
      showInMobileMenu: true,
      maxDisplayHomepage: 0,
      maxDisplayMobileMenu: 6,
    },

    toolActionTray: {
      enabled: true,
      showFavourite: true,
      showShare: true,
      showSupport: true,
      showFeedback: true,
      showGetApp: true,
      getAppHref: "/mobile-app",
    },

    // Monetisation: Google AdSense
    ads: {
      enabled: false,
      autoAds: false,
      publisherId: "ca-pub-XXXXXXXXXXXXXXXX",
      slots: {
        "home-hero-bottom": false,
        "home-grid-multiplex": false,
        "home-bottom": false,
        "tool-header-top": false,
        "tool-content-top": false,
        "tool-content-middle": false,
        "tool-content-bottom": false,
        "tool-sidebar-top": false,
        "tool-sidebar-bottom": false,
      },
    },

    // Monetisation: Support / donations CTA
    // Set url to "" to hide all support buttons site-wide.
    support: {
      url: "/support",
      label: "Support Us",
    },

    // Blog system
    blog: {
      enabled: true,
      postsPerPage: 12,
    },
  },
};
