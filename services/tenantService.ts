import { supabase } from '../lib/supabase';
import { Tenant } from '../types';

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    // In real DB, we fetch profiles with role 'tenant'
    // And potentially join with contracts to get property info
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'tenant');

    if (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }

    return data.map((t: any) => ({
      id: t.id,
      name: t.name || 'Sem Nome',
      email: t.email,
      phone: t.phone || '',
      cpf: t.cpf,
      image: t.avatar_url,
      status: 'active', // Logic to determine if late based on payments table needed here
    }));
  },

  async create(tenantData: any): Promise<void> {
    // In Supabase, creating a tenant profile usually happens via Auth SignUp
    // Or adding a profile row if not using auth for tenants immediately
    const { error } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(), // Assuming we create a placeholder profile
      email: tenantData.email,
      name: tenantData.name,
      role: 'tenant',
      phone: tenantData.phone,
      cpf: tenantData.cpf,
    });

    if (error) throw error;
  },
};
