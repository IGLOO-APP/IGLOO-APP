export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: 'user' | 'subscription' | 'property' | 'payment' | 'system';
  target_id?: string;
  changes?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    before: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    after: any;
    reason?: string;
  };
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  owner_id: string;
  assigned_admin_id?: string;
  category: 'billing' | 'technical' | 'feature_request' | 'bug' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  subject: string;
  description: string;
  attachments?: string[];
  resolution_notes?: string;
  rating?: number;
  created_at: string;
  resolved_at?: string;
  closed_at?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  attachments?: string[];
  is_internal_note: boolean;
  created_at: string;
}

export interface SystemAnnouncement {
  id: string;
  created_by_admin_id?: string | null;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance' | 'feature';
  target_audience: 'all' | 'free_users' | 'paid_users' | 'specific_plan';
  is_active: boolean;
  show_until?: string;
  created_at: string;
}

export type AnnouncementTargetType = 'all' | 'property' | 'condominium' | 'individual';
export type AnnouncementType = 'maintenance' | 'event' | 'warning' | 'info';

export interface OwnerAnnouncement {
  id: string;
  owner_id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  target_type: AnnouncementTargetType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target_value?: any;
  attachments?: string[];
  views_count?: number;
  expires_at?: string;
  is_urgent?: boolean;
  created_at: string;
  acknowledged?: boolean; // UI helper
}

export interface AnnouncementAcknowledgment {
  id: string;
  announcement_id: string;
  user_id: string;
  created_at: string;
}

export interface GlobalStats {
  active_owners: number;
  active_tenants: number;
  total_properties: number;
  mrr: number;
  arr: number;
  churn_rate: number;
  nps: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  is_active: boolean;
  created_at?: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  target_audience: 'all' | 'beta' | 'internal' | 'none';
}
