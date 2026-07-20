import { supabase } from '../../lib/supabase';
import type { TenantReference } from '../../types';
import { handleServiceError } from '../../lib/utils';

const db = () => supabase as any;

export const referenceService = {
  async getByTenant(tenantId: string): Promise<TenantReference[]> {
    const { data, error } = await db()
      .from('tenant_references')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('type');

    if (error) {
      handleServiceError(error, 'Erro ao buscar referências');
    }

    return (data || []) as TenantReference[];
  },

  async upsertMany(tenantId: string, refs: Omit<TenantReference, 'id' | 'tenant_id' | 'created_at'>[]): Promise<void> {
    await db().from('tenant_references').delete().eq('tenant_id', tenantId);

    if (refs.length === 0) return;

    const records = refs.map((r) => ({ ...r, tenant_id: tenantId }));
    const { error } = await db().from('tenant_references').insert(records);

    if (error) handleServiceError(error, 'Erro ao salvar referências');
  },

  async deleteByTenant(tenantId: string): Promise<void> {
    const { error } = await db().from('tenant_references').delete().eq('tenant_id', tenantId);

    if (error) handleServiceError(error, 'Erro ao remover referências');
  },
};
