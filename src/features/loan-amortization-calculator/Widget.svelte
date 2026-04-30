<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "$lib/components/ui/table";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateAmortizationSchedule, formatCurrency } from "./utils";

    let loanAmount = $state(1000000);
    let interestRate = $state(9);
    let loanTerm = $state(5);

    let schedule = $derived(calculateAmortizationSchedule(loanAmount, interestRate, loanTerm));
    // Show only first 60 rows to avoid rendering issues if term is huge, or paginate. 
    // For now, let's show all but maybe add a scroll area or limit initial view?
    // Let's just render standard table, it's fine for typical loan terms (20-30 years = 360 rows max usually).
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card class="md:col-span-1">
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
                    <Label for="term">Loan Term (Years)</Label>
                    <Input id="term" type="number" min="0" step="1" bind:value={loanTerm} />
                </div>
            </CardContent>
        </Card>

        <Card class="md:col-span-2 overflow-hidden">
            <CardHeader>
                <CardTitle>Amortization Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="rounded-md border max-h-[500px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead class="w-[100px]">Month</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Principal</TableHead>
                                <TableHead>Interest</TableHead>
                                <TableHead class="text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {#each schedule as row (row.month)}
                                <TableRow>
                                    <TableCell class="font-medium">{row.month}</TableCell>
                                    <TableCell>{formatCurrency(row.payment)}</TableCell>
                                    <TableCell>{formatCurrency(row.principal)}</TableCell>
                                    <TableCell>{formatCurrency(row.interest)}</TableCell>
                                    <TableCell class="text-right">{formatCurrency(row.balance)}</TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
