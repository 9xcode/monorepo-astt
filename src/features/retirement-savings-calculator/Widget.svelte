<script lang="ts">
    import { siteConfig } from "../../config";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateRetirement, formatCurrency } from "./utils";

    let currentAge = $state(30);
    let retirementAge = $state(60);
    let monthlyExpenses = $state(50000); // Current Value
    let currentSavings = $state(500000);
    let monthlyContribution = $state(10000);
    let returnRate = $state(12);
    let inflationRate = $state(6);

    let result = $derived(calculateRetirement(currentAge, retirementAge, monthlyExpenses, currentSavings, monthlyContribution, returnRate, inflationRate));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Retirement Plan</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                 <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label>Current Age</Label>
                        <Input type="number" min="18" max="100" bind:value={currentAge} />
                    </div>
                    <div class="space-y-2">
                        <Label>Retirement Age</Label>
                        <Input type="number" min="40" max="100" bind:value={retirementAge} />
                    </div>
                </div>
                <div class="space-y-2">
                    <Label>Current Monthly Expenses ({siteConfig.localization.currencySymbol})</Label>
                    <Input type="number" min="0" bind:value={monthlyExpenses} />
                </div>
                <div class="space-y-2">
                    <Label>Current Savings ({siteConfig.localization.currencySymbol})</Label>
                    <Input type="number" min="0" bind:value={currentSavings} />
                </div>
                <div class="space-y-2">
                    <Label>Monthly Contribution ({siteConfig.localization.currencySymbol})</Label>
                    <Input type="number" min="0" bind:value={monthlyContribution} />
                </div>
                 <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label>Exp. Return (%)</Label>
                        <Input type="number" step="0.1" bind:value={returnRate} />
                    </div>
                    <div class="space-y-2">
                        <Label>Inflation (%)</Label>
                        <Input type="number" step="0.1" bind:value={inflationRate} />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Result (Projected)</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div>
                    <p class="text-sm text-muted-foreground">Required Corpus (at age {retirementAge})</p>
                    <p class="text-3xl font-bold text-primary">{formatCurrency(result.requiredAmount)}</p>
                    <p class="text-xs text-muted-foreground mt-1">To sustain lifestyle till age 85</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Projected Savings</p>
                    <p class="text-2xl font-bold text-primary">{formatCurrency(result.projectedSavings)}</p>
                </div>
                 <div class="pt-4 border-t border-primary/20">
                     {#if result.gap > 0}
                        <p class="text-sm text-muted-foreground">Shortfall</p>
                        <p class="text-xl font-bold text-destructive">{formatCurrency(result.gap)}</p>
                     {:else}
                         <p class="text-xl font-bold text-success">You are on track!</p>
                         <p class="text-sm text-muted-foreground">Surplus: {formatCurrency(Math.abs(result.gap))}</p>
                     {/if}
                </div>
            </CardContent>
        </Card>
    </div>
</div>
