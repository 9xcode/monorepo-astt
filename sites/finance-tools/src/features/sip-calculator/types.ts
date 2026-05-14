export interface SIPResult {
	investedAmount: number;
	estimatedReturns: number;
	totalValue: number;
}

export interface SIPInput {
	monthlyInvestment: number;
	expectedReturnRate: number;
	timePeriod: number;
}
