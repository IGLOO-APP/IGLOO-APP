import { workflowOrchestrator } from './workflow/workflowOrchestrator';
import { propertyService } from './propertyService';
import { supabase } from '../lib/supabase';
import { tenantService } from './tenancy/tenantService';
import { contractService } from './tenancy/contractService';
import { financeService } from './finance/financeService';
import { paymentService } from './finance/paymentService';
import {
  Property,
  Tenant,
  Contract,
  FinancialTransaction,
  DashboardMetrics,
  DashboardRisk,
  DashboardActivity,
  DashboardFinancialHistory,
} from '../types';

export const dashboardService = {
  async getDashboardData(userId: string, months = 12) {
    const [properties, tenants, contracts, transactions, maintenanceRequests, pendingPayments, pendingActions] =
      await Promise.all([
        propertyService.getAll().catch(() => [] as Property[]),
        tenantService.getAll().catch(() => [] as Tenant[]),
        contractService.getAll().catch(() => [] as Contract[]),
        financeService.getAll().catch(() => [] as FinancialTransaction[]),
        supabase
          .from('maintenance_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .then((res) => res.data || []),
        paymentService.getPending(userId).catch(() => []),
        workflowOrchestrator.getUnifiedPendingActions(userId).catch(() => []),
      ]);


    const activeContracts = contracts.filter((c) => c.status === 'active');
    const mrrValue = activeContracts.reduce(
      (acc: number, c: Contract) => acc + (c.numeric_value || 0),
      0
    );
    const totalWealthValue = properties.reduce(
      (acc: number, p: Property) => acc + (p.market_value || 0),
      0
    );

    const portfolioHealth = this._calculatePortfolioHealth(properties, mrrValue, pendingPayments);
    const history = this._generateFinancialHistory(
      this._getLastNMonths(months),
      transactions,
      mrrValue
    );

    return {
      properties,
      tenants,
      portfolioHealth,
      metrics: this._calculateMetrics(
        properties,
        tenants,
        mrrValue,
        totalWealthValue,
        contracts,
        maintenanceRequests,
        history
      ),
      risks: this._calculateRisks(contracts, portfolioHealth.delinquency, properties),
      financialHistory: history,
      activities: this._consolidateActivities(transactions, maintenanceRequests, properties, pendingActions).slice(
        0,
        5
      ),
      topProperties: this._getTopProperties(properties, contracts),
      wealthHistory: this._generateWealthHistory(months, properties),
      pendingActions,
    };
  },

  _calculateMetrics(
    properties: Property[],
    tenants: any[],
    mrrValue: number,
    totalWealthValue: number,
    contracts: Contract[],
    maintenanceRequests: any[],
    financialHistory: DashboardFinancialHistory[]
  ): DashboardMetrics {
    const occRate = occupancyRate(properties);
    const roi = totalWealthValue > 0 ? ((mrrValue * 12) / totalWealthValue) * 100 : 0;
    const realHistory = financialHistory.filter((h) => !h.projected);
    const mrrSpark = realHistory.map((h) => h.income);
    const wealthSpark = realHistory.map((h) => h.net);

    return {
      totalWealth: totalWealthValue > 0 ? `R$ ${(totalWealthValue / 1000).toFixed(0)}k` : 'R$ 0k',
      mrr: `R$ ${(mrrValue / 1000).toFixed(1)}k`,
      occupancyRate: occRate,
      avgRoi: `${roi.toFixed(1)}%`,
      expiringContractsCount: contracts.filter((c) => c.status === 'expiring_soon').length,
      totalTenants: tenants.length,
      pendingMaintenanceCount: maintenanceRequests.filter(
        (m: any) => m.status === 'pending' || m.status === 'in_progress'
      ).length,
      trends: {
        wealth: totalWealthValue > 0 ? '+0.4%' : '0%',
        mrr: '+0%',
        occupancy: occRate < 80 ? '-0%' : '+0%',
        roi: '+0%',
      },
      sparkData: {
        wealth: wealthSpark,
        mrr: mrrSpark,
      },
    };
  },

  _calculatePortfolioHealth(properties: Property[], mrrValue: number, pendingPayments: any[]) {
    const totalWealthValue = properties.reduce(
      (acc: number, p: Property) => acc + (p.market_value || 0),
      0
    );
    const annualRent = mrrValue * 12;
    const portfolioYield = totalWealthValue > 0 ? (annualRent / totalWealthValue) * 100 : 0;

    const vacantProperties = properties.filter((p) => p.status !== 'ALUGADO');
    const potentialRevenue = properties.reduce(
      (acc: number, p: Property) => acc + (p.numeric_price || 0),
      0
    );
    const lostRevenue = vacantProperties.reduce(
      (acc: number, p: Property) => acc + (p.numeric_price || 0),
      0
    );
    const financialVacancy = potentialRevenue > 0 ? (lostRevenue / potentialRevenue) * 100 : 0;

    const unpaidThisMonth = (pendingPayments || [])
      .filter((p: any) => new Date(p.due_date).getMonth() === new Date().getMonth())
      .reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
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
    properties: Property[]
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

  _getLastNMonths(n: number) {
    return Array.from({ length: n }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (n - 1 - i));
      return d;
    });
  },

  _generateFinancialHistory(
    months: Date[],
    transactions: FinancialTransaction[],
    mrrValue: number
  ): DashboardFinancialHistory[] {
    const history = months.map((date) => {
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

  _getTopProperties(properties: Property[], contracts: Contract[]) {
    return properties
      .map((p) => {
        const contract = contracts.find((c) => c.property_id === p.id && c.status === 'active');
        const revenue = contract?.numeric_value || 0;
        const marketValue = p.market_value || 0;
        const yieldVal = marketValue > 0 ? ((revenue * 12) / marketValue) * 100 : 0;
        return {
          id: p.id,
          name: p.name,
          image: p.image,
          revenue: parseFloat(revenue.toFixed(2)),
          yield: parseFloat(yieldVal.toFixed(2)),
          status:
            p.status === 'ALUGADO' ? 'occupied' : p.status === 'MANUTENÇÃO' ? 'warning' : 'vacant',
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  },

  _generateWealthHistory(months: number, properties: Property[]) {
    const dates = this._getLastNMonths(months);
    return dates.map((date) => {
      const monthStr = date.toLocaleString('pt-BR', { month: 'short' });
      const existingProps = properties.filter((p) => {
        if (!p.created_at) return true;
        return new Date(p.created_at) <= date;
      });
      const value = existingProps.reduce((acc, p) => acc + (p.market_value || 0), 0);

      const events: { type: string; label: string }[] = [];
      properties.forEach((p) => {
        if (p.created_at) {
          const created = new Date(p.created_at);
          if (
            created.getMonth() === date.getMonth() &&
            created.getFullYear() === date.getFullYear()
          ) {
            events.push({ type: 'property', label: p.name });
          }
        }
      });
      return { month: monthStr, value, events };
    });
  },

  _consolidateActivities(
    transactions: FinancialTransaction[],
    maintenanceRequests: any[],
    properties: Property[],
    pendingActions: any[]
  ): DashboardActivity[] {
    return [
      ...pendingActions.map((a) => ({
        id: a.id,
        type: 'maintenance' as const, // Simplificando para visualização
        title: a.title,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        rawDate: new Date().toISOString(),
        acao_pendente: a.acao_pendente
      })),
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
