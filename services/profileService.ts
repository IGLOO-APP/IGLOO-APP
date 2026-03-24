import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export const profileService = {
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  },

  async getByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('email', email).single();

    if (error) {
      console.error('Error fetching profile by email:', error);
      return null;
    }

    return data;
  },

  async ensureProfile(user: {
    id: string;
    email?: string;
    phone?: string;
    user_metadata?: Record<string, any>;
  }): Promise<Profile> {
    const existing = await this.getById(user.id).catch(() => null);
    if (existing) return existing;

    const payload: ProfileInsert = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
      role: user.user_metadata?.role || 'owner',
      phone: user.user_metadata?.phone || user.phone || null,
    };

    const { data, error } = await supabase.from('profiles').upsert(payload).select().single();

    if (error) {
      console.error('Error ensuring profile:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  },

  async getTenants(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'tenant')
      .order('name');

    if (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }

    return data;
  },

  async getOwners(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'owner')
      .order('name');

    if (error) {
      console.error('Error fetching owners:', error);
      throw error;
    }

    return data;
  },
};
