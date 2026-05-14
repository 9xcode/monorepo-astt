<script lang="ts">
  /**
   * Example Tool Widget
   * Demonstrates Svelte 5 state management, derived values, and Tailwind UI patterns.
   */
  
  // Svelte 5 State
  let text = $state("");
  
  // Derived Values (Reactive Stats)
  const stats = $derived({
    chars: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0
  });

  // Actions
  function toUpperCase() {
    text = text.toUpperCase();
  }

  function toLowerCase() {
    text = text.toLowerCase();
  }

  function toTitleCase() {
    text = text.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  function clear() {
    text = "";
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(text);
      alert("Text copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }
</script>

<div class="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
  <!-- Input Section -->
  <div class="space-y-2">
    <label for="input-text" class="block text-sm font-semibold text-slate-700">
      Input Text
    </label>
    <textarea
      id="input-text"
      bind:value={text}
      placeholder="Type or paste your text here..."
      rows="6"
      class="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
    ></textarea>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-3 gap-4">
    <div class="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-center">
      <span class="block text-xs font-medium text-indigo-600 uppercase tracking-wider">Words</span>
      <span class="text-2xl font-bold text-indigo-900">{stats.words}</span>
    </div>
    <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
      <span class="block text-xs font-medium text-emerald-600 uppercase tracking-wider">Chars</span>
      <span class="text-2xl font-bold text-emerald-900">{stats.chars}</span>
    </div>
    <div class="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
      <span class="block text-xs font-medium text-amber-600 uppercase tracking-wider">Sentences</span>
      <span class="text-2xl font-bold text-amber-900">{stats.sentences}</span>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex flex-wrap gap-2">
    <button
      onclick={toUpperCase}
      class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 active:scale-95 transition-all text-sm font-medium"
    >
      UPPERCASE
    </button>
    <button
      onclick={toLowerCase}
      class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 active:scale-95 transition-all text-sm font-medium"
    >
      lowercase
    </button>
    <button
      onclick={toTitleCase}
      class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 active:scale-95 transition-all text-sm font-medium"
    >
      Title Case
    </button>
    <button
      onclick={copyToClipboard}
      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 active:scale-95 transition-all text-sm font-medium ml-auto"
    >
      Copy
    </button>
    <button
      onclick={clear}
      class="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 active:scale-95 transition-all text-sm font-medium"
    >
      Clear
    </button>
  </div>
</div>
