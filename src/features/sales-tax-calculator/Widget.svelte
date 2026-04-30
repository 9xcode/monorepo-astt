<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
    import { calculateSalesTax, formatCurrency } from "./utils";

    let amount = $state(1000);
    let rate = $state(18);
    let type = $state<'add' | 'extract'>('add');

    let result = $derived(calculateSalesTax(amount, rate, type));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Calculator Settings</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                 <div class="space-y-3">
                    <Label>Calculation Mode</Label>
                    <RadioGroup bind:value={type} class="flex flex-col space-y-1">
                        <div class="flex items-center space-x-2">
                            <RadioGroupItem value="add" id="add" />
                            <Label for="add">Add Tax (Exclusive)</Label>
                        </div>
                        <div class="flex items-center space-x-2">
                            <RadioGroupItem value="extract" id="extract" />
                            <Label for="extract">Extract Tax (Inclusive)</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div class="space-y-2">
                    <Label for="amount">{type === 'add' ? 'Net Price (before tax)' : 'Gross Price (after tax)'} ({siteConfig.localization.currencySymbol})</Label>
                    <Input id="amount" type="number" min="0" bind:value={amount} />
                </div>
                <div class="space-y-2">
                    <Label for="rate">Tax Rate (%)</Label>
                    <Input id="rate" type="number" step="0.1" bind:value={rate} />
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div>
                     <p class="text-sm text-muted-foreground">Net Amount (Price)</p>
                    <p class="text-xl font-semibold">{formatCurrency(result.netAmount)}</p>
                </div>
                <div>
                     <p class="text-sm text-muted-foreground">Tax Amount ({rate}%)</p>
                    <p class="text-xl font-bold text-destructive">{formatCurrency(result.taxAmount)}</p>
                </div>
                 <div class="pt-4 border-t border-primary/20">
                     <p class="text-sm text-muted-foreground">Gross Amount (Total)</p>
                     <p class="text-3xl font-bold text-primary">{formatCurrency(result.grossAmount)}</p>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
