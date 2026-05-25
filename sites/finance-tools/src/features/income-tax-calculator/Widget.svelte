<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
    import { calculateIncomeTax, formatCurrency } from "./utils";

    let income = $state(1500000);
    let regime = $state<'old' | 'new'>('new');

    let result = $derived(calculateIncomeTax(income, regime));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Tax Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="income">Annual Gross Income ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="income" type="number" min="0" bind:value={income} />
                </div>
                <div class="space-y-2">
                    <Label for="regime">Tax Regime (India)</Label>
                     <Select type="single" bind:value={regime}>
                        <SelectTrigger id="regime">
                            {regime === 'new' ? 'New Regime (FY 2024-25)' : regime === 'old' ? 'Old Regime' : 'Select Regime'}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">New Regime (FY 2024-25)</SelectItem>
                            <SelectItem value="old">Old Regime</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div class="text-xs text-muted-foreground">
                    *Calculations include Standard Deduction ({siteConfig.localization.currencySymbol}75k New / {siteConfig.localization.currencySymbol}50k Old) and Cess (4%).
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Tax Breakdown</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="space-y-2">
                    <div class="flex justify-between">
                         <span class="text-muted-foreground">Base Tax</span>
                         <span class="font-medium">{formatCurrency(result.tax)}</span>
                    </div>
                    <div class="flex justify-between">
                         <span class="text-muted-foreground">Health & Education Cess (4%)</span>
                         <span class="font-medium">{formatCurrency(result.cess)}</span>
                    </div>
                </div>

                <div class="pt-4 border-t border-primary/20">
                     <div class="flex justify-between items-baseline">
                         <span class="text-sm font-medium">Total Tax Liability</span>
                         <span class="text-3xl font-bold text-destructive">{formatCurrency(result.totalTax)}</span>
                    </div>
                </div>

                 <div class="pt-4 border-t border-primary/20">
                     <div class="flex justify-between items-baseline">
                         <span class="text-sm font-medium">Post-Tax Income</span>
                         <span class="text-2xl font-bold text-success">{formatCurrency(income - result.totalTax)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
