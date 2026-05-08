import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Search,
  Phone,
  Mail,
  ChevronRight,
  Plus,
  User,
  Briefcase,
  FileText,
  X,
  CloudUpload,
  Trash2,
  Filter,
  DollarSign,
  MessageCircle,
  Star,
  History,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { TenantDetails } from '../components/tenants/TenantDetails';
import { BillingModal } from '../components/tenants/BillingModal';
import { tenantService } from '../services/tenantService';
import { propertyService } from '../services/propertyService';
import { useNotification } from '../context/NotificationContext';
import { formatCPF, formatPhone } from '../utils/formatters';
import { Tenant } from '../types';

import { useAuth } from '../context/AuthContext';

const Tenants: React.FC = () => {
  const { user, tokenReady } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [billingTenant, setBillingTenant] = useState<Tenant | null>(null);
  const { addToast } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Liquidado' | 'Vencendo' | 'Atrasado'>(
    'Todos'
  );
  const location = useLocation();

  const queryClient = useQueryClient();
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants', user?.id],
    queryFn: () => tenantService.getAll(),
    enabled: !!user && tokenReady,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: () => propertyService.getAll(),
    enabled: !!user && tokenReady,
    staleTime: 0,
  });

  // Form State
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    propertyId: '',
    sendInvite: true,
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: (data: any) => (data.sendInvite ? tenantService.invite(data) : tenantService.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsSuccess(true);
      addToast(
        newTenant.sendInvite ? 'Convite Enviado' : 'Inquilino Adicionado',
        newTenant.sendInvite 
          ? `O convite foi enviado para ${newTenant.email} com sucesso.`
          : `O inquilino ${newTenant.name} foi cadastrado com sucesso.`,
        'success'
      );
    },
    onError: (error: any) => {
      addToast('Erro', `Ocorreu um erro ao processar: ${error.message}`, 'error');
    },
  });

  useEffect(() => {
    if (location.state && (location.state as any).openAdd) {
      setShowAddForm(true);
      window.history.replaceState({}, document.title);
    }

    // Deep linking support: open tenant profile if ID is in URL
    const params = new URLSearchParams(location.search);
    const idParam = params.get('id');
    if (idParam) {
      setSelectedTenantId(idParam);
      // Remove ID from URL to avoid reopening on refresh if not intended
      // but keep it if we want persistent links. Usually, it's better to keep it
      // so the user can share the link.
    }
  }, [location]);

  const handleAction = (e: React.MouseEvent, type: 'tel' | 'mailto', value: string) => {
    e.stopPropagation();
    window.location.href = `${type}:${value}`;
  };

  const getPaymentStatus = (tenant: Tenant) => {
    // 1. Onboarding & Setup States (Prevent false alerts)
    if ((tenant as any).is_pending) {
      return {
        type: 'Pendente',
        label: 'Convite Pendente',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      };
    }

    if (!(tenant as any).property_id && !tenant.property) {
      return {
        type: 'Incompleto',
        label: 'Sem Imóvel',
        color: 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400',
      };
    }

    // 2. Payment Logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const lastPayment = tenant.last_payment_date ? new Date(tenant.last_payment_date) : null;
    const isPaidThisMonth =
      lastPayment && lastPayment.getMonth() === currentMonth && lastPayment.getFullYear() === currentYear;

    if (isPaidThisMonth) {
      return {
        type: 'Liquidado',
        label: 'Liquidado',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      };
    }

    const dueDay = tenant.due || 10;
    const dueDate = new Date(currentYear, currentMonth, dueDay);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        type: 'Vencendo',
        label: `Vence em ${diffDays} dias`,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      };
    } else if (diffDays === 0) {
      return {
        type: 'Vencendo',
        label: 'Vence hoje',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      };
    } else {
      return {
        type: 'Atrasado',
        label: `Atrasado ${Math.abs(diffDays)} dias`,
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      };
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.cpf && t.cpf.includes(searchTerm));

    if (statusFilter === 'Todos') return matchesSearch;

    const status = getPaymentStatus(t);
    return matchesSearch && status.type === statusFilter;
  });

  const handleWhatsAppInvite = (e: React.MouseEvent, tenant: any) => {
    e.stopPropagation();
    const baseUrl = window.location.origin;
    const message = `Olá ${tenant.name}! Boas-vindas ao IGLOO. 🏠\n\nSou seu proprietário e estou te convidando para gerenciar nosso aluguel pela plataforma. Por lá você acessa boletos, assina contratos e solicita manutenção.\n\nComplete seu cadastro aqui: ${baseUrl}/signup?email=${encodeURIComponent(tenant.email)}`;
    window.open(`https://wa.me/${tenant.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-background-light dark:bg-background-dark'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col w-full max-w-md mx-auto md:max-w-5xl relative'>
      <header className='sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors'>
        <div>
          <h1 className='text-xl font-bold text-slate-900 dark:text-white tracking-tight'>
            Inquilinos
          </h1>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {tenants.length} locatários ativos
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className='flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95'
        >
          <Plus size={18} /> Novo Inquilino
        </button>
      </header>

      <div className='px-6 py-4 flex flex-col gap-4'>
        <div className='flex gap-3'>
          <div className='relative flex-1'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400'>
              <Search size={20} />
            </div>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='block w-full h-12 pl-10 pr-4 text-sm border-none rounded-2xl bg-white dark:bg-surface-dark dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary shadow-sm ring-1 ring-gray-100 dark:ring-white/5 transition-all'
              placeholder='Buscar por nome ou CPF...'
              type='text'
            />
          </div>
          <button className='h-12 w-12 flex items-center justify-center rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-slate-500 shadow-sm'>
            <Filter size={20} />
          </button>
        </div>

        {/* Status Filter Bar */}
        <div className='flex gap-2 overflow-x-auto pb-2 hide-scrollbar'>
          {['Todos', 'Liquidado', 'Vencendo', 'Atrasado'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-6 pb-24 space-y-4'>
        {filteredTenants.length > 0 ? (
          filteredTenants.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTenantId(t.id.toString())}
              className='group relative flex flex-col bg-white dark:bg-surface-dark rounded-[24px] border border-gray-100 dark:border-white/5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden'
            >
              <div className='p-5 flex items-center gap-5'>
                {/* Modern Avatar with Pattern */}
                <div className='relative shrink-0'>
                  {t.image ? (
                    <div
                      className='h-14 w-14 rounded-2xl bg-cover bg-center grayscale-[0.3] group-hover:grayscale-0 transition-all border-2 border-white dark:border-white/5 shadow-md'
                      style={{ backgroundImage: `url(${t.image})` }}
                    ></div>
                  ) : (
                    <div className='h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-xl shadow-inner relative overflow-hidden'>
                       <div className="absolute inset-0 opacity-10 pointer-events-none">
                         <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>
                       </div>
                      {t.name[0]}
                    </div>
                  )}
                </div>
 
                {/* Info Section */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between mb-1.5'>
                    <h3 className='text-slate-900 dark:text-white text-lg font-black truncate tracking-tight'>
                      {t.name}
                    </h3>
                    
                    {(() => {
                      const status = getPaymentStatus(t);
                      const isLate = status.type === 'Atrasado';
                      const isUpcoming = status.type === 'Vencendo';
                      const isPaid = status.type === 'Liquidado';
                      const isPending = status.type === 'Pendente';

                      return (
                        <div className='flex items-center gap-2'>
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${
                            isLate 
                              ? 'bg-rose-500 text-white' 
                              : isUpcoming
                              ? 'bg-amber-500 text-white'
                              : isPending
                              ? 'bg-slate-400 text-white'
                              : 'bg-emerald-500 text-white'
                          }`}>
                            {status.label}
                          </span>
                          {isPending && (
                            <div className="group/help relative">
                              <span 
                                className='flex items-center justify-center w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 text-[9px] font-black text-slate-400 dark:text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all'
                              >
                                ?
                              </span>
                              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover/help:opacity-100 pointer-events-none transition-all z-20 shadow-xl">
                                Convite enviado, aguardando ativação do locatário.
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
 
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-1 text-slate-400 dark:text-slate-500'>
                      <Building2 size={12} strokeWidth={2.5} />
                      <p className='text-[10px] font-black uppercase tracking-wider truncate max-w-[120px]'>
                        {t.property || (t as any).contract?.property?.name || 'NÃO VINCULADO'}
                      </p>
                    </div>
                    <span className='text-slate-300 dark:text-slate-800 font-black'>•</span>
                    <p className='text-slate-900 dark:text-white text-xs font-black tracking-tight'>
                      R$ {Number((t as any).contract?.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
 
                  {/* Clean Actions Area */}
                  <div className='flex gap-2 mt-5'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/messages?tenantId=${t.id}`;
                      }}
                      className='h-8 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-95 shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest'
                    >
                      <MessageCircle size={12} strokeWidth={2.5} /> Mensagem
                    </button>
                    {(t as any).is_pending ? (
                      <button
                        onClick={(e) => handleWhatsAppInvite(e, t)}
                        className='h-8 px-4 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 shadow-md shadow-emerald-500/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest'
                      >
                        <Phone size={12} strokeWidth={2.5} /> WhatsApp
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setBillingTenant(t); }}
                        className='h-8 px-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-primary/50 hover:text-primary active:scale-95 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest'
                      >
                        <DollarSign size={12} strokeWidth={2.5} /> Cobrar
                      </button>
                    )}
                  </div>
                </div>
 
                {/* Navigation Indicator */}
                <div className='shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all'>
                  <ChevronRight className='text-primary' size={24} strokeWidth={3} />
                </div>
              </div>
              
              {/* Context Indicator Line */}
              {(() => {
                const status = getPaymentStatus(t);
                if (status.type === 'Atrasado') return <div className='absolute bottom-0 left-0 right-0 h-1 bg-red-500 shadow-[0_-2px_8px_rgba(239,68,68,0.5)]'></div>;
                if (status.type === 'Vencendo') return <div className='absolute bottom-0 left-0 right-0 h-1 bg-amber-500 shadow-[0_-2px_8px_rgba(245,158,11,0.5)]'></div>;
                return null;
              })()}
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400'>
            <User size={48} className='mb-4 opacity-20' />
            <p className='text-sm font-medium'>Nenhum inquilino encontrado</p>
          </div>
        )}
      </div>


      {/* Add Tenant Modal */}
      {showAddForm && (
        <div className='fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-fadeIn'>
          <div className='w-full h-[95vh] md:h-auto md:max-h-[85vh] md:max-w-md bg-background-light dark:bg-background-dark rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp ring-1 ring-white/10'>
            <header className='flex items-center justify-between px-6 py-5 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5'>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setIsSuccess(false);
                  setNewTenant({ name: '', email: '', phone: '', cpf: '', propertyId: '', sendInvite: true });
                }}
                className='text-slate-500 dark:text-slate-400 text-sm font-bold hover:text-slate-800 dark:hover:text-white transition-colors px-2'
              >
                {isSuccess ? 'Fechar' : 'Cancelar'}
              </button>
              <div className="text-center">
                <h1 className='text-slate-900 dark:text-white text-base font-black uppercase tracking-tight'>Novo Inquilino</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cadastro & Convite</p>
              </div>
              {!isSuccess && (
                <button 
                  onClick={() => inviteMutation.mutate(newTenant)}
                  disabled={inviteMutation.isPending || !newTenant.name || !newTenant.email || !newTenant.email.includes('@')}
                  className='bg-primary text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-30 shadow-lg shadow-primary/20'
                >
                  {inviteMutation.isPending ? '...' : 'Salvar'}
                </button>
              )}
            </header>

            {isSuccess ? (
              <div className='flex-1 flex flex-col items-center justify-center px-8 py-12 text-center animate-fadeIn'>
                <div className='w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce'>
                  <CheckCircle size={40} />
                </div>
                <h2 className='text-2xl font-black text-slate-900 dark:text-white mb-2'>Sucesso!</h2>
                <p className='text-slate-500 dark:text-slate-400 text-sm mb-8'>
                  {newTenant.sendInvite 
                    ? `O convite foi enviado para ${newTenant.name}. Agora ele pode completar o cadastro.`
                    : `O inquilino ${newTenant.name} foi cadastrado com sucesso no sistema.`}
                </p>
                
                <div className='w-full space-y-3'>
                  <button 
                    onClick={() => {
                      // Logic to redirect to contract creation wizard with this tenant selected
                      console.log('Redirecting to contract wizard for:', newTenant);
                      addToast('Em breve', 'Módulo de criação de contrato via atalho em desenvolvimento.', 'info');
                    }}
                    className='w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2'
                  >
                    <FileText size={18} /> Gerar Contrato Agora
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddForm(false);
                      setIsSuccess(false);
                      setNewTenant({ name: '', email: '', phone: '', cpf: '', propertyId: '', sendInvite: true });
                    }}
                    className='w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-all'
                  >
                    Concluir
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex-1 overflow-y-auto px-6 py-8 space-y-8 hide-scrollbar'>
              {/* Profile Data Group */}
              <div className="space-y-4">
                <h2 className='text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4'>Dados do Locatário</h2>
                
                <div className='grid grid-cols-1 gap-4'>
                  {/* Name */}
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase ml-1'>Nome Completo</label>
                    <div className='relative group'>
                      <User className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors' size={18} />
                      <input
                        value={newTenant.name}
                        onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                        className='w-full pl-12 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary dark:text-white placeholder-slate-400 transition-all text-sm font-medium'
                        placeholder='Ex: João da Silva'
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase ml-1'>E-mail Principal</label>
                    <div className='relative group'>
                      <Mail className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors' size={18} />
                      <input
                        value={newTenant.email}
                        onChange={(e) => setNewTenant(prev => ({ ...prev, email: e.target.value }))}
                        className='w-full pl-12 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary dark:text-white placeholder-slate-400 transition-all text-sm font-medium'
                        placeholder='email@exemplo.com'
                        type='email'
                      />
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  {/* Phone */}
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase ml-1'>WhatsApp / Tel</label>
                    <div className='relative group'>
                      <Phone className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors' size={16} />
                      <input
                        value={newTenant.phone}
                        onChange={(e) => setNewTenant(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                        className='w-full pl-10 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary dark:text-white placeholder-slate-400 transition-all text-sm font-medium'
                        placeholder='(00) 00000-0000'
                        maxLength={15}
                      />
                    </div>
                  </div>

                  {/* CPF */}
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase ml-1'>CPF</label>
                    <div className='relative group'>
                      <FileText className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors' size={16} />
                      <input
                        value={newTenant.cpf}
                        onChange={(e) => setNewTenant(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                        className='w-full pl-10 pr-4 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary dark:text-white placeholder-slate-400 transition-all text-sm font-medium'
                        placeholder='000.000.000-00'
                        maxLength={14}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Group */}
              <div className="space-y-4">
                <h2 className='text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4'>Imóvel Vinculado</h2>
                <div className='relative group'>
                  <Briefcase className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors' size={18} />
                  <select
                    value={newTenant.propertyId}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, propertyId: e.target.value }))}
                    className='w-full pl-12 pr-10 py-3.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-primary dark:text-white appearance-none transition-all text-sm font-bold cursor-pointer'
                  >
                    <option value="">Selecione um imóvel (Opcional)</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronRight size={16} className="rotate-90" />
                  </div>
                </div>
              </div>

              {/* Invite Delivery Option */}
              <div className="space-y-4 pt-4">
                <h2 className='text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4'>Finalização</h2>
                <div 
                  onClick={() => setNewTenant(prev => ({ ...prev, sendInvite: !prev.sendInvite }))}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    newTenant.sendInvite 
                      ? 'bg-primary/5 border-primary/30 shadow-md shadow-primary/5' 
                      : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-white/5'
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      newTenant.sendInvite ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                    }`}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 dark:text-white text-sm font-bold">Enviar convite imediato</h3>
                      <p className="text-[10px] text-slate-500">O inquilino recebe o link de ativação por e-mail.</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    newTenant.sendInvite ? 'border-primary bg-primary' : 'border-slate-300 dark:border-white/20'
                  }`}>
                    {newTenant.sendInvite && <CheckCircle size={12} className="text-white" />}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 pb-8">
                <div className='flex justify-between items-end'>
                  <h2 className='text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]'>Anexos do Contrato</h2>
                  <span className='text-[10px] text-slate-400 font-bold'>Max 5MB • PDF/JPG</span>
                </div>
                <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl cursor-pointer bg-white dark:bg-surface-dark hover:bg-primary/5 hover:border-primary/50 transition-all group'>
                  <div className='flex flex-col items-center justify-center'>
                    <div className='bg-primary/10 p-3 rounded-2xl mb-2 group-hover:scale-110 transition-transform'>
                      <CloudUpload className='text-primary' size={24} />
                    </div>
                    <p className='text-xs text-slate-500 dark:text-slate-400 font-bold'>
                      Arraste ou toque para anexar documentos
                    </p>
                  </div>
                  <input type='file' className='hidden' />
                </label>
              </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tenant Detail Dashboard */}
      {selectedTenantId && (
        <TenantDetails id={selectedTenantId} onClose={() => setSelectedTenantId(null)} />
      )}

      {/* Smart Billing Modal */}
      {billingTenant && (
        <BillingModal
          tenant={billingTenant}
          onClose={() => setBillingTenant(null)}
          onConfirm={(data) => {
            console.log('Billing Confirmed:', data);
            
            // Register activity (Demo)
            const channelLabel = data.channel === 'whatsapp' ? 'WhatsApp' : data.channel === 'copy' ? 'Cópia' : 'Pix/Boleto';
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = new Date().toLocaleDateString('pt-BR');
            
            addToast(
              'Cobrança Enviada',
              `A cobrança para ${billingTenant.name} foi registrada com sucesso via ${channelLabel}.`,
              'success'
            );
            
            setBillingTenant(null);
          }}
        />
      )}
    </div>
  );
};

export default Tenants;
