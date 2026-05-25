<script lang="ts">
    import { siteConfig } from 'virtual:site-config';
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Trash2, Plus } from '@lucide/svelte';
    import { calculateDebtPayoff, formatCurrency, type Debt } from "./utils";

    let debts = $state<Debt[]>([
        { id: '1', name: 'Credit Card 1', balance: 50000, rate: 18, minPayment: 1500 },
        { id: '2', name: 'Car Loan', balance: 200000, rate: 9, minPayment: 5000 },
    ]);
    let extraPayment = $state(2000);

    // Initial calculation
    let snowballResult = $derived(calculateDebtPayoff(debts, extraPayment, 'snowball'));
    let avalancheResult = $derived(calculateDebtPayoff(debts, extraPayment, 'avalanche'));

    function addDebt() {
        debts = [...debts, {
            id: Math.random().toString(36).substr(2, 9),
            name: `Debt ${debts.length + 1}`,
            balance: 10000,
            rate: 10,
            minPayment: 500
        }];
    }

    function removeDebt(id: string) {
        debts = debts.filter(d => d.id !== id);
    }
</script>

<div class="space-y-8">
    <div class="grid gap-6 lg:grid-cols-2">
        <!-- Input Section -->
        <Card class="lg:col-span-1">
            <CardHeader>
                <CardTitle>Your Debts</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="space-y-4">
                    {#each debts as debt (debt.id)}
                        <div class="p-4 border rounded-lg bg-card space-y-3 relative group">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                class="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                onclick={() => removeDebt(debt.id)}
                            >
                                <Trash2 class="h-4 w-4" />
                            </Button>
                            
                            <div class="grid gap-4 md:grid-cols-2">
                                <div class="space-y-2">
                                    <Label>Debt Name</Label>
                                    <Input type="text" bind:value={debt.name} />
                                </div>
                                <div class="space-y-2">
                                    <Label>Balance ({siteConfig.localization.currencySymbol})</Label>
                                    <Input type="number" bind:value={debt.balance} />
                                </div>
                                <div class="space-y-2">
                                    <Label>Interest Rate (%)</Label>
                                    <Input type="number" step="0.1" bind:value={debt.rate} />
                                </div>
                                <div class="space-y-2">
                                    <Label>Min Payment ({siteConfig.localization.currencySymbol})</Label>
                                    <Input type="number" bind:value={debt.minPayment} />
                                </div>
                            </div>
                        </div>
                    {/each}
                    <Button variant="outline" class="w-full" onclick={addDebt}>
                        <Plus class="mr-2 h-4 w-4" /> Add Debt
                    </Button>
                </div>

                <div class="space-y-2 pt-4 border-t">
                    <Label>Extra Monthly Payment ({siteConfig.localization.currencySymbol})</Label>
                    <Input type="number" min="0" bind:value={extraPayment} />
                    <p class="text-xs text-muted-foreground">Amount you can pay ON TOP of minimums.</p>
                </div>
            </CardContent>
        </Card>

        <!-- Results Section -->
        <div class="space-y-6 lg:col-span-1">
            <Card class="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle>Strategy Comparison</CardTitle>
                </CardHeader>
                <CardContent class="grid gap-4">
                    <!-- Snowball -->
                    <div class="p-4 rounded-lg bg-background border shadow-sm">
                        <h3 class="font-semibold text-lg mb-2">Debt Snowball (Lowest Balance First)</h3>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-muted-foreground">Time to Debt Free</p>
                                <p class="text-xl font-bold">{(snowballResult.payoffMonths / 12).toFixed(1)} Years</p>
                            </div>
                            <div>
                                <p class="text-muted-foreground">Total Interest</p>
                                <p class="text-xl font-bold text-destructive">{formatCurrency(snowballResult.totalInterest)}</p>
                            </div>
                        </div>
                        <div class="mt-2 text-xs text-muted-foreground">
                            Order: {snowballResult.debtPayoffOrder.join(" → ")}
                        </div>
                    </div>

                    <!-- Avalanche -->
                    <div class="p-4 rounded-lg bg-background border shadow-sm">
                        <h3 class="font-semibold text-lg mb-2">Debt Avalanche (Highest Interest First)</h3>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="text-muted-foreground">Time to Debt Free</p>
                                <p class="text-xl font-bold">{(avalancheResult.payoffMonths / 12).toFixed(1)} Years</p>
                            </div>
                            <div>
                                <p class="text-muted-foreground">Total Interest</p>
                                <p class="text-xl font-bold text-destructive">{formatCurrency(avalancheResult.totalInterest)}</p>
                            </div>
                        </div>
                        <div class="mt-2 text-xs text-muted-foreground">
                            Order: {avalancheResult.debtPayoffOrder.join(" → ")}
                        </div>
                        {#if avalancheResult.totalInterest < snowballResult.totalInterest}
                            <div class="mt-2 text-xs text-success font-medium">
                                Saves {formatCurrency(snowballResult.totalInterest - avalancheResult.totalInterest)} vs Snowball!
                            </div>
                        {/if}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</div>
