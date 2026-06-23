# Cloudflare Setup Guide
> Reusable checklist for every new Cloudflare Pages site in this monorepo.
> Tested on: `onlineqrcodescanner.com` + `multitools.app`

---

## 1. DNS Records

### Minimum required records

| Type | Name | Value | Proxy | Notes |
|---|---|---|---|---|
| CNAME | `@` (root) | `your-project.pages.dev` | ✅ Proxied | Main domain → Cloudflare Pages |
| CNAME | `www` | `your-project.pages.dev` | ✅ Proxied | www → Cloudflare Pages (then `_redirects` handles www→root) |
| TXT | `@` | `google-site-verification=XXXX` | DNS only | Google Search Console verification |

### CAA Records (SSL certificate authority)

> Must explicitly list every CA that Cloudflare may use. Missing one causes cert renewal failures.

| Type | Name | Value | Proxy |
|---|---|---|---|
| CAA | `@` | `0 issue "digicert.com"` | DNS only |
| CAA | `@` | `0 issue "pki.goog"` | DNS only |
| CAA | `@` | `0 issue "letsencrypt.org"` | DNS only |

> `sectigo.com` — Cloudflare does not use Sectigo. Do not add.

### CNAME Flattening
- Set to: **Root domain only** ✅

---

## 2. SSL / TLS

| Setting | Value | Why |
|---|---|---|
| **Encryption Mode** | **Full (Strict)** | Cloudflare Pages has a valid cert on `pages.dev`, so Strict works. "Flexible" is insecure (plain HTTP to origin). "Full" (without Strict) doesn't verify the cert. |
| **Always Use HTTPS** | **ON** | Redirects HTTP → HTTPS at the edge |
| **Automatic HTTPS Rewrites** | **ON** | Fixes mixed-content warnings from hardcoded `http://` links |
| **Minimum TLS Version** | **TLS 1.2** | Drops support for old insecure TLS 1.0/1.1 |
| **TLS 1.3** | **ON** (default) | Faster handshakes |

### HSTS Settings

| Setting | Value | Notes |
|---|---|---|
| **Status** | ON | |
| **Max-Age** | **12 months** | Must match `Strict-Transport-Security` header in `_headers` file |
| **Include Subdomains** | ON | |
| **Preload** | OFF (initially) | Only enable after site is stable. Requires submitting to [hstspreload.org](https://hstspreload.org). Once enabled, it is very hard to undo. |

---

## 3. Security

| Setting | Value | Why |
|---|---|---|
| **Bot Fight Mode** | **ON** | Blocks generic scraper bots |
| **Block AI Bots** | **OFF** ❌ | This blocks ALL AI crawlers (GPTBot, ClaudeBot, etc.) at the Cloudflare edge — before they ever read your `robots.txt`. Turn this OFF and control AI bot access via `robots.txt` instead. |
| **Browser Integrity Check** | **ON** | Challenges suspicious browsers |
| **Challenge Passage** | **30 minutes** | Default, fine |
| **Security Level** | Medium (default) | Leave default |

> **Why Block AI Bots must be OFF:** Your `robots.txt` already explicitly allows GPTBot, ClaudeBot, PerplexityBot, etc. and your `llms.txt` is built for AI indexing. Cloudflare's "Block AI Bots" is a CDN-level firewall that runs before your files are ever served — it makes your entire AI traffic strategy useless.

---

## 4. Speed / Optimization

| Setting | Value | Notes |
|---|---|---|
| **Brotli** | ON | Better compression than gzip. Enable if available in your plan. |
| **Early Hints** | **ON** | Sends `103 Early Hints` for preloading — faster perceived page load |
| **Speed Brain** | **ON** | Cloudflare's speculative prefetch for navigation |
| **Rocket Loader** | **OFF** ❌ | Breaks Astro hydration and many modern JS frameworks. Always disable. |
| **Auto Minify** | OFF | Astro already minifies at build time. Double minification can corrupt code. |
| **Cloudflare Fonts** | **ON** | Proxies Google Fonts through Cloudflare for better privacy + speed |

---

## 5. Caching

### General Settings

| Setting | Value |
|---|---|
| **Caching Level** | Standard |
| **Browser Cache TTL** | 1 day (overridden by cache rules below for static assets) |

### Cache Rules — Add These Two Rules

> Go to: **Caching → Cache Rules → Create Rule**

---

#### Rule 1 — Hashed Astro Assets (JS, CSS, fonts)

Astro outputs all built JS, CSS, and font files into `/_astro/` with content hashes in the filenames (e.g., `chunk.a3f8b2.js`). These are safe to cache forever — when content changes, the filename changes.

```
Rule name:    Cache _astro assets

If:           Custom filter expression
Field:        URI Full
Operator:     wildcard
Value:        https://yourdomain.com/_astro/*

Expression:   (http.request.full_uri wildcard r"https://yourdomain.com/_astro/*")

Then:
  Cache eligibility:  Eligible for cache
  Edge TTL:           Ignore cache-control header and use this TTL → 1 month
  Browser TTL:        Override origin and use this TTL → 7 days
  Respect strong ETags: Use strong ETag headers (ON)
  Place at:           First
  (everything else: leave blank / default)
```

> Replace `yourdomain.com` with your actual domain. Set one rule per site.

---

#### Rule 2 — Images and Static Files

```
Rule name:    Cache images

If:           Custom filter expression
Field:        URI Full
Operator:     wildcard
Value:        https://yourdomain.com/images/*

Expression:   (http.request.full_uri wildcard r"https://yourdomain.com/images/*")

Then:
  Cache eligibility:  Eligible for cache
  Edge TTL:           Ignore cache-control header and use this TTL → 1 week
  Browser TTL:        Override origin and use this TTL → 1 day
  Respect strong ETags: Use strong ETag headers (ON)
  Place at:           Second
  (everything else: leave blank / default)
```

> If you have fonts or other static files outside `/_astro/`, create additional rules following the same pattern.

---

#### Rule 3 — Optional: Bypass Cache for API Routes

If your site has API endpoints under `/api/`:

```
Rule name:    Bypass cache for API routes

If:           Custom filter expression
Field:        URI Full
Operator:     wildcard
Value:        https://yourdomain.com/api/*

Then:
  Cache eligibility:  Bypass cache
```

---

## 6. Network

All settings are fine at default. Confirm these are ON:

| Setting | Value |
|---|---|
| HTTP/2 | ON |
| HTTP/3 (QUIC) | ON |
| 0-RTT Connection Resumption | ON |
| IPv6 Compatibility | ON |
| WebSockets | ON (if site uses them) |

---

## 7. `_headers` File (in `public/`)

Place this in `public/_headers` in your Astro project. Cloudflare Pages serves this on every response.

> ⚠️ Do NOT add `#` comments inside rule blocks — Cloudflare Pages may misparse them as header values.

### For sites WITHOUT camera access (e.g. finance tools, most sites)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Cross-Origin-Opener-Policy: same-origin-allow-popups
```

### For sites WITH camera access (e.g. QR scanner)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(self), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Cross-Origin-Opener-Policy: same-origin-allow-popups
```

> `camera=(self)` allows the page itself to access camera. `camera=()` blocks it entirely.

### For sites with Google AdSense

Do **NOT** add a `Content-Security-Policy` header if you use AdSense. AdSense dynamically loads scripts from many Google domains — a CSP will silently break your ads.

---

## 8. `_redirects` File (in `public/`)

Place this in `public/_redirects`. Handles www → root canonical redirect.

```
https://www.yourdomain.com/* https://yourdomain.com/:splat 301!
```

> The `!` (exclamation mark) makes it a forced redirect that overrides all other rules. Required when Cloudflare also handles the www CNAME.

---

## 9. AI Traffic (GEO — Generative Engine Optimization)

To get traffic from ChatGPT, Perplexity, Claude, etc.:

| File | Purpose |
|---|---|
| `public/robots.txt` | Allow specific AI crawlers by name |
| `public/llms.txt` | Tell AI what your site is about |

### robots.txt — AI crawlers section

```
# Allow AI indexing
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: cohere-ai
Allow: /
```

> This only works if **Block AI Bots is OFF** in Cloudflare Security settings.

---

## 10. Google Analytics / GTM / AdSense Compatibility

These headers are compatible with GA, GTM, and AdSense. No changes needed when adding those services.

| Header | GA4 | GTM | AdSense |
|---|---|---|---|
| `X-Frame-Options: DENY` | ✅ | ✅ | ✅ |
| `X-Content-Type-Options: nosniff` | ✅ | ✅ | ✅ |
| `Referrer-Policy: strict-origin-when-cross-origin` | ✅ | ✅ | ✅ |
| `Permissions-Policy` (camera/mic/geo only) | ✅ | ✅ | ✅ |
| `HSTS` | ✅ | ✅ | ✅ |
| `Cross-Origin-Opener-Policy: same-origin-allow-popups` | ✅ | ✅ | ✅ (popups allowed) |

---

## Quick Checklist for New Site

```
DNS
[ ] CNAME @ → yourproject.pages.dev (Proxied)
[ ] CNAME www → yourproject.pages.dev (Proxied)
[ ] TXT Google Search Console verification
[ ] CAA digicert.com
[ ] CAA pki.goog
[ ] CAA letsencrypt.org
[ ] CNAME Flattening: Root domain only

SSL/TLS
[ ] Encryption Mode: Full (Strict)
[ ] Always Use HTTPS: ON
[ ] Automatic HTTPS Rewrites: ON
[ ] Minimum TLS Version: 1.2
[ ] HSTS: ON, 12 months, includeSubDomains ON, Preload OFF

Security
[ ] Bot Fight Mode: ON
[ ] Block AI Bots: OFF ← critical
[ ] Browser Integrity Check: ON

Speed
[ ] Early Hints: ON
[ ] Speed Brain: ON
[ ] Rocket Loader: OFF ← critical for Astro
[ ] Cloudflare Fonts: ON

Caching
[ ] Cache Rule 1: /_astro/* → Edge 1 month, Browser 1 week
[ ] Cache Rule 2: /images/* → Edge 1 week, Browser 1 day
[ ] Cache Rule 3: /api/* → Bypass cache (if applicable)

Files in public/
[ ] _headers (security headers)
[ ] _redirects (www → root)
[ ] robots.txt (with AI bot allowlist)
[ ] llms.txt
[ ] sitemap.xml / sitemap-index.xml
```
