import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../../services/adminService';
import { faqService } from '../../../services/faqService';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { FAQ, User as UserType } from '../../../types';

export interface Message {
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

export function useSupportCenter() {
  const { user: currentUser, startImpersonation } = useAuth();
  const { addToast } = useNotification();
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    'Estamos verificando seu faturamento.',
    'Estorno processado com sucesso.',
    'Pode nos enviar um print do erro?',
    'Ticket resolvido, obrigado pelo contato.',
  ];

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
      adminService.sendTicketMessage(selectedTicketId!, String(currentUser!.id), 'admin', content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_messages', selectedTicketId] });
      setInputText('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => adminService.updateTicketStatus(selectedTicketId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
      addToast('Status atualizado', 'Status atualizado com sucesso', 'success');
    },
  });

  const assignTicketMutation = useMutation({
    mutationFn: (adminId: string | null) => adminService.assignTicket(selectedTicketId!, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
      addToast('Responsável alterado', 'Responsável alterado com sucesso', 'success');
    },
  });

  const selectedTicket = tickets.find((t: any) => t.id === selectedTicketId);

  const handleSendMessage = (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() || !selectedTicketId) return;
    sendMessageMutation.mutate(textToSend);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTicketId) return;
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
    if (ticket.status === 'Resolvido' || ticket.status === 'Fechado')
      return { label: 'Concluído', color: 'text-emerald-500', type: 'success' as const };

    const createdAt = new Date(ticket.created_at);
    const diff = Math.abs(new Date().getTime() - createdAt.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const thresholds: any = { Alta: 8, Média: 24, Baixa: 72, Urgente: 2 };
    const limit = thresholds[ticket.priority] || 24;

    if (hours >= limit)
      return {
        label: `SLA em risco — ${hours}h sem resposta`,
        color: 'text-rose-500',
        type: 'danger' as const,
      };
    if (hours >= 2)
      return {
        label: `Sem resposta há ${hours}h`,
        color: 'text-amber-500',
        type: 'warning' as const,
      };
    return { label: `Aberto há ${mins} min`, color: 'text-slate-400', type: 'muted' as const };
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

  const clearFilters = () => {
    setPriorityFilter('Todos');
    setAssigneeFilter('Todos');
    setStatusFilter('Todos');
    setSearchTerm('');
  };

  return {
    currentUser,
    startImpersonation,
    selectedTicketId,
    setSelectedTicketId,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    showDetailsPanel,
    setShowDetailsPanel,
    showFAQManager,
    setShowFAQManager,
    faqs,
    setFaqs,
    editingFaq,
    setEditingFaq,
    newFaq,
    setNewFaq,
    activeRightTab,
    setActiveRightTab,
    inputText,
    setInputText,
    isActionsLocked,
    setIsActionsLocked,
    fileInputRef,
    messagesEndRef,
    quickReplies,
    tickets,
    loadingTickets,
    messages,
    loadingMessages,
    sendMessageMutation,
    updateStatusMutation,
    assignTicketMutation,
    selectedTicket,
    filteredTickets,
    handleSaveFAQ,
    handleDeleteFAQ,
    toggleFAQStatus,
    handleSendMessage,
    handleFileUpload,
    handleStatusChange,
    getSLAStatus,
    handleAssign,
    clearFilters,
  };
}
