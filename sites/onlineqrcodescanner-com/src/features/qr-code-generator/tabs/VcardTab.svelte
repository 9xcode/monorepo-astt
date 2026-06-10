<script lang="ts">
  let { content = $bindable('') }: { content: string } = $props();

  // ── Basic Info ──────────────────────────────────────────────────────────────
  let firstName  = $state('');
  let lastName   = $state('');
  let nickname   = $state('');
  let prefix     = $state(''); // Mr. Mrs. Dr. etc (goes in N field prefix)

  // ── Professional ─────────────────────────────────────────────────────────────
  let org        = $state('');
  let jobTitle   = $state(''); // → TITLE property
  let department = $state('');

  // ── Phones ───────────────────────────────────────────────────────────────────
  let phoneMobile = $state('');
  let phoneWork   = $state('');
  let phoneHome   = $state('');

  // ── Emails ────────────────────────────────────────────────────────────────────
  let emailPersonal = $state('');
  let emailWork     = $state('');

  // ── Web & Social ─────────────────────────────────────────────────────────────
  let website  = $state('');
  let linkedin = $state('');

  // ── Address ──────────────────────────────────────────────────────────────────
  let street  = $state('');
  let city    = $state('');
  let addrState = $state('');
  let zip     = $state('');
  let country = $state('');

  // ── Personal ─────────────────────────────────────────────────────────────────
  let birthday = $state('');
  let note     = $state('');

  // ── vCard 3.0 RFC 2426 builder ───────────────────────────────────────────────

  /**
   * Escape special characters in vCard 3.0 property values.
   * RFC 2426 §5: backslash, comma, and semicolon must be escaped;
   * literal newlines inside a value become the two-char sequence \n.
   */
  function esc(v: string): string {
    return v
      .replace(/\\/g, '\\\\')   // backslash first
      .replace(/;/g,  '\\;')
      .replace(/,/g,  '\\,')
      .replace(/\r\n|\r|\n/g, '\\n');
  }

  /**
   * RFC 2426 §2.1.3 — fold lines longer than 75 octets.
   * Continuation lines begin with a single SPACE.
   * We fold on bytes, not chars (ASCII-safe; non-ASCII counted as multi-byte).
   */
  function fold(line: string): string {
    const LIMIT = 75;
    if (line.length <= LIMIT) return line;
    let out = '';
    let remaining = line;
    while (remaining.length > LIMIT) {
      out += remaining.slice(0, LIMIT) + '\r\n ';
      remaining = remaining.slice(LIMIT);
    }
    out += remaining;
    return out;
  }

  /** Add a folded line to the output array only when the value is non-empty. */
  function addLine(lines: string[], prop: string, value: string) {
    const v = value.trim();
    if (v) lines.push(fold(`${prop}:${v}`));
  }

  const computed = $derived.by((): string => {
    const fn = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fn) return '';

    // RFC 2426 §3.1.1 — N components: Family;Given;Additional;Prefix;Suffix
    const nField = [
      esc(lastName.trim()),
      esc(firstName.trim()),
      '',                       // Additional names (middle) — left empty
      esc(prefix.trim()),       // Honorific prefix (Mr., Dr., …)
      '',                       // Suffix
    ].join(';');

    const lines: string[] = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      fold(`FN:${esc(fn)}`),
      fold(`N:${nField}`),
    ];

    // NICKNAME is its own property — NOT a component of N
    if (nickname.trim()) addLine(lines, 'NICKNAME', esc(nickname.trim()));

    // Professional
    if (org.trim()) {
      // ORG: Company;Department (department is optional second component)
      const orgVal = department.trim()
        ? `${esc(org.trim())};${esc(department.trim())}`
        : esc(org.trim());
      lines.push(fold(`ORG:${orgVal}`));
    }
    // TITLE = job/position title (RFC 2426 §3.5.1)
    if (jobTitle.trim()) addLine(lines, 'TITLE', esc(jobTitle.trim()));

    // Phones
    if (phoneMobile.trim()) addLine(lines, 'TEL;TYPE=CELL,VOICE', phoneMobile.trim());
    if (phoneWork.trim())   addLine(lines, 'TEL;TYPE=WORK,VOICE', phoneWork.trim());
    if (phoneHome.trim())   addLine(lines, 'TEL;TYPE=HOME,VOICE', phoneHome.trim());

    // Emails
    if (emailPersonal.trim()) addLine(lines, 'EMAIL;TYPE=PREF,INTERNET', emailPersonal.trim());
    if (emailWork.trim())     addLine(lines, 'EMAIL;TYPE=WORK,INTERNET', emailWork.trim());

    // Web
    if (website.trim())  addLine(lines, 'URL', website.trim());
    if (linkedin.trim()) addLine(lines, 'URL;TYPE=LinkedIn', linkedin.trim());

    // Address — ADR: POBox;Extended;Street;City;State;Zip;Country
    const hasAddr = street.trim() || city.trim() || addrState.trim() || zip.trim() || country.trim();
    if (hasAddr) {
      const adr = [
        '',                      // P.O. Box
        '',                      // Extended address
        esc(street.trim()),
        esc(city.trim()),
        esc(addrState.trim()),
        zip.trim(),
        esc(country.trim()),
      ].join(';');
      lines.push(fold(`ADR;TYPE=HOME:${adr}`));
    }

    // Birthday — YYYYMMDD format (RFC 2426 §3.6.5)
    if (birthday.trim()) addLine(lines, 'BDAY', birthday.replace(/-/g, ''));

    // Note
    if (note.trim()) addLine(lines, 'NOTE', esc(note.trim()));

    lines.push('END:VCARD');

    // RFC 2426 §2.4.2 — content lines MUST end with CRLF
    return lines.join('\r\n');
  });

  $effect(() => { content = computed; });

  const I  = 'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200';
  const TA = I + ' resize-none';
  const L  = 'block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5';
  const SH = 'text-sm font-semibold text-foreground pb-2 border-b border-border/40 mb-3';
</script>

<div class="space-y-6">

  <!-- Basic Info -->
  <div>
    <h4 class={SH}>Personal Info</h4>
    <div class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label for="vc-title" class={L}>Prefix (Mr./Dr.)</label>
          <input id="vc-title" type="text" bind:value={prefix} placeholder="Dr." class={I} />
        </div>
        <div>
          <label for="vc-first" class={L}>First Name <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span></label>
          <input id="vc-first" type="text" bind:value={firstName} placeholder="Jane" class={I} />
        </div>
        <div>
          <label for="vc-last" class={L}>Last Name</label>
          <input id="vc-last" type="text" bind:value={lastName} placeholder="Doe" class={I} />
        </div>
      </div>
      <div>
        <label for="vc-nickname" class={L}>Nickname / Preferred Name</label>
        <input id="vc-nickname" type="text" bind:value={nickname} placeholder="Jay" class={I} />
      </div>
    </div>
  </div>

  <!-- Professional -->
  <div>
    <h4 class={SH}>Professional</h4>
    <div class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="vc-org" class={L}>Organization</label>
          <input id="vc-org" type="text" bind:value={org} placeholder="Acme Corp" class={I} />
        </div>
        <div>
          <label for="vc-dept" class={L}>Department</label>
          <input id="vc-dept" type="text" bind:value={department} placeholder="Engineering" class={I} />
        </div>
      </div>
      <div>
        <label for="vc-jobtitle" class={L}>Job Title</label>
        <input id="vc-jobtitle" type="text" bind:value={jobTitle} placeholder="Senior Developer" class={I} />
      </div>
    </div>
  </div>

  <!-- Contact -->
  <div>
    <h4 class={SH}>Phone Numbers</h4>
    <div class="space-y-3">
      <div>
        <label for="vc-mobile" class={L}>Mobile</label>
        <input id="vc-mobile" type="tel" bind:value={phoneMobile} placeholder="+1 555 000 0000" class={I + ' font-mono'} />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label for="vc-work-phone" class={L}>Work</label>
          <input id="vc-work-phone" type="tel" bind:value={phoneWork} placeholder="+1 555 111 1111" class={I + ' font-mono'} />
        </div>
        <div>
          <label for="vc-home-phone" class={L}>Home</label>
          <input id="vc-home-phone" type="tel" bind:value={phoneHome} placeholder="+1 555 222 2222" class={I + ' font-mono'} />
        </div>
      </div>
    </div>
  </div>

  <!-- Email -->
  <div>
    <h4 class={SH}>Email Addresses</h4>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label for="vc-email-personal" class={L}>Personal</label>
        <input id="vc-email-personal" type="email" bind:value={emailPersonal} placeholder="jane@gmail.com" class={I} />
      </div>
      <div>
        <label for="vc-email-work" class={L}>Work</label>
        <input id="vc-email-work" type="email" bind:value={emailWork} placeholder="jane@company.com" class={I} />
      </div>
    </div>
  </div>

  <!-- Web -->
  <div>
    <h4 class={SH}>Web & Social</h4>
    <div class="space-y-3">
      <div>
        <label for="vc-website" class={L}>Website</label>
        <input id="vc-website" type="url" bind:value={website} placeholder="https://janedoe.com" class={I} />
      </div>
      <div>
        <label for="vc-linkedin" class={L}>LinkedIn URL</label>
        <input id="vc-linkedin" type="url" bind:value={linkedin} placeholder="https://linkedin.com/in/janedoe" class={I} />
      </div>
    </div>
  </div>

  <!-- Address -->
  <div>
    <h4 class={SH}>Address</h4>
    <div class="space-y-3">
      <div>
        <label for="vc-street" class={L}>Street</label>
        <input id="vc-street" type="text" bind:value={street} placeholder="123 Main St" class={I} />
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="col-span-2 sm:col-span-1">
          <label for="vc-city" class={L}>City</label>
          <input id="vc-city" type="text" bind:value={city} placeholder="New York" class={I} />
        </div>
        <div>
          <label for="vc-state" class={L}>State</label>
          <input id="vc-state" type="text" bind:value={addrState} placeholder="NY" class={I} />
        </div>
        <div>
          <label for="vc-zip" class={L}>ZIP</label>
          <input id="vc-zip" type="text" bind:value={zip} placeholder="10001" class={I} />
        </div>
      </div>
      <div>
        <label for="vc-country" class={L}>Country</label>
        <input id="vc-country" type="text" bind:value={country} placeholder="United States" class={I} />
      </div>
    </div>
  </div>

  <!-- Personal -->
  <div>
    <h4 class={SH}>Additional</h4>
    <div class="space-y-3">
      <div>
        <label for="vc-birthday" class={L}>Birthday</label>
        <input id="vc-birthday" type="date" bind:value={birthday} class={I} />
      </div>
      <div>
        <label for="vc-note" class={L}>Note / Bio</label>
        <textarea id="vc-note" bind:value={note} rows={3} placeholder="A short bio or note…" class={TA}></textarea>
      </div>
    </div>
  </div>

</div>
