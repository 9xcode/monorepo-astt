<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateInterestOnlyLoan, formatCurrency } from "./utils";

    let loanAmount = $state(5000000);
    let interestRate = $state(7.5);
    let loanTerm = $state(30);
    let ioPeriod = $state(5);

    let result = $derived(calculateInterestOnlyLoan(loanAmount, interestRate, loanTerm, ioPeriod));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Loan Details</CardTitle>
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
                    <Label for="term">Total Loan Term (Years)</Label>
                    <Input id="term" type="number" min="0" step="1" bind:value={loanTerm} />
                </div>
                <div class="space-y-2">
                    <Label for="io-period">Interest Only Period (Years)</Label>
                    <Input id="io-period" type="number" min="0" max={loanTerm} step="1" bind:value={ioPeriod} />
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div>
                    <p class="text-sm text-muted-foreground">Interest Only Payment (First {ioPeriod} Years)</p>
                    <p class="text-3xl font-bold text-primary">{formatCurrency(result.ioPayment)}</p>
                </div>
                <div>
                    <p class="text-sm text-muted-foreground">Principal + Interest Payment (Remaining {loanTerm - ioPeriod} Years)</p>
                    <p class="text-3xl font-bold text-primary">{formatCurrency(result.piPayment)}</p>
                </div>
                <div class="pt-4 border-t border-primary/20">
                     <div class="flex justify-between mb-2">
                        <span class="text-sm text-muted-foreground">Total Interest</span>
                        <span class="font-semibold text-destructive">{formatCurrency(result.totalInterest)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-muted-foreground">Total Payments</span>
                        <span class="font-semibold">{formatCurrency(result.totalPayment)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
