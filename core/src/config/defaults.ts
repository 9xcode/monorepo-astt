import type { CoreConfig } from './defaults.types.ts';

export const coreConfig: CoreConfig = {
  version: "1.0.1",
  support: {
    buyMeACoffee: {
      url: "",
    },
    kofi: {
      url: "https://ko-fi.com/yourusername",
    },
    paypal: {
      url: "https://paypal.me/ox41414141",
    },
    githubSponsors: {
      url: "",
    },
    patreon: {
      url: "https://www.patreon.com/cw/0x41414141",
    },
    wishlist: {
      url: "",
    },
    upi: {
      id: "", //yourname@upi
      qrImagePath: "",  // eg: ../assets/images/user-1.jpg
    },
    xmrchat: {
      url: "", // https://xmrchat.com/yourusername
    },
    cointree: {
      url: "", // https://cointr.ee/yourusername
    },
    crypto: {
      eth: "0x80Be54E3a334Cf7A8483EA7021FE412cB8B90c58",
      btc: "bc1qz7xnry0eazsemle7z6ttz6sqc2kdy2mj6fch7p",
    },
  },
};
