import { supabase } from '../../lib/supabase';
import type { Guarantor } from '../../types';
import { handleServiceError } from '../../lib/utils';

const db = () => supabase as any;

export const guarantorService = {
  async getByTenant(tenantId: string): Promise<Guarantor | null> {
    const { data, error } = await db()
      .from('guarantors')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle();

    if (error) {
      handleServiceError(error, 'Erro ao buscar fiador');
    }

    return data as Guarantor | null;
  },

  async upsert(guarantor: Omit<Guarantor, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const existing = await db()
      .from('guarantors')
      .select('id')
      .eq('tenant_id', guarantor.tenant_id)
      .maybeSingle();

    if ((existing as any).data) {
      const { error } = await db()
        .from('guarantors')
        .update({ ...guarantor, updated_at: new Date().toISOString() })
        .eq('id', (existing as any).data.id);

      if (error) handleServiceError(error, 'Erro ao atualizar fiador');
    } else {
      const { error } = await db().from('guarantors').insert(guarantor);

      if (error) handleServiceError(error, 'Erro ao cadastrar fiador');
    }
  },

  async updateStatus(id: string, status: 'aprovado' | 'reprovado'): Promise<void> {
    const { error } = await db()
      .from('guarantors')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) handleServiceError(error, 'Erro ao atualizar status do fiador');
  },

  async delete(tenantId: string): Promise<void> {
    const { error } = await db().from('guarantors').delete().eq('tenant_id', tenantId);

    if (error) handleServiceError(error, 'Erro ao remover fiador');
  },
};
