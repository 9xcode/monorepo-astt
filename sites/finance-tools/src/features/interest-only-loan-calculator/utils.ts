export function calculateInterestOnlyLoan(
    principal: number,
    rate: number,
    totalTerm: number,
    ioPeriod: number
): { ioPayment: number; piPayment: number; totalInterest: number; totalPayment: number } {
    if (principal <= 0 || rate < 0 || totalTerm <= 0) return { ioPayment: 0, piPayment: 0, totalInterest: 0, totalPayment: 0 };

    const r = rate / 100 / 12;
    const nTotal = totalTerm * 12;
    const nIO = ioPeriod * 12;
    const nPI = nTotal - nIO;

    // Interest Only Payment
    const ioPayment = principal * r;

    // Principal + Interest Payment (after IO period)
    let piPayment = 0;
    if (nPI > 0) {
        if (rate === 0) {
            piPayment = principal / nPI;
        } else {
            piPayment = (principal * r * Math.pow(1 + r, nPI)) / (Math.pow(1 + r, nPI) - 1);
        }
    }

    const totalInterestIO = ioPayment * nIO;
    const totalPaymentPI = piPayment * nPI;
    const totalPayment = totalInterestIO + totalPaymentPI;
    const totalInterest = totalPayment - principal;

    return { ioPayment, piPayment, totalInterest, totalPayment };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
