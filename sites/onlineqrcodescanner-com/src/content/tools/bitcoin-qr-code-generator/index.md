---
title: "Bitcoin QR Code Generator"
seoTitle: "Free Bitcoin QR Code Generator Online | BIP-21 Payment QR Codes"
description: "Generate a Bitcoin payment QR code from any wallet address instantly. Set an optional BTC amount and label. BIP-21 compatible, private, and 100% browser-based."
shortDescription: "Create a Bitcoin payment request QR code in BIP-21 format"
category: "QR Generator"
tags: ["qr-generator", "generator", "utility"]
icon: "Bitcoin"
---

## What is a Bitcoin QR Code?

A Bitcoin QR Code is a scannable image that encodes a BIP-21 payment URI: a standardized string containing a Bitcoin wallet address, an optional BTC amount, and an optional label. When someone scans it with any Bitcoin wallet app, the app fills in the recipient address and amount automatically. The sender just reviews and confirms.

The format looks like this: `bitcoin:<address>?amount=<BTC>&label=<text>`. That string gets encoded into the QR pattern. The receiving wallet decodes it and shows a pre-filled payment screen.

Here is the practical reason this matters. Bitcoin addresses are 26 to 62 characters long depending on the format. Legacy P2PKH addresses run 26-35 characters, while modern Bech32 (native SegWit) addresses starting with `bc1` run 42-62. All of them are a mix of letters and numbers with no obvious pattern. One wrong character sends funds to an address that may not exist, or exists but belongs to someone else. Bitcoin transactions do not reverse. A QR code sidesteps the whole problem because the wallet reads the address directly from the image.

This is why Bitcoin QR codes (also called BTC QR codes) show up in so many different contexts: merchants, content creators, freelancers, and developers all run into the same address-copying problem and solve it the same way.

## How to Use This Tool

1. **Enter your wallet address:** Paste your Bitcoin receiving address into the address field. This is the only required field.
2. **Set an amount (optional):** Enter the BTC amount if you want to request a specific payment. Leave it blank for a general donation address.
3. **Add a label (optional):** A short label like "Invoice #1042" or "Coffee Shop" appears in the wallet app so the sender knows what the payment is for.
4. **Download your QR code:** Export as PNG, WEBP, or SVG. PNG covers most digital and print uses. SVG is the right choice when you need the image to scale to any size without quality loss.

## Key Features

- Generates a BIP-21 standard `bitcoin:` URI that works with all major wallet apps
- Optional BTC amount field for precise payment requests
- Optional label field so the sender sees context inside their wallet
- Fully client-side processing, your wallet address and payment details never touch our servers
- Export as PNG, WEBP, or scalable SVG
- No account, no signup, no tracking

## Where People Actually Use Bitcoin QR Codes

**Point-of-sale payments.** A printed QR code at the counter is the fastest way to accept Bitcoin in person. The customer opens their wallet, scans, and the payment amount populates. No one types anything.

**Donation addresses.** Content creators and open-source projects publish a static QR code instead of pasting a raw address in every post. Leave the amount blank so donors can give whatever they want.

**Invoice payment requests.** Put a Bitcoin QR code on a PDF invoice with the exact BTC amount and an invoice number in the label field. The client scans it, pays the right amount, and both of you have a matching reference without any back-and-forth.

**Business cards.** A QR code takes up less space than a 42-character Bech32 address and is far less likely to cause a payment error.

**Developer testing.** When you are building a Bitcoin payment integration, generating QR codes is faster than hand-encoding BIP-21 URIs every time you want to test a wallet scan.

## How to Display Your Bitcoin QR Code

For print, export as SVG or PNG at 512px. SVG scales without pixelation, so use it for anything larger than a business card. PNG at 512px is fine for invoices and standard print sizes.

For web pages, embed the PNG or SVG directly. A display size of 200-300px gives phone cameras enough detail to scan cleanly from arm's length.

For PDFs, paste the PNG into your invoice template. Any standard PDF editor handles it.

Before you share or print anything, scan the code yourself. Open your own wallet, scan the QR, and confirm the address and amount match what you entered. Takes ten seconds and saves a lot of grief if something went wrong.

## A Note on Sharing Your BTC QR Code Publicly

Sharing a receiving address as a QR code is safe, a public address is meant to be public. But there are a few things worth knowing before you post it somewhere.

**Address substitution.** If you paste a QR code image into a website or document, make sure you control that file. Someone with edit access to your page or invoice template could swap the QR image for one encoding a different address. The payment would go through fine, just to the wrong wallet. This is rare but has happened. For high-value use cases, tell recipients to verify the first and last four characters of the decoded address before confirming payment.

**Static address privacy.** A single Bitcoin address reused for many payments is public on the blockchain. Anyone can look it up and see every transaction that ever hit it: total received, number of payments, timestamps. For a business donation address this is usually fine. For personal payments where you want privacy, generate a fresh address each time.

**Screenshot vs. download.** Download the QR code using the export button rather than screenshotting it. Screenshots can introduce compression artifacts that cause scanning failures, especially on some Android devices.

## Related Tools on This Site

This site covers the full range of QR code generation and scanning needs. If you work with other types of codes alongside Bitcoin payments, these tools are worth bookmarking:

- [QR Code Generator](/tools/qr-code-generator) - URLs, plain text, Wi-Fi, and vCard contacts in one place
- [URL QR Code Generator](/tools/url-qr-code-generator) - turn any website link into a scannable QR code
- [vCard QR Code Generator](/tools/vcard-qr-code-generator) - encode your full contact details into a single scannable code
- [Wi-Fi QR Code Generator](/tools/wifi-qr-code-generator) - let guests connect to a network by scanning instead of typing a password
- [QR Code Scanner](/tools/qr-code-scanner) - decode any QR code directly in your browser using your camera
- [WhatsApp QR Code Generator](/tools/whatsapp-qr-code-generator) - create a QR code that opens a WhatsApp chat directly

## Frequently Asked Questions (FAQ)

### Is my wallet address sent to any server?
No. Generation runs entirely in your browser. Your address, amount, and label stay on your device. There are no server requests involved.

### What Bitcoin wallets can scan these QR codes?
Any wallet that supports BIP-21 works here, which includes Coinbase Wallet, Trust Wallet, BlueWallet, Electrum, Exodus, Muun, and most hardware wallet companion apps. BIP-21 has been the standard for over a decade. If a wallet supports sending Bitcoin at all, it almost certainly handles this format.

### Should I include a BTC amount?
For a public donation address, skip it. People can send whatever they want, and a fixed amount field would put some donors off. For an invoice or a specific payment request, always include the amount. An ambiguous invoice is annoying for both sides.

### Can I use this for Ethereum, Litecoin, or other coins?
No. This tool encodes BIP-21 Bitcoin URIs only. Ethereum uses EIP-681, Litecoin has its own URI scheme. Scanning a Bitcoin QR code with an Ethereum wallet will either error out or decode garbage. Use a coin-specific generator for anything other than Bitcoin.

### Is a Bitcoin QR code permanent?
The QR code encodes whatever address you enter at the time you generate it. Bitcoin addresses do not expire, so a static address stays valid indefinitely. That said, generating a fresh receiving address for each transaction is good practice for privacy. Reusing one address lets anyone trace all incoming payments to it on the public blockchain.

### What file format should I use for printing?
SVG for anything that needs to scale: posters, banners, signage. PNG at 512px for invoices, business cards, and standard print materials. Do not use JPEG. JPEG compression blurs the sharp edges of the QR pattern and that is the most common reason scanners fail on printed codes.

### Why would a scanner fail to read the QR code?
Three things cause most failures: the code is printed too small, the contrast between the QR and background is too low, or JPEG compression has degraded the edges. Print at 512px or larger, keep the pattern dark on a white background, and always export as PNG or SVG.

### What is error correction and does it matter here?
QR codes have a built-in error correction system that lets them be scanned even when part of the pattern is damaged, dirty, or obscured. There are four levels (L, M, Q, and H) with H tolerating up to 30% damage. This tool generates codes at a level suitable for standard use. If you are printing on a surface that might get scratched or partially covered (a sticker, a product label, outdoor signage), higher error correction gives you more tolerance. For clean digital and print uses, the default is fine.

### What is the difference between a legacy Bitcoin address and a Bech32 address?
Legacy addresses (P2PKH) start with `1` and run 25-34 characters. Pay-to-script-hash (P2SH) addresses start with `3`. Native SegWit (Bech32) addresses start with `bc1` and run 42-62 characters. This tool generates a valid BIP-21 QR code for all three formats. If you are not sure which type your wallet uses, paste the address and the tool will encode it correctly regardless.