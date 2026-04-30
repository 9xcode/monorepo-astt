export function calculateMortgage(principal: number, rate: number, years: number): { monthlyPayment: number; totalPayment: number; totalInterest: number } {
    if (principal <= 0 || rate < 0 || years <= 0) {
        return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
    }

    const r = rate / 100 / 12;
    const n = years * 12;

    let monthlyPayment = 0;
    if (rate === 0) {
        monthlyPayment = principal / n;
    } else {
        monthlyPayment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - principal;

    return { monthlyPayment, totalPayment, totalInterest };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { // Changed to US for Mortgage context usually, but can keep generic. Let's stick to Indian/Generic or US? User asked for generic tools. I used INR before. I should consistency use INR or generic $ if no currency symbol.
        // Actually, let's Stick to INR as per previous tools for consistency, or generic.
        // The previous tools used INR strings. I will stick to INR for now as the user seems to be Indian (Kumar).
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
