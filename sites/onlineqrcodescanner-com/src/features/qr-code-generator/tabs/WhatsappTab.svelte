<script lang="ts">
  let { content = $bindable('') }: { content: string } = $props();

  let phone   = $state('');
  let message = $state('');

  function cleanPhone(raw: string): string {
    // wa.me requires digits only, no leading +
    return raw.replace(/[^\d]/g, '');
  }

  const computed = $derived.by(() => {
    const cleaned = cleanPhone(phone.trim());
    if (cleaned.length < 7) return '';
    const msg = message.trim();
    return `https://wa.me/${cleaned}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
  });

  $effect(() => { content = computed; });

  const I  = 'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200';
  const TA = I + ' resize-none';
  const L  = 'block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5';
</script>

<div class="space-y-4">
  <!-- WhatsApp info pill -->
  <div class="flex items-center gap-2.5 p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/25">
    <span class="text-lg">💬</span>
    <p class="text-xs text-muted-foreground leading-relaxed">
      Scanning opens WhatsApp with this phone number and a pre-filled message.
    </p>
  </div>

  <div>
    <label for="wa-phone" class={L}>
      WhatsApp Number <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
    </label>
    <input
      id="wa-phone"
      type="tel"
      bind:value={phone}
      placeholder="1 555 000 0000 (with country code, no +)"
      class={I + ' font-mono tracking-wider'}
      autocomplete="tel"
    />
    <p class="text-[11px] text-muted-foreground/60 mt-1.5">
      Enter the full number with country code digits only — e.g. <span class="font-mono">15550000000</span> for a US number.
    </p>
  </div>

  <div>
    <div class="flex items-center justify-between mb-1.5">
      <label for="wa-message" class={L} style="margin-bottom:0">Pre-filled Message (optional)</label>
      <span class="text-[10px] font-mono text-muted-foreground/50">{message.length}/500</span>
    </div>
    <textarea
      id="wa-message"
      bind:value={message}
      maxlength={500}
      rows={5}
      placeholder="Hey! Check this out 👋"
      class={TA}
    ></textarea>
  </div>

  {#if computed}
    <div class="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Encoded as</p>
      <p class="text-xs text-muted-foreground break-all font-mono leading-relaxed">{computed}</p>
    </div>
  {/if}
</div>
