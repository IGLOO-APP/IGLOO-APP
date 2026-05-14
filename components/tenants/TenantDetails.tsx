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
  Barcode,
  ArrowRight,
  TrendingDown,
  Bell,
  MoreHorizontal,
  Settings2,
  Sparkles,
  Wrench,
  Image as ImageIcon
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { TenantProfileConfigPanel } from '../properties/TenantProfileConfigPanel';
import { useQuery } from '@tanstack/react-query';
import { tenantService } from '../../services/tenantService';
import { calculateTenantFinancials } from '../../utils/financialCalculations';
import { Loader2, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { formatPhone } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { tenantConfigService } from '../../services/tenantConfigService';

interface TenantDetailsProps {
  id: string;
  onClose: () => void;
}

export const TenantDetails: React.FC<TenantDetailsProps> = ({ id, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'docs' | 'tenantConfig' | 'history'>('overview');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'payments' | 'maintenance' | 'contracts'>('all');
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [activeTab]);

  const tenantId = id;

  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
        const t = await tenantService.getById(tenantId!);
        if (t?.contract) {
            const [paymentsData, maintenanceData] = await Promise.all([
                tenantService.getPayments(String(t.contract.id)),
                tenantService.getMaintenanceRequests(String(t.id))
            ]);
            setPayments(paymentsData);
            setMaintenance(maintenanceData);
        }
        return t;
    },
    enabled: !!tenantId,
  });

  const { data: docs = [] } = useQuery({
    queryKey: ['tenant-docs', id],
    queryFn: () => tenantService.getDocuments(id.toString()),
    enabled: !!id,
  });

  const financialSummary = calculateTenantFinancials(payments);

  const tenantInsight = React.useMemo(() => {
    const rate = financialSummary.punctualityRate;
    const isLate = financialSummary.isLate;
    const daysLate = financialSummary.daysLate;
    const maintenanceCount = maintenance.length;
    const openMaintenance = maintenance.filter((m: any) => m.status !== 'completed').length;

    if (rate === 100 && maintenanceCount === 0) {
      return { score: 'A+', color: 'text-emerald-600 dark:text-emerald-400', text: 'Inquilino sem ocorrências e com histórico de pagamentos perfeito. Perfil de risco zero — ideal para renovação antecipada.' };
    }
    if (rate >= 90 && !isLate) {
      return { score: 'A', color: 'text-emerald-600 dark:text-emerald-400', text: `Pontualidade de ${rate}% — acima da média. ${openMaintenance > 0 ? `${openMaintenance} chamado(s) aberto(s). ` : ''}Perfil de baixo risco para renovação.` };
    }
    if (rate >= 70 && !isLate) {
      return { score: 'B', color: 'text-blue-600 dark:text-blue-400', text: `Pontualidade de ${rate}%. Pagamentos geralmente em dia. ${maintenanceCount > 2 ? 'Frequência de manutenção acima do esperado — verifique as causas.' : ''}` };
    }
    if (isLate && daysLate > 30) {
      return { score: 'D', color: 'text-red-600 dark:text-red-400', text: `Pagamento em atraso há ${daysLate} dias. Atenção: risco elevado de inadimplência. Considere acionar o fiador ou iniciar negociação.` };
    }
    if (isLate) {
      return { score: 'C', color: 'text-amber-600 dark:text-amber-400', text: `Pagamento em atraso (${daysLate} dia${daysLate !== 1 ? 's' : ''}). Pontualidade histórica de ${rate}%. Acompanhe de perto o próximo vencimento.` };
    }
    return { score: 'B+', color: 'text-blue-600 dark:text-blue-400', text: `Pontualidade de ${rate}%. Sem atrasos no momento. ${maintenanceCount > 0 ? `${maintenanceCount} chamado(s) de manutenção registrado(s).` : ''}` };
  }, [financialSummary, maintenance]);

  const tenantRequirements = React.useMemo(() => {
    if (!tenant?.property_id) return null;
    return tenantConfigService.getConfigForProperty(tenant.property_id.toString());
  }, [tenant?.property_id]);

  const handleWhatsApp = () => {
    if (tenant?.phone) {
      window.open(`https://wa.me/55${tenant.phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const navigateToProperty = () => {
    if (tenant?.property_id) {
      onClose();
      navigate(`/properties?id=${tenant.property_id}`);
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

  // Type narrowing: guarantees tenant is defined for the remainder of the component
  if (!tenant) return null;

  // Calculate contract progress
  let contractProgress = 0;
  if (tenant.contract) {
    const start = new Date(tenant.contract.start_date).getTime();
    const end = new Date(tenant.contract.end_date).getTime();
    const now = new Date().getTime();
    contractProgress = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  }

  return (
    <ModalWrapper onClose={onClose} className='md:max-w-5xl' showCloseButton={true}>
      <div className='flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden'>
        {/* 1. Premium Header Profile Section */}
        <div className='relative bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 shrink-0 overflow-hidden'>

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
                  <div className='h-20 w-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 font-black text-2xl'>
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
                    <div className='flex items-center gap-4 mt-2'>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        financialSummary.isLate 
                          ? 'bg-red-500 text-white' 
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {financialSummary.isLate ? (
                          <><AlertCircle size={10} /> Inadimplente</>
                        ) : (
                          <><BadgeCheck size={10} /> Bom Pagador</>
                        )}
                      </div>
                      <div className='flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest'>
                        <Star size={10} className='text-amber-500' /> {financialSummary.punctualityRate}% Pontualidade
                      </div>
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
                  {(tenant.property || (tenant as any).contract?.property_name) && (
                    <div className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 shadow-sm'>
                      <Home size={12} className='text-primary shrink-0' />
                      <span className='text-[11px] font-bold text-slate-700 dark:text-slate-300 max-w-[140px] truncate'>
                        {tenant.property || (tenant as any).contract?.property_name}
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
                className='flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all active:scale-95'
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
        <div className='bg-white dark:bg-surface-dark px-4 md:px-6 border-b border-gray-100 dark:border-white/5 shrink-0 overflow-x-auto no-scrollbar'>
          <div className='flex gap-6 md:gap-8'>
            {[
              { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
              { id: 'payments', label: 'Financeiro', icon: DollarSign },
              { id: 'docs', label: 'Contrato & Docs', icon: FileText },
              { id: 'tenantConfig', label: 'Exigências', icon: ShieldCheck },
              { id: 'history', label: 'Histórico', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap shrink-0 ${
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
            <div className="animate-fadeIn space-y-6">
              {/* AI Insights Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent dark:from-indigo-500/5 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                    <Sparkles size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">IGLOO Insight</h4>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide ${tenantInsight.color} bg-current/10`}>
                        Score {tenantInsight.score}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {tenantInsight.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Associated Property Card */}
              <div
                onClick={navigateToProperty}
                className="group relative overflow-hidden bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="h-40 md:h-auto md:w-56 relative overflow-hidden shrink-0">
                    {tenant.property_image ? (
                      <img src={tenant.property_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={tenant.property} />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                        <Home size={32} className="text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest">Alugado</div>
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-lg">{tenant.property || 'Imóvel vinculado'}</h3>
                        <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                          <MapPin size={12} className="text-primary" />
                          {tenant.property_address || 'Endereço não disponível'}
                        </p>
                      </div>
                      <ArrowUpRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Mensalidade</span>
                        <span className="font-black text-slate-900 dark:text-white">R$ {Number(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-px h-6 bg-slate-100 dark:bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Vencimento</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">Todo dia {tenant.contract?.payment_day || '10'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/30 transition-colors cursor-default group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pontualidade</p>
                    <Star size={14} className="text-amber-500 group-hover:animate-pulse" />
                  </div>
                  <p className="text-2xl font-black text-emerald-500">{financialSummary.punctualityRate}%</p>
                </div>
                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Pago</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    <span className="text-xs font-bold mr-1 text-slate-400">R$</span>
                    {financialSummary.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Em Aberto</p>
                  <p className={`text-2xl font-black ${financialSummary.totalPending > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                    <span className="text-xs font-bold mr-1 text-slate-400">R$</span>
                    {financialSummary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mensalidade</p>
                  <p className="text-2xl font-black text-indigo-500">
                    <span className="text-xs font-bold mr-1 text-slate-400">R$</span>
                    {Number(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              {/* Contract Progress Card */}
              <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck size={18} className="text-primary" />
                    Vigência do Contrato
                  </h3>
                  <span className="text-xs font-bold text-slate-500">{contractProgress}% concluído</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${contractProgress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <div className="flex flex-col">
                    <span>Início</span>
                    <span className="font-bold text-slate-900 dark:text-white">{tenant.contract ? new Date(tenant.contract.start_date).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span>Fim</span>
                    <span className="font-bold text-slate-900 dark:text-white">{tenant.contract ? new Date(tenant.contract.end_date).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className='animate-fadeIn space-y-6'>
              {/* Financial Summary Cards */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20'>
                  <div className='flex items-center gap-2 mb-1'>
                    <TrendingUp size={14} className='text-emerald-500' />
                    <p className='text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest'>Total Liquidado</p>
                  </div>
                  <p className='text-xl font-black text-emerald-600 dark:text-emerald-400'>
                    <span className='text-xs mr-1 opacity-70'>R$</span>
                    {financialSummary.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className='bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20'>
                  <div className='flex items-center gap-2 mb-1'>
                    <TrendingDown size={14} className='text-amber-500' />
                    <p className='text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest'>Total Pendente</p>
                  </div>
                  <p className='text-xl font-black text-amber-600 dark:text-amber-400'>
                    <span className='text-xs mr-1 opacity-70'>R$</span>
                    {financialSummary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className='flex justify-between items-center px-1'>
                <h3 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2'>
                  <History size={16} className='text-primary' /> Extrato de Mensalidades
                </h3>
                <button className='text-xs font-bold text-primary flex items-center gap-1.5 hover:underline bg-primary/5 px-3 py-1.5 rounded-lg transition-colors'>
                  <Download size={14} /> PDF
                </button>
              </div>

              <div className='space-y-3'>
                {payments.length > 0 ? (
                  payments.map((pay: any) => {
                    const isLate = pay.status === 'pending' && new Date(pay.due_date) < new Date();
                    const daysLate = isLate ? Math.floor((new Date().getTime() - new Date(pay.due_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;

                    return (
                      <div
                        key={pay.id}
                        className='group flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/30 transition-all'
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          pay.status === 'paid'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
                            : isLate 
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-500 animate-pulse'
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'
                        }`}>
                          {pay.status === 'paid' ? (
                            <CheckCircle2 size={24} />
                          ) : (
                            <Clock size={24} />
                          )}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <p className='font-black text-sm text-slate-900 dark:text-white'>
                              Aluguel {new Date(pay.due_date).toLocaleString('pt-BR', { month: 'long' })}
                            </p>
                            {pay.payment_method && (
                              <span className='px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1'>
                                {pay.payment_method === 'pix' && <Zap size={8} />}
                                {pay.payment_method === 'credit_card' && <CreditCard size={8} />}
                                {pay.payment_method === 'boleto' && <Barcode size={8} />}
                                {pay.payment_method}
                              </span>
                            )}
                          </div>
                          <p className='text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 font-medium'>
                            {pay.status === 'paid' 
                              ? `Liquidado em ${new Date(pay.paid_date).toLocaleDateString('pt-BR')}` 
                              : `Vence dia ${new Date(pay.due_date).toLocaleDateString('pt-BR')}`
                            }
                            {isLate && (
                              <span className='text-red-500 font-bold'>• {daysLate} dias de atraso</span>
                            )}
                          </p>
                        </div>

                        <div className='text-right mr-2'>
                          <p className='font-black text-sm text-slate-900 dark:text-white'>
                            R$ {Number(pay.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${
                            pay.status === 'paid' ? 'text-emerald-500' : isLate ? 'text-red-500' : 'text-amber-500'
                          }`}>
                            {pay.status === 'paid' ? 'CONCLUÍDO' : isLate ? 'EM ATRASO' : 'PENDENTE'}
                          </span>
                        </div>

                        <button className='p-2 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100'>
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className='p-20 text-center bg-white dark:bg-surface-dark rounded-2xl border border-dashed border-slate-200 dark:border-white/10'>
                    <p className='text-slate-400 text-sm'>Nenhum histórico de pagamentos encontrado.</p>
                  </div>
                )}
              </div>

              {/* Next Invoice Alert */}
              <div className='group relative p-5 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-4 overflow-hidden'>
                <div className='h-12 w-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0'>
                  <Bell size={24} />
                </div>
                <div className='flex-1 min-w-0 z-10'>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    Próximo Recebimento
                  </p>
                  <p className='text-lg font-black text-slate-900 dark:text-white leading-tight'>
                    Dia {tenant.contract?.payment_day || '10'} do próximo mês
                  </p>
                </div>
                <button className='h-10 w-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg transition-transform active:scale-90 z-10'>
                  <ArrowRight size={20} />
                </button>
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
            <div className='animate-fadeIn space-y-6'>
              <div className='flex items-center justify-between px-1'>
                <h3 className='font-bold text-slate-900 dark:text-white'>Checklist de Conformidade</h3>
                <span className='text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-lg uppercase tracking-widest'>
                  Perfil Alvo: {tenantRequirements?.propertyId === 'global' ? 'Padrão' : 'Personalizado'}
                </span>
              </div>

              {tenantRequirements ? (
                <div className='space-y-6'>
                  {/* Category: Personal */}
                  <div className='space-y-3'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-xs'>Dados Pessoais</p>
                    <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 divide-y divide-gray-50 dark:divide-white/5 overflow-hidden'>
                      <RequirementItem 
                        label="Nome Completo" 
                        status="required" 
                        isFulfilled={!!tenant.name} 
                      />
                      <RequirementItem 
                        label="CPF / Identidade" 
                        status="required" 
                        isFulfilled={!!tenant.cpf} 
                      />
                      {tenantRequirements.sections.personal.occupation !== 'hidden' && (
                        <RequirementItem 
                          label="Profissão / Ocupação" 
                          status={tenantRequirements.sections.personal.occupation} 
                          isFulfilled={false} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Category: Documents */}
                  <div className='space-y-3'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-xs'>Documentos Obrigatórios</p>
                    <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 divide-y divide-gray-50 dark:divide-white/5 overflow-hidden'>
                      {tenantRequirements.sections.requiredDocs.id_card !== 'hidden' && (
                        <RequirementItem 
                          label="Cópia do RG ou CNH" 
                          status={tenantRequirements.sections.requiredDocs.id_card} 
                          isFulfilled={docs.some((d: any) => d.name.toLowerCase().includes('identidade') || d.name.toLowerCase().includes('cnh') || d.name.toLowerCase().includes('documento'))} 
                        />
                      )}
                      {tenantRequirements.sections.requiredDocs.income !== 'hidden' && (
                        <RequirementItem 
                          label="Comprovante de Renda" 
                          status={tenantRequirements.sections.requiredDocs.income} 
                          isFulfilled={false} 
                        />
                      )}
                      {tenantRequirements.sections.requiredDocs.guarantee !== 'hidden' && (
                        <RequirementItem 
                          label="Apólice de Garantia / Fiança" 
                          status={tenantRequirements.sections.requiredDocs.guarantee} 
                          isFulfilled={false} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className='p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex gap-3'>
                    <Info size={18} className='text-blue-500 shrink-0 mt-0.5' />
                    <p className='text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed'>
                      O inquilino visualiza este checklist em sua área exclusiva. Itens marcados como <strong>Obrigatórios</strong> são necessários para a validação final do perfil.
                    </p>
                  </div>
                </div>
              ) : (
                <div className='p-20 text-center bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                  <ShieldAlert size={48} className='text-slate-200 mx-auto mb-4' />
                  <p className='text-slate-400 font-bold'>Nenhuma exigência configurada.</p>
                  <p className='text-xs text-slate-400 mt-2'>Configure o perfil esperado nos detalhes do imóvel.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-fadeIn space-y-6">
              {/* Header bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                    <Clock size={14} className="text-primary" /> Linha do Tempo
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-tighter">Eventos cronológicos do perfil</p>
                </div>
                {/* Filter pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {([['all', 'Todos'], ['payments', 'Pagamentos'], ['maintenance', 'Chamados'], ['contracts', 'Contratos']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setTimelineFilter(val)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                        timelineFilter === val
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Real-time
                </span>
              </div>

              {/* Timeline content */}
              {(() => {
                const allEvents = [
                  ...(tenant.contract
                    ? [
                        {
                          id: 'contract-start',
                          type: 'contracts' as const,
                          date: tenant.contract.start_date,
                          title: 'Contrato Assinado',
                          description: `Locação iniciada em ${tenant.property}`,
                          icon: FileText,
                          color: 'bg-primary text-white',
                          contractNumber: tenant.contract.contract_number || `CTR-${String(tenant.contract.id).substring(0, 6).toUpperCase()}`,
                          contractId: tenant.contract.id,
                        },
                      ]
                    : []),
                  ...payments.map((p) => ({
                    id: String(p.id),
                    type: 'payments' as const,
                    date: p.paid_date || p.due_date,
                    title: p.status === 'paid' ? 'Pagamento Recebido' : 'Fatura em Aberto',
                    description: `Ref. ${new Date(p.due_date).toLocaleString('pt-BR', { month: 'short', year: 'numeric' })} • R$ ${Number(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    status: p.status,
                    paymentMethod: p.payment_method,
                    icon: p.status === 'paid' ? CheckCircle2 : Clock,
                    color: p.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white',
                  })),
                  ...maintenance.map((m) => ({
                    id: String(m.id),
                    type: 'maintenance' as const,
                    date: m.created_at,
                    title: m.title,
                    description: m.status === 'completed' ? 'Chamado finalizado' : 'Em atendimento',
                    status: m.status,
                    category: m.category,
                    icon: m.status === 'completed' ? CheckCircle2 : Wrench,
                    color: m.status === 'completed' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-white',
                    image: m.images?.[0],
                  })),
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                const filtered = timelineFilter === 'all' ? allEvents : allEvents.filter((e) => e.type === timelineFilter);

                if (filtered.length === 0) {
                  return (
                    <div className="py-20 text-center">
                      <Clock size={40} className="text-slate-200 dark:text-white/10 mx-auto mb-3" />
                      <p className="text-slate-400 font-bold text-sm">Nenhum evento encontrado.</p>
                    </div>
                  );
                }

                // Group by month
                const grouped: Record<string, typeof filtered> = {};
                filtered.forEach((ev) => {
                  const key = new Date(ev.date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                  if (!grouped[key]) grouped[key] = [];
                  grouped[key].push(ev);
                });

                return (
                  <div className="space-y-8">
                    {Object.entries(grouped).map(([monthLabel, events]) => (
                      <div key={monthLabel}>
                        {/* Month separator */}
                        <div className="flex items-center gap-3 mb-6">
                          <span className="h-px flex-1 bg-slate-100 dark:bg-white/5"></span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{monthLabel}</span>
                          <span className="h-px flex-1 bg-slate-100 dark:bg-white/5"></span>
                        </div>
                        {/* Events in this month */}
                        <div className="relative space-y-8 before:absolute before:left-[19px] before:top-1 before:bottom-1 before:w-0.5 before:bg-gradient-to-b before:from-primary/40 before:via-slate-200 dark:before:via-white/10 before:to-transparent">
                          {events.map((event) => (
                            <div key={event.id} className="relative flex gap-5 items-start group">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shrink-0 shadow-md ${event.color} border-4 border-background-light dark:border-background-dark transition-transform group-hover:scale-110`}
                              >
                                <event.icon size={15} />
                              </div>
                              <div className="flex-1 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 p-4 shadow-sm group-hover:border-primary/30 transition-all">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                  <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{event.title}</p>
                                  <span className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                                    {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{event.description}</p>
                                {/* Payment extras */}
                                {'paymentMethod' in event && event.paymentMethod && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-bold text-slate-400">
                                      via {event.paymentMethod === 'pix' ? 'Pix' : event.paymentMethod === 'boleto' ? 'Boleto' : 'Cartão'}
                                    </span>
                                    {'status' in event && event.status === 'paid' && (
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-[9px] font-black text-emerald-600 uppercase tracking-wider">Liquidado</span>
                                    )}
                                    {'status' in event && event.status !== 'paid' && (
                                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[9px] font-black text-amber-600 uppercase tracking-wider">Pendente</span>
                                    )}
                                  </div>
                                )}
                                {/* Contract badge */}
                                {'contractNumber' in event && (
                                  <button
                                    onClick={() => setActiveTab('docs')}
                                    className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wide transition-colors"
                                  >
                                    <Hash size={10} />
                                    {event.contractNumber}
                                  </button>
                                )}
                                {/* Maintenance category + image */}
                                {'category' in event && event.category && (
                                  <span className="mt-2 inline-flex px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-wider">
                                    {event.category}
                                  </span>
                                )}
                                {'image' in event && event.image && (
                                  <div className="mt-3 w-20 h-20 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
                                    <img src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
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

// Helper component for requirement items
const RequirementItem = ({ label, status, isFulfilled }: { label: string, status: 'required' | 'optional' | 'hidden', isFulfilled: boolean }) => (
  <div className='flex items-center justify-between p-4 group transition-colors hover:bg-slate-50 dark:hover:bg-white/5'>
    <div className='flex items-center gap-3'>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isFulfilled 
          ? 'bg-emerald-500/10 text-emerald-500' 
          : 'bg-slate-100 dark:bg-white/5 text-slate-300'
      }`}>
        {isFulfilled ? <CheckCircle size={16} /> : <div className='w-2 h-2 rounded-full bg-current' />}
      </div>
      <div>
        <p className={`text-sm font-bold ${isFulfilled ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
          {label}
        </p>
      </div>
    </div>
    
    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
      status === 'required' 
        ? 'bg-red-500/10 text-red-500' 
        : 'bg-slate-100 dark:bg-white/10 text-slate-400'
    }`}>
      {status === 'required' ? 'Obrigatório' : 'Opcional'}
    </span>
  </div>
);
