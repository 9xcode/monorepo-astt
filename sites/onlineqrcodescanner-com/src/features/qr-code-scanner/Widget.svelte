<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import jsQR from 'jsqr';
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { cn } from "$lib/utils";

  // Lucide Svelte imports
  import { 
    Camera, Upload, Copy, ExternalLink, RefreshCw, AlertTriangle, Check, CameraOff, ShieldCheck,
    Link, Contact, Wifi, Mail, Phone, MessageSquare, MessageCircle, Bitcoin, Type, Download
  } from '@lucide/svelte';

  // ─── State ────────────────────────────────────────────────────────────────────

  type CameraPermission = 'unknown' | 'prompt' | 'granted' | 'denied';

  let activeTab = $state<'camera' | 'upload'>('upload');
  let isDragging = $state(false);
  let scannerResult = $state('');
  let scannedImage = $state('');
  let isScanning = $state(false);
  let errorMsg = $state('');
  let isCopied = $state(false);
  let cameraPermission = $state<CameraPermission>('unknown');
  let isRequestingPermission = $state(false);
  let isInsecureContext = $state(false);
  let activeResultTab = $state<'formatted' | 'raw'>('formatted');

  $effect(() => {
    if (scannerResult) {
      activeResultTab = 'formatted';
    }
  });

  let videoEl = $state<HTMLVideoElement | null>(null);
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let stream = $state<MediaStream | null>(null);
  let animationFrameId = $state<number | null>(null);

  let lastDetectedCode = '';
  let firstDetectionTime = 0;

  function handleSuccessfulScan(rawValue: string) {
    if (rawValue === lastDetectedCode) {
      if (performance.now() - firstDetectionTime > 400) {
        if (canvasEl) scannedImage = canvasEl.toDataURL('image/jpeg');
        scannerResult = rawValue;
        stopCamera();
        triggerSuccessBeep();
        lastDetectedCode = '';
        firstDetectionTime = 0;
        return true;
      }
    } else {
      lastDetectedCode = rawValue;
      firstDetectionTime = performance.now();
    }
    return false;
  }

  // ─── Derived ──────────────────────────────────────────────────────────────────

  function parseQR(text: string) {
    if (!text) return null;
    const t = text.trim();
    
    // URL
    if (t.match(/^https?:\/\//i) && !t.toLowerCase().includes('wa.me/')) {
      return { type: 'url', icon: Link, title: 'Website URL', mainValue: t, fields: [], action: { label: 'Open Link', icon: ExternalLink, href: t } };
    }
    
    // Wi-Fi
    if (t.toUpperCase().startsWith('WIFI:')) {
      const ssidMatch = t.match(/S:(.*?);/i);
      const passMatch = t.match(/P:(.*?);/i);
      const typeMatch = t.match(/T:(.*?);/i);
      const ssid = ssidMatch ? ssidMatch[1] : 'Unknown Network';
      return {
        type: 'wifi', icon: Wifi, title: 'Wi-Fi Network', mainValue: ssid,
        fields: [
          { label: 'Network Name (SSID)', value: ssid },
          { label: 'Password', value: passMatch ? passMatch[1] : 'None' },
          { label: 'Security', value: typeMatch ? typeMatch[1] : 'WPA' }
        ].filter(f => f.value),
        action: null
      };
    }
    
    // vCard
    if (t.toUpperCase().startsWith('BEGIN:VCARD')) {
      const fnMatch = t.match(/^FN:(.*?)(?:\r?\n|$)/mi);
      const telMatch = t.match(/^TEL.*?:(.*?)(?:\r?\n|$)/mi);
      const emailMatch = t.match(/^EMAIL.*?:(.*?)(?:\r?\n|$)/mi);
      const orgMatch = t.match(/^ORG:(.*?)(?:\r?\n|$)/mi);
      const titleMatch = t.match(/^TITLE:(.*?)(?:\r?\n|$)/mi) || t.match(/^ROLE:(.*?)(?:\r?\n|$)/mi);
      const adrMatch = t.match(/^ADR.*?:(.*?)(?:\r?\n|$)/mi);
      const urlMatch = t.match(/^URL.*?:(.*?)(?:\r?\n|$)/mi);
      const noteMatch = t.match(/^NOTE:(.*?)(?:\r?\n|$)/mi);

      const address = adrMatch?.[1]
        ? adrMatch[1].replace(/;+/g, ' ').replace(/\s+/g, ' ').trim()
        : '';

      return {
        type: 'vcard', icon: Contact, title: 'Contact Card', mainValue: fnMatch?.[1]?.trim() ?? 'Contact',
        fields: [
          { label: 'Name', value: fnMatch?.[1]?.trim() ?? '' },
          { label: 'Phone', value: telMatch?.[1]?.trim() ?? '' },
          { label: 'Email', value: emailMatch?.[1]?.trim() ?? '' },
          { label: 'Organization', value: orgMatch?.[1]?.trim() ?? '' },
          { label: 'Title / Role', value: titleMatch?.[1]?.trim() ?? '' },
          { label: 'Address', value: address },
          { label: 'Website', value: urlMatch?.[1]?.trim() ?? '' },
          { label: 'Note', value: noteMatch?.[1]?.trim() ?? '' }
        ].filter(f => f.value),
        action: { label: 'Save Contact', icon: Download, isVcard: true, href: '' }
      };
    }
    
    // Email
    if (t.toLowerCase().startsWith('mailto:')) {
      const email = t.substring(7).split('?')[0];
      return { type: 'email', icon: Mail, title: 'Email Address', mainValue: email, fields: [{ label: 'To', value: email }], action: { label: 'Send Email', icon: Mail, href: t } };
    }
    
    // Phone
    if (t.toLowerCase().startsWith('tel:')) {
      const phone = t.substring(4);
      return { type: 'phone', icon: Phone, title: 'Phone Number', mainValue: phone, fields: [{ label: 'Number', value: phone }], action: { label: 'Call Number', icon: Phone, href: t } };
    }
    
    // SMS
    if (t.toLowerCase().startsWith('smsto:')) {
      const parts = t.substring(6).split(':');
      return {
        type: 'sms', icon: MessageSquare, title: 'SMS Message', mainValue: parts[0],
        fields: [
          { label: 'To', value: parts[0] },
          { label: 'Message', value: parts.slice(1).join(':') || '' }
        ].filter(f => f.value),
        action: { label: 'Send SMS', icon: MessageSquare, href: t }
      };
    }
    
    // WhatsApp
    if (t.toLowerCase().startsWith('https://wa.me/') || t.toLowerCase().startsWith('whatsapp:')) {
      return { type: 'whatsapp', icon: MessageCircle, title: 'WhatsApp', mainValue: 'WhatsApp Chat', fields: [{ label: 'Link', value: t }], action: { label: 'Open WhatsApp', icon: MessageCircle, href: t } };
    }
    
    // Bitcoin
    if (t.toLowerCase().startsWith('bitcoin:')) {
      const addr = t.substring(8).split('?')[0];
      return { type: 'bitcoin', icon: Bitcoin, title: 'Bitcoin Address', mainValue: addr, fields: [{ label: 'Address', value: addr }], action: null };
    }
    
    // Plain Text
    return { type: 'text', icon: Type, title: 'Plain Text', mainValue: t.length > 30 ? t.substring(0, 30) + '...' : t, fields: [], action: null };
  }

  let parsedData = $derived(parseQR(scannerResult));

  // Show the "Allow Camera" prompt when: permission is unknown/prompt and camera not active
  let showPermissionPrompt = $derived(
    activeTab === 'camera' &&
    !isScanning &&
    !scannerResult &&
    (cameraPermission === 'unknown' || cameraPermission === 'prompt')
  );

  // Show denied state
  let showPermissionDenied = $derived(
    activeTab === 'camera' &&
    !isScanning &&
    !scannerResult &&
    cameraPermission === 'denied'
  );

  // ─── Camera Permission Check ───────────────────────────────────────────────────

  async function checkPermissionStatus(): Promise<CameraPermission> {
    if (typeof navigator === 'undefined' || !navigator.permissions) return 'unknown';
    try {
      const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return status.state as CameraPermission;
    } catch {
      // Firefox and Safari don't support querying camera permission directly via query
      return 'unknown';
    }
  }

  // ─── Camera Functions ─────────────────────────────────────────────────────────

  async function startCamera() {
    await tick();
    errorMsg = '';
    scannerResult = '';
    scannedImage = '';
    isScanning = false;
    isRequestingPermission = true;

    if (stream) stopCamera();

    // Check for secure context compatibility
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      isRequestingPermission = false;
      cameraPermission = 'denied';
      isInsecureContext = true;
      isScanning = false;
      return;
    }

    // High compatibility constraints array
    const constraintOptions: any[] = [
      { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 }, advanced: [{ focusMode: 'continuous' }] } },
      { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment', advanced: [{ focusMode: 'continuous' }] } },
      { video: { facingMode: 'environment' } },
      { video: { facingMode: 'user' } },
      { video: true }
    ];

    let lastError: any = null;
    for (const constraints of constraintOptions) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break; // Found working stream
      } catch (err) {
        lastError = err;
      }
    }

    if (!stream) {
      isRequestingPermission = false;
      console.error("All getUserMedia attempts failed:", lastError);

      if (lastError && (lastError.name === 'NotAllowedError' || lastError.name === 'PermissionDeniedError')) {
        cameraPermission = 'denied';
        errorMsg = '';
      } else if (lastError && (lastError.name === 'NotFoundError' || lastError.name === 'DevicesNotFoundError')) {
        cameraPermission = 'denied';
        errorMsg = 'No camera found on this device. Please upload an image instead.';
      } else if (lastError && (lastError.name === 'NotReadableError' || lastError.name === 'TrackStartError')) {
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
        videoEl.setAttribute('playsinline', 'true'); // required for iOS
        await videoEl.play();
        isScanning = true;
        scanFrame();
      }
    } catch (playErr) {
      console.error("Video play failed:", playErr);
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

            let foundCode = null;

            // Strategy 1: BarcodeDetector (native, handles dense codes)
            if (hasBarcodeDetector) {
              try {
                const bitmap = await createImageBitmap(canvasEl);
                // @ts-ignore
                const detector = new BarcodeDetector({ formats: ['qr_code'] });
                const codes = await detector.detect(bitmap);
                bitmap.close();
                if (codes.length > 0 && codes[0].rawValue) {
                  foundCode = codes[0].rawValue;
                }
              } catch {
                // Fall through to jsQR
              }
            }

            // Strategy 2: jsQR
            if (!foundCode) {
              const imageData = ctx.getImageData(0, 0, width, height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth'
              });
              if (code && code.data) {
                foundCode = code.data;
              }
            }

            if (foundCode) {
              if (handleSuccessfulScan(foundCode)) return;
            } else {
              lastDetectedCode = '';
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
      const fontGain = audioCtx.createGain();
      oscillator.connect(fontGain);
      fontGain.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1046, audioCtx.currentTime);
      fontGain.gain.setValueAtTime(0.07, audioCtx.currentTime);
      fontGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext blocked or not supported — silent fail
    }
  }

  // ─── Image Upload ─────────────────────────────────────────────────────────────

  /** Check if the browser-native BarcodeDetector API is available */
  const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  /**
   * Apply contrast enhancement to a canvas context before passing to jsQR.
   * Boosts contrast so jsQR can resolve modules in dense QR codes.
   */
  function enhanceContrast(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    // Simple contrast stretch: darken dark pixels, lighten light pixels
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * (d[i] ?? 0) + 0.587 * (d[i + 1] ?? 0) + 0.114 * (d[i + 2] ?? 0);
      const v = lum < 128 ? Math.max(0, lum - 40) : Math.min(255, lum + 40);
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
  }

  /**
   * Attempt jsQR decode at multiple scales.
   * Resizing large images helps jsQR find finder patterns in dense codes.
   */
  function tryJsQR(src: HTMLImageElement | HTMLCanvasElement): string | null {
    const scales = [1, 0.75, 1.5, 0.5];
    const tmp = document.createElement('canvas');
    const tctx = tmp.getContext('2d')!;

    const srcW = src instanceof HTMLImageElement ? src.naturalWidth  : src.width;
    const srcH = src instanceof HTMLImageElement ? src.naturalHeight : src.height;

    for (const scale of scales) {
      const w = Math.round(srcW * scale);
      const h = Math.round(srcH * scale);
      tmp.width  = w;
      tmp.height = h;
      tctx.drawImage(src, 0, 0, w, h);

      // Try raw then contrast-enhanced
      for (let pass = 0; pass < 2; pass++) {
        if (pass === 1) enhanceContrast(tctx, w, h);
        const id = tctx.getImageData(0, 0, w, h);
        const code = jsQR(id.data, id.width, id.height, { inversionAttempts: 'attemptBoth' });
        if (code?.data) return code.data;
      }
    }
    return null;
  }

  async function processImageFile(file: File): Promise<void> {
    errorMsg = '';
    scannerResult = '';
    scannedImage = '';

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;

        // ── Strategy 1: BarcodeDetector (native, best for dense QR codes) ──
        if (hasBarcodeDetector) {
          try {
            // @ts-ignore — BarcodeDetector is not in all TS libs yet
            const detector = new BarcodeDetector({ formats: ['qr_code'] });
            const bitmap   = await createImageBitmap(file);
            const codes    = await detector.detect(bitmap);
            bitmap.close();
            if (codes.length > 0 && codes[0].rawValue) {
              scannedImage = dataUrl;
              scannerResult = codes[0].rawValue;
              triggerSuccessBeep();
              resolve();
              return;
            }
          } catch {
            // BarcodeDetector failed — fall through to jsQR
          }
        }

        // ── Strategy 2: jsQR with multi-scale + contrast enhancement ──
        const img = new Image();
        img.onload = () => {
          const result = tryJsQR(img);
          if (result) {
            scannedImage = dataUrl;
            scannerResult = result;
            triggerSuccessBeep();
          } else {
            errorMsg = 'No QR code found. Try uploading a higher-resolution image or improve lighting/contrast.';
          }
          resolve();
        };
        img.onerror = () => {
          errorMsg = 'Could not read the image file. Please try a different image.';
          resolve();
        };
        img.src = dataUrl;
      };
      reader.onerror = () => resolve();
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    // Reset so same file can be re-uploaded
    input.value = '';
    await processImageFile(file);
  }

  async function handlePaste(event: ClipboardEvent) {
    // Avoid intercepting if focus is in an input/textarea
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          // Switch to upload tab for visual feedback
          await setTab('upload');
          await processImageFile(file);
          break;
        }
      }
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  async function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    if (e.dataTransfer?.files?.[0]) {
      await processImageFile(e.dataTransfer.files[0]);
    }
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  function copyToClipboard() {
    if (scannerResult) {
      navigator.clipboard.writeText(scannerResult).catch(() => {
        // Fallback
      });
      isCopied = true;
      setTimeout(() => { isCopied = false; }, 2000);
    }
  }

  function downloadVcard() {
    if (!scannerResult) return;
    const blob = new Blob([scannerResult], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact.vcf';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function resetScanner() {
    scannerResult = '';
    scannedImage = '';
    errorMsg = '';
    if (activeTab === 'camera') {
      startCamera();
    }
  }

  async function setTab(tab: 'camera' | 'upload') {
    if (activeTab === tab) return;
    stopCamera();
    scannerResult = '';
    scannedImage = '';
    errorMsg = '';
    activeTab = tab;

    if (tab === 'camera') {
      await tick();
      // On tab switch, if permission status was already queryable as granted, auto start
      if (cameraPermission === 'granted' && !isInsecureContext) {
        startCamera();
      }
    }
  }

  function requestCameraPermission() {
    startCamera();
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  onMount(async () => {
    // Check for Secure Context using the standard API
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      isInsecureContext = true;
      cameraPermission = 'denied';
      return;
    }

    const status = await checkPermissionStatus();
    cameraPermission = status;

    if (typeof window !== 'undefined') {
      window.addEventListener('paste', handlePaste);
    }

    if (activeTab === 'camera') {
      await tick();
      if (status === 'granted') {
        startCamera();
      }
    }
  });

  onDestroy(() => {
    stopCamera();
    if (typeof window !== 'undefined') {
      window.removeEventListener('paste', handlePaste);
    }
  });
</script>

<div class="w-full max-w-4xl mx-auto space-y-6">
  <!-- Hidden canvas for QR processing -->
  <canvas bind:this={canvasEl} class="hidden"></canvas>

  <div class="grid gap-6 md:grid-cols-5">
    <!-- Main Interactive Area -->
    <div class="md:col-span-2">
      <Card class="overflow-hidden border border-border/80 shadow-lg bg-card">
        <CardContent class="p-0 relative">
          {#if activeTab === 'camera'}
            <!-- Aspect Ratio Box on desktop / Auto-adjusting with minimum height on mobile -->
            <div class={cn(
              "relative w-full flex items-center justify-center overflow-hidden transition-all duration-500",
              isScanning || scannedImage
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

              <!-- Scanned Image Snapshot -->
              {#if scannedImage}
                <img
                  src={scannedImage}
                  alt="Scanned QR Code"
                  class="absolute inset-0 w-full h-full object-cover brightness-[0.3] transition-opacity duration-300"
                />
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 animate-in fade-in zoom-in duration-300">
                  <div class="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center backdrop-blur-md mb-3 border border-emerald-500/30">
                    <Check class="w-8 h-8 text-emerald-500" />
                  </div>
                  
                  <button
                    onclick={resetScanner}
                    class="mt-6 pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 shadow-xl transition-all duration-200 active:scale-95"
                  >
                    <RefreshCw class="w-4 h-4" />
                    Scan Another QR
                  </button>
                </div>
              {/if}

              <!-- Stop Camera Button Overlay -->
              {#if isScanning}
                <button
                  onclick={() => setTab('upload')}
                  class="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 transition-all duration-200 active:scale-95 flex items-center gap-1.5 text-xs font-medium"
                >
                  <CameraOff class="w-3.5 h-3.5" />
                  Stop Camera
                </button>
              {/if}

              <!-- Scan Overlay Frame -->
              {#if isScanning && !scannerResult}
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="relative w-64 h-64 max-w-[75%] max-h-[75%]">
                    <!-- Animated scan line -->
                    <div class="absolute inset-x-4 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.9)]" style="animation: scanline 1.8s ease-in-out infinite;"></div>

                    <!-- Corner brackets -->
                    <div class="absolute -top-0.5 -left-0.5 w-7 h-7 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-md"></div>
                    <div class="absolute -top-0.5 -right-0.5 w-7 h-7 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-md"></div>
                    <div class="absolute -bottom-0.5 -left-0.5 w-7 h-7 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-md"></div>
                    <div class="absolute -bottom-0.5 -right-0.5 w-7 h-7 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-md"></div>

                    <!-- Center hint -->
                    <div class="absolute inset-0 border border-dashed border-emerald-500/20 rounded-sm"></div>
                  </div>
                </div>
              {/if}

              <!-- Permission Prompt (not yet asked or awaiting user gesture) -->
              {#if showPermissionPrompt}
                <div class="z-10 flex flex-col items-center text-center space-y-4 px-6 md:px-8">
                  <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/25 flex items-center justify-center">
                    <Camera class="w-6 h-6 md:w-8 md:h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div class="space-y-1">
                    <p class="text-foreground font-semibold text-sm">Camera Access Required</p>
                    <p class="text-muted-foreground text-xs leading-relaxed max-w-[240px]">
                      Allow camera access to scan QR codes in real time. No image or stream data is ever saved or sent online.
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

              <!-- Permission Denied State (or Insecure HTTP State) -->
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
                        ? 'Web browsers disable camera access over plain HTTP connections. Please switch to an HTTPS url or run on localhost to test live camera scanning.' 
                        : 'Camera permission was denied. Please change browser permissions or reset site setting block in your browser address bar.'}
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

              <!-- General error (device busy, not found, etc.) — only shown when permission is not denied -->
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

              <!-- Requesting permission loading state -->
              {#if isRequestingPermission && !isScanning}
                <div class="z-20 absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 backdrop-blur-sm">
                  <RefreshCw class="w-7 h-7 text-emerald-500 animate-spin" />
                  <p class="text-muted-foreground text-xs font-medium">Waiting for camera permission…</p>
                </div>
              {/if}
            </div>

          {:else}
            <!-- Image Upload / Options Unified Content -->
            <div
              role="region"
              aria-label="File drop zone"
              ondragover={handleDragOver}
              ondragleave={handleDragLeave}
              ondrop={handleDrop}
              class={cn(
                "flex flex-col items-center justify-center aspect-[4/3] p-6 border-2 border-dashed rounded-xl transition-all duration-300 relative text-center",
                isDragging
                  ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 scale-[0.99]"
                  : "border-border/80 bg-gradient-to-br from-emerald-500/5 via-muted/30 to-emerald-500/5 dark:from-emerald-500/10 dark:via-neutral-900/60 dark:to-emerald-500/10 hover:border-emerald-500/40"
              )}
            >
              <input
                id="qr-file-upload"
                type="file"
                accept="image/*"
                onchange={handleImageUpload}
                class="sr-only"
              />
              <div class="flex flex-col items-center space-y-3.5 w-full max-w-[260px]">
                <div class="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                  <Camera class="w-6 h-6" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-foreground">Scan QR Code</p>
                  <p class="text-xs text-muted-foreground mt-1">Scan using your camera or upload an image file</p>
                </div>
                <div class="flex flex-col gap-2 w-full pt-1">
                  <button
                    onclick={() => setTab('camera')}
                    class="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-all duration-200 active:scale-95"
                  >
                    <Camera class="w-3.5 h-3.5" />
                    Scan with Camera
                  </button>
                  <label
                    for="qr-file-upload"
                    class="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <Upload class="w-3.5 h-3.5" />
                    Upload Image
                  </label>
                </div>
                <p class="text-[10px] text-muted-foreground leading-normal mt-0.5">
                  or drag & drop your image here, or paste from clipboard
                </p>
              </div>
              
              <!-- Scanned Image Snapshot for Upload Tab -->
              {#if scannedImage}
                <div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-10 animate-in fade-in duration-300">
                  <img
                    src={scannedImage}
                    alt="Uploaded QR Code"
                    class="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
                  />
                  <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
                    <div class="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center backdrop-blur-md mb-3 border border-emerald-500/30 animate-in zoom-in duration-300">
                      <Check class="w-8 h-8 text-emerald-500" />
                    </div>
                    <button
                      onclick={resetScanner}
                      class="mt-6 pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-100 shadow-xl transition-all duration-200 active:scale-95 animate-in zoom-in duration-300"
                    >
                      <RefreshCw class="w-4 h-4" />
                      Upload Another Image
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {/if}
        </CardContent>
      </Card>
    </div>

    <!-- Right Side: Status and Results Panel -->
    <div class="md:col-span-3 flex flex-col justify-stretch">
      <Card class="flex-1 border border-border/80 shadow-md bg-card flex flex-col justify-between">
        <CardHeader class="pb-3 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
          <CardTitle class="text-base font-semibold flex items-center gap-2">
            <span class={cn(
              "w-2.5 h-2.5 rounded-full transition-colors duration-300",
              scannerResult ? "bg-emerald-500" : isScanning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/40"
            )}></span>
            Scan Result
          </CardTitle>
          {#if scannerResult}
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 7v10M7 12h10"/>
              </svg>
              QR Code
            </span>
          {/if}
        </CardHeader>
        <CardContent class="flex-1 p-6 flex flex-col justify-between space-y-6">
          <div class="space-y-4 flex-1">

            <!-- Upload tab error shown here -->
            {#if errorMsg && activeTab === 'upload'}
              <div class="flex gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm leading-relaxed">
                <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            {/if}

            {#if scannerResult && parsedData}
              <div class="space-y-4">
                {#if parsedData.type !== 'text'}
                  <!-- Sub-tabs for Results -->
                  <div class="flex p-0.5 bg-muted rounded-lg border border-border/40 max-w-[200px]">
                    <button
                      onclick={() => activeResultTab = 'formatted'}
                      class={cn(
                        "flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all duration-200",
                        activeResultTab === 'formatted'
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Formatted
                    </button>
                    <button
                      onclick={() => activeResultTab = 'raw'}
                      class={cn(
                        "flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition-all duration-200",
                        activeResultTab === 'raw'
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Raw Data
                    </button>
                  </div>
                {/if}

                {#if parsedData.type === 'text' || activeResultTab === 'raw'}
                  <!-- Raw Data & Copy -->
                  <div class="space-y-3">
                    <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                      {parsedData.type === 'text' ? 'Decoded Text' : 'Raw Data'}
                    </p>
                    <div class="relative group">
                      <div class="w-full min-h-[100px] max-h-[220px] overflow-y-auto p-4 pr-12 rounded-xl border border-border/80 bg-muted/50 font-mono text-sm break-all leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/20 select-text">
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
                {:else if activeResultTab === 'formatted'}
                  <!-- Parsed Structured Output -->
                  {@const ParsedIcon = parsedData.icon}
                  <div class="w-full bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <!-- Header -->
                    <div class="flex items-center gap-3.5 pb-4 border-b border-border/40">
                      <div class="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <ParsedIcon class="w-6 h-6" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{parsedData.title}</p>
                        <p class="text-base font-semibold text-foreground truncate mt-0.5">{parsedData.mainValue}</p>
                      </div>
                    </div>

                    <!-- Fields -->
                    {#if parsedData.fields.length > 0}
                      <div class="grid gap-3 pt-1">
                        {#each parsedData.fields as field (field.label)}
                          <div class="flex flex-col">
                            <span class="text-[10px] font-bold uppercase text-muted-foreground mb-0.5">{field.label}</span>
                            <span class="text-sm font-medium text-foreground break-words">{field.value}</span>
                          </div>
                        {/each}
                      </div>
                    {/if}

                    <!-- Actions -->
                    {#if parsedData.action}
                      {@const ActionIcon = parsedData.action.icon}
                      <div class="pt-2">
                        {#if parsedData.action.isVcard}
                          <button
                            onclick={downloadVcard}
                            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-all duration-300 active:scale-[0.98]"
                          >
                            <ActionIcon class="w-4 h-4" />
                            {parsedData.action.label}
                          </button>
                        {:else}
                          <a
                            href={parsedData.action.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-all duration-300 active:scale-[0.98]"
                          >
                            <ActionIcon class="w-4 h-4" />
                            {parsedData.action.label}
                          </a>
                        {/if}
                      </div>
                    {/if}
                  </div>
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
                      Align a QR code in the camera frame
                    {:else if showPermissionDenied}
                      Camera access is blocked
                    {:else}
                      Grant camera access to start scanning
                    {/if}
                  {:else}
                    Upload an image containing a QR code
                  {/if}
                </p>
              </div>
            {/if}
          </div>

          <!-- Button moved to image overlay -->
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Supported Formats & Types -->
  <div class="mt-8 pt-6 border-t border-border/40 space-y-3">
    <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Recognized QR Code Formats & Data Types</p>
    <div class="flex flex-wrap gap-1.5 justify-center max-w-2xl mx-auto">
      {#each [
        'URL / Link', 'Wi-Fi Network', 'Contact (vCard)',
        'Email', 'Phone Number', 'SMS / Text',
        'WhatsApp / Chat', 'Location (Geo)', 'Calendar Event',
        'Bitcoin / Crypto', 'UPI / Payment', 'Plain Text',
        'Social Media', 'many more'
      ] as type (type)}
        <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/40">{type}</span>
      {/each}
    </div>
  </div>
</div>

<style>
  @keyframes scanline {
    0%   { transform: translateY(0); opacity: 1; }
    45%  { transform: translateY(256px); opacity: 1; }
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
