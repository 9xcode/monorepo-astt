<script lang="ts">
    import { siteConfig } from "../../config";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
	import { calculateSIP, formatCurrency } from "./utils";

	let monthlyInvestment = $state(5000);
	let expectedReturnRate = $state(12);
	let timePeriod = $state(10);

	let result = $derived(calculateSIP(monthlyInvestment, expectedReturnRate, timePeriod));
</script>

<div class="space-y-8">
	<div class="grid gap-6 md:grid-cols-2">
		<!-- Inputs -->
		<Card>
			<CardHeader>
				<CardTitle>Calculate Returns</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="monthly-investment">Monthly Investment ({siteConfig.localization.currencySymbol})</Label>
					<Input
						id="monthly-investment"
						type="number"
                        min="500"
						bind:value={monthlyInvestment}
					/>
				</div>
				<div class="space-y-2">
					<Label for="return-rate">Expected Return Rate (% p.a)</Label>
					<Input
						id="return-rate"
						type="number"
                        min="1"
                        max="100"
						bind:value={expectedReturnRate}
					/>
				</div>
				<div class="space-y-2">
					<Label for="time-period">Time Period (Years)</Label>
					<Input
						id="time-period"
						type="number"
                        min="1"
                        max="50"
						bind:value={timePeriod}
					/>
				</div>
			</CardContent>
		</Card>

		<!-- Results -->
		<Card class="bg-primary/5 border-primary/20">
			<CardHeader>
				<CardTitle>Result</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<div>
					<p class="text-sm text-muted-foreground">Invested Amount</p>
					<p class="text-2xl font-bold">{formatCurrency(result.investedAmount)}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Est. Returns</p>
					<p class="text-2xl font-bold text-success">{formatCurrency(result.estimatedReturns)}</p>
				</div>
				<div class="pt-4 border-t border-primary/20">
					<p class="text-sm text-muted-foreground">Total Value</p>
					<p class="text-4xl font-bold text-primary">{formatCurrency(result.totalValue)}</p>
				</div>
			</CardContent>
		</Card>
	</div>

    <!-- Chart Placeholder (Future) -->
    <!-- <Card>
        <CardContent class="h-64 flex items-center justify-center text-muted-foreground">
            Chart Visualization Area
        </CardContent>
    </Card> -->
</div>
