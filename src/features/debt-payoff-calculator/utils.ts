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
    // Deep copy to avoid mutating inputs
    const currentDebts = debts.map(d => ({ ...d }));
    let totalInterest = 0;
    let months = 0;
    const paidOffDebts: string[] = [];

    // Sort debts based on strategy
    // Snowball: Lowest balance first
    // Avalanche: Highest rate first
    // Note: This sort order determines priority for EXTRA payment. Min payments must always be made.
    
    // Simulation
    while (currentDebts.some(d => d.balance > 0)) {
        months++;
        if (months > 600) break; // Safety break (50 years)



        // Sort just for priority of extra payment allocation
        [...currentDebts].filter(d => d.balance > 0).sort((a, b) => {
            if (strategy === 'snowball') return a.balance - b.balance;
            return b.rate - a.rate;
        });

        // 1. Charge Interest & Pay Minimums
        for (const debt of currentDebts) {
             if (debt.balance <= 0) continue;

             const monthlyInterest = debt.balance * (debt.rate / 100 / 12);
             totalInterest += monthlyInterest;
             debt.balance += monthlyInterest;

             let payment = debt.minPayment;
             if (debt.balance < payment) {
                 payment = debt.balance;
             }
             
             debt.balance -= payment;
             
             // If minimum payment was more than balance, the "excess" from minimum isn't really "extra" 
             // in a strict sense unless user budget model is total budget. 
             // But usually, debt payoff calculators assume:
             // Total Budget = Sum(Min Payments) + Extra.
             // If a debt is paid off, its min payment becomes available as "Extra".
             
             if (debt.balance <= 0) {
                 debt.balance = 0; // Floating point safety
                  if (!paidOffDebts.includes(debt.name)) {
                     paidOffDebts.push(debt.name);
                 }
                 // The amount that WAS allocated to min payment is now available for the priority debt
                 // But wait, we already subtracted 'payment' from this debt.
                 // In the 'rollover' method, the min payment of paid-off debts gets added to the extra payment.
                 // We need to handle this logic carefully.
             }
        }

        // 2. Rollover Logic: Calculate total available "budget" for this month
        // Actually, the standard algorithm is: 
        // Budget = Sum(Original Min Payments) + Original Extra.
        // We pay min on all active debts. Remaining Budget goes to priority debt.
        
        // Let's refine the simulation loop to be more robust for rollover.
    }
    
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
