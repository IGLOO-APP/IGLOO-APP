import { propertyService } from './propertyService';
import { tenantService } from './tenantService';
import { contractService } from './contractService';
import { financeService } from './financeService';
import { supabase } from '../lib/supabase';
import { paymentService } from './paymentService';

export const dashboardService = {
  async getDashboardData(userId: string) {
    try {
      console.log('Fetching dashboard data...');
      const [properties, tenants, contracts, transactions, maintenanceRequests, pendingPayments] = await Promise.all([
        propertyService.getAll(),
        tenantService.getAll(),
        contractService.getAll(),
        financeService.getAll(),
        supabase.from('maintenance_requests').select('*').order('created_at', { ascending: false }).then(res => res.data || []),
        paymentService.getPending(userId),
      ]);

      const activeContracts = contracts.filter(c => c.status === 'active');
      const mrrValue = activeContracts.reduce((acc, c) => acc + (c.numeric_value || 0), 0);
      const totalWealthValue = properties.reduce((acc, p) => acc + (p.market_value || 0), 0);

      const portfolioHealth = this._calculatePortfolioHealth(properties, mrrValue, pendingPayments);
      const yieldByProperty = this._calculateYieldByProperty(properties, portfolioHealth.yield);
      const risks = this._calculateRisks(contracts, portfolioHealth.delinquency, properties, maintenanceRequests);
      
      const last6Months = this._getLast6Months();
      const wealthHistory = this._generateWealthHistory(last6Months, totalWealthValue);
      const financialHistory = this._generateFinancialHistory(last6Months, transactions, mrrValue);
      
      const progression = this._calculateProgression(properties, tenants, activeContracts, transactions, maintenanceRequests, portfolioHealth, occupancyRate(properties), contracts);

      return {
        onboarding: progression,
        properties,
        portfolioHealth,
        yieldByProperty,
        risks: risks.slice(0, 5),
        wealthHistory,
        metrics: {
          totalWealth: totalWealthValue > 0 ? `R$ ${(totalWealthValue / 1000).toFixed(0)}k` : 'R$ 0k',
          mrr: `R$ ${(mrrValue / 1000).toFixed(1)}k`,
          occupancyRate: occupancyRate(properties),
          avgRoi: `${totalWealthValue > 0 ? ((mrrValue * 12 / totalWealthValue) * 100).toFixed(1) : '0'}%`,
          expiringContractsCount: contracts.filter(c => c.status === 'expiring_soon').length,
          pendingMaintenanceCount: maintenanceRequests.filter(m => m.status === 'pending' || m.status === 'in_progress').length,
          trends: {
            wealth: totalWealthValue > 0 ? '+0.4%' : '0%', // Simulation
            mrr: '+0%',
            occupancy: occupancyRate(properties) < 80 ? '-0%' : '+0%',
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
        activities: this._consolidateActivities(transactions, maintenanceRequests, properties).slice(0, 5),
      };
    } catch (err) {
      console.error('CRITICAL DASHBOARD ERROR:', err);
      throw err;
    }
  },

  _calculatePortfolioHealth(properties: any[], mrrValue: number, pendingPayments: any[]) {
    const totalWealthValue = properties.reduce((acc, p) => acc + (p.market_value || 0), 0);
    const annualRent = mrrValue * 12;
    const portfolioYield = totalWealthValue > 0 ? (annualRent / totalWealthValue) * 100 : 0;

    const vacantProperties = properties.filter(p => p.status !== 'ALUGADO');
    const potentialRevenue = properties.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
    const lostRevenue = vacantProperties.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
    const financialVacancy = potentialRevenue > 0 ? (lostRevenue / potentialRevenue) * 100 : 0;

    const unpaidThisMonth = pendingPayments
      .filter(p => new Date(p.due_date).getMonth() === new Date().getMonth())
      .reduce((acc, p) => acc + (p.amount || 0), 0);
    const delinquencyRate = mrrValue > 0 ? (unpaidThisMonth / mrrValue) * 100 : 0;

    return {
      yield: portfolioYield.toFixed(1),
      vacancy: financialVacancy.toFixed(1),
      delinquency: delinquencyRate.toFixed(1),
      delinquencyAbsolute: unpaidThisMonth,
    };
  },

  _calculateYieldByProperty(properties: any[], portfolioYieldStr: string) {
    const portfolioYield = parseFloat(portfolioYieldStr);
    return properties.map(p => {
      const annualPropRent = (p.numeric_price || 0) * 12;
      const propYield = p.market_value && p.market_value > 0 ? (annualPropRent / p.market_value) * 100 : 0;
      return {
        id: p.id,
        name: p.name,
        image: p.image,
        yield: parseFloat(propYield.toFixed(2)),
        status: propYield > portfolioYield ? 'above' : propYield > (portfolioYield * 0.8) ? 'average' : 'below'
      };
    }).sort((a, b) => b.yield - a.yield);
  },

  _calculateRisks(contracts: any[], delinquencyRateStr: string, properties: any[], maintenanceRequests: any[]) {
    const risks: any[] = [];
    const delinquencyRate = parseFloat(delinquencyRateStr);

    contracts.filter(c => c.status === 'expired').forEach(c => {
      risks.push({ type: 'critical', message: `Contrato expirado: ${c.property}`, link: '/contracts', id: c.id });
    });
    if (delinquencyRate > 15) {
      risks.push({ type: 'critical', message: `Inadimplência alta: ${delinquencyRate}%`, link: '/financials' });
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
    return risks;
  },

  _getLast6Months() {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d;
    });
  },

  _generateWealthHistory(last6Months: Date[], totalWealthValue: number) {
    return last6Months.map((date, idx) => {
      const monthName = date.toLocaleString('pt-BR', { month: 'short' });
      const growthFactor = 1 + (idx * 0.01); // Simulated growth
      const value = totalWealthValue * growthFactor;
      const events: any[] = [];
      if (idx === 2) events.push({ type: 'property', label: 'Imóvel Adicionado' });
      if (idx === 4) events.push({ type: 'contract', label: 'Contrato Assinado' });
      return { month: monthName, value, events };
    });
  },

  _generateFinancialHistory(last6Months: Date[], transactions: any[], mrrValue: number) {
    const history = last6Months.map(date => {
      const monthName = date.toLocaleString('pt-BR', { month: 'short' });
      const monthTransactions = transactions.filter(t =>
        new Date(t.date).getMonth() === date.getMonth() &&
        new Date(t.date).getFullYear() === date.getFullYear()
      );
      const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + (t.amount || 0), 0);
      const expense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + (t.amount || 0), 0);
      return { month: monthName, income, expense, net: income - expense, projected: false };
    });

    // Projections
    for (let i = 1; i <= 3; i++) {
      const projDate = new Date();
      projDate.setMonth(projDate.getMonth() + i);
      history.push({
        month: projDate.toLocaleString('pt-BR', { month: 'short' }),
        income: mrrValue,
        expense: 0,
        net: mrrValue,
        projected: true
      });
    }
    return history;
  },

  _calculateProgression(properties: any[], tenants: any[], activeContracts: any[], transactions: any[], maintenanceRequests: any[], portfolioHealth: any, occupancyRate: number, contracts: any[]) {
    const totalExpenses = transactions.filter(t => t.type === 'expense').length;
    const maintenanceWithInspection = maintenanceRequests.filter(m => m.title?.toLowerCase().includes('vistoria')).length;
    const propertyCount = properties.length;
    const activeContractsCount = activeContracts.length;

    const levels = [
      {
        id: 1, name: 'Primeiros Passos', badge: 'NÍVEL 1 · START',
        steps: [
          { id: 'l1s1', label: 'Adicionar primeiro imóvel', completed: propertyCount > 0, action: '/properties' },
          { id: 'l1s2', label: 'Cadastrar primeiro inquilino', completed: tenants.length > 0, action: '/tenants' },
          { id: 'l1s3', label: 'Criar primeiro contrato', completed: activeContractsCount > 0, action: '/contracts' },
          { id: 'l1s4', label: 'Configurar recebimento', completed: propertyCount > 0, action: '/settings' },
        ]
      },
      {
        id: 2, name: 'Gestão Ativa', badge: 'NÍVEL 2 · GESTÃO ATIVA',
        steps: [
          { id: 'l2s1', label: 'Registrar primeira despesa', completed: totalExpenses > 0, action: '/financials' },
          { id: 'l2s2', label: 'Realizar primeira vistoria', completed: maintenanceWithInspection > 0, action: '/messages' },
          { id: 'l2s3', label: 'Enviar primeira cobrança', completed: transactions.some(t => t.status === 'pending'), action: '/financials' },
          { id: 'l2s4', label: 'Configurar reajuste', completed: activeContracts.some(c => c.payment_day > 0), action: '/contracts' },
        ]
      },
      {
        id: 3, name: 'Carteira em Expansão', badge: 'NÍVEL 3 · EXPANSÃO',
        steps: [
          { id: 'l3s1', label: 'Adicionar segundo imóvel', completed: propertyCount >= 2, action: '/properties' },
          { id: 'l3s2', label: '100% de ocupação', completed: occupancyRate === 100 && propertyCount > 0, action: '/properties' },
          { id: 'l3s3', label: '3 meses sem inadimplência', completed: parseFloat(portfolioHealth.delinquency) === 0, action: '/financials' },
          { id: 'l3s4', label: 'Gerar relatório financeiro', completed: transactions.length > 5, action: '/financials' },
        ]
      },
      {
        id: 4, name: 'Investidor Avançado', badge: 'NÍVEL 4 · AVANÇADO',
        steps: [
          { id: 'l4s1', label: 'Yield mensal > 0.5%', completed: (parseFloat(portfolioHealth.yield) / 12) > 0.5, action: '/dashboard' },
          { id: 'l4s2', label: '3+ contratos ativos', completed: activeContractsCount >= 3, action: '/contracts' },
          { id: 'l4s3', label: 'Primeira renovação', completed: contracts.some(c => c.status === 'active' && new Date(c.start_date) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)), action: '/contracts' },
          { id: 'l4s4', label: 'Ativar débito automático', completed: activeContractsCount > 0 && propertyCount > 2, action: '/settings' },
        ]
      }
    ];

    let currentLevelIndex = 0;
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].steps.filter(s => s.completed).length < 4) {
        currentLevelIndex = i;
        break;
      }
      if (i === levels.length - 1) currentLevelIndex = 3;
    }

    const currentLevel = levels[currentLevelIndex];
    const completedCount = currentLevel.steps.filter(s => s.completed).length;
    return {
      currentLevel,
      levels,
      completedCount,
      totalSteps: 4,
      nextStep: currentLevel.steps.find(s => !s.completed) || currentLevel.steps[3],
      isMaxLevel: currentLevelIndex === 3 && completedCount === 4
    };
  },

  _consolidateActivities(transactions: any[], maintenanceRequests: any[], properties: any[]) {
    return [
      ...transactions.map(t => ({
        id: t.id,
        type: 'payment',
        title: `${t.type === 'income' ? 'Recebimento' : 'Pagamento'}: ${t.title}`,
        ...formatActivityDate(t.date || t.created_at)
      })),
      ...maintenanceRequests.map(m => ({
        id: m.id,
        type: 'maintenance',
        title: `Manutenção: ${m.title || 'Reparo'}`,
        ...formatActivityDate(m.created_at)
      })),
      ...properties.map(p => ({
        id: p.id,
        type: 'property',
        title: `Imóvel Atualizado: ${p.name}`,
        ...formatActivityDate(p.updated_at || p.created_at)
      }))
    ].sort((a, b) => {
      const dateA = new Date(a.rawDate).getTime();
      const dateB = new Date(b.rawDate).getTime();
      return dateB - dateA;
    });
  }
};

const occupancyRate = (properties: any[]) => {
  const total = properties.length;
  const occupied = properties.filter(p => p.status === 'ALUGADO').length;
  return total > 0 ? Math.round((occupied / total) * 100) : 0;
};

const formatActivityDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('pt-BR'),
    time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    rawDate: dateStr
  };
};
