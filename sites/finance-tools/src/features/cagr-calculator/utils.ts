export function calculateCAGR(startValue: number, endValue: number, years: number): number {
    if (years <= 0 || startValue <= 0) return 0;
    // CAGR formula: (EndingValue / BeginningValue) ^ (1/n) - 1
    const cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
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
