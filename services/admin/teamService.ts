import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { auditService } from './auditService';

export const teamService = {
  async getAdmins(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('name');
    if (error) throw error;
    return data as User[];
  },

  async createAdmin(email: string, name: string, adminType: string, permissions: string[]) {
    const { error } = await supabase.from('profiles').insert({
      id: crypto.randomUUID(),
      email,
      name,
      role: 'admin',
      admin_type: adminType,
      permissions,
      is_suspended: false,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
    await auditService.logActivity('invite_admin', 'system', email, { adminType, permissions });
  },

  async createOwner(email: string, name: string, phone: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: crypto.randomUUID(),
        email,
        name,
        phone,
        role: 'owner',
        is_suspended: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    await auditService.logActivity('manual_create_owner', 'user', data.id, { email, name });
    return data;
  },

  async removeAdmin(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'tenant', admin_type: null, permissions: [] })
      .eq('id', userId);
    if (error) throw error;
    await auditService.logActivity('remove_admin_access', 'user', userId);
  },
};
