export function calculatePV(futureValue: number, rate: number, years: number): number {
    if (years < 0) return 0;
    // PV = FV / (1 + r)^n
    const r = rate / 100;
    return futureValue / Math.pow(1 + r, years);
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
