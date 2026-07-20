import { supabase } from '../../lib/supabase';
import type { TenantSpouse } from '../../types';
import { handleServiceError } from '../../lib/utils';

const db = () => supabase as any;

export const spouseService = {
  async getByTenant(tenantId: string): Promise<TenantSpouse | null> {
    const { data, error } = await db()
      .from('tenant_spouses')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) {
      handleServiceError(error, 'Erro ao buscar cônjuge');
    }

    return data as TenantSpouse | null;
  },

  async upsert(spouse: Omit<TenantSpouse, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const existing = await db()
      .from('tenant_spouses')
      .select('id')
      .eq('tenant_id', spouse.tenant_id)
      .maybeSingle();

    if ((existing as any)?.data) {
      const { error } = await db()
        .from('tenant_spouses')
        .update({ ...spouse, updated_at: new Date().toISOString() })
        .eq('id', (existing as any).data.id);

      if (error) handleServiceError(error, 'Erro ao atualizar cônjuge');
    } else {
      const { error } = await db().from('tenant_spouses').insert(spouse);

      if (error) handleServiceError(error, 'Erro ao cadastrar cônjuge');
    }
  },

  async delete(tenantId: string): Promise<void> {
    const { error } = await db().from('tenant_spouses').delete().eq('tenant_id', tenantId);

    if (error) handleServiceError(error, 'Erro ao remover cônjuge');
  },
};
