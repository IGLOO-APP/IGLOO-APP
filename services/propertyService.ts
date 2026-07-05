import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Property } from '../types';
import { mapProperty } from '../utils/mappingUtils';
import { handleServiceError } from '../lib/utils';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export const propertyService = {
  async getAll(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select(
        `
                *,
                contracts:contracts(
                    id, contract_number, start_date, end_date, monthly_value, payment_day, status,
                    profiles:tenant_id(id, name, email, phone, avatar_url)
                )
            `
      )
      .order('created_at', { ascending: false });

    if (error) {
      handleServiceError(error, 'Erro ao buscar imóveis');
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Filter to get only active contract for the view (mock logic usually implies one active contract)
    const processedData = data.map((p) => {
      // Find active contract if exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activeContract = p.contracts.find((c: any) => c.status === 'active') || p.contracts[0];
      return { ...p, contracts: activeContract ? [activeContract] : [] };
    });

    return processedData.map(mapProperty);
  },

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select(
        `
                *,
                contracts:contracts(id, contract_number, start_date, end_date, monthly_value, payment_day, status, profiles:tenant_id(id, name, email, phone, avatar_url))
            `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleServiceError(error, 'Erro ao buscar detalhes do imóvel');
    }

    return mapProperty(data);
  },

  async create(property: PropertyInsert): Promise<Property> {
    const { data, error } = await supabase.from('properties').insert(property).select().single();

    if (error) {
      handleServiceError(error, 'Erro ao criar imóvel');
    }

    return mapProperty(data);
  },

  async update(id: string, updates: PropertyUpdate): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleServiceError(error, 'Erro ao atualizar imóvel');
    }

    return mapProperty(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) {
      handleServiceError(error, 'Erro ao excluir imóvel');
    }
  },
};
