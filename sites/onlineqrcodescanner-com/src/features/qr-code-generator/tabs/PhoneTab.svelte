<script lang="ts">
  let { content = $bindable('') }: { content: string } = $props();

  let phone = $state('');

  function cleanPhone(raw: string): string {
    // Keep +, digits, spaces, hyphens for display — strip to digits + leading + for tel:
    const stripped = raw.replace(/[^\d+]/g, '');
    return stripped.startsWith('+') ? stripped : stripped ? '+' + stripped : '';
  }

  const computed = $derived.by(() => {
    const cleaned = cleanPhone(phone.trim());
    return cleaned.length >= 7 ? `tel:${cleaned}` : '';
  });

  $effect(() => { content = computed; });

  const I = 'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200 font-mono tracking-wider';
  const L = 'block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5';
</script>

<div class="space-y-5">
  <div>
    <label for="phone-input" class={L}>
      Phone Number <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
    </label>
    <input
      id="phone-input"
      type="tel"
      bind:value={phone}
      placeholder="+1 555 000 0000"
      class={I}
      autocomplete="tel"
    />
    <p class="text-[11px] text-muted-foreground/60 mt-1.5 leading-relaxed">
      Include country code (e.g. +1 for US, +44 for UK). Scanning will prompt a phone call.
    </p>
  </div>

  <!-- Quick country codes -->
  <div class="space-y-2">
    <span class="text-xs text-muted-foreground font-medium">Common country codes:</span>
    <div class="flex flex-wrap gap-2">
      {#each [['+1', '🇺🇸 US/CA'], ['+44', '🇬🇧 UK'], ['+91', '🇮🇳 IN'], ['+61', '🇦🇺 AU'], ['+49', '🇩🇪 DE']] as [code, label] (code)}
        <button
          onclick={() => { if (!phone.startsWith(code!)) phone = code! + ' '; }}
          class="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/80 text-xs text-muted-foreground hover:border-emerald-500/50 hover:text-foreground transition-all duration-200 active:scale-95"
        >
          <span class="font-mono font-semibold">{code}</span>
          <span class="opacity-60">{label}</span>
        </button>
      {/each}
    </div>
  </div>

  {#if computed}
    <div class="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
      <span class="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
      <p class="text-xs text-muted-foreground font-mono break-all">{computed}</p>
    </div>
  {/if}
</div>
