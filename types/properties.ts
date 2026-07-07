import { Tenant, Contract } from './index';

export interface Property {
  id: string;
  name: string;
  address: string;
  status: 'DISPONÍVEL' | 'ALUGADO' | 'MANUTENÇÃO';
  price: string; // Rental price display
  market_value?: number; // Property value for Yield Calc
  numeric_price?: number; // Numeric rental price for calculations
  area: string;
  image: string;
  owner_id?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  yield?: string | number;
  status_color?: string;
  tenant?: Tenant | null;
  contract?: Contract | null;
  galleryImages?: string[];
  created_at?: string;
  updated_at?: string;

  // Stats added for UI and build stability
  beds?: number;
  baths?: number;
  vacantDays?: number;
  visits?: number;
  status_operacional?: 'ocupado' | 'vago' | 'manutencao' | 'pendencia_assinatura';
}
