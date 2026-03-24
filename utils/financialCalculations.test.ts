import { describe, it, expect } from 'vitest';
import { calculateLateFee } from './financialCalculations';

describe('calculateLateFee', () => {
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
