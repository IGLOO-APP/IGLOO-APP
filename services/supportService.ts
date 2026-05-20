import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export interface SupportTicket {
  id: string;
  user_id: string;
  assigned_to?: string;
  category: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Fechado';
  subject: string;
  description: string;
  created_at: string;
  updated_at: string;
  assignee?: {
    name: string;
  };
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: 'user' | 'admin' | 'system';
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export const supportService = {
  async getTickets(userId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        assignee:profiles!support_tickets_assigned_to_fkey(id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching support tickets:', error);
      throw error;
    }
    return data as any[];
  },

  async createTicket(ticket: {
    user_id: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
  }): Promise<SupportTicket> {
    // 1. Criar o chamado na tabela support_tickets (sem a coluna description)
    const { data: ticketData, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: ticket.user_id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority as any,
        status: 'Aberto'
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating support ticket:', ticketError);
      throw ticketError;
    }

    // 2. Inserir a descrição do chamado como a primeira mensagem em support_messages
    const { error: msgError } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketData.id,
        sender_id: ticket.user_id,
        sender_role: 'user',
        content: ticket.description,
        is_read: false
      });

    if (msgError) {
      console.error('Error creating first support message:', msgError);
    }

    return ticketData as any;
  },

  async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
    const { data, error } = await supabase
      .from('support_messages')
      .select(`
        *,
        sender:profiles(id, name, avatar_url)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching ticket messages:', error);
      throw error;
    }
    return data as any[];
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
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending support message:', error);
      throw error;
    }

    // Update the updated_at timestamp of the ticket to trigger updates
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return data as any;
  },

  async markMessagesAsRead(ticketId: string): Promise<void> {
    // Mark messages sent by admins as read by the user
    const { error } = await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('ticket_id', ticketId)
      .eq('sender_role', 'admin')
      .eq('is_read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  }
};
