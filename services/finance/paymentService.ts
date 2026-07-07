import { supabase } from '../../lib/supabase';
import type { PaymentRecord } from '../../types';

function mapPaymentRecord(data: Record<string, unknown>): PaymentRecord {
  return {
    id: data.id as string,
    contract_id: data.contract_id as string,
    due_date: data.due_date as string,
    paid_date: data.paid_date as string | null,
    amount: data.amount as number,
    status: (data.status as any) ?? 'pending',
    payment_method: data.payment_method as string | null,
    notes: data.notes as string | null,
    contracts: data.contracts as { owner_id: string; property_id: string } | undefined,
  };
}

export const paymentService = {
  async getByContract(contractId: string): Promise<PaymentRecord[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', contractId)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('[paymentService] Error fetching payments:', error);
      return [];
    }

    return (data || []).map(mapPaymentRecord);
  },

  async getPending(userId: string): Promise<PaymentRecord[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*, contracts!inner(*)')
      .eq('status', 'pending')
      .eq('contracts.owner_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('[paymentService] Error fetching pending payments:', error);
      return [];
    }
    return (data || []).map(mapPaymentRecord);
  },

  async create(data: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord> {
    const dbData: Record<string, unknown> = {
      contract_id: data.contract_id,
      due_date: data.due_date,
      amount: data.amount,
      status: data.status || 'pending',
      payment_method: data.payment_method || null,
      notes: data.notes || null,
    };
    if (data.paid_date) dbData.paid_date = data.paid_date;

    const { data: result, error } = await (supabase.from('payments') as any)
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('[paymentService] Error creating payment:', error);
      throw error;
    }
    return mapPaymentRecord(result);
  },

  async update(id: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord> {
    const { data, error } = await (supabase.from('payments') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[paymentService] Error updating payment:', error);
      throw error;
    }
    return mapPaymentRecord(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await (supabase.from('payments') as any).delete().eq('id', id);
    if (error) {
      console.error('[paymentService] Error deleting payment:', error);
      throw error;
    }
  },

  /**
   * Generates multiple monthly payments for a contract.
   */
  async generateInvoicePayments(
    contractId: string,
    monthlyValue: number,
    startDate: string,
    endDate: string,
    paymentDay: number,
    notes?: string
  ): Promise<PaymentRecord[]> {
    const payments: PaymentRecord[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      const dueDate = new Date(current.getFullYear(), current.getMonth(), paymentDay);
      if (dueDate < current) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      const created = await this.create({
        contract_id: contractId,
        due_date: dueDate.toISOString().split('T')[0],
        amount: monthlyValue,
        status: 'pending',
        payment_method: null,
        notes: notes || null,
        paid_date: null,
      });
      payments.push(created);

      current.setMonth(current.getMonth() + 1);
    }

    return payments;
  },
};
