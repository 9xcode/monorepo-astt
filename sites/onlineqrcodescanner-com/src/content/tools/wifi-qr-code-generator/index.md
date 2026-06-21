---
title: "Wi-Fi QR Code Generator"
seoTitle: "Free Wi-Fi QR Code Generator Online | Create Wifi QR Code"
description: "Create a Wi-Fi QR code so guests can join your network by scanning, no password typing needed. Supports WPA/WPA2, WEP, open networks, and hidden SSIDs."
shortDescription: "Let guests connect to your Wi-Fi by scanning a QR code"
category: "QR Generator"
tags: ["qr-generator", "wifi-qr", "generator"]
icon: "Wifi"
---

## What is a Wi-Fi QR code?

A Wi-Fi QR code stores your network name (SSID), password, and security type in a standard format. When someone scans it with a smartphone, the phone reads those credentials and prompts them to join the network. They tap Connect, and they are on.

The encoded format looks like this: `WIFI:T:WPA;S:YourNetwork;P:YourPassword;H:false;;`. That string is what gets packed into the QR pattern. The phone's camera app decodes it and handles the rest. It is a format that iOS and Android both understand natively, no third-party app required.

This is the QR code you see printed and laminated at café counters, hotel front desks, Airbnb listings, co-working spaces, and dental waiting rooms. The idea is simple: put the QR somewhere visible and guests join themselves.

## How to Use This Tool

1. **Enter your network name (SSID):** Type the exact name of your Wi-Fi network. This must match precisely, including any uppercase letters, spaces, or special characters. One wrong character and the QR code will not connect to the right network.
2. **Select the security type:** Choose WPA/WPA2 for almost all modern routers. Choose WEP only for old hardware that does not support WPA. Choose None if your network has no password (open network).
3. **Enter your password:** Type your network password. The field defaults to hidden. Use the Show button to verify you have it right before generating.
4. **Enable hidden network if needed:** If your router is set to not broadcast the SSID, toggle this on. It adds `H:true` to the encoded string, which tells the phone to connect to a non-broadcast network.
5. **Check the encoded string:** The tool shows the exact WiFi string it will encode. Verify your network name and password look right before downloading.
6. **Customize and export:** Pick a QR color, background color, and output size. Use SVG for printed signs and PNG for digital use. Download or copy to clipboard.

## Key Features

- Supports WPA/WPA2 (recommended), WEP (legacy), and open networks with no password
- Hidden network toggle for SSIDs that are not broadcast by the router
- Password visibility toggle so you can confirm the password before generating
- Live encoded WiFi string preview before you download
- Custom QR color and background color with preset swatches and a hex color picker
- Export as PNG (128px to 1600px), WEBP, or infinitely scalable SVG
- Copy to clipboard alongside the download button
- All processing happens in your browser, your network name and password are never sent to any server
- No account, no watermark, no usage limit

## Does the QR code work on iPhones?

Yes, and it has for a while. iOS 11 introduced native Wi-Fi QR code scanning through the built-in Camera app. You do not need a third-party QR scanner. You do not need Google Lens. You just open Camera, point it at the code, and a notification appears at the top of the screen asking if you want to join the network.

Tap the notification, tap Join, and you are connected. The phone handles everything.

The one thing that does not work automatically is hidden networks (SSIDs not broadcast by the router) on some older iOS versions. If someone scans a hidden-network QR on an older iPhone and nothing happens, they may need to go to Settings and join manually. On iOS 16 and later, hidden SSIDs work correctly.

**Sharing Wi-Fi from an iPhone to another iPhone** works differently. If you already have two iPhones near each other and one is connected, iOS will offer to share the password automatically. The Wi-Fi QR you create here is for sharing with anyone, whether they have an iPhone or Android, without needing your phone nearby.

## Does it work on Android?

Also yes. Android added native Wi-Fi QR code support in Android 10 through the built-in Camera app and Google Lens. On devices running Android 9 or earlier, users will need a QR scanner app.

To scan with Google Lens on Android: open the Camera app, tap the Lens icon in the viewfinder, point it at the QR code, and tap the Wi-Fi join prompt.

Some Android phones have a separate QR shortcut in the camera toolbar, which also works. The experience varies slightly depending on the manufacturer's camera app, but any modern Android device handles it.

## What about open networks (no password)?

If your network has no password, select None as the security type. The tool generates a QR code that still encodes the network name but omits the password field entirely. Scanning it prompts the user to join without a password.

This is common for public hotspots, community networks, and event Wi-Fi where everyone is supposed to connect freely. It is also useful for captive portal networks, where users are redirected to a login or terms page after connecting rather than needing a password at the network level.

## The hidden network option

Most routers broadcast the network name so phones can discover and list it. If you have configured your router to not broadcast the SSID, your network is "hidden." It will not appear in the list of available networks on a nearby device, but it still exists and accepts connections from devices that know the name.

When you enable the hidden network toggle in this tool, it adds `H:true` to the encoded Wi-Fi string. This signals to the phone that the network does not broadcast its SSID, so the device should not expect to see it in the network list. Without this flag, scanning might not produce a connection prompt for a hidden network.

Note that hiding your SSID is not a meaningful security measure. Anyone with network scanning tools can detect the network. But if you have set it up that way, the QR code handles it.

## Where to use a Wi-Fi QR code

**Printed sign at the entrance.** The most straightforward use. Print the QR code on A5 or A4, laminate it, and put it somewhere visible at the front desk, counter, or entrance. Guests scan when they arrive.

**Framed card on tables.** Restaurants, cafés, and hotels often print individual table cards with the QR. It is tidier than a laminated sheet and can include your branding and the network name as text alongside the code.

**Airbnb and short-term rentals.** A QR code in the welcome booklet means guests do not have to search for a written-out password. Put the QR on the same page as the door code and check-in instructions.

**Office meeting rooms.** Guest Wi-Fi for meeting rooms is a recurring friction point. A QR code card in each room or on a wall plate next to the screen eliminates "what's the guest network?" at the start of every external meeting.

**Events and conferences.** Event organizers print the venue Wi-Fi QR on lanyards, table placards, and signage. With hundreds of attendees, this cuts out a lot of password-sharing overhead.

**Home network for guests.** Instead of reading your password out loud or typing it into someone else's phone, you can keep a printed QR in a kitchen drawer. The password stays private as text, but guests can connect by scanning.

## What size and format to use

For printed signs, use SVG. It scales to any physical size without becoming pixelated. A 30cm x 30cm wall sign printed from SVG looks as sharp as a 5cm version.

For standard print sizes like A5 or business-card-sized table cards, PNG at 512px works. Go higher (800px or 1024px) if the card will be printed at a larger size or if you want extra margin for quality.

For digital use on screens, websites, or slide decks, PNG at 300px to 400px is fine.

Keep the minimum printed size at around 2.5cm x 2.5cm (roughly 1 inch). Smaller than that and older camera apps or lower-end phones may struggle, especially in anything less than ideal lighting.

## Is it safe to use a Wi-Fi QR code?

The QR code contains your password in encoded form. Anyone who scans it can join your network, just like anyone who reads your printed password can. The security model is the same as writing the password on a whiteboard: whoever sees the code gets access.

For a café or guest network, this is fine because access is the whole point. For a personal home network, put the sign somewhere only trusted people can reach it, or use a separate guest network so the main network stays isolated.

The password is not encrypted inside the QR. It is just encoded in the WiFi string format. Someone with a QR decoder can read the password directly. Keep this in mind if you post a photo of the QR code online.

This tool never stores or transmits your network name or password. Everything happens in your browser.

## Related tools on this site

- [QR Code Generator](/tools/qr-code-generator) - create QR codes for URLs, text, Wi-Fi, and vCard contacts in one place
- [QR Code Scanner](/tools/qr-code-scanner) - decode any QR code in your browser to see what it contains
- [vCard QR Code Generator](/tools/vcard-qr-code-generator) - share your full contact details by QR scan
- [URL QR Code Generator](/tools/url-qr-code-generator) - turn any website link into a scannable QR code
- [Barcode Scanner](/tools/barcode-scanner) - scan barcodes and QR codes using your camera

## Frequently Asked Questions (FAQ)

### Is my Wi-Fi password safe when I generate this QR code?

Yes. All encoding happens in your browser. Your network name and password are never sent to any server. The generated QR code image is also only stored locally in your browser session.

### Which security type should I select?

WPA/WPA2 for almost all modern routers. If your router is more than ten or fifteen years old and only supports WEP, select WEP. If your network has no password at all, select None. When in doubt, WPA/WPA2 is the right choice.

### What if I enter the wrong password?

The QR code will still generate, but when someone scans it, the connection will fail. The phone may show an "incorrect password" error or just fail to connect without much explanation. If guests report scanning problems, regenerate the QR with the correct password.

### Does the QR code work without the SSID being visible in the network list?

Yes, if you enable the Hidden Network toggle. This adds the correct flag to the encoded string so the phone knows to connect to a non-broadcast network. Without the toggle enabled, scanning a QR for a hidden network may not produce a connection prompt on some devices.

### How do I scan a Wi-Fi QR code on an iPhone?

Open the built-in Camera app (not a third-party app), point it at the QR code, and wait for a banner notification to appear at the top of the screen. Tap the banner, then tap Join. This works on iOS 11 and later without any additional apps.

### How do I scan a Wi-Fi QR code on Android?

On Android 10 and later, open the Camera app and point it at the QR code. A prompt will appear to join the network. On devices where the camera app does not recognize it, open Google Lens and point it at the code instead. The Join Wi-Fi option will appear in the Lens results.

### Can I generate a Wi-Fi QR code without a password?

Yes. Select None as the security type. The password field disappears and the tool generates a QR code for an open (passwordless) network. Anyone who scans it can join without entering anything.

### Can I use this for a guest network?

Yes. Just enter the guest network name and password instead of your main network credentials. This is actually recommended for public-facing QR codes since it keeps your main network separate from guest traffic.

### What is the best size to print a Wi-Fi QR code sign?

For a counter or table card meant to be scanned from 30 to 60cm away, a QR code printed at 5cm to 8cm works well. For a larger sign viewed from across the room, print larger. The general rule is the code should be at least 1/10th the distance from which it will be scanned. A 50cm viewing distance means the code needs to be at least 5cm.

### Will the QR code stop working if I change my Wi-Fi password?

Yes. The QR code encodes the password you enter when you generate it. If you change the password on your router, the old QR code will no longer connect anyone. You will need to generate a new QR code with the new password and replace any printed signs or cards.
