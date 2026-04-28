export function calculateEmergencyFund(
    monthlyExpenses: number,
    months: number,
    currentSavings: number
): { targetAmount: number; gap: number } {
    if (monthlyExpenses < 0 || months < 0) return { targetAmount: 0, gap: 0 };
    
    const targetAmount = monthlyExpenses * months;
    const gap = targetAmount - currentSavings;
    
    return { targetAmount, gap };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
