---
title: "Email QR Code Generator"
seoTitle: "Free Email QR Code Generator | Create Gmail QR Online"
description: "Generate a QR code that opens a pre-filled email compose window when scanned. Set recipient, subject, and body. Works with Gmail, Outlook, and Mailto."
shortDescription: "Create a QR code that opens a pre-addressed email draft"
category: "QR Generator"
tags: ["qr-generator", "generator", "utility"]
icon: "Mail"
---

## What is an Email QR Code?

An email QR code encodes a `mailto:` URI, a standard link format that phones and computers have supported for decades. When someone scans the code, their default email app opens with the To, Subject, and Body fields already filled in. They just review the draft and tap Send.

The `mailto:` format itself is straightforward: `mailto:you@example.com?subject=Hello&body=Hi%20there`. That string gets encoded into the QR pattern the same way a website URL would. Any device that can scan a QR code and has an email app installed will handle it correctly.

Where this gets genuinely useful is in situations where you want someone to contact you by email but you also know they won't bother if there's any friction involved. A printed QR code on a conference badge, a feedback card on a restaurant table, a product warranty card in a box. These are moments where the person is physically present and motivated, but typing out an email address and composing a subject line from scratch might be enough to make them not bother. Pre-filling those fields closes that gap.

One thing worth understanding before you use it: the QR code does not send any email on its own. It opens a compose window. The person still has to tap Send. This matters because it means the user is in complete control, which is actually what you want. It also means the approach does not work for fully automated workflows. For that you'd need a form backend, not a mailto link.

## How to Create an Email QR Code

1. **Enter the recipient address:** Type the email address that will receive messages into the To field. This is the only required part.
2. **Add a subject (optional):** Pre-filling the subject line helps you filter incoming messages. Something like "Website Inquiry" or "Warranty Registration" works well.
3. **Add a body (optional):** A short pre-filled message can guide senders. "Hi, I scanned your QR code and wanted to get in touch" or you can leave it blank and let them write their own.
4. **Download the QR code:** Export as PNG for standard use, or SVG if the code needs to scale to a larger print size without losing quality.

## Key Features

- Generates a standard `mailto:` URI compatible with all major email clients
- Pre-fill the recipient, subject line, and message body in one step
- Works with Gmail, Outlook, Apple Mail, Thunderbird, and any app registered as the device's default email handler
- Fully browser-based, your email address and message content are never sent to a server
- Export as PNG, WEBP, or scalable SVG
- Free and No signup required


## Where Email QR Codes Actually Work Well

**Conference and event badges.** Attendees scan your badge instead of fumbling for a business card. The subject field can auto-populate "Met at [Event Name]" so you both remember the context when you follow up later.

**Printed marketing materials.** Flyers, brochures, and posters have limited space. A single QR code can replace a paragraph of "contact us at..." text and make the action far more likely to happen.

**Warranty and product registration cards.** Instead of asking customers to visit a URL and fill out a form, let them scan a code from inside the box. Pre-fill the subject with the product name so support staff know immediately which product the email is about.

**Feedback requests.** Place a QR code on a receipt, table card, or product packaging. Pre-fill the subject with "Feedback" and a short body prompt. Most people who were going to ignore a URL will still ignore this, but the ones who were on the fence will convert better.

**Freelancers and consultants.** If you hand out business cards or put your contact info on proposals, an email QR code is faster than typing an address for the recipient and looks more intentional than just printing a raw email address.

**Brick-and-mortar shops.** A small card near the counter with "Questions? Scan to email us" works for businesses that want email contact without paying for a form tool or maintaining a contact page.

## Things to Know Before You Print It

**Your email address becomes public.** Any QR code scanner app can decode the full `mailto:` string, including your email address. This is expected behavior, the same as printing your email on a business card. What it means in practice is that you should not use a personal or primary inbox address on anything with wide distribution. Create a dedicated contact address you can filter and monitor separately.

**Long body text creates a dense QR code.** The more text you pre-fill, the larger and more complex the QR pattern becomes. Complex patterns need to be printed larger to scan reliably. If you are printing at small sizes (a business card, a product label), keep the body field short or leave it empty. The subject line alone is usually enough to give senders context.

**Most desktop browsers handle it too.** When someone scans the code with their phone camera, the phone handles it. But if you embed the same mailto link in a web page, clicking it on a desktop will also open the default mail client. The format works across platforms, not just on phones.

**Spam filters may flag pre-filled bodies.** If your pre-filled body text looks templated or contains certain trigger phrases, some recipient mail servers may score the message higher for spam. Keep body text natural and brief if you use it.

## Related Tools on This Site

- [QR Code Generator](/tools/qr-code-generator) - the main tool for URLs, plain text, Wi-Fi, and vCard contacts
- [vCard QR Code Generator](/tools/vcard-qr-code-generator) - share your full contact details (name, phone, email, company) in one scan
- [WhatsApp QR Code Generator](/tools/whatsapp-qr-code-generator) - open a WhatsApp conversation instead of an email thread
- [Phone QR Code Generator](/tools/phone-qr-code-generator) - a scannable code that dials a phone number directly
- [SMS QR Code Generator](/tools/sms-qr-code-generator) - pre-fill a text message the same way this tool pre-fills an email
- [QR Code Scanner](/tools/qr-code-scanner) - decode any QR code in your browser using your camera

## Frequently Asked Questions (FAQ)

### Does scanning the QR code send an email automatically?
No. Scanning opens the compose window with your pre-filled fields. The person still has to tap Send. They can also edit or delete what you pre-filled before sending. The QR code is a shortcut to writing the email, not a trigger that sends anything on its own.

### Which email apps work with this QR code?
Any app that is set as the device's default email handler will open. On iPhone that is usually Apple Mail unless the user has changed it to Gmail or Outlook. On Android it depends on what the user has installed and set as default. The `mailto:` standard is supported across all of them: Gmail, Outlook, Yahoo Mail, Apple Mail, Thunderbird, Samsung Email, Proton Mail, and others.

### What if the person who scans it does not have an email app installed?
On most phones this is rare, but it happens. Some people use webmail only and have not configured a mail app. In that case, tapping the decoded link may do nothing, or the phone may show a "no app found" error. There is no fallback built into the mailto format itself. If you are targeting a broad audience and want a more reliable contact method, a URL QR code pointing to a contact form is a safer option.

### Can I pre-fill CC or BCC fields?
The `mailto:` specification does support cc and bcc parameters (`mailto:you@example.com?cc=other@example.com`). Whether they actually populate depends on the email client. Some honor all parameters, others ignore cc and bcc entirely. This tool pre-fills the To, Subject, and Body fields, which have the most consistent support. If CC or BCC are important for your use case, test the encoded link in the specific apps your audience uses before printing anything.

### Can I use my work email address?
Yes, but think about where the QR code will appear. If you put it on a business card that you hand to a few people, that is fine. If you put it on a banner at a public event or on a product that ships to thousands of customers, your work address will be visible to everyone who decodes the QR pattern. A dedicated contact or support address is usually the better choice for anything with wide distribution.

### How long can the pre-filled body text be?
Technically the `mailto:` format has no hard character limit, but QR codes become harder to scan as the encoded string gets longer. Once the data exceeds roughly 300 to 500 characters, the QR pattern gets dense enough that it requires a steady hand and good lighting to scan. For print materials, keep the pre-filled body under 150 characters. A subject line plus a one-sentence prompt is almost always enough.

### Is this the same as a contact form?
Not really. A contact form submission goes directly to your backend or email service. The sender does not need a mail app, and you have control over what data gets collected. An email QR code opens the user's own mail app, which means the message comes from their address, arrives in your inbox like any other email, and you have no control over what they write beyond the pre-filled prompt. Both have their place. Contact forms are better for structured data collection. Email QR codes are better for quick, low-friction personal outreach.

### Does the generated QR code expire?
No. There is no server involved and no expiry mechanism. The QR code encodes a static `mailto:` string. It will keep working as long as the encoded email address exists and receives mail. If you change the email address later, the QR code will still open a compose window pointing to the old address, so update any printed materials if you switch addresses.
