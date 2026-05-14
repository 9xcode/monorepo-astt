export function calculateROI(invested: number, returned: number): { roi: number; profit: number; annualizedROI: number } {
    const profit = returned - invested;
    const roi = (profit / invested) * 100;
    // Assuming 1 year for simple annualized if not provided, but for basic ROI we just return the total ROI
    return {
        roi,
        profit,
        annualizedROI: roi // Placeholder if time is not an input
    };
}

export function calculateAnnualizedROI(invested: number, returned: number, years: number): number {
    if (years <= 0) return 0;

    // CAGR formula: (EndingValue / BeginningValue) ^ (1/n) - 1
    const cagr = (Math.pow(returned / invested, 1 / years) - 1) * 100;
    return cagr;
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatPercentage = (rate: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(rate / 100);
};
