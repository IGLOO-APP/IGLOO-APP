import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'tenant' | 'system';
  time: string;
  isRead: boolean;
  type?: 'text' | 'image' | 'status_update' | 'system';
  created_at?: string;
}

export interface ChatThread {
  id: string;
  dbId: string;
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
  hasMore?: boolean;
}

export const messageService = {
  async getChats(): Promise<ChatThread[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

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
          unreadCount: 0,
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
          messages: [],
          hasMore: true,
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
          hasMore: true,
        });
      }
    }

    return chats;
  },

  async getMessages(threadId: string, category: string, limit = 20, offset = 0) {
    const dbId = threadId.split('_')[1];
    let query;

    if (category === 'maintenance') {
      query = supabase
        .from('maintenance_messages')
        .select('*')
        .eq('request_id', dbId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    } else {
      query = supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', dbId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    const messages = (data || []).map((m: any) => ({
      id: m.id,
      text: m.content,
      sender: m.sender_role === 'owner' ? 'me' : m.sender_role === 'system' ? 'system' : 'tenant',
      time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: m.is_read || true,
      type: m.type || 'text',
      created_at: m.created_at
    }));

    return messages.reverse();
  },

  async sendMessage(threadId: string, category: string, text: string, type: 'text' | 'image' | 'system' = 'text') {
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

  async uploadFile(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `messages/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    return data.publicUrl;
  },

  async updateMaintenanceStatus(requestId: string, status: string) {
    return await supabase
      .from('maintenance_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);
  },

  async markAsRead(threadId: string) {
    const [type, dbId] = threadId.split('_');
    if (type === 'conv') {
      await supabase
        .from('conversations')
        .update({ unread_count_owner: 0 })
        .eq('id', dbId);
        
      await supabase
        .from('conversation_messages')
        .update({ is_read: true })
        .eq('conversation_id', dbId)
        .eq('sender_role', 'tenant');
    }
  },

  async listTenantsForMessaging() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    // Fetch tenants linked to this owner through properties/contracts
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, email')
      .eq('role', 'tenant');
      
    if (error) throw error;
    return data;
  },

  async getOrCreateConversation(tenantId: string) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    // 1. Check if exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('owner_id', userData.user.id)
      .eq('tenant_id', tenantId)
      .single();

    if (existing) return `conv_${existing.id}`;

    // 2. Create if not
    const { data: created, error } = await supabase
      .from('conversations')
      .insert({
        owner_id: userData.user.id,
        tenant_id: tenantId,
        category: 'general',
        last_message: 'Início da conversa',
        last_message_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return `conv_${created.id}`;
  }
};
