import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { faqService } from '../../../services/faqService';
import { messageService } from '../../../services/messageService';
import type { ChatThread, ChatMessage } from '../../../types/messages';
import type { LucideIcon } from 'lucide-react';
import { supportService } from '../../../services/supportService';
import { tenantService } from '../../../services/tenancy/tenantService';
import { propertyService } from '../../../services/propertyService';
import { useAuth } from '../../../context/AuthContext';
import { FAQ, Property, Tenant } from '../../../types';
import {
  Droplets,
  Zap,
  Home,
  CloudRain,
  Shield,
  Smartphone,
  Sparkles,
  DollarSign,
  Wrench,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

export function useOwnerMessages() {
  const location = useLocation();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'maintenance' | 'finance' | 'general' | 'urgent' | 'support'
  >('all');
  const [showCreateSupportModal, setShowCreateSupportModal] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'ticket' | 'tenant'>('ticket');
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [showFAQManager, setShowFAQManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string; icon_name: string; color_class: string; bg_class: string }[]
  >([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState<Partial<FAQ>>({ question: '', answer: '', is_active: true });
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  const [isStatusLocked, setIsStatusLocked] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

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
      } catch (e) {
        console.error('Error loading quick replies:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('igloo_quick_replies', JSON.stringify(quickReplies));
  }, [quickReplies]);

  const handleAddQuickReply = (text: string) => {
    if (!text.trim()) return;
    if (quickReplies.includes(text)) return;
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

  const loadChats = async () => {
    setLoading(true);
    try {
      const tenantChats = await messageService.getChats();
      let supportThreads: ChatThread[] = [];
      if (user) {
        const supportTickets = await supportService.getTickets(user.id);

        if (supportTickets.length > 0) {
          const sortedTickets = [...supportTickets].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          const activeTicket =
            sortedTickets.find((t) => t.status !== 'Fechado' && t.status !== 'Resolvido') ||
            sortedTickets[0];

          const allTicketMessages = await Promise.all(
            supportTickets.map(async (t) => {
              const messages = await supportService.getTicketMessages(t.id);
              return messages.map((m) => ({ ...m, ticketSubject: t.subject, ticketId: t.id }));
            })
          );

          const aggregatedMessages = allTicketMessages
            .flat()
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

          const lastMsg = aggregatedMessages[aggregatedMessages.length - 1];
          const unreadCount = aggregatedMessages.filter(
            (m) => m.sender_role === 'admin' && !m.is_read
          ).length;

          const unifiedThread: ChatThread = {
            id: 'support_unified',
            dbId: activeTicket.id,
            tenantName: 'Suporte Igloo',
            tenantAvatar: undefined,
            tenantEmail: 'suporte@igloo.com.br',
            tenantPhone: '',
            property: 'Central de Suporte Operacional',
            lastMessage: lastMsg ? lastMsg.content : 'Conversa de suporte iniciada',
            lastMessageTime: lastMsg
              ? new Date(lastMsg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : new Date(activeTicket.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
            unreadCount: unreadCount,
            category: 'support',
            messages: [],
            hasMore: false,
            ticket: {
              id: `#SUP-${activeTicket.id.slice(0, 4).toUpperCase()}`,
              title: activeTicket.subject,
              category: activeTicket.category || 'Geral',
              description: '',

              status: (activeTicket.status === 'Resolvido' || activeTicket.status === 'Fechado'
                ? 'completed'
                : activeTicket.status === 'Em Andamento'
                  ? 'in_progress'
                  : 'pending') as 'pending' | 'in_progress' | 'completed',

              priority: (activeTicket.priority === 'Urgente'
                ? 'urgent'
                : activeTicket.priority === 'Alta'
                  ? 'high'
                  : activeTicket.priority === 'Média'
                    ? 'medium'
                    : 'low') as 'low' | 'medium' | 'high' | 'urgent',
              images: [],
              realId: activeTicket.id,
            },
          };

          supportThreads = [unifiedThread];
        } else {
          const virtualUnifiedThread: ChatThread = {
            id: 'support_unified',
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
          supportThreads = [virtualUnifiedThread];
        }
      }

      const combined = [...supportThreads, ...tenantChats];
      setChats(combined);
      return combined;
    } catch (err) {
      console.error('Error loading chats:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

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
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tenantId = params.get('tenantId');
    if (tenantId && currentUserId) {
      handleSelectTenant(tenantId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, currentUserId]);

  const loadMessages = async (threadId: string, category: string) => {
    if (category === 'support') {
      if (!user) return;
      try {
        const supportTickets = await supportService.getTickets(user.id);
        const allTicketMessages = await Promise.all(
          supportTickets.map(async (t) => {
            const messages = await supportService.getTicketMessages(t.id);
            return messages.map((m) => ({ ...m, ticketSubject: t.subject }));
          })
        );

        const aggregatedMessages = allTicketMessages
          .flat()
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        const chatMsgs: ChatMessage[] = aggregatedMessages.map((m) => ({
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
          prev.map((c) =>
            c.id === threadId
              ? {
                  ...c,
                  messages: chatMsgs,
                  hasMore: false,
                }
              : c
          )
        );
      } catch (err) {
        console.error('Error loading support messages:', err);
      }
    } else {
      const msgs = await messageService.getMessages(threadId, category);
      setChats((prev) =>
        prev.map((c) =>
          c.id === threadId
            ? {
                ...c,
                messages: msgs,
                hasMore: msgs.length >= 20,
              }
            : c
        )
      );
    }
  };

  useEffect(() => {
    if (activeChatId) {
      const activeChat = chats.find((c) => c.id === activeChatId);
      if (activeChat) {
        loadMessages(activeChatId, activeChat.category);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

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
          ? {
              ...c,
              messages: [...moreMsgs, ...c.messages],
              hasMore: moreMsgs.length >= 20,
            }
          : c
      )
    );
    setLoadingMore(false);
  };

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
        setTypingUsers(typing);
      })
      .subscribe();

    const typingTimeout = setTimeout(() => {
      channel.track({ user_id: currentUserId, is_typing: inputText.length > 0 });
    }, 500);

    return () => {
      channel.unsubscribe();
      clearTimeout(typingTimeout);
    };
  }, [currentUserId, activeChatId, inputText]);

  const handleNewIncomingMessage = (
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
  };

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
            handleNewIncomingMessage(`tenant_${req.tenant_id}`, newMsg, 'maintenance');
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
            handleNewIncomingMessage(`tenant_${conv.tenant_id}`, newMsg, 'general');
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
            handleNewIncomingMessage('support_unified', newMsg, 'support');
          }
        }
      )
      .subscribe();

    return () => {
      globalSub.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, activeChatId]);

  useEffect(() => {
    const fetchFaqs = async () => {
      if (showFAQManager) {
        const data = await faqService.getFAQs();
        setFaqs(data);
      }
    };

    fetchFaqs();
  }, [showFAQManager]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await tenantService.getMaintenanceCategories();
      setCategories(data);
    };
    fetchCategories();
  }, [showCategoryManager]);

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, LucideIcon> = {
      Droplets,
      Zap,
      Home,
      CloudRain,
      Shield,
      Smartphone,
      Sparkles,
      DollarSign,
      Wrench,
      HelpCircle,
      AlertCircle,
    };
    return icons[iconName] || Wrench;
  };

  const handleSaveCategory = async (
    newCat: Partial<{ name: string; icon_name: string; color_class: string; bg_class: string }>
  ) => {
    try {
      await tenantService.addMaintenanceCategory(
        newCat as { name: string; icon_name: string; color_class: string; bg_class: string }
      );
      const updated = await tenantService.getMaintenanceCategories();
      setCategories(updated);
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await tenantService.deleteMaintenanceCategory(id);
        const updated = await tenantService.getMaintenanceCategories();
        setCategories(updated);
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleSaveFAQ = async () => {
    if (editingFaq) {
      await faqService.updateFAQ(editingFaq.id, editingFaq);
    } else if (newFaq.question && newFaq.answer) {
      await faqService.addFAQ({
        question: newFaq.question,
        answer: newFaq.answer,
        order: faqs.length + 1,
        is_active: newFaq.is_active ?? true,
      });
    }
    const updated = await faqService.getFAQs();
    setFaqs(updated);
    setEditingFaq(null);
    setNewFaq({ question: '', answer: '', is_active: true });
  };

  const handleDeleteFAQ = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta FAQ?')) {
      await faqService.deleteFAQ(id);
      const updated = await faqService.getFAQs();
      setFaqs(updated);
    }
  };

  const toggleFAQStatus = async (faq: FAQ) => {
    await faqService.updateFAQ(faq.id, { is_active: !faq.is_active });
    const updated = await faqService.getFAQs();
    setFaqs(updated);
  };

  useEffect(() => {
    if (activeChatId) {
      const chat = chats.find((c) => c.id === activeChatId);
      if (chat?.category === 'support') {
        const ticketId = chat.dbId;
        if (ticketId && ticketId !== 'virtual') {
          supportService.markMessagesAsRead(ticketId);
        }
      } else {
        messageService.markAsRead(activeChatId);
      }
      setChats((prev) => prev.map((c) => (c.id === activeChatId ? { ...c, unreadCount: 0 } : c)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats.find((c) => c.id === activeChatId)?.messages]);

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
          const newTicket = await supportService.createTicket({
            user_id: user.id,
            subject: 'Novo Atendimento',
            description: messageText,
            category: 'Geral',
            priority: 'Média',
          });
          ticketId = newTicket.id;
          await loadChats();
        } else {
          if (chat.ticket?.status === 'completed') {
            await supportService.updateTicketStatus(ticketId, 'Pendente');
            await supportService.addSystemMessage(ticketId, 'Chamado reaberto para atendimento');
          }
          await supportService.sendTicketMessage(ticketId, String(user.id), messageText);
        }
        await loadMessages('support_unified', 'support');
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
    } catch (err) {
      console.error('Error sending message:', err);
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: c.messages.filter((m) => m.id !== optimisticMsg.id) }
            : c
        )
      );
    }
  };

  const handleCreateSupportSubmit = async (ticketData: {
    subject: string;
    description: string;
    category: string;
    priority: string;
  }) => {
    if (!user) return;
    try {
      await supportService.createTicket({
        user_id: user.id,
        subject: ticketData.subject,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority,
      });

      await loadChats();
      setActiveChatId('support_unified');
      setActiveFilter('support');
    } catch (err) {
      console.error('Error creating support ticket:', err);
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
        console.error('No active ticket ID found for this maintenance chat');
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsStatusLocked(false);
    }
  };

  const handleSelectTenant = async (tenantId: string) => {
    if (!user?.id) {
      console.error('User not authenticated — cannot create conversation.');
      return;
    }
    try {
      setLoading(true);
      const threadId = await messageService.getOrCreateConversation(tenantId, String(user.id));
      const updatedChats = await loadChats();

      setActiveChatId(threadId);

      if (!updatedChats.some((c: ChatThread) => c.id === threadId)) {
        setSearchTerm('');
        setActiveFilter('all');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const activeChat = chats.find((c) => c.id === activeChatId);

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
    showCreateSupportModal,
    setShowCreateSupportModal,
    showDetailsPanel,
    setShowDetailsPanel,
    activeRightTab,
    setActiveRightTab,
    showFAQManager,
    setShowFAQManager,
    showCategoryManager,
    setShowCategoryManager,
    editingFaq,
    setEditingFaq,
    newFaq,
    setNewFaq,
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
    faqs,
    categories,
    properties,
    loadingMore,
    typingUsers,
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
    handleSaveCategory,
    handleDeleteCategory,
    handleSaveFAQ,
    handleDeleteFAQ,
    toggleFAQStatus,
    onSendMessage,
    handleFileUpload,
    handleStatusChange,
    handleSelectTenant,
    handleCreateSupportSubmit,
    getCategoryIcon,
    getIconComponent,
  };
}
