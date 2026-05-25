<script lang="ts">
  /**
   * SearchResultsSkeleton.svelte
   *
   * Svelte skeleton for the search modal's loading state.
   * Used inside SearchDialogContent.svelte to replace
   * the old animate-pulse text spinner.
   *
   * Renders 6 skeleton rows that mimic Command.Item layout:
   *   [ icon square ] [ title bar + description bar ]
   *
   * Uses the shadcn-svelte Skeleton component (bg-muted + animate-pulse).
   */
  import { Skeleton } from "$lib/components/ui/skeleton";
</script>

<div class="space-y-1 py-2 px-1" aria-hidden="true" aria-label="Loading search results...">
  {#each Array(6) as _, i (i)}
    <div class="flex items-center gap-4 px-4 py-3 rounded-xl">
      <Skeleton class="size-10 rounded-lg shrink-0" />
      <div class="flex-1 space-y-1.5">
        <Skeleton class="h-4 w-2/3" />
        <Skeleton class="h-3 w-full" />
      </div>
    </div>
  {/each}
</div>
