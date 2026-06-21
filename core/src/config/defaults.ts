import type { CoreConfig } from './defaults.types.ts';

export const coreConfig: CoreConfig = {
  version: "1.0.1",
  support: {
    buyMeACoffee: {
      url: "https://buymeacoffee.com/yourusername",
    },
    kofi: {
      url: "https://ko-fi.com/yourusername",
    },
    paypal: {
      url: "https://paypal.me/yourusername",
    },
    githubSponsors: {
      url: "https://github.com/sponsors/yourusername",
    },
    patreon: {
      url: "https://patreon.com/yourusername",
    },
    wishlist: {
      url: "https://www.amazon.in/hz/wishlist/ls/XXXXXXXXXXXXXXXXX",
    },
    upi: {
      id: "yourname@upi",
      qrImagePath: "",  // eg: ../assets/images/user-1.jpg
    },
    xmrchat: {
      url: "https://xmrchat.com/yourusername",
    },
    cointree: {
      url: "https://cointr.ee/yourusername",
    },
    crypto: {
      eth: "0x0000000000000000000000000000000000000000",
      btc: "bc1qyouradresshere",
    },
  },
};
