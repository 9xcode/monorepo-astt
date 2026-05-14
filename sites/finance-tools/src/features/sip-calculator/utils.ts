import type { SIPResult } from './types';

export const calculateSIP = (
	monthlyInvestment: number,
	annualRate: number,
	years: number
): SIPResult => {
	const monthlyRate = annualRate / 12 / 100;
	const months = years * 12;

	if (annualRate === 0) {
		const totalValue = monthlyInvestment * months;
		return {
			investedAmount: totalValue,
			estimatedReturns: 0,
			totalValue,
		};
	}

	const totalValue =
		monthlyInvestment *
		((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
		(1 + monthlyRate);

	const investedAmount = monthlyInvestment * months;
	const estimatedReturns = totalValue - investedAmount;

	return {
		investedAmount: Math.round(investedAmount),
		estimatedReturns: Math.round(estimatedReturns),
		totalValue: Math.round(totalValue),
	};
};

export const formatCurrency = (amount: number, currency = 'INR') => {
	return new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
};
