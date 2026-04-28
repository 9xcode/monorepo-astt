<script lang="ts">
    import { siteConfig } from "../../config";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateAutoLoan, formatCurrency } from "./utils";

    let vehiclePrice = $state(1000000);
    let downPayment = $state(200000);
    let tradeInValue = $state(50000);
    let interestRate = $state(9.5);
    let loanTermMonths = $state(60);
    let salesTax = $state(18); // GST % in India

    let result = $derived(calculateAutoLoan(vehiclePrice, downPayment, tradeInValue, interestRate, loanTermMonths, salesTax));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Auto Loan Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="price">Vehicle Price ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="price" type="number" min="0" bind:value={vehiclePrice} />
                </div>
                <div class="space-y-2">
                    <Label for="down">Down Payment ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="down" type="number" min="0" bind:value={downPayment} />
                </div>
                <div class="space-y-2">
                    <Label for="trade">Trade-In Value ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="trade" type="number" min="0" bind:value={tradeInValue} />
                </div>
                <div class="space-y-2">
                    <Label for="rate">Interest Rate (% p.a)</Label>
                    <Input id="rate" type="number" min="0" step="0.1" bind:value={interestRate} />
                </div>
                <div class="space-y-2">
                    <Label for="term">Loan Term (Months)</Label>
                    <Input id="term" type="number" min="0" step="1" bind:value={loanTermMonths} />
                </div>
                <div class="space-y-2">
                    <Label for="tax">Sales Tax / GST (%)</Label>
                    <Input id="tax" type="number" min="0" step="0.1" bind:value={salesTax} />
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Loan Summary</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div>
                    <p class="text-sm text-muted-foreground">Monthly Payment</p>
                    <p class="text-4xl font-bold text-primary">{formatCurrency(result.monthlyPayment)}</p>
                </div>
                <div class="space-y-2 pt-4 border-t border-primary/20">
                    <div class="flex justify-between">
                        <span class="text-sm text-muted-foreground">Total Loan Amount</span>
                        <span class="font-semibold">{formatCurrency(result.totalLoanAmount)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-muted-foreground">Total Interest</span>
                        <span class="font-semibold text-destructive">{formatCurrency(result.totalInterest)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-muted-foreground">Total Cost of Car</span>
                        <span class="font-semibold">{formatCurrency(result.totalCost)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
