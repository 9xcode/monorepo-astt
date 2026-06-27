---
title: "Text QR Code Generator"
seoTitle: "Free Text QR Code Generator | Plain Text to QR"
description: "Generate a QR code from any plain text, message, note, coupon code, password, Wi-Fi password, WiFi credentials, serial number, short address, or code 100% Free."
shortDescription: "Encode any plain text or message into a scannable QR code"
category: "QR Generator"
tags: ["qr-generator", "generator", "utility"]
icon: "Type"
---

## What is a Text QR Code?

A text QR code encodes a plain string of characters into a QR pattern. When someone scans it, the decoded text appears on their screen. No browser opens, no app launches, no redirect happens. The scanner just reads the pattern and shows whatever text was encoded.

This is the most fundamental type of QR code. Every other format (URL QR codes, vCard QR codes, SMS QR codes) is really just a text QR code where the text follows a specific format that devices know how to act on. A URL QR code works because the phone sees `https://` and knows to open a browser. A text QR code is what you get when the content is meant to be read directly rather than trigger any app.

The practical result is that a text QR code works completely offline on the scanning side. No internet connection needed, no app needed beyond a basic camera. The data lives entirely in the pattern.

## How to Create a Text QR Code

1. **Type or paste your text:** Enter anything in the text field: a message, a coupon code, a serial number, a short note, an address, a poem. Whatever you want someone to read when they scan.
2. **Preview the code:** The QR pattern generates automatically as you type. The preview updates in real time so you can see the density increase as you add more text.
3. **Adjust size if needed:** Longer text creates a denser pattern that needs a larger printed size to scan reliably. If the preview looks very dense, consider shortening the text or planning for a larger print size.
4. **Download:** Export as PNG for most uses. SVG if the code needs to print at a larger format without pixelation.

## Key Features

- Encode any plain text: messages, notes, coupon codes, serial numbers, short addresses
- No forced character limit, the tool encodes as much as a QR code can hold
- Fully browser-based, your text is never sent to a server
- Live preview as you type
- Export as PNG, WEBP, or scalable SVG
- No account required

## How Much Text Can a QR Code Actually Hold?

This comes up a lot and the answer is more interesting than most people expect.

A QR code at its maximum capacity (version 40, the largest) holds up to 4,296 alphanumeric characters, or 2,953 bytes of binary data. For pure uppercase letters and numbers (which use a compressed encoding called alphanumeric mode), the limit is higher than for mixed-case text with special characters.

To put that in concrete terms: a haiku fits easily. A business card's worth of information fits. A short letter fits. The entire text of the US Constitution has famously been encoded into a single QR code. The full document runs around 45,000 characters, so it required a high-version QR code and the resulting pattern was extremely dense, not really practical for most scanning scenarios but technically valid. The experiment shows the upper bound of what the format can theoretically hold, not what works well in practice.

**What works well in practice is much shorter.** Here is a rough guide:

- Up to 100 characters: the QR code stays compact and scans reliably at small sizes
- 100 to 500 characters: still workable, print at 300px or larger
- 500 to 1,000 characters: getting dense, needs 400px or more, good lighting required
- Over 1,000 characters: technically possible, but consider whether the content is better delivered via a URL pointing to a web page

For coupon codes, serial numbers, and short messages, you are well within the comfortable range. For longer content like a full address block or multi-line instructions, test your QR code with a phone before printing.

## Text QR Code vs URL QR Code: When to Use Which

This is the comparison people most often want to make. The short answer: if the content needs to live somewhere and be updatable, use a URL. If the content is the destination, use text.

**Use a plain text QR code when:**

The content is self-contained and does not change. A discount code that only applies for one event. A serial number stamped inside a product. A password for a local Wi-Fi network that does not change often (though a dedicated Wi-Fi QR code is better for that). A message in an art installation or escape room puzzle. Any situation where you want the scanner to read the text directly without being sent anywhere.

**Use a URL QR code instead when:**

The content might change. If you want to update what people see after the code is printed, a URL QR code pointing to a page you control lets you do that. A text QR code is static. The content is baked into the pattern permanently.

**The difference in scanning experience:**

A URL QR code sends the user to a website, which means they need an internet connection and the action happens in a browser. A text QR code shows the content immediately on their screen, works offline, and leaves the user in their camera app or QR scanner. For some contexts (no-internet venues, quick reference content) that is a significant advantage.

## How iOS and Android Handle Scanned Text

The scanning experience varies slightly between platforms, which is worth knowing before you print a text QR code with an expectation about how it will appear.

**On iPhone:** iOS 11 and later can scan QR codes using the built-in camera app. When it detects a text QR code, it shows the decoded text in a notification-style banner at the top of the screen. With iOS 15 and later, the Live Text feature can also detect and select text within QR codes when viewing a screenshot, allowing users to copy specific words rather than the whole string. This is particularly useful for coupon codes or reference numbers where the person wants to copy just part of the text.

**On Android:** Most Android phones with Google Lens integration (available through the camera app on most modern Android phones) can scan QR codes and display the decoded text. The exact presentation depends on the device manufacturer and which camera software they use, but decoded plain text is generally shown directly in the camera UI.

**In third-party scanner apps:** Apps like Google Lens, Apple's built-in QR reader, and most dedicated scanner apps display plain text results with a "Copy" option, making it easy for users to use the scanned text elsewhere.

## Practical Uses for Text QR Codes

**Coupon and discount codes.** Print the code directly into the QR pattern so customers scan and read the code without visiting a website. Useful for in-store signage where you do not need to track redemptions digitally.

**Product serial numbers and batch codes.** Manufacturers sometimes encode serial data into QR codes on packaging so warehouse staff or customers can scan and read it without manually transcribing numbers.

**Event and conference materials.** An escape room clue. A scavenger hunt hint. A museum exhibit label with extended information. Any physical installation where you want people to scan and receive text immediately.

**Emergency information cards.** Medical information, allergy warnings, emergency contacts. Printed as a QR code on a card so a first responder can scan it.

**Short offline reference content.** A QR code on a power tool with the safety instructions. A QR code inside a manual that gives a quick-start summary. Any situation where a URL would require internet access that might not be available.

**Password sharing at events.** A QR code displaying a Wi-Fi password (though again, a dedicated Wi-Fi QR code is better for this because it can auto-connect rather than just showing the password as text).

## Related Tools on This Site

- [QR Code Generator](/tools/qr-code-generator) - the main generator for URLs, text, Wi-Fi, and vCard contacts in one place
- [URL QR Code Generator](/tools/url-qr-code-generator) - encode a website link instead of plain text
- [Wi-Fi QR Code Generator](/tools/wifi-qr-code-generator) - auto-connect guests to a network rather than showing the password as text
- [vCard QR Code Generator](/tools/vcard-qr-code-generator) - encode contact details in a format phones can import directly
- [QR Code Scanner](/tools/qr-code-scanner) - scan and decode any QR code directly in your browser
- [Barcode Scanner](/tools/barcode-scanner) - scan barcodes and product codes

## Frequently Asked Questions (FAQ)

### What is a plain text QR code?
A plain text QR code encodes a raw string of characters with no special formatting or URI prefix. When scanned, the device shows the text directly rather than opening an app or browser. It is the most basic QR code type, and it works for any content that is meant to be read rather than acted on.

### How do I scan a text QR code?
On iPhone, point the built-in camera at the QR code and a banner will appear at the top of the screen showing the decoded text. On Android, the camera app on most modern devices detects QR codes automatically and shows the result. If your camera does not detect it, try Google Lens or any dedicated QR scanner app. For text QR codes specifically, no special app is needed beyond a standard QR scanner.

### How much text can I encode?
Up to about 4,296 alphanumeric characters at maximum QR capacity. For reliable everyday scanning, keep text under 500 characters. The more text you encode, the denser the QR pattern and the more important it becomes to print the code at a larger size and in high contrast.

### Can I create a text QR code for free?
Yes. This tool generates text QR codes entirely in your browser at no cost. There is no account required, no watermark on the output, and no limit on how many codes you generate.

### Can a QR code store an entire document?
Technically yes, up to the encoding limit. The US Constitution fits in a single QR code at maximum version, though the resulting pattern is so dense that it requires excellent scanning conditions to read. For documents longer than a few hundred words, encoding the full text into a QR code is impractical. A URL QR code pointing to a hosted version of the document is almost always a better solution.

### What is the difference between a text QR code and a URL QR code?
A URL QR code encodes a web address that the phone opens in a browser. A text QR code encodes a plain string that the phone shows directly on screen. URL QR codes require an internet connection and send users to an external destination. Text QR codes work offline and display the content immediately with no redirect.

### Do text QR codes work on iPhone (iOS)?
Yes. The built-in camera app on iPhone (iOS 11 and later) scans text QR codes and displays the decoded content in a banner notification. iOS 15 and later also supports Live Text, which lets users select, copy, or translate specific parts of the scanned text.

### Does the QR code expire or stop working?
No. A plain text QR code has no server component and no expiry. The content is encoded directly into the pattern. As long as the physical code is intact and readable, it will work indefinitely. It cannot be updated after generation, so if you need to change the encoded text, generate and print a new code.
