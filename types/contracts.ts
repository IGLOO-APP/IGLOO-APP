export interface SignatureAudit {
  signed_at: string; // ISO Timestamp
  signer_ip: string;
  user_agent: string;
  signer_identifier: string; // Email or Phone
  document_hash: string; // SHA-256
  integrity_verified: boolean;
}

export type ContractStatus =
  | 'draft'
  | 'pending_signature'
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'cancelled'
  | 'renewed';

export interface Signer {
  id: string;
  role: 'owner' | 'tenant' | 'witness';
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'viewed' | 'rejected';
  signed_at?: string;
  viewed_at?: string;
  ip?: string;
  hash?: string;
}

export interface ContractHistoryEvent {
  id: string;
  action: 'created' | 'sent' | 'viewed' | 'signed' | 'activated' | 'cancelled' | 'renewed';
  description: string;
  performed_by: string;
  date: string;
}

export interface Contract {
  id: string;
  contract_number: string;
  property: string; // Property Name/Address
  property_id?: string;
  tenant_name: string;
  tenant_id?: string;
  owner_name: string;
  owner_id?: string;

  // Dates
  start_date: string;
  end_date: string;
  signature_date?: string;

  // Financials
  value: string; // Formatted "R$ 1.500"
  numeric_value: number;
  security_deposit?: number;
  condominium_value?: number;
  iptu_value?: number;
  payment_day: number;

  // Status & Workflow
  status: ContractStatus;
  signers: Signer[];
  history: ContractHistoryEvent[];

  // Document
  pdf_url?: string;
  contract_text?: string;
  template_type?: 'residential' | 'commercial';

  // Metadata for list view logic
  days_remaining?: number;
}

export interface CreateContractInput {
  property_id: string;
  tenant_id: string | null;
  startDate: string;
  duration: string;
  rentValue: string;
  depositValue: string;
  paymentDay: string;
  hasMaintenanceFee: boolean;
  maintenanceFee: string;
  earlyTerminationFee: string;
  lockInPeriod: string;
  condominiumValue: string;
  iptuValue: string;
  ownerName: string;
  ownerEmail: string;
  tenantName: string;
  tenantCpf: string;
  tenantEmail: string;
  tenantPhone: string;
  property: string;
  contractText: string;
  signaturePayloads: {
    pageIndex: number;
    signatureDataUrl: string;
    position: { xPercent: number; yPercent: number };
  }[];
}
