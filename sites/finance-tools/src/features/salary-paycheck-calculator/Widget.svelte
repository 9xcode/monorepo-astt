<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
    import { calculatePaycheck, formatCurrency, type PayFrequency } from "./utils";

    let amount = $state(1200000);
    let type = $state<'salary' | 'hourly'>('salary');
    let frequency = $state<PayFrequency>('monthly');
    let hoursPerWeek = $state(40);

    let result = $derived(calculatePaycheck(amount, type, frequency, hoursPerWeek));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Income Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                 <div class="space-y-2">
                    <Label for="type">Income Type</Label>
                    <Select type="single" bind:value={type}>
                        <SelectTrigger id="type">
                            {type === 'salary' ? 'Annual Salary' : type === 'hourly' ? 'Hourly Wage' : 'Select Type'}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="salary">Annual Salary</SelectItem>
                            <SelectItem value="hourly">Hourly Wage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div class="space-y-2">
                    <Label for="amount">{type === 'salary' ? 'Annual Salary ({siteConfig.localization.currencySymbol})' : 'Hourly Rate ({siteConfig.localization.currencySymbol})'}</Label>
                    <Input id="amount" type="number" min="0" bind:value={amount} />
                </div>

                {#if type === 'hourly'}
                     <div class="space-y-2">
                        <Label for="hours">Hours Per Week</Label>
                        <Input id="hours" type="number" min="1" max="168" bind:value={hoursPerWeek} />
                    </div>
                {/if}

                <div class="space-y-2">
                    <Label for="frequency">Pay Frequency</Label>
                     <Select type="single" bind:value={frequency}>
                        <SelectTrigger id="frequency">
                            {frequency === 'weekly' ? 'Weekly (52/yr)' : frequency === 'biweekly' ? 'Bi-Weekly (26/yr)' : frequency === 'semimonthly' ? 'Semi-Monthly (24/yr)' : frequency === 'monthly' ? 'Monthly (12/yr)' : frequency === 'annually' ? 'Annually' : 'Select Frequency'}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="weekly">Weekly (52/yr)</SelectItem>
                            <SelectItem value="biweekly">Bi-Weekly (26/yr)</SelectItem>
                            <SelectItem value="semimonthly">Semi-Monthly (24/yr)</SelectItem>
                            <SelectItem value="monthly">Monthly (12/yr)</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>{result.frequencyName} Paycheck</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                 <div>
                    <p class="text-sm text-muted-foreground">Gross Pay</p>
                    <p class="text-3xl font-bold text-primary">{formatCurrency(result.grossPay)}</p>
                </div>
                <div>
                     <p class="text-sm text-muted-foreground">Est. Deductions (20%)</p>
                    <p class="text-lg font-semibold text-destructive">{formatCurrency(result.estimatedDeductions)}</p>
                </div>
                <div class="pt-4 border-t border-primary/20">
                    <p class="text-sm text-muted-foreground">Estimated Net Pay</p>
                    <p class="text-4xl font-bold text-success">{formatCurrency(result.netPay)}</p>
                </div>
                 <div class="text-xs text-muted-foreground mt-4">
                    *Deductions are estimated at 20%. Actual taxes will vary based on your location and situation.
                </div>
            </CardContent>
        </Card>
    </div>
</div>
