<script lang="ts">
    import { siteConfig } from "../../config";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateCreditCardPayoff, formatCurrency } from "./utils";
    import { Alert, AlertDescription, AlertTitle } from "$lib/components/ui/alert";

    let balance = $state(50000);
    let rate = $state(18); // Typical CC rate
    let monthlyPayment = $state(2000);

    let result = $derived(calculateCreditCardPayoff(balance, rate, monthlyPayment));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Card Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="balance">Credit Card Balance ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="balance" type="number" min="0" bind:value={balance} />
                </div>
                <div class="space-y-2">
                    <Label for="rate">Interest Rate (% APR)</Label>
                    <Input id="rate" type="number" min="0" step="0.1" bind:value={rate} />
                </div>
                <div class="space-y-2">
                    <Label for="payment">Planned Monthly Payment ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="payment" type="number" min="0" bind:value={monthlyPayment} />
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Payoff Summary</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                {#if result.warning}
                    <div class="p-4 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                        {result.warning}
                    </div>
                {:else}
                    <div>
                        <p class="text-sm text-muted-foreground">Time to Payoff</p>
                        <p class="text-3xl font-bold text-primary">{result.months} Months</p>
                        <p class="text-sm text-muted-foreground">({(result.months / 12).toFixed(1)} Years)</p>
                    </div>
                    
                    <div class="space-y-2 pt-4 border-t border-primary/20">
                        <div class="flex justify-between">
                            <span class="text-sm text-muted-foreground">Total Interest Paid</span>
                            <span class="font-semibold text-destructive">{formatCurrency(result.totalInterest)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-muted-foreground">Total Payment</span>
                            <span class="font-semibold">{formatCurrency(result.totalPayment)}</span>
                        </div>
                    </div>
                {/if}
            </CardContent>
        </Card>
    </div>
</div>
