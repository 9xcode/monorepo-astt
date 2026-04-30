<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Trash2, Plus } from '@lucide/svelte';
    import { calculateNetWorth, formatCurrency, type Item } from "./utils";

    let assets = $state<Item[]>([
        { id: '1', name: 'Real Estate', value: 5000000 },
        { id: '2', name: 'Investments', value: 1000000 },
        { id: '3', name: 'Cash', value: 200000 },
    ]);

    let liabilities = $state<Item[]>([
        { id: '1', name: 'Mortgage', value: 3000000 },
        { id: '2', name: 'Car Loan', value: 500000 },
    ]);

    let result = $derived(calculateNetWorth(assets, liabilities));

    function addAsset() {
        assets = [...assets, { id: Math.random().toString(36).substr(2, 9), name: 'New Asset', value: 0 }];
    }

    function removeAsset(id: string) {
        assets = assets.filter(a => a.id !== id);
    }

    function addLiability() {
        liabilities = [...liabilities, { id: Math.random().toString(36).substr(2, 9), name: 'New Liability', value: 0 }];
    }

    function removeLiability(id: string) {
        liabilities = liabilities.filter(l => l.id !== id);
    }
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <!-- Assets -->
        <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Assets (What you own)</CardTitle>
                 <Button variant="ghost" size="sm" onclick={addAsset}><Plus class="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent class="space-y-4 pt-4">
                {#each assets as asset (asset.id)}
                    <div class="flex items-center gap-2">
                        <Input type="text" bind:value={asset.name} placeholder="Name" class="flex-1" />
                        <Input type="number" bind:value={asset.value} min="0" placeholder="Value" class="w-32" />
                        <Button variant="ghost" size="icon" onclick={() => removeAsset(asset.id)}>
                            <Trash2 class="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                {/each}
                <div class="flex justify-between font-semibold pt-4 border-t">
                    <span>Total Assets</span>
                    <span class="text-success">{formatCurrency(result.totalAssets)}</span>
                </div>
            </CardContent>
        </Card>

        <!-- Liabilities -->
        <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Liabilities (What you owe)</CardTitle>
                <Button variant="ghost" size="sm" onclick={addLiability}><Plus class="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent class="space-y-4 pt-4">
                {#each liabilities as liability (liability.id)}
                    <div class="flex items-center gap-2">
                        <Input type="text" bind:value={liability.name} placeholder="Name" class="flex-1" />
                        <Input type="number" bind:value={liability.value} min="0" placeholder="Value" class="w-32" />
                        <Button variant="ghost" size="icon" onclick={() => removeLiability(liability.id)}>
                            <Trash2 class="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                {/each}
                 <div class="flex justify-between font-semibold pt-4 border-t">
                    <span>Total Liabilities</span>
                    <span class="text-destructive">{formatCurrency(result.totalLiabilities)}</span>
                </div>
            </CardContent>
        </Card>
        
        <!-- Result -->
        <Card class="md:col-span-2 bg-primary/5 border-primary/20">
            <CardContent class="p-6 text-center">
                <p class="text-sm text-muted-foreground mb-1">Your Net Worth</p>
                <p class="text-5xl font-bold text-primary">{formatCurrency(result.netWorth)}</p>
            </CardContent>
        </Card>
    </div>
</div>
