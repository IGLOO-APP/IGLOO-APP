import { supabase } from '../lib/supabase';
import { Tenant } from '../types';

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    // In real DB, we fetch profiles with role 'tenant'
    // Joining with contracts to get property information
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        contracts:contracts!contracts_tenant_id_fkey(
          status,
          property:properties(name)
        )
      `)
      .eq('role', 'tenant');

    if (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }

    return data.map((t: any) => {
      // Find active contract to get the property name
      const activeContract = t.contracts?.find((c: any) => c.status === 'active') || t.contracts?.[0];
      const propertyName = activeContract?.property?.name || 'Imóvel não vinculado';

      return {
        id: t.id,
        name: t.name || 'Sem Nome',
        email: t.email,
        phone: t.phone || '',
        cpf: t.cpf,
        image: t.avatar_url,
        status: activeContract?.status || 'active',
        is_pending: t.is_pending,
        property: propertyName,
      };
    });
  },

  async getById(id: string): Promise<Tenant | null> {
    const { data: t, error } = await supabase
      .from('profiles')
      .select(`
        *,
        contracts:contracts!contracts_tenant_id_fkey(
          id,
          contract_number,
          start_date,
          end_date,
          monthly_value,
          status,
          property:properties(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }

    const activeContract = t.contracts?.find((c: any) => c.status === 'active') || t.contracts?.[0];
    const property = activeContract?.property;

    return {
      id: t.id,
      name: t.name || 'Sem Nome',
      email: t.email,
      phone: t.phone || '',
      cpf: t.cpf,
      image: t.avatar_url,
      status: activeContract?.status || 'active',
      is_pending: t.is_pending,
      property: property?.name || 'Imóvel não vinculado',
      property_id: property?.id,
      contract: activeContract ? {
        id: activeContract.id,
        start_date: activeContract.start_date,
        end_date: activeContract.end_date,
        monthly_value: activeContract.monthly_value,
        status: activeContract.status
      } : undefined
    };
  },

  async create(tenantData: any): Promise<void> {
    const { error } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      email: tenantData.email,
      name: tenantData.name,
      role: 'tenant',
      phone: tenantData.phone,
      cpf: tenantData.cpf,
      property_id: tenantData.propertyId,
    } as any);

    if (error) throw error;
  },

  async invite(tenantData: any): Promise<void> {
    // Em um cenário real, aqui chamaríamos a API do Clerk ou Supabase Auth Admin
    // para disparar um e-mail oficial de convite.
    // Por enquanto, registramos o perfil como pendente no banco.
    const { error } = await supabase.from('profiles').insert({
      id: `pending_${crypto.randomUUID()}`,
      email: tenantData.email,
      name: tenantData.name,
      role: 'tenant',
      phone: tenantData.phone,
      cpf: tenantData.cpf,
      property_id: tenantData.propertyId,
      is_pending: true,
      created_at: new Date().toISOString(),
    } as any);

    if (error) throw error;

    // Simulação de envio de e-mail (Log no console)
    console.log(`[IGLOO] Convite enviado para ${tenantData.email}`);
  },

  async getPayments(contractId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', contractId)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }

    return data;
  },

  async getDocuments(tenantId: string): Promise<any[]> {
    // In a real app, this might come from a 'documents' table or storage
    // For now, we return empty as there's no table, or we can check the profiles/contracts for files
    const { data: tenant } = await supabase.from('profiles').select('cpf').eq('id', tenantId).single();
    const { data: contract } = await supabase.from('contracts').select('pdf_url').eq('tenant_id', tenantId).single();

    const docs = [];
    if (contract?.pdf_url) {
      docs.push({ name: 'Contrato de Locação', type: 'PDF', url: contract.pdf_url, date: 'Recente' });
    }
    if (tenant?.cpf) {
      docs.push({ name: 'Documento Identidade (CPF)', type: 'INFO', url: '#', date: 'Cadastrado' });
    }

    return docs;
  }
};
