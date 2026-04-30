<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import { ArrowRightLeft } from '@lucide/svelte';

    let amount = $state(1);
    let fromCurrency = $state("USD");
    let toCurrency = $state("INR");

    const rates: Record<string, number> = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        INR: 83.5,
        JPY: 151.5,
        CAD: 1.36,
        AUD: 1.52,
    };

    let result = $derived((amount * (rates[toCurrency] / rates[fromCurrency])).toFixed(2));

    function swapCurrencies() {
        const temp = fromCurrency;
        fromCurrency = toCurrency;
        toCurrency = temp;
    }
</script>

<div class="space-y-6">
    <div class="grid gap-4 md:grid-cols-[1fr_auto_1fr] items-end">
        <div class="space-y-2">
            <Label for="amount">Amount</Label>
            <Input id="amount" type="number" bind:value={amount} min="0" />
        </div>
        
        <div class="flex justify-center pb-2">
            <Button variant="ghost" size="icon" onclick={swapCurrencies} aria-label="Swap currencies">
                <ArrowRightLeft class="size-4" />
            </Button>
        </div>

        <div class="space-y-2">
             <Label for="from">From</Label>
             <!-- Using native select for simplicity, styled to match -->
             <select
                id="from"
                bind:value={fromCurrency}
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
             >
                {#each Object.keys(rates) as currency (currency)}
                    <option value={currency}>{currency}</option>
                {/each}
             </select>
        </div>
    </div>

    <div class="space-y-2">
        <Label for="to">To</Label>
         <select
            id="to"
            bind:value={toCurrency}
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
         >
            {#each Object.keys(rates) as currency (currency)}
                <option value={currency}>{currency}</option>
            {/each}
         </select>
    </div>

    <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
        <div class="text-sm text-muted-foreground mb-1">
            {amount} {fromCurrency} =
        </div>
        <div class="text-4xl font-bold tracking-tighter">
            {result} <span class="text-2xl font-normal text-muted-foreground">{toCurrency}</span>
        </div>
    </div>
</div>
