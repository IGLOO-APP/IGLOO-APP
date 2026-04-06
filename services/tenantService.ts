import { supabase } from '../lib/supabase';
import { Tenant } from '../types';

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    if (localStorage.getItem('igloo_dev_session')) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      return [
        {
          id: 't1',
          name: 'João Silva (Demo)',
          email: 'joao.silva@exemplo.com',
          phone: '+5511999999999',
          cpf: '123.456.789-00',
          image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf',
          status: 'active',
          property: 'Studio Centro 01',
          property_id: '101',
          rent: 'R$ 1.800,00',
          due: 10,
          score: 98,
          last_payment_date: new Date(currentYear, currentMonth, 5).toISOString(), // Liquidado
        },
        {
          id: 't2',
          name: 'Maria Oliveira (Demo)',
          email: 'maria.oliveira@exemplo.com',
          phone: '+5511988888888',
          cpf: '987.654.321-11',
          image:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuD78MRhEj5vokBi3Zr5ORCa84xM4Q0aoHqRqMtmFY5rqqioFglngu_CVvuUlAwFFXylrVwhOX-6rB0xO0RM04aD6spoISdNI-pJR9jsw0SwQsb3-TQPyS3OBbENLbte3Z-Zqv9lEOgt3WuKjxTIrLaStD2Bove6Q5jDIX7PpiUDn1x-gcN2lMoAOEi9fV_nI4dv-32WMg0se3QVylj1o0-E7hPHafz8wUKADMIvPRoIn91W1pDK1-L-SQnqBavDYiPc4Udc_4ypGJ2q',
          status: 'active',
          property: 'Kitnet 05 - Centro',
          property_id: '105',
          rent: 'R$ 1.200,00',
          due: 25,
          score: 100,
          last_payment_date: new Date(currentYear, currentMonth - 1, 25).toISOString(), // Vencendo (não pagou esse mês ainda)
        },
        {
          id: 't3',
          name: 'Carlos Pereira (Demo)',
          email: 'carlos.pereira@exemplo.com',
          phone: '+5511977777777',
          cpf: '456.789.123-22',
          status: 'late',
          property: 'Studio 22 - Vila Madalena',
          property_id: 'studio-22',
          rent: 'R$ 2.400,00',
          due: 5,
          score: 65,
          last_payment_date: new Date(currentYear, currentMonth - 1, 5).toISOString(), // Atrasado
        },
      ];
    }

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
    } as any);

    if (error) throw error;
  },
};
