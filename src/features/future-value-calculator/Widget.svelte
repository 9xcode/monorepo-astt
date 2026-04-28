<script lang="ts">
    import { siteConfig } from "../../config";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateFV, formatCurrency } from "./utils";

    let presentValue = $state(10000);
    let rate = $state(8);
    let years = $state(10);

    let result = $derived(calculateFV(presentValue, rate, years));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Calculate Future Value</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="pv">Present Value ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="pv" type="number" min="0" bind:value={presentValue} />
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
                    <p class="text-sm text-muted-foreground">Future Value</p>
                    <p class="text-4xl font-bold text-primary">{formatCurrency(result)}</p>
                </div>
                <div class="text-sm text-muted-foreground">
                    If you invest <b>{formatCurrency(presentValue)}</b> today at a <b>{rate}%</b> interest rate, it will grow to <b>{formatCurrency(result)}</b> in <b>{years}</b> years.
                </div>
            </CardContent>
        </Card>
    </div>
</div>
