<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Slider } from "$lib/components/ui/slider";
    import { calculateEmergencyFund, formatCurrency } from "./utils";

    let monthlyExpenses = $state(25000);
    let months = $state([6]); // Slider returns array
    let currentSavings = $state(50000);

    let result = $derived(calculateEmergencyFund(monthlyExpenses, months[0] ?? 6, currentSavings));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Fund Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="space-y-2">
                    <Label for="expenses">Monthly Expenses ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="expenses" type="number" min="0" bind:value={monthlyExpenses} />
                </div>
                <div class="space-y-4">
                    <div class="flex justify-between">
                         <Label for="months">Coverage Duration</Label>
                         <span class="font-medium">{months[0]} Months</span>
                    </div>
                    <!-- Assuming Slider component exists and works with bind:value array -->
                    <!-- Standard shadcn slider usually takes value array -->
                     <Slider bind:value={months} type="multiple" min={1} max={12} step={1} />
                </div>
                <div class="space-y-2">
                    <Label for="savings">Current Savings ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="savings" type="number" min="0" bind:value={currentSavings} />
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
             <CardHeader>
                <CardTitle>Target</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div>
                    <p class="text-sm text-muted-foreground">Target Emergency Fund</p>
                    <p class="text-3xl font-bold text-primary">{formatCurrency(result.targetAmount)}</p>
                </div>
                
                 <div class="pt-4 border-t border-primary/20">
                     {#if result.gap > 0}
                        <p class="text-sm text-muted-foreground">Amount needed to reach goal</p>
                        <p class="text-xl font-bold text-destructive">{formatCurrency(result.gap)}</p>
                     {:else}
                         <p class="text-xl font-bold text-success">You have reached your goal!</p>
                         <p class="text-sm text-muted-foreground">Surplus: {formatCurrency(Math.abs(result.gap))}</p>
                     {/if}
                </div>
            </CardContent>
        </Card>
    </div>
</div>
