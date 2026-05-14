<script lang="ts">
  /**
   * ErrorBoundary — Wraps Svelte components to catch runtime errors gracefully.
   * Responsive: Adapts to any container by truncating text in small spaces,
   * while expanding beautifully in large containers.
   * 
   * Usage:
   *   <ErrorBoundary>
   *     <MyWidget />
   *   </ErrorBoundary>
   * 
   * To Test This: Open browser console and paste the following code:
   * ```
        window.dispatchEvent(new ErrorEvent('error', { error: new Error('Simulated Global Crash') }));
   * ```
   */
  import { AlertCircle } from '@lucide/svelte';

  let { children } = $props<{ children?: any }>();

  let hasError = $state(false);
  let errorMessage = $state("");

  // Svelte 5 error boundary via global window listener
  $effect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && !hasError) {
        hasError = true;
        errorMessage = event.error?.message || "Unknown error";
        event.preventDefault(); // Prevent console noise
      }
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  });

  function retry() {
    hasError = false;
    errorMessage = "";
    window.location.reload();
  }
</script>

{#if hasError}
  <button 
    class="flex w-full min-w-0 items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed border-destructive/30 bg-destructive/5 p-2 text-destructive/90 transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive"
    onclick={retry}
    title={errorMessage ? `Error: ${errorMessage}. Click to retry.` : "Something went wrong. Click to retry."}
    aria-label="Retry component"
  >
    <AlertCircle class="size-4 shrink-0" />
    <span class="truncate text-sm font-medium">
      Something went wrong. Refresh or <span class="font-bold underline underline-offset-2 hover:text-destructive">click to retry.</span>
    </span>
  </button>
{:else}
  {@render children?.()}
{/if}
