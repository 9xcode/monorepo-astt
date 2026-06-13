// ────────────────────────────────────────────────────────────────────────────
// Site Configuration Template
//
// Replace all PLACEHOLDER_ values before launching a new site.
// See docs/project/creating-new-site.md for the full setup guide.
// ────────────────────────────────────────────────────────────────────────────

// Re-export all types so site-level code imports from './config' as normal.
import type {
  SiteConfig,
  SiteContent,
  NavItem,
  SeoConfig,
  NavigationConfig,
  SidebarConfig,
  FloatingActionsConfig,
  ThemeConfig,
  UiConfig,
  AdsConfig,
  SupportConfig,
  TocConfig,
  BlogConfig,
  SearchConfig,
  FeaturesConfig,
} from '@mtools/core/config/types';

export type {
  SiteConfig,
  SiteContent,
  NavItem,
  SeoConfig,
  NavigationConfig,
  SidebarConfig,
  FloatingActionsConfig,
  ThemeConfig,
  UiConfig,
  AdsConfig,
  SupportConfig,
  TocConfig,
  BlogConfig,
  SearchConfig,
  FeaturesConfig,
};

export const siteConfig: SiteConfig = {

  // ─── Core Identity ──────────────────────────────────────────────────────
  name: "PLACEHOLDER_SITE_NAME",          // e.g. "PDF Tools"
  domain: "PLACEHOLDER_DOMAIN",           // e.g. "pdftools.app"
  url: "https://PLACEHOLDER_DOMAIN",      // e.g. "https://pdftools.app"
  localStoragePrefix: "PLACEHOLDER_PREFIX_", // e.g. "pdf_" — keep short, must be unique per site

  // ─── Brand & Voice ─────────────────────────────────────────────────────
  brand: {
    shortName: "PLACEHOLDER_SITE_NAME",
    tagline: "PLACEHOLDER_TAGLINE",       // e.g. "The fastest PDF tools on the web."
  },

  // ─── Legal ──────────────────────────────────────────────────────────────────
  companyName: "PLACEHOLDER_COMPANY",

  legal: {
    /** Displayed as "Last updated" on all legal pages. Format: "Month YYYY" */
    lastUpdated: "June 2025",
    /**
     * Site-specific tool disclaimer entries appended to the Disclaimer page.
     * These supplement the shared defaults (Calculators, File Processing, Code, Text).
     * Leave as [] if the shared defaults are sufficient for this site.
     * Example entry:
     *   { category: "Finance & Investment Tools", description: "..." }
     */
    toolDisclaimers: [],
  },

  // ─── Contact ────────────────────────────────────────────────────────────
  contact: {
    email: "support@PLACEHOLDER_DOMAIN",
    location: "PLACEHOLDER_LOCATION",
  },

  // ─── Localization ───────────────────────────────────────────────────────
  localization: {
    currencySymbol: "$",
    currencyCode: "USD",
  },

  // ─── API Keys ───────────────────────────────────────────────────────────
  apiKeys: {
    web3Forms: import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY,
    web3FormsEndpoint: "https://api.web3forms.com/submit",
  },

  // ─── SEO ────────────────────────────────────────────────────────────────
  seo: {
    description: "PLACEHOLDER_SITE_DESCRIPTION",
    language: "en",
    defaultKeywords: ["tools", "free tools", "PLACEHOLDER_NICHE"],

    defaultAuthorSlug: "PLACEHOLDER_AUTHOR_SLUG", // Must match src/content/authors/<slug>.md
    twitterHandle: "@PLACEHOLDER_TWITTER",

    softwareApplication: {
      operatingSystem: "Windows, macOS, Linux, iOS, Android",
      isAccessibleForFree: true,
      browserRequirements: "Requires JavaScript",
    },

    organization: {
      knowsAbout: ["PLACEHOLDER_TOPIC_1", "PLACEHOLDER_TOPIC_2"],
    },

    // Add your tool categories here — must match the category field in tool frontmatter.
    categoryMappings: {
      "General": { appCategory: "UtilitiesApplication" },
    },

    titleSeparator: "-",
    titleDescriptors: {
      "_default": "Free Online Tool",
    },
  },

  // ─── UI / Layout ────────────────────────────────────────────────────────
  ui: {
    navigation: {
      header: [
        { label: "Home",    href: "/" },
        { label: "Tools",   href: "/tools" },
        { label: "Blog",    href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
      footer: [
        { label: "About Us",            href: "/about" },
        { label: "Privacy",             href: "/privacy" },
        { label: "Terms",               href: "/terms" },
        { label: "Disclaimer",          href: "/disclaimer" },
        { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
        { label: "DMCA",                href: "/dmca" },
        { label: "Contact",             href: "/contact" },
      ],
      mobile: [
        { label: "Home",  href: "/" },
        { label: "Tools", href: "/tools" },
        { label: "Blog",  href: "/blog" },
      ],
    },

    sidebar: {
      showAllToolsList: true,
      showGetAppCard: false,
      showSupportCard: false,
      showExploreToolsCard: true,
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
      name: "slate",      // Must match a file in core/src/styles/themes/<name>.css
    },

    getApp: {
      sections: {
        showFeatures: true,
        showTools: true,
        showHowItWorks: true,
        showTestimonials: true,
        showFaq: true,
      },
    },
  },

  // ─── Features ─────────────────────────────────────────────────────────
  features: {
    search: {
      enabled: true,
      defaultTab: 'tools',
      showTabs: { all: true, tools: true, blog: true },
    },

    homepage: {
      toolWidgetSection: {
        enabled: false,
        toolSlug: "",
      },
      featuredSection: {
        enabled: true,
        maxTools: 3,
      },
      toolsDiscovery: {
        initialDisplayCount: 20,
      },
      bottomCta: {
        enabled: true,
        showGetApp: true,
        showFeatureRequest: true,
        showSupportCard: true,
      },
    },

    toolPage: {
      defaultFullWidth: false,
      toc: {
        enabled: true,
        title: "On this page",
        minHeadings: 3,
        maxDepth: 3,
      },
      showRelatedTools: true,
      showAuthorCard: true,
    },

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
      showSupport: false,
      showFeedback: true,
      showGetApp: false,
    },

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

    support: {
      url: "",        // Set to "/support" to enable; "" hides all support CTAs
      label: "Support Us",
      label2: "Buy me a Coffee",
    },

    blog: {
      enabled: true,
      postsPerPage: 12,
      showRelatedPosts: true,
      showAuthorCard: true,
    },

    getApp: {
      // Set enabled: true and fill store URLs to activate the /get-app landing page
      enabled: false,
      landingPageUrl: "/get-app",
      appStoreUrl: "",   // e.g. "https://apps.apple.com/app/id..."
      playStoreUrl: "",  // e.g. "https://play.google.com/store/apps/details?id=..."
    },
  },
  // ─── Content ──────────────────────────────────────────────────────────────────
  // Replace all PLACEHOLDER_ values before launching a new site.
  content: {

    pages: {

      home: {
        title: "PLACEHOLDER_HOME_TITLE",                   // e.g. "QR Tools – Free Online QR Code Generator"
      },

      tools: {
        title: "PLACEHOLDER_TOOLS_TITLE",                  // e.g. "All Free QR Tools"
        description: "PLACEHOLDER_TOOLS_DESCRIPTION",
        heroBadge: "PLACEHOLDER_TOOLS_HERO_BADGE",          // e.g. "Complete Directory"
        heroTitle: "PLACEHOLDER_TOOLS_HERO_TITLE",          // e.g. "All Free Tools"
      },

      blog: {
        title: "PLACEHOLDER_BLOG_TITLE",
        description: "PLACEHOLDER_BLOG_DESCRIPTION",
      },

      categories: {
        title: "PLACEHOLDER_CATEGORIES_TITLE",
        description: "PLACEHOLDER_CATEGORIES_DESCRIPTION",
        heroBadge: "PLACEHOLDER_CATEGORIES_HERO_BADGE",
        heroTitle: "PLACEHOLDER_CATEGORIES_HERO_TITLE",
      },

      // Use {category} as a placeholder — replaced at render time.
      categoryPage: {
        titleTemplate: "PLACEHOLDER: Free {category} Tools",
        descriptionTemplate: "PLACEHOLDER: Explore our free {category} tools.",
        heroBadge: "PLACEHOLDER_CATEGORY_PAGE_BADGE",       // e.g. "Collection"
      },

      getApp: {
        title: "PLACEHOLDER_GET_APP_TITLE",            // e.g. "Download MyApp – Free iOS & Android App"
        description: "PLACEHOLDER_GET_APP_DESCRIPTION", // e.g. "Get MyApp for iOS and Android..."
      },

    },

    components: {

      hero: {
        headline: "PLACEHOLDER_HERO_HEADLINE",              // first line of the hero H1
        headline2: "PLACEHOLDER_HERO_HEADLINE2",            // prefix for the second line (e.g. 'Safer ')
        headlineAccent: "PLACEHOLDER_HERO_ACCENT",          // second line (italic gradient)
        subtitle: "PLACEHOLDER_HERO_SUBTITLE",              // paragraph below the H1
      },

      bottomCta: {
        getApp: {
          title: "PLACEHOLDER_BOTTOM_CTA_TITLE",
          description: "PLACEHOLDER_BOTTOM_CTA_DESCRIPTION",
          buttonLabel: "PLACEHOLDER_BUTTON",
        },
        featureRequest: {
          title: "PLACEHOLDER_CTA_FEATURE_TITLE",
          description: "PLACEHOLDER_CTA_FEATURE_DESCRIPTION",
          buttonLabel: "PLACEHOLDER_CTA_FEATURE_BUTTON",    // e.g. "Request Feature"
        },
        supportUs: {
          title: "PLACEHOLDER_CTA_SUPPORT_TITLE",
          description: "PLACEHOLDER_CTA_SUPPORT_DESCRIPTION",
        },
      },

      toolsGrid: {
        sectionTitle: "PLACEHOLDER_GRID_TITLE",             // e.g. "Discover Tools"
        sectionSubtitle: "PLACEHOLDER_GRID_SUBTITLE",
      },

      toolPage: {
        aboutSectionTitle: "PLACEHOLDER_ABOUT_SECTION_TITLE", // e.g. "About this Tool"
      },

      getAppCard: {
        description: "PLACEHOLDER_APP_CARD_DESCRIPTION",    // sidebar app promo card text
      },

      sidebar: {
        exploreToolsDescription: "PLACEHOLDER_SIDEBAR_EXPLORE", // blog sidebar card text
      },

      search: {
        placeholder: "PLACEHOLDER_SEARCH_PLACEHOLDER",      // search dialog input placeholder
      },

      getApp: {
        hero: {
          userCount: "PLACEHOLDER_USER_COUNT",    // e.g. "10,000+"
          ratingText: "PLACEHOLDER_RATING_TEXT",  // e.g. "4.9/5 on App Stores"
        },
        tools: {
          subtitle: "PLACEHOLDER_TOOLS_SUBTITLE",  // e.g. "Access over 50+ tools..."
          items: [
            { label: "PLACEHOLDER_TOOL_1" },
            { label: "PLACEHOLDER_TOOL_2" },
            { label: "PLACEHOLDER_TOOL_3" },
            { label: "And More" },
          ],
        },
        testimonials: [
          {
            quote: "PLACEHOLDER_REVIEW_1",
            initials: "AB",
            name: "PLACEHOLDER_NAME_1",
            platform: "App Store Review",
            rating: 5,
          },
          {
            quote: "PLACEHOLDER_REVIEW_2",
            initials: "CD",
            name: "PLACEHOLDER_NAME_2",
            platform: "Play Store Review",
            rating: 5,
          },
          {
            quote: "PLACEHOLDER_REVIEW_3",
            initials: "EF",
            name: "PLACEHOLDER_NAME_3",
            platform: "Play Store Review",
            rating: 4,
          },
        ],
      },
    },

  },
};
