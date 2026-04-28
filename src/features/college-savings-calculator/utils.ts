export function calculateCollegeSavings(
    currentAge: number,
    collegeAge: number,
    annualCost: number,
    yearsInCollege: number,
    inflationRate: number,
    currentSavings: number,
    returnRate: number
): { totalCost: number; monthlySavingsNeeded: number; projectedSavings: number } {
    if (collegeAge <= currentAge) return { totalCost: 0, monthlySavingsNeeded: 0, projectedSavings: 0 };

    const yearsToStart = collegeAge - currentAge;
    const r = returnRate / 100;
    const i = inflationRate / 100;

    // Calculate Future Cost of College
    // We need to sum up the cost for each year of college, adjusted for inflation
    let totalCost = 0;
    for (let year = 0; year < yearsInCollege; year++) {
        const costAtStart = annualCost * Math.pow(1 + i, yearsToStart + year);
        totalCost += costAtStart;
    }

    // Projected Growth of Current Savings
    const projectedSavings = currentSavings * Math.pow(1 + r, yearsToStart);

    // Shortfall
    const shortfall = totalCost - projectedSavings;

    if (shortfall <= 0) {
        return { totalCost, monthlySavingsNeeded: 0, projectedSavings };
    }

    // Monthly Savings Needed to cover shortfall
    // FV of Annuity Formula: FV = P * [((1 + r/12)^(n*12) - 1) / (r/12)]
    // We need to find P.
    // P = FV * (r/12) / ((1 + r/12)^(n*12) - 1)
    
    const monthlyRate = r / 12;
    const months = yearsToStart * 12;
    
    let monthlySavingsNeeded = 0;
    if (monthlyRate === 0) {
        monthlySavingsNeeded = shortfall / months;
    } else {
        monthlySavingsNeeded = (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
    }

    return { totalCost, monthlySavingsNeeded, projectedSavings };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
