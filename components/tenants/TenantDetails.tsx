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

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantService.getById(id.toString()),
    enabled: !!id,
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

  if (!tenant) {
    return (
      <ModalWrapper onClose={onClose} className='md:max-w-3xl'>
        <div className='p-20 text-center text-slate-500'>
          Inquilino não encontrado.
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
        {/* 1. Header Profile Section */}
        <div className='bg-white dark:bg-surface-dark p-6 border-b border-gray-100 dark:border-white/5 shrink-0'>
          <div className='flex flex-col md:flex-row items-center md:items-start gap-6'>
            <div className='relative'>
              {tenant.image ? (
                <div
                  className='h-24 w-24 rounded-3xl bg-cover bg-center border-4 border-slate-50 dark:border-white/5 shadow-xl'
                  style={{ backgroundImage: `url(${tenant.image})` }}
                ></div>
              ) : (
                <div className='h-24 w-24 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-4 border-slate-50 dark:border-white/5 shadow-xl text-indigo-600 dark:text-indigo-400 font-bold text-3xl'>
                  {tenant.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              )}
              <div
                className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-2 border-white dark:border-surface-dark shadow-sm ${
                  tenant.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {tenant.status === 'active' ? 'Bom Pagador' : 'Em Atraso'}
              </div>
            </div>

            <div className='flex-1 text-center md:text-left'>
              <h2 className='text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
                {tenant.name}
              </h2>
              <div className='flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-slate-500 dark:text-slate-400'>
                <span className='flex items-center gap-1.5 text-xs font-medium'>
                  <Phone size={14} className='text-primary' /> {formatPhone(tenant.phone) || 'Não informado'}
                </span>
                <span className='flex items-center gap-1.5 text-xs font-medium'>
                  <Mail size={14} className='text-primary' /> {tenant.email}
                </span>
              </div>

              <div className='flex gap-2 mt-5'>
                <button
                  onClick={handleWhatsApp}
                  className='flex-1 md:flex-none h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20'
                >
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button 
                  onClick={() => setActiveTab('tenantConfig')}
                  className='px-4 h-10 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all'
                >
                  Configurar exigências
                </button>
                <button className='flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 transition-colors'>
                  <MoreVertical size={20} />
                </button>
              </div>
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
              {/* Associated Property Card */}
              <div className='group relative overflow-hidden bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all'>
                <div className='flex gap-4'>
                  <div className='h-20 w-20 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0'>
                    <MapPin className='text-slate-400' size={32} />
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='text-[10px] font-bold text-primary uppercase tracking-widest mb-1'>
                          Imóvel Alugado
                        </p>
                        <h3 className='font-bold text-slate-900 dark:text-white'>
                          {tenant.property}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                  <p className='text-[10px] font-bold text-slate-400 uppercase mb-1'>
                    Pontualidade
                  </p>
                  <p className='text-xl font-black text-emerald-500'>
                    {payments.length > 0 ? `${Math.round((payments.filter((p: any) => p.status === 'paid').length / payments.length) * 100)}%` : '100%'}
                  </p>
                </div>
                <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                  <p className='text-[10px] font-bold text-slate-400 uppercase mb-1'>Total Pago</p>
                  <p className='text-xl font-black text-emerald-500'>
                    R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                  <p className='text-[10px] font-bold text-slate-400 uppercase mb-1'>Em Aberto</p>
                  <p className={`text-xl font-black ${totalPending > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                    R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                  <p className='text-[10px] font-bold text-slate-400 uppercase mb-1'>
                    Dia Vencimento
                  </p>
                  <p className='text-xl font-black text-slate-900 dark:text-white'>
                    {tenant.contract?.payment_day ? `Dia ${tenant.contract.payment_day}` : 'Não definido'}
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

              {/* Timeline / Recent Activity */}
              <div className='space-y-3'>
                <h3 className='text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 ml-1'>
                  <History size={16} className='text-primary' /> Atividade Recente
                </h3>
                <div className='p-8 text-center bg-white dark:bg-surface-dark rounded-xl border border-gray-50 dark:border-white/5'>
                  <p className='text-xs text-slate-400'>Nenhuma atividade recente registrada.</p>
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
