---
title: "Mastodon QR Code Generator"
seoTitle: "Free Mastodon QR Code Generator | Create QR Code for Mastodon Profile"
description: "Generate a QR code for your Mastodon profile. Works with mastodon.social, fosstodon.org, hachyderm.io, and any other instance, and download it as PNG, WEBP, or SVG."
shortDescription: "Create a QR code for your Mastodon profile"
category: "QR Generator"
tags: ["qr-generator", "generator", "utility", "mastodon-qr", "social-qr", "fediverse-qr"]
icon: "Globe"
publishedAt: "2026-07-30T04:23:43Z"
updatedAt: "2026-07-30T23:00:00Z"
---

A Mastodon QR code encodes your profile URL so anyone who scans it lands directly on your Mastodon profile. Works for any instance: mastodon.social, fosstodon.org, hachyderm.io, mas.to, infosec.exchange, or any self-hosted server. This tool takes your Mastodon profile URL, converts it into a QR code image, and lets you download it as PNG, WEBP, or SVG.

## The one thing to know about Mastodon profile URLs

Unlike most social networks, Mastodon does not have a single domain. Every instance has its own URL. Your profile URL includes the domain of the server you joined, not a central mastodon.com address.

If your account is `@alice@mastodon.social`, your profile URL is `https://mastodon.social/@alice`.

If your account is `@alice@fosstodon.org`, your profile URL is `https://fosstodon.org/@alice`.

Paste whichever URL matches your instance into the tool. The QR code will point directly to your profile on your server.

## How to use Mastodon QR Code Generator

1. **Get your Mastodon profile URL.** Open your Mastodon instance in a browser and go to your profile. Copy the URL from the address bar. It will include your instance domain and look like `https://yourinstance.social/@yourhandle`.
2. **Paste it into the field above.** The QR code generates as you type.
3. **Customize colors if you need to.** Change the QR pattern and background color to match your design. Keep contrast high so the code scans reliably.
4. **Download the QR code.** Use SVG for print. PNG at 512px or higher for standard printed materials. PNG at 256px to 300px for digital use.
5. **Scan it before printing.** Point your phone camera at the code on screen and confirm the URL it shows is your actual Mastodon profile. Do this before printing anything.

## Key features

- Generates a QR code from any Mastodon profile URL across any instance
- Export as PNG (128px to 1600px), WEBP, or scalable SVG
- Custom QR pattern and background colors with hex color picker
- Live URL preview before download
- Runs entirely in your browser, your URL is never sent to a server

## What this QR code actually does

When someone scans the QR code, their phone reads the encoded Mastodon profile URL. If they have a Mastodon app installed, the phone may prompt them to open it there. If not, the link opens in a browser and shows your public profile page on your instance.

People on other Mastodon instances can still follow you. Mastodon is federated, so following someone across instances works. The QR code just gets them to your profile page; from there they can follow using their own account on any compatible server.

This is a static QR code. If you move to a different Mastodon instance, your profile URL changes and the old QR code will stop pointing to you. Generate a new one after any instance migration.

## Where people use Mastodon QR codes

**Conference and event badges.** The Mastodon user base has a strong overlap with tech, open-source, and academic communities that attend in-person events. A QR code on a badge or table card lets people follow you without typing out a two-part handle.

**Slide decks and talks.** Putting a Mastodon QR code on the final slide of a talk is faster than reading out an instance and handle. People can scan it before the next presenter starts.

**Business cards.** For people who have moved from X (Twitter) to Mastodon, a QR code on a card makes the awkward long handle (`@user@instance.social`) unnecessary to print or read aloud.

**Personal websites and portfolios.** A QR code next to your Mastodon handle on a personal site gives mobile visitors a one-tap way to follow you.

**Printed newsletters and zines.** Writers and independent creators who print physical work sometimes include a Mastodon QR code for readers who want to find them online.

## How to find your Mastodon profile URL

Open your Mastodon instance in a browser (not just the app) and navigate to your profile. Click your display name or avatar to reach your profile page. Copy the URL from the address bar.

The URL format is always `https://[instance]/@[username]`. Some common examples:

- mastodon.social: `https://mastodon.social/@yourhandle`
- fosstodon.org: `https://fosstodon.org/@yourhandle`
- hachyderm.io: `https://hachyderm.io/@yourhandle`
- mastodon.online: `https://mastodon.online/@yourhandle`
- infosec.exchange: `https://infosec.exchange/@yourhandle`
- mas.to: `https://mas.to/@yourhandle`

If you use a self-hosted instance, the format is the same with your own domain.

Paste the full URL including `https://` into the tool.

## Static vs dynamic: what to know

This tool creates static QR codes. Your Mastodon profile URL is encoded directly into the QR pattern. Once printed, the destination cannot be changed without generating and printing a new code.

This matters more for Mastodon than for most platforms because Mastodon users sometimes migrate between instances. When you migrate, your new instance profile has a different URL. Any printed QR codes pointing to the old instance will no longer reach your active profile.

If you think you might change instances, you have two options. One is to wait until your instance situation is settled before printing QR codes. The other is to use a link shortener with a custom redirect (like Bitly) so you can update the destination URL without reprinting the code.

## File format guide for printing

Use **SVG** for anything you will print: conference materials, business cards, posters, or any document. SVG is a vector format that stays sharp at any printed size.

Use **PNG at 512px or higher** for print if your design software does not support SVG. For digital use like websites or email, 256px to 300px is fine.

Do not use JPEG. JPEG compression blurs the edges of QR modules, which is the most reliable way to produce a code that will not scan when printed.

Test the code at the size you plan to use before committing to a print run.

## A note on Mastodon handles vs profile URLs

Mastodon handles look like `@username@instance.social`. That two-part format with the `@` signs is what you use when someone on another instance wants to search for and follow you. It is not a URL.

The profile URL is different: `https://instance.social/@username`. No second `@`. That URL is what you paste here.

Some QR scanners will try to interpret a bare handle as text rather than a link, so the tap-to-open behavior does not work correctly. Using the full HTTPS URL in the tool avoids that problem entirely.

## Related tools on this site

- [QR Code Generator](/tools/qr-code-generator) - create QR codes for URLs, text, Wi-Fi, email, phone, and more in one place
- [URL QR Code Generator](/tools/url-qr-code-generator) - turn any website link into a scannable QR code
- [Bluesky QR Code Generator](/tools/bluesky-qr-code-generator) - create a QR code for your Bluesky profile
- [QR Code Scanner](/tools/qr-code-scanner) - decode any QR code in your browser using your camera

## Frequently Asked Questions (FAQ)

### Does this work for any Mastodon instance?

Yes. Paste the full profile URL from whichever instance you are on. The tool encodes whatever URL you give it. mastodon.social, fosstodon.org, hachyderm.io, infosec.exchange, or any other server all work the same way.

### What if I am on a small or self-hosted instance?

The same process applies. Open your profile in a browser, copy the URL from the address bar, and paste it here. Self-hosted instances follow the same URL format as any other Mastodon server.

### Will the QR code work if someone scans it from a different Mastodon instance?

Yes. The QR code opens a standard web URL. Anyone can open it in a browser regardless of which instance they use. From the profile page they can follow you using their own account on any Fediverse-compatible server.

### What happens if I migrate to a different instance?

Your profile URL changes when you move instances. The old QR code will open your old instance profile, which Mastodon can redirect to your new profile if you have set up a proper account move. To be safe, generate a new QR code after any instance migration and replace any printed versions.

### Will the QR code expire?

No. The QR code encodes a static URL with no expiry. It works as long as your instance is online and your account exists at that URL. If your instance shuts down or you delete your account, the link stops working, but that is the URL itself being invalid, not the QR code expiring.

### Can I track how many people scan the QR code?

No. This tool generates a standard QR code with no analytics. If you need scan tracking, run your Mastodon profile URL through a link shortener with analytics first, then encode the short link here instead of the direct Mastodon URL.

### What file format should I use for conference materials?

Use SVG. It scales to any size without losing quality, which matters when you need the same code on both a business card and a printed banner. If the print shop or design tool does not accept SVG, use PNG at 512px minimum.

### My handle has two @ signs. Do I include those in the URL?

No. The profile URL uses only one `@` before the username, not the instance domain. For example, if your handle is `@alice@mastodon.social`, the profile URL is `https://mastodon.social/@alice`. The `@instance` part of the handle becomes the domain in the URL instead.
