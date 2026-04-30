<script lang="ts">
  import { onMount } from "svelte";

  let ContentComponent: any = $state(null);
  let open = $state(false);

  async function handleOpen() {
    if (!ContentComponent) {
      ContentComponent = (await import("./FeatureRequestDialogContent.svelte")).default;
    }
    open = true;
  }

  onMount(() => {
    window.addEventListener("open-feature-request", handleOpen);
    return () => window.removeEventListener("open-feature-request", handleOpen);
  });
</script>

{#if ContentComponent}
  <ContentComponent bind:open />
{/if}
