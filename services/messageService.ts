import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'tenant' | 'system';
  time: string;
  isRead: boolean;
  type?: 'text' | 'image' | 'status_update' | 'system';
}

export interface ChatThread {
  id: string;
  dbId: string; // The UUID in the database
  tenantName: string;
  tenantAvatar?: string;
  property: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  category: 'maintenance' | 'finance' | 'general';
  ticket?: {
    id: string;
    title: string;
    category: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    images: string[];
  };
  messages: ChatMessage[];
}

export const messageService = {
  async getChats(): Promise<ChatThread[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const userId = userData.user.id;

    // 1. Fetch Maintenance Chats
    const { data: maintenanceRes } = await supabase
      .from('maintenance_requests')
      .select('*, properties(name), profiles:tenant_id(name, avatar_url)')
      .order('updated_at', { ascending: false });

    // 2. Fetch General/Finance Chats
    const { data: conversationsRes } = await supabase
      .from('conversations')
      .select('*, properties(name), profiles:tenant_id(name, avatar_url)')
      .order('last_message_at', { ascending: false });

    const chats: ChatThread[] = [];

    // Map Maintenance
    if (maintenanceRes) {
      for (const req of maintenanceRes) {
        // Fetch last message for this request
        const { data: lastMsg } = await supabase
          .from('maintenance_messages')
          .select('*')
          .eq('request_id', req.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        chats.push({
          id: `maint_${req.id}`,
          dbId: req.id,
          tenantName: (req.profiles as any)?.name || 'Inquilino',
          tenantAvatar: (req.profiles as any)?.avatar_url,
          property: (req.properties as any)?.name || 'Imóvel',
          lastMessage: lastMsg?.content || 'Chamado aberto',
          lastMessageTime: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recém',
          unreadCount: 0, // Logic for unread could be added later
          category: 'maintenance',
          ticket: {
            id: `#REQ-${req.id.slice(0, 4).toUpperCase()}`,
            title: req.title,
            category: req.category || 'Geral',
            description: req.description || '',
            status: req.status as any,
            priority: req.priority as any,
            images: req.images || [],
          },
          messages: [], // Will be fetched on demand
        });
      }
    }

    // Map General/Finance
    if (conversationsRes) {
      for (const conv of conversationsRes) {
        chats.push({
          id: `conv_${conv.id}`,
          dbId: conv.id,
          tenantName: (conv.profiles as any)?.name || 'Inquilino',
          tenantAvatar: (conv.profiles as any)?.avatar_url,
          property: (conv.properties as any)?.name || 'Geral',
          lastMessage: conv.last_message || 'Início da conversa',
          lastMessageTime: new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unreadCount: conv.unread_count_owner || 0,
          category: conv.category as any,
          messages: [],
        });
      }
    }

    return chats;
  },

  async getMessages(threadId: string, category: string): Promise<ChatMessage[]> {
    const dbId = threadId.split('_')[1];
    const { data: userData } = await supabase.auth.getUser();
    const myId = userData.user?.id;

    if (category === 'maintenance') {
      const { data } = await supabase
        .from('maintenance_messages')
        .select('*')
        .eq('request_id', dbId)
        .order('created_at', { ascending: true });

      return (data || []).map(m => ({
        id: m.id,
        text: m.content,
        sender: m.sender_id === myId ? 'me' : m.sender_role === 'system' ? 'system' : 'tenant',
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true,
        type: m.type as any,
      }));
    } else {
      const { data } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', dbId)
        .order('created_at', { ascending: true });

      return (data || []).map(m => ({
        id: m.id,
        text: m.content,
        sender: m.sender_id === myId ? 'me' : m.sender_role === 'system' ? 'system' : 'tenant',
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: m.is_read,
        type: m.type as any,
      }));
    }
  },

  async sendMessage(threadId: string, category: string, text: string, type: 'text' | 'image' = 'text') {
    const dbId = threadId.split('_')[1];
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    if (category === 'maintenance') {
      return await supabase.from('maintenance_messages').insert({
        request_id: dbId,
        sender_id: userData.user.id,
        sender_role: 'owner',
        content: text,
        type,
      });
    } else {
      // Update last message in conversation
      await supabase.from('conversations').update({
        last_message: type === 'image' ? '📷 Imagem enviada' : text,
        last_message_at: new Date().toISOString(),
      }).eq('id', dbId);

      return await supabase.from('conversation_messages').insert({
        conversation_id: dbId,
        sender_id: userData.user.id,
        sender_role: 'owner',
        content: text,
        type,
      });
    }
  },

  async updateMaintenanceStatus(requestId: string, status: string) {
    return await supabase
      .from('maintenance_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);
  }
};
