export function calculateCompoundInterest(
    principal: number,
    rate: number,
    years: number,
    frequency: number, // Times per year (1, 4, 12, etc.)
    annualAddition: number
): { interest: number; total: number; invested: number } {
    if (years < 0 || principal < 0 || rate < 0) return { interest: 0, total: 0, invested: 0 };
    
    // A = P(1 + r/n)^(nt) + PMT * (((1 + r/n)^(nt) - 1) / (r/n))
    // Note: This formula assumes additions are made at the END of each compounding period if frequency matches.
    // However, usually annual addition is just added once a year.
    // For simplicity with "annual addition", let's assume it's added at the end of each year, and compounding happens 'frequency' times.
    
    let total = principal;
    const r = rate / 100;
    
    // Iterative approach to handle annual additions correctly regardless of compounding frequency
    for (let i = 0; i < years; i++) {
        // Compound for the year
        total = total * Math.pow(1 + r / frequency, frequency);
        // Add annual contribution
        total += annualAddition;
    }

    const invested = principal + (annualAddition * years);
    const interest = total - invested;

    return { interest, total, invested };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
