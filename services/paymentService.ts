import { supabase } from '../lib/supabase';
import type { PaymentRecord } from '../types';

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
};
