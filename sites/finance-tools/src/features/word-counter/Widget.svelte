<script lang="ts">
	import { Textarea } from "$lib/components/ui/textarea"; // Need to create Textarea? Or use Input type="textarea"? 
    // Shadcn Textarea is separate. I'll use HTML textarea with styles for now or create Textarea component.
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { cn } from "$lib/utils";

    let text = $state("");

    let words = $derived(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
    let characters = $derived(text.length);
    let sentences = $derived(text.trim() === "" ? 0 : text.split(/[.!?]+/).filter(Boolean).length);
    let paragraphs = $derived(text.trim() === "" ? 0 : text.split(/\n+/).filter(Boolean).length);
</script>

<div class="grid gap-6 lg:grid-cols-3">
    <div class="lg:col-span-2 space-y-4">
        <textarea
            bind:value={text}
            placeholder="Type or paste your text here..."
            class="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        ></textarea>
    </div>

    <div class="space-y-4">
        <Card>
            <CardHeader class="pb-2">
                <CardTitle class="text-sm font-medium">Statistics</CardTitle>
            </CardHeader>
            <CardContent class="grid gap-4">
                <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">Words</span>
                    <span class="text-2xl font-bold">{words}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">Characters</span>
                    <span class="text-2xl font-bold">{characters}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">Sentences</span>
                    <span class="text-2xl font-bold">{sentences}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">Paragraphs</span>
                    <span class="text-2xl font-bold">{paragraphs}</span>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
