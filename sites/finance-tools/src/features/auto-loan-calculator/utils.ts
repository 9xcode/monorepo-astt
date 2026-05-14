export function calculateAutoLoan(
    price: number,
    downPayment: number,
    tradeIn: number,
    rate: number,
    months: number,
    salesTax: number
): { monthlyPayment: number; totalLoanAmount: number; totalInterest: number; totalCost: number } {
    if (price < 0 || rate < 0 || months <= 0) return { monthlyPayment: 0, totalLoanAmount: 0, totalInterest: 0, totalCost: 0 };

    // Tax is usually on price - tradeIn in many places, or just price. Let's assume on dif.
    // Actually, simple auto loan:
    // Loan Amount = Price + Tax - DownPayment - TradeIn
    
    // Let's assume Tax is a % of Price.
    const taxAmount = (price * salesTax) / 100;
    const totalLoanAmount = price + taxAmount - downPayment - tradeIn;
    
    if (totalLoanAmount <= 0) return { monthlyPayment: 0, totalLoanAmount: 0, totalInterest: 0, totalCost: price + taxAmount };

    const r = rate / 100 / 12;
    
    let monthlyPayment = 0;
    if (rate === 0) {
        monthlyPayment = totalLoanAmount / months;
    } else {
        monthlyPayment = (totalLoanAmount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    }

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - totalLoanAmount;
    const totalCost = price + taxAmount + totalInterest; // Total cost of car including interest

    return { monthlyPayment, totalLoanAmount, totalInterest, totalCost };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
