import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Property } from '../types';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

// Helper to map DB row to Frontend Type
const mapProperty = (row: any): Property => ({
  id: row.id,
  name: row.name,
  address: row.address,
  status: row.status,
  price: `R$ ${row.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  numeric_price: row.price,
  market_value: row.market_value || 0,
  area: `${row.area}m²`,
  image:
    row.image_url ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=300', // Fallback image
  status_color:
    row.status === 'ALUGADO'
      ? 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
      : row.status === 'MANUTENÇÃO'
        ? 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
        : 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  // In a real join, we would fetch tenant and contract data
  tenant: row.contracts?.[0]?.profiles
    ? {
        id: row.contracts[0].profiles.id,
        name: row.contracts[0].profiles.name,
        email: row.contracts[0].profiles.email,
        phone: row.contracts[0].profiles.phone || '',
        status: 'active',
        image: row.contracts[0].profiles.avatar_url,
      }
    : null,
  contract: row.contracts?.[0]
    ? {
        id: row.contracts[0].id,
        contract_number: row.contracts[0].contract_number || 'N/A',
        property: row.name,
        tenant_name: row.contracts[0].profiles?.name || 'N/A',
        owner_name: 'Você',
        start_date: new Date(row.contracts[0].start_date).toLocaleDateString('pt-BR'),
        end_date: new Date(row.contracts[0].end_date).toLocaleDateString('pt-BR'),
        value: `R$ ${row.contracts[0].monthly_value}`,
        numeric_value: row.contracts[0].monthly_value,
        payment_day: row.contracts[0].payment_day,
        status: row.contracts[0].status,
        signers: [],
        history: [],
      }
    : null,
});

export const usePropertyService = () => {

  return {
    async getAll(): Promise<Property[]> {
      // Immediate fallback for Dev Mode to avoid hanging on connection issues
      if (localStorage.getItem('igloo_dev_session')) {
        return [
          {
            id: 'p1',
            name: 'Studio Centro 01 (Demo)',
            address: 'Rua Augusta, 150 - Consolação',
            status: 'DISPONÍVEL',
            price: 'R$ 1.800,00',
            numeric_price: 1800,
            area: '32m²',
            image:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAgfR0PLTBL8ZIF2qB0vPybwAfsoDq8YSZzrKO3YvbwHO-Dpx9DUD2lZhqZkykfNGgmlkvRF9VoaOcFSV48Ht6XdzQp1ASbt0CpENqCrjtZ6x_SpyNv4OXSv-OUKF3My_NTXKXoNBwigKtzWOjuevabMquLo_GRZDELE3S0LAzp4Pt566NLfyIwPht6jvwGH-diZQCj-F-TMnZkCJ3Li_A3_jxlfoFWldjBhZH7bF-J3hqcCscwB5q2HZdGT9WVIuT8DAJFDjet9POu',
            status_color:
              'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 ring-emerald-600/20',
            tenant: null,
            contract: null,
          },
        ] as Property[];
      }

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
        console.error('Error fetching properties:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [
          {
            id: 'p1',
            name: 'Studio Centro 01 (Demo)',
            address: 'Rua Augusta, 150 - Consolação',
            status: 'DISPONÍVEL',
            price: 'R$ 1.800,00',
            numeric_price: 1800,
            area: '32m²',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgfR0PLTBL8ZIF2qB0vPybwAfsoDq8YSZzrKO3YvbwHO-Dpx9DUD2lZhqZkykfNGgmlkvRF9VoaOcFSV48Ht6XdzQp1ASbt0CpENqCrjtZ6x_SpyNv4OXSv-OUKF3My_NTXKXoNBwigKtzWOjuevabMquLo_GRZDELE3S0LAzp4Pt566NLfyIwPht6jvwGH-diZQCj-F-TMnZkCJ3Li_A3_jxlfoFWldjBhZH7bF-J3hqcCscwB5q2HZdGT9WVIuT8DAJFDjet9POu',
            status_color: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 ring-emerald-600/20',
            tenant: null,
            contract: null,
          }
        ] as Property[];
      }

      const processedData = data.map((p: any) => {
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
        ).eq('id', id).single();

      if (error) {
        console.error('Error fetching property:', error);
        return null;
      }

      return mapProperty(data);
    },

    async create(property: PropertyInsert): Promise<Property> {
      const { data, error } = await supabase
        .from('properties')
        .insert(property)
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        throw error;
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
        console.error('Error updating property:', error);
        throw error;
      }

      return mapProperty(data);
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('properties').delete().eq('id', id);

      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }
    },
  };
};
