export type MessageSender = 'me' | 'tenant' | 'system';
export type MessageType = 'text' | 'image' | 'status_update' | 'system';
export type ChatCategory = 'maintenance' | 'finance' | 'general' | 'support';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type SupportTicketStatus = 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Fechado';
export type SupportTicketPriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  time: string;
  isRead: boolean;
  type?: MessageType;
  created_at?: string;
  isSupport?: boolean;
  requestId?: string;
}

export interface TicketInfo {
  id: string;
  title: string;
  category: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  images: string[];
  realId: string;
}

export interface ChatThread {
  id: string;
  dbId: string;
  tenantName: string;
  tenantAvatar?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  property: string;
  propertyImage?: string;
  propertyValue?: number;
  propertyUnit?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  category: ChatCategory;
  paymentDay?: number;
  ticket?: TicketInfo;
  messages: ChatMessage[];
  hasMore?: boolean;
}

export interface DbMaintenanceRequest {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  images: string[];
  updated_at: string;
  created_at: string;
  properties: { id: string; name: string; image_url: string | null; price: number };
}

export interface DbConversation {
  id: string;
  tenant_id: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count_owner: number | null;
  category: string | null;
  owner_id: string | null;
  properties: { id: string; name: string; image_url: string | null; price: number };
}

export interface DbMaintenanceMessage {
  id: string;
  content: string;
  created_at: string | null;
  request_id: string;
  sender_id: string;
  sender_role: string | null;
  type: string | null;
  url: string | null;
}

export interface DbConversationMessage {
  id: string;
  content: string;
  conversation_id: string | null;
  created_at: string;
  is_read: boolean | null;
  sender_id: string | null;
  sender_role: string | null;
  type: string | null;
}

export interface DbSupportMessage {
  id: string;
  content: string;
  created_at: string | null;
  is_read: boolean | null;
  sender_id: string | null;
  sender_role: string;
  ticket_id: string | null;
}

export interface DbSupportTicket {
  id: string;
  user_id: string | null;
  assigned_to: string | null;
  category: string | null;
  priority: string;
  status: string;
  subject: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface DbFAQ {
  id: string;
  answer: string;
  created_at: string;
  is_active: boolean | null;
  order: number | null;
  question: string;
}

export interface SupportMessageWithMeta extends DbSupportMessage {
  ticketSubject?: string;
  ticketId?: string;
}
