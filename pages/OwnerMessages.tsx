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
  Trash2
} from 'lucide-react';

import { tenantService } from '../services/tenantService';
import { ChatSidebar } from '../components/messages/ChatSidebar';
import { ChatWindow } from '../components/messages/ChatWindow';
import { ContextPanel } from '../components/messages/ContextPanel';
import { FAQManager } from '../components/messages/FAQManager';
import { CategoryManager } from '../components/messages/CategoryManager';
import CreateAnnouncementModal from '../components/announcements/CreateAnnouncementModal';
import { propertyService } from '../services/propertyService';
import { useAuth } from '../context/AuthContext';
import { TopBar } from '../components/layout/TopBar';
import { Megaphone } from 'lucide-react';


// Quick Replies moved to state inside the component

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
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState<Partial<FAQ>>({ question: '', answer: '', is_active: true });
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);

  // Sidebar Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // UI States
  const [isStatusLocked, setIsStatusLocked] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const [quickReplies, setQuickReplies] = useState<string[]>([
    'Estou verificando.',
    'Agendado para amanhã.',
    'Pode me enviar uma foto?',
    'Recebido, obrigado.',
  ]);

  // Load quick replies from localStorage if available
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

  // Save quick replies to localStorage
  useEffect(() => {
    localStorage.setItem('igloo_quick_replies', JSON.stringify(quickReplies));
  }, [quickReplies]);

  const handleAddQuickReply = (text: string) => {
    if (!text.trim()) return;
    if (quickReplies.includes(text)) return;
    setQuickReplies(prev => [...prev, text]);
  };

  const handleRemoveQuickReply = (index: number) => {
    setQuickReplies(prev => prev.filter((_, i) => i !== index));
  };

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
        const [props, tenantsData] = await Promise.all([
          propertyService.getAll(),
          tenantService.getAll()
        ]);
        const ownerProps = props.filter(p => p.owner_id === user.id);
        setProperties(ownerProps);
        setAvailableTenants(tenantsData);
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

  // 2. Fetch messages for active chat (always reload on chat switch)
  useEffect(() => {
    if (activeChatId) {
      const activeChat = chats.find(c => c.id === activeChatId);
      if (activeChat) {
        loadMessages(activeChatId, activeChat.category);
      }
    }
  }, [activeChatId]);

  // 3. Polling: refresh messages every 10s for the active chat
  useEffect(() => {
    if (!activeChatId) return;
    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const interval = setInterval(() => {
      loadMessages(activeChatId, activeChat.category);
    }, 10000);

    return () => clearInterval(interval);
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'maintenance_messages' }, async (payload) => {
        const newMsg = payload.new as any;
        // Skip our own messages (already shown via optimistic update)
        if (newMsg.sender_id === currentUserId) return;

        // Look up which tenant thread this request belongs to
        const { data: req } = await supabase
          .from('maintenance_requests')
          .select('tenant_id')
          .eq('id', newMsg.request_id)
          .maybeSingle();
        
        if (req?.tenant_id) {
          handleNewIncomingMessage(`tenant_${req.tenant_id}`, newMsg, 'maintenance');
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_messages' }, async (payload) => {
        const newMsg = payload.new as any;
        if (newMsg.sender_id === currentUserId) return;

        const { data: conv } = await supabase
          .from('conversations')
          .select('tenant_id')
          .eq('id', newMsg.conversation_id)
          .maybeSingle();

        if (conv?.tenant_id) {
          handleNewIncomingMessage(`tenant_${conv.tenant_id}`, newMsg, 'general');
        }
      })
      .subscribe();

    return () => { globalSub.unsubscribe(); };
  }, [currentUserId, activeChatId]);

  const handleNewIncomingMessage = (threadId: string, newMsg: any, category: string) => {
    const formattedMsg: ChatMessage = {
      id: newMsg.id,
      text: newMsg.content,
      sender: newMsg.sender_role === 'system' ? 'system' : 'tenant',
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
          messages: [...c.messages, formattedMsg],
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

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Droplets, Zap, Home, CloudRain, Shield, Smartphone, Sparkles, DollarSign, Wrench, HelpCircle, AlertCircle
    };
    return icons[iconName] || Wrench;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await tenantService.getMaintenanceCategories();
      setCategories(data);
    };
    fetchCategories();
  }, [showCategoryManager]);

  const handleSaveCategory = async (newCat: any) => {
    try {
      await tenantService.addMaintenanceCategory(newCat);
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

    const messageText = text;
    setInputText('');

    // Optimistic update — add message to local state immediately
    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      text: messageText,
      sender: type === 'system' ? 'system' : 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      type: type,
      created_at: new Date().toISOString(),
    };

    setChats(prev => prev.map(c => 
      c.id === activeChatId 
        ? { ...c, messages: [...c.messages, optimisticMsg], lastMessage: messageText, lastMessageTime: optimisticMsg.time }
        : c
    ));

    // Send to DB in background (non-blocking)
    try {
      await messageService.sendMessage(activeChatId, chat.category, messageText, String(user.id), type);
    } catch (err) {
      console.error('Error sending message:', err);
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
      if (!chat.ticket?.realId) {
        console.error('No active ticket ID found for this maintenance chat');
        return;
      }
      await messageService.updateMaintenanceStatus(chat.ticket.realId, newStatus);
      
      // Update local state immediately
      setChats(prev => prev.map(c => 
        c.id === activeChatId && c.ticket 
          ? { ...c, ticket: { ...c.ticket, status: newStatus as any } } 
          : c
      ));

      const statusLabel = newStatus === 'completed' ? 'CONCLUÍDO' : newStatus === 'in_progress' ? 'EM ANDAMENTO' : 'PENDENTE';
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
      case 'maintenance': return '🔧';
      case 'finance': return '💰';
      default: return '💬';
    }
  };

  return (
    <div className='flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden relative transition-colors duration-300'>
      {/* Header - Hidden on mobile when chat is active to maximize space */}
      <div className={`${activeChatId ? 'hidden md:block' : 'block'}`}>
        <TopBar 
          title='Central de Mensagens' 
          subtitle='Comunicação direta com locatários'
        >
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setShowFAQManager(true)}
              className='flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95'
            >
              <HelpCircle size={18} className='text-primary' />
              <span className='hidden lg:inline'>FAQs</span>
            </button>

            <button
              onClick={() => setShowCategoryManager(true)}
              className='flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95'
            >
              <Filter size={18} className='text-orange-500' />
              <span className='hidden lg:inline'>Categorias</span>
            </button>

            <button
              onClick={() => setShowAnnouncementModal(true)}
              className='flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95'
            >
              <Megaphone size={18} />
              <span className='hidden md:inline'>Comunicado</span>
            </button>
          </div>
        </TopBar>
      </div>

      {loading && (
        <div className='absolute inset-0 z-[60] bg-white/80 dark:bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center'>
          <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4'></div>
          <p className='text-sm font-bold text-slate-900 dark:text-white'>Carregando mensagens...</p>
        </div>
      )}

      <div className='flex flex-1 overflow-hidden relative min-h-0 bg-white dark:bg-background-dark'>
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
          getCategoryIcon={getCategoryIcon}
          availableTenants={availableTenants}
          handleSelectTenant={handleSelectTenant}
          scrollRef={scrollRef}
          handleMouseDown={handleMouseDown}
          handleMouseLeave={handleMouseLeave}
          handleMouseUp={handleMouseUp}
          handleMouseMove={handleMouseMove}
          isDragging={isDragging}
        />

        {activeChat ? (
          <div className='flex-1 flex overflow-hidden min-h-0 h-full'>
            <ChatWindow 
              activeChat={activeChat}
              setActiveChatId={setActiveChatId}
              setShowDetailsPanel={setShowDetailsPanel}
              showDetailsPanel={showDetailsPanel}
              activeRightTab={activeRightTab}
              setActiveRightTab={setActiveRightTab}
              messagesEndRef={messagesEndRef}
              quickReplies={quickReplies}
              onAddQuickReply={handleAddQuickReply}
              onRemoveQuickReply={handleRemoveQuickReply}
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
              <>
                {/* Mobile Backdrop for ContextPanel */}
                <div 
                  className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden animate-fadeIn'
                  onClick={() => setShowDetailsPanel(false)}
                />
                <ContextPanel 
                  activeChat={activeChat}
                  activeRightTab={activeRightTab}
                  setActiveRightTab={setActiveRightTab}
                  setShowDetailsPanel={setShowDetailsPanel}
                  isStatusLocked={isStatusLocked}
                  setIsStatusLocked={setIsStatusLocked}
                  onStatusChange={handleStatusChange}
                />
              </>
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

            <div className='w-full max-w-4xl mt-12'>
              <div className='flex items-center justify-between mb-6 px-2'>
                <h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-slate-400'>Tipos de Chamados Ativos</h3>
                <button 
                  onClick={() => setShowCategoryManager(true)}
                  className='flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all text-[10px] font-black uppercase tracking-widest'
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>

              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                {categories.map((cat) => {
                  const Icon = getIconComponent(cat.icon_name);
                  return (
                    <div 
                      key={cat.id} 
                      className='group relative p-6 bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/10 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-white/10 transition-all cursor-default'
                    >
                      <div className={`p-4 rounded-2xl ${cat.bg_class} ${cat.color_class}`}>
                        <Icon size={24} strokeWidth={2.5} />
                      </div>
                      <span className='text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white'>{cat.name}</span>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat.id);
                        }}
                        className='absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg'
                        title='Excluir categoria'
                      >
                        <Trash2 size={12} strokeWidth={3} />
                      </button>
                    </div>
                  );
                })}

                {categories.length === 0 && (
                  <div className='col-span-full p-12 text-slate-400 text-xs font-bold uppercase tracking-widest bg-white/5 rounded-[40px] border-2 border-dashed border-white/5 flex items-center justify-center'>
                    Nenhuma categoria configurada
                  </div>
                )}
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

      <CategoryManager 
        show={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        categories={categories}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      <CreateAnnouncementModal 
        isOpen={showAnnouncementModal} 
        onClose={() => setShowAnnouncementModal(false)}
        properties={properties}
        onSuccess={() => {
          setShowAnnouncementModal(false);
        }}
      />
    </div>
  );
};

export default OwnerMessages;
