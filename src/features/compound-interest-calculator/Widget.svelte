<script lang="ts">
    import { siteConfig } from "../../config";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateCompoundInterest, formatCurrency } from "./utils";

    let principal = $state(10000);
    let rate = $state(8);
    let years = $state(10);
    let annualAddition = $state(0);
    let frequency = $state("1"); // 1 = Annually, 4 = Quarterly, 12 = Monthly

    let result = $derived(calculateCompoundInterest(principal, rate, years, Number(frequency), annualAddition));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Calculate Compound Interest</CardTitle>
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
                <div class="space-y-2">
                    <Label for="addition">Annual Addition ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="addition" type="number" min="0" bind:value={annualAddition} />
                </div>
                <div class="space-y-2">
                    <Label for="frequency">Compounding Frequency</Label>
                    <Select type="single" bind:value={frequency}>
                        <SelectTrigger id="frequency">
                            {frequency === "1" ? "Annually" : frequency === "2" ? "Semi-Annually" : frequency === "4" ? "Quarterly" : frequency === "12" ? "Monthly" : "Select Frequency"}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Annually</SelectItem>
                            <SelectItem value="2">Semi-Annually</SelectItem>
                            <SelectItem value="4">Quarterly</SelectItem>
                            <SelectItem value="12">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                 <div>
                    <p class="text-sm text-muted-foreground">Total Invested</p>
                    <p class="text-2xl font-bold">{formatCurrency(result.invested)}</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Total Interest</p>
                    <p class="text-2xl font-bold text-success">{formatCurrency(result.interest)}</p>
                </div>
                <div class="pt-4 border-t border-primary/20">
                    <p class="text-sm text-muted-foreground">Maturity Value</p>
                    <p class="text-4xl font-bold text-primary">{formatCurrency(result.total)}</p>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
