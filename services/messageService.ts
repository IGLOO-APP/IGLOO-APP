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
  tenantEmail?: string;
  tenantPhone?: string;
  property: string;
  propertyImage?: string;
  propertyValue?: number;
  propertyUnit?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  category: 'maintenance' | 'finance' | 'general';
  paymentDay?: number;
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
    try {
      // 1. Fetch Maintenance Chats (No join to profiles to avoid RLS/FK errors)
      const { data: maintenanceRes, error: maintError } = await supabase
        .from('maintenance_requests')
        .select('*, properties(id, name, image_url, price)')
        .order('updated_at', { ascending: false });

      if (maintError) console.error('Error fetching maintenance chats:', maintError);

      // 2. Fetch General/Finance Chats
      const { data: conversationsRes, error: convError } = await supabase
        .from('conversations')
        .select('*, properties(id, name, image_url, price)')
        .order('last_message_at', { ascending: false });

      if (convError) console.error('Error fetching general chats:', convError);

      // 3. Fetch Profiles for all unique tenants found
      const tenantIds = new Set<string>();
      [...(maintenanceRes || []), ...(conversationsRes || [])].forEach(r => {
        if (r.tenant_id) tenantIds.add(r.tenant_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, email, phone')
        .in('id', Array.from(tenantIds));

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

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

        const prop = req.properties as any;
        const profile = profileMap.get(req.tenant_id);

        chats.push({
          id: `maint_${req.id}`,
          dbId: req.id,
          tenantName: profile?.name || 'Inquilino',
          tenantAvatar: profile?.avatar_url,
          tenantEmail: profile?.email,
          tenantPhone: profile?.phone,
          property: prop?.name || 'Imóvel',
          propertyImage: prop?.image_url,
          propertyValue: prop?.price,
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
        const prop = conv.properties as any;
        const profile = profileMap.get(conv.tenant_id);

        chats.push({
          id: `conv_${conv.id}`,
          dbId: conv.id,
          tenantName: profile?.name || 'Inquilino',
          tenantAvatar: profile?.avatar_url,
          tenantEmail: profile?.email,
          tenantPhone: profile?.phone,
          property: prop?.name || 'Geral',
          propertyImage: prop?.image_url,
          propertyValue: prop?.price,
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
    } catch (err) {
      console.error('Error in getChats:', err);
      return [];
    }
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

  async sendMessage(threadId: string, category: string, text: string, userId: string, type: 'text' | 'image' | 'system' = 'text') {
    try {
      const dbId = threadId.split('_')[1];

      // userId is the Clerk user ID passed explicitly from the component
      // (supabase.auth.getSession() is always null in the Clerk integration)
      if (!userId) throw new Error('Usuário não autenticado. Faça login novamente.');

      if (category === 'maintenance') {
        return await supabase.from('maintenance_messages').insert({
          request_id: dbId,
          sender_id: userId,
          sender_role: 'owner',
          content: text,
          type,
        });
      } else {
        // Update last message metadata in parallel (fire and forget)
        supabase.from('conversations').update({
          last_message: type === 'image' ? '📷 Imagem enviada' : text,
          last_message_at: new Date().toISOString(),
        }).eq('id', dbId).then();

        return await supabase.from('conversation_messages').insert({
          conversation_id: dbId,
          sender_id: userId,
          sender_role: 'owner',
          content: text,
          type,
        });
      }
    } catch (err) {
      console.error('Critical error sending message:', err);
      throw err;
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
    try {
      // Use contracts as the source of truth for tenants.
      // Fetch profiles directly to avoid RLS join issues on conversations.
      const { data: contractData, error } = await supabase
        .from('contracts')
        .select('tenant_id')
        .not('tenant_id', 'is', null);

      if (error) {
        console.error('Error fetching contracts for tenant list:', error);
        return [];
      }

      const tenantIds = [...new Set((contractData || []).map(c => c.tenant_id))];
      if (tenantIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, email')
        .in('id', tenantIds);

      if (profilesError) {
        console.error('Error fetching tenant profiles:', profilesError);
        return [];
      }

      return profiles || [];
    } catch (err) {
      console.error('Critical error in listTenantsForMessaging:', err);
      return [];
    }
  },

  async getOrCreateConversation(tenantId: string, ownerId: string) {
    try {
      // ownerId is the Clerk user ID passed explicitly from the component.
      // supabase.auth.getSession() always returns null in the Clerk integration,
      // so we never call it here.
      if (!ownerId) throw new Error('ID do proprietário não informado.');

      // 1. Check if a general conversation already exists between owner and tenant
      const { data: existing, error: selectError } = await supabase
        .from('conversations')
        .select('id')
        .eq('owner_id', ownerId)
        .eq('tenant_id', tenantId)
        .eq('category', 'general')
        .maybeSingle();

      if (selectError) {
        console.error('Error checking existing conversation:', selectError);
        throw selectError;
      }

      if (existing) return `conv_${existing.id}`;

      // 2. Create new conversation if not found
      const { data: created, error: insertError } = await supabase
        .from('conversations')
        .insert({
          owner_id: ownerId,
          tenant_id: tenantId,
          category: 'general',
          last_message: 'Início da conversa',
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      return `conv_${created.id}`;
    } catch (err) {
      console.error('Error in getOrCreateConversation:', err);
      throw err;
    }
  }
};
