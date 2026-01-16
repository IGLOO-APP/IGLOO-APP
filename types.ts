export type UserRole = 'owner' | 'tenant';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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

export interface Contract {
  id: number | string;
  start_date: string;
  end_date: string;
  value: string; // Formatted string "R$ 1.500"
  numeric_value?: number; // Added for calculations
  status: 'active' | 'draft' | 'ended' | 'pending_signature' | 'signed';
  pdf_url?: string;
  property: string; // Added for display
  tenant?: string; // Added for display
  tenant_phone?: string; // Added for WhatsApp actions
  // Financial Breakdown
  rent_amount?: string;
  condo_amount?: string;
  iptu_amount?: string;
  admin_fee?: string;
  // Signature Logic
  audit_trail?: SignatureAudit;
  sent_date?: string; // For "Sent 2 days ago" logic
  viewed_by_tenant?: boolean; // For "Viewed" feedback
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