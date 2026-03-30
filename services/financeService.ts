
import { Transaction } from '../types';

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  suggestedCategory?: string;
}

export const financeService = {
  /**
   * Simulates parsing a CSV or OFX file and returning bank transactions.
   */
  async processBankFile(file: File): Promise<BankTransaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulation of parsing:
    // In a real app, you'd use a library like `papaparse` for CSV or a custom OFX parser.
    return [
      {
        id: 'bank_1',
        date: '2024-03-05',
        description: 'TRANSF PIX RECEBIDA - JOAO SILVA',
        amount: 1500.0,
        type: 'income',
        suggestedCategory: 'aluguel',
      },
      {
        id: 'bank_2',
        date: '2024-03-10',
        description: 'PAGTO BOLETO - CONDOMINIO STUDIO 20',
        amount: -350.0,
        type: 'expense',
        suggestedCategory: 'condominio',
      },
      {
        id: 'bank_3',
        date: '2024-03-12',
        description: 'DEBITO AUTOMATICO - SABESP',
        amount: -85.5,
        type: 'expense',
        suggestedCategory: 'servicos',
      },
      {
        id: 'bank_4',
        date: '2024-03-15',
        description: 'TED RECEBIDA - MARIA OLIVEIRA',
        amount: 2200.0,
        type: 'income',
        suggestedCategory: 'aluguel',
      },
    ];
  },

  /**
   * Simulates matching bank transactions with existing transactions in the database.
   */
  matchTransactions(bankTxs: BankTransaction[], existingTxs: any[]) {
    return bankTxs.map((btx) => {
      const match = existingTxs.find(
        (etx) =>
          Math.abs(etx.amount) === Math.abs(btx.amount) &&
          // Within 3 days of difference
          Math.abs(new Date(etx.date).getTime() - new Date(btx.date).getTime()) < 3 * 24 * 60 * 60 * 1000
      );
      return { ...btx, matchedId: match?.id, matchStatus: match ? 'perfect' : 'none' };
    });
  },
};
