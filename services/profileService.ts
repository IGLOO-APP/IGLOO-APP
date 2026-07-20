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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user_metadata?: Record<string, any>;
  }): Promise<Profile> {
    // 1. Check if profile exists by authenticated ID
    const existingById = await this.getById(user.id).catch(() => null);
    if (existingById) return existingById;

    // 2. Check if a placeholder profile exists with the same email
    // This happens when an owner pre-registers a tenant via the Tenants page.
    // The placeholder has a temporary UUID as `id`, so we need to migrate it
    // to the real Clerk auth ID.
    if (user.email) {
      const existingByEmail = await this.getByEmail(user.email);
      if (existingByEmail && existingByEmail.id !== user.id) {
        // Use the atomic RPC function to handle the profile migration.
        // This handles FK constraints across all tables (contracts, conversations, etc.)
        const { data: claimResult, error: claimError } = await supabase.rpc(
          'claim_tenant_profile',
          {
            p_old_id: existingByEmail.id,
            p_new_id: user.id,
            p_name: user.user_metadata?.name || null,
            p_avatar_url: user.user_metadata?.avatar_url || null,
          }
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!claimError && claimResult && !(claimResult as any).error) {
          return claimResult as unknown as Profile;
        }

        console.warn(
          'RPC claim failed, will create fresh profile:',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          claimError || (claimResult as any)?.error
        );
      }
    }

    // 3. Create a brand new profile if none found
    // Admin emails carregados da variável de ambiente (nunca hardcoded no bundle)
    const adminEmailsRaw = import.meta.env.VITE_ADMIN_EMAILS || '';
    const ADMIN_EMAILS = adminEmailsRaw
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean);
    const isAdminEmail = user.email && ADMIN_EMAILS.includes(user.email);

    const payload: ProfileInsert = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
      role: isAdminEmail ? 'admin' : user.user_metadata?.role || 'pending',
      admin_type: isAdminEmail ? 'super' : null,
      phone: user.user_metadata?.phone || user.phone || null,
      is_pending: !isAdminEmail && !user.user_metadata?.role,
    };

    const { data: created, error: createError } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      throw createError;
    }

    return created;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id: string, updates: any): Promise<Profile> {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateByEmail(email: string, updates: any): Promise<void> {
    const { error } = await supabase.from('profiles').update(updates).eq('email', email);

    if (error) {
      console.error('Error updating profile by email:', error);
      throw error;
    }
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
