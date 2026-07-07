import { supabase } from '../../lib/supabase';
import { FinancialTransaction } from '../../types';

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

  /**
   * Fetches transactions with pagination.
   */
  async getPaginated(
    page: number = 1,
    pageSize: number = 20,
    filters?: { property_id?: string; search?: string; month?: number; year?: number }
  ): Promise<{ data: FinancialTransaction[]; total: number; page: number; pageSize: number }> {
    let query = supabase.from('financial_transactions').select('*', { count: 'exact' });

    if (filters?.property_id && filters.property_id !== 'all') {
      query = query.eq('property_id', filters.property_id);
    }
    if (filters?.month !== undefined && filters?.year !== undefined) {
      const start = new Date(filters.year, filters.month, 1).toISOString().split('T')[0];
      const end = new Date(filters.year, filters.month + 1, 0).toISOString().split('T')[0];
      query = query.gte('date', start).lte('date', end);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.order('date', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return {
      data: (data || []).map(this.mapTransaction),
      total: count || 0,
      page,
      pageSize,
    };
  },

  mapTransaction(t: Record<string, unknown>): FinancialTransaction {
    return {
      id: t.id as string,
      owner_id: t.owner_id as string,
      property_id: (t.property_id as string) || undefined,
      title: t.title as string,
      description: (t.description as string) || '',
      amount: Number(t.amount),
      type: t.type as 'income' | 'expense',
      category: (t.category as string) || 'Geral',
      date: t.date as string,
      status: t.status as 'paid' | 'pending',
      attachment_url: (t.attachment_url as string) || undefined,
      hasAttachment: !!t.attachment_url,
      is_recurring: (t.is_recurring as boolean) ?? false,
      created_at: t.created_at as string | undefined,
      updated_at: t.updated_at as string | undefined,
    };
  },

  async create(
    transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<FinancialTransaction> {
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
    const { error } = await supabase.from('financial_transactions').delete().eq('id', id);

    if (error) throw error;
  },

  /**
   * Placeholder: In the future, this will trigger a server-side process
   * to parse bank files. For now, it is disabled.
   */
  async processBankFile(_file: File): Promise<BankTransaction[]> {
    void _file;
    throw new Error('Processamento de arquivos bancários ainda não implementado no backend.');
  },

  /**
   * Simulates matching bank transactions with existing transactions in the database.
   */
  matchTransactions(
    bankTxs: BankTransaction[],
    existingTxs: FinancialTransaction[]
  ): (BankTransaction & { matchedId?: string; matchStatus: 'perfect' | 'none' })[] {
    return bankTxs.map((btx) => {
      const match = existingTxs.find(
        (etx) =>
          Math.abs(etx.amount) === Math.abs(btx.amount) &&
          // Within 3 days of difference
          Math.abs(new Date(etx.date).getTime() - new Date(btx.date).getTime()) <
            3 * 24 * 60 * 60 * 1000
      );
      return { ...btx, matchedId: match?.id, matchStatus: match ? 'perfect' : 'none' };
    });
  },
};
