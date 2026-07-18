import { useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionsOptions {
  currentUserId: string | null;
  activeChatId: string | null;
  inputText: string;
  onNewIncomingMessage: (
    threadId: string,
    newMsg: {
      id: string;
      content: string;
      sender_role: string;
      created_at: string;
      is_read?: boolean;
      type?: string;
    },
    category: string
  ) => void;
  onTypingUsersChange: (typingUsers: Record<string, boolean>) => void;
}

export function useRealtimeSubscriptions({
  currentUserId,
  activeChatId,
  inputText,
  onNewIncomingMessage,
  onTypingUsersChange,
}: UseRealtimeSubscriptionsOptions) {
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    if (!currentUserId || !activeChatId) return;

    const channel = supabase.channel(`room:${activeChatId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing: Record<string, boolean> = {};
        Object.values(state).forEach((presences: unknown) => {
          (presences as { user_id: string; is_typing: boolean }[]).forEach((p) => {
            if (p.user_id !== currentUserId && p.is_typing) {
              typing[p.user_id] = true;
            }
          });
        });
        onTypingUsersChange(typing);
      })
      .subscribe();

    channelsRef.current.push(channel);

    const typingTimeout = setTimeout(() => {
      channel.track({ user_id: currentUserId, is_typing: inputText.length > 0 });
    }, 500);

    return () => {
      channel.unsubscribe();
      clearTimeout(typingTimeout);
      channelsRef.current = channelsRef.current.filter((ch) => ch !== channel);
    };
  }, [currentUserId, activeChatId, inputText, onTypingUsersChange]);

  useEffect(() => {
    if (!currentUserId) return;

    const globalSub = supabase
      .channel('global_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'maintenance_messages' },
        async (payload) => {
          const newMsg = payload.new as {
            id: string;
            content: string;
            sender_role: string;
            created_at: string;
            sender_id: string;
            request_id: string;
            type?: string;
          };
          if (newMsg.sender_id === currentUserId) return;

          const { data: req } = await supabase
            .from('maintenance_requests')
            .select('tenant_id')
            .eq('id', newMsg.request_id)
            .maybeSingle();

          if (req?.tenant_id) {
            onNewIncomingMessage(`tenant_${req.tenant_id}`, newMsg, 'maintenance');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversation_messages' },
        async (payload) => {
          const newMsg = payload.new as {
            id: string;
            content: string;
            sender_role: string;
            created_at: string;
            sender_id: string;
            conversation_id: string;
            type?: string;
          };
          if (newMsg.sender_id === currentUserId && newMsg.sender_role !== 'system') return;

          const { data: conv } = await supabase
            .from('conversations')
            .select('tenant_id')
            .eq('id', newMsg.conversation_id)
            .maybeSingle();

          if (conv?.tenant_id) {
            onNewIncomingMessage(`tenant_${conv.tenant_id}`, newMsg, 'general');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        async (payload) => {
          const newMsg = payload.new as {
            id: string;
            content: string;
            sender_role: string;
            created_at: string;
            sender_id: string;
            ticket_id: string;
            is_read?: boolean;
          };
          if (newMsg.sender_id === currentUserId) return;

          const { data: ticket } = await supabase
            .from('support_tickets')
            .select('user_id')
            .eq('id', newMsg.ticket_id)
            .maybeSingle();

          if (ticket?.user_id === currentUserId) {
            onNewIncomingMessage(`support_${newMsg.ticket_id}`, newMsg, 'support');
          }
        }
      )
      .subscribe();

    channelsRef.current.push(globalSub);

    return () => {
      globalSub.unsubscribe();
      channelsRef.current = channelsRef.current.filter((ch) => ch !== globalSub);
    };
  }, [currentUserId, onNewIncomingMessage]);
}
