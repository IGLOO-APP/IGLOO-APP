import { supabase } from '../lib/supabase';

export interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
  amount: number;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export const stripeService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createPaymentIntent: async (amount: number, metadata: any): Promise<PaymentIntentResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount, metadata },
      });
      if (error) throw error;
      return data as PaymentIntentResponse;
    } catch (err) {
      console.error('Error creating payment intent:', err);
      throw err;
    }
  },

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('saved_cards').select('*');
      if (error) throw error;
      return (data || []) as PaymentMethod[];
    } catch (err) {
      console.error('Error fetching saved cards:', err);
      throw err;
    }
  },

  attachPaymentMethod: async (cardDetails: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('saved_cards')
        .insert({
          brand: cardDetails.brand || 'unknown',
          last4: cardDetails.last4 || '0000',
          exp_month: cardDetails.exp_month || 1,
          exp_year: cardDetails.exp_year || new Date().getFullYear() + 1,
          is_default: cardDetails.is_default ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PaymentMethod;
    } catch (err) {
      console.error('Error attaching payment method:', err);
      throw err;
    }
  },

  detachPaymentMethod: async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('saved_cards').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error detaching payment method:', err);
      throw err;
    }
  },

  createSubscription: async (priceId: string, paymentMethodId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { priceId, paymentMethodId },
      });
      if (error) throw error;
      return data as { id: string; status: string; current_period_end: string };
    } catch (err) {
      console.error('Error creating subscription:', err);
      throw err;
    }
  },

  createConnectAccountLink: async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account-link');
      if (error) throw error;
      return data as { url: string };
    } catch (err) {
      console.error('Error creating connect account link:', err);
      throw err;
    }
  },
};
