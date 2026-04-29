import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Filter,
  MoreVertical,
  Send,
  Paperclip,
  ChevronDown,
  Calendar,
  AlertTriangle,
  History,
  UserPlus,
  X,
  Lock,
  Unlock,
  LayoutDashboard,
  FileText,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Wrench,
  ExternalLink,
  Phone,
  FileCheck,
  HelpCircle,
  Plus,
  Trash2,
  Edit,
  Save,
} from 'lucide-react';
import { ModalWrapper } from '../../components/ui/ModalWrapper';
import { faqService } from '../../services/faqService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { FAQ } from '../../types';

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_role: 'me' | 'user' | 'system' | 'admin';
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    name: string;
    avatar_url: string;
  };
}

const SupportCenter: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [priorityFilter, setPriorityFilter] = useState('Todos');
  const [assigneeFilter, setAssigneeFilter] = useState('Todos');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);
  const [showFAQManager, setShowFAQManager] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState<Partial<FAQ>>({ question: '', answer: '', is_active: true });
  const [activeRightTab, setActiveRightTab] = useState<'ticket' | 'owner'>('ticket');
  const [inputText, setInputText] = useState('');
  const [isActionsLocked, setIsActionsLocked] = useState(true);

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
    await faqService.deleteFAQ(id);
    const updated = await faqService.getFAQs();
    setFaqs(updated);
  };

  const toggleFAQStatus = async (faq: FAQ) => {
    await faqService.updateFAQ(faq.id, { is_active: !faq.is_active });
    const updated = await faqService.getFAQs();
    setFaqs(updated);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    'Estamos verificando seu faturamento.',
    'Estorno processado com sucesso.',
    'Pode nos enviar um print do erro?',
    'Ticket resolvido, obrigado pelo contato.',
  ];

  // --- Real Data Fetching ---
  
  const { data: tickets = [], isLoading: loadingTickets } = useQuery({
    queryKey: ['support_tickets'],
    queryFn: () => adminService.getTickets(),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['support_messages', selectedTicketId],
    queryFn: () => adminService.getTicketMessages(selectedTicketId!),
    enabled: !!selectedTicketId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      adminService.sendTicketMessage(selectedTicketId!, currentUser!.id, 'admin', content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_messages', selectedTicketId] });
      setInputText('');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => adminService.updateTicketStatus(selectedTicketId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
      showToast('Status atualizado com sucesso', 'success');
    }
  });

  const assignTicketMutation = useMutation({
    mutationFn: (adminId: string | null) => adminService.assignTicket(selectedTicketId!, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
      showToast('Responsável alterado com sucesso', 'success');
    }
  });

  const selectedTicket = tickets.find((t: any) => t.id === selectedTicketId);

  const handleSendMessage = (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() || !selectedTicketId) return;
    sendMessageMutation.mutate(textToSend);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTicketId) return;
    
    // For now, simulate upload with a text message (future: upload to storage)
    sendMessageMutation.mutate(`📎 Arquivo enviado: ${file.name}`);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedTicketId) return;
    updateStatusMutation.mutate(newStatus);
  };

  const getSLAStatus = (ticket: any) => {
    if (ticket.status === 'Resolvido' || ticket.status === 'Fechado') return { label: 'Concluído', color: 'text-emerald-500', type: 'success' };
    
    const createdAt = new Date(ticket.created_at);
    const diff = Math.abs(new Date().getTime() - createdAt.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const thresholds: any = { Alta: 8, Média: 24, Baixa: 72, Urgente: 2 };
    const limit = thresholds[ticket.priority] || 24;

    if (hours >= limit) return { label: `SLA em risco — ${hours}h sem resposta`, color: 'text-rose-500', type: 'danger' };
    if (hours >= 2) return { label: `Sem resposta há ${hours}h`, color: 'text-amber-500', type: 'warning' };
    return { label: `Aberto há ${mins} min`, color: 'text-slate-400', type: 'muted' };
  };

  const filteredTickets = (tickets || [])
    .filter((t: any) => {
      const matchesSearch =
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'Todos' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'Todos' || t.priority === priorityFilter;
      const matchesAssignee =
        assigneeFilter === 'Todos' ||
        (assigneeFilter === 'Não atribuído' && !t.assigned_to) ||
        (assigneeFilter === 'Minha fila' && t.assigned_to === currentUser?.id);
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    })
    .sort((a: any, b: any) => {
      const slaA = getSLAStatus(a);
      const slaB = getSLAStatus(b);
      if (slaA.type === 'danger' && slaB.type !== 'danger') return -1;
      if (slaA.type !== 'danger' && slaB.type === 'danger') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleAssign = (ticketId: string, adminId: string | null) => {
    assignTicketMutation.mutate(adminId);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className='flex flex-row h-[calc(100vh-80px)] overflow-hidden animate-fadeIn bg-background-light dark:bg-background-dark'>
      {/* 1. Ticket List Sidebar */}
      <div
        className={`w-[280px] shrink-0 flex flex-col border-r border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark transition-transform duration-300 absolute md:relative z-20 h-full ${selectedTicketId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
      >
        <div className='p-4 border-b border-gray-200 dark:border-white/5 space-y-3'>
          <div className='flex items-center justify-between'>
            <h1 className='text-xl font-bold text-slate-900 dark:text-white'>Central de Suporte</h1>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-2 rounded-xl transition-all ${showAdvancedFilters ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400'}`}
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowFAQManager(true)}
            className='w-full p-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group'
          >
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all'>
              <HelpCircle size={20} />
            </div>
            <div className='text-left'>
              <p className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest'>Editar FAQs</p>
              <p className='text-[10px] text-slate-500'>Gerenciar dúvidas dos inquilinos</p>
            </div>
            <ChevronRight size={16} className='ml-auto text-slate-400' />
          </button>

          <div className='relative'>
            <input
              type='text'
              placeholder='Buscar tickets...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full h-10 pl-10 pr-4 rounded-xl bg-gray-100 dark:bg-black/20 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all'
            />
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
          </div>

          {showAdvancedFilters && (
            <div className='p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 space-y-4 animate-slideDown'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Prioridade
                </label>
                <div className='relative'>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className='w-full pl-4 pr-10 py-2.5 bg-white dark:bg-white/5 border border-transparent rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer'
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value='Todos' className='bg-white dark:bg-surface-dark text-slate-700 dark:text-white'>Todas as Prioridades</option>
                    <option value='Alta' className='bg-white dark:bg-surface-dark text-slate-700 dark:text-white'>Alta</option>
                    <option value='Média' className='bg-white dark:bg-surface-dark text-slate-700 dark:text-white'>Média</option>
                    <option value='Baixa' className='bg-white dark:bg-surface-dark text-slate-700 dark:text-white'>Baixa</option>
                  </select>
                  <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' size={14} />
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Atendente
                </label>
                <div className='relative'>
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className='w-full pl-4 pr-10 py-2.5 bg-white dark:bg-white/5 border border-transparent rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer'
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value='Todos' className='bg-white dark:bg-surface-dark text-slate-700 dark:text-white'>Todos os Atendentes</option>
                    <option value='Minha fila' className='bg-white dark:bg-surface-dark text-slate-700 dark:text-white'>Minha Fila</option>
                    <option value='Não atribuído' className='bg-white dark:bg-surface-dark text-slate-700 dark:text-white'>Não Atribuídos</option>
                  </select>
                  <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' size={14} />
                </div>
              </div>

              <button
                onClick={() => {
                  setPriorityFilter('Todos');
                  setAssigneeFilter('Todos');
                  setStatusFilter('Todos');
                  setSearchTerm('');
                }}
                className='w-full py-2.5 text-[10px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all uppercase tracking-widest'
              >
                Limpar Filtros
              </button>
            </div>
          )}

          <div className='flex gap-2 overflow-x-auto hide-scrollbar pb-1'>
            {['Todos', 'Urgentes', 'Aberto', 'Em Andamento', 'Resolvido'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${statusFilter === status || (status === 'Urgentes' && priorityFilter === 'Alta')
                    ? status === 'Urgentes'
                      ? 'bg-rose-500 text-white border-transparent'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                    : 'bg-white dark:bg-surface-dark text-slate-500 border-gray-200 dark:border-white/10 hover:bg-slate-50'
                  }`}
                onClickCapture={() => {
                  if (status === 'Urgentes') {
                    setPriorityFilter('Alta');
                    setStatusFilter('Todos');
                  } else {
                    setPriorityFilter('Todos');
                    setStatusFilter(status);
                  }
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-2 space-y-1'>
          {filteredTickets.map((t) => {
            const sla = getSLAStatus(t);
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className={`group p-3 rounded-xl flex items-start gap-3 cursor-pointer transition-all border border-transparent ${selectedTicketId === t.id
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary/20'
                    : 'hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
              >
                <div className='relative shrink-0 mt-1'>
                  {t.user?.avatar_url ? (
                    <div
                      className='w-12 h-12 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700'
                      style={{ backgroundImage: `url(${t.user.avatar_url})` }}
                    ></div>
                  ) : (
                    <div className='w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400'>
                      <User size={24} />
                    </div>
                  )}
                  {t.priority === 'Alta' && (
                    <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-surface-dark'>
                      <AlertCircle size={12} className='text-white' />
                    </div>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex justify-between items-baseline mb-0.5'>
                    <h3 className='text-sm font-bold text-slate-900 dark:text-white truncate pr-2'>
                      {t.user?.name || 'Sistema'}
                    </h3>
                    <span className='text-[10px] text-slate-400 shrink-0'>
                      {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className='text-[10px] text-primary uppercase font-bold tracking-wider mb-0.5 truncate'>
                    #{t.id.slice(0, 8)} — {t.subject}
                  </p>
                  <div className='flex justify-between items-end'>
                    <p className={`text-xs truncate max-w-[140px] font-medium ${sla.color}`}>
                      {sla.label}
                    </p>
                    {t.assignee && (
                      <div className='w-5 h-5 bg-slate-200 dark:bg-white/10 text-[10px] font-bold flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300'>
                        {t.assignee.initial}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Chat Area */}
      <div
        className={`flex-1 min-w-[320px] flex flex-col bg-slate-50 dark:bg-black/20 absolute md:relative w-full h-full transition-transform duration-300 ${selectedTicketId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        {selectedTicket ? (
          <>
            <div className='h-16 px-4 md:px-5 flex items-center justify-between bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 shrink-0 z-20 shadow-sm'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className='md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                >
                  <ChevronLeft size={24} />
                </button>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <h2 className='text-sm font-bold text-slate-900 dark:text-white leading-tight truncate'>
                      Ticket #{selectedTicket.id.slice(0, 8)}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap ${selectedTicket.status === 'Resolvido'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : selectedTicket.status === 'Em Andamento'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]'>
                    {selectedTicket.subject}
                  </p>
                </div>
              </div>

              <div className='flex gap-2'>
                <button
                  onClick={() => {
                    setShowDetailsPanel(true);
                    setActiveRightTab('owner');
                  }}
                  className={`p-2 rounded-lg transition-colors ${showDetailsPanel && activeRightTab === 'owner' ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}
                  title='Mini Dashboard do Proprietário'
                >
                  <LayoutDashboard size={20} />
                </button>
                <button
                  onClick={() => {
                    setShowDetailsPanel(!showDetailsPanel);
                    setActiveRightTab('ticket');
                  }}
                  className={`p-2 rounded-lg transition-colors ${showDetailsPanel && activeRightTab === 'ticket' ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}
                  title='Ver detalhes do chamado'
                >
                  <FileText size={20} />
                </button>
                <button className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors'>
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div className='flex-1 flex overflow-hidden'>
              {/* Messages Stream */}
              <div className='flex-1 flex flex-col min-w-0'>
                <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-4'>
                  <div className='flex justify-center mb-6'>
                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full'>
                      Início do Ticket — {new Date(selectedTicket.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex w-full ${msg.sender_role === 'admin' || msg.sender_role === 'me' ? 'justify-end' : msg.sender_role === 'system' ? 'justify-center' : 'justify-start'}`}
                    >
                      {msg.sender_role === 'system' ? (
                        <div className='bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide my-2 shadow-sm'>
                          {msg.content}
                        </div>
                      ) : (
                        <div
                          className={`max-w-[80%] flex flex-col ${msg.sender_role === 'admin' || msg.sender_role === 'me' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`px-4 py-3 rounded-2xl text-sm shadow-sm relative group ${msg.sender_role === 'admin' || msg.sender_role === 'me'
                                ? 'bg-primary text-white rounded-tr-sm'
                                : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-white rounded-tl-sm border border-gray-100 dark:border-gray-700'
                              }`}
                          >
                            {msg.content}
                          </div>
                          <div className='flex items-center gap-1 mt-1 px-1'>
                            <span className='text-[10px] text-slate-400 font-medium'>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {(msg.sender_role === 'admin' || msg.sender_role === 'me') && (
                              <CheckCheck
                                size={12}
                                className={msg.is_read ? 'text-primary' : 'text-slate-300'}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className='p-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-white/5 shrink-0'>
                  <div className='flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1'>
                    {quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(undefined, reply)}
                        className='whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors'
                      >
                        {reply}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={(e) => handleSendMessage(e)} className='flex gap-3 items-end'>
                    <input
                      type='file'
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className='hidden'
                    />
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='p-3 text-slate-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-white/5 rounded-full'
                    >
                      <Paperclip size={20} />
                    </button>
                    <div className='flex-1 bg-gray-100 dark:bg-black/20 rounded-2xl border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden flex items-center'>
                      <input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder='Digite uma resposta...'
                        className='w-full h-12 px-4 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400'
                      />
                    </div>
                    <button
                      type='submit'
                      disabled={!inputText.trim()}
                      className='h-12 w-12 rounded-full bg-primary disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center shadow-lg shadow-primary/20 disabled:shadow-none hover:bg-primary-dark transition-all active:scale-95 shrink-0'
                    >
                      <Send size={20} className={inputText.trim() ? 'ml-0.5' : ''} />
                    </button>
                  </form>
                </div>
              </div>

              {/* 3. Right Info Panel */}
              <div className={`w-[260px] shrink-0 bg-white dark:bg-surface-dark border-l border-gray-200 dark:border-white/5 flex-col h-full animate-slideLeft ${showDetailsPanel ? 'flex' : 'hidden'} min-[860px]:flex`}>
                <div className='flex border-b border-gray-200 dark:border-white/5 p-2 gap-1.5'>
                  <button
                    onClick={() => setActiveRightTab('ticket')}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${activeRightTab === 'ticket' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    Chamado
                  </button>
                  <button
                    onClick={() => setActiveRightTab('owner')}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${activeRightTab === 'owner' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                  >
                    Proprietário
                  </button>
                  <button
                    onClick={() => setShowDetailsPanel(false)}
                    className='p-1.5 text-slate-400 hover:text-slate-600 min-[860px]:hidden'
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className='flex-1 overflow-y-auto'>
                  {activeRightTab === 'ticket' ? (
                    <div className='p-4 space-y-5'>
                      <div>
                        <span className='text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1'>
                          ID do Ticket
                        </span>
                        <p className='text-sm font-bold text-slate-900 dark:text-white'>#{selectedTicket.id.slice(0, 8)}</p>
                        <span className='text-[11px] text-slate-500'>{selectedTicket.category}</span>
                      </div>

                      <div className='space-y-3'>
                        <h4 className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                          Responsável
                        </h4>
                        <div className='relative'>
                          <select
                            value={selectedTicket.assigned_to || ''}
                            onChange={(e) => handleAssign(selectedTicket.id, e.target.value || null)}
                            className='w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-xl text-[11px] font-bold text-slate-700 dark:text-white appearance-none focus:ring-2 focus:ring-primary outline-none cursor-pointer'
                          >
                            <option value=''>Não atribuído</option>
                            <option value={currentUser?.id}>Minha Fila</option>
                          </select>
                          <ChevronDown className='absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' size={14} />
                        </div>
                      </div>

                      <div className='space-y-3 pt-4 border-t border-gray-100 dark:border-white/5'>
                        <h4 className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                          SLA e Tempos
                        </h4>
                        <div className='flex items-start gap-3'>
                          <div className='w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0'>
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p className='text-[9px] font-bold text-slate-400 uppercase'>Abertura</p>
                             <p className='text-[11px] font-bold text-slate-700 dark:text-slate-200'>
                              {new Date(selectedTicket.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-start gap-3'>
                          <div className='w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0'>
                            <History size={14} />
                          </div>
                          <div>
                            <p className='text-[9px] font-bold text-slate-400 uppercase'>Status SLA</p>
                            <p className={`text-[11px] font-bold ${getSLAStatus(selectedTicket).color}`}>
                              {getSLAStatus(selectedTicket).label}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='p-4 space-y-5'>
                      <div className='flex flex-col items-center text-center pb-4 border-b border-gray-200 dark:border-white/5'>
                        <div className='w-16 h-16 rounded-full bg-slate-200 dark:bg-white/10 mb-2 overflow-hidden border-2 border-primary/20'>
                          {selectedTicket.ownerAvatar ? (
                            <img src={selectedTicket.ownerAvatar} alt='' className='w-full h-full object-cover' />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-slate-400'>
                              <User size={32} />
                            </div>
                          )}
                        </div>
                        <h4 className='text-sm font-bold text-slate-900 dark:text-white'>{selectedTicket.owner}</h4>
                        <p className='text-[11px] text-slate-500'>Membro desde Jan 2023</p>
                      </div>

                      <div className='space-y-3'>
                        <div className='grid grid-cols-2 gap-2'>
                          <div className='p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30'>
                            <span className='text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-0.5'>Imóveis</span>
                            <p className='text-xs font-black text-emerald-700 dark:text-emerald-300'>12 Ativos</p>
                          </div>
                          <div className='p-2 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30'>
                            <span className='text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase block mb-0.5'>Plano</span>
                            <p className='text-xs font-black text-blue-700 dark:text-blue-300'>PRO</p>
                          </div>
                        </div>

                        <div className='p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-2'>
                          <div className='flex justify-between items-center'>
                            <span className='text-[10px] font-bold text-slate-500'>MRR Contribuído</span>
                            <span className='text-xs font-black dark:text-white'>R$ 1.450</span>
                          </div>
                          <div className='w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden'>
                            <div className='h-full bg-primary w-[85%]' />
                          </div>
                        </div>

                        <div className='space-y-1.5'>
                          <h5 className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>Histórico Recente</h5>
                          {[
                            { label: 'Plano renovado', date: '01 Mar 2024', icon: FileCheck },
                            { label: 'Novo imóvel cadastrado', date: '15 Fev 2024', icon: History },
                          ].map((act, i) => (
                            <div key={i} className='flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer'>
                              <div className='size-7 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center text-slate-400 shrink-0'>
                                <act.icon size={14} />
                              </div>
                              <div className='min-w-0'>
                                <p className='text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate'>{act.label}</p>
                                <p className='text-[9px] text-slate-500'>{act.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='pt-3 border-t border-gray-200 dark:border-white/5 space-y-2'>
                        <button className='w-full py-2.5 rounded-xl bg-primary text-white text-[11px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all'>
                          <ExternalLink size={14} /> Ver Perfil Admin
                        </button>
                        <button className='w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all'>
                          <Phone size={14} /> WhatsApp
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className='hidden md:flex flex-1 flex-col items-center justify-center text-center p-6 text-slate-400'>
            <div className='w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4'>
              <MessageSquare size={32} className='opacity-50' />
            </div>
            <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-2'>
              Central de Atendimento
            </h3>
            <p className='max-w-xs text-sm'>
              Selecione um ticket na lista à esquerda para iniciar o atendimento e resolver solicitações.
            </p>
          </div>
        )}
      </div>

      {showFAQManager && (
        <ModalWrapper
          onClose={() => setShowFAQManager(false)}
          title='Gerenciar Dúvidas Frequentes'
          showCloseButton={true}
          className='max-w-3xl'
        >
          <div className='p-6 bg-background-light dark:bg-background-dark min-h-[500px] flex flex-col gap-6'>
            {/* Editor / Add Form */}
            <div className='p-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm space-y-4'>
              <h3 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2'>
                {editingFaq ? <Edit size={16} /> : <Plus size={16} />}
                {editingFaq ? 'Editar Pergunta' : 'Nova Pergunta'}
              </h3>

              <div className='space-y-4'>
                <div>
                  <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1'>
                    Pergunta
                  </label>
                  <input
                    type='text'
                    value={editingFaq ? editingFaq.question : newFaq.question}
                    onChange={(e) => editingFaq ? setEditingFaq({ ...editingFaq, question: e.target.value }) : setNewFaq({ ...newFaq, question: e.target.value })}
                    placeholder='Ex: Como funciona o aluguel?'
                    className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-bold text-slate-900 dark:text-white'
                  />
                </div>

                <div>
                  <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1'>
                    Resposta
                  </label>
                  <textarea
                    value={editingFaq ? editingFaq.answer : newFaq.answer}
                    onChange={(e) => editingFaq ? setEditingFaq({ ...editingFaq, answer: e.target.value }) : setNewFaq({ ...newFaq, answer: e.target.value })}
                    placeholder='Descreva a resposta detalhadamente...'
                    className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium text-slate-600 dark:text-slate-300 h-24 resize-none'
                  />
                </div>

                <div className='flex items-center justify-between pt-2'>
                  <label className='flex items-center gap-2 cursor-pointer group'>
                    <div
                      onClick={() => editingFaq ? setEditingFaq({ ...editingFaq, is_active: !editingFaq.is_active }) : setNewFaq({ ...newFaq, is_active: !newFaq.is_active })}
                      className={`w-10 h-5 rounded-full relative transition-all ${((editingFaq ? editingFaq.is_active : newFaq.is_active)) ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${((editingFaq ? editingFaq.is_active : newFaq.is_active)) ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className='text-xs font-bold text-slate-500'>Visível para Inquilinos</span>
                  </label>

                  <div className='flex gap-2'>
                    {editingFaq && (
                      <button
                        onClick={() => setEditingFaq(null)}
                        className='px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all'
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={handleSaveFAQ}
                      disabled={editingFaq ? !editingFaq.question || !editingFaq.answer : !newFaq.question || !newFaq.answer}
                      className='px-6 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-2'
                    >
                      <Save size={14} />
                      {editingFaq ? 'Salvar Alterações' : 'Adicionar FAQ'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* List */}
            <div className='space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar'>
              <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                Perguntas Existentes ({faqs.length})
              </h3>

              {faqs.length === 0 ? (
                <div className='py-12 flex flex-col items-center justify-center text-slate-400 opacity-50 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl'>
                  <HelpCircle size={40} className='mb-2' />
                  <p className='text-sm font-bold'>Nenhuma FAQ cadastrada</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {[...faqs].sort((a, b) => a.order - b.order).map((faq) => (
                    <div
                      key={faq.id}
                      className={`p-4 rounded-2xl border transition-all ${editingFaq?.id === faq.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 shadow-sm'}`}
                    >
                      <div className='flex justify-between items-start gap-4 mb-2'>
                        <div className='flex-1 min-w-0'>
                          <h4 className='text-sm font-bold text-slate-900 dark:text-white mb-1'>{faq.question}</h4>
                          <p className='text-xs text-slate-500 line-clamp-2'>{faq.answer}</p>
                        </div>
                        <div className='flex items-center gap-1 shrink-0'>
                          <button
                            onClick={() => toggleFAQStatus(faq)}
                            className={`p-2 rounded-lg transition-colors ${faq.is_active ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'}`}
                            title={faq.is_active ? 'Desativar' : 'Ativar'}
                          >
                            <CheckCheck size={16} />
                          </button>
                          <button
                            onClick={() => setEditingFaq(faq)}
                            className='p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors'
                            title='Editar'
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteFAQ(faq.id)}
                            className='p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors'
                            title='Excluir'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default SupportCenter;