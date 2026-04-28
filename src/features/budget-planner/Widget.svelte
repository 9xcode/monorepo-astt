<script lang="ts">
    import { siteConfig } from "../../config";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Trash2, Plus } from '@lucide/svelte';

    interface Expense {
        id: string;
        name: string;
        amount: number;
    }

    let income = $state(50000);
    let expenses: Expense[] = $state([
        { id: '1', name: 'Rent', amount: 15000 },
        { id: '2', name: 'Groceries', amount: 5000 },
    ]);
    
    let newExpenseName = $state("");
    let newExpenseAmount = $state("");

    let totalExpenses = $derived(expenses.reduce((acc, curr) => acc + curr.amount, 0));
    let balance = $derived(income - totalExpenses);

    function addExpense() {
        if (!newExpenseName || !newExpenseAmount) return;
        
        expenses = [
            ...expenses, 
            { 
                id: crypto.randomUUID(), 
                name: newExpenseName, 
                amount: Number(newExpenseAmount) 
            }
        ];
        newExpenseName = "";
        newExpenseAmount = "";
    }

    function removeExpense(id: string) {
        expenses = expenses.filter(e => e.id !== id);
    }
</script>

<div class="grid gap-6 md:grid-cols-2">
    <div class="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Income & Expenses</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="space-y-2">
                    <Label for="income">Monthly Income</Label>
                    <Input id="income" type="number" bind:value={income} />
                </div>

                <div class="pt-4 border-t space-y-4">
                    <Label>Add Expense</Label>
                    <div class="flex gap-2">
                        <Input placeholder="Expense Name" bind:value={newExpenseName} />
                        <Input type="number" placeholder="Amount" class="w-24" bind:value={newExpenseAmount} />
                        <Button size="icon" onclick={addExpense}>
                            <Plus class="size-4" />
                        </Button>
                    </div>
                </div>

                <div class="space-y-2 mt-4">
                    {#each expenses as expense (expense.id)}
                        <div class="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                            <span>{expense.name}</span>
                            <div class="flex items-center gap-4">
                                <span class="font-medium">{siteConfig.localization.currencySymbol}{expense.amount}</span>
                                <button onclick={() => removeExpense(expense.id)} class="text-destructive hover:bg-destructive/10 p-1 rounded">
                                    <Trash2 class="size-4" />
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </CardContent>
        </Card>
    </div>

    <div class="space-y-6">
         <Card class="bg-primary text-primary-foreground">
            <CardHeader>
                <CardTitle class="text-primary-foreground">Summary</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex justify-between items-center text-sm opacity-90">
                    <span>Total Income</span>
                    <span>{siteConfig.localization.currencySymbol}{income}</span>
                </div>
                 <div class="flex justify-between items-center text-sm opacity-90">
                    <span>Total Expenses</span>
                    <span>{siteConfig.localization.currencySymbol}{totalExpenses}</span>
                </div>
                <div class="pt-4 border-t border-primary-foreground/20 flex justify-between items-center">
                    <span class="text-lg font-bold">Remaining Balance</span>
                    <span class="text-2xl font-bold">{siteConfig.localization.currencySymbol}{balance}</span>
                </div>
            </CardContent>
        </Card>
    </div>
</div>
