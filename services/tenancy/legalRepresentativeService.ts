import { supabase } from '../../lib/supabase';
import type { TenantLegalRepresentative } from '../../types';
import { handleServiceError } from '../../lib/utils';

const db = () => supabase as any;

export const legalRepresentativeService = {
  async getByTenant(tenantId: string): Promise<TenantLegalRepresentative[]> {
    const { data, error } = await db()
      .from('tenant_legal_representatives')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) {
      handleServiceError(error, 'Erro ao buscar representantes legais');
    }

    return (data || []) as TenantLegalRepresentative[];
  },

  async upsertMany(tenantId: string, reps: Omit<TenantLegalRepresentative, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    await db().from('tenant_legal_representatives').delete().eq('tenant_id', tenantId);

    if (reps.length === 0) return;

    const records = reps.map((r) => ({ ...r, tenant_id: tenantId }));
    const { error } = await db().from('tenant_legal_representatives').insert(records);

    if (error) handleServiceError(error, 'Erro ao salvar representantes legais');
  },

  async deleteByTenant(tenantId: string): Promise<void> {
    const { error } = await db().from('tenant_legal_representatives').delete().eq('tenant_id', tenantId);

    if (error) handleServiceError(error, 'Erro ao remover representantes legais');
  },
};
