export interface Debt {
    id: string; // unique
    name: string;
    balance: number;
    rate: number;
    minPayment: number;
}

export interface PayoffStrategyResult {
    strategyName: string;
    totalInterest: number;
    payoffMonths: number;
    debtPayoffOrder: string[]; // Names of debts in order of payoff
}

export function calculateDebtPayoff(
    debts: Debt[],
    extraPayment: number,
    strategy: 'snowball' | 'avalanche'
): PayoffStrategyResult {
    // Re-implementation with robust rollover
    return calculateRobustPayoff(debts, extraPayment, strategy);
}

function calculateRobustPayoff(debts: Debt[], extraPayment: number, strategy: 'snowball' | 'avalanche'): PayoffStrategyResult {
    let currentDebts = debts.map(d => ({ ...d, originalMin: d.minPayment }));
    let totalInterest = 0;
    let months = 0;
    const paidOffOrder: string[] = [];
    
    const totalMonthlyBudget = currentDebts.reduce((sum, d) => sum + d.minPayment, 0) + extraPayment;

    while (currentDebts.some(d => d.balance > 0.01)) {
        months++;
        if (months > 600) break; // 50 years max

        // Interest accrual
        currentDebts.forEach(d => {
            if (d.balance > 0) {
                const interest = d.balance * (d.rate / 100 / 12);
                d.balance += interest;
                totalInterest += interest;
            }
        });

        // Determine payments
        // 1. Assign min payments to all active debts
        // 2. Any leftover from budget (due to paid off debts or extra) goes to priority debt
        
        let availableBudget = totalMonthlyBudget;
        
        // Pay minimums on active debts first
        currentDebts.forEach(d => {
            if (d.balance > 0) {
                const payment = Math.min(d.balance, d.minPayment);
                d.balance -= payment;
                availableBudget -= payment;
                
                if (d.balance <= 0.01) {
                    d.balance = 0;
                    if (!paidOffOrder.includes(d.name)) paidOffOrder.push(d.name);
                }
            }
        });
        
        // Apply remaining budget (snowball/avalanche) to priority debt
        if (availableBudget > 0) {
            const activeDebts = currentDebts.filter(d => d.balance > 0);
            if (activeDebts.length > 0) {
                // Sort
                activeDebts.sort((a, b) => {
                    if (strategy === 'snowball') return a.balance - b.balance; // Low bal first
                    return b.rate - a.rate; // High rate first
                });
                
                const priorityDebt = activeDebts[0];
                if (priorityDebt) {
                    const payment = Math.min(priorityDebt.balance, availableBudget);
                    priorityDebt.balance -= payment;
                    // availableBudget -= payment; // consumed
                    
                    if (priorityDebt.balance <= 0.01) {
                        priorityDebt.balance = 0;
                        if (!paidOffOrder.includes(priorityDebt.name)) paidOffOrder.push(priorityDebt.name);
                    }
                }
            }
        }
    }

    return {
        strategyName: strategy === 'snowball' ? 'Debt Snowball' : 'Debt Avalanche',
        totalInterest,
        payoffMonths: months,
        debtPayoffOrder: paidOffOrder
    };
}


export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
