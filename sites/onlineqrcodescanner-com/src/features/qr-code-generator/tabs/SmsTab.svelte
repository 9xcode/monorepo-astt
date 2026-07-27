<script lang="ts">
  let { content = $bindable('') }: { content: string } = $props();

  let countryCode = $state('');
  let phone   = $state('');
  let message = $state('');

  function cleanPhone(cc: string, num: string): string {
    const raw = (cc + num).replace(/[^\d]/g, '');
    return raw ? '+' + raw : '';
  }

  $effect(() => {
    if (/[^\d+]/.test(countryCode)) {
      countryCode = countryCode.replace(/[^\d+]/g, '');
    }
    if (/[^\d\s-]/.test(phone)) {
      phone = phone.replace(/[^\d\s-]/g, '');
    }
  });

  const computed = $derived.by(() => {
    if (!countryCode.replace(/[^\d]/g, '') || !phone.replace(/[^\d]/g, '')) return '';
    const cleaned = cleanPhone(countryCode, phone);
    if (cleaned.length < 7) return '';
    const msg = message.trim();
    return `sms:${cleaned}${msg ? '?body=' + encodeURIComponent(msg) : ''}`;
  });

  $effect(() => { content = computed; });

  const I  = 'px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200';
  const TA = 'w-full ' + I + ' resize-none font-sans';
  const L  = 'block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5';
</script>

<div class="space-y-4">
  <div>
    <label for="sms-phone" class={L}>
      Phone Number <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
    </label>
    <div class="flex gap-2">
      <input
        type="tel"
        bind:value={countryCode}
        placeholder="+1"
        class="{I} w-24 text-center font-mono tracking-wider"
      />
      <input
        id="sms-phone"
        type="tel"
        bind:value={phone}
        placeholder="555 000 0000"
        class="{I} flex-1 font-mono tracking-wider"
        autocomplete="tel"
      />
    </div>
    <p class="text-[11px] text-muted-foreground/60 mt-1.5">Include country code, e.g. +1 555 000 0000</p>
  </div>

  <div>
    <div class="flex items-center justify-between mb-1.5">
      <label for="sms-message" class={L} style="margin-bottom:0">Message (optional)</label>
      <span class="text-[10px] font-mono text-muted-foreground/50">{message.length}/160</span>
    </div>
    <textarea
      id="sms-message"
      bind:value={message}
      maxlength={160}
      rows={5}
      placeholder="Hi! Check out this link…"
      class={TA}
    ></textarea>
    <p class="text-[11px] text-muted-foreground/60 mt-1.5 leading-relaxed">
      The pre-filled message appears in the recipient's SMS app. Standard SMS is 160 characters.
    </p>
  </div>

  {#if computed}
    <div class="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Encoded as</p>
      <p class="text-xs text-muted-foreground break-all font-mono leading-relaxed">{computed}</p>
    </div>
  {/if}
</div>
