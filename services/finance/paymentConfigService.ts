import { supabase } from '../../lib/supabase';

export interface PaymentMethodDb {
  id: string;
  user_id: string;
  method: 'pix' | 'boleto' | 'credit_card';
  enabled: boolean;
  fields: Record<string, string>;
}

export const paymentConfigService = {
  async getAll(userId: string): Promise<PaymentMethodDb[]> {
    const { data, error } = await (supabase.from as any)('payment_configs')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data as PaymentMethodDb[];
  },

  async upsert(
    userId: string,
    method: 'pix' | 'boleto' | 'credit_card',
    enabled: boolean,
    fields: Record<string, string>
  ): Promise<void> {
    const { error } = await (supabase.from as any)('payment_configs').upsert(
      {
        user_id: userId,
        method,
        enabled,
        fields,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,method' }
    );

    if (error) throw error;
  },

  async toggle(
    userId: string,
    method: 'pix' | 'boleto' | 'credit_card',
    enabled: boolean
  ): Promise<void> {
    const { error } = await (supabase.from as any)('payment_configs')
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('method', method);

    if (error) throw error;
  },
};
