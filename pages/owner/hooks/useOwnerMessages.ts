import { useChat } from './useChat';
import { useTickets } from './useTickets';
import { useRealtimeSubscriptions } from './useRealtimeSubscriptions';

export function useOwnerMessages() {
  const chat = useChat();
  const tickets = useTickets();

  useRealtimeSubscriptions({
    currentUserId: chat.currentUserId,
    activeChatId: chat.activeChatId,
    inputText: chat.inputText,
    onNewIncomingMessage: chat.handleNewIncomingMessage,
    onTypingUsersChange: chat.setTypingUsers,
  });

  return {
    ...chat,
    ...tickets,
    showCreateSupportModal: tickets.showCreateSupportModal,
    setShowCreateSupportModal: tickets.setShowCreateSupportModal,
  };
}
