<script lang="ts">
  import { onMount } from "svelte";

  let ContentComponent: any = $state(null);
  let open = $state(false);

  let title = $state("");
  let url = $state("");
  let imageUrl = $state("");

  async function handleOpen(e: Event) {
    const detail = (e as CustomEvent).detail || {};

    title = detail.title || document.title;
    url = detail.url || window.location.href;

    if (detail.imageUrl) {
      imageUrl = detail.imageUrl;
    } else {
      const ogImage = document.querySelector('meta[property="og:image"]');
      imageUrl = ogImage ? ogImage.getAttribute("content") || "" : "";
    }

    if (!ContentComponent) {
      ContentComponent = (await import("./ShareDialogContent.svelte")).default;
    }
    open = true;
  }

  onMount(() => {
    window.addEventListener("open-share", handleOpen);
    return () => window.removeEventListener("open-share", handleOpen);
  });
</script>

{#if ContentComponent}
  <ContentComponent bind:open {title} {url} {imageUrl} />
{/if}
