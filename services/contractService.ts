import { supabase } from '../lib/supabase';
import { Contract } from '../types';

interface DbContractRow {
  id: string;
  contract_number: string | null;
  properties?: { name: string } | null;
  profiles_tenant?: { name: string; email: string } | null;
  profiles_owner?: { name: string } | null;
  start_date: string;
  end_date: string;
  monthly_value: number;
  payment_day: number;
  status: 'draft' | 'pending_signature' | 'active' | 'expiring_soon' | 'expired' | 'cancelled';
  pdf_url?: string | null;
  signers?: any[];
  history?: any[];
}

const mapContract = (row: DbContractRow): Contract => ({
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
  pdf_url: row.pdf_url || undefined,
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

    return (data as unknown as DbContractRow[]).map(mapContract);
  },

  async getById(id: string): Promise<Contract | null> {
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
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching contract:', error);
      return null;
    }

    return mapContract(data as unknown as DbContractRow);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(ownerId: string, contractData: any): Promise<void> {
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
      // Usa o valor fornecido pelo usuário, com fallback para dia 10
      payment_day: parseInt(contractData.paymentDay) || 10,
    };

    const { error } = await supabase.from('contracts').insert(payload);
    if (error) throw error;
  },

  async update(
    id: string,
    updates: {
      monthly_value?: number;
      end_date?: string;
      payment_day?: number;
      status?: string;
      pdf_url?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signers?: any[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      history?: any[];
    }
  ): Promise<void> {
    const { error } = await supabase.from('contracts').update(updates).eq('id', id);

    if (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  async updateStatus(
    id: string,
    status: 'draft' | 'active' | 'expired' | 'terminated'
  ): Promise<void> {
    await contractService.update(id, { status });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  },
};
