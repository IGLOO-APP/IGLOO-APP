import { propertyService } from './propertyService';
import { tenantService } from './tenantService';
import { contractService } from './contractService';
import { financeService } from './financeService';
import { supabase } from '../lib/supabase';
import { paymentService } from './paymentService';
import { 
  Property, 
  Tenant, 
  Contract, 
  FinancialTransaction, 
  DashboardMetrics, 
  DashboardRisk, 
  DashboardActivity,
  DashboardFinancialHistory
} from '../types';

export const dashboardService = {
  // Method to fetch everything in one go (Legacy support)
  async getDashboardData(userId: string) {
    const [properties, tenants, contracts, transactions, maintenanceRequests, pendingPayments] =
      await Promise.all([
        propertyService.getAll(),
        tenantService.getAll(),
        contractService.getAll(),
        financeService.getAll(),
        supabase
          .from('maintenance_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .then((res) => res.data || []),
        paymentService.getPending(userId),
      ]);

    const activeContracts = contracts.filter((c) => c.status === 'active');
    const mrrValue = activeContracts.reduce((acc, c) => acc + (c.numeric_value || 0), 0);
    const totalWealthValue = properties.reduce((acc, p) => acc + (p.market_value || 0), 0);

    const portfolioHealth = this._calculatePortfolioHealth(properties, mrrValue, pendingPayments);

    return {
      properties,
      portfolioHealth,
      metrics: this._calculateMetrics(properties, mrrValue, totalWealthValue, contracts, maintenanceRequests),
      risks: this._calculateRisks(contracts, portfolioHealth.delinquency, properties, maintenanceRequests),
      financialHistory: this._generateFinancialHistory(this._getLast6Months(), transactions, mrrValue),
      activities: this._consolidateActivities(transactions, maintenanceRequests, properties).slice(0, 5),
      topProperties: [],
      wealthHistory: [],
    };
  },

  _calculateMetrics(
    properties: Property[],
    mrrValue: number,
    totalWealthValue: number,
    contracts: Contract[],
    maintenanceRequests: any[]
  ): DashboardMetrics {
    return {
      totalWealth: totalWealthValue > 0 ? `R$ ${(totalWealthValue / 1000).toFixed(0)}k` : 'R$ 0k',
      mrr: `R$ ${(mrrValue / 1000).toFixed(1)}k`,
      occupancyRate: occupancyRate(properties),
      avgRoi: `${totalWealthValue > 0 ? (((mrrValue * 12) / totalWealthValue) * 100).toFixed(1) : '0'}%`,
      expiringContractsCount: contracts.filter((c) => c.status === 'expiring_soon').length,
      pendingMaintenanceCount: maintenanceRequests.filter(
        (m) => m.status === 'pending' || m.status === 'in_progress'
      ).length,
      trends: {
        wealth: totalWealthValue > 0 ? '+0.4%' : '0%',
        mrr: '+0%',
        occupancy: occupancyRate(properties) < 80 ? '-0%' : '+0%',
        roi: '+0%',
      },
    };
  },

  _calculatePortfolioHealth(properties: Property[], mrrValue: number, pendingPayments: any[]) {
    const totalWealthValue = properties.reduce((acc, p) => acc + (p.market_value || 0), 0);
    const annualRent = mrrValue * 12;
    const portfolioYield = totalWealthValue > 0 ? (annualRent / totalWealthValue) * 100 : 0;

    const vacantProperties = properties.filter((p) => p.status !== 'ALUGADO');
    const potentialRevenue = properties.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
    const lostRevenue = vacantProperties.reduce((acc, p) => acc + (p.numeric_price || 0), 0);
    const financialVacancy = potentialRevenue > 0 ? (lostRevenue / potentialRevenue) * 100 : 0;

    const unpaidThisMonth = pendingPayments
      .filter((p) => new Date(p.due_date).getMonth() === new Date().getMonth())
      .reduce((acc, p) => acc + (p.amount || 0), 0);
    const delinquencyRate = mrrValue > 0 ? (unpaidThisMonth / mrrValue) * 100 : 0;

    return {
      yield: portfolioYield.toFixed(1),
      vacancy: financialVacancy.toFixed(1),
      delinquency: delinquencyRate.toFixed(1),
      delinquencyAbsolute: unpaidThisMonth,
    };
  },

  _calculateRisks(
    contracts: Contract[],
    delinquencyRateStr: string,
    properties: Property[],
    maintenanceRequests: any[]
  ): DashboardRisk[] {
    const risks: DashboardRisk[] = [];
    const delinquencyRate = parseFloat(delinquencyRateStr);

    contracts
      .filter((c) => c.status === 'expired')
      .forEach((c) => {
        risks.push({
          type: 'critical',
          message: `Contrato expirado: ${c.property}`,
          link: '/contracts',
          id: c.id,
        });
      });
    if (delinquencyRate > 15) {
      risks.push({
        type: 'critical',
        message: `Inadimplência alta: ${delinquencyRate}%`,
        link: '/financials',
      });
    }
    properties
      .filter((p) => p.status === 'DISPONÍVEL')
      .forEach((p) => {
        risks.push({
          type: 'critical',
          message: `Imóvel vago: ${p.name}`,
          link: `/properties?id=${p.id}`,
          id: p.id,
        });
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

  _generateFinancialHistory(last6Months: Date[], transactions: FinancialTransaction[], mrrValue: number): DashboardFinancialHistory[] {
    const history = last6Months.map((date) => {
      const monthName = date.toLocaleString('pt-BR', { month: 'short' });
      const monthTransactions = transactions.filter(
        (t) =>
          new Date(t.date).getMonth() === date.getMonth() &&
          new Date(t.date).getFullYear() === date.getFullYear()
      );
      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + (t.amount || 0), 0);
      const expense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + (t.amount || 0), 0);
      return { month: monthName, income, expense, net: income - expense, projected: false };
    });

    for (let i = 1; i <= 3; i++) {
      const projDate = new Date();
      projDate.setMonth(projDate.getMonth() + i);
      history.push({
        month: projDate.toLocaleString('pt-BR', { month: 'short' }),
        income: mrrValue,
        expense: 0,
        net: mrrValue,
        projected: true,
      });
    }
    return history;
  },

  _consolidateActivities(transactions: FinancialTransaction[], maintenanceRequests: any[], properties: Property[]): DashboardActivity[] {
    return [
      ...transactions.map((t) => ({
        id: t.id,
        type: 'payment' as const,
        title: `${t.type === 'income' ? 'Recebimento' : 'Pagamento'}: ${t.title}`,
        ...formatActivityDate(t.date || t.created_at || new Date().toISOString()),
      })),
      ...maintenanceRequests.map((m) => ({
        id: m.id,
        type: 'maintenance' as const,
        title: `Manutenção: ${m.title || 'Reparo'}`,
        ...formatActivityDate(m.created_at),
      })),
      ...properties.map((p) => ({
        id: p.id,
        type: 'property' as const,
        title: `Imóvel Atualizado: ${p.name}`,
        ...formatActivityDate(p.updated_at || p.created_at || new Date().toISOString()),
      })),
    ].sort((a, b) => {
      const dateA = new Date(a.rawDate).getTime();
      const dateB = new Date(b.rawDate).getTime();
      return dateB - dateA;
    });
  },
};

const occupancyRate = (properties: Property[]) => {
  const total = properties.length;
  const occupied = properties.filter((p) => p.status === 'ALUGADO').length;
  return total > 0 ? Math.round((occupied / total) * 100) : 0;
};

const formatActivityDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('pt-BR'),
    time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    rawDate: dateStr,
  };
};
