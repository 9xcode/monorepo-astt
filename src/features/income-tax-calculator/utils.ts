export function calculateIncomeTax(income: number, regime: 'old' | 'new'): { tax: number; cess: number; totalTax: number } {
    let tax = 0;
    
    // Simplified India Tax Slabs (FY 2024-25 estimates for demo)
    if (regime === 'new') {
        // New Regime
        // 0-3L: Nil
        // 3-7L: 5% (Rebate u/s 87A makes it 0 if income <= 7L)
        // 7-10L: 10%
        // 10-12L: 15%
        // 12-15L: 20%
        // >15L: 30%
        
        let taxableInfo = income;
        
        // Standard Deduction 75k for New Regime (FY25 proposed/actual)
        const stdDed = 75000;
        taxableInfo -= stdDed;
        if (taxableInfo < 0) taxableInfo = 0;

        if (taxableInfo <= 1200000 && income <= 1275000) {
             // 87A rebate logic allows tax free up to 7L, or marginally relief logic. 
             // Let's implement basics brackets.
        }


        
        // Let's use simple logic
        // 0-3L: 0
        // 3-7L: 5%
        // 7-10L: 10%
        // 10-12L: 15%
        // 12-15L: 20%
        // >15L: 30%
        
        let remIncome = taxableInfo;
        
        // Slab 1: 0-3L
        remIncome -= 300000;
        
        if (remIncome > 0) {
             // Slab 2: 3-7L (4L width)
             const taxable = Math.min(remIncome, 400000);
             tax += taxable * 0.05;
             remIncome -= 400000;
        }
        
        if (remIncome > 0) {
            // Slab 3: 7-10L (3L width)
            const taxable = Math.min(remIncome, 300000);
            tax += taxable * 0.10;
            remIncome -= 300000;
        }

        if (remIncome > 0) {
            // Slab 4: 10-12L (2L width)
            const taxable = Math.min(remIncome, 200000);
            tax += taxable * 0.15;
            remIncome -= 200000;
        }

        if (remIncome > 0) {
            // Slab 5: 12-15L (3L width)
            const taxable = Math.min(remIncome, 300000);
            tax += taxable * 0.20;
            remIncome -= 300000;
        }

        if (remIncome > 0) {
            // Slab 6: >15L
            tax += remIncome * 0.30;
        }
        
        // Rebate u/s 87A: If taxable income <= 7L, tax is 0.
        // Actually limit is on Total Income. Assuming user entered deduction adjusted income?
        // Let's assume input is Gross. We subtracted std ded.
        // If (income - stdDed) <= 700000, rebate is full tax.
        if (taxableInfo <= 700000) {
            tax = 0;
        }
        
    } else {
        // Old Regime (Simplified - No deductions inputs so just basic slabs)
        // 0-2.5L: Nil
        // 2.5-5L: 5%
        // 5-10L: 20%
        // >10L: 30%
         let taxableInfo = income - 50000; // Std Ded
         if (taxableInfo < 0) taxableInfo = 0;

         let remIncome = taxableInfo;
         remIncome -= 250000;

         if (remIncome > 0) {
             const taxable = Math.min(remIncome, 250000);
             tax += taxable * 0.05;
             remIncome -= 250000;
         }

         if (remIncome > 0) {
             const taxable = Math.min(remIncome, 500000);
             tax += taxable * 0.20;
             remIncome -= 500000;
         }

         if (remIncome > 0) {
             tax += remIncome * 0.30;
         }
         
         if (taxableInfo <= 500000) {
             tax = 0;
         }
    }

    const cess = tax * 0.04;
    return { tax, cess, totalTax: tax + cess };
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
