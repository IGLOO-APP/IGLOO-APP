import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  Zap,
  Barcode,
  ArrowRight,
  TrendingDown,
  Bell,
  MoreHorizontal,
  Settings2,
  Sparkles,
  Wrench,
  Image as ImageIcon,
  Lock,
  Key,
  XCircle,
  Loader2,
  ShieldAlert,
  CheckCircle,
  Info,
  Upload,
  ClipboardCheck
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { TenantProfileConfigPanel } from '../properties/TenantProfileConfigPanel';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '../../services/tenantService';
import { calculateTenantFinancials } from '../../utils/financialCalculations';
import { formatPhone, getRemainingContractTime } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { tenantConfigService } from '../../services/tenantConfigService';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../context/NotificationContext';

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
  const { addToast } = useNotification();

  // Track which step is currently being approved (for per-button loading state)
  const [approvingStep, setApprovingStep] = useState<string | null>(null);

  // Estados dinâmicos de onboarding (Gargalos resolvidos)
  const [creditChecked, setCreditChecked] = useState<boolean>(() => {
    return localStorage.getItem(`igloo_credit_checked_${id}`) === 'true';
  });
  const [creditScore, setCreditScore] = useState<number | null>(() => {
    const val = localStorage.getItem(`igloo_credit_score_${id}`);
    return val ? parseInt(val) : null;
  });
  const [creditStatus, setCreditStatus] = useState<'clean' | 'restricted' | null>(() => {
    return (localStorage.getItem(`igloo_credit_status_${id}`) as any) || null;
  });
  const [isCheckingCredit, setIsCheckingCredit] = useState(false);

  const [referencesVerified, setReferencesVerified] = useState<boolean>(() => {
    return localStorage.getItem(`igloo_references_verified_${id}`) === 'true';
  });
  const [referencesNotes, setReferencesNotes] = useState<string>(() => {
    return localStorage.getItem(`igloo_references_notes_${id}`) || '';
  });

  const [employmentType, setEmploymentType] = useState<'CLT' | 'Autônomo' | 'PJ'>(() => {
    return (localStorage.getItem(`igloo_employment_type_${id}`) as any) || 'CLT';
  });

  // Onboarding approval states
  const [profileReason, setProfileReason] = useState('');
  const [showProfileReject, setShowProfileReject] = useState(false);
  const [docsReason, setDocsReason] = useState('');
  const [showDocsReject, setShowDocsReject] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Ref to hold the tenant email for use in handlers (defined before useQuery)
  const tenantEmailRef = React.useRef<string>('');

  const queryClient = useQueryClient();

  const handleApproveProfile = async () => {
    const email = tenantEmailRef.current;
    if (!email) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_profile_status: 'approved',
          onboarding_stage: 'documents',
          onboarding_profile_rejected_reason: null
        })
        .eq('email', email);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      setShowProfileReject(false);
      setProfileReason('');
    } catch (err) {
      console.error('Error approving profile:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProfile = async () => {
    const email = tenantEmailRef.current;
    if (!profileReason.trim() || !email) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_profile_status: 'rejected',
          onboarding_profile_rejected_reason: profileReason
        })
        .eq('email', email);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      setShowProfileReject(false);
      setProfileReason('');
    } catch (err) {
      console.error('Error rejecting profile:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveDocs = async () => {
    const email = tenantEmailRef.current;
    if (!email) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_documents_status: 'approved',
          onboarding_stage: 'contract',
          onboarding_documents_rejected_reason: null
        })
        .eq('email', email);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      setShowDocsReject(false);
      setDocsReason('');
    } catch (err) {
      console.error('Error approving docs:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDocs = async () => {
    const email = tenantEmailRef.current;
    if (!docsReason.trim() || !email) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_documents_status: 'rejected',
          onboarding_documents_rejected_reason: docsReason
        })
        .eq('email', email);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      setShowDocsReject(false);
      setDocsReason('');
    } catch (err) {
      console.error('Error rejecting docs:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveInspection = async () => {
    const email = tenantEmailRef.current;
    if (!email) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_inspection_status: 'approved',
          onboarding_stage: 'keys'
        })
        .eq('email', email);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
    } catch (err) {
      console.error('Error approving inspection:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseKeys = async () => {
    const email = tenantEmailRef.current;
    if (!email) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_stage: 'completed',
          has_completed_onboarding: true,
          is_pending: false
        })
        .eq('email', email);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
    } catch (err) {
      console.error('Error releasing keys:', err);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * handleApproveStep — one-click approval from the "Etapas Validadas" list.
   * Maps each step label to the correct Supabase field, advances the pipeline
   * stage, writes audit flags to localStorage, and fires an addToast confirmation.
   */
  const handleApproveStep = async (stepKey: 'profile' | 'documents' | 'contract' | 'inspection') => {
    const email = tenantEmailRef.current;
    if (!email || approvingStep) return;
    setApprovingStep(stepKey);
    try {
      type ProfileUpdate = Record<string, string | boolean | null>;
      let payload: ProfileUpdate = {};
      let nextStage: string | null = null;
      let toastLabel = '';

      switch (stepKey) {
        case 'profile':
          payload = {
            onboarding_profile_status: 'approved',
            onboarding_stage: 'documents',
            onboarding_profile_rejected_reason: null,
          };
          nextStage = 'documents';
          toastLabel = 'Dados Cadastrais';
          // Audit flags — unblocks Step 2 for tenant
          localStorage.setItem(`igloo_references_verified_${id}`, 'true');
          setReferencesVerified(true);
          break;
        case 'documents':
          payload = {
            onboarding_documents_status: 'approved',
            onboarding_stage: 'contract',
            onboarding_documents_rejected_reason: null,
          };
          nextStage = 'contract';
          toastLabel = 'Documentos Enviados';
          break;
        case 'contract':
          payload = {
            onboarding_contract_status: 'approved',
            onboarding_stage: 'inspection',
          };
          nextStage = 'inspection';
          toastLabel = 'Contrato Assinado';
          break;
        case 'inspection':
          payload = {
            onboarding_inspection_status: 'approved',
            onboarding_stage: 'keys',
          };
          nextStage = 'keys';
          toastLabel = 'Vistoria de Entrada';
          break;
      }

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('email', email);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      addToast(
        '✅ Etapa Aprovada',
        `"${toastLabel}" foi homologada com sucesso. ${nextStage ? 'Próxima fase liberada para o inquilino.' : ''}`,
        'success'
      );
    } catch (err) {
      console.error(`Error approving step ${stepKey}:`, err);
      addToast('Erro ao aprovar', 'Não foi possível salvar a aprovação. Tente novamente.', 'error');
    } finally {
      setApprovingStep(null);
    }
  };

  // Checklist de residência critérios
  const [residenceRecent, setResidenceRecent] = useState<boolean>(() => {
    return localStorage.getItem(`igloo_residence_recent_${id}`) === 'true';
  });
  const [residenceMatch, setResidenceMatch] = useState<boolean>(() => {
    return localStorage.getItem(`igloo_residence_match_${id}`) === 'true';
  });

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

  // Keep ref in sync so handlers always have the current tenant email
  React.useEffect(() => {
    if (tenant?.email) {
      tenantEmailRef.current = tenant.email;
    }
  }, [tenant?.email]);

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

  // Lista de itens de onboarding analisando o que falta
  const pendingItems = React.useMemo(() => {
    if (!tenant) return [];
    const items: { label: string; fulfilled: boolean; critical: boolean }[] = [];
    
    // 👤 Dados Pessoais
    items.push({ label: "Nome Completo", fulfilled: !!tenant?.name, critical: true });
    items.push({ label: "CPF Cadastrado", fulfilled: !!tenant?.cpf, critical: true });
    
    if (tenantRequirements?.sections.personal.occupation !== 'hidden') {
      const isReq = tenantRequirements?.sections.personal.occupation === 'required';
      items.push({ 
        label: "Profissão / Ocupação informada", 
        fulfilled: !!(tenant as any).occupation || !!tenant?.email, 
        critical: isReq 
      });
    }

    // 💰 Documentos Obrigatórios
    if (tenantRequirements?.sections.requiredDocs.id_card !== 'hidden') {
      const isReq = tenantRequirements?.sections.requiredDocs.id_card === 'required';
      const hasId = docs.some((d: any) => d.name.toLowerCase().includes('identidade') || d.name.toLowerCase().includes('cnh') || d.name.toLowerCase().includes('documento')) || !!tenant?.cpf;
      items.push({ label: "Cópia do RG ou CNH anexa", fulfilled: hasId, critical: isReq });
    }

    if (tenantRequirements?.sections.requiredDocs.income !== 'hidden') {
      const isReq = tenantRequirements?.sections.requiredDocs.income === 'required';
      const hasIncome = docs.some((d: any) => d.name.toLowerCase().includes('renda') || d.name.toLowerCase().includes('holerite') || d.name.toLowerCase().includes('extrato') || d.name.toLowerCase().includes('trabalho') || d.name.toLowerCase().includes('ir') || d.name.toLowerCase().includes('imposto'));
      items.push({ 
        label: employmentType === 'CLT' 
          ? "3 Últimos Holerites ou Carteira de Trabalho" 
          : employmentType === 'Autônomo'
            ? "3 Últimos Extratos e Imposto de Renda Completo"
            : "Contrato Social e Prolabore da Empresa", 
        fulfilled: hasIncome || !!tenant?.contract, 
        critical: isReq 
      });
    }

    if (tenantRequirements?.sections.requiredDocs.residence !== 'hidden') {
      const isReq = tenantRequirements?.sections.requiredDocs.residence === 'required';
      const hasRes = docs.some((d: any) => d.name.toLowerCase().includes('residencia') || d.name.toLowerCase().includes('endereço') || d.name.toLowerCase().includes('conta') || d.name.toLowerCase().includes('luz') || d.name.toLowerCase().includes('agua'));
      // Residência precisa ser anexa E validada como recente e no nome
      items.push({ 
        label: "Comprovante de Residência", 
        fulfilled: hasRes && residenceRecent && residenceMatch, 
        critical: isReq 
      });
    }

    if (tenantRequirements?.sections.requiredDocs.guarantee !== 'hidden') {
      const isReq = tenantRequirements?.sections.requiredDocs.guarantee === 'required';
      const hasGuar = docs.some((d: any) => d.name.toLowerCase().includes('garantia') || d.name.toLowerCase().includes('fiança') || d.name.toLowerCase().includes('caução') || d.name.toLowerCase().includes('apólice'));
      items.push({ label: "Apólice de Garantia ou Caução", fulfilled: hasGuar || !!tenant?.contract, critical: isReq });
    }

    // 🔍 Análise de crédito e referências (Novas lacunas fechadas!)
    items.push({ 
      label: "Consulta SPC / Serasa Realizada", 
      fulfilled: creditChecked, 
      critical: true 
    });

    items.push({ 
      label: "Ficha de Referências Verificada", 
      fulfilled: referencesVerified, 
      critical: true 
    });

    return items;
  }, [tenant, tenantRequirements, docs, creditChecked, referencesVerified, employmentType, residenceRecent, residenceMatch]);

  const criticalPendingCount = React.useMemo(() => {
    return pendingItems.filter(i => i.critical && !i.fulfilled).length;
  }, [pendingItems]);

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

  // Simulação de consulta Serasa/SPC
  const triggerCreditCheck = () => {
    setIsCheckingCredit(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 380) + 620; // 620 a 1000
      const status = score > 690 ? 'clean' : 'restricted';
      setCreditChecked(true);
      setCreditScore(score);
      setCreditStatus(status as any);
      setIsCheckingCredit(false);
      localStorage.setItem(`igloo_credit_checked_${id}`, 'true');
      localStorage.setItem(`igloo_credit_score_${id}`, String(score));
      localStorage.setItem(`igloo_credit_status_${id}`, status);
    }, 1800);
  };

  const handleUpdateReferences = (verified: boolean, notes: string) => {
    setReferencesVerified(verified);
    setReferencesNotes(notes);
    localStorage.setItem(`igloo_references_verified_${id}`, verified ? 'true' : 'false');
    localStorage.setItem(`igloo_references_notes_${id}`, notes);
  };

  const handleUpdateEmployment = (type: 'CLT' | 'Autônomo' | 'PJ') => {
    setEmploymentType(type);
    localStorage.setItem(`igloo_employment_type_${id}`, type);
  };

  const handleToggleResidenceCheck = (recent: boolean, match: boolean) => {
    setResidenceRecent(recent);
    setResidenceMatch(match);
    localStorage.setItem(`igloo_residence_recent_${id}`, recent ? 'true' : 'false');
    localStorage.setItem(`igloo_residence_match_${id}`, match ? 'true' : 'false');
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
    <ModalWrapper onClose={onClose} className='md:max-w-7xl md:h-[85vh] md:min-h-[650px]' showCloseButton={true}>
      <div className='flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden'>
        {/* 1. Compact Header — Linha 1: Identidade + Ações */}
        <div className='relative bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5 shrink-0'>
          <div className='px-5 pt-4 pb-3'>
            {/* Linha 1: Avatar + Nome + Badges + Ações */}
            <div className='flex items-center gap-3'>
              {/* Avatar 40px */}
              <div className='shrink-0'>
                {tenant.image ? (
                  <div
                    className='h-10 w-10 rounded-xl bg-cover bg-center border border-white dark:border-white/10 shadow-md ring-2 ring-primary/10'
                    style={{ backgroundImage: `url(${tenant.image})` }}
                  />
                ) : (
                  <div className='h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 font-black text-sm'>
                    {tenant.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Nome + Badges + Contato */}
              <div className='flex-1 min-w-0'>
                {/* Nome e badges na mesma linha */}
                <div className='flex items-center gap-1.5 flex-wrap'>
                  <h2 className='text-sm font-black text-slate-900 dark:text-white tracking-tight leading-tight shrink-0'>
                    {tenant.name}
                  </h2>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shrink-0 ${
                    financialSummary.isLate
                      ? 'bg-red-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {financialSummary.isLate ? (
                      <><AlertCircle size={8} /> Inadimplente</>
                    ) : (
                      <><BadgeCheck size={8} /> Bom Pagador</>
                    )}
                  </div>
                  <div className='flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest shrink-0'>
                    <Star size={8} className='text-amber-500' /> {financialSummary.punctualityRate}%
                  </div>
                </div>
                {/* Contato em linha única muted */}
                <p className='text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate'>
                  {formatPhone(tenant.phone) || 'Não informado'} · {tenant.email}
                </p>
              </div>

              {/* Ações: WhatsApp + Menu */}
              <div className='flex items-center gap-1.5 shrink-0'>
                <button
                  onClick={handleWhatsApp}
                  className='flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all active:scale-95'
                >
                  <MessageCircle size={13} /> WhatsApp
                </button>
                <button className='flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors'>
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Linha 2: Chips de contexto do contrato */}
            <div className='flex items-center gap-2 mt-2.5 flex-wrap'>
              {(tenant.property || (tenant as any).contract?.property_name) && (
                <div className='flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10'>
                  <Home size={11} className='text-primary shrink-0' />
                  <span className='text-[11px] font-bold text-slate-600 dark:text-slate-300 max-w-[130px] truncate'>
                    {tenant.property || (tenant as any).contract?.property_name}
                  </span>
                </div>
              )}
              {tenant.contract && (
                <div className='flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10'>
                  <Hash size={11} className='text-slate-400 shrink-0' />
                  <span className='text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400'>
                    {tenant.contract.contract_number || `CTR-${String(tenant.contract.id).substring(0, 6).toUpperCase()}`}
                  </span>
                </div>
              )}
              {tenant.contract && (
                <div className='flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10'>
                  <Clock size={11} className='text-slate-400 shrink-0' />
                  <span className='text-[11px] font-bold text-slate-500 dark:text-slate-400'>
                    {getRemainingContractTime(tenant.contract.end_date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Tabs Navigation — com contagem de pendências críticas */}
        <div className='bg-white dark:bg-surface-dark px-4 md:px-6 border-b border-gray-100 dark:border-white/5 shrink-0 overflow-x-auto no-scrollbar'>
          <div className='flex gap-5 md:gap-7 whitespace-nowrap'>
            {[
              { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
              { id: 'payments', label: 'Financeiro', icon: DollarSign },
              { id: 'docs', label: 'Contrato & Docs', icon: FileText },
              { id: 'tenantConfig', label: 'Exigências', icon: ShieldCheck, badge: criticalPendingCount > 0 ? criticalPendingCount : undefined },
              { id: 'history', label: 'Histórico', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap shrink-0 relative ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={13} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className='ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[8px] animate-pulse shrink-0'>
                    {tab.badge}
                  </span>
                )}
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
              {/* Banner de Pendências Críticas */}
              {criticalPendingCount > 0 && (
                <div className='p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 animate-fadeIn'>
                  <div className='flex gap-3'>
                    <AlertCircle className='text-amber-550 dark:text-amber-400 shrink-0 mt-0.5 md:mt-0' size={18} />
                    <div className='text-left'>
                      <p className='text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider'>Documentação com Pendências Críticas</p>
                      <p className='text-[11px] text-amber-600 dark:text-slate-300 font-medium mt-0.5'>
                        Existem {criticalPendingCount} requisitos obrigatórios pendentes para garantir a segurança jurídica da locação.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('tenantConfig')}
                    className='shrink-0 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-650 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95'
                  >
                    Resolver Pendências
                  </button>
                </div>
              )}

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
            <div className='animate-fadeIn space-y-6'>
              {/* Resumo Rápido do Contrato */}
              {tenant.contract && (
                <div className='bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4'>
                  <div className='flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-3'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
                        <FileText size={16} />
                      </div>
                      <div>
                        <h4 className='text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white'>Contrato de Locação Ativo</h4>
                        <p className='text-[10px] text-slate-400 font-mono mt-0.5'>
                          {tenant.contract.contract_number || `CTR-${String(tenant.contract.id).substring(0, 6).toUpperCase()}`}
                        </p>
                      </div>
                    </div>
                    <span className='px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest'>
                      Em Vigência
                    </span>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-xs'>
                    <div>
                      <span className='text-[10px] text-slate-400 font-bold block uppercase tracking-wider'>Valor Mensal</span>
                      <span className='font-black text-slate-900 dark:text-white text-sm'>
                        R$ {Number(tenant.contract.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className='text-[10px] text-slate-400 font-bold block uppercase tracking-wider'>Garantia</span>
                      <span className='font-bold text-slate-900 dark:text-white'>
                        Caução (3x aluguel)
                      </span>
                    </div>
                    <div>
                      <span className='text-[10px] text-slate-400 font-bold block uppercase tracking-wider'>Reajuste Anual</span>
                      <span className='font-bold text-slate-900 dark:text-white'>
                        IPCA / Anual
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Seção de Documentos */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between px-1'>
                  <h3 className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5'>
                    Documentos Digitais
                  </h3>
                  <span className='text-[10px] font-bold text-slate-400'>
                    {docs.length} arquivo(s)
                  </span>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {/* Documento do Contrato Assinado (Sempre visível por padrão se houver contrato) */}
                  {tenant.contract && (
                    <div className='group flex items-center gap-3.5 p-3.5 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/45 transition-all cursor-pointer'>
                      <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform'>
                        <FileText size={20} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-bold text-xs text-slate-900 dark:text-white truncate'>
                          Contrato de Locação Assinado
                        </p>
                        <p className='text-[10px] text-slate-400 uppercase font-black tracking-tight mt-0.5'>
                          PDF • {new Date(tenant.contract.start_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button className='w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-slate-400 transition-colors'>
                        <Download size={14} />
                      </button>
                    </div>
                  )}

                  {/* Outros documentos dinâmicos */}
                  {docs.length > 0 ? (
                    docs.map((doc: any, idx: number) => (
                      <div
                        key={idx}
                        className='group flex items-center gap-3.5 p-3.5 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-primary/45 transition-all cursor-pointer'
                      >
                        <div className='w-10 h-10 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0 group-hover:scale-105 transition-transform'>
                          <FileText size={20} />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-bold text-xs text-slate-900 dark:text-white truncate'>
                            {doc.name}
                          </p>
                          <p className='text-[10px] text-slate-400 uppercase font-black tracking-tight mt-0.5'>
                            {doc.type || 'PDF'} • {doc.date}
                          </p>
                        </div>
                        <button className='w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-slate-400 transition-colors'>
                          <Download size={14} />
                        </button>
                      </div>
                    ))
                  ) : null}

                  {/* Placeholder Bonito para Documentos Extras */}
                  <div className='md:col-span-2 p-6 text-center bg-slate-50 dark:bg-black/10 rounded-xl border border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center space-y-2'>
                    <div className='w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400'>
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className='text-xs font-bold text-slate-600 dark:text-slate-300'>Nenhum documento adicional anexado</p>
                      <p className='text-[10px] text-slate-400 mt-0.5'>Comprovantes extras e apólices de garantia aparecerão aqui.</p>
                    </div>
                    <button className='mt-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-[10px] uppercase tracking-wider transition-colors'>
                      Enviar Documento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tenantConfig' && (
            <div className='animate-fadeIn space-y-6'>
              <div className='flex items-center justify-between px-1'>
                <div className='text-left'>
                  <h3 className='font-black text-slate-900 dark:text-white text-base uppercase tracking-wider'>Checklist de Conformidade Jurídica</h3>
                  <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5'>Análise de Riscos & Documentação</p>
                </div>
                <span className='text-[10px] font-black bg-primary/10 text-primary px-2 py-1 rounded-lg uppercase tracking-widest shrink-0'>
                  Perfil Alvo: {tenantRequirements?.propertyId === 'global' ? 'Padrão' : 'Personalizado'}
                </span>
              </div>

              {/* 🚀 PAINEL DE HOMOLOGAÇÃO DE ONBOARDING */}
              {tenant.onboarding_stage !== 'completed' && (
                <div className='p-6 bg-slate-950 dark:bg-black/40 text-white rounded-2xl border border-slate-800 dark:border-white/5 space-y-6 text-left shadow-lg relative overflow-hidden'>
                  {/* Glassmorphic background glow */}
                  <div className='absolute top-0 right-0 w-48 h-48 bg-primary/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none' />

                  <div className='flex items-center justify-between border-b border-white/10 pb-4 relative z-10'>
                    <div>
                      <h4 className='text-xs font-black uppercase tracking-wider flex items-center gap-2'>
                        <Sparkles size={14} className='text-amber-400 shrink-0 animate-pulse' />
                        Painel de Homologação de Onboarding
                      </h4>
                      <p className='text-[10px] text-slate-400 font-bold uppercase mt-1'>
                        Acompanhe e valide o progresso de integração do inquilino
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0 ${
                      tenant.onboarding_stage === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      Fase Atual: {
                        tenant.onboarding_stage === 'profile' ? 'Dados Cadastrais' :
                        tenant.onboarding_stage === 'documents' ? 'Envio de Documentos' :
                        tenant.onboarding_stage === 'contract' ? 'Contrato de Locação' :
                        tenant.onboarding_stage === 'inspection' ? 'Vistoria de Entrada' :
                        tenant.onboarding_stage === 'keys' ? 'Liberação das Chaves' :
                        tenant.onboarding_stage === 'completed' ? 'Concluído' : 'Início'
                      }
                    </span>
                  </div>

                  {/* Pipeline de Passos Sequenciais */}
                  <div className='grid grid-cols-5 gap-2 relative z-10'>
                    {[
                      { step: 'profile', label: 'Dados', status: tenant.onboarding_profile_status },
                      { step: 'documents', label: 'Documentos', status: tenant.onboarding_documents_status },
                      { step: 'contract', label: 'Contrato', status: tenant.onboarding_contract_status || (tenant.contract?.status === 'active' ? 'approved' : 'pending') },
                      { step: 'inspection', label: 'Vistoria', status: tenant.onboarding_inspection_status },
                      { step: 'keys', label: 'Chaves', status: tenant.onboarding_stage === 'completed' ? 'approved' : 'pending' }
                    ].map((item, idx) => {
                      const isCompleted = item.status === 'approved';
                      const isSubmitted = item.status === 'submitted';
                      const isRejected = item.status === 'rejected';
                      const isActive = tenant.onboarding_stage === item.step;

                      let borderClass = 'border-white/10 text-slate-500';
                      let bgClass = 'bg-white/5';
                      if (isCompleted) {
                        borderClass = 'border-emerald-500/50 text-emerald-400';
                        bgClass = 'bg-emerald-500/10';
                      } else if (isSubmitted) {
                        borderClass = 'border-amber-500/50 text-amber-400 animate-pulse';
                        bgClass = 'bg-amber-500/10';
                      } else if (isRejected) {
                        borderClass = 'border-rose-500/50 text-rose-400';
                        bgClass = 'bg-rose-500/10';
                      } else if (isActive) {
                        borderClass = 'border-primary/50 text-primary';
                        bgClass = 'bg-primary/10';
                      }

                      return (
                        <div key={item.step} className={`p-2.5 rounded-xl border ${borderClass} ${bgClass} text-center flex flex-col items-center justify-center space-y-1`}>
                          <span className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>Passo 0{idx + 1}</span>
                          <span className='text-[10px] font-bold tracking-tight truncate w-full'>{item.label}</span>
                          <span className='text-[9px] font-extrabold uppercase mt-1'>
                            {isCompleted ? '✓ OK' :
                             isSubmitted ? 'Análise' :
                             isRejected ? 'Erro' : 'Pendente'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Área de Ação Dinâmica baseada no passo atual */}
                  <div className='bg-white/5 rounded-xl p-4 border border-white/10 relative z-10 space-y-4'>
                    {/* PASSO 1: DADOS CADASTRAIS */}
                    {tenant.onboarding_stage === 'profile' && (
                      <div className='space-y-4'>
                        <div className='flex items-center gap-2 text-amber-400'>
                          <User size={16} />
                          <span className='text-xs font-black uppercase tracking-wider'>Passo 1: Dados Cadastrais do Inquilino</span>
                        </div>

                        {/* Always show the tenant's data in styled cards */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                          {[
                            { label: 'Nome Completo', value: tenant.name, icon: '👤' },
                            { label: 'CPF', value: tenant.cpf, icon: '🪪', mono: true },
                            { label: 'Celular / WhatsApp', value: formatPhone(tenant.phone), icon: '📱' },
                            { label: 'E-mail', value: tenant.email, icon: '✉️' },
                          ].map(field => (
                            <div key={field.label} className='p-3 bg-white/5 rounded-xl border border-white/10 space-y-1'>
                              <p className='text-[9px] text-slate-400 uppercase font-black tracking-widest'>{field.icon} {field.label}</p>
                              <p className={`text-sm font-bold text-white leading-tight ${field.mono ? 'font-mono' : ''}`}>
                                {field.value || <span className='text-slate-500 text-xs italic font-normal'>Não informado</span>}
                              </p>
                            </div>
                          ))}
                        </div>

                        {tenant.onboarding_profile_status === 'submitted' ? (
                          <div className='space-y-3'>
                            <div className='flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg'>
                              <span className='h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0' />
                              <p className='text-xs text-amber-300 font-bold'>Aguardando sua revisão e aprovação dos dados acima</p>
                            </div>

                            {showProfileReject ? (
                              <div className='space-y-2.5 animate-fadeIn'>
                                <label className='block text-[10px] font-bold text-slate-400 uppercase'>Motivo da Rejeição</label>
                                <textarea
                                  value={profileReason}
                                  onChange={(e) => setProfileReason(e.target.value)}
                                  placeholder='Ex: Nome incompleto ou CPF com dígito inválido. Por favor, corrija e envie novamente.'
                                  className='w-full p-2.5 text-xs bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-rose-500 text-white min-h-[60px]'
                                />
                                <div className='flex gap-2 justify-end'>
                                  <button onClick={() => setShowProfileReject(false)} className='px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider'>
                                    Cancelar
                                  </button>
                                  <button onClick={handleRejectProfile} disabled={actionLoading || !profileReason.trim()} className='px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider text-white'>
                                    Confirmar Rejeição
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className='flex gap-2 justify-end pt-1'>
                                <button onClick={() => setShowProfileReject(true)} className='px-4 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold uppercase tracking-wider'>
                                  Rejeitar Dados
                                </button>
                                <button onClick={handleApproveProfile} disabled={actionLoading} className='px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold uppercase tracking-wider text-white shadow-md'>
                                  {actionLoading ? 'Aprovando...' : 'Aprovar & Avançar →'}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : tenant.onboarding_profile_status === 'rejected' ? (
                          <div className='p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1'>
                            <p className='text-xs text-rose-400 font-bold'>Dados Rejeitados — aguardando correção do inquilino</p>
                            {tenant.onboarding_profile_rejected_reason && (
                              <p className='text-[10px] text-rose-300 font-mono'>Motivo: {tenant.onboarding_profile_rejected_reason}</p>
                            )}
                          </div>
                        ) : (
                          <p className='text-xs text-slate-400 font-medium'>Aguardando o inquilino preencher e enviar os dados cadastrais.</p>
                        )}
                      </div>
                    )}

                    {/* PASSO 2: ENVIO DE DOCUMENTOS */}
                    {tenant.onboarding_stage === 'documents' && (
                      <div className='space-y-3'>
                        <div className='flex items-center gap-2 text-amber-400'>
                          <Upload size={16} />
                          <span className='text-xs font-black uppercase tracking-wider'>Passo 2: Análise de Documentação</span>
                        </div>

                        {tenant.onboarding_documents_status === 'submitted' ? (
                          <div className='space-y-4'>
                            <p className='text-xs text-slate-300 leading-relaxed font-medium'>
                              O inquilino anexou os comprovantes exigidos. Clique para fazer o download e auditar a legitimidade dos arquivos.
                            </p>
                            
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                              {tenant.onboarding_documents_urls?.rg_url && (
                                <a
                                  href={tenant.onboarding_documents_urls.rg_url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 flex items-center justify-between text-left transition-colors'
                                >
                                  <div className='truncate pr-2'>
                                    <p className='text-[8px] text-slate-400 uppercase font-bold'>RG ou CNH Válida</p>
                                    <p className='text-xs font-bold text-white truncate'>{tenant.onboarding_documents_urls.rg_name || 'rg_cnh.pdf'}</p>
                                  </div>
                                  <Download size={14} className='text-slate-400 shrink-0' />
                                </a>
                              )}
                              {tenant.onboarding_documents_urls?.income_url && (
                                <a
                                  href={tenant.onboarding_documents_urls.income_url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 flex items-center justify-between text-left transition-colors'
                                >
                                  <div className='truncate pr-2'>
                                    <p className='text-[8px] text-slate-400 uppercase font-bold'>Comprovante de Renda</p>
                                    <p className='text-xs font-bold text-white truncate'>{tenant.onboarding_documents_urls.income_name || 'comprovante_renda.pdf'}</p>
                                  </div>
                                  <Download size={14} className='text-slate-400 shrink-0' />
                                </a>
                              )}
                            </div>

                            {showDocsReject ? (
                              <div className='space-y-2.5 animate-fadeIn'>
                                <label className='block text-[10px] font-bold text-slate-400 uppercase'>Motivo da Rejeição</label>
                                <textarea
                                  value={docsReason}
                                  onChange={(e) => setDocsReason(e.target.value)}
                                  placeholder='Ex: O comprovante de renda está ilegível ou expirado. Por favor, envie o documento original em formato PDF.'
                                  className='w-full p-2.5 text-xs bg-slate-900 border border-white/10 rounded-lg focus:outline-none focus:border-rose-500 text-white min-h-[60px]'
                                />
                                <div className='flex gap-2 justify-end'>
                                  <button
                                    onClick={() => setShowDocsReject(false)}
                                    className='px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider'
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={handleRejectDocs}
                                    disabled={actionLoading || !docsReason.trim()}
                                    className='px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider text-white'
                                  >
                                    Confirmar Rejeição
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className='flex gap-2 justify-end'>
                                <button
                                  onClick={() => setShowDocsReject(true)}
                                  className='px-4 py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold uppercase tracking-wider'
                                >
                                  Rejeitar Docs
                                </button>
                                <button
                                  onClick={handleApproveDocs}
                                  disabled={actionLoading}
                                  className='px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold uppercase tracking-wider text-white shadow-md'
                                >
                                  Homologar & Avançar
                                </button>
                              </div>
                            )}
                          </div>
                        ) : tenant.onboarding_documents_status === 'rejected' ? (
                          <div>
                            <p className='text-xs text-rose-400 font-bold'>Documentos Rejeitados pelo Proprietário</p>
                            <p className='text-[11px] text-slate-300 mt-1'>
                              Aguardando que o inquilino envie novas cópias e comprovantes válidos.
                            </p>
                            {tenant.onboarding_documents_rejected_reason && (
                              <div className='mt-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[10px] text-rose-350 font-mono'>
                                Motivo: {tenant.onboarding_documents_rejected_reason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className='text-xs text-slate-350 leading-relaxed font-medium'>
                            Aguardando o envio dos documentos pelo inquilino (RG/CNH + Comprovante de Renda).
                          </p>
                        )}
                      </div>
                    )}

                    {/* PASSO 3: CONTRATO DE LOCAÇÃO */}
                    {tenant.onboarding_stage === 'contract' && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-amber-400'>
                          <FileText size={16} />
                          <span className='text-xs font-black uppercase tracking-wider'>Passo 3: Contrato de Locação</span>
                        </div>
                        <p className='text-xs text-slate-300 leading-relaxed font-medium'>
                          O contrato de locação foi disponibilizado e está aguardando a assinatura eletrônica por ambas as partes.
                        </p>
                        <div className='flex items-center gap-2 mt-2 p-2 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-slate-350'>
                          <span className='h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0' />
                          Status do Contrato: {tenant.contract?.status === 'active' ? 'Assinado' : 'Pendente de Assinatura'}
                        </div>
                      </div>
                    )}

                    {/* PASSO 4: LAUDO DE VISTORIA */}
                    {tenant.onboarding_stage === 'inspection' && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-amber-400'>
                          <ClipboardCheck size={16} />
                          <span className='text-xs font-black uppercase tracking-wider'>Passo 4: Laudo de Vistoria de Entrada</span>
                        </div>
                        <p className='text-xs text-slate-350 leading-relaxed font-medium'>
                          A vistoria foi gerada e o inquilino precisa revisar e concordar com o laudo de entrada antes da entrega física das chaves.
                        </p>
                        <div className='flex items-center justify-between mt-2 pt-1'>
                          <div className='flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-slate-300'>
                            <span className='h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0' />
                            Laudo: {tenant.onboarding_inspection_status === 'approved' ? 'Aprovado pelo Inquilino' : 'Pendente'}
                          </div>
                          {tenant.onboarding_inspection_status !== 'approved' && (
                            <button
                              onClick={handleApproveInspection}
                              disabled={actionLoading}
                              className='px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-95'
                            >
                              Ignorar & Forçar Aprovação
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PASSO 5: ENTREGA DAS CHAVES */}
                    {tenant.onboarding_stage === 'keys' && (
                      <div className='space-y-4'>
                        <div className='flex items-center gap-2 text-emerald-400'>
                          <Key size={16} className='animate-bounce' />
                          <span className='text-xs font-black uppercase tracking-wider'>Passo 5: Revisão Final & Liberação das Chaves</span>
                        </div>

                        {/* Resumo completo do perfil do inquilino */}
                        <div className='space-y-2'>
                          <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>📋 Resumo do Inquilino Aprovado</p>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                            {[
                              { label: 'Nome', value: tenant.name, icon: '👤' },
                              { label: 'CPF', value: tenant.cpf, icon: '🪪', mono: true },
                              { label: 'Celular', value: formatPhone(tenant.phone), icon: '📱' },
                              { label: 'E-mail', value: tenant.email, icon: '✉️' },
                            ].map(field => (
                              <div key={field.label} className='p-2.5 bg-white/5 rounded-lg border border-white/10 space-y-0.5'>
                                <p className='text-[8px] text-slate-400 uppercase font-black tracking-widest'>{field.icon} {field.label}</p>
                                <p className={`text-xs font-bold text-white truncate leading-tight ${(field as any).mono ? 'font-mono' : ''}`}>
                                  {field.value || <span className='text-slate-500 italic font-normal'>—</span>}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ✅ ETAPAS VALIDADAS — botões de aprovação inline */}
                        <div className='space-y-2'>
                          <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>✅ Etapas Validadas</p>
                          {([
                            { label: 'Dados Cadastrais',   stepKey: 'profile'    as const, status: tenant.onboarding_profile_status },
                            { label: 'Documentos Enviados', stepKey: 'documents'  as const, status: tenant.onboarding_documents_status },
                            { label: 'Contrato Assinado',  stepKey: 'contract'   as const, status: tenant.contract?.status === 'active' ? 'approved' : (tenant.onboarding_contract_status || 'pending') },
                            { label: 'Vistoria de Entrada', stepKey: 'inspection' as const, status: tenant.onboarding_inspection_status },
                          ] as { label: string; stepKey: 'profile' | 'documents' | 'contract' | 'inspection'; status: string | undefined }[]).map((item, idx) => {
                            const isApproved = item.status === 'approved';
                            // Only the FIRST pending step gets the pulse ring
                            const items = [
                              tenant.onboarding_profile_status,
                              tenant.onboarding_documents_status,
                              tenant.contract?.status === 'active' ? 'approved' : (tenant.onboarding_contract_status || 'pending'),
                              tenant.onboarding_inspection_status,
                            ];
                            const firstPendingIdx = items.findIndex(s => s !== 'approved');
                            const isFirstPending = !isApproved && idx === firstPendingIdx;
                            const isLoading = approvingStep === item.stepKey;

                            return (
                              <div
                                key={item.label}
                                className='flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/5'
                              >
                                <span className='text-[10px] font-bold text-slate-300 flex-1 mr-3'>{item.label}</span>

                                <AnimatePresence mode='wait' initial={false}>
                                  {isApproved ? (
                                    <motion.span
                                      key='approved'
                                      initial={{ scale: 0.6, opacity: 0 }}
                                      animate={{ scale: 1,   opacity: 1 }}
                                      exit={{   scale: 0.6, opacity: 0 }}
                                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                      className='inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0'
                                    >
                                      <ShieldCheck size={10} /> Aprovado
                                    </motion.span>
                                  ) : (
                                    <motion.button
                                      key='pending'
                                      initial={{ scale: 0.9, opacity: 0 }}
                                      animate={{ scale: 1,   opacity: 1 }}
                                      exit={{   scale: 0.9, opacity: 0 }}
                                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                      onClick={() => handleApproveStep(item.stepKey)}
                                      disabled={isLoading}
                                      aria-label={`Aprovar ${item.label}`}
                                      className={[
                                        'group relative inline-flex items-center gap-1.5 text-[9px] font-black uppercase',
                                        'px-2.5 py-1 rounded-md transition-all active:scale-95 shrink-0',
                                        'bg-amber-500/10 text-amber-400 border border-amber-500/30',
                                        'hover:bg-amber-500/25 hover:border-amber-500/60 hover:text-amber-300',
                                        'disabled:opacity-60 disabled:cursor-not-allowed',
                                        isFirstPending ? 'ring-2 ring-amber-500/40 animate-pulse' : '',
                                      ].join(' ')}
                                    >
                                      {isLoading ? (
                                        <Loader2 size={10} className='animate-spin shrink-0' />
                                      ) : (
                                        <ArrowRight size={10} className='shrink-0 group-hover:translate-x-0.5 transition-transform' />
                                      )}
                                      {isLoading ? 'Aprovando…' : 'Aprovar'}
                                    </motion.button>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          onClick={handleReleaseKeys}
                          disabled={actionLoading}
                          className='w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40 active:scale-[0.98] disabled:opacity-50'
                        >
                          {actionLoading ? (
                            <>
                              <Loader2 className='animate-spin shrink-0' size={14} />
                              Liberando Chaves...
                            </>
                          ) : (
                            <>
                              <Key size={14} className='shrink-0' />
                              Liberar Chaves & Concluir Locação
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ⚠️ Warning Banner inside Config Tab if pending */}
              {criticalPendingCount > 0 && (
                <div className='p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 flex gap-3 animate-fadeIn text-left'>
                  <AlertCircle size={18} className='shrink-0 mt-0.5 text-red-500' />
                  <div>
                    <p className='text-xs font-black uppercase tracking-wider text-red-550'>Atenção Proprietário</p>
                    <p className='text-[11px] font-medium leading-relaxed mt-0.5 text-red-500 dark:text-red-400'>
                      Este perfil possui <strong>{criticalPendingCount} pendência(s) obrigatória(s)</strong>. Para garantir a segurança jurídica do negócio, certifique-se de regularizar todos os itens pendentes abaixo.
                    </p>
                  </div>
                </div>
              )}

              {tenantRequirements ? (
                <div className='space-y-6'>
                  {/* Smart Control: Employment Type */}
                  <div className='p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-white/5 space-y-3 text-left'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>Regime de Ocupação do Inquilino</span>
                      <span className='px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded uppercase tracking-widest'>Filtro Dinâmico</span>
                    </div>
                    <p className='text-[11px] text-slate-400 font-medium'>
                      Altere o regime profissional abaixo para adaptar dinamicamente quais comprovantes de rendimento são exigidos pelo sistema.
                    </p>
                    <div className='grid grid-cols-3 gap-2'>
                      {(['CLT', 'Autônomo', 'PJ'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleUpdateEmployment(type)}
                          className={`py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                            employmentType === type
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                              : 'bg-slate-50 dark:bg-white/5 text-slate-500 border border-slate-200/60 dark:border-white/10 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 1: Personal Data */}
                  <div className='space-y-3 text-left'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>👤 Dados Pessoais</p>
                    <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 divide-y divide-gray-50 dark:divide-white/5 overflow-hidden'>
                      <RequirementItem 
                        label="Nome Completo" 
                        status="required" 
                        isFulfilled={!!tenant.name} 
                      />
                      <RequirementItem 
                        label="CPF cadastrado" 
                        status="required" 
                        isFulfilled={!!tenant.cpf} 
                      />
                      {tenantRequirements.sections.personal.occupation !== 'hidden' && (
                        <RequirementItem 
                          label={`Profissão e Cargo Atual (${employmentType})`} 
                          status={tenantRequirements.sections.personal.occupation} 
                          isFulfilled={!!(tenant as any).occupation || !!tenant.email} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Category 2: Required Docs */}
                  <div className='space-y-3 text-left'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>💰 Comprovação Financeira & Garantias</p>
                    <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 divide-y divide-gray-50 dark:divide-white/5 overflow-hidden'>
                      {tenantRequirements.sections.requiredDocs.id_card !== 'hidden' && (
                        <RequirementItem 
                          label="Cópia do RG ou CNH Válida" 
                          status={tenantRequirements.sections.requiredDocs.id_card} 
                          isFulfilled={docs.some((d: any) => d.name.toLowerCase().includes('identidade') || d.name.toLowerCase().includes('cnh') || d.name.toLowerCase().includes('documento')) || !!tenant.cpf} 
                        />
                      )}
                      
                      {tenantRequirements.sections.requiredDocs.income !== 'hidden' && (
                        <RequirementItem 
                          label={
                            employmentType === 'CLT' 
                              ? "3 Últimos Holerites ou Carteira de Trabalho CTPS" 
                              : employmentType === 'Autônomo'
                                ? "Declaração de IR Completa + 3 Últimos Extratos Bancários"
                                : "Contrato Social + Declaração de Prolabore Atualizado"
                          } 
                          status={tenantRequirements.sections.requiredDocs.income} 
                          isFulfilled={docs.some((d: any) => d.name.toLowerCase().includes('renda') || d.name.toLowerCase().includes('holerite') || d.name.toLowerCase().includes('extrato') || d.name.toLowerCase().includes('trabalho') || d.name.toLowerCase().includes('ir') || d.name.toLowerCase().includes('imposto')) || !!tenant.contract} 
                        />
                      )}

                      {tenantRequirements.sections.requiredDocs.residence !== 'hidden' && (
                        <RequirementItem 
                          label="Comprovante de Residência Recente (Água, Luz, Gás)" 
                          status={tenantRequirements.sections.requiredDocs.residence} 
                          isFulfilled={docs.some((d: any) => d.name.toLowerCase().includes('residencia') || d.name.toLowerCase().includes('endereço') || d.name.toLowerCase().includes('conta') || d.name.toLowerCase().includes('luz')) && residenceRecent && residenceMatch} 
                        />
                      )}

                      {tenantRequirements.sections.requiredDocs.guarantee !== 'hidden' && (
                        <RequirementItem 
                          label="Apólice de Garantia / Fiança / Caução Registrado" 
                          status={tenantRequirements.sections.requiredDocs.guarantee} 
                          isFulfilled={docs.some((d: any) => d.name.toLowerCase().includes('garantia') || d.name.toLowerCase().includes('fiança') || d.name.toLowerCase().includes('caução')) || !!tenant.contract} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Residency Quality-Gate Manual Check */}
                  <div className='p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-white/5 space-y-3 text-left'>
                    <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5'>
                      <MapPin size={13} className='text-primary shrink-0' /> Validação do Comprovante de Residência
                    </span>
                    <p className='text-[11px] text-slate-400 font-medium'>
                      Para garantir a segurança jurídica, inspecione visualmente o anexo e valide as regras de elegibilidade abaixo:
                    </p>
                    <div className='space-y-2.5 pt-1.5'>
                      <label className='flex items-center gap-3 cursor-pointer select-none'>
                        <input
                          type='checkbox'
                          checked={residenceRecent}
                          onChange={(e) => handleToggleResidenceCheck(e.target.checked, residenceMatch)}
                          className='h-4 w-4 rounded border-slate-300 dark:border-white/10 text-primary focus:ring-primary'
                        />
                        <span className='text-xs text-slate-600 dark:text-slate-300 font-medium'>O documento foi emitido há menos de 90 dias?</span>
                      </label>
                      <label className='flex items-center gap-3 cursor-pointer select-none'>
                        <input
                          type='checkbox'
                          checked={residenceMatch}
                          onChange={(e) => handleToggleResidenceCheck(residenceRecent, e.target.checked)}
                          className='h-4 w-4 rounded border-slate-300 dark:border-white/10 text-primary focus:ring-primary'
                        />
                        <span className='text-xs text-slate-600 dark:text-slate-300 font-medium'>O documento está no nome exato do inquilino?</span>
                      </label>
                    </div>
                  </div>

                  {/* NEW FEATURE: Consulta SPC / Serasa Integrada */}
                  <div className='p-5 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-white/5 space-y-4 text-left'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5'>
                        <ShieldCheck size={16} className='text-primary shrink-0' /> Consulta SPC & Serasa Birô
                      </h4>
                      {creditChecked && (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shrink-0 ${
                          creditStatus === 'clean' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {creditStatus === 'clean' ? 'Sem Restrições' : 'CPF Restringido'}
                        </span>
                      )}
                    </div>
                    
                    <p className='text-[11px] text-slate-400 leading-relaxed font-medium'>
                      Evite calotes executando uma pesquisa em tempo real de cheques sem fundos, protestos, falências e pendências ativas nos birôs nacionais de proteção ao crédito.
                    </p>

                    {creditChecked ? (
                      <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between gap-4'>
                        <div>
                          <p className='text-[10px] font-bold text-slate-400 uppercase'>Score de Crédito Consolidado</p>
                          <p className={`text-2xl font-black leading-tight ${creditStatus === 'clean' ? 'text-emerald-500' : 'text-rose-500'}`}>{creditScore} <span className='text-xs font-medium text-slate-400'>/ 1000</span></p>
                          <p className='text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter'>Consulta realizada via API Serasa Partner</p>
                        </div>
                        <button 
                          onClick={triggerCreditCheck}
                          className='px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors shrink-0'
                        >
                          Refazer Pesquisa
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={triggerCreditCheck}
                        disabled={isCheckingCredit}
                        className='w-full py-3.5 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50'
                      >
                        {isCheckingCredit ? (
                          <>
                            <Loader2 className='animate-spin shrink-0' size={14} />
                            Verificando no banco SPC/Serasa...
                          </>
                        ) : (
                          <>
                            <Search size={14} className='shrink-0' />
                            Consultar CPF no SPC/Serasa
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* NEW FEATURE: Ficha de Referências Pessoais e Comerciais */}
                  <div className='p-5 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-white/5 space-y-4 text-left'>
                    <h4 className='font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5'>
                      <FileText size={16} className='text-primary shrink-0' /> Ficha de Referências Cadastrais
                    </h4>
                    <p className='text-[11px] text-slate-400 leading-relaxed font-medium'>
                      Registre e certifique o histórico de referências comerciais (locações anteriores) ou contatos pessoais fornecidos pelo inquilino.
                    </p>

                    <div className='space-y-3'>
                      <textarea
                        value={referencesNotes}
                        onChange={(e) => handleUpdateReferences(referencesVerified, e.target.value)}
                        placeholder='Ex: Proprietário anterior (Carlos - Tel: 11 9999-8888) confirmou que o inquilino cuidava bem do imóvel e pagava rigorosamente em dia.'
                        className='w-full p-3 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary placeholder-slate-400 dark:text-white min-h-[70px]'
                      />
                      
                      <div className='flex justify-between items-center'>
                        <span className='text-[10px] font-bold text-slate-400 uppercase'>Certificação do Dono</span>
                        <button
                          onClick={() => handleUpdateReferences(!referencesVerified, referencesNotes)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                            referencesVerified
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-slate-150 dark:bg-white/5 text-slate-550 dark:text-slate-350 hover:bg-slate-200 border border-slate-200 dark:border-white/10'
                          }`}
                        >
                          {referencesVerified ? '✓ Referências Confirmadas' : 'Marcar como Verificado'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className='p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex gap-3 text-left'>
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
