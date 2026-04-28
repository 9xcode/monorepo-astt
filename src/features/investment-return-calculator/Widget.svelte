<script lang="ts">
    import { siteConfig } from "../../config";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateROI, calculateAnnualizedROI, formatCurrency, formatPercentage } from "./utils";

    let investedAmount = $state(10000);
    let returnedAmount = $state(15000);
    let timePeriod = $state(5); // Years

    let results = $derived.by(() => {
        const roiData = calculateROI(investedAmount, returnedAmount);
        const cagr = calculateAnnualizedROI(investedAmount, returnedAmount, timePeriod);
        
        return {
            ...roiData,
            cagr
        };
    });
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Calculate ROI</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="invested">Amount Invested ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="invested" type="number" min="0" bind:value={investedAmount} />
                </div>
                <div class="space-y-2">
                    <Label for="returned">Amount Returned ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="returned" type="number" min="0" bind:value={returnedAmount} />
                </div>
                <div class="space-y-2">
                    <Label for="time">Time Period (Years)</Label>
                    <Input id="time" type="number" min="0" step="0.1" bind:value={timePeriod} />
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div>
                    <p class="text-sm text-muted-foreground">Total Profit</p>
                    <p class="text-2xl font-bold {results.profit >= 0 ? 'text-success' : 'text-destructive'}">
                        {formatCurrency(results.profit)}
                    </p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Total ROI</p>
                    <p class="text-2xl font-bold text-primary">{formatPercentage(results.roi)}</p>
                </div>
                <div class="pt-4 border-t border-primary/20">
                    <p class="text-sm text-muted-foreground">Annualized Return (CAGR)</p>
                    <p class="text-4xl font-bold text-primary">{formatPercentage(results.cagr)}</p>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
