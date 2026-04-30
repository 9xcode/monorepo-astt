<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateMortgage, formatCurrency } from "./utils";

    let loanAmount = $state(5000000);
    let interestRate = $state(8.5);
    let loanTerm = $state(20);

    let result = $derived(calculateMortgage(loanAmount, interestRate, loanTerm));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Calculate Mortgage</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="amount">Loan Amount ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="amount" type="number" min="0" bind:value={loanAmount} />
                </div>
                <div class="space-y-2">
                    <Label for="rate">Interest Rate (% p.a)</Label>
                    <Input id="rate" type="number" min="0" step="0.1" bind:value={interestRate} />
                </div>
                <div class="space-y-2">
                    <Label for="term">Loan Term (Years)</Label>
                    <Input id="term" type="number" min="0" step="1" bind:value={loanTerm} />
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Repayment Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div>
                    <p class="text-sm text-muted-foreground">Monthly Payment (EMI)</p>
                    <p class="text-4xl font-bold text-primary">{formatCurrency(result.monthlyPayment)}</p>
                </div>
                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20">
                    <div>
                        <p class="text-xs text-muted-foreground">Total Interest</p>
                        <p class="text-lg font-semibold text-destructive mb-0">{formatCurrency(result.totalInterest)}</p>
                    </div>
                    <div>
                        <p class="text-xs text-muted-foreground">Total Payment</p>
                        <p class="text-lg font-semibold">{formatCurrency(result.totalPayment)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
