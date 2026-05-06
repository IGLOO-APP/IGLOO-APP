import { supabase } from '../lib/supabase';
import { Contract } from '../types';

const mapContract = (row: any): Contract => ({
  id: row.id,
  contract_number: row.contract_number || 'N/A',
  property: row.properties?.name || 'Imóvel Desconhecido',
  tenant_name: row.profiles_tenant?.name || 'Inquilino',
  owner_name: row.profiles_owner?.name || 'Proprietário',
  start_date: row.start_date,
  end_date: row.end_date,
  value: `R$ ${row.monthly_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  numeric_value: row.monthly_value,
  payment_day: row.payment_day,
  status: row.status,
  pdf_url: row.pdf_url,
  signers: row.signers || [],
  history: row.history || [],
});

export const contractService = {
  async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select(
        `
                *,
                properties:property_id(name),
                profiles_tenant:tenant_id(name, email),
                profiles_owner:owner_id(name)
            `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      return [];
    }

    return data.map(mapContract);
  },

  async create(ownerId: string, contractData: any): Promise<void> {
    // Transform UI data to DB data
    const payload = {
      contract_number: `CTR-${Date.now()}`,
      owner_id: ownerId,
      property_id: contractData.property_id,
      tenant_id: contractData.tenant_id,
      start_date: contractData.startDate,
      end_date: new Date(
        new Date(contractData.startDate).setMonth(
          new Date(contractData.startDate).getMonth() + parseInt(contractData.duration)
        )
      ).toISOString(),
      monthly_value: parseFloat(contractData.rentValue),
      status: 'draft',
      payment_day: 10,
    };

    const { error } = await supabase.from('contracts').insert(payload);
    if (error) throw error;
  },
};
