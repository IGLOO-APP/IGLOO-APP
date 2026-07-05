import { Plan, Subscription, Invoice, BillingCycle, PlanTier } from '../types';
import { supabase } from '../lib/supabase';

// --- PLANOS DE ASSINATURA ---

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito (Trial)',
    description: 'Período de teste para novos usuários.',
    price: { monthly: 0, semiannual: 0, annual: 0 },
    limits: { properties: 2, tenants: 2, storage_gb: 0.5, users: 1 },
    features: [
      { text: 'Até 2 Imóveis', included: true },
      { text: 'Até 2 Inquilinos', included: true },
      { text: 'Gestão Financeira Básica', included: true },
      { text: 'Assinatura Digital', included: false },
      { text: 'Cobrança Automatizada', included: false },
    ],
    is_active: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para pequenos proprietários iniciarem a gestão digital.',
    price: { monthly: 49.9, semiannual: 44.9, annual: 39.9 },
    limits: { properties: 10, tenants: 15, storage_gb: 5, users: 2 },
    features: [
      { text: 'Até 10 Imóveis', included: true },
      { text: 'Assinatura Digital (ClickSign)', included: true },
      { text: 'Recebimento via Pix', included: true },
      { text: 'Portal do Inquilino', included: true },
      { text: 'Suporte por Email', included: true },
      { text: 'Cobrança Automatizada', included: false },
      { text: 'Gestão de Equipe', included: false },
    ],
    is_active: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Para gestores que buscam automação e escala.',
    highlight: true,
    price: { monthly: 99.9, semiannual: 89.9, annual: 79.9 },
    limits: { properties: 50, tenants: 9999, storage_gb: 50, users: 5 },
    features: [
      { text: 'Até 50 Imóveis', included: true },
      { text: 'Tudo do Starter', included: true },
      { text: 'Pix + Boleto + Cartão', included: true },
      { text: 'Cobrança WhatsApp Auto', included: true },
      { text: 'Relatórios Avançados', included: true },
      { text: 'Contratos Ilimitados', included: true },
      { text: 'Multi-usuários (5)', included: true },
    ],
    is_active: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para imobiliárias e grandes portfólios.',
    price: { monthly: 299.9, semiannual: 269.9, annual: 239.9 },
    limits: { properties: -1, tenants: -1, storage_gb: 200, users: -1 },
    features: [
      { text: 'Imóveis Ilimitados', included: true },
      { text: 'Tudo do Professional', included: true },
      { text: 'Marca White-label', included: true },
      { text: 'Domínio Personalizado', included: true },
      { text: 'API & Webhooks', included: true },
      { text: 'Gerente de Conta', included: true },
      { text: 'SLA de 99.9%', included: true },
    ],
    is_active: true,
  },
];

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

// --- SERVIÇO ---

export const subscriptionService = {
  getPlans: (): Plan[] => PLANS,

  /**
   * Carrega a assinatura atual.
   * Tenta sincronizar com o perfil do Supabase (campo subscription_plan).
   * Se não existir no DB, retorna o plano gratuito.
   */
  getCurrentSubscription: async (userId?: string): Promise<Subscription> => {
    if (userId) {
      try {
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('id') // Just checking existence
          .eq('id', userId)
          .single();

        if (profile) {
          // Columns don't exist yet, return trial
          return DEFAULT_SUBSCRIPTION;
        }
      } catch (err) {
        console.warn('[subscriptionService] Falha ao carregar assinatura do DB:', err);
      }
    }
    return DEFAULT_SUBSCRIPTION;
  },

  getInvoices: async (userId?: string): Promise<Invoice[]> => {
    // TODO: Implementar busca de faturas via Supabase (tabela invoices)
    return [];
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

    const { error } = await (supabase.from('profiles') as any)
      .update({
        subscription_plan: planId,
        subscription_status: 'active',
        subscription_expires_at: periodEnd,
      })
      .eq('id', userId);

    if (error) throw error;

    return subscriptionService.getCurrentSubscription(userId).then(s => s || DEFAULT_SUBSCRIPTION);
  },

  /**
   * Cancela assinatura.
   * TODO: Implementar no banco de dados.
   */
  cancelSubscription: async (userId?: string): Promise<void> => {
    console.warn('[subscriptionService] Cancelamento não implementado no banco de dados.');
    return;
  },

  /** Limpa o estado local (substituído) */
  clearLocalState: (): void => {
    // No-op
  },
};
