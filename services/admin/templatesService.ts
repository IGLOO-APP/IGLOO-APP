import { supabase } from '../../lib/supabase';
import { auditService } from './auditService';

export const templatesService = {
  async getContractTemplate(
    id: string
  ): Promise<{ id: string; name: string; content: string } | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('contract_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.warn('Error fetching contract template:', error);
      return null;
    }
    return data as { id: string; name: string; content: string } | null;
  },

  async saveContractTemplate(id: string, name: string, content: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('contract_templates')
      .upsert({ id, name, content, updated_at: new Date().toISOString() });
    if (error) {
      console.error('Error saving contract template:', error);
      throw error;
    }
    await auditService.logActivity('update_contract_template', 'contract_template', id, { name });
  },
};
