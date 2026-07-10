import { supabase } from '../../lib/supabase';
import {
  Contract,
  ContractStatus,
  CreateContractInput,
  Signer,
  ContractHistoryEvent,
} from '../../types';

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
  contract_text?: string | null;
  signers?: Signer[];
  history?: ContractHistoryEvent[];
}

const parseJsonArray = <T>(val: unknown): T[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') try { return JSON.parse(val); } catch { return []; }
  return [];
};

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
  signers: parseJsonArray<Signer>(row.signers),
  history: parseJsonArray<ContractHistoryEvent>(row.history),
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

  async create(ownerId: string, contractData: CreateContractInput): Promise<string> {
    let tenantId = contractData.tenant_id;

    if (!tenantId) {
      if (!contractData.tenantName) throw new Error('Nome do inquilino é obrigatório');

      const { data: newTenant, error: tenantError } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          name: contractData.tenantName,
          email: contractData.tenantEmail || `tenant_${Date.now()}@temp.igloo.app`,
          cpf: contractData.tenantCpf || null,
          phone: contractData.tenantPhone || null,
          role: 'tenant',
        })
        .select('id')
        .single();

      if (tenantError) throw tenantError;
      tenantId = newTenant.id;
    }

    // Verify property is still available
    const { data: property } = await supabase
      .from('properties')
      .select('status')
      .eq('id', contractData.property_id)
      .single();

    if (property && property.status !== 'DISPONÍVEL') {
      throw new Error('Imóvel não está mais disponível para locação.');
    }

    const startDate = contractData.startDate;
    const duration = parseInt(contractData.duration) || 30;

    const signers: Signer[] = [];
    signers.push({
      id: crypto.randomUUID(),
      role: 'owner',
      name: contractData.ownerName || 'Proprietário',
      email: contractData.ownerEmail || '',
      status: contractData.signaturePayloads.length > 0 ? 'signed' : 'pending',
      signed_at: contractData.signaturePayloads.length > 0 ? new Date().toISOString() : undefined,
    });
    signers.push({
      id: crypto.randomUUID(),
      role: 'tenant',
      name: contractData.tenantName || 'Inquilino',
      email: contractData.tenantEmail || '',
      status: 'pending',
    });

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        contract_number: `CTR-${Date.now()}`,
        owner_id: ownerId,
        property_id: contractData.property_id,
        tenant_id: tenantId,
        start_date: startDate,
        end_date: new Date(
          new Date(startDate).setMonth(new Date(startDate).getMonth() + duration)
        ).toISOString(),
        monthly_value: parseFloat(contractData.rentValue) || 0,
        security_deposit: parseFloat(contractData.depositValue) || 0,
        condominium_value: parseFloat(contractData.condominiumValue) || 0,
        iptu_value: parseFloat(contractData.iptuValue) || 0,
        status: 'draft',
        payment_day: parseInt(contractData.paymentDay) || 10,
        contract_text: contractData.contractText || null,
        signers: JSON.stringify(signers),
        history: JSON.stringify([
          {
            id: Date.now().toString(),
            action: 'created',
            description: 'Contrato criado como rascunho',
            performed_by: 'Sistema',
            date: now,
          },
        ]),
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
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
      status?: ContractStatus | string;
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

    const nowIso = new Date().toISOString();
    const newHistory: ContractHistoryEvent[] = [
      {
        id: Date.now().toString(),
        action: 'renewed',
        description: `Renovado — ${data.observations || 'Sem observações'}`,
        performed_by: 'Sistema',
        date: nowIso,
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
            date: new Date().toISOString(),
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
