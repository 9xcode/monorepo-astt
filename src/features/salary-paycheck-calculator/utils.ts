export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'annually';

export function calculatePaycheck(amount: number, type: 'salary' | 'hourly', frequency: PayFrequency, hoursPerWeek: number = 40): any {
    let annualSalary = 0;

    if (type === 'hourly') {
        annualSalary = amount * hoursPerWeek * 52;
    } else {
        annualSalary = amount;
    }

    const periods = {
        weekly: 52,
        biweekly: 26,
        semimonthly: 24,
        monthly: 12,
        annually: 1
    };

    const numPeriods = periods[frequency];
    const grossPay = annualSalary / numPeriods;

    // Simple deduction estimation (e.g., 20% total tax + benefits)
    const estimatedDeductions = grossPay * 0.20;
    const netPay = grossPay - estimatedDeductions;

    return {
        annualSalary,
        grossPay,
        estimatedDeductions,
        netPay,
        frequencyName: frequency.charAt(0).toUpperCase() + frequency.slice(1)
    };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
