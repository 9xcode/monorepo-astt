<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { cn } from "$lib/utils";

  import {
    Camera, Upload, Copy, ExternalLink, RefreshCw, AlertTriangle, Check, CameraOff, ShieldCheck,
  } from '@lucide/svelte';

  // ─── State ────────────────────────────────────────────────────────────────────

  type CameraPermission = 'unknown' | 'prompt' | 'granted' | 'denied';

  let activeTab             = $state<'camera' | 'upload'>('camera');
  let scannerResult         = $state('');
  let detectedFormat        = $state('');
  let isScanning            = $state(false);
  let errorMsg              = $state('');
  let isCopied              = $state(false);
  let cameraPermission      = $state<CameraPermission>('unknown');
  let isRequestingPermission = $state(false);
  let isInsecureContext     = $state(false);

  let videoEl         = $state<HTMLVideoElement | null>(null);
  let canvasEl        = $state<HTMLCanvasElement | null>(null);
  let stream          = $state<MediaStream | null>(null);
  let animationFrameId = $state<number | null>(null);

  // ─── Derived ──────────────────────────────────────────────────────────────────

  let showPermissionPrompt = $derived(
    activeTab === 'camera' &&
    !isScanning &&
    !scannerResult &&
    (cameraPermission === 'unknown' || cameraPermission === 'prompt')
  );

  let showPermissionDenied = $derived(
    activeTab === 'camera' &&
    !isScanning &&
    !scannerResult &&
    cameraPermission === 'denied'
  );

  // Is the result a URL? (useful for "Open Link" action on barcode results)
  let resultIsUrl = $derived(
    !!scannerResult && /^https?:\/\//i.test(scannerResult.trim())
  );

  // ─── Barcode Helpers ──────────────────────────────────────────────────────────

  /** Returns a human-readable format name from either BarcodeDetector or @zxing naming conventions */
  function formatBarcodeFormatName(fmt: string): string {
    const key = fmt.toUpperCase().replace(/-/g, '_');
    const map: Record<string, string> = {
      AZTEC: 'Aztec',             CODE_128: 'Code 128',      CODE_39: 'Code 39',
      CODE_93: 'Code 93',        CODABAR: 'Codabar',        DATA_MATRIX: 'Data Matrix',
      EAN_13: 'EAN-13',          EAN_8: 'EAN-8',            ITF: 'ITF',
      PDF_417: 'PDF 417',        QR_CODE: 'QR Code',        UPC_A: 'UPC-A',
      UPC_E: 'UPC-E',            MAXICODE: 'MaxiCode',      RSS_14: 'RSS-14',
      RSS_EXPANDED: 'RSS Expanded', UPC_EAN_EXTENSION: 'UPC/EAN Extension', UNKNOWN: 'Unknown',
    };
    return map[key] ?? fmt.replace(/_/g, ' ');
  }

  /** Returns all barcode formats supported by the native BarcodeDetector — cached after first query */
  let cachedBarcodeFormats: string[] | null = null;
  async function getAllBarcodeFormats(): Promise<string[]> {
    if (cachedBarcodeFormats !== null) return cachedBarcodeFormats;
    try {
      // @ts-ignore — BarcodeDetector.getSupportedFormats not in all TS libs
      cachedBarcodeFormats = await BarcodeDetector.getSupportedFormats();
      return cachedBarcodeFormats!;
    } catch {
      return (cachedBarcodeFormats = []);
    }
  }

  /** Check if the browser-native BarcodeDetector API is available */
  const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  /** Lazy singleton @zxing/browser reader — loaded once, reused across frames */
  let zxingReaderInstance: any = null;

  /**
   * Decode any barcode from a canvas element via @zxing/browser (cross-browser, cross-platform).
   * Returns null when no barcode is found — NotFoundException is a normal scanning state.
   */
  async function decodeWithZxing(canvas: HTMLCanvasElement): Promise<{ text: string; format: string } | null> {
    try {
      const [{ BrowserMultiFormatReader }, { BarcodeFormat }] = await Promise.all([
        import('@zxing/browser'),
        import('@zxing/library'),
      ]);
      if (!zxingReaderInstance) {
        zxingReaderInstance = new BrowserMultiFormatReader();
      }
      const result = await (zxingReaderInstance as InstanceType<typeof BrowserMultiFormatReader>).decodeFromCanvas(canvas);
      const fmtKey = BarcodeFormat[result.getBarcodeFormat()] ?? '';
      return { text: result.getText(), format: formatBarcodeFormatName(fmtKey) };
    } catch (err: any) {
      // NotFoundException = no barcode visible — completely normal during continuous scanning
      if (
        err?.name === 'NotFoundException' ||
        err?.message?.includes('No MultiFormat') ||
        err?.message?.includes('not found')
      ) {
        return null;
      }
      console.error('zxing decode error:', err);
      return null;
    }
  }

  // ─── Camera Permission ────────────────────────────────────────────────────────

  async function checkPermissionStatus(): Promise<CameraPermission> {
    if (typeof navigator === 'undefined' || !navigator.permissions) return 'unknown';
    try {
      const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return status.state as CameraPermission;
    } catch {
      return 'unknown';
    }
  }

  // ─── Camera Functions ─────────────────────────────────────────────────────────

  async function startCamera() {
    await tick();
    errorMsg = '';
    scannerResult = '';
    detectedFormat = '';
    isScanning = false;
    isRequestingPermission = true;

    if (stream) stopCamera();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      isRequestingPermission = false;
      cameraPermission = 'denied';
      isInsecureContext = true;
      isScanning = false;
      return;
    }

    const constraintOptions = [
      { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment' } },
      { video: { facingMode: 'user' } },
      { video: true }
    ];

    let lastError: any = null;
    for (const constraints of constraintOptions) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!stream) {
      isRequestingPermission = false;
      if (lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError') {
        cameraPermission = 'denied';
        errorMsg = '';
      } else if (lastError?.name === 'NotFoundError' || lastError?.name === 'DevicesNotFoundError') {
        cameraPermission = 'denied';
        errorMsg = 'No camera found on this device. Please upload an image instead.';
      } else if (lastError?.name === 'NotReadableError' || lastError?.name === 'TrackStartError') {
        errorMsg = 'Camera is already in use by another application. Please close it and try again.';
        cameraPermission = 'granted';
      } else {
        errorMsg = 'Could not access camera. Please try uploading an image instead.';
      }
      isScanning = false;
      return;
    }

    cameraPermission = 'granted';
    isRequestingPermission = false;

    try {
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.setAttribute('playsinline', 'true');
        await videoEl.play();
        isScanning = true;
        scanFrame();
      }
    } catch (playErr) {
      console.error('Video play failed:', playErr);
      errorMsg = 'Failed to start video stream playback.';
      isScanning = false;
    }
  }

  function stopCamera() {
    isScanning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (videoEl) {
      videoEl.srcObject = null;
    }
  }

  async function scanFrame() {
    if (!isScanning) return;

    if (videoEl && canvasEl) {
      try {
        const ctx = canvasEl.getContext('2d');
        if (ctx && videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
          const width  = videoEl.videoWidth;
          const height = videoEl.videoHeight;

          if (width > 0 && height > 0) {
            canvasEl.width  = width;
            canvasEl.height = height;
            ctx.drawImage(videoEl, 0, 0, width, height);

            // Strategy 1: Native BarcodeDetector — hardware-accelerated, all formats
            if (hasBarcodeDetector) {
              try {
                const formats = await getAllBarcodeFormats();
                const bitmap  = await createImageBitmap(canvasEl);
                // @ts-ignore
                const detector = new BarcodeDetector({ formats: formats.length ? formats : undefined });
                const codes   = await detector.detect(bitmap);
                bitmap.close();
                if (codes.length > 0 && codes[0].rawValue) {
                  scannerResult  = codes[0].rawValue;
                  detectedFormat = formatBarcodeFormatName(codes[0].format ?? '');
                  stopCamera();
                  triggerSuccessBeep();
                  return;
                }
              } catch {
                // Fall through to @zxing
              }
            }

            // Strategy 2: @zxing/browser — cross-browser, cross-platform fallback
            const zxResult = await decodeWithZxing(canvasEl);
            if (zxResult) {
              scannerResult  = zxResult.text;
              detectedFormat = zxResult.format;
              stopCamera();
              triggerSuccessBeep();
              return;
            }
          }
        }
      } catch (err) {
        console.error('Frame scanning error:', err);
      }
    }
    animationFrameId = requestAnimationFrame(() => { void scanFrame(); });
  }

  function triggerSuccessBeep() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode   = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1046, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.07, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext blocked or not supported — silent fail
    }
  }

  // ─── Image Upload ─────────────────────────────────────────────────────────────

  async function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    errorMsg       = '';
    scannerResult  = '';
    detectedFormat = '';

    if (!input.files?.[0]) return;
    const file = input.files[0];
    input.value = '';

    // Strategy 1: Native BarcodeDetector — all formats
    if (hasBarcodeDetector) {
      try {
        const formats = await getAllBarcodeFormats();
        // @ts-ignore
        const detector = new BarcodeDetector({ formats: formats.length ? formats : undefined });
        const bitmap   = await createImageBitmap(file);
        const codes    = await detector.detect(bitmap);
        bitmap.close();
        if (codes.length > 0 && codes[0].rawValue) {
          scannerResult  = codes[0].rawValue;
          detectedFormat = formatBarcodeFormatName(codes[0].format ?? '');
          triggerSuccessBeep();
          return;
        }
      } catch {
        // Fall through to @zxing
      }
    }

    // Strategy 2: @zxing/browser — draw image to canvas then decode
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => { errorMsg = 'Could not read the image file. Please try a different image.'; };
      img.onload = async () => {
        const tmp  = document.createElement('canvas');
        tmp.width  = img.naturalWidth;
        tmp.height = img.naturalHeight;
        const tctx = tmp.getContext('2d')!;
        tctx.drawImage(img, 0, 0);
        const zxResult = await decodeWithZxing(tmp);
        if (zxResult) {
          scannerResult  = zxResult.text;
          detectedFormat = zxResult.format;
          triggerSuccessBeep();
        } else {
          errorMsg = 'No barcode found. Try uploading a clearer, higher-resolution image.';
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  function copyToClipboard() {
    if (scannerResult) {
      navigator.clipboard.writeText(scannerResult).catch(() => {});
      isCopied = true;
      setTimeout(() => { isCopied = false; }, 2000);
    }
  }

  function resetScanner() {
    scannerResult  = '';
    detectedFormat = '';
    errorMsg       = '';
    if (activeTab === 'camera') startCamera();
  }

  async function setTab(tab: 'camera' | 'upload') {
    if (activeTab === tab) return;
    stopCamera();
    scannerResult  = '';
    detectedFormat = '';
    errorMsg       = '';
    activeTab      = tab;

    if (tab === 'camera') {
      await tick();
      if (cameraPermission === 'granted' && !isInsecureContext) startCamera();
    }
  }

  function requestCameraPermission() { startCamera(); }

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  onMount(async () => {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'http:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      isInsecureContext = true;
      cameraPermission = 'denied';
      return;
    }

    const status = await checkPermissionStatus();
    cameraPermission = status;

    if (activeTab === 'camera') {
      await tick();
      if (status === 'granted') startCamera();
    }
  });

  onDestroy(() => { stopCamera(); });
</script>

<div class="w-full max-w-4xl mx-auto space-y-6">
  <!-- Tabs Navigation -->
  <div class="flex p-1 bg-muted/80 backdrop-blur-md rounded-xl max-w-sm mx-auto">
    <button
      onclick={() => setTab('camera')}
      class={cn(
        "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
        activeTab === 'camera'
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Camera class="w-4 h-4" />
      Scan Camera
    </button>
    <button
      onclick={() => setTab('upload')}
      class={cn(
        "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
        activeTab === 'upload'
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Upload class="w-4 h-4" />
      Upload Image
    </button>
  </div>

  <!-- Hidden canvas for barcode processing -->
  <canvas bind:this={canvasEl} class="hidden"></canvas>

  <div class="grid gap-6 md:grid-cols-5">
    <!-- Main Interactive Area -->
    <div class="md:col-span-3">
      <Card class="overflow-hidden border border-border/80 shadow-lg bg-card">
        <CardContent class="p-0 relative">
          {#if activeTab === 'camera'}
            <div class={cn(
              "relative w-full flex items-center justify-center overflow-hidden transition-all duration-500",
              isScanning
                ? "aspect-[4/3] bg-black"
                : "min-h-[320px] md:aspect-[4/3] py-8 px-4 bg-gradient-to-br from-emerald-500/5 via-muted/30 to-emerald-500/5 dark:from-emerald-500/10 dark:via-neutral-900/60 dark:to-emerald-500/10"
            )}>

              <!-- Camera Preview Video -->
              <video
                bind:this={videoEl}
                class={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                  isScanning ? "opacity-100" : "opacity-0"
                )}
              ></video>

              <!-- Scan Overlay Frame -->
              {#if isScanning && !scannerResult}
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="relative w-72 h-48 max-w-[85%]">
                    <!-- Animated scan line -->
                    <div class="absolute inset-x-4 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.9)]" style="animation: scanline 1.8s ease-in-out infinite;"></div>

                    <!-- Corner brackets — wider rectangle for barcodes -->
                    <div class="absolute -top-0.5 -left-0.5 w-7 h-7 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-md"></div>
                    <div class="absolute -top-0.5 -right-0.5 w-7 h-7 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-md"></div>
                    <div class="absolute -bottom-0.5 -left-0.5 w-7 h-7 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-md"></div>
                    <div class="absolute -bottom-0.5 -right-0.5 w-7 h-7 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-md"></div>

                    <div class="absolute inset-0 border border-dashed border-emerald-500/20 rounded-sm"></div>
                  </div>
                </div>

                <!-- Scanning status pill -->
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white text-xs font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Scanning for barcodes…
                </div>
              {/if}

              <!-- Permission Prompt -->
              {#if showPermissionPrompt}
                <div class="z-10 flex flex-col items-center text-center space-y-4 px-6 md:px-8">
                  <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/25 flex items-center justify-center">
                    <Camera class="w-6 h-6 md:w-8 md:h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div class="space-y-1">
                    <p class="text-foreground font-semibold text-sm">Camera Access Required</p>
                    <p class="text-muted-foreground text-xs leading-relaxed max-w-[240px]">
                      Allow camera access to scan barcodes in real time. No image or stream data is ever saved or sent online.
                    </p>
                  </div>
                  <button
                    onclick={requestCameraPermission}
                    disabled={isRequestingPermission}
                    class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 rounded-xl shadow-md transition-all duration-200"
                  >
                    {#if isRequestingPermission}
                      <RefreshCw class="w-4 h-4 animate-spin" />
                      Requesting…
                    {:else}
                      <ShieldCheck class="w-4 h-4" />
                      Allow Camera Permission
                    {/if}
                  </button>
                  <button
                    onclick={() => setTab('upload')}
                    class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors focus:outline-none"
                  >
                    Upload an image instead
                  </button>
                </div>
              {/if}

              <!-- Permission Denied -->
              {#if showPermissionDenied}
                <div class="z-10 flex flex-col items-center text-center space-y-4 px-6 md:px-8">
                  <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <CameraOff class="w-6 h-6 md:w-8 md:h-8 text-destructive" />
                  </div>
                  <div class="space-y-1">
                    <p class="text-foreground font-semibold text-sm">
                      {isInsecureContext ? 'Secure Connection Required' : 'Camera Access Blocked'}
                    </p>
                    <p class="text-muted-foreground text-xs leading-relaxed max-w-[240px]">
                      {isInsecureContext
                        ? 'Web browsers disable camera access over plain HTTP. Please switch to an HTTPS URL or run on localhost.'
                        : 'Camera permission was denied. Please reset the site permissions in your browser address bar.'}
                    </p>
                  </div>
                  {#if !isInsecureContext}
                    <button
                      onclick={requestCameraPermission}
                      class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl transition-all duration-200"
                    >
                      <ShieldCheck class="w-4 h-4" />
                      Allow Permission
                    </button>
                  {/if}
                  <button
                    onclick={() => setTab('upload')}
                    class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors focus:outline-none"
                  >
                    Upload an image instead
                  </button>
                </div>
              {/if}

              <!-- General error -->
              {#if errorMsg && !showPermissionDenied && activeTab === 'camera'}
                <div class="z-10 flex flex-col items-center text-center space-y-4 px-6 md:px-8">
                  <div class="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <AlertTriangle class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p class="text-muted-foreground text-xs leading-relaxed max-w-[240px]">{errorMsg}</p>
                  <button
                    onclick={startCamera}
                    class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl transition-all duration-200"
                  >
                    <RefreshCw class="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onclick={() => setTab('upload')}
                    class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline transition-colors focus:outline-none"
                  >
                    Upload an image instead
                  </button>
                </div>
              {/if}

              <!-- Loading state -->
              {#if isRequestingPermission && !isScanning}
                <div class="z-20 absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 backdrop-blur-sm">
                  <RefreshCw class="w-7 h-7 text-emerald-500 animate-spin" />
                  <p class="text-muted-foreground text-xs font-medium">Waiting for camera permission…</p>
                </div>
              {/if}
            </div>

          {:else}
            <!-- Image Upload Tab -->
            <label class="flex flex-col items-center justify-center aspect-[4/3] bg-gradient-to-br from-emerald-500/5 via-muted/30 to-emerald-500/5 dark:from-emerald-500/10 dark:via-neutral-900/60 dark:to-emerald-500/10 p-6 border-2 border-dashed border-border/80 rounded-b-xl hover:border-emerald-500/40 transition-colors duration-300 relative group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onchange={handleImageUpload}
                class="sr-only"
              />
              <div class="flex flex-col items-center space-y-3 text-center">
                <div class="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Upload class="w-8 h-8" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-foreground">Drag and drop or click to upload</p>
                  <p class="text-xs text-muted-foreground mt-1">Supports PNG, JPG, JPEG, and WebP</p>
                </div>
              </div>
            </label>
          {/if}
        </CardContent>
      </Card>
    </div>

    <!-- Right Side: Results Panel -->
    <div class="md:col-span-2 flex flex-col justify-stretch">
      <Card class="flex-1 border border-border/80 shadow-md bg-card flex flex-col justify-between">
        <CardHeader class="pb-3 border-b border-border/40">
          <CardTitle class="text-base font-semibold flex items-center gap-2">
            <span class={cn(
              "w-2.5 h-2.5 rounded-full transition-colors duration-300",
              scannerResult ? "bg-emerald-500" : isScanning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
            )}></span>
            Scan Result
          </CardTitle>
        </CardHeader>
        <CardContent class="flex-1 p-6 flex flex-col justify-between space-y-6">
          <div class="space-y-4 flex-1">

            <!-- Upload tab error -->
            {#if errorMsg && activeTab === 'upload'}
              <div class="flex gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm leading-relaxed">
                <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            {/if}

            {#if scannerResult}
              <div class="space-y-4">
                <!-- Format Badge -->
                {#if detectedFormat}
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <path d="M3 5h2M7 5h1M12 5h1M16 5h2M3 12h2M7 12h1M12 12h1M16 12h2M3 19h2M7 19h1M12 19h1M16 19h2"/>
                      </svg>
                      {detectedFormat}
                    </span>
                    <span class="text-[10px] text-muted-foreground">Format detected</span>
                  </div>
                {/if}

                <!-- Decoded Value -->
                <div class="space-y-2">
                  <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Decoded Value</p>
                  <div class="relative group">
                    <div class="w-full min-h-[80px] max-h-[200px] overflow-y-auto p-4 pr-12 rounded-xl border border-border/80 bg-muted/50 font-mono text-sm break-all leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/20 select-text">
                      {scannerResult}
                    </div>
                    <button
                      onclick={copyToClipboard}
                      title="Copy to clipboard"
                      class="absolute top-3 right-3 p-2 rounded-lg bg-background border border-border/80 text-muted-foreground hover:text-foreground shadow-sm transition-all duration-200 active:scale-95"
                    >
                      {#if isCopied}
                        <Check class="w-4 h-4 text-emerald-500" />
                      {:else}
                        <Copy class="w-4 h-4" />
                      {/if}
                    </button>
                  </div>
                </div>

                <!-- Open Link action (only when result is a URL) -->
                {#if resultIsUrl}
                  <a
                    href={scannerResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-all duration-300 active:scale-[0.98]"
                  >
                    <ExternalLink class="w-4 h-4" />
                    Open Link
                  </a>
                {/if}
              </div>
            {:else if !errorMsg || activeTab === 'camera'}
              <div class="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div class="w-12 h-12 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground">
                  <RefreshCw class="w-5 h-5" style="animation: spin 3s linear infinite;" />
                </div>
                <p class="text-sm text-muted-foreground">
                  {#if activeTab === 'camera'}
                    {#if isScanning}
                      Align a barcode in the camera frame
                    {:else if showPermissionDenied}
                      Camera access is blocked
                    {:else}
                      Grant camera access to start scanning
                    {/if}
                  {:else}
                    Upload an image containing a barcode
                  {/if}
                </p>
              </div>
            {/if}
          </div>

          {#if scannerResult}
            <div class="space-y-3 pt-4 border-t border-border/40">
              <button
                onclick={resetScanner}
                class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border border-input hover:bg-accent hover:text-accent-foreground transition-all duration-300 active:scale-95"
              >
                <RefreshCw class="w-4 h-4" />
                Scan Again
              </button>
            </div>
          {/if}
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Supported Formats Strip -->
  <div class="mt-6 rounded-2xl border border-border/60 bg-muted/40 p-5 space-y-5">
    <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Supported Formats</span>

    <!-- 1D Linear -->
    <div class="space-y-2">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">1D Linear Barcodes</p>
      <div class="flex flex-wrap gap-1.5">
        {#each [
          'Code 128', 'Code 39', 'Code 93', 'Codabar',
          'EAN-13', 'EAN-8', 'UPC-A', 'UPC-E', 'ITF',
          'RSS-14', 'RSS Expanded'
        ] as fmt (fmt)}
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
            <svg class="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M3 5h2M7 5h1M12 5h1M16 5h2M3 12h2M7 12h1M12 12h1M16 12h2M3 19h2M7 19h1M12 19h1M16 19h2"/>
            </svg>
            {fmt}
          </span>
        {/each}
      </div>
    </div>

    <!-- 2D Matrix -->
    <div class="space-y-2">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">2D Matrix &amp; Stacked</p>
      <div class="flex flex-wrap gap-1.5">
        {#each [
          'QR Code', 'Data Matrix', 'PDF 417', 'Aztec', 'MaxiCode', 'UPC/EAN Extension'
        ] as fmt (fmt)}
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/25">
            <svg class="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 7v10M7 12h10"/>
            </svg>
            {fmt}
          </span>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes scanline {
    0%   { transform: translateY(0); opacity: 1; }
    45%  { transform: translateY(192px); opacity: 1; }
    50%  { opacity: 0; }
    55%  { transform: translateY(0); opacity: 0; }
    60%  { opacity: 1; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
</style>
