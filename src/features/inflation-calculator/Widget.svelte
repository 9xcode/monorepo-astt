<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateInflation, formatCurrency } from "./utils";

    let amount = $state(100);
    let startYear = $state(2024);
    let endYear = $state(2034);
    let rate = $state(6); // Average inflation rate

    let result = $derived(calculateInflation(amount, startYear, endYear, rate));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Inflation Parameters</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="amount">Amount ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="amount" type="number" min="0" bind:value={amount} />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label for="start">Start Year</Label>
                        <Input id="start" type="number" min="1900" max="2100" bind:value={startYear} />
                    </div>
                    <div class="space-y-2">
                        <Label for="end">End Year</Label>
                        <Input id="end" type="number" min="1900" max="2100" bind:value={endYear} />
                    </div>
                </div>
                <div class="space-y-2">
                    <Label for="rate">Inflation Rate (%)</Label>
                    <Input id="rate" type="number" step="0.1" bind:value={rate} />
                </div>
                 <div class="text-xs text-muted-foreground">
                    *Historical average inflation in India is around 6%.
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Buying Power</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div>
                     <p class="text-sm text-muted-foreground">Value in {endYear}</p>
                    <p class="text-3xl font-bold text-primary">{formatCurrency(result.futureValue)}</p>
                </div>
                <div class="text-sm text-muted-foreground">
                    To buy what costs <b>{formatCurrency(amount)}</b> in {startYear}, you would need <b>{formatCurrency(result.futureValue)}</b> in {endYear}.
                </div>
                 <div class="pt-4 border-t border-primary/20">
                     <p class="text-sm text-muted-foreground">Increase in Cost</p>
                     <p class="text-xl font-bold text-destructive">{formatCurrency(result.difference)}</p>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
