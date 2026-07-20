import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { messageService } from '../../../services/messageService';
import { supportService } from '../../../services/supportService';
import { tenantService } from '../../../services/tenancy/tenantService';
import { propertyService } from '../../../services/propertyService';
import { useAuth } from '../../../context/AuthContext';
import type { ChatThread, ChatMessage } from '../../../types/messages';
import type { Property, Tenant } from '../../../types';

export function useChat() {
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const activeChatId = searchParams.get('chat');
  const setActiveChatId = useCallback(
    (id: string | null) => {
      if (id) {
        setSearchParams({ chat: id }, { replace: false });
      } else {
        setSearchParams({}, { replace: false });
      }
    },
    [setSearchParams]
  );
  const [inputText, setInputText] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'maintenance' | 'finance' | 'general' | 'urgent' | 'support'
  >('all');
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'ticket' | 'tenant'>('ticket');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [isStatusLocked, setIsStatusLocked] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);

  const [quickReplies, setQuickReplies] = useState<string[]>([
    'Estou verificando.',
    'Agendado para amanhã.',
    'Pode me enviar uma foto?',
    'Recebido, obrigado.',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('igloo_quick_replies');
    if (saved) {
      try {
        setQuickReplies(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('igloo_quick_replies', JSON.stringify(quickReplies));
  }, [quickReplies]);

  const handleAddQuickReply = (text: string) => {
    if (!text.trim() || quickReplies.includes(text)) return;
    setQuickReplies((prev) => [...prev, text]);
  };

  const handleRemoveQuickReply = (index: number) => {
    setQuickReplies((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const loadChats = useCallback(async () => {
    setLoading(true);
    try {
      const tenantChats = await messageService.getChats();
      let supportThreads: ChatThread[] = [];
      if (user) {
        const supportTickets = await supportService.getTickets(user.id);

        if (supportTickets.length > 0) {
          supportThreads = supportTickets.map((t) => {
            const statusMap = {
              'Resolvido': 'completed' as const,
              'Fechado': 'completed' as const,
              'Em Andamento': 'in_progress' as const,
            };
            const priorityMap = {
              'Urgente': 'urgent' as const,
              'Alta': 'high' as const,
              'Média': 'medium' as const,
              'Baixa': 'low' as const,
            };

            return {
              id: `support_${t.id}`,
              dbId: t.id,
              tenantName: 'Suporte Igloo',
              tenantAvatar: undefined,
              tenantEmail: 'suporte@igloo.com.br',
              tenantPhone: '',
              property: t.subject,
              lastMessage: t.subject,
              lastMessageTime: new Date(t.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              unreadCount: 0,
              category: 'support' as const,
              messages: [],
              hasMore: false,
              ticket: {
                id: `#SUP-${t.id.slice(0, 4).toUpperCase()}`,
                title: t.subject,
                category: t.category || 'Geral',
                description: '',
                status: statusMap[t.status as keyof typeof statusMap] || 'pending',
                priority: priorityMap[t.priority as keyof typeof priorityMap] || 'low',
                images: [],
                realId: t.id,
              },
            };
          });
        } else {
          const virtualThread: ChatThread = {
            id: 'support_virtual',
            dbId: 'virtual',
            tenantName: 'Suporte Igloo',
            tenantAvatar: undefined,
            tenantEmail: 'suporte@igloo.com.br',
            tenantPhone: '',
            property: 'Central de Suporte Operacional',
            lastMessage: 'Comece uma conversa com o suporte...',
            lastMessageTime: '',
            unreadCount: 0,
            category: 'support',
            messages: [],
            hasMore: false,
            ticket: undefined,
          };
          supportThreads = [virtualThread];
        }
      }

      const combined = [...supportThreads, ...tenantChats];
      setChats(combined);
      return combined;
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      if (user) {
        setCurrentUserId(String(user.id));
        await loadChats();
        const [props, tenantsData] = await Promise.all([
          propertyService.getAll(),
          tenantService.getAll(),
        ]);
        const ownerProps = props.filter((p) => p.owner_id === user.id);
        setProperties(ownerProps);
        setAvailableTenants(tenantsData);
      }
    };

    init();
  }, [user, loadChats]);

  const handleSelectTenant = useCallback(
    async (tenantId: string) => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const threadId = await messageService.getOrCreateConversation(tenantId, String(user.id));
        const updatedChats = await loadChats();
        setActiveChatId(threadId);

        if (!updatedChats.some((c: ChatThread) => c.id === threadId)) {
          setSearchTerm('');
          setActiveFilter('all');
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [user, loadChats]
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tenantId = params.get('tenantId');
    if (tenantId && currentUserId) {
      handleSelectTenant(tenantId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location, currentUserId, handleSelectTenant]);

  const loadMessages = useCallback(
    async (threadId: string, category: string) => {
      if (category === 'support' && threadId.startsWith('support_')) {
        const ticketId = threadId.replace('support_', '');
        if (!ticketId || ticketId === 'virtual') return;
        if (!user) return;
        try {
          const messages = await supportService.getTicketMessages(ticketId);

          const chatMsgs: ChatMessage[] = messages.map((m) => ({
            id: m.id,
            text: m.content,
            sender: (m.sender_role === 'user'
              ? 'me'
              : m.sender_role === 'system'
                ? 'system'
                : 'tenant') as 'me' | 'tenant' | 'system',
            time: new Date(m.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isRead: m.is_read || true,
            type: 'text',
            created_at: m.created_at,
            isSupport: true,
          }));

          setChats((prev) =>
            prev.map((c) => (c.id === threadId ? { ...c, messages: chatMsgs, hasMore: false } : c))
          );
        } catch {
          // ignore
        }
      } else {
        const msgs = await messageService.getMessages(threadId, category);
        setChats((prev) =>
          prev.map((c) =>
            c.id === threadId ? { ...c, messages: msgs, hasMore: msgs.length >= 20 } : c
          )
        );
      }
    },
    [user]
  );

  // ── Stable activeChat reference ──
  const activeChat = useMemo(() => 
    chats.find((c) => c.id === activeChatId), 
    [chats, activeChatId]
  );

  useEffect(() => {
    if (activeChatId) {
      if (activeChat) {
        loadMessages(activeChatId, activeChat.category);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId, loadMessages]);

  const loadMoreMessages = async () => {
    if (!activeChatId || loadingMore) return;
    const chat = chats.find((c) => c.id === activeChatId);
    if (!chat || !chat.hasMore) return;

    setLoadingMore(true);
    const offset = chat.messages.length;
    const moreMsgs = await messageService.getMessages(activeChatId, chat.category, 20, offset);

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, messages: [...moreMsgs, ...c.messages], hasMore: moreMsgs.length >= 20 }
          : c
      )
    );
    setLoadingMore(false);
  };

  const handleNewIncomingMessage = useCallback(
    (
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
    ) => {
      const formattedMsg: ChatMessage = {
        id: newMsg.id,
        text: newMsg.content,
        sender:
          newMsg.sender_role === 'system'
            ? 'system'
            : newMsg.sender_role === 'user'
              ? 'me'
              : 'tenant',
        time: new Date(newMsg.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isRead: newMsg.is_read || true,
        type: (newMsg.type || 'text') as ChatMessage['type'],
        isSupport: category === 'support',
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === threadId) {
            if (c.messages.some((m: ChatMessage) => m.id === formattedMsg.id)) return c;
            const isCurrent = activeChatId === threadId;
            return {
              ...c,
              messages: [...c.messages, formattedMsg],
              lastMessage: formattedMsg.text,
              lastMessageTime: formattedMsg.time,
              unreadCount: isCurrent ? 0 : c.unreadCount + 1,
            };
          }
          return c;
        })
      );
    },
    [activeChatId]
  );

  useEffect(() => {
    if (!activeChatId) return;

    const chat = chats.find((c) => c.id === activeChatId);
    if (!chat) return;

    // Ações de leitura no backend
    if (chat.category === 'support') {
      const ticketId = chat.dbId;
      if (ticketId && ticketId !== 'virtual') {
        supportService.markMessagesAsRead(ticketId);
      }
    } else {
      messageService.markAsRead(activeChatId);
    }

    // Atualização de estado segura
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId && c.unreadCount !== 0 ? { ...c, unreadCount: 0 } : c))
    );
  }, [activeChatId]); // Removido 'chats' da dependência para evitar loop infinito ao alternar chats

  const activeMessages = chats.find((c) => c.id === activeChatId)?.messages;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSendMessage = async (
    text: string = inputText,
    type: 'text' | 'image' | 'system' = 'text'
  ) => {
    if (!text.trim() || !activeChatId || !user?.id) return;

    const chat = chats.find((c) => c.id === activeChatId);
    if (!chat) return;

    const messageText = text;
    setInputText('');

    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      text: messageText,
      sender: type === 'system' ? 'system' : 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      type: type,
      created_at: new Date().toISOString(),
      isSupport: chat.category === 'support',
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              messages: [...c.messages, optimisticMsg],
              lastMessage: messageText,
              lastMessageTime: optimisticMsg.time,
            }
          : c
      )
    );

    try {
      if (chat.category === 'support') {
        let ticketId = chat.dbId;
        if (ticketId === 'virtual') {
          await supportService.createTicket({
            user_id: user.id,
            subject: 'Novo Atendimento',
            description: messageText,
            category: 'Geral',
            priority: 'Média',
          });
          await loadChats();
        } else {
          if (chat.ticket?.status === 'completed') {
            await supportService.updateTicketStatus(ticketId, 'Pendente');
            await supportService.addSystemMessage(ticketId, 'Chamado reaberto para atendimento');
          }
          await supportService.sendTicketMessage(ticketId, String(user.id), messageText);
        }
        await loadMessages(activeChatId, 'support');
        await loadChats();
      } else {
        await messageService.sendMessage(
          activeChatId,
          chat.category,
          messageText,
          String(user.id),
          type
        );
      }
    } catch {
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: c.messages.filter((m) => m.id !== optimisticMsg.id) }
            : c
        )
      );
    }
  };

  const onSendMessage = (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    handleSendMessage(overrideText || inputText);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId) return;

    try {
      const publicUrl = await messageService.uploadFile(file);
      await handleSendMessage(publicUrl, 'image');
    } catch {
      alert('Erro ao enviar imagem. Verifique se o bucket "documents" existe.');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!activeChatId) return;
    const chat = chats.find((c) => c.id === activeChatId);
    if (!chat || chat.category !== 'maintenance') return;

    setIsStatusLocked(true);
    try {
      if (!chat.ticket?.realId) {
        return;
      }
      await messageService.updateMaintenanceStatus(chat.ticket.realId, newStatus);

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId && c.ticket
            ? {
                ...c,
                ticket: {
                  ...c.ticket,
                  status: newStatus as 'pending' | 'in_progress' | 'completed',
                },
              }
            : c
        )
      );

      const statusLabel =
        newStatus === 'completed'
          ? 'CONCLUÍDO'
          : newStatus === 'in_progress'
            ? 'EM ANDAMENTO'
            : 'PENDENTE';
      const systemText = `O status do chamado foi alterado para: ${statusLabel}`;

      await handleSendMessage(systemText, 'system');
    } catch {
      // ignore
    } finally {
      setIsStatusLocked(false);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'urgent' && chat.ticket?.priority === 'urgent') ||
      chat.category === activeFilter;

    const matchesPriority = priorityFilter === 'all' || chat.ticket?.priority === priorityFilter;
    const matchesProperty = propertyFilter === 'all' || chat.property === propertyFilter;

    return matchesSearch && matchesFilter && matchesPriority && matchesProperty;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance':
        return '🔧';
      case 'finance':
        return '💰';
      default:
        return '💬';
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    activeChatId,
    setActiveChatId,
    inputText,
    setInputText,
    activeFilter,
    setActiveFilter,
    showDetailsPanel,
    setShowDetailsPanel,
    activeRightTab,
    setActiveRightTab,
    showAnnouncementModal,
    setShowAnnouncementModal,
    showAdvancedFilters,
    setShowAdvancedFilters,
    priorityFilter,
    setPriorityFilter,
    propertyFilter,
    setPropertyFilter,
    isStatusLocked,
    setIsStatusLocked,
    chats,
    loading,
    availableTenants,
    properties,
    loadingMore,
    typingUsers,
    setTypingUsers,
    quickReplies,
    messagesEndRef,
    attachmentInputRef,
    scrollRef,
    isDragging,
    filteredChats,
    activeChat,
    handleAddQuickReply,
    handleRemoveQuickReply,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    loadMoreMessages,
    onSendMessage,
    handleFileUpload,
    handleStatusChange,
    handleSelectTenant,
    getCategoryIcon,
    currentUserId,
    setChats,
    loadChats,
    loadMessages,
    handleNewIncomingMessage,
  };
}
