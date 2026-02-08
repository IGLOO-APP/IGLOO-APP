
export type UserRole = 'owner' | 'tenant' | 'admin';
export type AdminType = 'super' | 'support' | 'finance' | 'content';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  admin_type?: AdminType;
  permissions?: string[];
  avatar?: string;
  is_suspended?: boolean;
  managed_by_admin_id?: string;
}

export interface Tenant {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  image?: string;
  status: 'active' | 'late' | 'inactive';
}

export interface SignatureAudit {
  signed_at: string; // ISO Timestamp
  signer_ip: string;
  user_agent: string;
  signer_identifier: string; // Email or Phone
  document_hash: string; // SHA-256
  integrity_verified: boolean;
}

export type ContractStatus = 'draft' | 'pending_signature' | 'active' | 'expiring_soon' | 'expired' | 'cancelled' | 'renewed';

export interface Signer {
  id: string;
  role: 'owner' | 'tenant' | 'witness';
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'rejected';
  signed_at?: string;
}

export interface ContractHistoryEvent {
  id: string;
  action: 'created' | 'sent' | 'viewed' | 'signed' | 'activated' | 'cancelled' | 'renewed';
  description: string;
  performed_by: string;
  date: string;
}

export interface Contract {
  id: number | string;
  contract_number: string;
  property: string; // Property Name/Address
  tenant_name: string;
  owner_name: string;

  // Dates
  start_date: string;
  end_date: string;
  signature_date?: string;

  // Financials
  value: string; // Formatted "R$ 1.500"
  numeric_value: number;
  security_deposit?: number;
  payment_day: number;

  // Status & Workflow
  status: ContractStatus;
  signers: Signer[];
  history: ContractHistoryEvent[];

  // Document
  pdf_url?: string;
  template_type?: 'residential' | 'commercial';

  // Metadata for list view logic
  days_remaining?: number;
}

export interface Property {
  id: number | string;
  name: string;
  address: string;
  status: 'DISPONÍVEL' | 'ALUGADO' | 'MANUTENÇÃO';
  price: string; // Rental price display
  market_value?: number; // Property value for Yield Calc
  numeric_price?: number; // Numeric rental price for calculations
  area: string;
  image: string;
  status_color?: string;
  tenant?: Tenant | null;
  contract?: Contract | null;
}

// --- SUBSCRIPTION TYPES ---

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

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  target_audience: 'all' | 'beta' | 'internal' | 'none';
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

// --- ADMIN & SUPPORT TYPES ---

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: 'user' | 'subscription' | 'property' | 'payment' | 'system';
  target_id?: string;
  changes?: {
    before: any;
    after: any;
    reason?: string;
  };
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  owner_id: string;
  assigned_admin_id?: string;
  category: 'billing' | 'technical' | 'feature_request' | 'bug' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  subject: string;
  description: string;
  attachments?: string[];
  resolution_notes?: string;
  rating?: number;
  created_at: string;
  resolved_at?: string;
  closed_at?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  attachments?: string[];
  is_internal_note: boolean;
  created_at: string;
}

export interface SystemAnnouncement {
  id: string;
  created_by_admin_id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance' | 'feature';
  target_audience: 'all' | 'free_users' | 'paid_users' | 'specific_plan';
  is_active: boolean;
  show_until?: string;
  created_at: string;
}

export interface GlobalStats {
  active_owners: number;
  active_tenants: number;
  total_properties: number;
  mrr: number;
  arr: number;
  churn_rate: number;
  nps: number;
}
