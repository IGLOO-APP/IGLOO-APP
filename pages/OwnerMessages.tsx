import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { faqService } from '../services/faqService';
import { messageService } from '../services/messageService';
import { FAQ, Property, Tenant, SystemAnnouncement } from '../types';
import { ChatThread, ChatMessage } from '../services/messageService';
import { 
  Search, 
  Filter, 
  Plus, 
  MessageSquare,
} from 'lucide-react';

import { ChatSidebar } from '../components/messages/ChatSidebar';
import { ChatWindow } from '../components/messages/ChatWindow';
import { ContextPanel } from '../components/messages/ContextPanel';
import { FAQManager } from '../components/messages/FAQManager';
import { NewChatModal } from '../components/messages/NewChatModal';
import { useAuth } from '../context/AuthContext';


const quickReplies = [
  'Estou verificando.',
  'Agendado para amanhã.',
  'Pode me enviar uma foto?',
  'Recebido, obrigado.',
];

const OwnerMessages: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth(); // Get Clerk user ID to pass to messageService

  const [searchTerm, setSearchTerm] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'maintenance' | 'finance' | 'general' | 'urgent'>(
    'all'
  );
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'ticket' | 'tenant'>('ticket');
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // FAQ Manager State
  const [showFAQManager, setShowFAQManager] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState<Partial<FAQ>>({ question: '', answer: '', is_active: true });

  // Sidebar Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // UI States
  const [isStatusLocked, setIsStatusLocked] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Scroll logic for categories
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  // 1. Initial Load
  useEffect(() => {
    const init = async () => {
      if (user) {
        setCurrentUserId(String(user.id));
        await loadChats();
      }
    };
    init();
  }, [user]);

  // Handle deep link from Tenants page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tenantId = params.get('tenantId');
    if (tenantId && currentUserId) {
      handleSelectTenant(tenantId);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location, currentUserId]);

  const loadChats = async () => {
    setLoading(true);
    const data = await messageService.getChats();
    setChats(data);
    setLoading(false);
    return data;
  };

  // 2. Fetch messages for active chat
  useEffect(() => {
    if (activeChatId) {
      const activeChat = chats.find(c => c.id === activeChatId);
      if (activeChat && activeChat.messages.length === 0) {
        loadMessages(activeChatId, activeChat.category);
      }
    }
  }, [activeChatId]);

  const loadMessages = async (threadId: string, category: string) => {
    const msgs = await messageService.getMessages(threadId, category);
    setChats(prev => prev.map(c => c.id === threadId ? { 
      ...c, 
      messages: msgs,
      hasMore: msgs.length >= 20 
    } : c));
  };

  const loadMoreMessages = async () => {
    if (!activeChatId || loadingMore) return;
    const chat = chats.find(c => c.id === activeChatId);
    if (!chat || !chat.hasMore) return;

    setLoadingMore(true);
    const offset = chat.messages.length;
    const moreMsgs = await messageService.getMessages(activeChatId, chat.category, 20, offset);
    
    setChats(prev => prev.map(c => c.id === activeChatId ? {
      ...c,
      messages: [...moreMsgs, ...c.messages],
      hasMore: moreMsgs.length >= 20
    } : c));
    setLoadingMore(false);
  };

  // 3. Real-time Subscriptions & Typing
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
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
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

  // Global message listeners
  useEffect(() => {
    if (!currentUserId) return;

    const globalSub = supabase.channel('global_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'maintenance_messages' }, (payload) => {
        const newMsg = payload.new;
        const threadId = `maint_${newMsg.request_id}`;
        handleNewIncomingMessage(threadId, newMsg, 'maintenance');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages' }, (payload) => {
        const newMsg = payload.new;
        const threadId = `conv_${newMsg.conversation_id}`;
        handleNewIncomingMessage(threadId, newMsg, 'general');
      })
      .subscribe();

    return () => { globalSub.unsubscribe(); };
  }, [currentUserId, activeChatId]);

  const handleNewIncomingMessage = (threadId: string, newMsg: any, category: string) => {
    const formattedMsg: ChatMessage = {
      id: newMsg.id,
      text: newMsg.content,
      sender: newMsg.sender_id === currentUserId ? 'me' : newMsg.sender_role === 'system' ? 'system' : 'tenant',
      time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: newMsg.is_read || true,
      type: newMsg.type as any,
    };

    setChats(prev => prev.map(c => {
      if (c.id === threadId) {
        if (c.messages.some((m: ChatMessage) => m.id === formattedMsg.id)) return c;
        const isCurrent = activeChatId === threadId;
        return {
          ...c,
          messages: isCurrent ? [...c.messages, formattedMsg] : c.messages,
          lastMessage: formattedMsg.text,
          lastMessageTime: formattedMsg.time,
          unreadCount: isCurrent ? 0 : c.unreadCount + 1
        };
      }
      return c;
    }));
  };

  useEffect(() => {
    const fetchFaqs = async () => {
      if (showFAQManager) {
        const data = await faqService.getFAQs();
        setFaqs(data);
      }
    };
    fetchFaqs();
  }, [showFAQManager]);

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

  // Handle Mark as Read
  useEffect(() => {
    if (activeChatId) {
      messageService.markAsRead(activeChatId);
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, unreadCount: 0 } : c));
    }
  }, [activeChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats.find(c => c.id === activeChatId)?.messages]);

  const handleSendMessage = async (text: string = inputText, type: 'text' | 'image' | 'system' = 'text') => {
    if (!text.trim() || !activeChatId || !user?.id) return;

    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;

    setInputText('');
    await messageService.sendMessage(activeChatId, chat.category, text, String(user.id), type);
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
    } catch (err) {
      alert('Erro ao enviar imagem. Verifique se o bucket "documents" existe.');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!activeChatId) return;
    const chat = chats.find(c => c.id === activeChatId);
    if (!chat || chat.category !== 'maintenance') return;

    setIsStatusLocked(true);
    try {
      await messageService.updateMaintenanceStatus(chat.dbId, newStatus);
      const statusLabel = newStatus === 'completed' ? 'CONCLUÍDO' : newStatus === 'in_progress' ? 'EM ANDAMENTO' : 'PENDENTE';
      await handleSendMessage(`O status do chamado foi alterado para: ${statusLabel}`, 'system');
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
      setShowNewChatModal(false);

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
      case 'maintenance': return '🔧';
      case 'finance': return '💰';
      default: return '💬';
    }
  };

  return (
    <div className='flex h-screen bg-background-light dark:bg-background-dark overflow-hidden relative'>
      {loading && (
        <div className='absolute inset-0 z-50 bg-white/80 dark:bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center'>
          <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4'></div>
          <p className='text-sm font-bold text-slate-900 dark:text-white'>Carregando mensagens...</p>
        </div>
      )}

      <div className='flex flex-1 overflow-hidden relative'>
        <ChatSidebar 
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          propertyFilter={propertyFilter}
          setPropertyFilter={setPropertyFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          filteredChats={filteredChats}
          chats={chats}
          setShowFAQManager={setShowFAQManager}
          getCategoryIcon={getCategoryIcon}
          onNewChat={() => setShowNewChatModal(true)}
          scrollRef={scrollRef}
          handleMouseDown={handleMouseDown}
          handleMouseLeave={handleMouseLeave}
          handleMouseUp={handleMouseUp}
          handleMouseMove={handleMouseMove}
          isDragging={isDragging}
        />

        {activeChat ? (
          <div className='flex-1 flex overflow-hidden'>
            <ChatWindow 
              activeChat={activeChat}
              setActiveChatId={setActiveChatId}
              setShowDetailsPanel={setShowDetailsPanel}
              showDetailsPanel={showDetailsPanel}
              activeRightTab={activeRightTab}
              setActiveRightTab={setActiveRightTab}
              messagesEndRef={messagesEndRef}
              quickReplies={quickReplies}
              handleSendMessage={onSendMessage}
              inputText={inputText}
              setInputText={setInputText}
              attachmentInputRef={attachmentInputRef}
              handleFileUpload={handleFileUpload}
              loadMoreMessages={loadMoreMessages}
              loadingMore={loadingMore}
              typingUsers={typingUsers}
            />

            {showDetailsPanel && (
              <ContextPanel 
                activeChat={activeChat}
                activeRightTab={activeRightTab}
                setActiveRightTab={setActiveRightTab}
                setShowDetailsPanel={setShowDetailsPanel}
                isStatusLocked={isStatusLocked}
                setIsStatusLocked={setIsStatusLocked}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        ) : (
          <div className='hidden md:flex flex-1 flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-black/20'>
            <div className='relative'>
              <div className='w-24 h-24 bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl flex items-center justify-center mb-8 text-slate-200 dark:text-white/10 ring-1 ring-black/5 dark:ring-white/5'>
                <MessageSquare size={48} strokeWidth={1.5} />
              </div>
              <div className='absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg animate-bounce'>
                <Plus size={16} strokeWidth={3} />
              </div>
            </div>
            
            <div className='max-w-md space-y-4'>
              <h2 className='text-2xl font-black text-slate-900 dark:text-white tracking-tighter'>
                Central de Mensagens Igloo
              </h2>
              <p className='text-sm text-slate-500 dark:text-slate-400 leading-relaxed'>
                Gerencie todos os seus chamados de manutenção, dúvidas financeiras e conversas gerais em um só lugar. 
                <span className='block mt-2 font-bold text-slate-900 dark:text-slate-300'>Selecione um chat ao lado para começar.</span>
              </p>
            </div>

            <div className='grid grid-cols-2 gap-4 mt-12 w-full max-w-sm'>
               <div className='p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-left'>
                  <div className='w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3'>
                    <Filter size={16} />
                  </div>
                  <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Filtros Rápidos</p>
                  <p className='text-xs font-bold text-slate-900 dark:text-white mt-1'>Encontre por categoria</p>
               </div>
               <div className='p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-left'>
                  <div className='w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3'>
                    <Search size={16} />
                  </div>
                  <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Busca Inteligente</p>
                  <p className='text-xs font-bold text-slate-900 dark:text-white mt-1'>Busque por imóvel</p>
               </div>
            </div>
          </div>
        )}
      </div>

      <FAQManager 
        show={showFAQManager}
        onClose={() => setShowFAQManager(false)}
        faqs={faqs}
        editingFaq={editingFaq}
        setEditingFaq={setEditingFaq}
        newFaq={newFaq}
        setNewFaq={setNewFaq}
        onSave={handleSaveFAQ}
        onDelete={handleDeleteFAQ}
        onToggleStatus={toggleFAQStatus}
      />

      <NewChatModal 
        show={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onSelectTenant={handleSelectTenant}
      />
    </div>
  );
};

export default OwnerMessages;
