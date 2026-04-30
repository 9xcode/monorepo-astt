export function calculateSimpleInterest(principal: number, rate: number, years: number): { interest: number; total: number } {
    if (years < 0 || principal < 0 || rate < 0) return { interest: 0, total: 0 };
    // SI = P * R * T / 100
    const interest = (principal * rate * years) / 100;
    const total = principal + interest;
    return { interest, total };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
