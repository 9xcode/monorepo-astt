<script lang="ts">
  let { content = $bindable('') }: { content: string } = $props();

  let to      = $state('');
  let subject = $state('');
  let body    = $state('');
  let cc      = $state('');

  const computed = $derived.by(() => {
    const email = to.trim();
    if (!email || !email.includes('@')) return '';
    const params: string[] = [];
    if (cc.trim())      params.push(`cc=${encodeURIComponent(cc.trim())}`);
    if (subject.trim()) params.push(`subject=${encodeURIComponent(subject.trim())}`);
    if (body.trim())    params.push(`body=${encodeURIComponent(body.trim())}`);
    return `mailto:${email}${params.length ? '?' + params.join('&') : ''}`;
  });

  $effect(() => { content = computed; });

  const I  = 'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200';
  const TA = I + ' resize-none';
  const L  = 'block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5';
</script>

<div class="space-y-4">
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label for="email-to" class={L}>
        To (Email) <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
      </label>
      <input id="email-to" type="email" bind:value={to} placeholder="recipient@example.com" class={I} autocomplete="email" />
    </div>
    <div>
      <label for="email-cc" class={L}>CC (optional)</label>
      <input id="email-cc" type="email" bind:value={cc} placeholder="cc@example.com" class={I} autocomplete="email" />
    </div>
  </div>

  <div>
    <label for="email-subject" class={L}>Subject (optional)</label>
    <input id="email-subject" type="text" bind:value={subject} placeholder="Hello from my QR code!" class={I} />
  </div>

  <div>
    <label for="email-body" class={L}>Message Body (optional)</label>
    <textarea id="email-body" bind:value={body} rows={5} placeholder="Write your pre-filled message here…" class={TA}></textarea>
  </div>

  {#if computed}
    <div class="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Encoded as</p>
      <p class="text-xs text-muted-foreground break-all font-mono leading-relaxed">{computed}</p>
    </div>
  {:else if to && !to.includes('@')}
    <p class="text-xs text-yellow-600 dark:text-yellow-400">Enter a valid email address to generate the QR code.</p>
  {/if}
</div>
