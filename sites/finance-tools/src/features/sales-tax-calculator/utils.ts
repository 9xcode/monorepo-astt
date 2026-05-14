export function calculateSalesTax(
    amount: number,
    rate: number,
    type: 'add' | 'extract' // Add tax to net, or extract tax from gross
): { netAmount: number; taxAmount: number; grossAmount: number } {
    if (type === 'add') {
        // Amount is Net
        const taxAmount = amount * (rate / 100);
        const grossAmount = amount + taxAmount;
        return { netAmount: amount, taxAmount, grossAmount };
    } else {
        // Amount is Gross (Inclusive of tax)
        // Gross = Net * (1 + rate/100)
        // Net = Gross / (1 + rate/100)
        const netAmount = amount / (1 + rate / 100);
        const taxAmount = amount - netAmount;
        return { netAmount, taxAmount, grossAmount: amount };
    }
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount);
};
