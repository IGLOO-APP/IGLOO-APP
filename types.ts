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

export interface Contract {
  id: number | string;
  start_date: string;
  end_date: string;
  value: string;
  status: 'active' | 'draft' | 'ended';
  pdf_url?: string;
  // Financial Breakdown
  rent_amount?: string;
  condo_amount?: string;
  iptu_amount?: string;
  admin_fee?: string;
}

export interface Property {
  id: number | string;
  name: string;
  address: string;
  status: 'DISPONÍVEL' | 'ALUGADO' | 'MANUTENÇÃO';
  price: string;
  area: string;
  image: string;
  status_color?: string;
  tenant?: Tenant | null;
  contract?: Contract | null;
}