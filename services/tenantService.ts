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
          id,
          status,
          monthly_value,
          payment_day,
          property:properties(id, name)
        )
      `)
      .eq('role', 'tenant');

    if (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }

    return data.map((t: any) => {
      // Find active contract
      const activeContract = Array.isArray(t.contracts) 
        ? (t.contracts.find((c: any) => c.status === 'active') || t.contracts[0])
        : t.contracts;

      // Handle property which might come as an array or object
      const propertyData = activeContract?.property;
      const property = Array.isArray(propertyData) ? propertyData[0] : propertyData;

      return {
        id: t.id,
        name: t.name || 'Sem Nome',
        email: t.email,
        phone: t.phone || '',
        cpf: t.cpf,
        image: t.avatar_url,
        status: activeContract?.status || 'active',
        is_pending: t.is_pending,
        property: property?.name || 'NÃO VINCULADO',
        property_id: property?.id,
        contract: activeContract ? {
          id: activeContract.id,
          monthly_value: activeContract.monthly_value,
          status: activeContract.status,
          payment_day: activeContract.payment_day
        } : undefined
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
      .or(`id.eq.${id},email.eq.${id}`)
      .maybeSingle();

    if (error) {
      console.error('[tenantService] Error fetching tenant:', error);
      return null;
    }

    if (!t) {
      console.warn('[tenantService] Tenant not found for ID/Email:', id);
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
      property_address: property?.address,
      property_image: property?.image_url,
      contract: activeContract ? {
        id: activeContract.id,
        contract_number: activeContract.contract_number,
        start_date: activeContract.start_date,
        end_date: activeContract.end_date,
        monthly_value: activeContract.monthly_value,
        status: activeContract.status,
        payment_day: activeContract.payment_day
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
    // 1. Get contract to find property_id and pdf_url
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('property_id, pdf_url')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .maybeSingle();

    if (contractError) {
      console.error('[tenantService] Error fetching contract for docs:', contractError);
    }

    const docs: any[] = [];
    
    // Add contract PDF if it exists
    if (contract?.pdf_url) {
      docs.push({ 
        id: 'contract-pdf',
        name: 'Contrato de Locação', 
        type: 'PDF', 
        url: contract.pdf_url, 
        date: 'Vigente',
        category: 'Jurídico',
        status: 'Validado'
      });
    }

    // 2. Fetch documents from property_documents table using the property_id from contract
    const propertyId = contract?.property_id;
    if (propertyId) {
      const { data: propertyDocs, error: docsError } = await supabase
        .from('property_documents')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (!docsError && propertyDocs) {
        propertyDocs.forEach(doc => {
          docs.push({
            id: doc.id,
            name: doc.name,
            category: doc.category,
            type: doc.type,
            size: doc.size || '0 KB',
            date: new Date(doc.created_at).toLocaleDateString('pt-BR'),
            status: doc.status,
            url: doc.url
          });
        });
      }
    }

    return docs;
  },

  async getMaintenanceRequests(tenantId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[tenantService] Error fetching maintenance requests:', error);
      return [];
    }

    return data;
  },
};
