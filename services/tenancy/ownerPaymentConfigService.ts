import { supabase } from '../../lib/supabase';
import type { OwnerPaymentConfig } from '../../types';
import { handleServiceError } from '../../lib/utils';

const db = () => supabase as any;

export const ownerPaymentConfigService = {
  async getByOwner(ownerId: string): Promise<OwnerPaymentConfig | null> {
    const { data, error } = await db()
      .from('owner_payment_config')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) {
      handleServiceError(error, 'Erro ao buscar configuração de pagamento');
    }

    return data as OwnerPaymentConfig | null;
  },

  async getByTenantContract(tenantId: string): Promise<OwnerPaymentConfig | null> {
    const { data: contract } = await db()
      .from('contracts')
      .select('owner_id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .maybeSingle();

    if (!contract?.owner_id) return null;

    const { data, error } = await db()
      .from('owner_payment_config')
      .select('*')
      .eq('owner_id', contract.owner_id)
      .maybeSingle();

    if (error) {
      handleServiceError(error, 'Erro ao buscar configuração de pagamento');
    }

    return data as OwnerPaymentConfig | null;
  },

  async upsert(
    config: Omit<OwnerPaymentConfig, 'id' | 'created_at' | 'updated_at'>
  ): Promise<void> {
    const { error } = await db()
      .from('owner_payment_config')
      .upsert({ ...config, updated_at: new Date().toISOString() }, { onConflict: 'owner_id' });

    if (error) handleServiceError(error, 'Erro ao salvar configuração de pagamento');
  },
};
