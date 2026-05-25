# Ads Implementation & Strategy Guide

## Overview
This document outlines the architecture for managing, toggling, and implementing advertisements safely across MultiTools, ensuring full compliance with Google AdSense, Mediavine, Ezoic, and other network policies.

---

## Part 1: How To Implement Core Slots

### Ad Slots Configuration
All advertisement slots are controlled centrally via `src/config.ts`. 
To ensure compliance with Google AdSense, **we do not use CSS `display: none` to hide ads**. If an ad slot is set to `false`, the system completely omits the HTML from the compiled page. This ensures AdSense crawlers never see "hidden" ad code.

### Available Slots
The following slots have placeholder components injected into the layouts by default:

**Home Page:**
*   `home-hero-bottom`: Placed immediately below the main search/hero area.
*   `home-grid-multiplex`: Placed visually simulating a native "multiplex" grid ad right below the tools grid.
*   `home-bottom`: Placed directly above the global footer.

**Tool Pages:**
*   `tool-header-top`: Placed at the very top of the page below the navbar.
*   `tool-content-top`: Placed above the interactive calculator widget.
*   `tool-content-middle`: Placed exactly between the "About this Tool" article and the Related Tools grid.
*   `tool-content-bottom`: Placed at the very end of the main content column.
*   `tool-sidebar-top`: Placed inside the sidebar, usually below the directory list.
*   `tool-sidebar-bottom`: Placed at the very bottom of the sidebar.

### Adding New Custom Placeholders
If you need a new ad location that does not exist above:
1.  Add a new unique key/value pair to `siteConfig.ads.slots` in `src/config.ts` (e.g., `"my-new-ad": true`).
2.  Open the relevant `.astro` layout file (e.g., `ToolLayout.astro`).
3.  Import the component at the top: `import AdPlaceholder from "../components/shared/AdPlaceholder.astro";`
4.  Inject it into the HTML where you want it: `<AdPlaceholder slotId="my-new-ad" />`.

---

## Part 2: Advanced Strategy & FAQ

All advertisements are controlled centrally via `src/config.ts`. 

```typescript
ads: {
  enabled: true, // MASTER SWITCH. False kills ALL ads instantly.
  autoAds: true, // Injects Google Auto Ads script globally.
  publisherId: "ca-pub-XXXXXXXXXXXXXXXX", // Your AdSense ID
  slots: {
    "home-hero-bottom": true,  
    "tool-content-top": false, 
    // ... manual slot toggles ...
  }
}
```

### The Master Kill Switch (`enabled`)
**Q: If I set `enabled: false`, will ALL ads go away? Auto ads too?**
**A: Yes.** `enabled` acts as the ultimate master kill switch. If set to `false`, it prevents the Auto Ads script from loading in the `<head>` AND it prevents every single manual `AdPlaceholder` from rendering. It wipes your site clean of ads.

---

## 2. Auto Ads vs Manual Ads 

### Auto Ads
**Q: Where does the Auto Ads code go?**
**A: It is automatically injected into the `<head>` of every page via `src/layouts/BaseLayout.astro`.** 
You do not need to copy/paste the script from Google into your files. Just put your ID in `config.ts` -> `publisherId` and set `autoAds: true`. The system handles the rest.

### Manual Ads
**Q: If I have 5 manual ads, where do the different codes go?**
**A: Inside `src/components/shared/AdPlaceholder.astro`.**
A manual ad requires two things to work: the `<ins>` tag and the `(adsbygoogle = window.adsbygoogle || []).push({});` script. If you look inside the `AdPlaceholder.astro` file, you will see commented-out code where these tags go.

You pass your specific Unit ID directly in your layouts like this:
`<AdPlaceholder slotId="tool-sidebar" adSlot="1234567890" adClient="ca-pub-YOURID" />`

### Using Both Together
**Q: Can I use both Auto Ads and Manual Ads at the same time?**
**A: Yes.** In fact, this is exactly what Google recommends. You put your most lucrative, highest-performing manual ad units exactly where you want them (like the sidebar), and then Auto Ads fills in the gaps (like adding a sticky ad to the bottom of the screen on mobile devices). Google is smart enough to see your manual ads and not overcrowd them.

---

## 3. Cumulative Layout Shift (CLS) & "Jumping" Content

**Q: If ads are responsive, will the layout shift and ruin the user experience?**
**A: No, because we are using exact size placeholders.**

Layout Shift (CLS) is a massive SEO penalty. It happens when an ad loads *after* the text loads, pushing the text down abruptly. 

**Our Approach:** You'll notice in `ToolLayout.astro` that our placeholders use Tailwind classes like `min-h-[100px]` or `min-h-[250px]`. 
This is the **modern, correct approach**. By reserving an empty box of the exact expected minimum size of the ad *before* the ad even loads, the surrounding text is already in its final position. When the ad finally pops into existence, it just fills the empty box. The layout doesn't shift a single pixel!

---

## 4. Alternative Ad Networks (Ezoic, Mediavine, Adsterra)

**Q: What if I switch to a different ad platform in the future?**
**A: Our architecture makes this incredibly easy.**

Other premium platforms (like Mediavine or Ezoic) usually require you to remove ALL Google AdSense code from your site. They have their own proprietary scripts that do all the work.

If you get accepted into Mediavine:
1. Go to `src/config.ts` and set `autoAds: false`. This kills the Google script.
2. Go into `BaseLayout.astro` and paste the Mediavine `<script>` they give you right next to where the AdSense script was.
3. Keep `enabled: true` and your manual slots enabled.
4. Modify `AdPlaceholder.astro` to render the `<div>` tags that Mediavine uses instead of Google's `<ins>` tags. 

Because we centralized all ad slots into the `AdPlaceholder` component, you only have to change the HTML code in **one single file**, and it will instantly update the ads across the entire website!

---

## 5. Sticky / Unfoldable Bottom Ads
**Q: Should I add slots for bottom sticky ads?**
**A: No.**

Creating a manual HTML "sticky bottom" bar (`position: fixed; bottom: 0`) and stuffing an AdSense `<ins>` tag inside it is **almost always an AdSense policy violation**. It causes accidental clicks on mobile devices because it overlays content improperly.

**The Safe Solution:** If you want sticky bottom ads, Google specifically provides a feature called **"Anchor Ads"**. You enable this in your AdSense Dashboard. Once `autoAds: true` is set in our config, Google will safely inject its own compliant sticky bottom ad.

---

## 6. Ads and Core Web Vitals
Adding real ads can destroy 100/100 performance scores. Since you are currently using placeholders, there is no performance impact. When you do add real ads (e.g. Google AdSense/GPT), use these industry-standard ad strategies:

* **`googletag.pubads().enableLazyLoad()`** — This ensures ads are only fetched and rendered when the user actually scrolls near them, avoiding unnecessary network and CPU usage on initial load.
* **Fixed slot dimensions** — Preserves your CLS (Cumulative Layout Shift) score. We already implemented this in `<AdPlaceholder>` via `min-height` classes. When using real scripts, ensure strict `width`/`height` styling matches the ad unit.
* **`async` + `defer` tags** — Preserves your LCP (Largest Contentful Paint) and FCP scores. Never load an ad script synchronously. Always use `<script async src="...">`.
