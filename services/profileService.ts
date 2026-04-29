import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export const profileService = {
  async getById(id: string): Promise<Profile | null> {
    // Dev Mode Fallback for mock IDs
    if (id === 'owner-123' || id === 'tenant-123' || id === 'admin-123') {
      return {
        id,
        email: id === 'owner-123' ? 'proprietario@teste.com' : id === 'tenant-123' ? 'inquilino@teste.com' : 'admin@teste.com',
        name: id === 'owner-123' ? 'Investidor Exemplo' : id === 'tenant-123' ? 'João Silva' : 'Super Admin',
        role: id === 'owner-123' ? 'owner' : id === 'tenant-123' ? 'tenant' : 'admin',
        avatar_url: id === 'owner-123' 
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwRIAHlgLaW6OqzLEr6KH9kj4TGcypVin8vG0nCnlg_EiRsv3e561_S0pU6gWh-_QTbZSo1wTTeTa1eUzsn3qDoV7F2ZkeYhUXC1qQ693w1T_qhEMSRNparuohwnqCxmtjp1WP7yfrOyV41z5DUDYQWtT2DN2BOuEvt-l4Zme5iHAST-ZPnDLEWyZDtU3KB7inrHYdgFQW0i41SlR9Gu26TEHY7zIfA7Yz2Y6_85c20Atg3MSIoA-q5EdHHyFckC73eced5eTGvEg3'
          : id === 'tenant-123'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf'
          : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile;
    }

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
        console.log('Claiming existing profile for email:', user.email, '| Old ID:', existingByEmail.id, '| New ID:', user.id);
        
        // Strategy: Create new profile with the auth ID, copying role & data 
        // from the placeholder. We cannot UPDATE a primary key in Supabase,
        // so we insert a new row and delete the old one.
        const claimedPayload: ProfileInsert = {
          id: user.id,
          email: existingByEmail.email,
          name: existingByEmail.name || user.user_metadata?.name || user.email.split('@')[0],
          role: existingByEmail.role, // CRITICAL: Preserve the tenant role!
          avatar_url: user.user_metadata?.avatar_url || existingByEmail.avatar_url,
          phone: user.user_metadata?.phone || user.phone || existingByEmail.phone,
          property_id: (existingByEmail as any).property_id,
        };

        const { data: claimed, error: claimError } = await supabase
          .from('profiles')
          .upsert(claimedPayload, { onConflict: 'id' })
          .select()
          .single();

        if (!claimError && claimed) {
          // Clean up the old placeholder profile
          await supabase
            .from('profiles')
            .delete()
            .eq('id', existingByEmail.id);
          
          console.log('Profile claimed successfully. Role:', claimed.role);
          return claimed;
        }

        console.warn('Failed to claim profile, will create fresh:', claimError);
      }
    }

    // 3. Create a brand new profile if none found
    const payload: ProfileInsert = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
      role: user.user_metadata?.role || 'owner',
      phone: user.user_metadata?.phone || user.phone || null,
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
