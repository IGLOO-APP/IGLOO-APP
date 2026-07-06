import { Plan, Subscription, Invoice, BillingCycle, PlanTier } from '../types';
import { supabase } from '../lib/supabase';
import { PLANS } from '../constants/plans';

// --- PERSISTÊNCIA (Removida: localStorage não é banco de dados) ---

const DEFAULT_SUBSCRIPTION: Subscription = {
  id: 'sub_trial',
  planId: 'free',
  status: 'trialing',
  billingCycle: 'monthly',
  amount: 0,
  currentPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
  trialEndsAt: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
  usage: { properties: 0, tenants: 0, storage_used_gb: 0 },
};

function mapSubscriptionFromProfile(profile: Record<string, unknown>): Subscription {
  const planId = (profile.subscription_plan as PlanTier) || 'free';
  const plan = PLANS.find((p) => p.id === planId);
  return {
    id: `sub_${profile.id}`,
    planId,
    status: (profile.subscription_status as Subscription['status']) || 'trialing',
    billingCycle: 'monthly',
    amount: plan?.price.monthly || 0,
    currentPeriodEnd:
      (profile.subscription_expires_at as string) || DEFAULT_SUBSCRIPTION.currentPeriodEnd,
    trialEndsAt: DEFAULT_SUBSCRIPTION.trialEndsAt,
    usage: { properties: 0, tenants: 0, storage_used_gb: 0 },
  };
}

// --- SERVIÇO ---

export const subscriptionService = {
  getPlans: (): Plan[] => PLANS,

  /**
   * Carrega a assinatura atual do perfil do usuário no Supabase.
   */
  getCurrentSubscription: async (userId?: string): Promise<Subscription> => {
    if (!userId) return DEFAULT_SUBSCRIPTION;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, subscription_plan, subscription_status, subscription_expires_at')
        .eq('id', userId)
        .single();

      if (error || !data) return DEFAULT_SUBSCRIPTION;
      return mapSubscriptionFromProfile(data as unknown as Record<string, unknown>);
    } catch (err) {
      console.warn('[subscriptionService] Falha ao carregar assinatura do DB:', err);
      return DEFAULT_SUBSCRIPTION;
    }
  },

  getInvoices: async (userId?: string): Promise<Invoice[]> => {
    if (!userId) return [];
    try {
      const { data, error } = await (supabase.from as any)('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) return [];
      return (data || []).map((inv: Record<string, unknown>) => ({
        id: inv.id as string,
        number: inv.number as string,
        date: inv.date as string,
        amount: inv.amount as number,
        status: inv.status as 'paid' | 'open' | 'void',
        pdfUrl: inv.pdf_url as string | undefined,
      }));
    } catch {
      return [];
    }
  },

  calculateTotal: (planId: PlanTier, cycle: BillingCycle) => {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return { total: 0, savings: 0, pricePerMonth: 0, totalBilled: 0 };

    const monthlyPrice = plan.price.monthly;
    const cyclePrice = plan.price[cycle] || monthlyPrice;
    let total = 0;
    let savings = 0;

    if (cycle === 'monthly') {
      total = monthlyPrice;
    } else if (cycle === 'semiannual') {
      total = cyclePrice * 6;
      savings = monthlyPrice * 6 - total;
    } else if (cycle === 'annual') {
      total = cyclePrice * 12;
      savings = monthlyPrice * 12 - total;
    }

    return { pricePerMonth: cyclePrice, totalBilled: total, savings };
  },

  /**
   * Processa upgrade do plano.
   * TODO: Implementar no banco de dados (colunas na tabela profiles).
   */
  upgradeSubscription: async (
    planId: PlanTier,
    cycle: BillingCycle,
    userId?: string
  ): Promise<Subscription> => {
    if (!userId) throw new Error('Usuário não autenticado');

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) throw new Error('Plano não encontrado');

    const periodEnd =
      cycle === 'monthly'
        ? new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        : cycle === 'semiannual'
          ? new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString()
          : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: planId,
        subscription_status: 'active',
        subscription_expires_at: periodEnd,
      } as Record<string, unknown>)
      .eq('id', userId);

    if (error) throw error;

    return subscriptionService.getCurrentSubscription(userId);
  },

  /**
   * Cancela assinatura.
   */
  cancelSubscription: async (userId?: string): Promise<void> => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'canceled' } as Record<string, unknown>)
        .eq('id', userId);

      if (error) throw error;
    } catch (err) {
      console.error('[subscriptionService] Erro ao cancelar assinatura:', err);
      throw err;
    }
  },

  /** Limpa o estado local (substituído) */
  clearLocalState: (): void => {
    // No-op
  },
};
