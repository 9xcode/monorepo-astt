<script lang="ts">
  import { Sun, Moon } from '@lucide/svelte';
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";

  let isDark = $state(true);

  onMount(() => {
    isDark = document.documentElement.classList.contains("dark");
  });

  function toggleTheme() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
</script>

<Button
  variant="ghost"
  size="icon"
  onclick={toggleTheme}
  class="relative h-9 w-9 overflow-hidden rounded-full hover:bg-accent hover:text-accent-foreground"
  aria-label="Toggle theme"
>
  <span class="sr-only">Toggle theme</span>
  {#if isDark}
    <Moon
      class="h-[1.2rem] w-[1.2rem] transition-all duration-300 transform"
    />
  {:else}
    <Sun
      class="h-[1.2rem] w-[1.2rem] transition-all duration-300 transform"
    />
  {/if}
</Button>
