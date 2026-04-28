import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Calendar,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Clock,
  FileText,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Download,
  History,
  ChevronRight,
  User,
  MoreVertical,
  CreditCard,
  Home,
  BadgeCheck,
  Hash,
  Star,
  Zap,
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { TenantProfileConfigPanel } from '../properties/TenantProfileConfigPanel';
import { useQuery } from '@tanstack/react-query';
import { tenantService } from '../../services/tenantService';
import { Loader2 } from 'lucide-react';
import { formatPhone } from '../../utils/formatters';

interface TenantDetailsProps {
  id: number | string;
  onClose: () => void;
}

export const TenantDetails: React.FC<TenantDetailsProps> = ({ id, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'docs' | 'tenantConfig'>('overview');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  const tenantId = typeof id === 'string' ? id : id?.toString();

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => tenantService.getById(tenantId!),
    enabled: !!tenantId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['tenant-payments', tenant?.contract?.id],
    queryFn: () => tenantService.getPayments(tenant!.contract!.id),
    enabled: !!tenant?.contract?.id,
  });

  const { data: docs = [] } = useQuery({
    queryKey: ['tenant-docs', id],
    queryFn: () => tenantService.getDocuments(id.toString()),
    enabled: !!id,
  });

  const totalPaid = payments
    .filter((p: any) => p.status === 'paid')
    .reduce((acc: number, p: any) => acc + Number(p.amount), 0);

  const totalPending = payments
    .filter((p: any) => p.status === 'pending')
    .reduce((acc: number, p: any) => acc + Number(p.amount), 0);

  const handleWhatsApp = () => {
    if (tenant?.phone) {
      window.open(`https://wa.me/55${tenant.phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <ModalWrapper onClose={onClose} className='md:max-w-3xl'>
        <div className='flex h-96 items-center justify-center'>
          <Loader2 className='animate-spin text-primary' size={40} />
        </div>
      </ModalWrapper>
    );
  }

  if (!tenant && !isLoading) {
    return (
      <ModalWrapper onClose={onClose} className='md:max-w-xl' showCloseButton={true}>
        <div className='flex flex-col items-center justify-center p-16 text-center space-y-4'>
          <div className='w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400'>
            <User size={32} />
          </div>
          <div>
            <h3 className='text-lg font-bold text-slate-900 dark:text-white'>Inquilino não encontrado</h3>
            <p className='text-sm text-slate-500 mt-1 max-w-xs mx-auto'>
              Não foi possível carregar os detalhes deste perfil. Verifique se os dados ainda existem no banco.
            </p>
          </div>
          <button 
            onClick={onClose}
            className='mt-4 px-6 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:scale-105 transition-transform'
          >
            Voltar para a lista
          </button>
        </div>
      </ModalWrapper>
    );
  }

  // Calculate contract progress
  let contractProgress = 0;
  if (tenant.contract) {
    const start = new Date(tenant.contract.start_date).getTime();
    const end = new Date(tenant.contract.end_date).getTime();
    const now = new Date().getTime();
    contractProgress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  }

  return (
    <ModalWrapper onClose={onClose} className='md:max-w-3xl' showCloseButton={true}>
      <div className='flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden'>
        {/* 1. Premium Header Profile Section */}
        <div className='relative bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 shrink-0 overflow-hidden'>
          {/* Gradient background */}
          <div className='absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-primary/5 dark:from-indigo-900/10 dark:via-surface-dark dark:to-primary/5 pointer-events-none' />

          <div className='relative p-6'>
            <div className='flex items-start gap-5'>
              {/* Avatar */}
              <div className='relative shrink-0'>
                {tenant.image ? (
                  <div
                    className='h-20 w-20 rounded-2xl bg-cover bg-center border-2 border-white dark:border-white/10 shadow-xl ring-4 ring-primary/10'
                    style={{ backgroundImage: `url(${tenant.image})` }}
                  />
                ) : (
                  <div className='h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center shadow-xl ring-4 ring-primary/10 text-white font-black text-2xl'>
                    {tenant.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Identity Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2 flex-wrap'>
                  <div>
                    <h2 className='text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight'>
                      {tenant.name}
                    </h2>
                    {/* Financial status badge */}
                    <div className='flex items-center gap-2 mt-1.5 flex-wrap'>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        tenant.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {tenant.status === 'active' ? <BadgeCheck size={11} /> : <AlertCircle size={11} />}
                        {tenant.status === 'active' ? 'Bom Pagador' : 'Em Atraso'}
                      </span>
                      {payments.length > 0 && (
                        <span className='inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 uppercase tracking-widest'>
                          <Star size={10} className='text-amber-500' />
                          {Math.round((payments.filter((p: any) => p.status === 'paid').length / payments.length) * 100)}% pontualidade
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact chips */}
                <div className='flex flex-wrap items-center gap-3 mt-3'>
                  <span className='flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
                    <Phone size={12} className='text-primary shrink-0' />
                    {formatPhone(tenant.phone) || 'Não informado'}
                  </span>
                  <span className='w-px h-3 bg-slate-200 dark:bg-white/10' />
                  <span className='flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[180px]'>
                    <Mail size={12} className='text-primary shrink-0' />
                    {tenant.email}
                  </span>
                </div>

                {/* Property + Contract metadata row */}
                <div className='flex flex-wrap items-center gap-2 mt-3'>
                  {tenant.property && (
                    <div className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 shadow-sm'>
                      <Home size={12} className='text-primary shrink-0' />
                      <span className='text-[11px] font-bold text-slate-700 dark:text-slate-300 max-w-[140px] truncate'>
                        {tenant.property}
                      </span>
                    </div>
                  )}
                  {tenant.contract && (
                    <div className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 shadow-sm'>
                      <Hash size={12} className='text-slate-400 shrink-0' />
                      <span className='text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400'>
                        {tenant.contract.contract_number || `CTR-${String(tenant.contract.id).substring(0, 6).toUpperCase()}`}
                      </span>
                    </div>
                  )}
                  {tenant.contract && (
                    <div className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 shadow-sm'>
                      <Calendar size={12} className='text-slate-400 shrink-0' />
                      <span className='text-[11px] font-bold text-slate-500 dark:text-slate-400'>
                        até {new Date(tenant.contract.end_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className='flex gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-white/5'>
              <button
                onClick={handleWhatsApp}
                className='flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/20'
              >
                <MessageCircle size={15} /> WhatsApp
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className='flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all'
              >
                <DollarSign size={14} /> Financeiro
              </button>
              <button
                onClick={() => setActiveTab('tenantConfig')}
                className='flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all'
              >
                <ShieldCheck size={13} /> Exigências
              </button>
              <button className='ml-auto flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 transition-colors'>
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Tabs Navigation */}
        <div className='bg-white dark:bg-surface-dark px-6 border-b border-gray-100 dark:border-white/5 shrink-0'>
          <div className='flex gap-8'>
            {[
              { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
              { id: 'payments', label: 'Financeiro', icon: DollarSign },
              { id: 'docs', label: 'Contrato & Docs', icon: FileText },
              { id: 'tenantConfig', label: 'Exigências', icon: ShieldCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Content Area */}
        <div 
          ref={scrollContainerRef}
          className='flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth'
        >
          {activeTab === 'overview' && (
            <div className='space-y-6 animate-fadeIn'>
              {/* Enhanced Associated Property Card */}
              <div className='group relative overflow-hidden bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all'>
                <div className='flex flex-col md:flex-row'>
                  <div className='h-32 md:h-auto md:w-48 relative overflow-hidden shrink-0'>
                    {tenant.property_image ? (
                      <img 
                        src={tenant.property_image} 
                        className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                        alt={tenant.property}
                      />
                    ) : (
                      <div className='w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center'>
                        <Home size={32} className='text-slate-300' />
                      </div>
                    )}
                    <div className='absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest'>
                      Alugado
                    </div>
                  </div>
                  <div className='flex-1 p-5'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className='font-black text-slate-900 dark:text-white text-lg'>
                          {tenant.property}
                        </h3>
                        <p className='flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium'>
                          <MapPin size={12} className='text-primary' />
                          {tenant.property_address || 'Endereço não disponível'}
                        </p>
                      </div>
                      <button className='p-2 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary transition-colors'>
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                    
                    <div className='flex items-center gap-4 mt-4'>
                      <div className='flex flex-col'>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-tight'>Mensalidade</span>
                        <span className='font-black text-slate-900 dark:text-white'>
                          R$ {Number(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className='w-px h-6 bg-slate-100 dark:bg-white/10' />
                      <div className='flex flex-col'>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-tight'>Vencimento</span>
                        <span className='font-bold text-slate-900 dark:text-white text-sm'>
                          Todo dia {tenant.contract?.payment_day || '10'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/30 transition-colors cursor-default group'>
                  <div className='flex justify-between items-start mb-2'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                      Pontualidade
                    </p>
                    <Star size={14} className='text-amber-500 group-hover:animate-pulse' />
                  </div>
                  <p className='text-2xl font-black text-emerald-500'>
                    {payments.length > 0 ? `${Math.round((payments.filter((p: any) => p.status === 'paid').length / payments.length) * 100)}%` : '100%'}
                  </p>
                </div>
                
                <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-emerald-500/30 transition-colors cursor-default'>
                  <div className='flex justify-between items-start mb-2'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Total Pago</p>
                    <CheckCircle2 size={14} className='text-emerald-500' />
                  </div>
                  <p className='text-2xl font-black text-slate-900 dark:text-white'>
                    <span className='text-xs font-bold mr-1 text-slate-400'>R$</span>
                    {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>

                <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-amber-500/30 transition-colors cursor-default'>
                  <div className='flex justify-between items-start mb-2'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Em Aberto</p>
                    <AlertCircle size={14} className={totalPending > 0 ? 'text-amber-500' : 'text-slate-300'} />
                  </div>
                  <p className={`text-2xl font-black ${totalPending > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                    <span className='text-xs font-bold mr-1 text-slate-400'>R$</span>
                    {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>

                <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-indigo-500/30 transition-colors cursor-default'>
                  <div className='flex justify-between items-start mb-2'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                      Mensalidade
                    </p>
                    <Zap size={14} className='text-indigo-500' />
                  </div>
                  <p className='text-2xl font-black text-indigo-500'>
                    <span className='text-xs font-bold mr-1 text-slate-400'>R$</span>
                    {Number(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              {/* Contract Progress Card */}
              <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                    <ShieldCheck size={18} className='text-primary' />
                    Vigência do Contrato
                  </h3>
                  <span className='text-xs font-bold text-slate-500'>
                    {contractProgress}% concluído
                  </span>
                </div>
                <div className='w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-4'>
                  <div
                    className='h-full bg-primary rounded-full transition-all duration-1000'
                    style={{ width: `${contractProgress}%` }}
                  ></div>
                </div>
                <div className='flex justify-between text-xs font-medium text-slate-500'>
                  <div className='flex flex-col'>
                    <span>Início</span>
                    <span className='font-bold text-slate-900 dark:text-white'>
                      {tenant.contract ? new Date(tenant.contract.start_date).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                  <div className='flex flex-col text-right'>
                    <span>Fim</span>
                    <span className='font-bold text-slate-900 dark:text-white'>
                      {tenant.contract ? new Date(tenant.contract.end_date).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real Activity Timeline */}
              <div className='space-y-4'>
                <h3 className='text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 ml-1 uppercase tracking-widest'>
                  <History size={16} className='text-primary' /> Linha do Tempo
                </h3>
                
                <div className='relative space-y-4 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5'>
                  {/* Contract Start Milestone */}
                  {tenant.contract && (
                    <div className='relative flex gap-4 items-start pl-1'>
                      <div className='w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white z-10 shrink-0 shadow-lg shadow-primary/20'>
                        <FileText size={16} />
                      </div>
                      <div className='flex-1 pt-1'>
                        <p className='text-sm font-bold text-slate-900 dark:text-white'>Início do Contrato</p>
                        <p className='text-xs text-slate-500 mt-0.5'>
                          Assinado e ativo desde {new Date(tenant.contract.start_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recent Payments Milestone */}
                  {payments.slice(0, 3).map((pay: any, idx: number) => (
                    <div key={pay.id} className='relative flex gap-4 items-start pl-1'>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 shrink-0 shadow-sm ${
                        pay.status === 'paid' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500' 
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-500'
                      }`}>
                        {pay.status === 'paid' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      </div>
                      <div className='flex-1 pt-1'>
                        <p className='text-sm font-bold text-slate-900 dark:text-white'>
                          {pay.status === 'paid' ? 'Mensalidade Liquidada' : 'Fatura em Aberto'}
                        </p>
                        <p className='text-xs text-slate-500 mt-0.5 uppercase font-bold tracking-tight'>
                          Ref. {new Date(pay.due_date).toLocaleString('pt-BR', { month: 'long' })} • R$ {Number(pay.amount).toLocaleString('pt-BR')}
                        </p>
                        {pay.status === 'paid' && pay.paid_date && (
                          <p className='text-[10px] text-emerald-500 font-bold mt-1'>
                            Pago em {new Date(pay.paid_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {payments.length === 0 && (
                    <div className='p-8 text-center bg-white dark:bg-surface-dark rounded-xl border border-gray-50 dark:border-white/5 ml-10'>
                      <p className='text-xs text-slate-400'>Nenhuma movimentação financeira recente.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className='animate-fadeIn space-y-6'>
              <div className='flex justify-between items-center'>
                <h3 className='font-bold text-slate-900 dark:text-white'>Fluxo Financeiro</h3>
                <button className='text-xs font-bold text-primary flex items-center gap-1 hover:underline'>
                  <Download size={14} /> Baixar Extrato
                </button>
              </div>

              <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden'>
                {payments.length > 0 ? (
                  payments.map((pay: any) => (
                    <div
                      key={pay.id}
                      className={`p-4 flex items-center justify-between border-b last:border-0 border-gray-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors`}
                    >
                      <div className='flex items-center gap-4'>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            pay.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-500'
                              : 'bg-amber-50 text-amber-500'
                          }`}
                        >
                          {pay.status === 'paid' ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <AlertCircle size={20} />
                          )}
                        </div>
                        <div>
                          <p className='font-bold text-sm text-slate-900 dark:text-white'>
                            Aluguel {new Date(pay.due_date).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {pay.status === 'paid' ? `Pago em ${new Date(pay.paid_date).toLocaleDateString('pt-BR')}` : `Vencimento em ${new Date(pay.due_date).toLocaleDateString('pt-BR')}`}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-bold text-sm text-slate-900 dark:text-white'>
                          R$ {Number(pay.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p
                          className={`text-[10px] font-bold uppercase ${pay.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}
                        >
                          {pay.status === 'paid' ? 'Liquidado' : 'Aguardando'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='p-20 text-center'>
                    <p className='text-slate-400'>Nenhum histórico de pagamentos encontrado.</p>
                  </div>
                )}
              </div>

              <div className='p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex gap-4'>
                <div className='h-12 w-12 rounded-xl bg-white dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-sm shrink-0'>
                  <CreditCard size={24} />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-bold text-indigo-900 dark:text-indigo-200'>
                    Próxima Fatura
                  </p>
                  <p className='text-xs text-indigo-700/70 dark:text-indigo-300/70 mt-0.5'>
                    Vencimento previsto para Abril (Dia 10).
                  </p>
                </div>
                <ChevronRight className='text-indigo-400 self-center' />
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className='animate-fadeIn space-y-4'>
              <h3 className='font-bold text-slate-900 dark:text-white px-1'>Documentos Digitais</h3>
              <div className='space-y-4'>
                {docs.length > 0 ? (
                  docs.map((doc: any, idx: number) => (
                    <div
                      key={idx}
                      className='group flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/50 transition-all cursor-pointer'
                    >
                      <div className='w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors'>
                        <FileText size={24} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-bold text-sm text-slate-900 dark:text-white truncate'>
                          {doc.name}
                        </p>
                        <p className='text-xs text-slate-500 uppercase font-bold tracking-tight'>
                          {doc.type} • {doc.date}
                        </p>
                      </div>
                      <Download
                        size={18}
                        className='text-slate-300 group-hover:text-primary transition-colors'
                      />
                    </div>
                  ))
                ) : (
                  <div className='p-20 text-center bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                    <p className='text-slate-400'>Nenhum documento anexado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tenantConfig' && (
            <div className='animate-fadeIn'>
              <div className='p-20 text-center bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                <p className='text-slate-400'>Nenhuma exigência configurada.</p>
              </div>
            </div>
          )}
        </div>

        {/* 4. Sticky Quick Actions Footer (Only if late) */}
        {tenant.status === 'late' && (
          <div className='p-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-white/5 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]'>
            <button className='w-full h-14 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]'>
              <AlertCircle size={20} /> Notificar Inadimplência
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
