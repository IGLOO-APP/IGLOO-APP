import React, { useState, useEffect, useRef } from 'react';
import { 
  X, MessageSquare, Search, Plus, Send, Paperclip, 
  CheckCheck, Shield, ChevronLeft, Wrench, DollarSign, 
  HelpCircle, AlertTriangle, Sparkles, Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { supportService, SupportTicket, SupportMessage } from '../../services/supportService';
import { CreateTicketModal } from './CreateTicketModal';

interface IglooSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const IglooSupportModal: React.FC<IglooSupportModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick replies for the user
  const quickReplies = [
    'Tenho uma dúvida sobre minha cobrança',
    'Preciso de ajuda com o aplicativo',
    'Meu boleto está com valor incorreto',
    'Problema resolvido! Muito obrigado.',
  ];

  // 1. Initial Load of Tickets
  useEffect(() => {
    if (isOpen && userId) {
      loadTickets();
    }
  }, [isOpen, userId]);

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const data = await supportService.getTickets(userId);
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  // 2. Load Messages for Active Ticket
  useEffect(() => {
    if (activeTicketId) {
      loadMessages(activeTicketId);
      // Mark messages as read in the database
      supportService.markMessagesAsRead(activeTicketId);
      // Update unread count locally
      setTickets(prev => prev.map(t => t.id === activeTicketId ? { ...t, unreadCount: 0 } as any : t));
    } else {
      setMessages([]);
    }
  }, [activeTicketId]);

  const loadMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    try {
      const data = await supportService.getTicketMessages(ticketId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // 3. Realtime Messaging subscription
  useEffect(() => {
    if (!activeTicketId || !isOpen) return;

    const channel = supabase.channel(`support_messages_user:${activeTicketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${activeTicketId}`
        },
        async (payload) => {
          const newMsg = payload.new as SupportMessage;
          
          // Append the message to active message stream
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Fetch sender profile details dynamically for support role
          if (newMsg.sender_role === 'admin' && newMsg.sender_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', newMsg.sender_id)
              .maybeSingle();

            if (profile) {
              setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, sender: profile } : m));
            }
          }

          // Mark active ticket messages as read since chat is open
          supportService.markMessagesAsRead(activeTicketId);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [activeTicketId, isOpen]);

  // Global channel for ticket status updates and new messages when backgrounded
  useEffect(() => {
    if (!userId || !isOpen) return;

    const globalChannel = supabase.channel(`support_global_user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Reload tickets list when any ticket status or update happens
          loadTickets();
        }
      )
      .subscribe();

    return () => {
      globalChannel.unsubscribe();
    };
  }, [userId, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() || !activeTicketId || !userId) return;

    setInputText('');

    // Optimistic Update
    const optimisticMsg: SupportMessage = {
      id: `temp_${Date.now()}`,
      ticket_id: activeTicketId,
      sender_id: userId,
      sender_role: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
      is_read: false
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await supportService.sendTicketMessage(activeTicketId, userId, textToSend);
      // Reload tickets to update last message preview and updated_at order
      loadTickets();
    } catch (err) {
      console.error('Error sending support message:', err);
    }
  };

  const handleCreateTicketSubmit = async (ticketData: {
    subject: string;
    description: string;
    category: string;
    priority: string;
  }) => {
    try {
      const created = await supportService.createTicket({
        user_id: userId,
        subject: ticketData.subject,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority
      });

      // Send first description as a message automatically
      await supportService.sendTicketMessage(created.id, userId, ticketData.description);
      
      // Reload tickets and set active
      await loadTickets();
      setActiveTicketId(created.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeTicketId) return;

    // Simulate file upload or support details
    await handleSendMessage(undefined, `📎 Enviou arquivo: ${file.name}`);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCategoryDetails = (category: string) => {
    switch (category) {
      case 'technical':
        return { icon: Wrench, color: 'text-cyan-500 bg-cyan-500/10' };
      case 'billing':
        return { icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' };
      case 'feature_request':
        return { icon: Sparkles, color: 'text-purple-500 bg-purple-500/10' };
      case 'bug':
        return { icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' };
      default:
        return { icon: HelpCircle, color: 'text-slate-500 bg-slate-500/10' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolvido':
        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400';
      case 'Fechado':
        return 'bg-slate-100 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400';
      default:
        return 'bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400';
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn pb-safe pt-safe'>
      <div className='w-full max-w-5xl h-[85vh] bg-white dark:bg-surface-dark border border-slate-200/60 dark:border-white/5 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scaleUp premium-glass'>
        {/* Left Sidebar (Tickets list) */}
        <div className={`w-full md:w-80 border-r border-slate-200/60 dark:border-white/5 flex flex-col bg-slate-50/50 dark:bg-black/20 shrink-0 h-full ${activeTicketId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className='p-4 border-b border-slate-200/60 dark:border-white/5 space-y-3 shrink-0'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-base font-black text-slate-main dark:text-white tracking-tight uppercase'>
                  Suporte Igloo
                </h2>
                <p className='text-[9px] text-slate-muted font-bold uppercase tracking-widest mt-0.5'>
                  Seus chamados operacionais
                </p>
              </div>
              <button
                onClick={onClose}
                className='md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all'
              >
                <X size={18} />
              </button>
            </div>

            {/* Create ticket trigger */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className='w-full py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all flex items-center justify-center gap-2 active-tap'
            >
              <Plus size={16} strokeWidth={2.5} />
              Abrir Novo Chamado
            </button>

            {/* Search */}
            <div className='relative'>
              <input
                type='text'
                placeholder='Buscar chamados...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 dark:bg-black/25 text-xs text-slate-main dark:text-white placeholder-slate-400 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all'
              />
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={14} />
            </div>
          </div>

          {/* Tickets Stream */}
          <div className='flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar'>
            {loadingTickets && tickets.length === 0 ? (
              <div className='flex flex-col items-center justify-center p-8 space-y-2.5 text-center'>
                <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin'></div>
                <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Buscando histórico...</p>
              </div>
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map((t) => {
                const cat = getCategoryDetails(t.category);
                const CatIcon = cat.icon;
                const isSelected = activeTicketId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTicketId(t.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer flex gap-3 border transition-all ${
                      isSelected
                        ? 'bg-primary/5 dark:bg-primary/10 border-primary/20 shadow-inner'
                        : 'border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                      <CatIcon size={18} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex justify-between items-baseline mb-1'>
                        <h4 className='text-xs font-bold text-slate-main dark:text-white truncate pr-2'>
                          {t.subject}
                        </h4>
                        <span className='text-[9px] text-slate-400 shrink-0 font-medium'>
                          {new Date(t.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>
                        {t.assignee && (
                          <span className='text-[9px] text-slate-400 italic truncate max-w-[100px]'>
                            Atendente: {t.assignee.name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='p-8 text-center flex flex-col items-center justify-center gap-3'>
                <div className='w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400'>
                  <MessageSquare size={18} />
                </div>
                <p className='text-[10px] text-slate-muted font-bold uppercase tracking-widest leading-relaxed max-w-[180px]'>
                  Nenhum chamado ativo encontrado
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Active Chat Thread */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-surface-dark overflow-hidden h-full ${!activeTicketId ? 'hidden md:flex' : 'flex'}`}>
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div className='h-16 px-4 md:px-6 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md z-10'>
                <div className='flex items-center gap-3 min-w-0'>
                  <button
                    onClick={() => setActiveTicketId(null)}
                    className='md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-sm font-bold text-slate-main dark:text-white truncate'>
                        {activeTicket.subject}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getStatusBadge(activeTicket.status)}`}>
                        {activeTicket.status}
                      </span>
                    </div>
                    <p className='text-[10px] text-slate-muted font-bold uppercase tracking-widest mt-0.5 flex items-center gap-2.5'>
                      <span className='flex items-center gap-1.5'>
                        <Clock size={11} className='text-primary' /> SLA ATIVO
                      </span>
                      {activeTicket.assignee && (
                        <span>• OPERADOR: {activeTicket.assignee.name}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={onClose}
                    className='p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all'
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Chat Messages stream */}
              <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-black/10'>
                <div className='flex justify-center'>
                  <div className='bg-slate-100/80 dark:bg-white/5 text-slate-400 border border-slate-200/50 dark:border-white/5 px-5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest'>
                    Início da conversa com Suporte Igloo
                  </div>
                </div>

                {loadingMessages && messages.length === 0 ? (
                  <div className='flex items-center justify-center p-12'>
                    <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin'></div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === userId || msg.sender_role === 'user';
                    const isSystem = msg.sender_role === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className='flex justify-center my-2.5 animate-fadeIn'>
                          <div className='bg-slate-100/50 dark:bg-white/5 text-slate-400/80 border border-transparent px-6 py-1.5 rounded-full text-[8px] font-bold tracking-widest uppercase'>
                            [ {msg.content} ]
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                      >
                        <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {/* Sender name for admins */}
                          {!isMe && (
                            <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1'>
                              {msg.sender?.name || 'Suporte Igloo'}
                            </span>
                          )}

                          {/* Message bubble */}
                          <div
                            className={`p-4 shadow-sm border text-sm leading-relaxed rounded-2xl transition-all ${
                              isMe
                                ? 'bg-primary/10 border-primary/20 text-slate-main dark:text-white rounded-tr-none'
                                : 'bg-white dark:bg-surface-dark border-slate-200/60 dark:border-white/5 text-slate-main dark:text-white rounded-tl-none'
                            }`}
                          >
                            {!isMe && (
                              <div className='flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-100 dark:border-white/5'>
                                <Shield size={11} className='text-emerald-500' />
                                <span className='text-[8px] font-black text-emerald-500 uppercase tracking-widest'>
                                  Suporte Autorizado
                                </span>
                              </div>
                            )}
                            <p className='font-medium whitespace-pre-wrap'>{msg.content}</p>
                          </div>

                          {/* Timestamp and status check */}
                          <div className='flex items-center gap-1.5 mt-1 px-1.5 text-[9px] text-slate-400 font-bold'>
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <CheckCheck
                                size={12}
                                className={msg.is_read ? 'text-primary' : 'text-slate-300 dark:text-white/20'}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className='p-4 border-t border-slate-200/60 dark:border-white/5 shrink-0 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md z-10'>
                {/* Quick replies */}
                <div className='flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1 shrink-0'>
                  {quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(undefined, reply)}
                      className='whitespace-nowrap px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:bg-primary hover:text-white hover:border-transparent transition-all shadow-sm active-tap'
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className='flex gap-3 items-center max-w-4xl mx-auto'>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className='hidden'
                  />
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    className='p-3 text-slate-400 hover:text-primary transition-all hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl border border-transparent shrink-0'
                  >
                    <Paperclip size={18} strokeWidth={2.5} />
                  </button>

                  <div className='flex-1 bg-slate-50 dark:bg-black/25 rounded-2xl border border-slate-200/60 dark:border-white/5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all flex items-center shadow-inner h-11'>
                    <input
                      required
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder='Escreva sua mensagem operacional...'
                      className='w-full h-full px-4 bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-main dark:text-white placeholder-slate-400 outline-none'
                    />
                  </div>

                  <button
                    type='submit'
                    disabled={!inputText.trim()}
                    className='h-11 w-11 rounded-2xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25 hover:scale-[1.03] active:scale-[0.97] transition-all shrink-0'
                  >
                    <Send size={16} strokeWidth={2.5} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            // Active Chat Placeholder when no ticket selected
            <div className='flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30 dark:bg-black/5'>
              <div className='relative'>
                <div className='w-20 h-20 bg-white dark:bg-surface-dark rounded-[24px] shadow-lg flex items-center justify-center mb-6 text-slate-200 dark:text-white/5 ring-1 ring-black/5 dark:ring-white/5'>
                  <MessageSquare size={36} strokeWidth={1.5} className='text-slate-300 dark:text-slate-700' />
                </div>
                <div className='absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-xl flex items-center justify-center text-white shadow shadow-cyan-500/25'>
                  <Plus size={12} strokeWidth={3} />
                </div>
              </div>

              <div className='max-w-sm space-y-2.5'>
                <h3 className='text-lg font-black text-slate-main dark:text-white tracking-tight uppercase'>
                  Suporte Igloo Operacional
                </h3>
                <p className='text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto'>
                  Gerencie suas dúvidas operacionais, financeiras ou técnicas de forma direta com nossa equipe especializada.
                  <span className='block mt-2 font-bold text-primary'>Selecione um chamado existente ou abra um novo.</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTicketSubmit}
      />
    </div>
  );
};
export default IglooSupportModal;
