
import { supabase } from '../lib/supabase';
import { FinancialTransaction } from '../types';

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
   * Fetches all transactions for the current owner.
   */
  async getAll(): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapTransaction);
  },

  mapTransaction(t: any): FinancialTransaction {
    return {
      ...t,
      property_id: t.property_id || undefined,
      category: t.category || 'Geral',
      description: t.description || '',
      attachment_url: t.attachment_url || undefined,
      hasAttachment: !!t.attachment_url,
      is_recurring: t.is_recurring ?? false
    };
  },

  async create(transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return this.mapTransaction(data);
  },

  /**
   * Updates an existing transaction.
   */
  async update(id: string, updates: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapTransaction(data);
  },

  /**
   * Deletes a transaction.
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Simulates parsing a CSV or OFX file and returning bank transactions.
   */
  async processBankFile(file: File): Promise<BankTransaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulation of parsing:
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

