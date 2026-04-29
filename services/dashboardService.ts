import { propertyService } from './propertyService';
import { tenantService } from './tenantService';
import { contractService } from './contractService';
import { supabase } from '../lib/supabase';

export const dashboardService = {
  async getDashboardData() {
    // Fetch all necessary data in parallel
    const [properties, tenants, contracts, transactionsRes, authRes] = await Promise.all([
      propertyService.getAll(),
      tenantService.getAll(),
      contractService.getAll(),
      supabase.from('financial_transactions').select('*').order('date', { ascending: true }),
      supabase.auth.getUser(),
    ]);

    const userData = authRes.data;
    const transactions = transactionsRes.data || [];

    // 1. Occupancy Calculation (Real)
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter((p) => p.status === 'ALUGADO').length;
    const occupancyRate =
      totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

    // 2. MRR Calculation (Real - Only Active Contracts)
    const activeContracts = contracts.filter(c => c.status === 'active');
    const mrrValue = activeContracts.reduce((acc, c) => acc + (c.numeric_value || 0), 0);

    // 3. Total Wealth Calculation (Real - Sum of Market Value)
    const totalWealthValue = properties.reduce((acc, p) => acc + (p.market_value || 0), 0);

    // 4. ROI (Yield) Calculation (Calculated)
    // Formula: (Annual Active Rent / Total Market Value) * 100
    const annualRent = mrrValue * 12;
    const avgRoiValue = totalWealthValue > 0 
        ? ((annualRent / totalWealthValue) * 100).toFixed(1) 
        : '0';

    // 5. Onboarding Logic (Real)
    const onboarding = {
      step1: totalProperties > 0,
      step2: tenants.length > 0,
      step3: activeContracts.length > 0,
      step4: false,
      allCompleted: false,
    };

    if (userData?.user) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', userData.user.id)
        .single();
      onboarding.step4 = !!userProfile?.phone;
    }
    onboarding.allCompleted = onboarding.step1 && onboarding.step2 && onboarding.step3 && onboarding.step4;

    // 6. Real Financial History (from transactions)
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('pt-BR', { month: 'short' });
    });

    const financialHistory = last6Months.map(monthName => {
        const monthTransactions = transactions.filter(t => 
            new Date(t.date).toLocaleString('pt-BR', { month: 'short' }) === monthName
        );
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + (t.amount || 0), 0);
            
        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + (t.amount || 0), 0);

        return {
            month: monthName,
            income,
            expense,
            net: income - expense,
            projected: false
        };
    });

    // Handle empty state for chart
    if (financialHistory.every(h => h.income === 0 && h.expense === 0)) {
        // Fallback to active contract value for the current month if no transactions exist yet
        const currentMonth = new Date().toLocaleString('pt-BR', { month: 'short' });
        const currentMonthIdx = financialHistory.findIndex(h => h.month === currentMonth);
        if (currentMonthIdx !== -1) {
            financialHistory[currentMonthIdx].income = mrrValue;
            financialHistory[currentMonthIdx].net = mrrValue;
            financialHistory[currentMonthIdx].projected = true;
        }
    }

    return {
      onboarding,
      metrics: {
        totalWealth: totalWealthValue > 0 ? `R$ ${(totalWealthValue / 1000).toFixed(0)}k` : 'R$ 0k',
        mrr: `R$ ${(mrrValue / 1000).toFixed(1)}k`,
        occupancyRate,
        avgRoi: `${avgRoiValue}%`,
        trends: {
          wealth: totalWealthValue > 0 ? '+0%' : '0%', // Trends would need snapshots to be real
          mrr: '+0%',
          occupancy: occupancyRate < 80 ? '-0%' : '+0%',
          roi: '+0%',
        },
      },
      financialHistory,
      topProperties: properties.slice(0, 3).map((p) => {
        const annualPropRent = (p.numeric_price || 0) * 12;
        const propYield = p.market_value && p.market_value > 0 
            ? (annualPropRent / p.market_value) * 100 
            : 0;
            
        return {
            id: p.id,
            name: p.name,
            image: p.image,
            revenue: p.numeric_price || 0,
            yield: propYield / 100, // components expect decimal
            status: p.status === 'ALUGADO' ? 'occupied' : 'vacant',
        };
      }),
      activities: [], // This would require a separate log table
    };
  },
};

