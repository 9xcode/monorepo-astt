# Automated Bi-Weekly Rebuild Strategy (CI/CD)

**Purpose:** 
To maintain extreme SEO "Freshness" in Google Search results without having to manually update articles every few months. By forcing your hosting provider to rebuild your website every 14 days, the `<script type="application/ld+json">` schemas and HTTP headers will automatically regenerate to the current date, signaling to Google that your site is actively maintained.

## Implementation Guide (GitHub Actions)

If your website's codebase is hosted on **GitHub** and deployed to a modern platform like **Vercel, Netlify, or AWS Amplify**, the easiest way to trigger a scheduled rebuild is using GitHub Actions.

### Step 1: Create the Workflow File
In the root directory of your project, create the following precise folder structure and file:
`.github/workflows/rebuild.yml`

### Step 2: Paste the Cron Job Configuration
Copy and paste the following code exactly into `rebuild.yml`. Note that you will need to replace the `Deploy Webhook URL` depending on which hosting provider you use (see Step 3).

```yaml
name: Automated Bi-Weekly Rebuild

on:
  schedule:
    # Runs at 00:00 on day-of-month 1 and 15.
    - cron: '0 0 1,15 * *'
  workflow_dispatch: # Allows you to run this manually from the GitHub UI if needed

jobs:
  trigger-rebuild:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Hosting Provider Webhook
        run: |
          curl -X POST -d '{}' $DEPLOY_WEBHOOK_URL
        env:
          # You must add this secret to your GitHub Repository Settings!
          DEPLOY_WEBHOOK_URL: ${{ secrets.DEPLOY_WEBHOOK_URL }}
```

### Step 3: Get Your Webhook URL
A webhook is a secret URL that, when "pinged", tells your server to rebuild the site.
*   **If you use Vercel:** Go to Project Settings -> Git -> Deploy Hooks. Create one called "Bi-Weekly Cron" and copy the URL.
*   **If you use Netlify:** Go to Site Settings -> Build & deploy -> Continuous Deployment -> Build hooks. Create one and copy the URL.

### Step 4: Add the Secret to GitHub
1. Go to your GitHub Repository online.
2. Click **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Set the Name to exactly: `DEPLOY_WEBHOOK_URL`
5. Paste the URL you got from Vercel/Netlify into the Secret field.
6. Click **Add secret**.

### How It Works:
On the 1st and 15th of every single month, GitHub will wake up, securely grab your Webhook Secret, and send a signal to your host. Your host will then run `npm run build`, updating all `dateModified` schemas site-wide to the current day. Google will crawl your site shortly after and see perfectly fresh content.
