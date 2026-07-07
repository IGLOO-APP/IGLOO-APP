import { supabase } from '../../lib/supabase';
import { Contract, ContractStatus, Signer, ContractHistoryEvent } from '../../types';

interface DbContractRow {
  id: string;
  contract_number: string | null;
  property_id?: string;
  tenant_id?: string;
  owner_id?: string;
  properties?: { name: string } | null;
  profiles_tenant?: { name: string; email: string } | null;
  profiles_owner?: { name: string } | null;
  start_date: string;
  end_date: string;
  monthly_value: number;
  security_deposit?: number | null;
  condominium_value?: number | null;
  iptu_value?: number | null;
  payment_day: number;
  status: ContractStatus;
  pdf_url?: string | null;
  signers?: Signer[];
  history?: ContractHistoryEvent[];
}

const mapContract = (row: DbContractRow): Contract => ({
  id: row.id,
  contract_number: row.contract_number || 'N/A',
  property: row.properties?.name || 'Imóvel Desconhecido',
  property_id: row.property_id,
  tenant_name: row.profiles_tenant?.name || 'Inquilino',
  tenant_id: row.tenant_id,
  owner_name: row.profiles_owner?.name || 'Proprietário',
  owner_id: row.owner_id,
  start_date: row.start_date,
  end_date: row.end_date,
  value: `R$ ${row.monthly_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  numeric_value: row.monthly_value,
  security_deposit: row.security_deposit || undefined,
  condominium_value: row.condominium_value || undefined,
  iptu_value: row.iptu_value || undefined,
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

  async getWithDetails(id: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select(
        `*, property:properties(id, name, address, image_url, bedrooms, bathrooms, area), tenant_profile:profiles!contracts_tenant_id_fkey(id, name, email, cpf, phone), owner_profile:profiles!contracts_owner_id_fkey(id, name, email)`
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching contract details:', error);
      return null;
    }
    return data;
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
      security_deposit: parseFloat(contractData.depositValue as string) || 0,
      condominium_value: contractData.condominiumValue
        ? parseFloat(contractData.condominiumValue as string)
        : 0,
      iptu_value: contractData.iptuValue ? parseFloat(contractData.iptuValue as string) : 0,
      status: 'draft',
      payment_day: parseInt(contractData.paymentDay as string) || 10,
      signers: contractData.signers ? JSON.stringify(contractData.signers) : JSON.stringify([]),
      history: contractData.history ? JSON.stringify(contractData.history) : JSON.stringify([]),
    });
    if (error) throw error;
  },

  async update(
    id: string,
    updates: {
      monthly_value?: number;
      security_deposit?: number;
      condominium_value?: number;
      iptu_value?: number;
      end_date?: string;
      payment_day?: number;
      status?: string;
      pdf_url?: string;
      signers?: Signer[];
      history?: ContractHistoryEvent[];
    }
  ): Promise<void> {
    const dbUpdates: Record<string, unknown> = { ...updates };
    if (updates.signers) dbUpdates.signers = JSON.stringify(updates.signers);
    if (updates.history) dbUpdates.history = JSON.stringify(updates.history);

    const { error } = await supabase.from('contracts').update(dbUpdates).eq('id', id);

    if (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: ContractStatus): Promise<void> {
    await contractService.update(id, { status });
  },

  async renew(
    id: string,
    data: {
      newEndDate: string;
      newValue: number;
      observations?: string;
    }
  ): Promise<Contract> {
    const existing = await contractService.getById(id);
    if (!existing) throw new Error('Contrato não encontrado');
    if (!existing.property_id || !existing.tenant_id || !existing.owner_id) {
      throw new Error('Dados do contrato original incompletos para renovação');
    }

    const newHistory: ContractHistoryEvent[] = [
      {
        id: Date.now().toString(),
        action: 'renewed',
        description: `Renovado — ${data.observations || 'Sem observações'}`,
        performed_by: 'Sistema',
        date: new Date().toLocaleString('pt-BR'),
      },
      ...existing.history,
    ];

    await contractService.update(id, {
      status: 'renewed',
      history: newHistory,
    });

    const newContractNumber = `CTR-${Date.now()}`;
    const startDate = new Date().toISOString();

    const { data: newContract, error } = await supabase
      .from('contracts')
      .insert({
        contract_number: newContractNumber,
        owner_id: existing.owner_id,
        property_id: existing.property_id,
        tenant_id: existing.tenant_id,
        start_date: startDate,
        end_date: data.newEndDate,
        monthly_value: data.newValue,
        payment_day: existing.payment_day,
        security_deposit: existing.security_deposit || 0,
        status: 'active',
        signers: JSON.stringify(existing.signers),
        history: JSON.stringify([
          {
            id: Date.now().toString() + 1,
            action: 'created',
            description: 'Contrato criado a partir de renovação',
            performed_by: 'Sistema',
            date: new Date().toLocaleString('pt-BR'),
          },
        ]),
      })
      .select(
        '*, properties:property_id(name), profiles_tenant:tenant_id(name, email), profiles_owner:owner_id(name)'
      )
      .single();

    if (error) throw error;
    return mapContract(newContract as unknown as DbContractRow);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  },

  async getExpiring(ownerId: string): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select(
        '*, properties:property_id(name), profiles_tenant:tenant_id(name, email), profiles_owner:owner_id(name)'
      )
      .eq('owner_id', ownerId)
      .in('status', ['active', 'expiring_soon'])
      .lt('end_date', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString());

    if (error) return [];
    return (data as unknown as DbContractRow[]).map(mapContract);
  },
};
