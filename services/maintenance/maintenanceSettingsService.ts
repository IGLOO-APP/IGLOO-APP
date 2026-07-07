import { supabase } from '../../lib/supabase';

export interface MaintenanceCategoryDb {
  id: string;
  user_id: string;
  category: string;
  enabled: boolean;
}

export const maintenanceSettingsService = {
  async getAll(userId: string): Promise<MaintenanceCategoryDb[]> {
    const { data, error } = await (supabase.from as any)('maintenance_settings')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data as MaintenanceCategoryDb[];
  },

  async upsert(userId: string, category: string, enabled: boolean): Promise<void> {
    const { error } = await (supabase.from as any)('maintenance_settings').upsert(
      {
        user_id: userId,
        category,
        enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,category' }
    );

    if (error) throw error;
  },

  async saveBatch(
    userId: string,
    categories: { category: string; enabled: boolean }[]
  ): Promise<void> {
    const records = categories.map((c) => ({
      user_id: userId,
      category: c.category,
      enabled: c.enabled,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await (supabase.from as any)('maintenance_settings').upsert(records, {
      onConflict: 'user_id,category',
    });

    if (error) throw error;
  },
};
