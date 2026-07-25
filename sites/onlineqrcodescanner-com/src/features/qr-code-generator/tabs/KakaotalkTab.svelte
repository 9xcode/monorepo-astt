<script lang="ts">
  import { formatUrl } from './utils';

  let { content = $bindable('') }: { content: string } = $props();

  let url = $state('');

  const computed = $derived.by(() => {
    return formatUrl(url);
  });

  $effect(() => { content = computed; });

  const I = 'w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200 font-mono';
</script>

<div class="space-y-5">
  <div class="space-y-1.5">
    <label for="kakaotalk-input" class="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      KakaoTalk Open Chat Link <span class="text-emerald-500 normal-case tracking-normal font-medium ml-0.5">*</span>
    </label>
    <input
      id="kakaotalk-input"
      type="url"
      bind:value={url}
      placeholder="https://open.kakao.com/o/xxxxx"
      class={I}
      autocomplete="url"
      spellcheck={false}
    />
    <p class="text-[11px] text-muted-foreground/60 leading-relaxed">
      Encode a link to your KakaoTalk profile or page.
    </p>
  </div>

  {#if computed}
    <div class="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
      <span class="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
      <p class="text-xs text-muted-foreground break-all leading-relaxed font-mono">{computed}</p>
    </div>
  {/if}
</div>
