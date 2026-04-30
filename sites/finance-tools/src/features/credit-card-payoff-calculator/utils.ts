export function calculateCreditCardPayoff(
    balance: number,
    rate: number,
    monthlyPayment: number
): { months: number; totalInterest: number; totalPayment: number; warning?: string } {
    if (balance <= 0 || rate < 0 || monthlyPayment <= 0) {
        return { months: 0, totalInterest: 0, totalPayment: 0 };
    }

    const r = rate / 100 / 12;
    
    // Check if payment covers interest
    const monthlyInterest = balance * r;
    if (monthlyPayment <= monthlyInterest) {
        return { 
            months: Infinity, 
            totalInterest: Infinity, 
            totalPayment: Infinity, 
            warning: "Payment is too low to cover interest. You will never pay off this debt." 
        };
    }

    // n = -log(1 - (r * P) / A) / log(1 + r)
    // P = Balance, A = Payment
    const n = -Math.log(1 - (r * balance) / monthlyPayment) / Math.log(1 + r);
    const months = Math.ceil(n);
    
    // Recalculate exact totals iteratively to be precise with last partial payment
    let currentBalance = balance;
    let totalInterest = 0;
    
    for(let i=0; i<months; i++) {
        const interest = currentBalance * r;
        totalInterest += interest;
        const principal = monthlyPayment - interest;
        currentBalance -= principal;
    }

    // Adjust for the fact that last payment might be less
    // A simpler approximation: Total Payment = Months * Payment is slightly off if last payment is partial.
    // Let's stick to simple Total Payment = Balance + Total Interest 
    const totalPayment = balance + totalInterest;

    return { months, totalInterest, totalPayment };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
