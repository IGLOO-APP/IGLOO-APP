export type UserRole = 'owner' | 'tenant' | 'admin' | 'pending';
export type AdminType = 'super' | 'support' | 'finance' | 'content';

export interface User {
  id: string; // Clerk always returns string IDs
  name: string;
  email: string;
  role: UserRole;
  admin_type?: AdminType;
  permissions?: string[];
  avatar?: string;
  is_suspended?: boolean;
  is_pending?: boolean;
  managed_by_admin_id?: string;
  property_id?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  last_login_at?: string;
  plan?: string;
  has_completed_onboarding?: boolean;
  metrics?: {
    properties: number;
    tenants: number;
    contracts: number;
  };
}

export interface Tenant {
  id: string; // Clerk/Supabase UUID always string
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  rg?: string;
  image?: string;
  status: 'active' | 'late' | 'inactive';
  property?: string;
  property_id?: string;
  property_address?: string;
  property_image?: string;
  rent?: string;
  due?: number;
  score?: number;
  last_payment_date?: string; // ISO format
  contract?: {
    id: string | number;
    contract_number?: string;
    start_date: string;
    end_date: string;
    monthly_value: number;
    status: string;
    payment_day?: number;
    pdf_url?: string;
  };
  is_verified?: boolean;
  is_pending?: boolean;
  property_details?: {
    name: string;
    address: string;
    image_url: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: string;
    parking?: number;
    price?: string;
  };
  // Employment / Income fields
  company_name?: string;
  company_cnpj?: string;
  company_address?: string;
  occupation?: string;
  monthly_income?: number;
  admission_date?: string;
  // Guarantee
  guarantee_type?: 'fiador' | 'seguro_fianca' | 'deposito_caucao' | 'outros';
  // Tenant registration expanded fields
  birth_date?: string;
  marital_status?: string;
  nationality?: string;
  rg_issuer?: string;
  rg_uf?: string;
  cep?: string;
  street?: string;
  street_number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  residence_time?: string;
  phone_commercial?: string;
  other_income?: number;
  adults_count?: number;
  children_count?: number;
  currently_pays_rent?: boolean;
  current_rent_where?: string;
  // Pessoa Jurídica
  tenant_type?: 'pf' | 'pj';
  company_legal_name?: string;
  company_trade_name?: string;
  company_state_registration?: string;
  // Relations
  spouse?: TenantSpouse;
  references?: TenantReference[];
  legal_representatives?: TenantLegalRepresentative[];
  // Onboarding
  onboarding_stage?: string;
  has_completed_onboarding?: boolean;
  onboarding_profile_status?: string;
  onboarding_documents_status?: string;
  onboarding_contract_status?: string;
  onboarding_inspection_status?: string;
  onboarding_profile_rejected_reason?: string;
  onboarding_documents_rejected_reason?: string;
  owner_pix_key?: string;
  onboarding_documents_urls?: {
    rg_url?: string;
    rg_name?: string;
    income_url?: string;
    income_name?: string;
    residence_url?: string;
    residence_name?: string;
    guarantee_url?: string;
    guarantee_name?: string;
  };
}

export interface Guarantor {
  id?: string;
  tenant_id?: string;
  property_id?: string;
  name: string;
  cpf?: string;
  rg?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  income_url?: string;
  income_name?: string;
  residence_url?: string;
  residence_name?: string;
  rg_document_url?: string;
  income_proof_url?: string;
  status?: 'pendente' | 'aprovado' | 'reprovado';
  created_at?: string;
  updated_at?: string;
}

export interface TenantSpouse {
  id?: string;
  tenant_id: string;
  name: string;
  cpf?: string;
  rg?: string;
  birth_date?: string;
  phone?: string;
  occupation?: string;
  monthly_income?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TenantReference {
  id?: string;
  tenant_id: string;
  type: 'bancaria' | 'pessoal';
  bank_name?: string;
  bank_agency?: string;
  bank_account?: string;
  name?: string;
  phone?: string;
  relationship?: string;
  created_at?: string;
}

export interface TenantLegalRepresentative {
  id?: string;
  tenant_id: string;
  name: string;
  cpf?: string;
  rg?: string;
  position?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OwnerPaymentConfig {
  id?: string;
  owner_id: string;
  accepts_deposit: boolean;
  accepts_guarantor: boolean;
  pix_enabled: boolean;
  pix_key_type?: string;
  pix_key?: string;
  bank_transfer_enabled: boolean;
  bank_name?: string;
  bank_agency?: string;
  bank_account?: string;
  bank_account_type?: string;
  account_holder_name?: string;
  created_at?: string;
  updated_at?: string;
}

export type RequirementStatus = 'required' | 'optional' | 'hidden';

export interface TenantRequirement {
  id: string;
  label: string;
  status: RequirementStatus;
  description?: string;
}

export interface TenantProfileConfig {
  propertyId: string | 'global';
  sections: {
    personal: {
      occupation: RequirementStatus;
      birth_date: RequirementStatus;
      marital_status: RequirementStatus;
      nationality: RequirementStatus;
      rg_issuer: RequirementStatus;
    };
    address: {
      status: RequirementStatus;
      previous_address: RequirementStatus;
    };
    residential: {
      vehicle: RequirementStatus;
      pets: RequirementStatus;
      residents: RequirementStatus;
      adults_children: RequirementStatus;
    };
    professional: {
      company_cnpj: RequirementStatus;
      company_address: RequirementStatus;
      other_income: RequirementStatus;
      employment_type: RequirementStatus;
      time_at_company: RequirementStatus;
    };
    financial: {
      current_rent: RequirementStatus;
    };
    spouse: {
      status: RequirementStatus;
    };
    references: {
      bancaria: RequirementStatus;
      pessoal: RequirementStatus;
    };
    emergency: {
      status: RequirementStatus;
    };
    legalEntity: {
      status: RequirementStatus;
      representatives: RequirementStatus;
    };
    sharedDocs: {
      contract: boolean;
      inspection: boolean;
      rules: boolean;
      custom: { id: string; label: string; active: boolean }[];
    };
    requiredDocs: {
      id_card: RequirementStatus;
      income: RequirementStatus;
      residence: RequirementStatus;
      guarantee: RequirementStatus;
      custom: { id: string; label: string; description: string; status: RequirementStatus }[];
    };
  };
}
