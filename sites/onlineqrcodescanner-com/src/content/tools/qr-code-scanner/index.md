---
title: "Online QR Code Scanner"
seoTitle: "Free Online QR Code Scanner – Scan QR Codes Instantly from Camera or Image"
description: "Scan QR codes instantly from your webcam, camera, or by uploading an image. A secure, free, and 100% private QR code reader that runs entirely in your browser."
shortDescription: "Scan QR codes instantly from your camera or image uploads"
category: "QR Scanner"
tags: ["qr-scanner", "scanner", "reader"]
icon: "Camera"
featured: true
order: 1
---

## Instant Client-Side QR Code Scanning

[Direct Answer]: An Online QR Code Scanner is a web-based utility that uses your device's camera or uploaded images to detect and decode QR codes instantly. By processing everything locally in your browser, it allows you to read QR codes containing URLs, contact details, Wi-Fi networks, and text without sending any data to external servers, ensuring complete privacy.

Whether you need to quickly open a link from a printed flyer, read a menu QR code, or inspect the contents of an image file on your desktop, our scanner works instantly on any device — mobile, tablet, or desktop.

---

## Supported Format

| Format | Notes |
|--------|-------|
| **QR Code** | All standard QR codes (Model 1, Model 2, Micro QR, all 40 versions). Decoded using a dual-engine approach: native `BarcodeDetector` API with `qr_code` format (Chrome, Edge, Samsung Internet — hardware-accelerated) with automatic fallback to the `jsQR` JavaScript library with `inversionAttempts: 'attemptBoth'` (Firefox, Safari, every other browser). |

> **This is a focused QR-only tool.** For scanning 1D/2D barcodes (EAN-13, Code 128, PDF 417, Data Matrix, Aztec, etc.) use the dedicated [Barcode Scanner](/tools/barcode-scanner).

---

## QR Code Data Types Recognised

The scanner automatically identifies the type of content encoded and provides relevant actions:

| Data Type | Example QR Content | Action |
|-----------|-------------------|--------|
| **Website URL** | `https://example.com` | Open link in new tab |
| **Wi-Fi Network** | `WIFI:S:MyNet;T:WPA;P:pass;;` | Shows SSID, password, security type |
| **Contact / vCard** | `BEGIN:VCARD…END:VCARD` | Displays name, phone, email — save as .vcf |
| **Email Address** | `mailto:user@example.com` | Compose email |
| **Phone Number** | `tel:+1234567890` | Initiate call |
| **SMS Message** | `smsto:+1234567890:Hello` | Pre-fills SMS |
| **WhatsApp Chat** | `https://wa.me/1234567890` | Open WhatsApp |
| **Bitcoin Address** | `bitcoin:1A1zP1eP5Q…` | Displays wallet address |
| **Plain Text** | Any alphanumeric string | Displays raw decoded text |

---

## Key Features

- **Dual Decoding Engine** — `BarcodeDetector` (native, hardware-accelerated) → `jsQR` (pure JS fallback). Every modern browser is covered, including Firefox and Safari.
- **Inverted QR Support** — `jsQR` is configured with `inversionAttempts: 'attemptBoth'`, so dark-on-light and light-on-dark QR codes are both handled automatically.
- **Multi-Scale Image Scanning** — For uploaded images, the tool attempts multiple resolutions and applies contrast enhancement to decode dense or low-quality QR codes.
- **Smart Result Parsing** — Automatically identifies URLs, Wi-Fi configs, vCards, emails, phone numbers, SMS, WhatsApp, and Bitcoin addresses from the decoded string.
- **100% Private** — No camera frames, images, or decoded text ever leave your device.
- **Offline Capable** — Works without an internet connection once loaded.

---

## How to Scan QR Codes Online

### Scanning Using Your Camera

1. Click **"Allow Camera Permission"** when prompted.
2. Align the QR code inside the camera preview frame.
3. The scanner detects and decodes automatically — no button press needed.

### Scanning from an Image File

1. Switch to the **"Upload Image"** tab.
2. Drag and drop your QR code image, or click to browse (PNG, JPG, JPEG, WebP).
3. The tool instantly decodes the QR code and displays the result.

---

## Frequently Asked Questions (FAQ)

### Does this scanner support all QR code versions?
**Yes.** The tool supports all standard QR Code variants — from Version 1 (21×21 modules) up to Version 40 (177×177 modules), including Micro QR codes. Both `BarcodeDetector` and `jsQR` handle the full QR Code specification.

### Can it scan inverted or dark-background QR codes?
**Yes.** `jsQR` is configured with `inversionAttempts: 'attemptBoth'`, which tries both normal and inverted colour interpretation on every frame and image, so light-on-dark QR codes work automatically.

### Is my camera feed recorded?
**No.** Your camera feed is processed frame-by-frame in real time entirely inside your browser. No video frames, images, or decoded text are ever saved, stored, or transmitted to any server.

### Why won't my camera start?
Make sure you have granted camera permissions in your browser. On mobile, ensure no other app (like the native camera app) is currently using the camera. If you are on plain HTTP (not HTTPS), the browser will block camera access — use the upload tab instead.

### Can I scan barcodes (EAN-13, Code 128, etc.) with this tool?
No — this tool is QR Code only. For barcodes, use our dedicated [Barcode Scanner](/tools/barcode-scanner) which supports 16+ formats across 1D and 2D symbologies.
