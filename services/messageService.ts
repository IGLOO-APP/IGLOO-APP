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

  async sendMessage(threadId: string, category: string, text: string, type: 'text' | 'image' | 'system' = 'text') {
    try {
      const dbId = threadId.split('_')[1];
      
      // 1. Get owner_id from the specific thread
      let ownerId: string;
      if (category === 'maintenance') {
        const { data } = await supabase.from('maintenance_requests').select('owner_id').eq('id', dbId).single();
        ownerId = data?.owner_id;
      } else {
        const { data } = await supabase.from('conversations').select('owner_id').eq('id', dbId).single();
        ownerId = data?.owner_id;
      }

      if (!ownerId) throw new Error('Não foi possível identificar o proprietário desta conversa.');

      if (category === 'maintenance') {
        return await supabase.from('maintenance_messages').insert({
          request_id: dbId,
          sender_id: ownerId,
          sender_role: 'owner',
          content: text,
          type,
        });
      } else {
        // Update last message info in parallel
        supabase.from('conversations').update({
          last_message: type === 'image' ? '📷 Imagem enviada' : text,
          last_message_at: new Date().toISOString(),
        }).eq('id', dbId).then();

        return await supabase.from('conversation_messages').insert({
          conversation_id: dbId,
          sender_id: ownerId,
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
      // Fetch tenants from both sources simultaneously
      // We don't filter by owner_id here because RLS (Row Level Security) 
      // already handles this based on the authenticated session token.
      const [convRes, contractRes] = await Promise.all([
        supabase
          .from('conversations')
          .select(`
            tenant_id,
            profiles:tenant_id(id, name, avatar_url, email)
          `),
        supabase
          .from('contracts')
          .select(`
            tenant_id,
            profiles:tenant_id(id, name, avatar_url, email)
          `)
      ]);

      const tenantMap = new Map();

      // Merge results from both sources
      const allSources = [...(convRes.data || []), ...(contractRes.data || [])];
      
      allSources.forEach(item => {
        if (item.profiles && !tenantMap.has(item.profiles.id)) {
          tenantMap.set(item.profiles.id, item.profiles);
        }
      });

      return Array.from(tenantMap.values());
    } catch (err) {
      console.error('Critical error in listTenantsForMessaging:', err);
      return [];
    }
  },

  async getOrCreateConversation(tenantId: string) {
    try {
      // 1. Get owner_id from an existing contract with this tenant
      // This is necessary because Supabase Auth might not return the user object 
      // directly when using Clerk, but RLS allows us to see our own contracts.
      const { data: contract } = await supabase
        .from('contracts')
        .select('owner_id')
        .eq('tenant_id', tenantId)
        .limit(1)
        .single();

      if (!contract) throw new Error('Não foi possível encontrar um contrato com este inquilino para iniciar a conversa.');
      const ownerId = contract.owner_id;

      // 2. Check if a general conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('owner_id', ownerId)
        .eq('tenant_id', tenantId)
        .eq('category', 'general')
        .single();

      if (existing) return `conv_${existing.id}`;

      // 3. Create new conversation if not found
      const { data: created, error } = await supabase
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

      if (error) throw error;
      return `conv_${created.id}`;
    } catch (err) {
      console.error('Error in getOrCreateConversation:', err);
      throw err;
    }
  }
};
