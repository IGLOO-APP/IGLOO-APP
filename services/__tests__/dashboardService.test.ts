import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from '../dashboardService';
import type { DashboardRisk } from '../../types';

const mockGetAll = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockGetPending = vi.fn();
const mockGetUnifiedPendingActions = vi.fn();

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

vi.mock('../propertyService', () => ({
  propertyService: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
  },
}));

vi.mock('../tenancy/tenantService', () => ({
  tenantService: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
  },
}));

vi.mock('../tenancy/contractService', () => ({
  contractService: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
  },
}));

vi.mock('../finance/financeService', () => ({
  financeService: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
  },
}));

vi.mock('../finance/paymentService', () => ({
  paymentService: {
    getPending: (...args: unknown[]) => mockGetPending(...args),
  },
}));

vi.mock('../workflow/workflowOrchestrator', () => ({
  workflowOrchestrator: {
    getUnifiedPendingActions: (...args: unknown[]) => mockGetUnifiedPendingActions(...args),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  dashboardService.invalidateCache();
  mockFrom.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ order: mockOrder });
  mockOrder.mockResolvedValue({ data: [], error: null });
  mockGetAll.mockResolvedValue([]);
  mockGetPending.mockResolvedValue([]);
  mockGetUnifiedPendingActions.mockResolvedValue([]);
});

describe('dashboardService.getDashboardData', () => {
  it('should return default metrics when no data exists', async () => {
    const result = await dashboardService.getDashboardData('user-1');

    expect(result.metrics).toBeDefined();
    expect(result.metrics.totalWealth).toBe('R$ 0k');
    expect(result.metrics.mrr).toBe('R$ 0.0k');
    expect(result.metrics.occupancyRate).toBe(0);
    expect(result.metrics.avgRoi).toBe('0.0%');
    expect(result.metrics.totalTenants).toBe(0);
    expect(result.risks).toEqual([]);
    expect(result.topProperties).toEqual([]);
    expect(result.activities).toHaveLength(0);
  });

  it('should calculate metrics from provided data', async () => {
    mockGetAll
      .mockResolvedValueOnce([
        {
          id: 'p1',
          name: 'Apto 101',
          market_value: 500000,
          status: 'ALUGADO',
          numeric_price: 3000,
        },
        {
          id: 'p2',
          name: 'Apto 102',
          market_value: 300000,
          status: 'ALUGADO',
          numeric_price: 2000,
        },
      ])
      .mockResolvedValueOnce([
        { id: 't1', name: 'João' },
        { id: 't2', name: 'Maria' },
      ])
      .mockResolvedValueOnce([
        { id: 'c1', property_id: 'p1', status: 'active', numeric_value: 3000 },
        { id: 'c2', property_id: 'p2', status: 'active', numeric_value: 2000 },
      ])
      .mockResolvedValueOnce([]);

    const result = await dashboardService.getDashboardData('user-1');

    expect(result.metrics.totalWealth).toBe('R$ 800k');
    expect(result.metrics.mrr).toBe('R$ 5.0k');
    expect(result.metrics.occupancyRate).toBe(100);
    expect(result.metrics.totalTenants).toBe(2);
  });

  it('should detect expiring contracts and vacant properties as risks', async () => {
    mockGetAll
      .mockResolvedValueOnce([
        {
          id: 'p1',
          name: 'Apto 101',
          market_value: 500000,
          status: 'DISPONÍVEL',
          numeric_price: 3000,
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'c1',
          property_id: 'p1',
          status: 'expired',
          numeric_value: 3000,
          property: 'Apto 101',
        },
      ])
      .mockResolvedValueOnce([]);

    const result = await dashboardService.getDashboardData('user-1');

    expect(result.risks.length).toBeGreaterThan(0);
    expect(result.risks.some((r: DashboardRisk) => r.message.includes('Contrato expirado'))).toBe(
      true
    );
    expect(result.risks.some((r: DashboardRisk) => r.message.includes('Imóvel vago'))).toBe(true);
  });

  it('should handle service failures gracefully', async () => {
    mockGetAll.mockRejectedValue(new Error('Network error'));

    const result = await dashboardService.getDashboardData('user-1');

    expect(result.metrics).toBeDefined();
    expect(result.properties).toEqual([]);
    expect(result.tenants).toEqual([]);
  });

  it('should generate financial history with projections', async () => {
    const result = await dashboardService.getDashboardData('user-1');

    expect(result.financialHistory.length).toBeGreaterThanOrEqual(12);
    const projected = result.financialHistory.filter((h: { projected: boolean }) => h.projected);
    expect(projected.length).toBe(3);
  });

  it('should return top properties sorted by revenue', async () => {
    mockGetAll
      .mockResolvedValueOnce([
        {
          id: 'p1',
          name: 'Cobertura',
          market_value: 800000,
          status: 'ALUGADO',
          numeric_price: 5000,
        },
        { id: 'p2', name: 'Kitnet', market_value: 200000, status: 'ALUGADO', numeric_price: 1000 },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 'c1', property_id: 'p1', status: 'active', numeric_value: 5000 },
        { id: 'c2', property_id: 'p2', status: 'active', numeric_value: 1000 },
      ])
      .mockResolvedValueOnce([]);

    const result = await dashboardService.getDashboardData('user-1');

    expect(result.topProperties).toHaveLength(2);
    expect(result.topProperties[0].name).toBe('Cobertura');
    expect(result.topProperties[1].name).toBe('Kitnet');
  });

  it('should calculate portfolio health', async () => {
    const result = await dashboardService.getDashboardData('user-1');

    expect(result.portfolioHealth).toBeDefined();
    expect(result.portfolioHealth).toHaveProperty('yield');
    expect(result.portfolioHealth).toHaveProperty('vacancy');
    expect(result.portfolioHealth).toHaveProperty('delinquency');
  });
});
