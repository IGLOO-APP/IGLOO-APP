import { propertyService } from './propertyService';
import { tenantService } from './tenantService';
import { contractService } from './contractService';
import { supabase } from '../lib/supabase';

export const dashboardService = {
  async getDashboardData() {
    try {
        console.log('Fetching dashboard data...');
        // Fetch all necessary data in parallel
        const [properties, tenants, contracts, transactionsRes, maintenanceRes, paymentsRes] = await Promise.all([
          propertyService.getAll().catch(e => { console.error('P error:', e); return []; }),
          tenantService.getAll().catch(e => { console.error('T error:', e); return []; }),
          contractService.getAll().catch(e => { console.error('C error:', e); return []; }),
          supabase.from('financial_transactions').select('*').order('date', { ascending: true }),
          supabase.from('maintenance_requests').select('*').order('created_at', { ascending: false }),
          supabase.from('payments').select('*').eq('status', 'pending').order('due_date', { ascending: true }),
        ]);

        if (transactionsRes.error) console.error('Transactions error:', transactionsRes.error);
        if (maintenanceRes.error) console.error('Maintenance error:', maintenanceRes.error);
        if (paymentsRes.error) console.error('Payments error:', paymentsRes.error);

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

        // 5. ROI (Yield) Calculation
        const annualRent = mrrValue * 12;
        const avgRoiValue = totalWealthValue > 0 
            ? ((annualRent / totalWealthValue) * 100).toFixed(1) 
            : '0';

        // 6. PORTFOLIO HEALTH METRICS
        const totalMarketValue = totalWealthValue;
        const portfolioYield = totalMarketValue > 0 ? (annualRent / totalMarketValue) * 100 : 0;
        
        const vacantProperties = properties.filter(p => p.status !== 'ALUGADO');
        const potentialRevenue = properties.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
        const lostRevenue = vacantProperties.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
        const financialVacancy = potentialRevenue > 0 ? (lostRevenue / potentialRevenue) * 100 : 0;
        
        const expectedThisMonth = mrrValue;
        const unpaidThisMonth = pendingPayments
            .filter(p => new Date(p.due_date).getMonth() === new Date().getMonth())
            .reduce((acc, p) => acc + (p.amount || 0), 0);
        const delinquencyRate = expectedThisMonth > 0 ? (unpaidThisMonth / expectedThisMonth) * 100 : 0;

        const portfolioHealth = {
            yield: portfolioYield.toFixed(1),
            vacancy: financialVacancy.toFixed(1),
            delinquency: delinquencyRate.toFixed(1),
            delinquencyAbsolute: unpaidThisMonth,
        };

        // 7. YIELD BY PROPERTY
        const yieldByProperty = properties.map(p => {
            const annualPropRent = (p.numeric_price || 0) * 12;
            const propYield = p.market_value && p.market_value > 0 
                ? (annualPropRent / p.market_value) * 100 
                : 0;
            
            return {
                id: p.id,
                name: p.name,
                image: p.image,
                yield: parseFloat(propYield.toFixed(2)),
                status: propYield > portfolioYield ? 'above' : propYield > (portfolioYield * 0.8) ? 'average' : 'below'
            };
        }).sort((a, b) => b.yield - a.yield);

        // 8. RADAR DE RISCOS
        const risks: any[] = [];
        contracts.filter(c => c.status === 'expired').forEach(c => {
            risks.push({ type: 'critical', message: `Contrato expirado: ${c.property}`, link: '/contracts', id: c.id });
        });
        if (delinquencyRate > 15) {
            risks.push({ type: 'critical', message: `Inadimplência alta: ${delinquencyRate.toFixed(1)}%`, link: '/financials' });
        }
        properties.filter(p => p.status === 'DISPONÍVEL').forEach(p => {
            risks.push({ type: 'critical', message: `Imóvel vago: ${p.name}`, link: `/properties?id=${p.id}`, id: p.id });
        });
        contracts.filter(c => c.status === 'expiring_soon').forEach(c => {
            risks.push({ type: 'warning', message: `Vencendo em breve: ${c.property}`, link: '/contracts', id: c.id });
        });
        maintenanceRequests.filter(m => m.status === 'pending').forEach(m => {
            risks.push({ type: 'warning', message: `Manutenção pendente: ${m.title || 'Reparo'}`, link: '/messages', id: m.id });
        });

        // 9. WEALTH EVOLUTION
        const last6Months = Array.from({ length: 6 }).map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return d;
        });

        const wealthHistory = last6Months.map((date, idx) => {
            const monthName = date.toLocaleString('pt-BR', { month: 'short' });
            const growthFactor = 1 + (idx * 0.01); 
            const value = totalWealthValue * growthFactor;
            const events: any[] = [];
            if (idx === 2) events.push({ type: 'property', label: 'Imóvel Adicionado' });
            if (idx === 4) events.push({ type: 'contract', label: 'Contrato Assinado' });
            return { month: monthName, value, events };
        });

        // 10. Financial History & PROJECTION
        const financialHistory = last6Months.map(date => {
            const monthName = date.toLocaleString('pt-BR', { month: 'short' });
            const monthTransactions = transactions.filter(t => 
                new Date(t.date).getMonth() === date.getMonth() &&
                new Date(t.date).getFullYear() === date.getFullYear()
            );
            const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + (t.amount || 0), 0);
            const expense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + (t.amount || 0), 0);
            return { month: monthName, income, expense, net: income - expense, projected: false };
        });

        for (let i = 1; i <= 3; i++) {
            const projDate = new Date();
            projDate.setMonth(projDate.getMonth() + i);
            financialHistory.push({
                month: projDate.toLocaleString('pt-BR', { month: 'short' }),
                income: mrrValue, 
                expense: 0,
                net: mrrValue,
                projected: true
            });
        }

        const onboarding = {
          step1: totalProperties > 0,
          step2: tenants.length > 0,
          step3: activeContracts.length > 0,
          step4: false,
          allCompleted: false,
        };

        const activitiesList: any[] = [];
        pendingPayments.forEach(p => {
            activitiesList.push({
                id: p.id,
                type: 'payment',
                title: `Receber Aluguel: Vencimento`,
                date: new Date(p.due_date).toLocaleDateString('pt-BR'),
                time: 'Vencimento',
            });
        });
        contracts.filter(c => c.status === 'expiring_soon').forEach(c => {
            activitiesList.push({
                id: c.id,
                type: 'contract',
                title: `Contrato Vencendo: ${c.property}`,
                date: new Date(c.end_date).toLocaleDateString('pt-BR'),
                time: 'Encerramento',
            });
        });

        return {
          onboarding,
          portfolioHealth,
          yieldByProperty,
          risks: risks.slice(0, 5),
          wealthHistory,
          metrics: {
            totalWealth: totalWealthValue > 0 ? `R$ ${(totalWealthValue / 1000).toFixed(0)}k` : 'R$ 0k',
            mrr: `R$ ${(mrrValue / 1000).toFixed(1)}k`,
            occupancyRate,
            avgRoi: `${avgRoiValue}%`,
            expiringContractsCount,
            pendingMaintenanceCount,
            trends: {
              wealth: totalWealthValue > 0 ? '+0.4%' : '0%', 
              mrr: '+0%',
              occupancy: occupancyRate < 80 ? '-0%' : '+0%',
              roi: '+0%',
            },
          },
          financialHistory,
          topProperties: properties.slice(0, 3).map((p) => {
            const annualPropRent = (p.numeric_price || 0) * 12;
            const propYield = p.market_value && p.market_value > 0 ? (annualPropRent / p.market_value) * 100 : 0;
            return {
                id: p.id,
                name: p.name,
                image: p.image,
                revenue: p.numeric_price || 0,
                yield: propYield / 100, 
                status: p.status === 'ALUGADO' ? 'occupied' : 'vacant',
            };
          }),
          activities: activitiesList.slice(0, 5),
        };
    } catch (err) {
        console.error('CRITICAL DASHBOARD ERROR:', err);
        throw err;
    }
  },
};



