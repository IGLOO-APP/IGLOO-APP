import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    if (localStorage.getItem('igloo_dev_session')) {
      return [
        {
          id: 'n1',
          user_id: userId,
          title: 'Bem-vindo ao Igloo',
          message: 'Seu painel está configurado e pronto para uso.',
          type: 'system',
          is_read: false,
          link: null,
          created_at: new Date().toISOString(),
        },
      ] as any[];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) console.error('Error marking notification as read:', error);
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) console.error('Error marking all as read:', error);
  },

  // Function to simulate sending a notification (useful for testing Realtime)
  async sendMockNotification(
    userId: string,
    title: string,
    message: string,
    type: 'system' | 'payment' | 'maintenance' = 'system'
  ) {
    return await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
    });
  },
};
