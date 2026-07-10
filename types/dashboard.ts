import { Property } from './properties';
import { Tenant } from './profiles';

export interface DashboardMetrics {
  totalWealth: string;
  mrr: string;
  occupancyRate: number;
  avgRoi: string;
  expiringContractsCount: number;
  pendingMaintenanceCount: number;
  totalTenants: number;
  trends: {
    wealth: string;
    mrr: string;
    occupancy: string;
    roi: string;
  };
  sparkData: {
    wealth: number[];
    mrr: number[];
  };
}

export interface DashboardRisk {
  id?: string;
  type: 'critical' | 'warning';
  message: string;
  link: string;
}

export interface DashboardActivity {
  id: string;
  type: 'payment' | 'maintenance' | 'property';
  title: string;
  date: string;
  time: string;
  rawDate: string;
  acao_pendente?: {
    label: string;
    endpoint: string;
  };
}

export interface DashboardFinancialHistory {
  month: string;
  income: number;
  expense: number;
  net: number;
  projected: boolean;
}

export interface PortfolioHealth {
  yield: string;
  vacancy: string;
  delinquency: string;
  delinquencyAbsolute: number;
}

export interface TopProperty {
  id: string;
  name: string;
  image: string;
  revenue: number;
  yield: number;
  status: string;
}

export interface WealthHistoryEntry {
  month: string;
  value: number;
  events: { type: string; label: string }[];
}

export interface PendingAction {
  id: string;
  title: string;
  type: string;
  priority: string;
  acao_pendente?: {
    label: string;
    endpoint: string;
  };
}

export interface DashboardData {
  metrics: DashboardMetrics;
  risks: DashboardRisk[];
  activities: DashboardActivity[];
  financialHistory: DashboardFinancialHistory[];
  properties: Property[];
  tenants: Tenant[];
  portfolioHealth: PortfolioHealth;
  topProperties: TopProperty[];
  wealthHistory: WealthHistoryEntry[];
  pendingActions: PendingAction[];
}
