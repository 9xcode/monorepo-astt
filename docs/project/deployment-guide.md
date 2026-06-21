# Deployment Guide — onlineqrcodescanner.com

> **Scope:** Everything from running a local production build to going live, monitoring, and preparing for AdSense monetization.

---

## Part 0 — Pre-Launch Checklist

Before you touch a server, fix these things. They are real gaps found during the site audit.

### ✅ Already Done (Confirmed Good)
- `robots.txt` — correct, AI bots explicitly allowed, SEO scrapers blocked
- `sitemap-index.xml` + `sitemap-0.xml` — all 12 tools, categories, and legal pages included
- `llms.txt` + `llms-full.txt` — present and well-structured
- All 12 tool pages — present with full content
- Legal pages — About, Privacy, Terms, Disclaimer, DMCA, Contact all built
- OG images — auto-generated for every tool page (`/images/og/tools/*.png`)
- 404 and 500 error pages — present in build
- Sitemap has `lastmod` dates for all tool pages

### ⚠️ Items to Fix Before Going Live

| # | Issue | Where | Fix |
|---|-------|--------|-----|
| 1 | **Ads disabled** | `src/config.ts` L269 | After AdSense approval, set `enabled: true`, fill real `publisherId` |
| 2 | **Blog disabled** | `src/config.ts` L293 | Fine for now, enable when you add blog posts |
| 3 | **Typos in content** | `qr-code-scanner/index.md` L17 | `"clik"` → `"click"`, `"it will shows"` → `"it shows"` |
| 4 | **Contact email is Gmail** | `src/config.ts` L77 | Use `contact@onlineqrcodescanner.com` for AdSense credibility. Set up email forwarding via Cloudflare Email Routing (free) |
| 5 | **`.env` has real API key** | `.env` | Never commit this to git. Add `.env` to `.gitignore` if not already there. Set `PUBLIC_WEB3FORMS_ACCESS_KEY` as a secret in your CI/CD pipeline |
| 6 | **`9f3b7ac6b69e4a3891d4e78a6358c5a4.txt`** | `/public/` | This appears to be a domain verification file (Google Search Console or similar). Keep it — it is correct |
| 7 | **Verification file mismatch** | `dist/` has same file | Good — it copies to dist correctly |
| 8 | **`getApp` feature disabled** | `src/config.ts` L299 | Fine for now (no app). Set `enabled: false` keeps the page hidden |
| 9 | **Favicon** | `/public/favicon.ico` + `favicon.svg` | Both present. Verify they render correctly in browser tab before launch |

### Quick Content Fix (Do This Now)

In [qr-code-scanner/index.md](file:///media/kumar/code/monorepo-astt/sites/onlineqrcodescanner-com/src/content/tools/qr-code-scanner/index.md) line 17:

```diff
- you just have to clik on "raw data" section and it will shows it.
+ you just have to click on "raw data" section and it shows it.
```

Also line 103:
```diff
- This is also one of the reason that our qr code scanner tool is fastest and secure qr scanner on the internet.
+ This is also one of the reasons our QR code scanner is among the fastest and most secure on the internet.
```

---

## Part 1 — Deployment Option Analysis

You have two options. Here is an honest comparison for a **commercial, AdSense-monetized, static Astro site**.

### Option A — Cloudflare Pages (Free Hosting)

Cloudflare Pages hosts your static `dist/` output directly on Cloudflare's global edge network. You push to GitHub → Cloudflare builds and deploys automatically. No server to manage.

**Free Plan Limits (as of 2025/2026):**
- Bandwidth: Unlimited for HTML/CSS/JS/images ✅
- Files per project: 20,000 max (you have ~100 files — no issue) ✅
- Builds: 500/month (you will use 1–5 per month) ✅
- Custom domains: 100 per project ✅
- Commercial use: Explicitly allowed ✅

**Pros:**
- Zero cost, zero maintenance
- Global CDN built-in (Cloudflare's edge, 200+ locations)
- Automatic HTTPS
- Git-push deploys
- DDoS protection out of the box
- Works for AdSense (with custom domain)

**Cons:**
- Build environment is limited (must configure pnpm + turborepo correctly)
- 500 builds/month cap (you will not hit this)
- No SSH access if something goes wrong

### Option B — VPS (Netcup) + Cloudflare Proxy

You build locally or on GitHub Actions, then `rsync` the `dist/` output to your VPS. Nginx serves the files. Cloudflare is added in front as a proxy/CDN, so your VPS IP is hidden and you get Cloudflare's edge caching globally.

**Pros:**
- Full control over server config, headers, caching rules
- Can host multiple sites on one server
- No build time limits
- Easier to debug if something breaks
- Can add server-side features later (analytics backend, redirects at OS level)

**Cons:**
- Monthly VPS cost (even a small one, ~€3–5/month for basic Netcup)
- You manage OS updates, security patches, firewall, nginx config
- More setup upfront (SSH keys, nginx, SSL certs, CI/CD)

---

## ✅ My Recommendation: **Option A — Cloudflare Pages** (for now)

**Reasoning:**
1. Your site is 100% static — there is no backend, no database, no server-side rendering. Cloudflare Pages is purpose-built for this.
2. You already have Cloudflare. Using Cloudflare Pages means your origin IS the CDN edge — zero latency, no proxy hop.
3. For AdSense: you only need a custom domain (you have `onlineqrcodescanner.com`) — the free tier is fully compatible.
4. The VPS is better utilized for a site that actually needs a server. Right now it would just sit there serving static files — exactly what Cloudflare Pages does for free, faster.
5. You can always migrate to VPS later if you outgrow Pages. The reverse (moving off VPS) is more work.

**Switch to VPS when:**
- You need server-side APIs that Cloudflare Workers cannot handle
- You want to add SSR (server-side rendering) to Astro
- You want to self-host analytics (Plausible, Umami)
- You have multiple sites and want to consolidate billing

The guide below covers **both paths completely**. Start with Path A. If you ever need to switch, Path B is documented below.

---

## Part 2 — Path A: Cloudflare Pages Deployment

### Prerequisites
- GitHub account with the monorepo pushed
- Cloudflare account (you already have one)
- Domain `onlineqrcodescanner.com` in Cloudflare DNS
- Node.js ≥22 installed locally

---

### Step 1 — Verify Your Local Build Works

Before deploying anywhere, confirm the build is clean on your machine.

**Commands to run (do NOT run — just verify output is correct):**
```bash
# From monorepo root
pnpm install

# Build only the QR site
pnpm build:qrcode

# Preview locally
pnpm preview:qrcode
```

Then open `http://localhost:4321` and test:
- [ ] Homepage loads
- [ ] `/tools/qr-code-scanner` loads with correct content
- [ ] `/tools/wifi-qr-code-generator` loads
- [ ] `/sitemap-index.xml` is accessible
- [ ] `/robots.txt` is accessible
- [ ] `/llms.txt` is accessible
- [ ] 404 page loads when you visit `/nonexistent-page`
- [ ] Camera scanner works (requires HTTPS on production — will work on Cloudflare)

The build output is at:
```
sites/onlineqrcodescanner-com/dist/
```

---

### Step 2 — Set Up GitHub Repository

Your monorepo must be on GitHub (private or public — both work with Cloudflare Pages).

1. Make sure `.env` is in `.gitignore`. Open `.gitignore` at the repo root and verify this line exists:
   ```
   .env
   .env.local
   .env.*.local
   ```
   If it is missing, add it. **Never commit the real API key.**

2. Push your latest code to the `main` branch:
   ```bash
   git add .
   git commit -m "chore: pre-deployment cleanup"
   git push origin main
   ```

---

### Step 3 — Create Cloudflare Pages Project

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

2. Authorize Cloudflare to access your GitHub account and select your monorepo repository.

3. In the build configuration screen, fill in:

| Field | Value |
|-------|-------|
| **Project name** | `onlineqrcodescanner-com` |
| **Production branch** | `main` |
| **Root directory** | *(leave blank / root)* |
| **Build command** | `pnpm install --frozen-lockfile && pnpm turbo build --filter=@mtools/onlineqrcodescanner-com` |
| **Build output directory** | `sites/onlineqrcodescanner-com/dist` |
| **Node.js version** | `22` |

> **Why root directory must be blank:** pnpm workspaces require `pnpm install` to run from the workspace root (where `pnpm-workspace.yaml` lives). If you set Root directory to `sites/onlineqrcodescanner-com`, pnpm runs from that subdirectory and cannot resolve workspace packages — the build will fail. Leaving it blank runs everything from the repo root, which is correct. The full path to `dist` is specified in Build output directory instead.

4. **Environment Variables** — Click "Add variable" and add:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `PUBLIC_WEB3FORMS_ACCESS_KEY` | `be8bebbb-1b14-4637-9737-ede775bcdb38` | Production |
| `NODE_VERSION` | `22` | Production |

> ⚠️ The Web3Forms key is technically already public (it is a `PUBLIC_` prefixed env var that ends up in browser JS), but keeping it as an env var in CI is still the correct practice — it avoids hardcoding it.

> **Note on `PNPM_VERSION`:** You do not need to set `PNPM_VERSION` as an env var. Cloudflare Pages does not read that variable. It reads the `packageManager` field in your root `package.json` (`pnpm@10.33.2+sha512...`) to determine the pnpm version automatically.

5. Click **Save and Deploy**. Cloudflare will now:
   - Clone your repo
   - Run the build command
   - Deploy the `dist/` folder to the global edge

The first build takes 2–5 minutes. Subsequent builds are faster due to caching.

---

### Step 4 — Connect Your Custom Domain

After the first successful deploy:

1. In your Pages project → **Custom domains** → **Set up a custom domain**
2. Enter `onlineqrcodescanner.com`
3. Since your domain is already in Cloudflare DNS, it will automatically add the correct CNAME record
4. Also add `www.onlineqrcodescanner.com` and set it to redirect to the root domain (Cloudflare Pages handles this with a redirect rule)

**DNS Records that Cloudflare adds automatically:**
```
CNAME  onlineqrcodescanner.com   →  onlineqrcodescanner-com.pages.dev  (proxied ✅)
CNAME  www                        →  onlineqrcodescanner.com             (proxied ✅)
```

SSL is automatic — Cloudflare provisions a TLS certificate within minutes.

---

### Step 5 — Configure Redirects and Cache

#### www → non-www redirect

The cleanest way to handle the www redirect with Cloudflare Pages is a `_redirects` file in your build output. Create `/public/_redirects` in the QR site:

```
https://www.onlineqrcodescanner.com/* https://onlineqrcodescanner.com/:splat 301
```

This file gets copied into `dist/` on every build and Cloudflare Pages processes it natively — no dashboard configuration needed.

> **Why not Cloudflare Page Rules?** Page Rules are a legacy feature that Cloudflare is phasing out in favor of **Rules → Redirect Rules**. They also have a limit of 3 on the free tier. For a single redirect, the `_redirects` file approach is simpler and does not consume a Page Rule slot.

#### Cache static assets aggressively

In Cloudflare dashboard → **Rules** → **Cache Rules** → **Create rule**:

```
Field: URI Path
Operator: starts with
Value: /_astro/
→ Then: Cache Everything, Edge TTL: 1 month
```

> `_astro/` is where Astro puts all hashed JS/CSS bundles. Since filenames are content-hashed, it is safe to cache them indefinitely.

---

### Step 6 — Cloudflare Security & Performance Settings

In your Cloudflare dashboard for the domain:

**SSL/TLS → Overview:**
- Set encryption mode to **Full (Strict)**

> **Note:** For Cloudflare Pages, the SSL mode setting is largely irrelevant — Pages IS the origin, so there is no origin TLS connection to validate. This setting matters significantly in Path B (VPS), where Cloudflare proxies traffic to your actual server. Setting it to Full (Strict) there is important to prevent downgrade attacks.

**Speed → Optimization:**
- Auto Minify: Disable (Astro already minifies HTML — double minification can break things)
- Brotli: ✅ Enable
- Early Hints: ✅ Enable

**Security → Settings:**
- Security Level: **Medium**
- Bot Fight Mode: ✅ Enable (free tier)

**Caching → Configuration:**
- Caching Level: **Standard**
- Browser Cache TTL: **4 hours** (reasonable for a tool site that updates occasionally)

**Network:**
- HTTP/2: ✅ (on by default)
- HTTP/3 (with QUIC): ✅ Enable

---

### Step 7 — Set Up Automatic Deployments via GitHub Actions (Optional but Recommended)

The Cloudflare Pages Git integration already auto-deploys on every push to `main`. However, using GitHub Actions gives you more control — path filters mean the deploy only runs when relevant files change, not on every single push.

**Workflow files** (both live in `.github/workflows-disabled/` — move to `.github/workflows/` to activate):

- **`ci.yml`** — Shared quality gate. Runs on every push: install, lint, type-check, build affected packages. Applies to the whole monorepo.
- **`deploy-qrcode.yml`** — QR site deploy only. Triggers only when QR site or core files change. Builds and pushes to Cloudflare Pages.

Both files are already written and ready. Here is what `deploy-qrcode.yml` does:

```yaml
name: Deploy — onlineqrcodescanner.com

on:
  push:
    branches: [main]
    paths:
      - 'sites/onlineqrcodescanner-com/**'
      - 'core/**'
      - 'pnpm-lock.yaml'
      - 'pnpm-workspace.yaml'
      - 'turbo.json'
  workflow_dispatch:   # allows manual re-deploy from GitHub UI

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: "10.33.2"

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      - name: Build QR site
        run: pnpm turbo build --filter=@mtools/onlineqrcodescanner-com
        env:
          PUBLIC_WEB3FORMS_ACCESS_KEY: ${{ secrets.PUBLIC_WEB3FORMS_ACCESS_KEY }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3   # pages-action@v1 is deprecated
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy sites/onlineqrcodescanner-com/dist --project-name=onlineqrcodescanner-com --commit-dirty=true
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**GitHub Secrets to add** (Settings → Secrets → Actions):
- `CLOUDFLARE_API_TOKEN` — Go to dash.cloudflare.com → Click your profile icon (top right) → My Profile → API Tokens → Create Token → click "Create Custom Token" → Set name (e.g. `github-pages-deploy`) → Permissions: Account → Cloudflare Pages → Edit → Account Resources: Include → All accounts → click "Continue to summary" → click "Create Token" → copy it immediately (shown only once)

- `CLOUDFLARE_ACCOUNT_ID` — Go to dash.cloudflare.com → Click any domain on the home page → Scroll down the right sidebar — you'll see "Account ID" as a long hex string → Copy it
- `PUBLIC_WEB3FORMS_ACCESS_KEY` — your Web3Forms key (can be copied from the local `.env` file)

**To activate both workflows:**
```bash
mv .github/workflows-disabled/ci.yml .github/workflows/ci.yml
mv .github/workflows-disabled/deploy-qrcode.yml .github/workflows/deploy-qrcode.yml
git add .github/workflows/
git commit -m "ci: activate CI and qrcode deploy workflows"
git push origin main
```

> With the paths filter, if you only change a file in `mobile/` or `finance-tools/`, the QR deploy is skipped entirely. The CI job still runs (it is intentionally monorepo-wide).

---

### Step 8 — Verify the Live Site

After deployment, do a final verification:

```
✅ https://onlineqrcodescanner.com           → homepage loads
✅ https://onlineqrcodescanner.com/tools/qr-code-scanner
✅ https://onlineqrcodescanner.com/sitemap-index.xml
✅ https://onlineqrcodescanner.com/robots.txt
✅ https://onlineqrcodescanner.com/llms.txt
✅ https://www.onlineqrcodescanner.com       → redirects to https://onlineqrcodescanner.com
✅ https://onlineqrcodescanner.com/nonexistent → shows 404 page
✅ Camera scan works (HTTPS is now active)
✅ Image upload works
✅ QR code generation works
```

---

## Part 3 — Path B: VPS (Netcup) + Cloudflare Proxy Deployment

Use this if you decide the VPS option is better for your situation.

**Architecture:**
```
User → Cloudflare Edge (proxy, CDN, DDoS protection)
         ↓
       Netcup VPS (Nginx serving static files from /dist)
```

### Step 1 — Provision Your VPS

Log into your Netcup control panel and:
1. Create a new VPS (minimum specs for a static site: 1 vCPU, 1GB RAM, 20GB SSD — the cheapest tier is fine)
2. Choose **Ubuntu 24.04 LTS** as the OS
3. Note the VPS IP address — you will need it

---

### Step 2 — Initial Server Setup (Security First)

SSH into your VPS as root:
```bash
ssh root@YOUR_VPS_IP
```

**Create a non-root user:**
```bash
adduser deploy
usermod -aG sudo deploy
```

**Set up SSH key login for the deploy user:**
```bash
# On your LOCAL machine — generate a deploy key
ssh-keygen -t ed25519 -C "deploy-key-onlineqrcodescanner" -f ~/.ssh/deploy_key

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/deploy_key.pub deploy@YOUR_VPS_IP
```

**Configure the firewall (UFW):**
```bash
ufw allow ssh
ufw allow 'Nginx Full'    # ports 80 and 443
ufw enable
ufw status
```

**Disable root SSH login** (security hardening):
```bash
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no
systemctl restart ssh
```

> ⚠️ Do not close your current SSH session before verifying the `deploy` user can SSH in with the key.

---

### Step 3 — Install Nginx

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

### Step 4 — Create Web Root and Nginx Config

```bash
# Create the directory for your site
sudo mkdir -p /var/www/onlineqrcodescanner.com
sudo chown -R deploy:www-data /var/www/onlineqrcodescanner.com
sudo chmod -R 755 /var/www/onlineqrcodescanner.com
```

Create Nginx server block:
```bash
sudo nano /etc/nginx/sites-available/onlineqrcodescanner.com
```

Paste this configuration:
```nginx
# ── www redirect — separate server block (correct nginx pattern)
# Do NOT use `if ($host = www...)` inside the main server block.
# The nginx docs explicitly warn against this pattern ("if is evil").
# A dedicated server block for www is the correct, unambiguous approach.
server {
    listen 80;
    listen [::]:80;
    server_name www.onlineqrcodescanner.com;
    return 301 https://onlineqrcodescanner.com$request_uri;
}

server {
    listen 80;
    listen [::]:80;
    server_name onlineqrcodescanner.com;

    root /var/www/onlineqrcodescanner.com;
    index index.html;

    # Astro static site — try file, then directory, then 404 page
    location / {
        try_files $uri $uri/ $uri.html /404.html;
    }

    # Astro's hashed assets — cache aggressively (content-hashed filenames)
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Static files — moderate cache
    location ~* \.(ico|svg|png|jpg|webp|woff2|woff)$ {
        expires 30d;
        add_header Cache-Control "public";
    }

    # robots.txt, sitemap — no cache (needs to stay fresh)
    location ~* \.(txt|xml)$ {
        expires 1d;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/html text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # Cloudflare real IP restoration
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2a06:98c0::/29;
    set_real_ip_from 2c0f:f248::/32;
    real_ip_header CF-Connecting-IP;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/onlineqrcodescanner.com /etc/nginx/sites-enabled/
sudo nginx -t    # Should say "syntax is ok" and "test is successful"
sudo systemctl reload nginx
```

---

### Step 5 — Set Up SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d onlineqrcodescanner.com -d www.onlineqrcodescanner.com \
  --non-interactive --agree-tos -m your-email@gmail.com
```

Certbot will:
- Generate an SSL certificate
- Modify your Nginx config to add HTTPS (port 443)
- Set up automatic renewal

Verify auto-renewal:
```bash
sudo certbot renew --dry-run
```

> **Important:** After adding Cloudflare proxy (next step), set SSL mode to **Full (Strict)** in Cloudflare. This means Cloudflare validates the certificate on your VPS.

---

### Step 6 — Point Domain to VPS via Cloudflare

In Cloudflare DNS for `onlineqrcodescanner.com`:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `YOUR_VPS_IP` | ✅ Proxied (orange cloud) |
| CNAME | `www` | `onlineqrcodescanner.com` | ✅ Proxied |

> With the orange cloud enabled, Cloudflare proxies all traffic. Your real VPS IP is hidden from the public internet. DDoS attacks hit Cloudflare, not your server.

Set SSL mode in Cloudflare → SSL/TLS → **Full (Strict)**

---

### Step 7 — Set Up GitHub Actions for Automated Deployment

This workflow builds the site on every push to `main` and `rsync`s the `dist/` to your VPS.

Create `.github/workflows/deploy-qrcode-vps.yml`:

```yaml
name: Deploy — onlineqrcodescanner.com (VPS)

on:
  push:
    branches:
      - main
    paths:
      - 'sites/onlineqrcodescanner-com/**'
      - 'core/**'
      - 'pnpm-lock.yaml'

jobs:
  build-and-deploy:
    name: Build & Deploy to VPS
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.33.2

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build QR site
        run: pnpm turbo build --filter=@mtools/onlineqrcodescanner-com
        env:
          PUBLIC_WEB3FORMS_ACCESS_KEY: ${{ secrets.PUBLIC_WEB3FORMS_ACCESS_KEY }}

      - name: Deploy to VPS via rsync
        uses: burnett01/rsync-deployments@7.0.1
        with:
          switches: -avz --delete --checksum
          path: sites/onlineqrcodescanner-com/dist/
          remote_path: /var/www/onlineqrcodescanner.com/
          remote_host: ${{ secrets.VPS_HOST }}
          remote_user: deploy
          remote_key: ${{ secrets.VPS_SSH_KEY }}
          # --delete removes files on the server that no longer exist in dist/
          # --checksum skips files where size+timestamp match (faster than re-hashing)

      - name: Reload Nginx
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: deploy
          key: ${{ secrets.VPS_SSH_KEY }}
          script: sudo systemctl reload nginx
```

**GitHub Secrets to add:**
- `VPS_HOST` — your VPS IP address
- `VPS_SSH_KEY` — contents of your `~/.ssh/deploy_key` (private key, generated in Step 2)
- `PUBLIC_WEB3FORMS_ACCESS_KEY` — your Web3Forms key

**Allow deploy user to reload nginx without password:**
```bash
# On the VPS, as root:
echo "deploy ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx" >> /etc/sudoers.d/deploy-nginx
```

---

### Step 8 — First Manual Deploy

For the very first deploy (before CI is set up), build locally and rsync manually:

**Commands to run locally:**
```bash
# Build
pnpm build:qrcode

# Upload to VPS
rsync -avz --delete \
  sites/onlineqrcodescanner-com/dist/ \
  deploy@YOUR_VPS_IP:/var/www/onlineqrcodescanner.com/
```

---

### Step 9 — Set Up Monitoring on VPS

Install a basic process monitor (in case nginx crashes):
```bash
sudo apt install monit -y
```

Set up simple uptime monitoring with UptimeRobot (free, external service):
1. Go to [uptimerobot.com](https://uptimerobot.com) → Add Monitor
2. Monitor type: HTTP(s)
3. URL: `https://onlineqrcodescanner.com`
4. Monitoring interval: 5 minutes
5. Alert contacts: your email

---

## Part 4 — Post-Launch Tasks

These are required after the site goes live, regardless of which deployment path you chose.

### 4.1 — Submit to Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click **Add Property** → **Domain** (not URL prefix — domain captures all subdomains)
3. Enter `onlineqrcodescanner.com`
4. Verify ownership. Since your domain is on Cloudflare, the easiest method is **DNS TXT record**:
   - Copy the TXT record value Google gives you
   - In Cloudflare DNS, add: `TXT @ google-site-verification=XXXXXXXXXX`
   - Click Verify in Google Search Console
5. Submit your sitemap:
   - In Search Console → Sitemaps → Add sitemap
   - Enter: `https://onlineqrcodescanner.com/sitemap-index.xml`

> Your verification file `9f3b7ac6b69e4a3891d4e78a6358c5a4.txt` is already in `/public/` and gets deployed to the root. If you used file verification previously, this covers it.

### 4.2 — Submit to Bing Webmaster Tools

1. Go to [bing.com/webmasters](https://bing.com/webmasters)
2. Add your site and verify via XML file or DNS
3. Submit sitemap: `https://onlineqrcodescanner.com/sitemap-index.xml`

Bing also powers Brave Search, DuckDuckGo (partially), and Ecosia — worth a few minutes.

### 4.3 — Google Analytics (Optional but Useful for AdSense)

AdSense does not require Analytics, but having traffic data helps:

1. Go to [analytics.google.com](https://analytics.google.com) → Create Property
2. Choose **GA4**
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)
4. In `src/config.ts` — check if there is a GA config field. If not, add the GA4 script to your Astro head layout manually.

### 4.4 — Apply for Google AdSense

> Wait at least 2–4 weeks after going live and getting some organic traffic before applying. Google wants to see real users visiting your site.

**Before applying, confirm:**
- [ ] Site is live on `https://onlineqrcodescanner.com` (not pages.dev)
- [ ] Contact page has a real email (not just `contactwithtag@gmail.com` — ideally `contact@onlineqrcodescanner.com`)
- [ ] Privacy Policy explicitly mentions Google AdSense and cookies
- [ ] Site has been indexed by Google (check Search Console for indexed pages)
- [ ] Some organic traffic visible in Search Console

**To apply:**
1. Go to [adsense.google.com](https://adsense.google.com) → Get Started
2. Enter your website URL: `https://onlineqrcodescanner.com`
3. Add the AdSense verification snippet to your site's `<head>` (you can add it to your Astro layout)
4. Submit and wait (typically 1–14 days for review)

**After approval:**
In `src/config.ts` update the ads section:
```typescript
ads: {
  enabled: true,           // was false
  autoAds: true,           // let Google place ads automatically to start
  publisherId: "ca-pub-YOURREALPUBLISHERID",
  // ...keep slots config for manual placement later
}
```

### 4.5 — Set Up Cloudflare Email Routing (Free)

Change `contactwithtag@gmail.com` to `contact@onlineqrcodescanner.com`:

1. In Cloudflare → **Email Routing** → Enable
2. Create a routing rule: `contact@onlineqrcodescanner.com` → forward to `contactwithtag@gmail.com`
3. Update `src/config.ts` line 77: `email: "contact@onlineqrcodescanner.com"`

This makes the site look professional without managing a full email server.

### 4.6 — Set Up IndexNow (Instant Search Engine Notification)

IndexNow tells search engines immediately when pages are updated, instead of waiting for crawlers.

Your existing verification file in `/public/` can serve as the IndexNow key. Alternatively, generate a dedicated key:

1. Generate a random UUID: [uuidgenerator.net](https://www.uuidgenerator.net)
2. Create `/public/YOUR-KEY.txt` containing only the key
3. Submit to: `https://api.indexnow.org/indexnow?url=https://onlineqrcodescanner.com&key=YOUR-KEY`

You can automate this as part of your build pipeline.

---

## Part 5 — Ongoing Maintenance

### Monthly Checklist
- [ ] Check Search Console for crawl errors and manual actions
- [ ] Review Core Web Vitals in Search Console (Page Experience report)
- [ ] Check AdSense for policy violations (once approved)
- [ ] Run type checker if you changed code: `pnpm turbo check --filter=@mtools/onlineqrcodescanner-com`

### When You Update Content
1. Edit the markdown file in `src/content/tools/`
2. Run build locally to verify: `pnpm build:qrcode`
3. Push to `main` — CI/CD auto-deploys

### Dependency Updates
Do this every 1–2 months. Check for security advisories:
```bash
pnpm audit
```
Update non-breaking packages as needed.

### VPS Only — SSL Certificate
Let's Encrypt certificates expire every 90 days. Certbot sets up a cron job that auto-renews them. Verify it is working:
```bash
sudo certbot renew --dry-run
```
If the dry run fails, renewal will fail too. Fix it before the cert expires.

---

## Summary

| Task | Path A (CF Pages) | Path B (VPS) |
|------|-------------------|--------------|
| Hosting cost | Free | €3–5/month |
| SSL | Automatic | Let's Encrypt (automatic) |
| Global CDN | Cloudflare Edge (native) | Cloudflare Proxy |
| Deploy trigger | Git push | Git push → rsync |
| Maintenance | None | OS updates, nginx, certs |
| AdSense compatible | Yes (with custom domain) | Yes |
| Best for your site | ✅ **Yes** | Overkill for now |

**Recommended next steps (in order):**
1. Fix the two typos in qr-code-scanner content
2. Verify `.env` is in `.gitignore`
3. Push to GitHub
4. Create Cloudflare Pages project (Part 2, Steps 3–5)
5. Connect domain (Part 2, Step 4)
6. Submit sitemap to Google Search Console (Part 4.1)
7. Set up Cloudflare Email Routing (Part 4.5)
8. Wait 2–4 weeks for organic traffic
9. Apply for AdSense (Part 4.4)
