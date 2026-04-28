<script lang="ts">
  import { onMount } from "svelte";
  import { siteConfig } from "../../../config";
  import { fetchTools, fetchBlogs } from "../../../utils/searchStore.svelte";

  let ContentComponent: any = $state(null);
  let open = $state(false);

  async function handleOpen() {
    if (!ContentComponent) {
      ContentComponent = (await import("./SearchDialogContent.svelte")).default;
    }
    open = true;
  }

  onMount(() => {
    const prefetch = async () => {
      // 1. Prefetch component
      ContentComponent = (await import("./SearchDialogContent.svelte")).default;
      
      // 2. Prefetch data into the shared store (fetched & parsed only once).
      const defaultTab = siteConfig.features.search.defaultTab;
      if (defaultTab === 'all' || defaultTab === 'tools') {
        fetchTools().catch(() => {});
      }
      if (defaultTab === 'all' || defaultTab === 'blog') {
        fetchBlogs().catch(() => {});
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 1000);
    }

    function handleKeydown(e: KeyboardEvent) {
      // Ignore if user is typing in an input, textarea, or contenteditable element
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        handleOpen();
      }
    }

    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("open-search", handleOpen);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("open-search", handleOpen);
    };
  });
</script>

{#if ContentComponent}
  <ContentComponent bind:open />
{:else if open}
  <div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
    <div class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
      <div class="h-10 w-full animate-pulse rounded-md bg-muted"></div>
      <div class="h-40 w-full animate-pulse rounded-md bg-muted mt-4"></div>
    </div>
  </div>
{/if}
