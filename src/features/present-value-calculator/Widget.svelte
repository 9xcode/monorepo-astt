<script lang="ts">
    import { siteConfig } from "../../config";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculatePV, formatCurrency } from "./utils";

    let futureValue = $state(100000);
    let rate = $state(8);
    let years = $state(10);

    let result = $derived(calculatePV(futureValue, rate, years));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Calculate Present Value</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="fv">Future Value ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="fv" type="number" min="0" bind:value={futureValue} />
                </div>
                <div class="space-y-2">
                    <Label for="rate">Discount Rate (% p.a)</Label>
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
                    <p class="text-sm text-muted-foreground">Present Value</p>
                    <p class="text-4xl font-bold text-primary">{formatCurrency(result)}</p>
                </div>
                <div class="text-sm text-muted-foreground">
                    This means you need to invest <b>{formatCurrency(result)}</b> today at a <b>{rate}%</b> interest rate to have <b>{formatCurrency(futureValue)}</b> in <b>{years}</b> years.
                </div>
            </CardContent>
        </Card>
    </div>
</div>
