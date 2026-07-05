import { supabase } from '../lib/supabase';
import type { DbSupportTicket, DbSupportMessage, SupportTicketStatus } from '../types/messages';

export interface SupportTicket {
  id: string;
  user_id: string;
  assigned_to?: string;
  category: string;
  priority: string;
  status: SupportTicketStatus;
  subject: string;
  description: string;
  created_at: string;
  updated_at: string;
  assignee?: { name: string };
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: 'user' | 'admin' | 'system';
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: { id: string; name: string | null; avatar_url: string | null } | null;
}

function mapTicket(raw: DbSupportTicket): SupportTicket {
  return {
    id: raw.id,
    user_id: raw.user_id || '',
    assigned_to: raw.assigned_to || undefined,
    category: raw.category || '',
    priority: raw.priority,
    status: raw.status as SupportTicketStatus,
    subject: raw.subject,
    description: '',
    created_at: raw.created_at || '',
    updated_at: raw.updated_at || '',
  };
}

function mapMessage(raw: DbSupportMessage): SupportMessage {
  return {
    id: raw.id,
    ticket_id: raw.ticket_id || '',
    sender_id: raw.sender_id || '',
    sender_role: raw.sender_role as 'user' | 'admin' | 'system',
    content: raw.content,
    created_at: raw.created_at || '',
    is_read: raw.is_read || false,
  };
}

export const supportService = {
  async getTickets(userId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(
        `
        *,
        assignee:profiles!support_tickets_assigned_to_fkey(id, name)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching support tickets:', error);
      throw error;
    }

    return ((data || []) as unknown as DbSupportTicket[]).map(mapTicket);
  },

  async createTicket(ticket: {
    user_id: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
  }): Promise<SupportTicket> {
    const { data: ticketData, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: ticket.user_id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: 'Aberto',
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating support ticket:', ticketError);
      throw ticketError;
    }

    const { error: msgError } = await supabase.from('support_messages').insert({
      ticket_id: ticketData.id,
      sender_id: ticket.user_id,
      sender_role: 'user',
      content: ticket.description,
      is_read: false,
    });

    if (msgError) {
      console.error('Error creating first support message:', msgError);
    }

    return mapTicket(ticketData as unknown as DbSupportTicket);
  },

  async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
    const { data, error } = await supabase
      .from('support_messages')
      .select(
        `
        *,
        sender:profiles(id, name, avatar_url)
      `
      )
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching ticket messages:', error);
      throw error;
    }

    return ((data || []) as unknown as DbSupportMessage[]).map(mapMessage);
  },

  async sendTicketMessage(
    ticketId: string,
    senderId: string,
    content: string
  ): Promise<SupportMessage> {
    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_role: 'user',
        content,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending support message:', error);
      throw error;
    }

    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return mapMessage(data as unknown as DbSupportMessage);
  },

  async markMessagesAsRead(ticketId: string): Promise<void> {
    const { error } = await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('ticket_id', ticketId)
      .eq('sender_role', 'admin')
      .eq('is_read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  },
};
