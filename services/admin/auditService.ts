import { supabase } from '../../lib/supabase';

let _currentAdminId: string = 'system';

export const setCurrentAdminId = (id: string) => {
  _currentAdminId = id || 'system';
};

export const auditService = {
  async logActivity(
    action: string,
    targetType: string,
    targetId?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changes?: any,
    adminId?: string
  ) {
    await supabase.from('admin_activity_log').insert({
      admin_id: adminId || _currentAdminId,
      action,
      target_type: targetType,
      target_id: targetId,
      changes,
      user_agent: navigator.userAgent,
    });
  },

  async getRecentActivity(limit = 10) {
    const { data, error } = await supabase
      .from('admin_activity_log')
      .select(`*, admin:profiles!admin_id(name)`)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};
