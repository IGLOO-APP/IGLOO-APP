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

// --- PERSISTÊNCIA ---

const SUBSCRIPTION_KEY = 'igloo_subscription_v1';
const INVOICES_KEY = 'igloo_invoices_v1';

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

const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key: string, data: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn('[subscriptionService] Falha ao salvar no localStorage');
  }
};

// Estado carregado do localStorage — sobrevive a reloads de página
let currentSubscription: Subscription = loadFromStorage(SUBSCRIPTION_KEY, DEFAULT_SUBSCRIPTION);
let invoices: Invoice[] = loadFromStorage(INVOICES_KEY, []);

// --- SERVIÇO ---

export const subscriptionService = {
  getPlans: (): Plan[] => PLANS,

  /**
   * Carrega a assinatura atual.
   * Tenta sincronizar com o perfil do Supabase (campo subscription_plan).
   * Se não existir no DB, usa o estado do localStorage.
   *
   * TODO: Substituir por webhook do Stripe quando integração estiver completa.
   */
  getCurrentSubscription: async (userId?: string): Promise<Subscription> => {
    if (userId) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan, subscription_status, subscription_expires_at')
          .eq('id', userId)
          .single();

        if (profile?.subscription_plan) {
          const fromDb: Subscription = {
            ...currentSubscription,
            planId: profile.subscription_plan as PlanTier,
            status: (profile.subscription_status as any) || 'active',
            currentPeriodEnd: profile.subscription_expires_at || currentSubscription.currentPeriodEnd,
          };
          currentSubscription = fromDb;
          saveToStorage(SUBSCRIPTION_KEY, fromDb);
          return fromDb;
        }
      } catch {
        // Tabela pode não ter colunas de subscription — usa localStorage
      }
    }
    return currentSubscription;
  },

  getInvoices: async (): Promise<Invoice[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return invoices;
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
   * Persiste no localStorage e tenta gravar no perfil Supabase.
   *
   * TODO: Substituir por integração Stripe Checkout + webhook.
   */
  upgradeSubscription: async (
    planId: PlanTier,
    cycle: BillingCycle,
    userId?: string
  ): Promise<Subscription> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) throw new Error('Plano não encontrado');

    const calc = subscriptionService.calculateTotal(planId, cycle);

    const periodEnd =
      cycle === 'monthly'
        ? new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        : cycle === 'semiannual'
          ? new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString()
          : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

    currentSubscription = {
      ...currentSubscription,
      id: `sub_${Date.now()}`,
      planId,
      status: 'active',
      billingCycle: cycle,
      amount: calc.pricePerMonth || 0,
      currentPeriodEnd: periodEnd,
      trialEndsAt: undefined,
      paymentMethod: { brand: 'visa', last4: '4242' },
    };

    // Persiste no localStorage imediatamente
    saveToStorage(SUBSCRIPTION_KEY, currentSubscription);

    // Tenta sincronizar com Supabase (best-effort, não bloqueia o fluxo)
    if (userId) {
      supabase
        .from('profiles')
        .update({
          subscription_plan: planId,
          subscription_status: 'active',
          subscription_expires_at: periodEnd,
        } as any)
        .eq('id', userId)
        .then(({ error }) => {
          if (error) console.warn('[subscriptionService] Sync Supabase falhou:', error.message);
        });
    }

    // Gera fatura
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString(),
      amount: calc.totalBilled,
      status: 'paid',
    };
    invoices = [newInvoice, ...invoices];
    saveToStorage(INVOICES_KEY, invoices);

    return currentSubscription;
  },

  cancelSubscription: async (userId?: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    currentSubscription = { ...currentSubscription, status: 'canceled' };
    saveToStorage(SUBSCRIPTION_KEY, currentSubscription);

    if (userId) {
      supabase
        .from('profiles')
        .update({ subscription_status: 'canceled' } as any)
        .eq('id', userId)
        .then(({ error }) => {
          if (error) console.warn('[subscriptionService] Sync cancelamento falhou:', error.message);
        });
    }
  },

  /** Limpa o estado local (útil no logout) */
  clearLocalState: (): void => {
    localStorage.removeItem(SUBSCRIPTION_KEY);
    localStorage.removeItem(INVOICES_KEY);
    currentSubscription = { ...DEFAULT_SUBSCRIPTION };
    invoices = [];
  },
};
