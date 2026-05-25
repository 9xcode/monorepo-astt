export function calculateFV(presentValue: number, rate: number, years: number): number {
    if (years < 0) return 0;
    // FV = PV * (1 + r)^n
    const r = rate / 100;
    return presentValue * Math.pow(1 + r, years);
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
