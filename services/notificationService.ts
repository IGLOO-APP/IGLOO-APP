import { supabase } from '../lib/supabase';

export interface NotificationPrefs {
  email_alerts: boolean;
  sms_alerts: boolean;
  payment_received: boolean;
  late_payment: boolean;
  maintenance_updates: boolean;
  payment_reminders: boolean;
  new_messages: boolean;
  announcements: boolean;
}

const DEFAULTS: NotificationPrefs = {
  email_alerts: true,
  sms_alerts: false,
  payment_received: true,
  late_payment: true,
  maintenance_updates: true,
  payment_reminders: true,
  new_messages: true,
  announcements: false,
};

type DbRow = Record<string, unknown>;

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
};

export const notificationService = {
  async get(userId: string): Promise<NotificationPrefs> {
    const { data, error } = await (supabase.from as any)('notification_prefs')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return DEFAULTS;
    const d = data as DbRow;
    return {
      email_alerts: (d.email_alerts as boolean) ?? DEFAULTS.email_alerts,
      sms_alerts: (d.sms_alerts as boolean) ?? DEFAULTS.sms_alerts,
      payment_received: (d.payment_received as boolean) ?? DEFAULTS.payment_received,
      late_payment: (d.late_payment as boolean) ?? DEFAULTS.late_payment,
      maintenance_updates: (d.maintenance_updates as boolean) ?? DEFAULTS.maintenance_updates,
      payment_reminders: (d.payment_reminders as boolean) ?? DEFAULTS.payment_reminders,
      new_messages: (d.new_messages as boolean) ?? DEFAULTS.new_messages,
      announcements: (d.announcements as boolean) ?? DEFAULTS.announcements,
    };
  },

  async save(userId: string, prefs: Partial<NotificationPrefs>): Promise<void> {
    const { error } = await (supabase.from as any)('notification_prefs').upsert(
      { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

    if (error) throw error;
  },

  async getNotifications(userId: string): Promise<NotificationRow[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[notificationService] Error fetching notifications:', error);
      return [];
    }
    return (data || []) as unknown as NotificationRow[];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);

    if (error) console.error('[notificationService] Error marking notification as read:', error);
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error)
      console.error('[notificationService] Error marking all notifications as read:', error);
  },
};
