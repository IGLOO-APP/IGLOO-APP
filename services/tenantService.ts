
import { supabase } from '../lib/supabase';
import { Tenant } from '../types';

// Check if Supabase is configured
const env = (import.meta as any).env || {};
const isMock = !env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL.includes('placeholder');

export const tenantService = {
    async getAll(): Promise<Tenant[]> {
        if (isMock) {
            // Return mock data used in Tenants.tsx if in mock mode
            return [
                {
                   id: 1,
                   name: 'João Silva (Mock)',
                   email: 'joao.silva@exemplo.com',
                   phone: '+5511999999999',
                   image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf',
                   status: 'active'
                }
            ];
        }

        // In real DB, we fetch profiles with role 'tenant'
        // And potentially join with contracts to get property info
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'tenant');

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
            status: 'active' // Logic to determine if late based on payments table needed here
        }));
    },

    async create(tenantData: any): Promise<void> {
        if (isMock) return;

        // In Supabase, creating a tenant profile usually happens via Auth SignUp
        // Or adding a profile row if not using auth for tenants immediately
        const { error } = await supabase.from('profiles').insert({
            id: crypto.randomUUID(), // Assuming we create a placeholder profile
            email: tenantData.email,
            name: tenantData.name,
            role: 'tenant',
            phone: tenantData.phone,
            cpf: tenantData.cpf
        });

        if (error) throw error;
    }
};
