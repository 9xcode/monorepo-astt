<script lang="ts">
    import { siteConfig } from "../../config";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { calculateCollegeSavings, formatCurrency } from "./utils";

    let childAge = $state(5);
    let collegeAge = $state(18);
    let annualCost = $state(500000); // Current cost
    let yearsInCollege = $state(4);
    let currentSavings = $state(100000);
    let returnRate = $state(10);
    let inflationRate = $state(6);

    let result = $derived(calculateCollegeSavings(childAge, collegeAge, annualCost, yearsInCollege, inflationRate, currentSavings, returnRate));
</script>

<div class="space-y-8">
    <div class="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Education Details</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label>Child's Current Age</Label>
                        <Input type="number" min="0" max="18" bind:value={childAge} />
                    </div>
                    <div class="space-y-2">
                        <Label>College Start Age</Label>
                        <Input type="number" min="16" max="25" bind:value={collegeAge} />
                    </div>
                </div>
                <div class="space-y-2">
                    <Label>Current Annual Cost ({siteConfig.localization.currencySymbol})</Label>
                    <Input type="number" min="0" bind:value={annualCost} />
                </div>
                <div class="space-y-2">
                    <Label>Years in College</Label>
                    <Input type="number" min="1" max="10" bind:value={yearsInCollege} />
                </div>
                <div class="space-y-2">
                    <Label>Current Savings ({siteConfig.localization.currencySymbol})</Label>
                    <Input type="number" min="0" bind:value={currentSavings} />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <Label>Exp. Return (%)</Label>
                        <Input type="number" step="0.1" bind:value={returnRate} />
                    </div>
                    <div class="space-y-2">
                        <Label>Inflation (%)</Label>
                        <Input type="number" step="0.1" bind:value={inflationRate} />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card class="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Savings Plan</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div>
                    <p class="text-sm text-muted-foreground">Estimated Total Cost</p>
                    <p class="text-3xl font-bold text-primary">{formatCurrency(result.totalCost)}</p>
                    <p class="text-xs text-muted-foreground mt-1">Adjusted for {inflationRate}% annual inflation</p>
                </div>
                
                 <div class="pt-4 border-t border-primary/20">
                    <p class="text-sm text-muted-foreground">Monthly Savings Needed</p>
                    <p class="text-2xl font-bold text-success">{formatCurrency(result.monthlySavingsNeeded)}</p>
                    <p class="text-xs text-muted-foreground mt-1">To reach your goal by age {collegeAge}</p>
                </div>

                <div class="pt-4 border-t border-primary/20">
                    <div class="flex justify-between text-sm">
                        <span>Projected Savings (from current)</span>
                        <span class="font-medium">{formatCurrency(result.projectedSavings)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
