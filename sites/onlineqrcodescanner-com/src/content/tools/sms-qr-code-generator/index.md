---
title: "SMS QR Code Generator"
seoTitle: "Free SMS QR Code Generator | Create Text Message QR Codes Online"
description: "Generate a QR code that opens a pre-filled SMS text message when scanned. Set the recipient number and optional message body. Free, browser-based, private."
shortDescription: "Create a QR code that opens a pre-filled SMS text message"
category: "QR Generator"
tags: ["qr-generator", "generator", "utility"]
icon: "MessageSquare"
---

## What is an SMS QR Code?

An SMS QR code encodes an `sms:` URI, a standard link format that phones have supported since the early 2000s. When someone scans it, their default messaging app opens with the recipient number and an optional message body already filled in. They read the draft, tap Send, and the message goes out.

The format looks like this: `sms:+15551234567?body=Hello%20there`. The phone reads that string, recognizes the `sms:` prefix, and hands it to the native Messages app. On iPhone, that is iMessage or SMS depending on whether the recipient is also on iPhone. On Android it opens the default messaging app, which is usually Google Messages.

The pre-filled body is optional. You can encode just a number with no message, which gives the sender a blank compose window pointed at your number. Or you can pre-fill a short prompt so senders know what to write. Both approaches are useful depending on what you are trying to accomplish.

## How to Create an SMS QR Code

1. **Enter the phone number:** Type the recipient number in international format, starting with the country code (for example, `+1` for the US, `+44` for the UK). This ensures the code works across all carriers and regions.
2. **Add a message body (optional):** Type the text you want pre-filled in the compose window. Keep it short, ideally under 160 characters.
3. **Download the QR code:** Export as PNG for standard use. Use SVG if you need the code to print at a larger size without quality loss.

## Key Features

- Generates a standard `sms:` URI compatible with iOS and Android messaging apps
- Optional pre-filled message body to guide senders
- Works with the default Messages app on any phone, no third-party app required
- Fully browser-based, your phone number and message text never leave your device
- Export as PNG, WEBP, or scalable SVG
- No account, no signup

## When an SMS QR Code Is the Right Choice

SMS is not always the best communication channel, and it is worth being honest about that before you put a QR code on printed materials.

**Use an SMS QR code when:** You want asynchronous, text-based contact from people who may not have WhatsApp or a stable internet connection. Native SMS works on any phone with a carrier signal, no app required, no account needed. It is the most universally compatible text messaging option.

**Good use cases for SMS QR codes:**

Appointment bookings and confirmations. A QR code on a business card or booking receipt that pre-fills "Confirm my appointment" lets customers confirm with one tap instead of hunting for your number and typing a message from scratch.

Customer opt-in for marketing. Retail stores, restaurants, and events use SMS QR codes for list building. The pre-filled message might say "JOIN" or a campaign keyword, so the person just taps Send and the keyword triggers an automated response on your end. This is a clean way to handle SMS opt-in without directing people to a website form.

Feedback and reviews. A table card with a QR code that opens a pre-filled "I'd like to leave feedback about my visit" message gets more responses than a blank "text us" prompt.

Support and inquiries. If your support team handles inbound texts, a QR code on packaging or a help page lets customers start a conversation without searching for a number.

**Where SMS QR codes work less well:** If your audience is primarily in regions where WhatsApp, WeChat, or similar apps have replaced SMS as the default (much of Europe, South Asia, Latin America, and the Middle East), a WhatsApp QR code will see more engagement. Also, if the conversation you want to have requires back-and-forth quickly, a phone call QR code may convert better than SMS.

## SMS QR Code Format and Technical Details

The standard URI format is `sms:<number>?body=<message>`. The phone number should be in E.164 international format: a plus sign, the country code, then the number with no spaces or dashes. `+12025551234` is correct. `202-555-1234` will work domestically in the US but may fail for international visitors.

The message body needs to be URL-encoded. Spaces become `%20`, and special characters like `&`, `=`, and `#` need their encoded equivalents. This tool handles encoding automatically, so you just type your message and the QR code is generated correctly. If you are building the URI manually for a different purpose, any URL encoder will handle the conversion.

You may occasionally see `smsto:` used instead of `sms:`. Both work on most devices, but `sms:` has broader support in the URI standard and is the safer choice. This generator uses `sms:`.

**A note on Google Messages and RCS.** Google Messages supports QR code scanning for device pairing and account migration, but that is a separate feature unrelated to `sms:` QR codes. If you have seen references to "Google RCS SMS QR code" in that context, it refers to migrating your Google Messages account to a new phone, not to the kind of QR code this tool generates. The QR codes this tool produces use the standard `sms:` URI and work across all carriers and messaging apps regardless of whether RCS is enabled.

## Character Limits and What Happens When You Go Over

A standard SMS message is 160 characters in the GSM-7 character set. If the pre-filled message body exceeds 160 characters, most carriers split it into multiple segments and send them as a multipart SMS. The recipient sees it as one message, but you may be charged for multiple SMS credits depending on your carrier plan.

For QR code purposes, there is a separate concern: longer message bodies make the encoded string longer, which makes the QR pattern denser and harder to scan reliably. Keep the pre-filled body under 160 characters for both reasons. A short prompt that gives the sender direction is more effective than a long pre-written message anyway.

Unicode characters (emoji, accented letters, characters outside the basic Latin alphabet) reduce the segment limit from 160 to 70 characters. If your message includes emoji, aim for under 70 characters in the body.

## Related Tools on This Site

- [Phone QR Code Generator](/tools/phone-qr-code-generator) - create a QR code that dials a number instead of opening a text message
- [WhatsApp QR Code Generator](/tools/whatsapp-qr-code-generator) - open a WhatsApp conversation directly, useful where WhatsApp is the dominant messaging app
- [Email QR Code Generator](/tools/email-qr-code-generator) - pre-fill an email compose window instead of an SMS
- [vCard QR Code Generator](/tools/vcard-qr-code-generator) - share your full contact details so people can save your number without typing it
- [QR Code Generator](/tools/qr-code-generator) - the main generator covering URLs, text, Wi-Fi, and contacts
- [QR Code Scanner](/tools/qr-code-scanner) - decode any QR code in your browser using your camera

## Frequently Asked Questions (FAQ)

### Does the message send automatically when scanned?
No. Scanning opens the compose window with the number and message pre-filled. The person reads it, edits if they want, and taps Send themselves. Nothing sends automatically. This is standard behavior on both iOS and Android.

### How do I create an SMS QR code?
Enter the recipient phone number in the field above, starting with the country code. Add an optional pre-filled message body if you want to guide senders. The QR code generates automatically. Download as PNG or SVG and use it anywhere you would use a standard QR code.

### What is the SMS QR code format?
SMS QR codes use the `sms:` URI format: `sms:+15551234567?body=Your%20message%20here`. The phone number should be in E.164 international format (plus sign, country code, number). The message body should be URL-encoded, though this tool handles that automatically when you type your message.

### Does this work with Google Messages?
Yes. Google Messages on Android supports `sms:` URIs and will open with the number and message pre-filled when a QR code is scanned. Note that Google Messages also has a QR code feature for pairing your account across devices, but that is a different feature unrelated to the `sms:` QR codes this tool generates.

### What is the difference between an SMS QR code and a WhatsApp QR code?
An SMS QR code uses the native messaging app and works without an internet connection, as long as there is a carrier signal. A WhatsApp QR code requires the WhatsApp app to be installed and uses an internet connection. In regions where WhatsApp is more common than SMS, a WhatsApp QR code may see more engagement. In regions where native SMS is the default, or for audiences that may not have WhatsApp, an SMS QR code is more universally accessible.

### Can I send a QR code via SMS?
You can, though it is an unusual use case. If you generate a QR code and want to share it via text message, you would download the image and attach it as an MMS. The recipient would then scan it with their camera. This tool generates images, and you share those images however you like. There is no special "send QR code via SMS" function built in.

### How many characters can the pre-filled message be?
Technically there is no hard limit in the `sms:` URI specification, but keeping the body under 160 characters is good practice for two reasons. First, standard SMS segments are 160 characters in the basic character set, so longer messages split into multiple billable segments. Second, longer body text makes the QR pattern denser, which can make it harder to scan reliably in lower-light conditions or when printed small.

### Does it work on iPhone as well as Android?
Yes. Both iOS and Android recognize `sms:` URIs. On iPhone it opens iMessage or SMS depending on the recipient's phone type. On Android it opens whatever app is set as the default SMS handler, usually Google Messages. The behavior is consistent across modern versions of both operating systems.
