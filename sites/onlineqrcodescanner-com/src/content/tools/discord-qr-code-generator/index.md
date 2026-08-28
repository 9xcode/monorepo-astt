---
title: "Discord QR Code Generator"
seoTitle: "Discord QR Code Generator | Create Discord Invite QR Code"
description: "Generate a permanent QR code for any Discord server invite link or user profile. Download high-quality PNG, WEBP, or vector SVG files."
shortDescription: "Create a QR code for a Discord server invite or profile"
category: "QR Generator"
tags: ["qr-generator", "generator", "utility", "discord-qr", "social-qr"]
icon: "Globe"
publishedAt: "2026-08-13T00:03:43Z"
updatedAt: "2026-08-28T00:00:00Z"
---

Before getting into how to use this tool, there is something worth clarifying upfront. Discord has its own QR code built into the app. That QR is for logging in, not for sharing servers. If you have ever opened the Discord desktop app and seen a QR code on the login screen, that is what it is. Scanning it with your phone logs you into Discord on that device.

That is completely different from what this tool creates.

This tool generates a QR code that links to a Discord server invite URL or a user profile. When someone scans it, they land on the invite or profile page, not a login screen. You download the image, print it or embed it wherever you need it, and it works like any other scannable link.

## Discord links you can encode

**Server invite links.** These are the primary use case. Discord server invites look like `https://discord.gg/XXXXXXXXX` or the longer format `https://discord.com/invite/XXXXXXXXX`. When someone opens the link, they see the server preview and can choose to join. A QR code for a Discord server invite puts that one-tap join path into printed or shareable form.

**User profiles.** Discord user profiles can be linked at `https://discord.com/users/USER_ID` using a numeric user ID. These are less commonly used as QR codes because Discord's username system has changed over time, but they work in this tool the same as any other URL.

**Discord.gg vanity URLs.** Servers that qualify for a vanity URL get a permanent short link like `https://discord.gg/yourservername`. These are more stable than auto-generated invite codes and are the better choice for printed materials.

## The invite link expiry problem

This is the most important thing to get right before printing anything.

Discord invite links can expire. By default, when you create an invite in Discord, it is set to expire after 7 days with unlimited uses. If you print a QR code with a temporary invite link and the link expires, the code will stop working. Anyone who scans it after that will land on a dead invite page.

To generate a permanent invite link:

1. Open your Discord server and go to any channel.
2. Click the invite icon (the person with a plus sign at the top).
3. In the invite window, click "Edit invite link."
4. Set the expiry to "Never" and uses to "No limit."
5. Copy that permanent link.

That permanent link is what you should encode. A QR code printed on a poster, product, or card needs a link that will still work in six months.

Vanity URLs, if your server has one, are also permanent as long as the server keeps its boost level. They are the most stable option for print use.

## How to create a Discord QR code

1. **Get a permanent invite link.** Follow the steps above to generate a never-expiring invite from your server settings. Or copy your vanity URL if you have one.
2. **Paste the link into the field above.** The QR preview generates immediately.
3. **Check the preview.** Confirm the discord.gg link in the preview matches what you copied.
4. **Adjust colors if needed.** Discord's brand color is a dark blurple (#5865F2), but for reliable scanning, keep the QR pattern dark on a light background. A dark-on-white or dark-on-light-gray code scans more consistently than an inverted one.
5. **Download.** SVG for print. PNG at 512px or higher for standard printed materials. PNG at 256px for digital use.
6. **Scan it.** Test the code on screen before printing. Open your phone camera, point it at the screen, and confirm it opens the invite correctly.

## Where Discord QR codes get used

**Community servers for events and conferences.** Tech events, gaming expos, and creator meetups often run Discord servers for attendees to coordinate. A QR code on a badge, a table card, or a printed schedule gives attendees a direct way to join without searching for the server name.

**Gaming communities.** Gaming communities distributed across forums, YouTube, or Twitch sometimes print their Discord invite on merch, inserts in physical game releases, or game case art. The QR code gets people into the community with one scan.

**Content creator fan servers.** Streamers, podcasters, and YouTubers who maintain a Discord for their audience sometimes include a QR code in a video overlay, on printed merchandise, or in a channel overlay during livestreams.

**Small business and brand communities.** Brands that use Discord for customer communities or product support sometimes add a Discord QR code to packaging, receipts, or in-store displays, similar to how they would use a Facebook group or WhatsApp link.

**Game releases and early access programs.** Game studios sometimes include a Discord invite in a physical game manual or in a QR code inside the box, directing players to a support or community server.

**Hackathons and workshops.** Organizers who use Discord for team coordination during a hackathon sometimes post a QR code at the entrance so participants can join the event server immediately on arrival.

## A note on Discord QR code scams

Because Discord's login system uses a QR code to authenticate sessions, there is a known type of scam where someone sends a manipulated QR code image that, when scanned inside the Discord app's QR scanner, logs your account into a device the scammer controls.

This type of scam only works if you scan the QR code inside the Discord app itself, using Discord's own QR scanner in the login flow. It does not work with standard phone camera scanning. A phone camera reads a QR as a URL and opens it in a browser. The scam requires tricking someone into using Discord's own login scanner on a code that looks like an innocent invite but is actually an auth token.

The QR codes you generate with this tool encode standard HTTPS URLs (discord.gg invite links or discord.com profile links). They are not login tokens and cannot be used in that type of attack. But it is worth knowing this distinction exists so you understand what makes a QR code "safe" in the context of Discord.

Never scan a Discord QR code using the Discord app's built-in scanner unless you are logging into a device you own. For everything else, use your regular phone camera.

## File format guide

SVG is the right format for anything printed. It is a vector file that stays sharp at any printed dimension.

PNG at 512px covers most standard print needs when SVG is not available. For conference-size posters or event signage, go higher.

PNG at 256px is fine for digital use in stream overlays, social posts, or embedded on a website.

Avoid JPEG for QR codes. JPEG blurs the edges between modules, which is the most common reason a printed code fails to scan.

Discord.gg links are short, so the QR pattern is not overly dense. You can print it reasonably small (around 2cm x 2cm minimum) and still get reliable scans.

## Related tools on this site

- [Telegram QR Code Generator](/tools/telegram-qr-code-generator) - create a QR code for a Telegram channel or group
- [GitHub QR Code Generator](/tools/github-qr-code-generator) - create a QR code for your GitHub profile or repository
- [Threads QR Code Generator](/tools/threads-qr-code-generator) - create a scannable QR code for your Threads profile
- [Reddit QR Code Generator](/tools/reddit-qr-code-generator) - create a QR code for a subreddit or Reddit profile
- [BeReal QR Code Generator](/tools/bereal-qr-code-generator) - create a QR code for your BeReal profile
- [Clubhouse QR Code Generator](/tools/clubhouse-qr-code-generator) - create a QR code for your Clubhouse profile or room

## Frequently asked questions

### How do I get a permanent Discord invite link?

Open your server, click the invite button on any channel, then click "Edit invite link." Set expiry to "Never" and uses to "No limit." Copy that link. Permanent links are essential for anything you print, because a default 7-day invite link will break before most printed materials are used.

### Can I generate a QR code for a Discord server invite?

Yes. Paste your discord.gg or discord.com/invite link into the field above. The QR code will link directly to your server's invite page.

### What is the Discord QR code on the login screen for?

The QR code shown in the Discord desktop app login page is a session authentication token. Scanning it with your phone while logged into Discord on mobile logs you into Discord on that desktop. It has nothing to do with server invites. This tool creates a completely different type of QR code that encodes a standard invite or profile URL.

### Is it safe to scan a Discord QR code?

It depends on how you scan it and what the code contains. Scanning a discord.gg invite link with your phone camera is safe. It opens the invite page in a browser, same as tapping any link. The risk only applies to Discord's own login QR feature, which should only be used when you are explicitly logging into a device you own. Never use Discord's in-app QR scanner on a code someone sent you claiming it is a server invite.

### Will the QR code stop working if I change my server name?

Changing your server name does not affect invite links. Invite link codes are separate from the server name. The only way an invite link stops working is if it expires, reaches its usage limit, the link is manually revoked, or the server is deleted.

### What happens if I delete the channel where the invite was created?

Deleting the channel does not automatically revoke invites created from it. The invite may still work. However, Discord's behavior here can vary, and it is safer to create invites from your server settings (server settings > invites) rather than from a channel, so the invite is not tied to a channel's existence.

### Can I create a QR code without a Discord vanity URL?

Yes. Any permanent discord.gg invite link works. Vanity URLs are optional and only available to servers that meet Discord's boost or partner requirements. A standard permanent invite link encodes just as well.

### How do I scan a Discord QR code?

Point your phone's standard camera app at the code. Most phones will detect the QR automatically and show a notification to open the link. Tap it and it will open the Discord server invite page in your browser or in the Discord app if installed. You do not need to use Discord's built-in scanner for this. In fact, you should not use Discord's scanner unless you are explicitly logging into a device.

### Can I use this to generate a QR code for my Discord profile?

Yes. Discord profile URLs follow the format `https://discord.com/users/YOUR_USER_ID`. You can find your user ID by enabling Developer Mode in Discord settings (Settings > Advanced > Developer Mode), then right-clicking your name and selecting "Copy User ID." Paste that URL here. Note that profile pages require the viewer to be logged in to Discord to see much beyond the basic profile.
