<script lang="ts">
  import { cn } from '$lib/utils';
  let { content = $bindable('') }: { content: string } = $props();

  let lat        = $state('');
  let lng        = $state('');
  let label      = $state('');
  let locating   = $state(false);
  let locError   = $state('');

  // ── Validation helpers ──────────────────────────────────────────────────────
  function isValidLat(v: string) {
    const n = parseFloat(v);
    return !isNaN(n) && n >= -90 && n <= 90;
  }
  function isValidLng(v: string) {
    const n = parseFloat(v);
    return !isNaN(n) && n >= -180 && n <= 180;
  }

  // ── Derived geo: URI ────────────────────────────────────────────────────────
  const computed = $derived.by((): string => {
    if (!lat.trim() || !lng.trim()) return '';
    if (!isValidLat(lat) || !isValidLng(lng)) return '';
    const coords = `${parseFloat(lat).toFixed(6)},${parseFloat(lng).toFixed(6)}`;
    const q      = label.trim() ? `?q=${encodeURIComponent(label.trim())}` : '';
    return `geo:${coords}${q}`;
  });

  $effect(() => { content = computed; });

  // ── Geolocation API ─────────────────────────────────────────────────────────
  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      locError = 'Geolocation is not supported by your browser.';
      return;
    }
    locating = true;
    locError  = '';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lat      = pos.coords.latitude.toFixed(6);
        lng      = pos.coords.longitude.toFixed(6);
        locating = false;
      },
      (err) => {
        locating = false;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            locError = 'Location access denied. Allow it in your browser settings and try again.';
            break;
          case err.POSITION_UNAVAILABLE:
            locError = 'Location unavailable. Enter coordinates manually.';
            break;
          case err.TIMEOUT:
            locError = 'Location request timed out. Try again.';
            break;
          default:
            locError = 'Could not get location. Enter coordinates manually.';
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  const I = 'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200 font-mono';
  const L = 'block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5';
</script>

<div class="space-y-5">

  <!-- Info pill -->
  <div class="flex items-center gap-2.5 p-3 rounded-xl bg-sky-500/10 border border-sky-500/25">
    <span class="text-xl shrink-0">📍</span>
    <p class="text-xs text-muted-foreground leading-relaxed">
      Generates a <strong class="text-foreground">geo: URI</strong> that opens directly in Google Maps, Apple Maps, and other map apps when scanned.
    </p>
  </div>

  <!-- Use My Location button -->
  <button
    onclick={useMyLocation}
    disabled={locating}
    type="button"
    class={cn(
      "w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
      locating
        ? "border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10 cursor-wait"
        : "border-border/80 bg-card text-foreground hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-500/5"
    )}
  >
    {#if locating}
      <!-- Spinner -->
      <svg class="w-4 h-4 animate-spin shrink-0 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      Detecting location…
    {:else}
      <svg class="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
      Use My Current Location
    {/if}
  </button>

  {#if locError}
    <p class="text-xs text-destructive bg-destructive/5 border border-destructive/15 px-3 py-2 rounded-lg">{locError}</p>
  {/if}

  <!-- Divider -->
  <div class="flex items-center gap-3">
    <div class="flex-1 h-px bg-border/60"></div>
    <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/50">or enter manually</span>
    <div class="flex-1 h-px bg-border/60"></div>
  </div>

  <!-- Lat / Lng row -->
  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="gps-lat" class={L}>
        Latitude <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
      </label>
      <input
        id="gps-lat"
        type="number"
        bind:value={lat}
        placeholder="28.613939"
        min="-90"
        max="90"
        step="any"
        class={cn(I, lat && !isValidLat(lat) ? 'border-destructive/60 focus:ring-destructive/30 focus:border-destructive/50' : '')}
        spellcheck={false}
        autocomplete="off"
      />
      <p class="text-[10px] text-muted-foreground/50 mt-1">−90 to 90</p>
    </div>
    <div>
      <label for="gps-lng" class={L}>
        Longitude <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
      </label>
      <input
        id="gps-lng"
        type="number"
        bind:value={lng}
        placeholder="77.209023"
        min="-180"
        max="180"
        step="any"
        class={cn(I, lng && !isValidLng(lng) ? 'border-destructive/60 focus:ring-destructive/30 focus:border-destructive/50' : '')}
        spellcheck={false}
        autocomplete="off"
      />
      <p class="text-[10px] text-muted-foreground/50 mt-1">−180 to 180</p>
    </div>
  </div>

  <!-- Validation hints -->
  {#if lat && !isValidLat(lat)}
    <p class="text-xs text-destructive -mt-3">Latitude must be between −90 and 90.</p>
  {/if}
  {#if lng && !isValidLng(lng)}
    <p class="text-xs text-destructive -mt-3">Longitude must be between −180 and 180.</p>
  {/if}

  <!-- Label (optional) -->
  <div>
    <label for="gps-label" class={L}>Location Label <span class="text-muted-foreground/50 normal-case tracking-normal font-normal ml-0.5">(optional)</span></label>
    <input
      id="gps-label"
      type="text"
      bind:value={label}
      placeholder="India Gate, New Delhi"
      class="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200"
      spellcheck={false}
    />
    <p class="text-[11px] text-muted-foreground/60 mt-1.5">
      Shown as a map pin label when scanned. Helps identify the place.
    </p>
  </div>

  <!-- Preview of geo: URI -->
  {#if computed}
    <div class="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Geo URI</p>
      <p class="text-xs text-muted-foreground break-all font-mono leading-relaxed">{computed}</p>
    </div>
  {/if}

</div>
