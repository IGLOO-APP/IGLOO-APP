import { supabase } from '../lib/supabase';
import type {
  ChatMessage,
  ChatThread,
  DbMaintenanceRequest,
  DbConversation,
  DbMaintenanceMessage,
  DbConversationMessage,
} from '../types/messages';

export type { ChatMessage, ChatThread };

export const messageService = {
  async getChats(): Promise<ChatThread[]> {
    try {
      const { data: maintenanceRes, error: maintError } = await supabase
        .from('maintenance_requests')
        .select('*, properties(id, name, image_url, price)')
        .order('updated_at', { ascending: false });

      if (maintError) console.error('Error fetching maintenance chats:', maintError);
      const maintenanceData = (maintenanceRes || []) as unknown as DbMaintenanceRequest[];

      const { data: conversationsRes, error: convError } = await supabase
        .from('conversations')
        .select('*, properties(id, name, image_url, price)')
        .order('last_message_at', { ascending: false });

      if (convError) console.error('Error fetching general chats:', convError);
      const conversationsData = (conversationsRes || []) as unknown as DbConversation[];

      const tenantIds = new Set<string>();
      [...maintenanceData, ...conversationsData].forEach((r) => {
        if (r.tenant_id) tenantIds.add(r.tenant_id);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, email, phone')
        .in('id', Array.from(tenantIds));

      const profileMap = new Map(profiles?.map((p) => [p.id, p]));
      const tenantThreads = new Map<string, ChatThread>();

      if (maintenanceRes) {
        for (const req of maintenanceRes) {
          if (!req.tenant_id) continue;
          const profile = profileMap.get(req.tenant_id);
          const prop = req.properties as unknown as {
            name: string;
            image_url: string | null;
            price: number;
          };

          if (!tenantThreads.has(req.tenant_id)) {
            tenantThreads.set(req.tenant_id, {
              id: `tenant_${req.tenant_id}`,
              dbId: req.tenant_id,
              tenantName: profile?.name || 'Inquilino',
              tenantAvatar: profile?.avatar_url || '',
              tenantEmail: profile?.email || '',
              tenantPhone: profile?.phone || '',
              property: prop?.name || 'Imóvel',
              propertyImage: prop?.image_url || '',
              propertyValue: prop?.price,
              lastMessage: 'Chamado aberto',
              lastMessageTime: new Date(req.updated_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              unreadCount: 0,
              category: 'maintenance',
              ticket: {
                id: `#REQ-${req.id.slice(0, 4).toUpperCase()}`,
                title: req.title,
                category: req.category || 'Geral',
                description: req.description || '',
                status: req.status as 'pending' | 'in_progress' | 'completed',
                priority: req.priority as 'low' | 'medium' | 'high' | 'urgent',
                images: req.images || [],
                realId: req.id,
              },
              messages: [],
              hasMore: true,
            });
          }
        }
      }

      if (conversationsRes) {
        for (const conv of conversationsRes) {
          if (!conv.tenant_id) continue;
          const existing = tenantThreads.get(conv.tenant_id);
          const prop = conv.properties as unknown as {
            name: string;
            image_url: string | null;
            price: number;
          };
          const profile = profileMap.get(conv.tenant_id);

          if (!existing) {
            tenantThreads.set(conv.tenant_id, {
              id: `tenant_${conv.tenant_id}`,
              dbId: conv.tenant_id,
              tenantName: profile?.name || 'Inquilino',
              tenantAvatar: profile?.avatar_url || '',
              tenantEmail: profile?.email || '',
              tenantPhone: profile?.phone || '',
              property: prop?.name || 'Geral',
              propertyImage: prop?.image_url || '',
              propertyValue: prop?.price,
              lastMessage: conv.last_message || 'Início da conversa',
              lastMessageTime: conv.last_message_at
                ? new Date(conv.last_message_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recém',
              unreadCount: conv.unread_count_owner || 0,
              category: (conv.category || 'general') as ChatThread['category'],
              messages: [],
              hasMore: true,
            });
          } else {
            if (
              !conv.last_message_at ||
              !existing.lastMessageTime ||
              new Date(conv.last_message_at) > new Date(existing.lastMessageTime)
            ) {
              existing.lastMessage = conv.last_message || existing.lastMessage;
              existing.lastMessageTime = conv.last_message_at
                ? new Date(conv.last_message_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : existing.lastMessageTime;
            }
            existing.unreadCount += conv.unread_count_owner || 0;
          }
        }
      }

      return Array.from(tenantThreads.values());
    } catch (err) {
      console.error('Error in getChats:', err);
      return [];
    }
  },

  async getMessages(
    threadId: string,
    category: string,
    limit = 50,
    offset = 0
  ): Promise<ChatMessage[]> {
    const tenantId = threadId.substring(threadId.indexOf('_') + 1);

    const { data: requests } = await supabase
      .from('maintenance_requests')
      .select('id, title')
      .eq('tenant_id', tenantId);

    const requestIds = (requests || []).map((r) => r.id);

    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('category', 'general');

    let maintMsgs: DbMaintenanceMessage[] = [];
    if (requestIds.length > 0) {
      const { data } = await supabase
        .from('maintenance_messages')
        .select('*')
        .in('request_id', requestIds)
        .order('created_at', { ascending: false });
      maintMsgs = (data || []) as DbMaintenanceMessage[];
    }

    let convMsgs: DbConversationMessage[] = [];
    if (conversations && conversations.length > 0) {
      const ids = conversations.map((c) => c.id);
      const { data } = await supabase
        .from('conversation_messages')
        .select('*')
        .in('conversation_id', ids)
        .order('created_at', { ascending: false });
      convMsgs = (data || []) as DbConversationMessage[];
    }

    const allRaw = [...maintMsgs, ...convMsgs].sort(
      (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );

    const paginated = allRaw.slice(offset, offset + limit);

    const messages: ChatMessage[] = paginated.map((m) => ({
      id: m.id,
      text: m.content,
      sender: (m.sender_role === 'owner'
        ? 'me'
        : m.sender_role === 'system'
          ? 'system'
          : 'tenant') as ChatMessage['sender'],
      time: new Date(m.created_at || '').toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: true,
      type: ((m as DbMaintenanceMessage).request_id
        ? (m as DbMaintenanceMessage).type
        : (m as DbConversationMessage).type || 'text') as ChatMessage['type'],
      created_at: m.created_at || undefined,
      requestId: (m as DbMaintenanceMessage).request_id,
    }));

    return messages.reverse();
  },

  async sendMessage(
    threadId: string,
    category: string,
    text: string,
    userId: string,
    type: ChatMessage['type'] = 'text'
  ) {
    try {
      const tenantId = threadId.substring(threadId.indexOf('_') + 1);
      if (!userId) throw new Error('Usuário não autenticado. Faça login novamente.');

      const { data: latestMaint } = await supabase
        .from('maintenance_requests')
        .select('id')
        .eq('tenant_id', tenantId)
        .in('status', ['pending', 'in_progress', 'open'])
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestMaint) {
        return await supabase.from('maintenance_messages').insert({
          request_id: latestMaint.id,
          sender_id: userId,
          sender_role: type === 'system' ? 'system' : 'owner',
          content: text,
          type,
        });
      }

      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('category', 'general')
        .maybeSingle();

      let targetConvId = conv?.id;

      if (!targetConvId) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            owner_id: userId,
            tenant_id: tenantId,
            category: 'general',
            last_message: text,
            last_message_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        targetConvId = newConv?.id;
      } else {
        void supabase
          .from('conversations')
          .update({
            last_message: type === 'image' ? '📷 Imagem enviada' : text,
            last_message_at: new Date().toISOString(),
          })
          .eq('id', targetConvId);
      }

      return await supabase.from('conversation_messages').insert({
        conversation_id: targetConvId,
        sender_id: userId,
        sender_role: type === 'system' ? 'system' : 'owner',
        content: text,
        type,
      });
    } catch (err) {
      console.error('Critical error sending message:', err);
      throw err;
    }
  },

  async uploadFile(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'bin';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `messages/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);

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
    const [type, ...rest] = threadId.split('_');
    const dbId = rest.join('_');

    if (type === 'conv') {
      await supabase.from('conversations').update({ unread_count_owner: 0 }).eq('id', dbId);

      await supabase
        .from('conversation_messages')
        .update({ is_read: true })
        .eq('conversation_id', dbId)
        .eq('sender_role', 'tenant');
    }

    if (type === 'tenant') {
      await supabase
        .from('conversations')
        .update({ unread_count_owner: 0 })
        .eq('tenant_id', dbId);

      await supabase
        .from('conversation_messages')
        .update({ is_read: true })
        .eq('sender_role', 'tenant')
        .in('conversation_id', (
          await supabase.from('conversations').select('id').eq('tenant_id', dbId)
        ).data?.map((c) => c.id) || []);
    }
  },

  async listTenantsForMessaging() {
    try {
      const { data: contractData, error } = await supabase
        .from('contracts')
        .select('tenant_id')
        .not('tenant_id', 'is', null);

      if (error) {
        console.error('Error fetching contracts for tenant list:', error);
        return [];
      }

      const tenantIds = [...new Set((contractData || []).map((c) => c.tenant_id as string))];
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
      if (!ownerId) throw new Error('ID do proprietário não informado.');

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

      const { data: created, error: insertError } = await supabase
        .from('conversations')
        .insert({
          owner_id: ownerId,
          tenant_id: tenantId,
          category: 'general',
          last_message: 'Início da conversa',
          last_message_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      return `conv_${created.id}`;
    } catch (err) {
      console.error('Error in getOrCreateConversation:', err);
      throw err;
    }
  },

  async getTenantThreads(tenantId: string): Promise<ChatThread[]> {
    try {
      const allChats = await this.getChats();
      return allChats.filter((c) => c.dbId === tenantId);
    } catch {
      return [];
    }
  },

  async getTenantMessagesCombined(tenantId: string) {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('*, properties(name)')
      .eq('tenant_id', tenantId)
      .eq('category', 'general');

    const convIds = (conversations || []).map((c: { id: string }) => c.id);
    const propertyName =
      (conversations?.[0]?.properties as unknown as { name: string } | null)?.name || '';

    const { data: convMsgs } = await supabase
      .from('conversation_messages')
      .select('*')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: true });

    const { data: requests } = await supabase
      .from('maintenance_requests')
      .select('id')
      .eq('tenant_id', tenantId);

    const requestIds = (requests || []).map((r: { id: string }) => r.id);
    const { data: maintData } = requestIds.length > 0
      ? await supabase
          .from('maintenance_messages')
          .select('*')
          .in('request_id', requestIds)
          .order('created_at', { ascending: true })
      : { data: [] };

    return { conversations: conversations || [], convMsgs: convMsgs || [], maintMsgs: maintData || [], propertyName };
  },
};
