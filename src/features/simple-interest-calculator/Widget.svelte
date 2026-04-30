<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateSimpleInterest, formatCurrency } from "./utils";

    let principal = $state(10000);
    let rate = $state(5);
    let years = $state(5);

    let result = $derived(calculateSimpleInterest(principal, rate, years));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Calculate Simple Interest</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="principal">Principal Amount ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="principal" type="number" min="0" bind:value={principal} />
                </div>
                <div class="space-y-2">
                    <Label for="rate">Interest Rate (% p.a)</Label>
                    <Input id="rate" type="number" min="0" step="0.1" bind:value={rate} />
                </div>
                <div class="space-y-2">
                    <Label for="years">Time Period (Years)</Label>
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
                    <p class="text-sm text-muted-foreground">Total Interest</p>
                    <p class="text-2xl font-bold text-success">{formatCurrency(result.interest)}</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Total Value</p>
                    <p class="text-4xl font-bold text-primary">{formatCurrency(result.total)}</p>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
