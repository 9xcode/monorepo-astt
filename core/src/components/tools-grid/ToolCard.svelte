<script lang="ts">
    import { iconMap, Calculator, ArrowRight } from '$lib/icons';

    interface Tool {
        slug: string;
        data: {
            title: string;
            description: string;
            icon?: string;
            category: string;
        };
    }

    let { tool, isHidden = false } = $props<{
        tool: Tool;
        isHidden?: boolean;
    }>();

    const Icon = $derived(tool.data.icon ? (iconMap[tool.data.icon] ?? Calculator) : Calculator);
</script>

<a
    href={`/tools/${tool.slug}`}
    class="group tool-card active:scale-95 transition-transform duration-150"
    class:tool-hidden={isHidden}
    aria-hidden={isHidden ? 'true' : undefined}
    data-tool-category={tool.data.category}
>
    <!-- Single responsive card — DOM optimized! Handles both mobile/desktop layout -->
    <div class="flex flex-col border rounded-xl p-3 sm:p-6 bg-card hover:border-primary/50 transition-colors h-full relative shadow-sm hover:shadow-md">
        
        <!-- Top row: Icon + Title side-by-side on both mobile and desktop (restores the original layout) -->
        <div class="flex items-center gap-3 sm:mb-4">
            <div class="shrink-0 p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon class="size-5 sm:size-6" />
            </div>
            <div class="min-w-0 flex-1">
                <h3 class="text-sm sm:text-lg font-semibold leading-tight sm:leading-normal truncate">{tool.data.title}</h3>
                <span class="block sm:hidden text-xs text-muted-foreground mt-0.5 truncate">{tool.data.category}</span>
            </div>
            <!-- Mobile arrow -->
            <ArrowRight class="shrink-0 sm:hidden size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
        
        <!-- Desktop Description & Footer -->
        <p class="hidden sm:block text-muted-foreground text-sm flex-1 line-clamp-2 mt-1">{tool.data.description}</p>
        
        <div class="hidden sm:flex mt-4 w-full items-center justify-between">
            <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground">
                {tool.data.category}
            </span>
            <div class="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 opacity-50 group-hover:opacity-100 transition-all">
                Open <ArrowRight class="ml-1 size-4" />
            </div>
        </div>
    </div>
</a>

<style>
    /* Scoped hidden class for the 'Show More' functionality */
    .tool-hidden {
        display: none;
    }
</style>
