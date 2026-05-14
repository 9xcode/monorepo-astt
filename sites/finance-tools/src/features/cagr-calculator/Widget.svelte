<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateCAGR, formatCurrency, formatPercentage } from "./utils";

    let startValue = $state(10000);
    let endValue = $state(20000);
    let years = $state(5);

    let result = $derived(calculateCAGR(startValue, endValue, years));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Calculate CAGR</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="start-value">Initial Value ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="start-value" type="number" min="0" bind:value={startValue} />
                </div>
                <div class="space-y-2">
                    <Label for="end-value">Final Value ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="end-value" type="number" min="0" bind:value={endValue} />
                </div>
                <div class="space-y-2">
                    <Label for="years">Duration (Years)</Label>
                    <Input id="years" type="number" min="0" step="0.1" bind:value={years} />
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div>
                    <p class="text-sm text-muted-foreground">Compound Annual Growth Rate</p>
                    <p class="text-4xl font-bold text-primary">{formatPercentage(result)}</p>
                </div>
                <div class="pt-4 border-t border-primary/20">
                    <p class="text-sm text-muted-foreground">Total Growth</p>
                    <p class="text-2xl font-bold {endValue >= startValue ? 'text-success' : 'text-destructive'}">
                        {formatCurrency(endValue - startValue)}
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
