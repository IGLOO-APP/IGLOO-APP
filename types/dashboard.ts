import { Property, Tenant, Contract, FinancialTransaction } from './index';

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
}

export interface DashboardFinancialHistory {
  month: string;
  income: number;
  expense: number;
  net: number;
  projected: boolean;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  risks: DashboardRisk[];
  activities: DashboardActivity[];
  financialHistory: DashboardFinancialHistory[];
  properties: any[];
  portfolioHealth: any;
  topProperties: any[];
  wealthHistory: any[];
}
