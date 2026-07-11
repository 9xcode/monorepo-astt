<script lang="ts">
  import { cn } from '$lib/utils';
  let { content = $bindable('') }: { content: string } = $props();

  // ── State ──────────────────────────────────────────────────────────────────────
  let title       = $state('');
  let startDate   = $state('');
  let startTime   = $state('');
  let endDate     = $state('');
  let endTime     = $state('');
  let location    = $state('');
  let description = $state('');
  let allDay      = $state(false);

  // ── iCal helpers ───────────────────────────────────────────────────────────────
  // Format a date + time string into iCal YYYYMMDDTHHMMSS (local, no UTC suffix)
  function toICal(date: string, time: string): string {
    if (!date) return '';
    const d = date.replace(/-/g, ''); // YYYYMMDD
    if (!time) return d;
    const t = time.replace(/:/g, '') + '00'; // HHMMSS
    return `${d}T${t}`;
  }

  // Fold long iCal lines at 75 chars per RFC 5545
  function foldLine(line: string): string {
    if (line.length <= 75) return line;
    const parts: string[] = [];
    parts.push(line.slice(0, 75));
    let i = 75;
    while (i < line.length) {
      parts.push(' ' + line.slice(i, i + 74));
      i += 74;
    }
    return parts.join('\r\n');
  }

  // Escape iCal text values (commas, semicolons, backslashes, newlines)
  function escText(v: string): string {
    return v
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  // Generate a simple UID for the event
  function uid(): string {
    return `${Date.now()}-oqcs@onlineqrcodescanner.com`;
  }

  // ── Derived iCal string ────────────────────────────────────────────────────────
  const computed = $derived.by((): string => {
    const t = title.trim();
    if (!t || !startDate) return '';

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Online QR Code Scanner//NONSGML//EN',
      'BEGIN:VEVENT',
      `UID:${uid()}`,
    ];

    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${startDate.replace(/-/g, '')}`);
      if (endDate) {
        lines.push(`DTEND;VALUE=DATE:${endDate.replace(/-/g, '')}`);
      }
    } else {
      const start = toICal(startDate, startTime);
      lines.push(`DTSTART:${start}`);
      if (endDate) {
        const end = toICal(endDate, endTime);
        lines.push(`DTEND:${end}`);
      }
    }

    lines.push(`SUMMARY:${escText(t)}`);
    if (location.trim()) lines.push(`LOCATION:${escText(location.trim())}`);
    if (description.trim()) lines.push(`DESCRIPTION:${escText(description.trim())}`);
    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');

    return lines.map(foldLine).join('\r\n');
  });

  $effect(() => { content = computed; });

  const I = 'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200';
  const L = 'block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5';
</script>

<div class="space-y-5">

  <!-- Info pill -->
  <div class="flex items-center gap-2.5 p-3 rounded-xl bg-violet-500/10 border border-violet-500/25">
    <span class="text-xl shrink-0">📅</span>
    <p class="text-xs text-muted-foreground leading-relaxed">
      Generates an <strong class="text-foreground">iCal VEVENT</strong> QR code. Scanning it adds the event directly to Google Calendar, Apple Calendar, or Outlook.
    </p>
  </div>

  <!-- Event Title -->
  <div>
    <label for="cal-title" class={L}>
      Event Title <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
    </label>
    <input
      id="cal-title"
      type="text"
      bind:value={title}
      placeholder="Team Meeting"
      class={I}
      spellcheck={false}
    />
  </div>

  <!-- All-day toggle -->
  <div class="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-card">
    <div>
      <p class="text-sm font-medium text-foreground">All-day event</p>
      <p class="text-xs text-muted-foreground mt-0.5">No specific start or end time</p>
    </div>
    <button
      onclick={() => allDay = !allDay}
      type="button"
      class={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none shrink-0",
        allDay ? "bg-emerald-600" : "bg-muted-foreground/30"
      )}
      role="switch"
      aria-checked={allDay}
      aria-label="Toggle all-day event"
    >
      <span class={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
        allDay ? "translate-x-6" : "translate-x-1"
      )}></span>
    </button>
  </div>

  <!-- Start Date / Time -->
  <div class="grid grid-cols-2 gap-3">
    <div>
      <label for="cal-start-date" class={L}>
        Start Date <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
      </label>
      <input
        id="cal-start-date"
        type="date"
        bind:value={startDate}
        class={I}
      />
    </div>
    {#if !allDay}
      <div>
        <label for="cal-start-time" class={L}>Start Time</label>
        <input
          id="cal-start-time"
          type="time"
          bind:value={startTime}
          class={I}
        />
      </div>
    {/if}
  </div>

  <!-- End Date / Time -->
  <div class="grid grid-cols-2 gap-3">
    <div>
      <label for="cal-end-date" class={L}>End Date</label>
      <input
        id="cal-end-date"
        type="date"
        bind:value={endDate}
        min={startDate || undefined}
        class={I}
      />
    </div>
    {#if !allDay}
      <div>
        <label for="cal-end-time" class={L}>End Time</label>
        <input
          id="cal-end-time"
          type="time"
          bind:value={endTime}
          class={I}
        />
      </div>
    {/if}
  </div>

  <!-- Location (optional) -->
  <div>
    <label for="cal-location" class={L}>Location <span class="text-muted-foreground/50 normal-case tracking-normal font-normal ml-0.5">(optional)</span></label>
    <input
      id="cal-location"
      type="text"
      bind:value={location}
      placeholder="Conference Room 3B or https://meet.example.com"
      class={I}
      spellcheck={false}
    />
  </div>

  <!-- Description (optional) -->
  <div>
    <label for="cal-desc" class={L}>Description <span class="text-muted-foreground/50 normal-case tracking-normal font-normal ml-0.5">(optional)</span></label>
    <textarea
      id="cal-desc"
      bind:value={description}
      placeholder="Agenda, notes, or any extra details..."
      rows={3}
      class={I + ' resize-none leading-relaxed'}
      spellcheck={false}
    ></textarea>
  </div>

  <!-- iCal preview -->
  {#if computed}
    <div class="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">iCal Event String</p>
      <pre class="text-xs text-muted-foreground break-all font-mono leading-relaxed whitespace-pre-wrap">{computed}</pre>
    </div>
  {/if}

</div>
