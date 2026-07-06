import { supabase } from '../lib/supabase';
import { FeatureFlag } from '../types';

export const featureFlagService = {
  async getAll(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feature flags:', error);
      return [];
    }
    return data as FeatureFlag[];
  },

  async create(name: string, description: string): Promise<void> {
    const { error } = await supabase.from('feature_flags').insert({
      name,
      description,
      enabled: false,
      target_audience: 'all',
    });

    if (error) throw error;
  },

  async toggle(id: string, enabled: boolean): Promise<void> {
    const { error } = await supabase.from('feature_flags').update({ enabled }).eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('feature_flags').delete().eq('id', id);

    if (error) throw error;
  },
};
