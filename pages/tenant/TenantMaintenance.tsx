import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Wrench,
  Clock,
  CheckCircle,
  ChevronRight,
  Zap,
  Droplets,
  Home,
  CloudRain,
  Shield,
  Smartphone,
  Sparkles,
  MoreHorizontal,
  Camera,
  Image as ImageIcon,
  Trash2,
  Send,
  User,
  MessageSquare,
  LifeBuoy,
  DollarSign,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Paperclip,
  Loader2,
} from 'lucide-react';
import { ModalWrapper } from '../../components/ui/ModalWrapper';
import { tenantService } from '../../services/tenantService';
import { FAQ } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';

interface MaintenanceMessage {
  id: string;
  content: string;
  sender_role: 'me' | 'tenant' | 'owner' | 'system' | 'admin';
  created_at: string;
  type: 'text' | 'image' | 'system' | 'file';
  url?: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  icon?: any;
  color?: string;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  type: 'repair' | 'general' | 'financial';
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'open' | 'resolved';
  description: string;
  created_at: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  messages: MaintenanceMessage[];
  timeline: TimelineEvent[];
  lastResponseDate?: string;
  surveyCompleted?: boolean;
}

const TenantMaintenance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('open');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [surveyComment, setSurveyComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Request Form State (Wizard)
  const [step, setStep] = useState(1);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Maintenance Settings
  const maintenanceSettings = {
    categories: [
      { id: 'Hidráulico', label: 'Hidráulico', enabled: true, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
      { id: 'Elétrico', label: 'Elétrico', enabled: true, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
      { id: 'Estrutural', label: 'Estrutural', enabled: true, icon: Home, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
      { id: 'Infiltração', label: 'Infiltração', enabled: true, icon: CloudRain, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
      { id: 'Fechadura / Segurança', label: 'Segurança', enabled: true, icon: Shield, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
      { id: 'Eletrodoméstico', label: 'Eletrodoméstico', enabled: true, icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
      { id: 'Limpeza / Área Comum', label: 'Limpeza', enabled: true, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
      { id: 'Outros', label: 'Outros', enabled: true, icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10' },
    ],
    urgencies: [
      { id: 'Normal', enabled: true },
      { id: 'Alta', enabled: true },
      { id: 'Emergência', enabled: true },
    ],
  };

  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: tenantProfile } = useQuery({
    queryKey: ['tenant_profile', currentUser?.id],
    queryFn: () => tenantService.getById(currentUser!.id.toString()),
    enabled: !!currentUser?.id,
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['tenant_maintenance_tickets', currentUser?.id],
    queryFn: () => tenantService.getMaintenanceRequests(currentUser!.id.toString()),
    enabled: !!currentUser?.id,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['ticket_messages', selectedRequest?.id],
    queryFn: () => tenantService.getMaintenanceMessages(selectedRequest!.id.toString()),
    enabled: !!selectedRequest?.id,
  });

  const createTicketMutation = useMutation({
    mutationFn: (newTicket: any) => tenantService.createMaintenanceRequest({
      tenant_id: currentUser!.id.toString(),
      property_id: tenantProfile?.property_id || '',
      title: newTicket.subject,
      description: newTicket.description,
      category: newTicket.category,
      priority: newTicket.priority
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant_maintenance_tickets'] });
      setShowNewRequest(false);
      resetForm();
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => tenantService.sendMaintenanceMessage(selectedRequest!.id.toString(), currentUser!.id.toString(), 'tenant', content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket_messages', selectedRequest?.id] });
      setNewMessage('');
    }
  });

  const filteredRequests = requests.filter((r: any) => {
    const matchesTab =
      activeTab === 'open'
        ? r.status === 'open' || r.status === 'in_progress' || r.status === 'pending'
        : r.status === 'completed' || r.status === 'resolved';
    const matchesSearch =
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedRequest) {
      scrollToBottom();
    }
  }, [selectedRequest?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRequest) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRequest || !currentUser) return;

    try {
      const { storageService } = await import('../../services/storageService');
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedRequest.id}/${Date.now()}.${fileExt}`;
      const bucket = 'maintenance';

      const publicUrl = await storageService.uploadFile(bucket, fileName, file);

      if (publicUrl) {
        const isImage = file.type.startsWith('image/');
        await tenantService.sendMaintenanceMessage(
          selectedRequest.id.toString(),
          currentUser.id.toString(),
          'tenant',
          isImage ? `Enviou uma imagem: ${file.name}` : `Arquivo anexado: ${file.name}`,
          isImage ? 'image' : 'file',
          publicUrl
        );

        queryClient.invalidateQueries({ queryKey: ['ticket_messages', selectedRequest.id] });
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateRequest = () => {
    createTicketMutation.mutate({
      subject: newTitle || 'Nova Solicitação',
      description: newDescription,
      category: newCategory,
      priority: urgency === 'Emergência' ? 'urgent' : urgency === 'Alta' ? 'high' : 'medium',
      images: evidencePhotos
    });
  };

  const handleWizardPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploadingPhoto(true);
    try {
      const { storageService } = await import('../../services/storageService');
      const fileExt = file.name.split('.').pop();
      const fileName = `wizard/${currentUser.id}/${Date.now()}.${fileExt}`;
      const bucket = 'maintenance';

      const publicUrl = await storageService.uploadFile(bucket, fileName, file);

      if (publicUrl) {
        setEvidencePhotos(prev => [...prev, publicUrl]);
      }
    } catch (err) {
      console.error('Error uploading wizard photo:', err);
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const resetForm = () => {
    setStep(1);
    setNewTitle('');
    setNewCategory('');
    setNewDescription('');
    setUrgency('Normal');
    setEvidencePhotos([]);
    setIsUploadingPhoto(false);
  };

  const getIconByCategory = (cat: string) => {
    if (
      ['Hidráulico', 'Elétrico', 'Estrutural', 'Infiltração', 'Fechadura / Segurança'].includes(cat)
    )
      return <Wrench size={18} />;
    if (cat === 'Financeiro') return <DollarSign size={18} />;
    return <MessageSquare size={18} />;
  };

  const getSLAInfo = (req: MaintenanceRequest) => {
    if (req.status === 'completed') return null;

    if (req.lastResponseDate) {
      return (
        <span className='text-emerald-500 font-bold'>
          Proprietário respondeu em {req.lastResponseDate}
        </span>
      );
    }

    // Simple day calculation from req.date
    // Simple day calculation from req.created_at
    const today = new Date();
    const createdDate = new Date(req.created_at);
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 2) {
      return (
        <span className='text-orange-500 font-bold text-[10px]'>Aguardando resposta há {diffDays} dias</span>
      );
    }

    return <span className='text-slate-400 text-[10px]'>Previsão de retorno: até 24h</span>;
  };

  const handleSurveyResponse = async (resolved: boolean) => {
    if (!selectedRequest) return;

    try {
      // 1. Update request status
      await tenantService.updateMaintenanceRequest(selectedRequest.id.toString(), {
        status: resolved ? 'completed' : 'pending'
      });

      // 2. Add system message
      await tenantService.sendMaintenanceMessage(
        selectedRequest.id.toString(),
        'system',
        'system',
        resolved
          ? `Avaliação concluída: Resolvido. Comentário: ${surveyComment || 'Nenhum'}`
          : `Avaliação concluída: Ainda persiste. Comentário: ${surveyComment || 'Nenhum'}`
      );

      // 3. Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['tenant_maintenance_tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket_messages', selectedRequest.id] });
      
      setSelectedRequest(null);
      setSurveyComment('');
    } catch (err) {
      console.error('Error updating survey response:', err);
    }
  };

  const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<string | null>(null);
    const [faqs, setFaqs] = useState<FAQ[]>([]);

    useEffect(() => {
      const fetchFaqs = async () => {
        const { faqService } = await import('../../services/faqService');
        const data = await faqService.getActiveFAQs();
        setFaqs(data);
      };
      fetchFaqs();
    }, []);

    if (faqs.length === 0) return null;

    return (
      <div className='mb-8'>
        <div className='flex items-center gap-2 mb-4 px-1'>
          <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
            <HelpCircle size={18} />
          </div>
          <h3 className='font-bold text-slate-900 dark:text-white'>
            Dúvidas Frequentes
          </h3>
        </div>
        <div className='grid grid-cols-1 gap-3'>
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className='group bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300'
            >
              <button
                onClick={() => setOpenIndex(openIndex === faq.id ? null : faq.id)}
                className='w-full flex justify-between items-center p-4 text-left font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors'
              >
                <span className='pr-4'>{faq.question}</span>
                <div className={`shrink-0 p-1.5 rounded-lg transition-all ${openIndex === faq.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                  {openIndex === faq.id ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </div>
              </button>
              {openIndex === faq.id && (
                <div className='px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5 pt-0 border-t border-gray-50 dark:border-white/5 leading-relaxed animate-fadeIn'>
                  <div className='pt-3 border-t border-gray-100 dark:border-white/5'>
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className='flex flex-col h-full w-full max-w-md mx-auto md:max-w-4xl relative bg-background-light dark:bg-background-dark'>
      <header className='sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors'>
        <div>
          <h1 className='text-xl font-bold text-slate-900 dark:text-white'>Central de Ajuda</h1>
          <p className='text-sm text-slate-500 dark:text-slate-400'>Solicitações e Suporte</p>
        </div>
        <button
          onClick={() => setShowNewRequest(true)}
          className='flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all active:scale-95'
        >
          <Plus size={20} />
          <span className='text-sm font-bold hidden md:inline'>Abrir Chamado</span>
        </button>
      </header>

      <div className='px-6 py-4 space-y-4 sticky top-[73px] z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5'>
        <div className='flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl'>
          <button
            onClick={() => setActiveTab('open')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'open' ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Em Aberto
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Concluídos
          </button>
        </div>

        <div className='relative'>
          <input
            type='text'
            placeholder='Buscar solicitações...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full h-11 pl-11 pr-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm'
          />
          <HelpCircle className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-6 pb-24 pt-4'>
        {activeTab === 'open' && !showNewRequest && <FAQSection />}

        <div className='space-y-4'>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className='bg-white dark:bg-surface-dark p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 cursor-pointer group relative overflow-hidden'
              >
                <div className='flex justify-between items-start mb-4'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors'>
                      {getIconByCategory(req.category)}
                    </div>
                    <div>
                      <h3 className='font-black text-slate-900 dark:text-white leading-tight mb-0.5'>
                        {req.title}
                      </h3>
                      <div className='flex items-center gap-2'>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>{req.category}</span>
                        <span className='w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700' />
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>#{req.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.priority === 'urgent'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : req.priority === 'high'
                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                    >
                      {req.priority === 'urgent' ? 'Urgente' : req.priority === 'high' ? 'Alta' : 'Normal'}
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'open' || req.status === 'pending'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : req.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}
                    >
                      {req.status === 'open' || req.status === 'pending'
                        ? 'Pendente'
                        : req.status === 'in_progress'
                          ? 'Em Andamento'
                          : 'Resolvido'}
                    </div>
                  </div>
                </div>

                <p className='text-sm text-slate-600 dark:text-slate-300 mb-5 line-clamp-2 pl-1'>
                  {req.description}
                </p>

                <div className='flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-1.5 text-[11px] font-bold text-slate-400'>
                      <Clock size={14} /> {new Date(req.created_at).toLocaleDateString()}
                    </div>
                    {req.status !== 'completed' && (
                      <div className='flex items-center gap-1.5 text-[11px] font-black italic'>
                        {getSLAInfo(req)}
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-1 text-[11px] font-black text-primary uppercase tracking-widest group-hover:gap-2 transition-all'>
                    Ver Detalhes <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500'>
              <div className='w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4'>
                <LifeBuoy size={32} className='opacity-50' />
              </div>
              <p className='text-sm font-medium'>Nenhuma solicitação encontrada.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal (Wizard) */}
      {showNewRequest && (
        <ModalWrapper
          onClose={() => {
            setShowNewRequest(false);
            resetForm();
          }}
          title='Nova Solicitação'
          showCloseButton={true}
        >
          <div className='flex-1 overflow-y-auto p-6 bg-background-light dark:bg-background-dark'>
            {/* Progress Steps */}
            <div className='flex justify-between mb-8 px-4'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-1 ${step >= i ? 'text-primary' : 'text-slate-300'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5'}`}
                  >
                    {i}
                  </div>
                  <span className='text-[10px] font-bold uppercase'>
                    {i === 1 ? 'Tipo' : i === 2 ? 'Detalhes' : 'Confirmar'}
                  </span>
                </div>
              ))}
            </div>

            <div className='space-y-6'>
              {step === 1 && (
                <div className='animate-fadeIn'>
                  <div className='mb-6'>
                    <h4 className='text-lg font-black text-slate-900 dark:text-white mb-1'>O que aconteceu?</h4>
                    <p className='text-xs text-slate-500'>Selecione a categoria que melhor descreve o seu problema.</p>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    {maintenanceSettings.categories
                      .filter((c) => c.enabled)
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setNewCategory(cat.id)}
                          className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-500 group relative overflow-hidden ${newCategory === cat.id
                              ? 'bg-primary/10 border-primary text-primary shadow-2xl shadow-primary/20 scale-[1.02]'
                              : 'border-slate-100 dark:border-white/5 bg-white dark:bg-surface-dark hover:border-primary/30 hover:scale-[1.01] text-slate-600 dark:text-slate-400'
                            }`}
                        >
                          <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 ${newCategory === cat.id ? 'bg-primary text-white' : `${cat.bg} ${cat.color}`}`}>
                            <cat.icon size={28} strokeWidth={1.5} />
                          </div>
                          <span className='text-[11px] font-black text-center uppercase tracking-[0.15em]'>{cat.label}</span>
                          
                          {newCategory === cat.id && (
                            <div className='absolute top-2 right-2'>
                              <CheckCircle size={16} className='text-primary' />
                            </div>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className='animate-fadeIn space-y-5'>
                  <div>
                    <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1'>
                      Título da Solicitação
                    </label>
                    <input
                      type='text'
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className='w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-white font-bold placeholder-slate-400'
                      placeholder='Ex: Vazamento na pia da cozinha'
                    />
                  </div>

                  <div>
                    <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1'>
                      Descrição Detalhada
                    </label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className='w-full px-5 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-slate-900 dark:text-white font-medium resize-none h-40 placeholder-slate-400'
                      placeholder='Descreva o problema com o máximo de detalhes possível para agilizar o atendimento...'
                    ></textarea>
                  </div>

                  <div>
                    <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1'>
                      Fotos de Evidência (Opcional)
                    </label>
                    <div className='grid grid-cols-3 gap-3'>
                      {evidencePhotos.map((photo, idx) => (
                        <div key={idx} className='relative aspect-square rounded-xl overflow-hidden group'>
                          <img src={photo} className='w-full h-full object-cover' />
                          <button 
                            onClick={() => setEvidencePhotos(prev => prev.filter((_, i) => i !== idx))}
                            className='absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {evidencePhotos.length < 3 && (
                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handleWizardPhotoUpload(e as any);
                            input.click();
                          }}
                          disabled={isUploadingPhoto}
                          className='aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-400'
                        >
                          {isUploadingPhoto ? <Loader2 size={20} className='animate-spin' /> : (
                            <>
                              <Camera size={20} />
                              <span className='text-[8px] font-black uppercase'>Adicionar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1'>
                      Nível de Urgência
                    </label>
                    <div className='flex bg-slate-100 dark:bg-black/20 p-1.5 rounded-[20px] gap-1'>
                      {maintenanceSettings.urgencies
                        .filter((u) => u.enabled)
                        .map((level) => {
                          const isSelected = urgency === level.id;
                          return (
                            <button
                              key={level.id}
                              onClick={() => setUrgency(level.id)}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected
                                  ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-lg'
                                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                            >
                              {level.id}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className='animate-fadeIn space-y-6'>
                  <div className='bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl shadow-black/5'>
                    <div className='flex items-center gap-4 mb-6 pb-6 border-b border-slate-50 dark:border-white/5'>
                      <div className='w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center'>
                        {(() => {
                          const cat = maintenanceSettings.categories.find(c => c.id === newCategory);
                          const Icon = cat?.icon || LifeBuoy;
                          return <Icon size={24} />;
                        })()}
                      </div>
                      <div>
                        <h4 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider'>{newCategory}</h4>
                        <p className='text-[10px] text-slate-500 font-bold'>CATEGORIA DA SOLICITAÇÃO</p>
                      </div>
                    </div>
                    
                    <div className='space-y-4'>
                      <div>
                        <p className='text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1'>Assunto</p>
                        <p className='text-sm font-bold text-slate-900 dark:text-white'>{newTitle}</p>
                      </div>
                      <div>
                        <p className='text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1'>Urgência</p>
                        <div className='inline-flex px-3 py-1 rounded-full bg-slate-100 dark:bg-black/20 text-[10px] font-black uppercase tracking-tighter text-slate-600 dark:text-slate-400'>
                          {urgency}
                        </div>
                      </div>
                      {evidencePhotos.length > 0 && (
                        <div>
                          <p className='text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2'>Fotos Anexadas</p>
                          <div className='flex gap-2'>
                            {evidencePhotos.map((p, i) => (
                              <div key={i} className='w-12 h-12 rounded-lg overflow-hidden border border-slate-100 dark:border-white/10'>
                                <img src={p} className='w-full h-full object-cover' />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20'>
                    <p className='text-[10px] text-blue-600 dark:text-blue-400 font-bold text-center leading-relaxed'>
                      Ao confirmar, nossa equipe e o proprietário serão notificados. Você poderá acompanhar o status e conversar via chat em tempo real.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='p-6 bg-background-light dark:bg-background-dark border-t border-gray-100 dark:border-white/5 flex gap-3'>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className='h-12 px-6 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold'
              >
                Voltar
              </button>
            )}
            <button
              onClick={() => (step < 3 ? setStep(step + 1) : handleCreateRequest())}
              disabled={
                (step === 1 && !newCategory) || (step === 2 && (!newTitle || !newDescription))
              }
              className='flex-1 h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50'
            >
              {step === 3 ? 'Confirmar Envio' : 'Próximo'}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Details & Chat Modal */}
      {selectedRequest && (
        <ModalWrapper
          onClose={() => setSelectedRequest(null)}
          title='Detalhes do Chamado'
          showCloseButton={true}
          className='md:max-w-2xl'
        >
          <div className='flex flex-col h-[85vh] md:h-[600px] bg-background-light dark:bg-background-dark'>
            {/* Timeline Header */}
            <div className='bg-white dark:bg-surface-dark p-4 border-b border-gray-100 dark:border-gray-800'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='font-bold text-slate-900 dark:text-white text-lg'>
                    {selectedRequest.title}
                  </h3>
                  <div className='flex items-center gap-2 mt-2'>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedRequest.priority === 'urgent'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : selectedRequest.priority === 'high'
                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                    >
                      Prioridade {selectedRequest.priority === 'urgent' ? 'Urgente' : selectedRequest.priority === 'high' ? 'Alta' : 'Normal'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedRequest.status === 'open' || selectedRequest.status === 'pending'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : selectedRequest.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}
                    >
                      {selectedRequest.status === 'open' || selectedRequest.status === 'pending'
                        ? 'Pendente'
                        : selectedRequest.status === 'in_progress'
                          ? 'Em Andamento'
                          : 'Resolvido'}
                    </span>
                  </div>
                </div>
              </div>
              <div className='mt-4 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5'>
                <p className='text-xs font-bold text-slate-500 uppercase tracking-wider mb-1'>
                  Status do Prazo
                </p>
                <div className='text-sm'>{getSLAInfo(selectedRequest)}</div>
              </div>
              <div className='mt-4 relative pl-4 border-l-2 border-slate-200 dark:border-gray-700 space-y-4'>
                <div className='relative'>
                  <div className='absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-dark'></div>
                  <p className='text-sm font-bold text-slate-800 dark:text-white'>Solicitação Criada</p>
                  <p className='text-xs text-slate-500'>{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                </div>
                {selectedRequest.status !== 'pending' && (
                  <div className='relative'>
                    <div className='absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-surface-dark'></div>
                    <p className='text-sm font-bold text-slate-800 dark:text-white'>Em Atendimento</p>
                    <p className='text-xs text-slate-500'>O proprietário iniciou a análise</p>
                  </div>
                )}
                {selectedRequest.status === 'completed' && (
                  <div className='relative'>
                    <div className='absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white dark:border-surface-dark'></div>
                    <p className='text-sm font-bold text-slate-800 dark:text-white'>Finalizado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Section */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-black/10'>
              <div className='flex items-center gap-2 justify-center py-2 opacity-60'>
                <div className='h-px bg-slate-300 dark:bg-slate-700 w-12'></div>
                <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1'>
                  <MessageSquare size={12} /> Mensagens
                </span>
                <div className='h-px bg-slate-300 dark:bg-slate-700 w-12'></div>
              </div>

              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_role === 'tenant' ? 'justify-end' : msg.sender_role === 'system' ? 'justify-center' : 'justify-start'}`}
                >
                  {msg.sender_role === 'system' ? (
                    <div className='bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide my-2 shadow-sm'>
                      {msg.content}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[85%] flex flex-col ${msg.sender_role === 'tenant' ? 'items-end' : 'items-start'}`}
                    >
                      <div className='flex items-end gap-2'>
                        {(msg.sender_role === 'owner' || msg.sender_role === 'admin') && (
                          <div className='w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-[10px] overflow-hidden shrink-0'>
                            <User size={12} />
                          </div>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.sender_role === 'tenant'
                              ? 'bg-primary text-white rounded-tr-sm'
                              : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-white rounded-tl-sm border border-gray-100 dark:border-gray-700'
                            }`}
                        >
                          {msg.type === 'image' && msg.url ? (
                            <div className='space-y-2'>
                              <img 
                                src={msg.url} 
                                alt='Anexo' 
                                className='max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity'
                                onClick={() => window.open(msg.url, '_blank')}
                              />
                              <p className='text-xs opacity-80'>{msg.content}</p>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                      </div>
                      <span className='text-[10px] text-slate-400 font-medium mt-1 px-1 mx-8'>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {selectedRequest.status === 'completed' && !selectedRequest.surveyCompleted && (
                <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-primary/20 shadow-xl space-y-4 animate-fadeIn my-4'>
                  <div className='flex items-center gap-3 text-primary'>
                    <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h4 className='font-bold text-slate-900 dark:text-white'>O problema foi resolvido?</h4>
                      <p className='text-xs text-slate-500'>Sua avaliação ajuda a manter a qualidade do imóvel.</p>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <textarea
                      value={surveyComment}
                      onChange={(e) => setSurveyComment(e.target.value.slice(0, 200))}
                      placeholder='Deixe um comentário (opcional)...'
                      className='w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm resize-none h-20'
                    />
                    <div className='flex justify-end'>
                      <span className='text-[10px] text-slate-400 font-medium'>{surveyComment.length}/200</span>
                    </div>
                  </div>

                  <div className='flex gap-3'>
                    <button
                      onClick={() => handleSurveyResponse(false)}
                      className='flex-1 h-11 rounded-xl border-2 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-all'
                    >
                      Não, ainda persiste
                    </button>
                    <button
                      onClick={() => handleSurveyResponse(true)}
                      className='flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95'
                    >
                      Sim, resolvido
                    </button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className='p-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 shrink-0 z-20'>
              <form onSubmit={handleSendMessage} className='flex gap-2'>
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
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder='Digite sua mensagem...'
                  className='flex-1 h-11 px-4 rounded-xl bg-slate-100 dark:bg-black/20 border-none focus:ring-2 focus:ring-primary/50 outline-none text-sm text-slate-900 dark:text-white transition-all'
                />
                <button
                  type='submit'
                  disabled={!newMessage.trim()}
                  className='h-11 w-11 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:shadow-none'
                >
                  <Send size={18} className={newMessage.trim() ? 'ml-0.5' : ''} />
                </button>
              </form>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default TenantMaintenance;
