import { describe, it, expect } from 'vitest';
import { generateFilledContract } from './contractGenerator';

describe('generateFilledContract', () => {
  it('should replace tags with values correctly', () => {
    const template = 'Olá {{nome}}, seu contrato é {{tipo}}.';
    const data = { nome: 'João', tipo: 'Residencial' };
    const result = generateFilledContract(template, data);
    expect(result).toBe('Olá João, seu contrato é Residencial.');
  });

  it('should trim whitespace in tags', () => {
    const template = 'Olá {{ nome  }}, seu contrato é {{tipo}}.';
    const data = { nome: 'João', tipo: 'Residencial' };
    const result = generateFilledContract(template, data);
    expect(result).toBe('Olá João, seu contrato é Residencial.');
  });

  it('should return underscore placeholders for missing data', () => {
    const template = 'O aluguel é {{valor}}.';
    const data = {};
    const result = generateFilledContract(template, data);
    expect(result).toBe('O aluguel é _______________________.');
  });

  it('should handle multiple occurrences of the same key', () => {
    const template = '{{nome}}, {{nome}}, {{nome}}.';
    const data = { nome: 'João' };
    const result = generateFilledContract(template, data);
    expect(result).toBe('João, João, João.');
  });
});
