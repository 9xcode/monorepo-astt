# Search, Analytics & Indexing Setup Guide
> Covers: Google Tag Manager · Google Analytics 4 · Google Search Console · Bing Webmaster Tools · IndexNow · AdSense · Custom Events
> Stack: Astro (static) · Cloudflare Pages · Monorepo

---

## Architecture — How Scripts Are Injected

Every site in this monorepo uses `BaseLayout.astro` (in `core/src/layouts/`), which loads two per-site files on every page:

```
<head>  ← HeadScripts.astro   (GTM snippet, verifications)
<body>  ← BodyScripts.astro   (GTM noscript fallback)
```

These files live at:
```
sites/<site-name>/src/components/integrations/HeadScripts.astro
sites/<site-name>/src/components/integrations/BodyScripts.astro
```

**Rule:** Edit only those two files per site. Never touch `BaseLayout.astro` or any core layout for tracking scripts.

**One GTM container per site.** Each domain gets its own GTM container, GA4 property, and Bing Webmaster property. Do not mix.

---

## Why GTM Instead of Direct GA4

GTM is a script manager — you install it once in code, then add/change/remove any tag (GA4, AdSense, Facebook Pixel, etc.) from the GTM dashboard without touching code again.

```
Code (installed once, never changed):
  GTM snippet in HeadScripts.astro
    └── GTM container manages:
          ├── GA4 tag          (add via GTM dashboard)
          ├── AdSense          (add via GTM dashboard)
          ├── Custom events    (add via GTM dashboard)
          └── Any future tag   (add via GTM dashboard)
```

---

## Step 1 — Create Accounts

### Google Tag Manager
1. Go to [tagmanager.google.com](https://tagmanager.google.com)
2. Click **Create Account**
3. Fill in:
   - Account Name: your brand name (e.g. "Online QR Code Scanner")
   - Country: your country
   - Container name: your domain (e.g. `onlineqrcodescanner.com`)
   - Target platform: **Web**
4. Accept terms → GTM gives you a `GTM-XXXXXXX` container ID
5. **Repeat for each site** — every domain gets its own container

### Google Analytics 4
1. Go to [analytics.google.com](https://analytics.google.com)
2. Click **Admin (gear icon) → Create → Property**
3. Fill in:
   - Property name: your site name
   - Reporting time zone: your timezone
   - Currency: your currency
4. Business details → fill as appropriate
5. Click **Create** → choose **Web**
6. Enter your domain → Stream name: your site name → Click **Create stream**
7. Copy the **Measurement ID** — it looks like `G-XXXXXXXXXX`
8. **Repeat for each site**

> You do NOT need to add the GA4 snippet to your code — GTM will load it for you. Just copy the Measurement ID.

### Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click **Add property** → Choose **Domain** (not URL prefix)
3. Enter your domain without `https://` (e.g. `onlineqrcodescanner.com`)
4. Google shows a TXT record — add it to Cloudflare DNS (DNS only, not proxied)
5. Click **Verify**
6. **Repeat for each site**

### Bing Webmaster Tools
1. Go to [bing.com/webmasters](https://www.bing.com/webmasters)
2. Sign in with a Microsoft account
3. Click **Add a site**
4. Choose **Import from Google Search Console** — this imports all your already-verified sites automatically. No extra verification meta tag needed.
   - If GSC import is not available: choose **Meta Tag** verification → copy the `<meta name="msvalidate.01" content="..." />` tag → paste it into `HeadScripts.astro` → verify
5. **Repeat for each site**

---

## Step 2 — Connect GA4 Inside GTM

Do this inside the GTM dashboard for each container:

1. Open your GTM container → **Tags → New**
2. Click **Tag Configuration** → choose **Google Tag**
3. Tag ID: paste your GA4 Measurement ID (`G-XXXXXXXXXX`)
4. Click **Triggering** → choose **All Pages** (`Initialization - All Pages` trigger)
5. Name the tag: `GA4 - Configuration`
6. **Save**
7. Click **Submit** (top right) → Publish the container

GA4 is now live through GTM. Test it: open your site in a browser, then check **GA4 → Reports → Realtime** — you should see yourself as an active user within 30 seconds.

---

## Step 3 — Add GTM Code to Each Site

### `HeadScripts.astro`

Path: `sites/<site-name>/src/components/integrations/HeadScripts.astro`

```astro
---
import { siteConfig } from "../../config";
---

<!-- Google Tag Manager -->
<script is:inline>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->

{/* Google AdSense Auto Ads (controlled by src/config.ts — do not remove) */}
{siteConfig.features.ads.enabled && siteConfig.features.ads.autoAds && siteConfig.features.ads.publisherId !== "ca-pub-XXXXXXXXXXXXXXXX" && (
    <script is:inline async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.features.ads.publisherId}`} crossorigin="anonymous"></script>
)}
```

> Replace `GTM-XXXXXXX` with the actual container ID for that site. Keep the AdSense block as-is — it is inactive until you enable it in `config.ts`.

### `BodyScripts.astro`

Path: `sites/<site-name>/src/components/integrations/BodyScripts.astro`

```astro
---
---

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

> Replace `GTM-XXXXXXX` with the same container ID used in `HeadScripts.astro`. This noscript fallback is required by Google's GTM spec for users with JavaScript disabled.

---

## Step 4 — Submit Sitemaps

### Google Search Console
1. Open Search Console → select your property
2. Left sidebar → **Sitemaps**
3. Submit:
   - `https://onlineqrcodescanner.com/sitemap-index.xml`
   - `https://multitools.app/sitemap-index.xml`

### Bing Webmaster Tools
1. Open Bing Webmaster Tools → select your site
2. Left sidebar → **Sitemaps**
3. Submit the same sitemap URLs as above

> If you imported from Google Search Console, Bing may auto-import your sitemaps too. Check and confirm they appear.

---

## Step 5 — Set Up IndexNow (Bing Fast Indexing)

IndexNow lets you notify Bing (and other engines) the moment you publish or update a page. Instead of waiting for Bing's crawl cycle (days to weeks), IndexNow gets URLs indexed within minutes.

### How It Works
1. You generate a random key
2. You host a text file at the root of your site with that key as its content
3. When you publish a URL, you send a POST request to the IndexNow API
4. Bing crawls and indexes that URL immediately

### Your IndexNow Key Files (Already Created)

The key files are already in the `public/` folders:

```
onlineqrcodescanner.com  →  public/e4f23611fb674c7d89586d4cc287a120.txt
multitools.app           →  public/9f3b7ac6b69e4a3891d4e78a6358c5a4.txt
```

Each file contains only the key string as its content. Bing verifies the key by fetching this file.

Verify the key files are live:
- `https://onlineqrcodescanner.com/e4f23611fb674c7d89586d4cc287a120.txt`
- `https://multitools.app/9f3b7ac6b69e4a3891d4e78a6358c5a4.txt`

### Submitting URLs via IndexNow

After deploying new or updated pages, send this POST request:

**For `onlineqrcodescanner.com`:**
```http
POST https://api.indexnow.org/IndexNow
Content-Type: application/json; charset=utf-8

{
  "host": "onlineqrcodescanner.com",
  "key": "e4f23611fb674c7d89586d4cc287a120",
  "keyLocation": "https://onlineqrcodescanner.com/e4f23611fb674c7d89586d4cc287a120.txt",
  "urlList": [
    "https://onlineqrcodescanner.com/",
    "https://onlineqrcodescanner.com/tools/qr-code-scanner",
    "https://onlineqrcodescanner.com/tools/barcode-scanner"
  ]
}
```

**For `multitools.app`:**
```http
POST https://api.indexnow.org/IndexNow
Content-Type: application/json; charset=utf-8

{
  "host": "multitools.app",
  "key": "9f3b7ac6b69e4a3891d4e78a6358c5a4",
  "keyLocation": "https://multitools.app/9f3b7ac6b69e4a3891d4e78a6358c5a4.txt",
  "urlList": [
    "https://multitools.app/",
    "https://multitools.app/tools/sip-calculator"
  ]
}
```

**Expected responses:**
| Code | Meaning |
|---|---|
| 200 | URL submitted successfully |
| 400 | Invalid format — check your JSON |
| 403 | Key not valid — key file not accessible or content mismatch |
| 422 | URLs don't belong to the declared host |
| 429 | Too many requests — slow down |

> You can test this using any HTTP client: `curl`, Postman, or any script. Submit your full sitemap URLs list right after a new deployment.

### Register Your Key in Bing Webmaster Tools

1. Go to Bing Webmaster Tools → **Settings → API Access → IndexNow**
2. Enter your key: `e4f23611fb674c7d89586d4cc287a120`
3. Enter key location: `https://onlineqrcodescanner.com/e4f23611fb674c7d89586d4cc287a120.txt`
4. Save

After this, Bing Webmaster Tools will show an **IndexNow Insights** panel where you can see submission history and status.

---

## Step 6 — About "Discovered but Not Crawled" Status

If Bing Webmaster Tools shows **"Discovered but not crawled — URL cannot appear on Bing"**, this is normal for a brand-new site. It means:

- Bing knows the URL exists (from your sitemap or IndexNow submission)
- Bing has not yet crawled it — it is in the queue
- This is a queue status, not an error

**Why it takes time:**
- Brand-new domains have no authority signals yet — Bing crawls established sites first
- Bing's crawl queue is ordered by domain trust and popularity
- This is completely normal in the first 2–4 weeks after launch

**What speeds it up:**
1. Submit URLs via IndexNow (Step 5 above) — this bypasses the crawl queue
2. Submit your sitemap to Bing Webmaster Tools (Step 4)
3. Get a few backlinks from external sites — even one or two credible links significantly boost crawl priority
4. Wait — Bing will crawl eventually. The "Discovered but not crawled" status resolves on its own

**What does NOT affect it:**
- Your `robots.txt` is correct — Bingbot is allowed
- Your site content is accessible — no crawl errors
- This is a domain age and authority issue, not a technical issue with your site

> Clicking "Request indexing" in Bing Webmaster Tools queues the URL but does not guarantee instant crawling. The IndexNow API is more effective.

---

## Step 7 — Verify Everything Is Working

### GTM
1. In GTM dashboard → click **Preview** (top right)
2. Enter your site URL → Connect
3. GTM Tag Assistant opens alongside your site
4. Navigate around — you should see `GTM - js` and `All Pages` events firing
5. Click **GA4 - Configuration** tag → it should show **Fired** status

### GA4 Realtime
1. Open your site in a browser
2. Go to GA4 → **Reports → Realtime**
3. You should see 1 active user and your page under "Pages and screens"

### Search Console
1. Use **URL Inspection** tool
2. Paste your homepage URL → Inspect
3. If not indexed yet → click **Request Indexing**

### Bing Webmaster Tools
1. Go to **URL Inspection** in Bing Webmaster Tools
2. Paste a URL → check crawl status
3. If showing "Discovered but not crawled" → submit via IndexNow (see Step 5)

---

## Step 8 — AdSense (Do This Later)

> Apply for AdSense only after the site has meaningful organic traffic. Google reviews the content quality and traffic history before approving.

### How to Apply
1. Go to [adsense.google.com](https://adsense.google.com)
2. Add your site → Google gives you an AdSense publisher ID: `ca-pub-XXXXXXXXXXXXXXXX`
3. During verification, Google may ask you to add a snippet — add it temporarily to `HeadScripts.astro`, verify, then remove it

### Enabling AdSense in the Codebase

Once approved, edit `src/config.ts` for the relevant site:

```ts
ads: {
  enabled: true,                           // was false
  autoAds: true,                           // was false
  publisherId: "ca-pub-XXXXXXXXXXXXXXXX",  // your real publisher ID
  slots: {
    "home-hero-bottom": true,              // enable specific ad slots
    "tool-sidebar-top": true,
    // ... enable others as needed
  },
},
```

The `HeadScripts.astro` AdSense block already reads from `siteConfig` — it activates automatically when you flip these flags. No code changes needed.

> **Do not add a Content-Security-Policy (CSP) header** while running AdSense. AdSense dynamically loads scripts from many Google subdomains — a CSP will silently kill ad revenue.

---

## Step 9 — Custom Event Tracking (Via GTM)

### Option A — Push events from your Svelte/JS code

```js
// Anywhere in your frontend code
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'qr_scan_complete',
  tool_name: 'qr-code-scanner',
  result_type: 'url',
});
```

Then in GTM: create a **Custom Event trigger** listening for `qr_scan_complete`, and attach a **GA4 Event tag**.

### Option B — GTM Click/Form triggers (no code needed)

1. GTM → **Triggers → New** → choose trigger type (Click, Form Submit, Scroll Depth, etc.)
2. Configure the selector or condition
3. Attach a GA4 Event tag

---

## Quick Reference — IDs Per Site

| Site | GTM Container ID | GA4 Measurement ID | IndexNow Key | AdSense Publisher ID |
|---|---|---|---|---|
| `onlineqrcodescanner.com` | `GTM-NMB6MK92` | `G-XXXXXXXXXX` | `e4f23611fb674c7d89586d4cc287a120` | `ca-pub-XXXXXXXXXXXXXXXX` |
| `multitools.app` | `GTM-XXXXXXX` | `G-XXXXXXXXXX` | `9f3b7ac6b69e4a3891d4e78a6358c5a4` | `ca-pub-XXXXXXXXXXXXXXXX` |

---

## Quick Checklist for New Site

```
Accounts
[ ] Create GTM container → copy GTM-XXXXXXX
[ ] Create GA4 property → copy G-XXXXXXXXXX
[ ] Add GA4 tag inside GTM container → trigger: All Pages → Publish
[ ] Verify domain in Google Search Console (via Cloudflare DNS TXT record)
[ ] Import site into Bing Webmaster Tools (via GSC import)

Code Changes (per site)
[ ] HeadScripts.astro → paste GTM <head> snippet with correct GTM-XXXXXXX
[ ] BodyScripts.astro → paste GTM <noscript> with correct GTM-XXXXXXX

Sitemaps
[ ] Submit sitemap-index.xml to Google Search Console
[ ] Submit sitemap-index.xml to Bing Webmaster Tools

IndexNow
[ ] Confirm key file is accessible at https://yourdomain.com/<key>.txt
[ ] Register key in Bing Webmaster Tools → Settings → API Access → IndexNow
[ ] Submit all URLs via IndexNow API after first deploy

Verify
[ ] GTM Preview mode → confirm GA4 tag fires on All Pages
[ ] GA4 Realtime → confirm active user appears
[ ] Bing Webmaster → URL Inspection → submit key URLs via IndexNow

Later (when ready)
[ ] Apply for AdSense → get ca-pub-XXXXXXXXXXXXXXXX
[ ] Update src/config.ts → set ads.enabled = true, ads.publisherId = your ID
[ ] Enable specific ad slots in config
```
