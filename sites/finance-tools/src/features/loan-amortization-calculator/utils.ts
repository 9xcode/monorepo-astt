export interface AmortizationRow {
    month: number;
    payment: number;
    interest: number;
    principal: number;
    balance: number;
}

export function calculateAmortizationSchedule(principal: number, rate: number, years: number): AmortizationRow[] {
    if (principal <= 0 || rate < 0 || years <= 0) return [];

    const r = rate / 100 / 12;
    const n = years * 12;
    let monthlyPayment = 0;

    if (rate === 0) {
        monthlyPayment = principal / n;
    } else {
        monthlyPayment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    let balance = principal;
    const schedule: AmortizationRow[] = [];

    for (let i = 1; i <= n; i++) {
        const interest = balance * r;
        const principalPayment = monthlyPayment - interest;
        balance -= principalPayment;
        
        if (balance < 0) balance = 0;

        schedule.push({
            month: i,
            payment: monthlyPayment,
            interest: interest,
            principal: principalPayment,
            balance: balance
        });
    }

    return schedule;
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
