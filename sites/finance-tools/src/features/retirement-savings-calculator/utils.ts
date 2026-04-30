export function calculateRetirement(
    currentAge: number,
    retirementAge: number,
    monthlyExpenses: number,
    currentSavings: number,
    monthlyContribution: number,
    returnRate: number,
    inflationRate: number
): { projectedSavings: number; requiredAmount: number; gap: number } {
    if (retirementAge <= currentAge) return { projectedSavings: 0, requiredAmount: 0, gap: 0 };

    const yearsToInvest = retirementAge - currentAge;
    const r = returnRate / 100 / 12; // Monthly return
    const n = yearsToInvest * 12;

    // Projected Future Value of Current Savings + Monthly Contributions
    let projectedSavings = 0;
    
    // FV of Initial Lumpsum
    projectedSavings += currentSavings * Math.pow(1 + r, n);
    
    // FV of Monthly Contributions
    if (r === 0) {
        projectedSavings += monthlyContribution * n;
    } else {
        projectedSavings += monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
    }

    // Amount Required at Retirement
    // This is tricky. Usually use "Safe Withdrawal Rate" (e.g., 4%) or "Life Expectancy"
    // Let's assume life expectancy of 85 (standard simple calc) and inflation adjusted expenses.
    
    const yearsInRetirement = 85 - retirementAge;
    const i = inflationRate / 100;
    
    // Future Monthly Expenses at retirement
    const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + i, yearsToInvest);
    
    // Total Corpus Required
    // Simple Corpus = Annual Expenses / Withdrawal Rate (e.g., 4%)
    // But let's use a simpler "Expenses * 12 * Years in Retirement" (ignoring post-retirement growth/inflation cancel out)
    // Or better: Present Value of Annuity for retirement years.
    // Let's assume post-retirement return = inflation (conservative). Then it's just total expenses.
    
    const requiredAmount = futureMonthlyExpenses * 12 * yearsInRetirement;

    return { projectedSavings, requiredAmount, gap: requiredAmount - projectedSavings };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
