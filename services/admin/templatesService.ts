import { supabase } from '../../lib/supabase';
import { auditService } from './auditService';

const fromTable = (table: string) =>
  (supabase.from as unknown as (t: string) => ReturnType<typeof supabase.from>)(table);

export const templatesService = {
  async getContractTemplate(
    id: string
  ): Promise<{ id: string; name: string; content: string } | null> {
    const { data, error } = await fromTable('contract_templates').select('*').eq('id', id).single();
    if (error) {
      console.warn('Error fetching contract template:', error);
      return null;
    }
    return data as { id: string; name: string; content: string } | null;
  },

  async saveContractTemplate(id: string, name: string, content: string): Promise<void> {
    const { error } = await fromTable('contract_templates').upsert({
      id,
      name,
      content,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error('Error saving contract template:', error);
      throw error;
    }
    await auditService.logActivity('update_contract_template', 'contract_template', id, { name });
  },
};
