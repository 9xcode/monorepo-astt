<script lang="ts">
  let { content = $bindable('') }: { content: string } = $props();

  let address = $state('');
  let amount  = $state('');
  let label   = $state('');
  let message = $state('');

  const computed = $derived.by((): string => {
    const addr = address.trim();
    if (!addr) return '';
    const params: string[] = [];
    const amt = parseFloat(amount);
    if (!isNaN(amt) && amt > 0) params.push(`amount=${amt}`);
    if (label.trim())   params.push(`label=${encodeURIComponent(label.trim())}`);
    if (message.trim()) params.push(`message=${encodeURIComponent(message.trim())}`);
    return `bitcoin:${addr}${params.length ? '?' + params.join('&') : ''}`;
  });

  $effect(() => { content = computed; });

  const I = 'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200';
  const L = 'block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5';
</script>

<div class="space-y-5">
  <!-- Info pill -->
  <div class="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
    <span class="text-lg shrink-0">₿</span>
    <p class="text-xs text-muted-foreground leading-relaxed">
      Generates a <strong class="text-foreground">BIP-21</strong> Bitcoin payment URI. Scanning opens a compatible wallet app pre-filled with the address and amount.
    </p>
  </div>

  <div>
    <label for="btc-address" class={L}>
      Bitcoin Address <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
    </label>
    <input
      id="btc-address"
      type="text"
      bind:value={address}
      placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf"
      class={I + ' font-mono text-xs tracking-tight'}
      autocomplete="off"
      spellcheck={false}
    />
    <p class="text-[11px] text-muted-foreground/60 mt-1.5">Legacy (1…), P2SH (3…), or Bech32 (bc1…) format supported.</p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label for="btc-amount" class={L}>Amount (BTC, optional)</label>
      <div class="relative">
        <input
          id="btc-amount"
          type="number"
          bind:value={amount}
          placeholder="0.001"
          min="0"
          step="any"
          class={I + ' pr-14 font-mono'}
        />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">BTC</span>
      </div>
    </div>
    <div>
      <label for="btc-label" class={L}>Label (optional)</label>
      <input id="btc-label" type="text" bind:value={label} placeholder="Donation" class={I} />
    </div>
  </div>

  <div>
    <label for="btc-message" class={L}>Message (optional)</label>
    <input id="btc-message" type="text" bind:value={message} placeholder="Thank you for your support!" class={I} />
  </div>

  {#if computed}
    <div class="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">BIP-21 URI</p>
      <p class="text-xs text-muted-foreground break-all font-mono leading-relaxed">{computed}</p>
    </div>
  {/if}
</div>
