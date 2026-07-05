export type BillingCycle = 'monthly' | 'semiannual' | 'annual';
export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanLimit {
  properties: number; // -1 for unlimited
  tenants: number;
  storage_gb: number;
  users: number;
}

export interface Plan {
  id: string; // Changed from enum to string for dynamic plans
  name: string;
  description: string;
  price: {
    monthly: number;
    semiannual?: number;
    annual?: number;
  };
  limits: PlanLimit;
  features: PlanFeature[];
  is_active: boolean;
  highlight?: boolean;
}

export interface Subscription {
  id: string;
  planId: PlanTier;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';
  billingCycle: BillingCycle;
  amount: number;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
  };
  usage: {
    properties: number;
    tenants: number;
    storage_used_gb: number;
  };
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'open' | 'void';
  pdfUrl?: string;
}
