import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatCPF,
  formatPhone,
  formatCurrency,
  getRemainingContractTime,
  validateCPF,
  formatCNPJ,
  formatCEP,
  formatRG,
} from './formatters';

describe('formatCPF', () => {
  it('should format a clean CPF string', () => {
    expect(formatCPF('52998224725')).toBe('529.982.247-25');
  });

  it('should format a partially formatted CPF', () => {
    expect(formatCPF('529.982.247-25')).toBe('529.982.247-25');
  });

  it('should handle short strings gracefully', () => {
    expect(formatCPF('123')).toBe('123');
  });

  it('should strip non-digit characters', () => {
    expect(formatCPF('abc529.982-247-25xyz')).toBe('529.982.247-25');
  });
});

describe('formatPhone', () => {
  it('should format a 10-digit phone number (landline)', () => {
    expect(formatPhone('1198765432')).toBe('(11) 9876-5432');
  });

  it('should format an 11-digit phone number (mobile)', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('should strip non-digit characters', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
  });

  it('should handle short input', () => {
    expect(formatPhone('11')).toBe('11');
  });
});

describe('formatCurrency', () => {
  it('should format a number as BRL currency', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('R$');
    expect(result).toContain('1.500,00');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toContain('0,00');
  });

  it('should format decimal values', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1.234,56');
  });

  it('should format negative values', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('-');
    expect(result).toContain('500,00');
  });
});

describe('getRemainingContractTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return empty string for empty input', () => {
    expect(getRemainingContractTime('')).toBe('');
  });

  it('should return "Vencido" for past dates', () => {
    expect(getRemainingContractTime('2020-01-01')).toBe('Vencido');
  });

  it('should return "Vence hoje" for today', () => {
    vi.useFakeTimers();
    const today = new Date();
    vi.setSystemTime(today);
    const dateStr = today.toISOString().split('T')[0];
    expect(getRemainingContractTime(dateStr)).toBe('Vence hoje');
  });

  it('should return remaining days when less than a month away', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01'));
    expect(getRemainingContractTime('2025-06-10')).toBe('Restam 10 dias');
  });

  it('should return remaining months when more than a month away', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01'));
    expect(getRemainingContractTime('2025-09-05')).toBe('Restam 3 meses');
  });

  it('should handle singular "mês" for exactly 1 month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01'));
    expect(getRemainingContractTime('2025-07-04')).toBe('Restam 1 mês');
  });

  it('should parse DD/MM/YYYY format', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01'));
    expect(getRemainingContractTime('16/06/2025')).toBe('Restam 16 dias');
  });

  it('should return empty for completely invalid date', () => {
    expect(getRemainingContractTime('not-a-date')).toBe('');
  });
});

describe('validateCPF', () => {
  it('should return true for a valid CPF', () => {
    expect(validateCPF('52998224725')).toBe(true);
  });

  it('should return false for a CPF with all same digits', () => {
    expect(validateCPF('11111111111')).toBe(false);
  });

  it('should return false for a short CPF', () => {
    expect(validateCPF('123')).toBe(false);
  });

  it('should return false for a CPF with wrong check digits', () => {
    expect(validateCPF('52998224724')).toBe(false);
  });

  it('should strip formatting and validate', () => {
    expect(validateCPF('529.982.247-25')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(validateCPF('')).toBe(false);
  });
});

describe('formatCNPJ', () => {
  it('should format a clean CNPJ string', () => {
    expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('should strip non-digit characters', () => {
    expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81');
  });

  it('should handle short input gracefully', () => {
    expect(formatCNPJ('11222')).toBe('11.222');
  });
});

describe('formatCEP', () => {
  it('should format an 8-digit CEP', () => {
    expect(formatCEP('12345678')).toBe('12345-678');
  });

  it('should strip non-digit characters', () => {
    expect(formatCEP('12345-678')).toBe('12345-678');
  });

  it('should handle short input', () => {
    expect(formatCEP('1234')).toBe('1234');
  });
});

describe('formatRG', () => {
  it('should uppercase and strip special characters', () => {
    expect(formatRG('12.345.678-9')).toBe('123456789');
  });

  it('should keep letters', () => {
    expect(formatRG('ab-cd')).toBe('ABCD');
  });

  it('should truncate to 15 characters', () => {
    expect(formatRG('12345678901234567890')).toBe('123456789012345');
  });

  it('should handle empty string', () => {
    expect(formatRG('')).toBe('');
  });
});
