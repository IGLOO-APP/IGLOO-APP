import { supabase } from '../../lib/supabase';

export const ticketsService = {
  async getTickets() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(
        `*, user:profiles!support_tickets_user_id_fkey(id, name, email, avatar_url), assignee:profiles!support_tickets_assigned_to_fkey(id, name)`
      )
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getTicketMessages(ticketId: string) {
    const { data, error } = await supabase
      .from('support_messages')
      .select(`*, sender:profiles(id, name, avatar_url)`)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async sendTicketMessage(ticketId: string, senderId: string, role: string, content: string) {
    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_role: role,
        content,
        is_read: false,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTicketStatus(ticketId: string, status: string) {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId);
    if (error) throw error;

    const statusMessages: Record<string, string> = {
      Resolvido: 'Chamado resolvido pelo administrador',
      Fechado: 'Chamado encerrado pelo administrador',
      Pendente: 'Chamado reaberto para atendimento',
      'Em Andamento': 'Chamado em andamento',
    };
    const systemContent = statusMessages[status];
    if (systemContent) {
      await supabase.from('support_messages').insert({
        ticket_id: ticketId,
        sender_id: null,
        sender_role: 'system',
        content: systemContent,
        is_read: true,
      });
    }
  },

  async assignTicket(ticketId: string, adminId: string | null) {
    const { error } = await supabase
      .from('support_tickets')
      .update({ assigned_to: adminId, updated_at: new Date().toISOString() })
      .eq('id', ticketId);
    if (error) throw error;
  },

  async createTicket(ticket: {
    owner_id: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
  }) {
    const { data: ticketData, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: ticket.owner_id,
        subject: ticket.subject,
        category: ticket.category,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        priority: ticket.priority as any,
        status: 'Aberto',
      })
      .select()
      .single();
    if (ticketError) throw ticketError;

    const { error: msgError } = await supabase.from('support_messages').insert({
      ticket_id: ticketData.id,
      sender_id: ticket.owner_id,
      sender_role: 'user',
      content: ticket.description,
      is_read: false,
    });
    if (msgError) console.error('Error creating first support message:', msgError);
    return ticketData;
  },
};
