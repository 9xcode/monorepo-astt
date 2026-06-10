<script lang="ts">
  let { content = $bindable('') }: { content: string } = $props();

  let text = $state('');

  const MAX = 2000;

  const computed = $derived(text.trim());
  $effect(() => { content = computed; });

  const I = 'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200 resize-none';
</script>

<div class="space-y-4">
  <div class="space-y-1.5">
    <div class="flex items-center justify-between">
      <label for="text-input" class="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Text Content <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
      </label>
      <span class={[
        'text-[10px] font-mono tabular-nums transition-colors',
        text.length > MAX * 0.85 ? 'text-yellow-500' : 'text-muted-foreground/50'
      ].join(' ')}>
        {text.length}/{MAX}
      </span>
    </div>
    <textarea
      id="text-input"
      bind:value={text}
      maxlength={MAX}
      rows={8}
      placeholder="Enter any text, a message, coupon code, or plain data..."
      class={I}
    ></textarea>
    <p class="text-[11px] text-muted-foreground/60 leading-relaxed">
      Encode a plain message, note, promo code, or any text string up to 2,000 characters.
    </p>
  </div>

  {#if computed}
    <div class="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
      <p class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">Preview</p>
      <p class="text-xs text-muted-foreground leading-relaxed line-clamp-3">{computed}</p>
    </div>
  {/if}
</div>
