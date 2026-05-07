

- Do check robots.txt and llms.txt and sitemap.xml all urls and othe info are correct, and also check if there is any other file in public folder that should not be there.

- Current `/public/images/og-image.png` is a generated placeholder, Replace with a properly designed branded OG image (1200×630px)

- also add screenshot for screenshot related schema and chanage url

- update ad code, search console code, indexnow api key, etc.

- CI-Workflow: When hosting is decided, move `.github/workflows-disabled/ci.yml` to `.github/workflows/ci.yml` and uncomment the appropriate provider block.


- update fevicon

- add pintrest meta tags

- update names in pckage.json before deploye

- do check astro.config.mjs file vite section or og-schema section before deploye







- check urls for trailing slash, that all working correctly and also there is no redirecting on defualt behaviour and also diffrent urls of same post like with slash without slash or with /index.html or without /index.html should not be there and should redirect to single canonical url


- Nginx config on Netcup — minimal, no rewrites needed
```
server {
    listen 80;
    server_name multitools.app www.multitools.app;
    root /var/www/multitools/dist;
    index index.html;

    location / {
        try_files $uri $uri/index.html =404;
    }

    # Custom error pages
    error_page 404 /404.html;
    error_page 500 /500.html;
}
```
        No rewrite rules. No .html mapping. Just $uri/index.html — done.


