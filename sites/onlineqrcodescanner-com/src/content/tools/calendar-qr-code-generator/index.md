---
title: "Calendar Event QR Code Generator"
seoTitle: "Free Calendar Event QR Code Generator Online"
description: "Create a QR code that adds an event directly to Google Calendar, Apple Calendar, or Outlook when scanned. Set the title, date, time, location, and description."
shortDescription: "Generate a QR code that adds an event straight to any calendar app"
category: "QR Generator"
tags: ["qr-generator", "calendar-qr", "generator"]
icon: "CalendarDays"
publishedAt: "2026-07-11T20:59:25Z"
updatedAt: "2026-07-11T20:59:25Z"
---

## What is a calendar event QR code?

A calendar QR code contains a complete iCal event record. When someone scans it, their phone reads the event details and offers to add them to the default calendar app.

The format underneath is called VEVENT, part of the iCalendar standard (RFC 5545). It is the same format used by `.ics` files you get from Eventbrite or Meetup when you click "Add to calendar." The QR code just packages that text visually. Google Calendar, Apple Calendar, and Outlook all handle it.

This is most useful when you need people to save an event without relying on them to find a link later or remember to add it manually. Print the QR on an invitation, a poster, or a conference badge. Just Scan the qr code once and then event saved in your calander.

## How to create a calendar QR code

Fill in the event title and start date. Those two fields are the minimum required. Everything else is optional, but the more you include the more useful the saved event is.

The title is what appears in the calendar app. Keep it specific. "Workshop" is less useful than "Product Design Workshop - Building B."

For start and end times, use the 24-hour inputs. If your event runs all day (a holiday, a deadline, a multi-day conference), toggle "All-day event" and the tool switches to date-only encoding. Calendar apps display these differently, so the toggle matters.

The location field accepts any text. A physical address, a room number, a video call URL. Whatever you type shows up in the calendar entry, and on mobile most calendar apps will turn addresses into tappable map links automatically.

The description field is where you can add anything extra — agenda items, parking instructions, a Zoom link backup. It appears in the event detail view.

Once everything looks right in the iCal preview, customize the QR colors and download. SVG for print, PNG for anything digital.

## Key Features

- Full iCal VEVENT format (RFC 5545), compatible with Google Calendar, Apple Calendar, and Outlook
- All-day event toggle for holidays, deadlines, and multi-day events
- Start date, start time, end date, and end time fields
- Optional location field (accepts addresses, room numbers, or meeting URLs)
- Optional description field for agenda and extra details
- Live iCal string preview before downloading
- Custom QR foreground and background colors with preset swatches and a hex color picker
- Export as PNG (128px to 1600px), WEBP, or SVG for print and digital use
- All generation happens in your browser, event data is never sent to a server

## Does it work on iPhones?

Yes. When the Camera app on iOS reads a QR code containing a VEVENT string, it recognises the format and offers "Add to Calendar" directly in the viewfinder banner. Tap it, confirm the event details in the preview, tap Add. The event goes into Apple Calendar.

If you also use Google Calendar on iOS, you may get a choice of which app to add it to. That depends on how the user's phone is configured.

One note: some third-party QR scanner apps on iOS may not handle VEVENT encoding correctly. The built-in Camera app does. So the experience is most reliable for users who scan with the stock Camera rather than a third-party scanner.

## Does it work on Android?

Yes, and the flow is similar. The built-in Camera app or Google Lens reads the QR, detects the VEVENT content, and shows a prompt to add the event. Tapping it opens Google Calendar with the event pre-filled for confirmation. On Android devices where Google Calendar is not the default, the system passes the iCal data to whatever calendar app is set as default.

Older Android versions (pre-9) may not handle VEVENT scanning natively in the Camera app. Users on those devices can still use any QR scanner app that exports to `.ics` format.

## Where calendar QR codes are actually useful

Conferences and meetups are the most common case. Put the QR on the session schedule, the welcome slide, or the badge. Attendees scan the sessions they want to attend and have them in their calendar without typing anything. For a full-day conference with ten sessions, this saves a lot of friction.

Event invitations sent as physical mail or printed cards. A QR code on a wedding invitation, a corporate dinner notice, or a gallery opening lets guests save the event with one scan rather than hunting for a "save the date" digital version.

Venue signage for recurring events. A workshop that runs every Tuesday at 7pm can have a QR code on a poster that always encodes the next occurrence. Swap the QR when the date changes.

Trade show booths and product launches. Staff can print a QR that adds a product demo or follow-up meeting to a visitor's calendar on the spot, while the conversation is still fresh.

Internal office communications. A QR on a printed meeting room booking notice or a kitchen noticeboard that adds the all-hands meeting directly to whoever scans it.

## The iCal format and why it matters

The iCalendar format has been around since 1998. It is genuinely ubiquitous: every calendar app, every booking system, every scheduling tool that claims to be compatible with anything else supports it. A VEVENT encoded in a QR code will work with the same tools that read a `.ics` file attachment.

The encoded format looks like this:

```
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20261215T140000
DTEND:20261215T150000
SUMMARY:Product Design Workshop
LOCATION:Building B\, Room 204
DESCRIPTION:Agenda sent separately
END:VEVENT
END:VCALENDAR
```

This tool follows RFC 5545 line folding (lines over 75 characters are folded with a space-prefixed continuation) and proper text escaping (commas, semicolons, and backslashes are escaped as required by the spec). Both of those details matter for compatibility with strict calendar parsers.

## What the all-day toggle does

When you enable all-day mode, the start and end values are encoded as `DATE` rather than `DATETIME`. Instead of `DTSTART:20261215T140000`, the iCal string contains `DTSTART;VALUE=DATE:20261215`. Calendar apps display these events differently — as full-day blocks at the top of the day view rather than as a timed event on the timeline.

Use all-day for holidays, out-of-office periods, multi-day workshops, deadlines, and any other event where a specific clock time does not apply.

## Privacy

All iCal generation happens in your browser. Event titles, dates, locations, and descriptions you enter are never sent to any server. The data exists in your browser tab for as long as the page is open, and is included in the QR code you download. Nothing is stored or logged.

## Related tools

- [QR Code Generator](/tools/qr-code-generator) - all QR types in one place: URL, text, Wi-Fi, vCard, GPS, and more
- [QR Code Scanner](/tools/qr-code-scanner) - decode any QR code in your browser
- [vCard QR Code Generator](/tools/vcard-qr-code-generator) - share contact details by scan
- [GPS QR Code Generator](/tools/gps-qr-code-generator) - encode a map location into a QR code
- [Wi-Fi QR Code Generator](/tools/wifi-qr-code-generator) - let guests join your network without a password

## Frequently asked questions

### Which calendar apps support scanning a VEVENT QR code?

Google Calendar, Apple Calendar, and Microsoft Outlook all handle iCal VEVENT data. Most other calendar apps that support `.ics` file import will also work, since the encoded format is identical. The main variable is whether the QR scanner app on the device correctly recognises VEVENT content and hands it to the calendar system.

### Does it add the event without confirmation?

No. Every calendar app prompts the user to review and confirm before adding. The scan pre-fills the event fields; the user still taps "Add" or "Save" to confirm. This is standard behaviour and a deliberate design choice in both iOS and Android.

### Can I set a timezone?

This tool encodes times in local (floating) time without a timezone identifier, which means the calendar app treats the time as whatever local time the user's device is set to. For most uses (a meeting, a workshop, a dinner) that is fine. If you need to specify a fixed timezone (for example, a webinar that starts at 3pm Eastern regardless of where the attendee is), you would need to add a `TZID` parameter manually. The iCal preview shows the raw string, so advanced users can verify the output.

### Why does the QR code look more complex than a URL QR?

iCal strings are longer than a typical short URL. The more fields you fill in (location, description), the longer the string and the denser the QR code. Dense QR codes are still scannable but require the phone to be held steadier and at slightly closer range. For complex events with long descriptions, download at 400px or higher and print at a reasonable size.

### Can I encode a recurring event?

Recurring events require the `RRULE` property in iCal format. This tool generates single-occurrence events. For recurring events, the practical alternative is to create the recurring rule in your calendar app directly and share the event from there, which lets you leverage the full recurrence rule editor that calendar apps provide.

### How do I get the coordinates for the location field?

The location field accepts any text. You do not need coordinates. Type a street address, a building name, a room number, or a meeting link. If you want to include GPS coordinates in the location text, you can, but calendar apps will display them as text rather than auto-linking to a map (unlike a proper address). For precise location sharing, combine this tool with the [GPS QR Code Generator](/tools/gps-qr-code-generator) and print both QR codes.
