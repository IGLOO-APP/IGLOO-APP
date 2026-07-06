import { Plan } from '../types';

/**
 * Plan definitions — currently hardcoded.
 * TODO: Migrate to `plans` table in Supabase and fetch at runtime.
 */
export const PLANS: Plan[] = [
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
