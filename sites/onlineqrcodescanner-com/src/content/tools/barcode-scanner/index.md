---
title: "Online Barcode Scanner"
seoTitle: "Free Online Barcode Scanner | Scan All Formats"
description: "Scan any barcode format online — EAN-13, UPC-A, Code 128, QR Code, PDF 417, Data Matrix, Aztec, and more. Free, private, and 100% browser-based. No app needed."
shortDescription: "Scan all barcode formats instantly from your camera or image"
category: "Barcode Tools"
tags: ["barcode-scanner", "scanner", "reader"]
icon: "ScanBarcode"
featured: true
order: 3
---

## Online Barcode Scanner – All Formats, Zero Tracking

[Direct Answer]: An Online Barcode Scanner is a browser-based utility that uses your device's camera or an uploaded image to detect and decode barcodes. All processing happens locally in your browser — nothing is uploaded to any server.

---

## Supported Formats

The barcode scanner uses two decode engines in sequence: the **native browser `BarcodeDetector` API** (Chrome, Edge, Samsung Internet — hardware-accelerated, queries all supported formats via `getSupportedFormats()`) with automatic fallback to **`@zxing/browser` `BrowserMultiFormatReader`** (Firefox, Safari, and all other environments including future Capacitor mobile builds).

The following 17 formats are recognised and named by the scanner:

### 1D Linear Barcodes

| Format | Key (as detected) | Common Use |
|--------|------------------|-----------|
| **Code 128** | `CODE_128` | Retail shipping, logistics, healthcare labels |
| **Code 39** | `CODE_39` | Industrial, military, automotive parts |
| **Code 93** | `CODE_93` | Canada Post, inventory management |
| **Codabar** | `CODABAR` | Library systems, blood banks, medical |
| **EAN-13** | `EAN_13` | European and international product labels |
| **EAN-8** | `EAN_8` | Small product packaging labels |
| **UPC-A** | `UPC_A` | US retail and grocery products |
| **UPC-E** | `UPC_E` | Compact US retail (small packages) |
| **ITF** | `ITF` | Shipping cartons, outer packaging (ITF-14) |
| **RSS-14 (GS1 DataBar)** | `RSS_14` | Produce, coupons, fresh food |
| **RSS Expanded** | `RSS_EXPANDED` | Variable-weight items, fresh food |

### 2D Matrix & Stacked Barcodes

| Format | Key (as detected) | Common Use |
|--------|------------------|-----------|
| **QR Code** | `QR_CODE` | URLs, contacts, payments, Wi-Fi |
| **Data Matrix** | `DATA_MATRIX` | PCB, pharmaceutical, small components |
| **PDF 417** | `PDF_417` | Boarding passes, driver's licenses, ID cards |
| **Aztec** | `AZTEC` | Transit tickets, airline boarding passes |
| **MaxiCode** | `MAXICODE` | UPS parcel tracking labels |
| **UPC/EAN Extension** | `UPC_EAN_EXTENSION` | Add-on digits on UPC/EAN codes |

> **Note on browser-native BarcodeDetector:** Chrome/Edge query `BarcodeDetector.getSupportedFormats()` at runtime and pass all available formats. The actual set may be larger on those browsers (e.g., some Chromium builds support additional formats). The 17 formats above represent the full set handled by `@zxing/browser` and are guaranteed to work across all browsers.

---

## How to Scan a Barcode

### Scanning with Your Camera

1. Click **"Allow Camera Permission"** when prompted.
2. Point your camera at the barcode — the scanner detects it automatically.
3. The decoded value and barcode format (e.g., "EAN-13") appear in the results panel.

### Scanning from an Image File

1. Switch to the **"Upload Image"** tab.
2. Drag and drop a barcode image (PNG, JPG, JPEG, WebP) or click to browse.
3. The tool decodes the barcode and identifies the format instantly.

---

## Key Features

- **Dual Decoding Engine** — `BarcodeDetector` (native, hardware-accelerated, all browser-supported formats) → `@zxing/browser` `BrowserMultiFormatReader` (cross-browser, cross-platform JS fallback)
- **Format Identification** — Shows the detected format name (e.g., "Code 128", "PDF 417") as a badge on every result
- **Cross-Platform** — Works on Chrome, Firefox, Safari, Edge, mobile browsers, and is compatible with future Capacitor native app builds
- **100% Private** — No camera frames, images, or decoded data ever leave your device
- **Open URL Action** — If the decoded barcode value is a URL, an "Open Link" button is shown automatically

---

## Frequently Asked Questions (FAQ)

### Which browsers support the barcode scanner?

All modern browsers are supported:
- **Chrome, Edge, Samsung Internet** — use the native `BarcodeDetector` API (hardware-accelerated, queries all browser-supported formats dynamically via `getSupportedFormats()`)
- **Firefox, Safari, and others** — use `@zxing/browser` `BrowserMultiFormatReader` as a pure-JS fallback covering all 17 formats listed above

### Can I scan Code 128 barcodes from product packaging?

Yes. Code 128 is one of the most common barcodes on retail, shipping, and healthcare labels, and is fully supported by both decoding engines.

### Can I scan EAN-13 barcodes from grocery products?

Yes. EAN-13, EAN-8, UPC-A, and UPC-E are all supported — these cover virtually every grocery and retail product sold globally.

### Can I scan PDF 417 barcodes from boarding passes or driver's licenses?

Yes. PDF 417 is the stacked 2D barcode format used on airline boarding passes, government IDs, and driver's licenses. The `@zxing/browser` engine specifically handles PDF 417 decoding in all browsers.

### Can I scan QR codes with the barcode scanner?

Yes. QR Code (`QR_CODE`) is one of the 17 supported formats. However, the dedicated [QR Code Scanner](/tools/qr-code-scanner) provides richer result parsing (Wi-Fi credentials, vCards, email, phone, etc.) for QR-specific data types.

### Is my camera feed recorded?

**No.** Video frames are processed locally in your browser, frame by frame. No image, camera stream, or decoded text is ever transmitted to any server.

### What does the decoded result mean?

For 1D barcodes (Code 128, EAN-13, UPC-A, etc.) the result is typically a numeric or alphanumeric product/serial/tracking identifier. For 2D codes (QR, Data Matrix, PDF 417) it may contain structured text, URLs, or encoded binary data.
