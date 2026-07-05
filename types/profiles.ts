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
  onboarding_stage?: string;
  has_completed_onboarding?: boolean;
  onboarding_profile_status?: string;
  onboarding_documents_status?: string;
  onboarding_contract_status?: string;
  onboarding_inspection_status?: string;
  onboarding_profile_rejected_reason?: string;
  onboarding_documents_rejected_reason?: string;
  onboarding_documents_urls?: {
    rg_url?: string;
    rg_name?: string;
    income_url?: string;
    income_name?: string;
  };
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
    };
    residential: {
      vehicle: RequirementStatus;
      pets: RequirementStatus;
      residents: RequirementStatus;
    };
    emergency: {
      status: RequirementStatus; // Controls the whole section
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
