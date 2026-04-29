import { propertyService } from './propertyService';
import { tenantService } from './tenantService';
import { contractService } from './contractService';
import { supabase } from '../lib/supabase';

export const dashboardService = {
  async getDashboardData() {
    // Fetch all necessary data in parallel
    const [properties, tenants, contracts, transactionsRes, maintenanceRes, paymentsRes, authRes] = await Promise.all([
      propertyService.getAll(),
      tenantService.getAll(),
      contractService.getAll(),
      supabase.from('financial_transactions').select('*').order('date', { ascending: true }),
      supabase.from('maintenance_requests').select('*, properties(name)').order('created_at', { ascending: false }),
      supabase.from('payments').select('*, contracts(properties(name))').eq('status', 'pending').order('due_date', { ascending: true }),
      supabase.auth.getUser(),
    ]);

    const userData = authRes.data;
    const transactions = transactionsRes.data || [];
    const maintenanceRequests = maintenanceRes.data || [];
    const pendingPayments = paymentsRes.data || [];

    // 1. Occupancy Calculation (Real)
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter((p) => p.status === 'ALUGADO').length;
    const occupancyRate =
      totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

    // 2. MRR Calculation (Real - Only Active Contracts)
    const activeContracts = contracts.filter(c => c.status === 'active');
    const mrrValue = activeContracts.reduce((acc, c) => acc + (c.numeric_value || 0), 0);

    // 3. Alert Counts (Real)
    const expiringContractsCount = contracts.filter(c => c.status === 'expiring_soon').length;
    const pendingMaintenanceCount = maintenanceRequests.filter(m => m.status === 'pending' || m.status === 'in_progress').length;

    // 4. Total Wealth Calculation (Real - Sum of Market Value)
    const totalWealthValue = properties.reduce((acc, p) => acc + (p.market_value || 0), 0);

    // 5. ROI (Yield) Calculation (Calculated)
    const annualRent = mrrValue * 12;
    const avgRoiValue = totalWealthValue > 0 
        ? ((annualRent / totalWealthValue) * 100).toFixed(1) 
        : '0';

    // 6. Onboarding Logic (Real)
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

    // 7. Financial History & PROJECTION
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d;
    });

    // History (Real Transactions)
    const financialHistory = last6Months.map(date => {
        const monthName = date.toLocaleString('pt-BR', { month: 'short' });
        const monthTransactions = transactions.filter(t => 
            new Date(t.date).getMonth() === date.getMonth() &&
            new Date(t.date).getFullYear() === date.getFullYear()
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

    // PROJECTION (Next 3 Months based on Active Contracts)
    for (let i = 1; i <= 3; i++) {
        const projDate = new Date();
        projDate.setMonth(projDate.getMonth() + i);
        
        financialHistory.push({
            month: projDate.toLocaleString('pt-BR', { month: 'short' }),
            income: mrrValue, // Expected income from active contracts
            expense: 0, // In the future we can fetch recurring expenses
            net: mrrValue,
            projected: true
        });
    }

    // 8. REAL ACTIVITY TIMELINE (Próximos Dias)
    const activities: any[] = [];
    
    // Add upcoming payments
    pendingPayments.forEach(p => {
        activities.push({
            id: p.id,
            type: 'payment',
            title: `Receber Aluguel: ${(p.contracts as any)?.properties?.name || 'Imóvel'}`,
            date: new Date(p.due_date).toLocaleDateString('pt-BR'),
            time: 'Vencimento',
        });
    });

    // Add expiring contracts
    contracts.filter(c => c.status === 'expiring_soon').forEach(c => {
        activities.push({
            id: c.id,
            type: 'contract',
            title: `Contrato Vencendo: ${c.property}`,
            date: new Date(c.end_date).toLocaleDateString('pt-BR'),
            time: 'Encerramento',
        });
    });

    // Add pending maintenance
    maintenanceRequests.filter(m => m.status === 'pending').forEach(m => {
        activities.push({
            id: m.id,
            type: 'maintenance',
            title: `Reparo Pendente: ${(m.properties as any)?.name || 'Imóvel'}`,
            date: new Date(m.created_at).toLocaleDateString('pt-BR'),
            time: m.priority || 'Manutenção',
        });
    });

    return {
      onboarding,
      metrics: {
        totalWealth: totalWealthValue > 0 ? `R$ ${(totalWealthValue / 1000).toFixed(0)}k` : 'R$ 0k',
        mrr: `R$ ${(mrrValue / 1000).toFixed(1)}k`,
        occupancyRate,
        avgRoi: `${avgRoiValue}%`,
        expiringContractsCount,
        pendingMaintenanceCount,
        trends: {
          wealth: totalWealthValue > 0 ? '+0%' : '0%', 
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
            yield: propYield / 100, 
            status: p.status === 'ALUGADO' ? 'occupied' : 'vacant',
        };
      }),
      activities: activities.slice(0, 5), // Limit to 5 upcoming tasks
    };
  },
};



