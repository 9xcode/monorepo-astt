# Complete Guide to Open Graph (OG) Images

Open Graph (`og:image`) images are the preview images displayed when a link to your website is shared on social media platforms, messaging apps, and other services (e.g., Facebook, Twitter, LinkedIn, Slack, WhatsApp, iMessage). 

This guide covers everything you need to know to ensure your OG images are fully optimized and display correctly everywhere.

---

## 1. The Purpose of an OG Image

The primary goal of an OG image is to act as a visual billboard for your link. A correctly implemented OG image will:
* **Grab Attention:** Stand out in crowded social media feeds or chat threads.
* **Provide Context:** Quickly convey what the page or article is about (often by including the title or core value proposition within the image itself).
* **Maintain Legibility:** Remain clear and readable whether displayed as a massive card on a desktop monitor or a tiny thumbnail on a mobile device.

---

## 2. Best Formats: PNG vs. JPEG vs. WebP

Always use **PNG** or **JPEG**. 

* **PNG (Recommended for Graphics):** Use PNG if your image contains text, UI elements, illustrations, or logos. It uses lossless compression, preventing the "blocky" artifacts that make text blurry in JPEGs.
* **JPEG (Recommended for Photos):** Use JPEG if your OG image is predominantly a photograph. It keeps file sizes significantly lower without noticeably reducing photographic quality.
* **Avoid WebP (For Now):** Although WebP is widely supported in web browsers, some older messaging apps, niche platforms, and specific social media crawlers still fail to process WebP images for link previews. To guarantee 100% compatibility, stick to PNG or JPEG.

---

## 3. Dimensions and Aspect Ratio

The universally accepted standard aspect ratio for landscape Open Graph images is **`1.91:1`**.

### Recommended Size
* **1200 x 630 pixels**
* This is the optimal resolution. It perfectly matches the 1.91:1 aspect ratio and is large enough to display crisply on high-density (Retina) screens.

### Minimum Size
* **600 x 315 pixels**
* This is the absolute minimum required by platforms like Facebook to display your preview as a "large image card." Anything smaller will result in a small square thumbnail placed next to the text.

---

## 4. File Size Limits

* **Optimal Weight:** Keep the file size under **1 MB** (ideally between 200 KB and 500 KB).
* **Hard Limits:** Platforms like LinkedIn and Facebook will completely fail to load the image if it exceeds 5 MB or 8 MB. 
* **Why it matters:** Social media crawlers have short timeout windows. A lighter image ensures the crawler can download and cache it quickly before giving up.

---

## 5. Design Safe Zones

Different platforms sometimes crop the edges of the `1200 x 630` image slightly, depending on the device (mobile vs. desktop) or the UI layout. 

* **Center your content:** Place the most critical elements (text, logos, main subjects) in the absolute center of the image.
* **Keep away from the edges:** Avoid putting text within 50-100 pixels of the left, right, top, or bottom edges.

---

## 6. Implementation (HTML Tags)

To implement the OG image, you need to include standard `meta` tags in the `<head>` section of your HTML document. 

```html
<!-- Primary Open Graph tags (Facebook, LinkedIn, Slack, etc.) -->
<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="A brief description of your page." />
<meta property="og:image" content="https://www.yourdomain.com/path/to/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />

<!-- Twitter Card tags (Twitter uses its own system, but falls back to OG) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Your Page Title" />
<meta name="twitter:description" content="A brief description of your page." />
<meta name="twitter:image" content="https://www.yourdomain.com/path/to/og-image.png" />
```

**Important Note:** Always use **absolute URLs** (e.g., `https://...`) for the `og:image` content attribute. Relative paths (e.g., `/images/og-image.png`) will fail on most platforms.

---

## 7. Testing and Validation Tools

Always test your URLs after deploying changes. These tools will force the platforms to scrape your page, update their cache, and show you exactly what the preview will look like:

1. **Facebook Sharing Debugger:** [https://developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
   * Essential for clearing Facebook's cache and seeing what Facebook/Messenger/Instagram sees.
2. **LinkedIn Post Inspector:** [https://www.linkedin.com/post-inspector/](https://www.linkedin.com/post-inspector/)
   * Very strict crawler; great for ensuring your image meets professional standards.
3. **Twitter Card Validator:** [https://cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)
   * Ensures your large image card works on Twitter.
