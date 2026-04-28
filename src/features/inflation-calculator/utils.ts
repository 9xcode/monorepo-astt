export function calculateInflation(
    amount: number,
    startYear: number,
    endYear: number,
    rate: number
): { futureValue: number; difference: number } {
    if (endYear < startYear) return { futureValue: amount, difference: 0 };
    
    // FV = PV * (1 + r)^n
    const n = endYear - startYear;
    const r = rate / 100;
    
    const futureValue = amount * Math.pow(1 + r, n);
    const difference = futureValue - amount;
    
    return { futureValue, difference };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
