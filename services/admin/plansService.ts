import { supabase } from '../../lib/supabase';
import type { Plan } from '../../types';

const SEED_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para quem está começando',
    price: { monthly: 29.9, semiannual: 29.9 * 6 * 0.9, annual: 29.9 * 12 * 0.8 },
    limits: { properties: 5, tenants: 10, storage_gb: 1, users: 1 },
    features: [{ text: 'Gestão Básica', included: true }],
    is_active: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Para corretores e pequenas imobiliárias',
    price: { monthly: 79.9 },
    limits: { properties: 50, tenants: 100, storage_gb: 10, users: 3 },
    features: [{ text: 'Gestão Completa', included: true }],
    is_active: true,
    highlight: true,
  },
];

export const plansAdminService = {
  async getAll(): Promise<Plan[]> {
    const { data } = await supabase
      .from('plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (data && data.length > 0) {
      return data as unknown as Plan[];
    }

    return SEED_PLANS;
  },

  async upsert(plan: Partial<Plan> & { id: string }): Promise<void> {
    const { error } = await (supabase.from('plans') as any).upsert({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price_monthly: plan.price?.monthly,
      price_semiannual: plan.price?.semiannual,
      price_annual: plan.price?.annual,
      limits: plan.limits,
      features: plan.features,
      is_active: plan.is_active,
    });

    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) throw error;
  },
};
