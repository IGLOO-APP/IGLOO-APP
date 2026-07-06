import { describe, it, expect } from 'vitest';
import {
  calculateLateFee,
  calculateCarneLeao,
  calculateApportionment,
  calculateVacancyMetrics,
  calculatePortfolioYield,
  calculateTenantFinancials,
} from './financialCalculations';

describe('calculateLateFee', () => {
  // ... existing ...
  it('should return zero fees for on-time payment', () => {
    const result = calculateLateFee(1000, '2024-01-10', '2024-01-10');
    expect(result.diasAtraso).toBe(0);
    expect(result.valorMulta).toBe(0);
    expect(result.valorJuros).toBe(0);
    expect(result.totalPagar).toBe(1000);
  });

  it('should calculate fees for 10 days late', () => {
    const result = calculateLateFee(1000, '2024-01-10', '2024-01-20');
    expect(result.diasAtraso).toBe(10);
    expect(result.valorMulta).toBe(100); // 10% of 1000
    expect(result.valorJuros).toBeCloseTo(3.33); // (1000 * 0.01 / 30) * 10
    expect(result.totalPagar).toBeCloseTo(1103.33);
  });

  it('should calculate fees for 30 days late', () => {
    const result = calculateLateFee(1000, '2024-01-10', '2024-02-09');
    expect(result.diasAtraso).toBe(30);
    expect(result.valorMulta).toBe(100);
    expect(result.valorJuros).toBeCloseTo(10); // (1000 * 0.01 / 30) * 30
    expect(result.totalPagar).toBeCloseTo(1110);
  });

  it('should handle different amounts', () => {
    const result = calculateLateFee(500, '2024-03-01', '2024-03-11');
    expect(result.diasAtraso).toBe(10);
    expect(result.valorMulta).toBe(50); // 10% of 500
    expect(result.valorJuros).toBeCloseTo(1.67); // (500 * 0.01 / 30) * 10
    expect(result.totalPagar).toBeCloseTo(551.67);
  });
});

describe('calculateCarneLeao', () => {
  it('should return isento for low income', () => {
    const result = calculateCarneLeao([
      {
        valor_bruto: 1000,
        data_recebimento: '2024-01-01',
        deducoes: { iptu: 0, condominio: 0, taxa_administracao: 0 },
      },
    ]);
    expect(result.totalTributavel).toBe(1000);
    expect(result.aliquota).toBe(0);
    expect(result.impostoDevido).toBe(0);
    expect(result.faixa).toBe('Isento');
  });

  it('should apply 15% aliquot for income within range', () => {
    const result = calculateCarneLeao([
      {
        valor_bruto: 3000,
        data_recebimento: '2024-01-01',
        deducoes: { iptu: 0, condominio: 0, taxa_administracao: 0 },
      },
    ]);
    expect(result.aliquota).toBe(15);
    expect(result.impostoDevido).toBeCloseTo(68.56);
  });

  it('should account for deductions', () => {
    const result = calculateCarneLeao([
      {
        valor_bruto: 3000,
        data_recebimento: '2024-01-01',
        deducoes: { iptu: 200, condominio: 300, taxa_administracao: 300 },
      },
    ]);
    expect(result.totalTributavel).toBe(2200);
    expect(result.aliquota).toBe(0);
    expect(result.impostoDevido).toBe(0);
  });

  it('should apply deduction per dependent', () => {
    const result = calculateCarneLeao([
      {
        valor_bruto: 2500,
        data_recebimento: '2024-01-01',
        deducoes: { iptu: 0, condominio: 0, taxa_administracao: 0 },
        dependentes: 1,
      },
    ]);
    expect(result.totalTributavel).toBe(2310.41);
    expect(result.aliquota).toBe(7.5);
  });
});

describe('calculateApportionment', () => {
  it('should calculate fixed apportionment for multiple units', () => {
    const units = [
      { id: '1', name: 'A', isOccupied: true, residentsCount: 1 },
      { id: '2', name: 'B', isOccupied: false, residentsCount: 0 },
    ];
    const result = calculateApportionment(1000, units, 'fixed');
    expect(result.distribution[0].share).toBe(500);
    expect(result.ownerTotal).toBe(500);
  });

  it('should calculate per-person apportionment', () => {
    const units = [
      { id: '1', name: 'A', isOccupied: true, residentsCount: 1 },
      { id: '2', name: 'B', isOccupied: true, residentsCount: 3 },
    ];
    const result = calculateApportionment(1000, units, 'people');
    // Total people = 4. Cost per person = 250.
    // Unit A = 250, Unit B = 750.
    expect(result.distribution[0].share).toBe(250);
    expect(result.distribution[1].share).toBe(750);
  });
});

describe('calculateVacancyMetrics', () => {
  it('should calculate physical and financial vacancy', () => {
    const properties = [
      { id: '1', status: 'DISPONÍVEL', numeric_price: 1000 } as any,
      { id: '2', status: 'ALUGADO', numeric_price: 2000 } as any,
    ];
    const result = calculateVacancyMetrics(properties);
    expect(result.physical).toBe(50);
    expect(result.financial).toBe(33);
  });
});

describe('calculatePortfolioYield', () => {
  it('should calculate yield', () => {
    const properties = [{ status: 'ALUGADO', numeric_price: 1000, market_value: 200000 } as any];
    const result = calculatePortfolioYield(properties);
    // (1000 * 12 / 200000) * 100 = 6%
    expect(result).toBe(6);
  });
});

describe('calculateTenantFinancials', () => {
  it('should calculate tenant summary', () => {
    const payments = [
      { amount: 1000, status: 'paid', due_date: '2024-01-10' },
      { amount: 1000, status: 'pending', due_date: '2024-02-10' },
    ];
    const result = calculateTenantFinancials(payments);
    expect(result.totalPaid).toBe(1000);
    expect(result.totalPending).toBe(1000);
    expect(result.punctualityRate).toBe(50);
  });
});
