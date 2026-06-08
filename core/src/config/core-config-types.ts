/**
 * CoreConfig — shared, cross-site configuration for @mtools/core.
 *
 * Unlike SiteConfig (which is per-site and injected via virtual:site-config),
 * CoreConfig holds values that are the same across all sites in the monorepo
 * — or serve as sensible shared defaults.
 *
 * Import directly in Astro pages/components (build-time only):
 *   import { coreConfig } from '../config/core-config.ts';
 */

// ── Support & Donations ───────────────────────────────────────────────────────

/** Configuration for a single donation/support platform link. */
export interface SupportPlatformLink {
  /** Full URL to the platform profile/page. Set to "" to hide this option. */
  url: string;
}

/** UPI payment configuration (India-specific). */
export interface UpiConfig {
  /** UPI ID to display and copy, e.g. "yourname@upi". Set to "" to hide. */
  id: string;
  /**
   * Absolute path to the UPI QR code image relative to the site's public/ dir.
   * e.g. "/images/upi-qr.png". Set to "" to show a placeholder instead.
   */
  qrImagePath: string;
}

/** Cryptocurrency wallet configuration. */
export interface CryptoConfig {
  /** Ethereum wallet address. Set to "" to hide. */
  eth: string;
  /** Bitcoin wallet address. Set to "" to hide. */
  btc: string;
}

/** All support/donation platform links and payment options. */
export interface SupportDonationConfig {
  /** Buy Me a Coffee platform link. */
  buyMeACoffee: SupportPlatformLink;
  /** Ko-fi platform link (supports one-time and monthly). */
  kofi: SupportPlatformLink;
  /** PayPal.me link. */
  paypal: SupportPlatformLink;
  /** GitHub Sponsors profile link. */
  githubSponsors: SupportPlatformLink;
  /** Patreon platform link. */
  patreon: SupportPlatformLink;
  /** XMR Chat — Monero-based tip/chat platform. */
  xmrchat: SupportPlatformLink;
  /** CoinTr.ee — crypto linktree aggregator page. */
  cointree: SupportPlatformLink;
  /** Generic wishlist link (Amazon, Flipkart, etc.). */
  wishlist: SupportPlatformLink;
  /** UPI payment options (India). */
  upi: UpiConfig;
  /** Crypto wallet addresses. */
  crypto: CryptoConfig;
}

// ── Root CoreConfig ───────────────────────────────────────────────────────────

/** Root shape for the shared core configuration. */
export interface CoreConfig {
  /** Support/donation platform configuration. */
  support: SupportDonationConfig;
}
