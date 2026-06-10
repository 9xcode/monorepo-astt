<script lang="ts">
  import { cn } from '$lib/utils';
  let { content = $bindable('') }: { content: string } = $props();

  type Encryption = 'WPA' | 'WEP' | 'nopass';

  let ssid       = $state('');
  let password   = $state('');
  let encryption = $state<Encryption>('WPA');
  let hidden     = $state(false);
  let showPass   = $state(false);

  function esc(v: string) {
    // WiFi special chars: \, ;, ,, ", :
    return v.replace(/([\\;,":])/g, c => `\\${c}`);
  }

  const computed = $derived.by((): string => {
    const s = ssid.trim();
    if (!s) return '';
    const e = encryption === 'nopass' ? 'nopass' : encryption;
    const p = esc(password);
    const h = hidden ? 'true' : 'false';
    return `WIFI:T:${e};S:${esc(s)};P:${p};H:${h};;`;
  });

  $effect(() => { content = computed; });

  const I = 'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200';
  const L = 'block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5';
</script>

<div class="space-y-5">
  <!-- Network Name -->
  <div>
    <label for="wifi-ssid" class={L}>
      Network Name (SSID) <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
    </label>
    <input id="wifi-ssid" type="text" bind:value={ssid} placeholder="MyHomeNetwork" class={I} spellcheck={false} />
  </div>

  <!-- Security Type -->
  <div>
    <span class={L}>Security Type</span>
    <div class="grid grid-cols-3 gap-2">
      {#each [['WPA', 'WPA/WPA2', 'Most secure, recommended'], ['WEP', 'WEP', 'Legacy, less secure'], ['nopass', 'None', 'Open network']] as [val, label, desc] (val)}
        <button
          onclick={() => { encryption = val as Encryption; if (val === 'nopass') password = ''; }}
          class={cn(
            "flex flex-col items-center py-3 px-2 rounded-xl border text-sm font-medium transition-all duration-200",
            encryption === val
              ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
              : "border-border/80 text-muted-foreground hover:border-emerald-500/40 hover:text-foreground bg-card"
          )}
        >
          <span class="font-bold text-sm">{label}</span>
          <span class={cn("text-[9px] mt-0.5", encryption === val ? "text-emerald-100" : "opacity-60")}>{desc}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Password -->
  {#if encryption !== 'nopass'}
    <div>
      <label for="wifi-password" class={L}>Password</label>
      <div class="relative">
        <input
          id="wifi-password"
          type={showPass ? 'text' : 'password'}
          bind:value={password}
          placeholder="Network password"
          class={I + ' pr-12'}
          autocomplete="off"
          spellcheck={false}
        />
        <button
          onclick={() => showPass = !showPass}
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-medium transition-colors px-1"
        >
          {showPass ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  {/if}

  <!-- Hidden Network -->
  <div class="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-card">
    <div>
      <p class="text-sm font-medium text-foreground">Hidden Network</p>
      <p class="text-xs text-muted-foreground mt-0.5">Enable if your network SSID is not broadcast</p>
    </div>
    <button
      onclick={() => hidden = !hidden}
      type="button"
      class={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none shrink-0",
        hidden ? "bg-emerald-600" : "bg-muted-foreground/30"
      )}
      role="switch"
      aria-checked={hidden}
      aria-label="Toggle hidden network"
    >
      <span class={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
        hidden ? "translate-x-6" : "translate-x-1"
      )}></span>
    </button>
  </div>

  {#if computed}
    <div class="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">WiFi QR String</p>
      <p class="text-xs text-muted-foreground break-all font-mono leading-relaxed">{computed}</p>
    </div>
  {/if}
</div>
