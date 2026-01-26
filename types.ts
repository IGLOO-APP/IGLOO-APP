
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
