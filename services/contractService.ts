import { supabase } from '../lib/supabase';
import { Contract, Signer, ContractHistoryEvent } from '../types';

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
  signers?: Signer[];
  history?: ContractHistoryEvent[];
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

  async create(ownerId: string, contractData: Record<string, unknown>): Promise<void> {
    let tenantId = contractData.tenant_id as string | null;

    if (!tenantId) {
      const tenantName = contractData.tenantName as string;
      const tenantCpf = contractData.tenantCpf as string;
      const tenantEmail =
        (contractData.tenantEmail as string) || `tenant_${Date.now()}@temp.igloo.app`;
      const tenantPhone = contractData.tenantPhone as string;

      if (!tenantName) throw new Error('Nome do inquilino é obrigatório');

      const { data: newTenant, error: tenantError } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          name: tenantName,
          email: tenantEmail,
          cpf: tenantCpf || null,
          phone: tenantPhone || null,
          role: 'tenant',
        })
        .select('id')
        .single();

      if (tenantError) throw tenantError;
      tenantId = newTenant.id;
    }

    const startDate = contractData.startDate as string;
    const duration = parseInt(contractData.duration as string) || 30;

    const { error } = await supabase.from('contracts').insert({
      contract_number: `CTR-${Date.now()}`,
      owner_id: ownerId,
      property_id: contractData.property_id as string,
      tenant_id: tenantId,
      start_date: startDate,
      end_date: new Date(
        new Date(startDate).setMonth(new Date(startDate).getMonth() + duration)
      ).toISOString(),
      monthly_value: parseFloat(contractData.rentValue as string) || 0,
      status: 'draft',
      payment_day: parseInt(contractData.paymentDay as string) || 10,
    });
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
      signers?: Signer[];
      history?: ContractHistoryEvent[];
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .update(updates as Record<string, unknown>)
      .eq('id', id);

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
