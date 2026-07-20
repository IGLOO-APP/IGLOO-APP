import { supabase } from '../../lib/supabase';

export const adminAnnouncementsService = {
  async getAnnouncements() {
    try {
      const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const totalViews = data?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
      const totalClicks = data?.reduce((acc, curr) => acc + (curr.clicks || 0), 0) || 0;
      return {
        list: data || [],
        stats: {
          total_views: totalViews,
          total_clicks: totalClicks,
          ctr: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0',
        },
      };
    } catch (err) {
      console.warn('Erro ao carregar comunicados:', err);
      return { list: [], stats: { total_views: 0, total_clicks: 0, ctr: '0.0' } };
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createAnnouncement(announcement: any, adminId = '') {
    const { data, error } = await supabase
      .from('system_announcements')
      .insert({ ...announcement, created_by_admin_id: adminId });
    if (error) throw error;
    return data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateAnnouncement(id: string, updates: any) {
    const { data, error } = await supabase
      .from('system_announcements')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('system_announcements').delete().eq('id', id);
    if (error) throw error;
  },
};
