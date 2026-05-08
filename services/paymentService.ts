import { supabase } from '../lib/supabase';

export const paymentService = {
  async getByContract(contractId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', contractId)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('[paymentService] Error fetching payments:', error);
      return [];
    }

    return data;
  },

  async getPending(userId: string): Promise<any[]> {
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
      return data;
  }
};
