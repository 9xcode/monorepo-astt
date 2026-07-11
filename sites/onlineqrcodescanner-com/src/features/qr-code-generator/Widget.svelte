<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { cn } from "$lib/utils";

  import {
    Link, Type, Mail, Phone, MessageSquare, MessageCircle,
    Contact, Wifi, Bitcoin, Download, Copy, Check, RefreshCw, MapPin, CalendarDays,
  } from '@lucide/svelte';

  import UrlTab       from './tabs/UrlTab.svelte';
  import TextTab      from './tabs/TextTab.svelte';
  import EmailTab     from './tabs/EmailTab.svelte';
  import PhoneTab     from './tabs/PhoneTab.svelte';
  import SmsTab       from './tabs/SmsTab.svelte';
  import WhatsappTab  from './tabs/WhatsappTab.svelte';
  import VcardTab     from './tabs/VcardTab.svelte';
  import WifiTab      from './tabs/WifiTab.svelte';
  import BitcoinTab   from './tabs/BitcoinTab.svelte';
  import GpsTab       from './tabs/GpsTab.svelte';
  import CalendarTab  from './tabs/CalendarTab.svelte';

  // ─── Types ─────────────────────────────────────────────────────────────────────
  type TabId    = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'whatsapp' | 'vcard' | 'wifi' | 'bitcoin' | 'gps' | 'calendar';
  type ErrorLevel = 'L' | 'M' | 'Q' | 'H';
  type QrFormat   = 'png' | 'webp' | 'svg';

  // ─── Props ─────────────────────────────────────────────────────────────────────
  // initialMode: allows thin adapter wrappers (per-sub-tool Widget.svelte files) to
  // pre-select a specific tab when the widget mounts. Defaults to 'url' so the
  // hub page (qr-code-generator) behaviour is completely unchanged.
  let { initialMode = 'url' }: { initialMode?: TabId } = $props();

  // ─── Tabs ──────────────────────────────────────────────────────────────────────
  const tabs: { id: TabId; label: string; icon: any; hint: string }[] = [
    { id: 'url',      label: 'URL',      icon: Link,          hint: 'Any website link'      },
    { id: 'text',     label: 'Text',     icon: Type,          hint: 'Plain text or message' },
    { id: 'email',    label: 'E-mail',   icon: Mail,          hint: 'mailto: link'          },
    { id: 'phone',    label: 'Phone',    icon: Phone,         hint: 'tel: call link'        },
    { id: 'sms',      label: 'SMS',      icon: MessageSquare, hint: 'Text message'          },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, hint: 'wa.me link'            },
    { id: 'vcard',    label: 'vCard',    icon: Contact,       hint: 'Contact card'          },
    { id: 'wifi',     label: 'Wi-Fi',    icon: Wifi,          hint: 'Network credentials'   },
    { id: 'bitcoin',  label: 'Bitcoin',  icon: Bitcoin,       hint: 'BIP-21 payment URI'    },
    { id: 'gps',      label: 'GPS',      icon: MapPin,        hint: 'Geographic location'    },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays,  hint: 'Add to calendar event'  },
  ];

  // ─── State ─────────────────────────────────────────────────────────────────────
  // svelte-ignore state_referenced_locally
  let activeTab    = $state<TabId>(initialMode);
  let content      = $state('');
  let qrDataUrl    = $state('');   // PNG data URL (also used for SVG preview via data URI)
  let qrSvgString  = $state('');   // Raw SVG markup for download
  let isGenerating = $state(false);
  let isCopied     = $state(false);
  let errorMsg     = $state('');

  // ─── Customization ─────────────────────────────────────────────────────────────
  let qrSize   = $state(400);
  let qrFormat = $state<QrFormat>('png');
  let qrFgColor = $state('#000000');
  let qrBgColor = $state('#ffffff');

  // Size options (px) shown in the dropdown
  const sizeOptions = [
    { value: 128,  label: '128 px — Tiny'    },
    { value: 256,  label: '256 px — Small'   },
    { value: 300,  label: '300 px — Default' },
    { value: 400,  label: '400 px — Medium'  },
    { value: 512,  label: '512 px — Large'   },
    { value: 600,  label: '600 px — HD'      },
    { value: 800,  label: '800 px — Full HD' },
    { value: 1024, label: '1024 px — 2K'     },
    { value: 1600, label: '1600 px — 4K'     },
  ];

  // Format options for the dropdown
  const formatOptions: { value: QrFormat; label: string; ext: string; hint: string }[] = [
    { value: 'png',  label: 'PNG',  ext: 'png',  hint: 'Lossless raster — ideal for web & sharing'         },
    { value: 'webp', label: 'WEBP', ext: 'webp', hint: 'Smaller file size, lossless — modern browsers'     },
    { value: 'svg',  label: 'SVG',  ext: 'svg',  hint: 'Infinitely scalable vector — ideal for print'      },
  ];

  const activeFormat = $derived(formatOptions.find(f => f.value === qrFormat)!);

  // ─── Auto Error Correction ───────────────────────────────────────────────────────
  //
  // Strategy used by QRCode Monkey, QR Tiger, and most pro generators:
  //   • Short data  (<100 chars)  → Q (25% recovery) — good damage resistance
  //   • Medium data (<500 chars)  → M (15% recovery) — balanced (industry default)
  //   • Long data   (≥500 chars)  → L (7%  recovery) — maximise encoding capacity
  //
  const autoErrorLevel = $derived.by((): ErrorLevel => {
    const len = content.trim().length;
    if (len === 0)   return 'M';
    if (len < 100)   return 'Q';
    if (len < 500)   return 'M';
    return 'L';
  });

  // ─── Color Presets ─────────────────────────────────────────────────────────────
  const fgPresets = [
    { color: '#000000', name: 'Jet Black'  },
    { color: '#1a1a2e', name: 'Night Navy' },
    { color: '#0d47a1', name: 'Deep Blue'  },
    { color: '#1b5e20', name: 'Forest'     },
    { color: '#4a0080', name: 'Violet'     },
    { color: '#b71c1c', name: 'Crimson'    },
    { color: '#e65100', name: 'Ember'      },
    { color: '#004d40', name: 'Teal'       },
  ];
  const bgPresets = [
    { color: '#ffffff', name: 'White'    },
    { color: '#f5f5f5', name: 'Cloud'    },
    { color: '#e3f2fd', name: 'Sky'      },
    { color: '#e8f5e9', name: 'Mint'     },
    { color: '#fce4ec', name: 'Blush'    },
    { color: '#fff9c4', name: 'Lemon'    },
    { color: '#f3e5f5', name: 'Lavender' },
    { color: '#fff3e0', name: 'Peach'    },
  ];

  // ─── QR Generation ─────────────────────────────────────────────────────────────
  let debounceTimer: ReturnType<typeof setTimeout>;

  async function generateQR() {
    const val   = content.trim();
    const level = autoErrorLevel;
    if (!val) { qrDataUrl = ''; qrSvgString = ''; errorMsg = ''; return; }

    isGenerating = true;
    errorMsg = '';
    try {
      if (qrFormat === 'svg') {
        // Generate SVG string for download; use data URI for <img> preview
        const svg = await QRCode.toString(val, {
          type: 'svg',
          margin: 1,
          color: { dark: qrFgColor, light: qrBgColor },
          errorCorrectionLevel: level,
        });
        qrSvgString = svg;
        qrDataUrl   = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      } else if (qrFormat === 'webp') {
        // Generate via canvas then convert to WEBP (browser-native)
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, val, {
          width: qrSize,
          margin: 1,
          color: { dark: qrFgColor, light: qrBgColor },
          errorCorrectionLevel: level,
        });
        qrDataUrl   = canvas.toDataURL('image/webp', 0.95);
        qrSvgString = '';
      } else {
        const dataUrl = await QRCode.toDataURL(val, {
          width: qrSize,
          margin: 1,
          color: { dark: qrFgColor, light: qrBgColor },
          errorCorrectionLevel: level,
        });
        qrDataUrl   = dataUrl;
        qrSvgString = '';
      }
    } catch {
      errorMsg    = 'Content too long or invalid for QR encoding.';
      qrDataUrl   = '';
      qrSvgString = '';
    } finally {
      isGenerating = false;
    }
  }

  $effect(() => {
    void content; void qrSize; void qrFormat; void qrFgColor; void qrBgColor;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generateQR, 350);
  });

  // ─── Tab switching ──────────────────────────────────────────────────────────────
  function setTab(tab: TabId) {
    if (activeTab === tab) return;
    activeTab   = tab;
    content     = '';
    qrDataUrl   = '';
    qrSvgString = '';
    errorMsg    = '';
  }

  // ─── Actions ────────────────────────────────────────────────────────────────────
  function downloadQR() {
    if (!qrDataUrl) return;
    const a   = document.createElement('a');
    const ext = activeFormat.ext;
    a.download = `qrcode-${activeTab}-${Date.now()}.${ext}`;
    if (qrFormat === 'svg' && qrSvgString) {
      const blob = new Blob([qrSvgString], { type: 'image/svg+xml' });
      a.href = URL.createObjectURL(blob);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 100);
    } else {
      a.href = qrDataUrl;
      a.click();
    }
  }

  async function copyQR() {
    if (!qrDataUrl) return;
    if (qrFormat === 'svg' && qrSvgString) {
      await navigator.clipboard.writeText(qrSvgString).catch(() => {});
    } else {
      try {
        const mimeType = qrFormat === 'webp' ? 'image/webp' : 'image/png';
        const blob = await fetch(qrDataUrl).then(r => r.blob());
        // Clipboard API only supports image/png natively; fall back to text for other formats
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      } catch {
        await navigator.clipboard.writeText(qrDataUrl);
      }
    }
    isCopied = true;
    setTimeout(() => { isCopied = false; }, 2000);
  }

  const activeTabMeta = $derived(tabs.find(t => t.id === activeTab)!);

  // ─── JS-driven sticky preview ─────────────────────────────────────────────────
  let gridEl:    HTMLElement | null = null;
  let previewEl: HTMLElement | null = null;
  let previewOffset = $state(0);
  const STICKY_TOP = 96;

  function updateStickyPreview() {
    if (!gridEl || !previewEl) return;
    const gridRect  = gridEl.getBoundingClientRect();
    const previewH  = previewEl.offsetHeight;
    const maxOffset = gridRect.height - previewH;
    const desired   = Math.max(0, STICKY_TOP - gridRect.top);
    previewOffset = Math.min(desired, Math.max(0, maxOffset));
  }

  onMount(() => {
    generateQR();
    const mq = window.matchMedia('(min-width: 1024px)');
    function onScroll() { if (mq.matches) updateStickyPreview(); }
    function onResize() {
      if (!mq.matches) previewOffset = 0;
      else updateStickyPreview();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  });
</script>

<!-- ──────────────────────────────────────────────────────────────────────────── -->
<div class="w-full max-w-7xl mx-auto space-y-5">

  <!-- ─── Step 1: Type Selector ──────────────────────────────────────────────── -->
  <div class="space-y-3">
    <div class="flex items-center gap-2.5">
      <span class="step-badge">1</span>
      <span class="text-sm font-semibold text-foreground">Choose QR Type</span>
    </div>

    <div class="flex flex-wrap gap-2">
      {#each tabs as tab (tab.id)}
        {@const Icon = tab.icon}
        <button
          onclick={() => setTab(tab.id)}
          title={tab.hint}
          class={cn(
            "group flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
            activeTab === tab.id
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20"
              : "bg-card text-muted-foreground border-border/80 hover:border-emerald-500/40 hover:text-foreground hover:bg-accent/50"
          )}
        >
          <Icon class="w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110" />
          {tab.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- ─── Main Grid ───────────────────────────────────────────────────────────── -->
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-5" bind:this={gridEl}>

    <!-- ─── LEFT: Form (Step 2) + Customization (Step 3) — wider col ─────────── -->
    <div class="lg:col-span-3 flex flex-col gap-5 order-1">

      <!-- Step 2: Data Entry Form -->
      <Card class="border border-border/80 shadow-lg bg-card">
        <CardHeader class="pb-3 border-b border-border/40">
          <CardTitle class="text-sm font-semibold flex items-center gap-2.5">
            <span class="step-badge-sm">2</span>
            <span>Enter Your Data</span>
            <!-- Active tab badge -->
            <span class="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {#if activeTabMeta}
                {@const Icon = activeTabMeta.icon}
                <Icon class="w-3 h-3" />
                {activeTabMeta.label}
              {/if}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent class="p-5">
          {#key activeTab}
            {#if activeTab === 'url'}
              <UrlTab bind:content />
            {:else if activeTab === 'text'}
              <TextTab bind:content />
            {:else if activeTab === 'email'}
              <EmailTab bind:content />
            {:else if activeTab === 'phone'}
              <PhoneTab bind:content />
            {:else if activeTab === 'sms'}
              <SmsTab bind:content />
            {:else if activeTab === 'whatsapp'}
              <WhatsappTab bind:content />
            {:else if activeTab === 'vcard'}
              <VcardTab bind:content />
            {:else if activeTab === 'wifi'}
              <WifiTab bind:content />
            {:else if activeTab === 'bitcoin'}
              <BitcoinTab bind:content />
            {:else if activeTab === 'gps'}
              <GpsTab bind:content />
            {:else}
              <CalendarTab bind:content />
            {/if}
          {/key}
        </CardContent>
      </Card>

      <!-- Step 3: Customization Card — colors only (size & format in preview) -->
      <Card class="border border-border/80 shadow-md bg-card">
        <CardHeader class="pb-3 border-b border-border/40">
          <CardTitle class="text-sm font-semibold flex items-center gap-2">
            <span class="step-badge-sm">3</span>
            Customize Colors
          </CardTitle>
        </CardHeader>

        <CardContent class="p-5 space-y-5">

          <!-- QR Color -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">QR Color</span>
              <span class="text-[10px] font-mono text-muted-foreground">{qrFgColor}</span>
            </div>
            <div class="flex gap-2 flex-wrap items-center">
              {#each fgPresets as { color, name } (color)}
                <button
                  onclick={() => qrFgColor = color}
                  title={name}
                  class={cn(
                    "w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110",
                    qrFgColor === color
                      ? "border-emerald-500 scale-110 shadow-md shadow-emerald-500/30"
                      : "border-transparent hover:border-border/80"
                  )}
                  style="background-color: {color};"
                ></button>
              {/each}
              <label class="relative w-7 h-7 rounded-full border-2 border-dashed border-border/60 hover:border-emerald-500/60 cursor-pointer overflow-hidden flex items-center justify-center transition-all hover:scale-110" title="Custom color">
                <input type="color" bind:value={qrFgColor} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span class="text-[10px] font-bold text-muted-foreground pointer-events-none select-none">+</span>
              </label>
            </div>
          </div>

          <!-- BG Color -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Background</span>
              <span class="text-[10px] font-mono text-muted-foreground">{qrBgColor}</span>
            </div>
            <div class="flex gap-2 flex-wrap items-center">
              {#each bgPresets as { color, name } (color)}
                <button
                  onclick={() => qrBgColor = color}
                  title={name}
                  class={cn(
                    "w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110",
                    qrBgColor === color
                      ? "border-emerald-500 scale-110 shadow-md shadow-emerald-500/30"
                      : "border-border/60 hover:border-border"
                  )}
                  style="background-color: {color};"
                ></button>
              {/each}
              <label class="relative w-7 h-7 rounded-full border-2 border-dashed border-border/60 hover:border-emerald-500/60 cursor-pointer overflow-hidden flex items-center justify-center transition-all hover:scale-110" title="Custom color">
                <input type="color" bind:value={qrBgColor} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <span class="text-[10px] font-bold text-muted-foreground pointer-events-none select-none">+</span>
              </label>
            </div>
          </div>

          <!-- Choose Template (Coming Soon) -->
          <div class="space-y-2.5">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Choose Template</span>
              <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">Coming Soon</span>
            </div>
            <!-- Placeholder template swatches -->
            <div class="grid grid-cols-4 gap-2 opacity-40 pointer-events-none select-none" aria-hidden="true">
              {#each ['Classic', 'Rounded', 'Dots', 'Frame'] as tpl (tpl)}
                <div class="flex flex-col items-center gap-1.5">
                  <div class="w-full aspect-square rounded-xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center">
                    <div class="grid grid-cols-3 gap-[2px] w-5 h-5">
                    {#each Array(9) as _, j (j)}
                        <div class="rounded-[1px] bg-foreground/40" style="opacity:{[0,1,2,3,5,6,7,8].includes(j)?0.7:0.2}"></div>
                      {/each}
                    </div>
                  </div>
                  <span class="text-[9px] text-muted-foreground/60 font-medium">{tpl}</span>
                </div>
              {/each}
            </div>
            <p class="text-[10px] text-muted-foreground/50 leading-relaxed">Custom shapes, logos, and styles — coming in a future update.</p>
          </div>

        </CardContent>
      </Card>

    </div><!-- /LEFT col -->

    <!-- ─── RIGHT: Sticky QR Preview (Step 4) — narrower col ───────────────────── -->
    <div class="lg:col-span-2 order-2">
      <div bind:this={previewEl} class="flex flex-col gap-5" style="transform: translateY({previewOffset}px); transition: transform 0.15s ease;">

        <!-- Preview Card -->
        <Card class="border border-border/80 shadow-lg bg-card">
          <CardHeader class="pb-3 border-b border-border/40">
            <CardTitle class="text-sm font-semibold flex items-center gap-2">
              <span class={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                qrDataUrl ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" : isGenerating ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
              )}></span>
              QR Preview
              {#if qrDataUrl}
                <span class="ml-auto text-[10px] font-normal text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                  {qrFormat === 'svg' ? 'SVG' : `${qrSize}px`}
                </span>
              {/if}
            </CardTitle>
          </CardHeader>

          <CardContent class="p-5">
            <div class="flex flex-col items-center gap-4">

              <!-- QR Image / States -->
              <div class="w-full flex items-center justify-center min-h-[200px] rounded-2xl border border-border/50 bg-gradient-to-br from-muted/20 via-muted/30 to-muted/20 p-4">
                {#if isGenerating}
                  <div class="flex flex-col items-center gap-3 text-muted-foreground">
                    <RefreshCw class="w-8 h-8 text-emerald-500 animate-spin" />
                    <p class="text-xs">Generating QR code…</p>
                  </div>
                {:else if qrDataUrl}
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    class="block rounded-xl shadow-md"
                    style="max-width: min(220px, 100%); height: auto;"
                  />
                {:else}
                  <div class="flex flex-col items-center gap-4 text-center">
                    <div class="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <div class="grid grid-cols-5 gap-[3px] w-10 h-10">
                        {#each Array(25) as _, i (i)}
                          <div class={cn(
                            "rounded-[2px] transition-colors duration-300",
                            [0,1,2,5,10,14,15,20,21,22,24,12].includes(i)
                              ? "bg-emerald-500"
                              : "bg-emerald-500/15"
                          )}></div>
                        {/each}
                      </div>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-foreground">QR code appears here</p>
                      <p class="text-xs text-muted-foreground mt-1">← Fill in the form on the left</p>
                    </div>
                  </div>
                {/if}
              </div>

              {#if errorMsg}
                <p class="text-xs text-destructive text-center bg-destructive/5 border border-destructive/15 px-3 py-2 rounded-lg w-full">{errorMsg}</p>
              {/if}

              <!-- Step 4: Save — size, format & actions -->
              <div class="w-full space-y-3.5">
                <div class="flex items-center gap-2">
                  <span class="step-badge">4</span>
                  <span class="text-sm font-semibold text-foreground">Save</span>
                </div>

                <!-- Size + Format dropdowns in same row -->
                <div class="grid grid-cols-2 gap-2">

                  <!-- Size dropdown -->
                  <div class="space-y-1">
                    <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Size</span>
                    <div class="relative">
                      <select
                        bind:value={qrSize}
                        disabled={qrFormat === 'svg'}
                        class="w-full appearance-none pl-3 pr-7 py-2 text-xs font-medium rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {#each sizeOptions as opt (opt.value)}
                          <option value={opt.value}>{opt.label}</option>
                        {/each}
                      </select>
                      <span class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                          <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    {#if qrFormat === 'svg'}
                      <p class="text-[9px] text-muted-foreground/40">N/A for SVG</p>
                    {:else}
                      <p class="text-[9px] text-muted-foreground/40">{qrSize}×{qrSize} px</p>
                    {/if}
                  </div>

                  <!-- Format dropdown -->
                  <div class="space-y-1">
                    <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Format</span>
                    <div class="relative">
                      <select
                        bind:value={qrFormat}
                        class="w-full appearance-none pl-3 pr-7 py-2 text-xs font-medium rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200 cursor-pointer"
                      >
                        {#each formatOptions as opt (opt.value)}
                          <option value={opt.value}>{opt.label}</option>
                        {/each}
                      </select>
                      <span class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                          <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    <p class="text-[9px] text-muted-foreground/40 truncate">{activeFormat?.hint ?? ''}</p>
                  </div>

                </div><!-- /grid -->

                <!-- Download (wide) + Copy icon (narrow with tooltip) in same row -->
                <div class="flex gap-2 items-stretch">

                  <!-- Download — flex-grow -->
                  <button
                    onclick={downloadQR}
                    disabled={!qrDataUrl}
                    class="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all duration-200 active:scale-[0.98]"
                  >
                    <Download class="w-4 h-4 shrink-0" />
                    Download {qrFormat.toUpperCase()}
                  </button>

                  <!-- Copy icon — narrow, tooltip on hover -->
                  <div class="relative group">
                    <button
                      onclick={copyQR}
                      disabled={!qrDataUrl}
                      title={isCopied ? 'Copied!' : (qrFormat === 'svg' ? 'Copy SVG code' : 'Copy image')}
                      class={cn(
                        "h-full w-10 flex items-center justify-center rounded-xl border text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed",
                        isCopied
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-border/80 bg-card text-foreground hover:border-emerald-500/50 hover:text-emerald-600"
                      )}
                    >
                      {#if isCopied}
                        <Check class="w-4 h-4" />
                      {:else}
                        <Copy class="w-4 h-4" />
                      {/if}
                    </button>
                    <!-- Tooltip -->
                    <div class="absolute bottom-full right-0 mb-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap bg-foreground text-background pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
                      {isCopied ? 'Copied!' : (qrFormat === 'svg' ? 'Copy SVG' : 'Copy image')}
                      <span class="absolute top-full right-2.5 border-4 border-transparent border-t-foreground"></span>
                    </div>
                  </div>

                </div><!-- /download row -->

              </div><!-- /save section -->

            </div>
          </CardContent>
        </Card>

      </div><!-- /sticky wrapper -->
    </div><!-- /RIGHT col -->

  </div>
</div>

<style>
  .step-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.375rem;
    height: 1.375rem;
    border-radius: 9999px;
    background-color: rgb(16 185 129);
    color: #fff;
    font-size: 0.625rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .step-badge-sm {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 9999px;
    background-color: rgb(16 185 129 / 0.15);
    color: rgb(5 150 105);
    font-size: 0.5625rem;
    font-weight: 700;
    flex-shrink: 0;
    border: 1px solid rgb(16 185 129 / 0.3);
  }

  :global(.dark) .step-badge-sm {
    color: rgb(52 211 153);
  }

</style>
