import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
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
  Wrench,
  Key,
  ShieldAlert,
  Info,
  Loader2,
  CheckCircle,
  Upload,
  ClipboardCheck,
  FileCheck,
  Camera,
  Shield,
  XCircle
} from 'lucide-react';
import { tenantService } from '../services/tenantService';
import { tenantConfigService } from '../services/tenantConfigService';
import { calculateTenantFinancials } from '../utils/financialCalculations';
import { formatPhone, getRemainingContractTime } from '../utils/formatters';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';

export const TenantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useNotification();
  const queryClient = useQueryClient();

  const activeTab = searchParams.get('tab') || 'overview';
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'payments' | 'maintenance' | 'contracts'>('all');
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  
  // Dynamic onboarding and credit states
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

  const [residenceRecent, setResidenceRecent] = useState<boolean>(() => {
    return localStorage.getItem(`igloo_residence_recent_${id}`) === 'true';
  });
  const [residenceMatch, setResidenceMatch] = useState<boolean>(() => {
    return localStorage.getItem(`igloo_residence_match_${id}`) === 'true';
  });

  // Onboarding action states
  const [approvingStep, setApprovingStep] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [profileReason, setProfileReason] = useState('');
  const [showProfileReject, setShowProfileReject] = useState(false);
  const [docsReason, setDocsReason] = useState('');
  const [showDocsReject, setShowDocsReject] = useState(false);

  const tenantEmailRef = useRef<string>('');

  // Fetch Tenant details
  const { data: tenant, isLoading, error } = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const t = await tenantService.getById(id!);
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
    enabled: !!id,
  });

  // Fetch tenant documents
  const { data: docs = [] } = useQuery({
    queryKey: ['tenant-docs', id],
    queryFn: () => tenantService.getDocuments(id!.toString()),
    enabled: !!id,
  });

  useEffect(() => {
    if (tenant?.email) {
      tenantEmailRef.current = tenant.email;
    }
  }, [tenant?.email]);

  const financialSummary = useMemo(() => calculateTenantFinancials(payments), [payments]);

  const tenantRequirements = useMemo(() => {
    if (!tenant?.property_id) return null;
    return tenantConfigService.getConfigForProperty(tenant.property_id.toString());
  }, [tenant?.property_id]);

  const pendingItems = useMemo(() => {
    if (!tenant) return [];
    const items: { label: string; fulfilled: boolean; critical: boolean; group: 'personal' | 'finance' | 'validation' }[] = [];
    
    // 👤 Dados Pessoais
    items.push({ label: "Nome Completo", fulfilled: !!tenant?.name, critical: true, group: 'personal' });
    items.push({ label: "CPF Cadastrado", fulfilled: !!tenant?.cpf, critical: true, group: 'personal' });
    
    if (tenantRequirements?.sections.personal.occupation !== 'hidden') {
      const isReq = tenantRequirements?.sections.personal.occupation === 'required';
      items.push({ 
        label: "Profissão / Ocupação informada", 
        fulfilled: !!(tenant as any).occupation || !!tenant?.email, 
        critical: isReq,
        group: 'personal'
      });
    }

    // 💰 Documentos Obrigatórios (Financeiro)
    if (tenantRequirements?.sections.requiredDocs.id_card !== 'hidden') {
      const isReq = tenantRequirements?.sections.requiredDocs.id_card === 'required';
      const hasId = docs.some((d: any) => d.name.toLowerCase().includes('identidade') || d.name.toLowerCase().includes('cnh') || d.name.toLowerCase().includes('documento')) || !!tenant?.cpf;
      items.push({ label: "Cópia do RG ou CNH anexa", fulfilled: hasId, critical: isReq, group: 'finance' });
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
        critical: isReq,
        group: 'finance'
      });
    }

    if (tenantRequirements?.sections.requiredDocs.residence !== 'hidden') {
      const isReq = tenantRequirements?.sections.requiredDocs.residence === 'required';
      const hasRes = docs.some((d: any) => d.name.toLowerCase().includes('residencia') || d.name.toLowerCase().includes('endereço') || d.name.toLowerCase().includes('conta') || d.name.toLowerCase().includes('luz') || d.name.toLowerCase().includes('agua'));
      items.push({ 
        label: "Comprovante de Residência", 
        fulfilled: hasRes && residenceRecent && residenceMatch, 
        critical: isReq,
        group: 'finance'
      });
    }

    if (tenantRequirements?.sections.requiredDocs.guarantee !== 'hidden') {
      const isReq = tenantRequirements?.sections.requiredDocs.guarantee === 'required';
      const hasGuar = docs.some((d: any) => d.name.toLowerCase().includes('garantia') || d.name.toLowerCase().includes('fiança') || d.name.toLowerCase().includes('caução') || d.name.toLowerCase().includes('apólice'));
      items.push({ label: "Apólice de Garantia ou Caução", fulfilled: hasGuar || !!tenant?.contract, critical: isReq, group: 'finance' });
    }

    // 🔍 Validações
    items.push({ 
      label: "Consulta SPC / Serasa Realizada", 
      fulfilled: creditChecked, 
      critical: true,
      group: 'validation'
    });

    items.push({ 
      label: "Ficha de Referências Verificada", 
      fulfilled: referencesVerified, 
      critical: true,
      group: 'validation'
    });

    return items;
  }, [tenant, tenantRequirements, docs, creditChecked, referencesVerified, employmentType, residenceRecent, residenceMatch]);

  const criticalPendingCount = useMemo(() => {
    return pendingItems.filter(i => i.critical && !i.fulfilled).length;
  }, [pendingItems]);

  const handleApproveStep = async (stepKey: 'profile' | 'documents' | 'contract' | 'inspection') => {
    const email = tenantEmailRef.current;
    if (!email || approvingStep) return;
    setApprovingStep(stepKey);
    try {
      let payload: any = {};
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

      const { error } = await supabase.from('profiles').update(payload).eq('email', email);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      addToast(
        '✅ Etapa Aprovada',
        `"${toastLabel}" foi homologada com sucesso. ${nextStage ? 'Próxima fase liberada para o inquilino.' : ''}`,
        'success'
      );
    } catch (err) {
      console.error(err);
      addToast('Erro ao aprovar', 'Não foi possível salvar a aprovação. Tente novamente.', 'error');
    } finally {
      setApprovingStep(null);
    }
  };

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
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      setShowProfileReject(false);
      setProfileReason('');
      addToast('Dados Aprovados', 'Os dados cadastrais do inquilino foram aprovados.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro', 'Erro ao aprovar dados cadastrais.', 'error');
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
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      setShowProfileReject(false);
      setProfileReason('');
      addToast('Dados Rejeitados', 'O inquilino foi notificado para corrigir os dados cadastrais.', 'warning');
    } catch (err) {
      console.error(err);
      addToast('Erro', 'Erro ao registrar rejeição.', 'error');
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
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      setShowDocsReject(false);
      setDocsReason('');
      addToast('Documentação Homologada', 'Os documentos do inquilino foram aprovados e a fase de contrato liberada.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro', 'Erro ao homologar documentos.', 'error');
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
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      setShowDocsReject(false);
      setDocsReason('');
      addToast('Documentação Rejeitada', 'O inquilino foi notificado sobre as pendências na documentação.', 'warning');
    } catch (err) {
      console.error(err);
      addToast('Erro', 'Erro ao rejeitar documentos.', 'error');
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
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      addToast('Vistoria Aprovada', 'A vistoria foi homologada com sucesso.', 'success');
    } catch (err) {
      console.error(err);
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
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      addToast('Chaves Liberadas', 'O processo de onboarding foi finalizado e as chaves foram liberadas.', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (tenant?.phone) {
      window.open(`https://wa.me/55${tenant.phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const triggerCreditCheck = () => {
    setIsCheckingCredit(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 380) + 620;
      const status = score > 690 ? 'clean' : 'restricted';
      setCreditChecked(true);
      setCreditScore(score);
      setCreditStatus(status as any);
      setIsCheckingCredit(false);
      localStorage.setItem(`igloo_credit_checked_${id}`, 'true');
      localStorage.setItem(`igloo_credit_score_${id}`, String(score));
      localStorage.setItem(`igloo_credit_status_${id}`, status);
      addToast('Consulta SPC/Serasa', `Pesquisa concluída! Score: ${score} pontos.`, 'success');
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

  const setActiveTab = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  // 1. LOADING STATE (SKELETONS)
  if (isLoading) {
    return (
      <div className="p-8 space-y-6 bg-background-light dark:bg-background-dark min-h-screen animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 w-36 bg-gray-200 dark:bg-white/10 rounded"></div>
        {/* Header Skeleton */}
        <div className="p-6 bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-white/5 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-white/10"></div>
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 bg-gray-200 dark:bg-white/10 rounded"></div>
            <div className="h-4 w-72 bg-gray-200 dark:bg-white/10 rounded"></div>
          </div>
        </div>
        {/* Tabs Skeleton */}
        <div className="h-11 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-2xl col-span-2"></div>
          <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // 2. ERROR / NOT FOUND STATE
  if (error || !tenant) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-background-light dark:bg-background-dark min-h-screen">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
          <ShieldAlert size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Perfil não localizado</h2>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            Não foi possível carregar os detalhes do inquilino requisitado. O perfil pode ter sido arquivado ou há uma instabilidade de conexão.
          </p>
        </div>
        <button
          onClick={() => navigate('/tenants')}
          className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm shadow-md flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <ArrowLeft size={16} /> Voltar para Inquilinos
        </button>
      </div>
    );
  }

  const contractProgress = tenant.contract ? (() => {
    const start = new Date(tenant.contract.start_date).getTime();
    const end = new Date(tenant.contract.end_date).getTime();
    const now = new Date().getTime();
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  })() : 0;

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      {/* 3. BREADCRUMBS */}
      <div className="px-8 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
          <button onClick={() => navigate('/tenants')} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> Inquilinos
          </button>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-200 font-black">{tenant.name}</span>
        </div>
      </div>

      {/* 4. CABEÇALHO DO PERFIL */}
      <div className="px-[32px] py-[28px] bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            {tenant.image ? (
              <div
                className="h-[52px] w-[52px] rounded-full bg-cover bg-center border-2 border-[#13c8ec]/40 shadow-md shrink-0"
                style={{ backgroundImage: `url(${tenant.image})` }}
              />
            ) : (
              <div className="h-[52px] w-[52px] rounded-full bg-[#1e3a5f] text-white text-[18px] font-semibold flex items-center justify-center border-2 border-[#13c8ec]/40 shrink-0">
                {tenant.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              {/* Linha 1 */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {tenant.name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-lg text-[11px] font-bold uppercase tracking-wider border shrink-0 ${
                  financialSummary.isLate
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    : 'bg-[rgba(16,185,129,0.15)] text-[#10b981] border-[rgba(16,185,129,0.3)]'
                }`} style={{ letterSpacing: '0.05em' }}>
                  <span className={`w-1.5 h-1.5 rounded-full ${financialSummary.isLate ? 'bg-rose-500 animate-pulse' : 'bg-[#10b981]'}`} />
                  {financialSummary.isLate ? 'Inadimplente' : 'Bom Pagador'}
                </span>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-gray-700 shrink-0">
                  <Star size={14} className="text-amber-500 fill-amber-500/20" />
                  <span className="text-[15px] font-bold text-[#13c8ec]">{financialSummary.punctualityRate}%</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Score Pontualidade</span>
                </div>
              </div>

              {/* Linha 2 */}
              <div className="flex items-center gap-[12px] mt-3 flex-wrap text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-[20px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-gray-700 text-[12px] font-medium text-slate-600 dark:text-slate-300">
                  <Mail size={12} className="text-slate-400 opacity-60" /> {tenant.email}
                </span>
                <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-[20px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-gray-700 text-[12px] font-medium text-slate-600 dark:text-slate-300">
                  <Phone size={12} className="text-slate-400 opacity-60" /> {formatPhone(tenant.phone)}
                </span>
                {tenant.property && (
                  <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-[20px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-gray-700 text-[12px] font-medium text-slate-600 dark:text-slate-300">
                    <Home size={12} className="text-primary opacity-60" /> {tenant.property}
                  </span>
                )}
                {tenant.contract && (
                  <>
                    <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-[20px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-gray-700 text-[12px] font-medium text-slate-600 dark:text-slate-300 font-mono">
                      <Hash size={12} className="text-slate-400 opacity-60" /> CTR-{String(tenant.contract.id).substring(0, 6).toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-[20px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-gray-700 text-[12px] font-medium text-slate-600 dark:text-slate-300">
                      <Clock size={12} className="text-slate-400 opacity-60" /> {getRemainingContractTime(tenant.contract.end_date)} restantes
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-[#25d366] hover:bg-[#20ba5a] text-white font-semibold text-xs transition-all active:scale-95 shadow-md shadow-[#25d366]/10 border-none"
            >
              <MessageCircle size={15} /> WhatsApp
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200/50 dark:border-white/5">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. TABS NAVIGATION */}
      <div className="px-8 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark sticky top-[0px] z-20">
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-gray-900/60 rounded-2xl w-fit overflow-x-auto whitespace-nowrap scrollbar-none border border-gray-200 dark:border-gray-800">
          {[
            { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
            { id: 'payments', label: 'Financeiro', icon: DollarSign },
            { id: 'docs', label: 'Contrato & Docs', icon: FileText },
            { id: 'tenantConfig', label: 'Exigências', icon: ShieldCheck, badge: criticalPendingCount > 0 ? criticalPendingCount : undefined },
            { id: 'history', label: 'Histórico', icon: Clock },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 active-tap ${
                  isActive 
                    ? 'bg-[#13c8ec]/15 text-[#13c8ec] border border-[#13c8ec]/30 shadow-[0_0_12px_rgba(19,200,236,0.1)]' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <TabIcon size={14} className="shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="relative flex h-2 w-2 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. CONTENT AREA */}
      <div className="flex-1 p-8">
        {activeTab === 'overview' && (
          <div className="animate-fadeIn space-y-6">
            {criticalPendingCount > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-3">
                  <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">Pendências Críticas de Integração</p>
                    <p className="text-[11px] text-amber-600 dark:text-slate-300 mt-0.5 font-semibold">
                      Existem {criticalPendingCount} requisitos obrigatórios em conformidade pendentes. regularize para assegurar a vigência.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('tenantConfig')}
                  className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Resolver Pendências
                </button>
              </div>
            )}

            {/* Profile Config Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Linked Property */}
              <div className="bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm col-span-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Imóvel Atual</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{tenant.property || 'Imóvel vinculado'}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                    <MapPin size={12} className="text-primary" /> {tenant.property_address || 'Endereço indisponível'}
                  </p>
                </div>
                <div className="flex items-center gap-6 mt-6 border-t border-slate-100 dark:border-white/5 pt-4">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Mensalidade</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      R$ {Number(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-100 dark:bg-white/10" />
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Dia Vencimento</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">Todo dia {tenant.contract?.payment_day || '10'}</span>
                  </div>
                </div>
              </div>

              {/* Financial Progress */}
              <div className="bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Vigência de Contrato</span>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{contractProgress}% Concluído</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${contractProgress}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-4">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">Início</span>
                    <span className="text-slate-900 dark:text-white font-bold">{tenant.contract ? new Date(tenant.contract.start_date).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">Término</span>
                    <span className="text-slate-900 dark:text-white font-bold">{tenant.contract ? new Date(tenant.contract.end_date).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* General metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pontualidade Média</span>
                <span className="text-xl font-black text-emerald-500">{financialSummary.punctualityRate}%</span>
              </div>
              <div className="bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Liquidado</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">R$ {financialSummary.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
              </div>
              <div className="bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total em Aberto</span>
                <span className={`text-xl font-black ${financialSummary.totalPending > 0 ? 'text-amber-500' : 'text-slate-950 dark:text-white'}`}>
                  R$ {financialSummary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mensalidade</span>
                <span className="text-xl font-black text-indigo-500">R$ {Number(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="animate-fadeIn space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-550/20 p-5 rounded-2xl">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">Total Liquidado</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">R$ {financialSummary.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-550/20 p-5 rounded-2xl">
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">Total Pendente</span>
                <span className="text-2xl font-black text-amber-650 dark:text-amber-400">R$ {financialSummary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <History size={16} className="text-primary" /> Histórico de Mensalidades
              </h2>
              <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline bg-primary/5 px-3 py-1.5 rounded-xl transition-all">
                <Download size={14} /> PDF
              </button>
            </div>

            <div className="space-y-3">
              {payments.length > 0 ? (
                payments.map((pay: any) => {
                  const isLate = pay.status === 'pending' && new Date(pay.due_date) < new Date();
                  const daysLate = isLate ? Math.floor((new Date().getTime() - new Date(pay.due_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  return (
                    <div
                      key={pay.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 rounded-2xl hover:border-primary/20 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          pay.status === 'paid' ? 'bg-emerald-500/15 text-emerald-500' : isLate ? 'bg-rose-500/15 text-rose-500 animate-pulse' : 'bg-amber-500/15 text-amber-500'
                        }`}>
                          {pay.status === 'paid' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <p className="font-black text-xs text-slate-800 dark:text-white">
                            Aluguel {new Date(pay.due_date).toLocaleString('pt-BR', { month: 'long' })}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                            {pay.status === 'paid' ? `Pago em ${new Date(pay.paid_date).toLocaleDateString('pt-BR')}` : `Vence em ${new Date(pay.due_date).toLocaleDateString('pt-BR')}`}
                            {isLate && <span className="text-rose-500 ml-2 font-bold">• {daysLate} dias de atraso</span>}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-xs text-slate-900 dark:text-white">R$ {Number(pay.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <span className={`text-[8px] font-black tracking-widest uppercase ${
                          pay.status === 'paid' ? 'text-emerald-500' : isLate ? 'text-rose-500' : 'text-amber-500'
                        }`}>
                          {pay.status === 'paid' ? 'CONCLUÍDO' : isLate ? 'ATRASADO' : 'PENDENTE'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-16 text-center bg-white dark:bg-surface-dark rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                  <p className="text-slate-400 text-xs font-bold">Sem mensalidades registradas.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="animate-fadeIn space-y-6">
            {tenant.contract && (
              <div className="bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">Contrato de Locação Padrão</h4>
                      <p className="text-[9px] font-mono text-slate-400 mt-0.5">CTR-{String(tenant.contract.id).substring(0, 6).toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-550 text-[9px] font-black uppercase tracking-wider">
                    Vigente
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">Valor do Aluguel</span>
                    <span className="font-black text-slate-900 dark:text-white">R$ {Number(tenant.contract.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">Garantia Locatícia</span>
                    <span className="font-bold text-slate-900 dark:text-white">Seguro Fiança / Caução</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">Reajuste</span>
                    <span className="font-bold text-slate-900 dark:text-white">IGP-M / IPCA Anual</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 px-1">
                Documentos Digitais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contract file card */}
                {tenant.contract && (
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 rounded-2xl hover:border-primary/20 min-h-[80px] shadow-sm">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-xs text-slate-900 dark:text-white truncate">Contrato de Locação Assinado</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-0.5">PDF • {new Date(tenant.contract.start_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary transition-all flex items-center justify-center shrink-0">
                      <Download size={14} />
                    </button>
                  </div>
                )}

                {/* Submited documents */}
                {docs.length > 0 ? (
                  docs.map((doc: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 rounded-2xl hover:border-primary/20 min-h-[80px] shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-xs text-slate-900 dark:text-white truncate">{doc.name}</p>
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-0.5">{doc.type || 'PDF'} • {doc.date}</p>
                        </div>
                      </div>
                      <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary transition-all flex items-center justify-center shrink-0">
                        <Download size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 p-12 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/5">
                    <p className="text-slate-400 text-xs font-bold">Nenhum documento complementar anexado pelo inquilino.</p>
                  </div>
                )}
              </div>
            </div>

            {/* STICKY FOOTER ACTIONS - FOR DOCUMENTS COMPLIANCE */}
            {tenant.onboarding_stage === 'documents' && tenant.onboarding_documents_status === 'submitted' && (
              <div className="sticky bottom-0 left-0 right-0 z-10 bg-[#0f1117] border-t border-white/8 p-[16px_32px] flex flex-col gap-3 shadow-lg">
                {showDocsReject ? (
                  <div className="space-y-3">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Descreva o motivo da rejeição</label>
                    <textarea
                      value={docsReason}
                      onChange={(e) => setDocsReason(e.target.value)}
                      placeholder="Ex: O holerite de comprovação de renda está ilegível ou desatualizado. Reenvie o holerite dos últimos 3 meses."
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-black/25 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-rose-500 text-white min-h-[60px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowDocsReject(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-wider">Cancelar</button>
                      <button onClick={handleRejectDocs} disabled={actionLoading || !docsReason.trim()} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-[10px] font-black uppercase tracking-wider text-white">Confirmar Rejeição</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-amber-500">
                      <AlertCircle size={16} />
                      <span className="text-[11px] font-black uppercase tracking-wider">Revisão Pendente do Proprietário</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDocsReject(true)}
                        className="bg-transparent hover:bg-red-500/8 text-[#f87171] border-[1.5px] border-red-500/40 p-[10px_24px] rounded-[8px] font-semibold text-[14px] transition-all active:scale-95"
                      >
                        Rejeitar Docs
                      </button>
                      <button
                        onClick={handleApproveDocs}
                        disabled={actionLoading}
                        className="bg-[#13c8ec] hover:bg-[#0fb8d8] text-[#0a0f1a] border-none p-[10px_28px] rounded-[8px] font-bold text-[14px] flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-[#13c8ec]/20"
                      >
                        {actionLoading ? 'Processando...' : <><CheckCircle size={16} /> Homologar & Avançar</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tenantConfig' && (
          <div className="animate-fadeIn space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest">Checklist de Conformidade</h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Análise Jurídica e Proteção de Risco</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#13c8ec]/10 text-[#13c8ec] border border-[#13c8ec]/20 text-[9px] font-black uppercase tracking-widest self-start md:self-auto">
                Requisitos: {tenantRequirements?.propertyId === 'global' ? 'Padrão' : 'Customizado'}
              </span>
            </div>

            {/* PIPELINE / ONBOARDING STEPS */}
            {tenant.onboarding_stage !== 'completed' && (
              <div 
                className="p-6 text-slate-900 dark:text-white rounded-xl space-y-6 shadow-sm relative overflow-hidden border bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="flex justify-between items-center border-b border-white/5 pb-4 relative z-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Esteira de Integração</h4>
                    <p className="text-[9px] text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-0.5">Acompanhe as fases de validação cadastral</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest">
                    {tenant.onboarding_stage === 'profile' ? 'Dados Cadastrais' :
                     tenant.onboarding_stage === 'documents' ? 'Envio de Documentos' :
                     tenant.onboarding_stage === 'contract' ? 'Contrato de Locação' :
                     tenant.onboarding_stage === 'inspection' ? 'Vistoria de Entrada' :
                     tenant.onboarding_stage === 'keys' ? 'Chaves' : 'Concluído'}
                  </span>
                </div>

                <div className="relative w-full py-4 z-10">
                  {/* Background Timeline Connector Line */}
                  <div className="absolute top-[50%] left-[10%] right-[10%] h-[2px] bg-slate-200/10 dark:bg-white/5 z-0 -translate-y-1/2" />
                  
                  {/* Active/Completed filled line */}
                  <div 
                    className="absolute top-[50%] left-[10%] h-[2px] bg-gradient-to-r from-emerald-500 to-[#13c8ec] transition-all duration-700 ease-out z-0 -translate-y-1/2"
                    style={{ 
                      width: `${
                        tenant.onboarding_stage === 'profile' ? '0%' :
                        tenant.onboarding_stage === 'documents' ? '20%' :
                        tenant.onboarding_stage === 'contract' ? '40%' :
                        tenant.onboarding_stage === 'inspection' ? '60%' :
                        tenant.onboarding_stage === 'keys' ? '80%' : '80%'
                      }`
                    }}
                  />

                  <div className="grid grid-cols-5 gap-4 relative z-10">
                    {[
                      { step: 'profile', label: 'Dados', status: tenant.onboarding_profile_status, icon: User },
                      { step: 'documents', label: 'Docs', status: tenant.onboarding_documents_status, icon: FileText },
                      { step: 'contract', label: 'Contrato', status: tenant.onboarding_contract_status || (tenant.contract?.status === 'active' ? 'approved' : 'pending'), icon: FileCheck },
                      { step: 'inspection', label: 'Vistoria', status: tenant.onboarding_inspection_status, icon: ClipboardCheck },
                      { step: 'keys', label: 'Chaves', status: tenant.onboarding_stage === 'completed' ? 'approved' : 'pending', icon: Key }
                    ].map((item, idx) => {
                      const isCompleted = item.status === 'approved';
                      const isSubmitted = item.status === 'submitted';
                      const isRejected = item.status === 'rejected';
                      const isActive = tenant.onboarding_stage === item.step;
                      const StepIcon = item.icon;

                      const badgeClasses = isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isSubmitted
                        ? 'bg-[#13c8ec]/10 text-[#13c8ec] border-[#13c8ec]/20'
                        : isRejected
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : isActive
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20';

                      const statusLabel = isCompleted
                        ? 'Concluído'
                        : isSubmitted
                        ? 'Em Análise'
                        : isRejected
                        ? 'Rejeitado'
                        : isActive
                        ? 'Em Andamento'
                        : 'Pendente';

                      return (
                        <div key={idx} className="flex flex-col items-center gap-1 text-center">
                          {/* Icon circle */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : isActive
                                ? 'bg-[#13c8ec]/20 border-[#13c8ec] text-[#13c8ec] shadow-[0_0_12px_rgba(19,200,236,0.3)]'
                                : 'bg-white/5 border-white/10 text-slate-500'
                            }`}
                          >
                            <StepIcon size={16} strokeWidth={2} />
                          </div>
                          {/* Label */}
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider leading-tight ${
                              isActive
                                ? 'text-[#13c8ec]'
                                : isCompleted
                                ? 'text-emerald-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {item.label}
                          </span>
                          {/* Status Badge */}
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider w-full mt-0.5 border ${badgeClasses}`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div 
                  className="rounded-2xl p-4 border border-gray-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/40 relative space-y-4"
                >
                  {tenant.onboarding_stage === 'profile' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-amber-500">
                        <User size={15} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-amber-400">Passo 1: Dados Cadastrais do Inquilino</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { label: 'Nome Completo', value: tenant.name },
                          { label: 'CPF', value: tenant.cpf },
                          { label: 'Telefone / WhatsApp', value: formatPhone(tenant.phone) },
                          { label: 'E-mail Principal', value: tenant.email }
                        ].map((field) => (
                          <div 
                            key={field.label} 
                            className="p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark rounded-xl space-y-1"
                          >
                            <span className="text-[8px] text-slate-450 dark:text-slate-455 uppercase font-black tracking-widest">{field.label}</span>
                            <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{field.value || 'Não informado'}</p>
                          </div>
                        ))}
                      </div>

                      {tenant.onboarding_profile_status === 'submitted' && (
                        <div className="space-y-3">
                          {showProfileReject ? (
                            <div className="space-y-2.5">
                              <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Descreva o motivo da rejeição</label>
                              <textarea
                                value={profileReason}
                                onChange={(e) => setProfileReason(e.target.value)}
                                placeholder="Ex: O CPF cadastrado apresenta divergência cadastral. Revise e envie novamente."
                                className="w-full p-2.5 text-xs bg-slate-900 border rounded-xl focus:outline-none focus:border-rose-500 text-slate-800 dark:text-white min-h-[60px]"
                                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setShowProfileReject(false)} className="px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase text-slate-600 dark:text-slate-350" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>Cancelar</button>
                                <button onClick={handleRejectProfile} disabled={actionLoading || !profileReason.trim()} className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-[9px] font-black uppercase text-white">Rejeitar Dados</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end pt-1">
                              <button onClick={() => setShowProfileReject(true)} className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-500 dark:text-rose-455 hover:bg-rose-500/10 text-xs font-bold uppercase tracking-wider">Rejeitar Dados</button>
                              <button onClick={handleApproveProfile} disabled={actionLoading} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                                {actionLoading ? 'Aprovando...' : 'Aprovar & Avançar →'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {tenant.onboarding_stage === 'documents' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Upload size={15} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-amber-400">Passo 2: Análise de Documentação</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                        Inspeção de documentos de renda e identificação. Revise os arquivos enviados pelo inquilino abaixo:
                      </p>

                      {/* Inline Documents List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        {docs.length > 0 ? (
                          docs.map((doc: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark rounded-xl"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText size={16} className="text-[#13c8ec] shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{doc.name}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{doc.type || 'PDF'} • {doc.date}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  if (doc.url) window.open(doc.url, '_blank');
                                }}
                                className="w-8 h-8 rounded-lg hover:bg-[#13c8ec]/10 text-slate-500 dark:text-slate-400 hover:text-[#13c8ec] flex items-center justify-center transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="md:col-span-2 p-6 text-center bg-slate-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold">Nenhum documento complementar anexado ainda.</p>
                          </div>
                        )}
                      </div>

                      {/* Inline Approval/Rejection Actions */}
                      {tenant.onboarding_documents_status === 'submitted' && (
                        <div className="border-t border-white/5 pt-4 mt-4 space-y-4">
                          {showDocsReject ? (
                            <div className="space-y-3">
                              <label className="block text-[10px] font-black text-slate-450 uppercase tracking-widest">Descreva o motivo da rejeição</label>
                              <textarea
                                value={docsReason}
                                onChange={(e) => setDocsReason(e.target.value)}
                                placeholder="Ex: O holerite de comprovação de renda está ilegível ou desatualizado. Reenvie o holerite dos últimos 3 meses."
                                className="w-full p-3 text-xs bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:border-rose-500 text-white min-h-[60px]"
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setShowDocsReject(false)} className="px-4 py-2 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-wider text-white">Cancelar</button>
                                <button onClick={handleRejectDocs} disabled={actionLoading || !docsReason.trim()} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-[10px] font-black uppercase tracking-wider text-white">Confirmar Rejeição</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2 text-amber-500">
                                <AlertCircle size={16} />
                                <span className="text-[11px] font-black uppercase tracking-wider">Revisão Cadastral Pendente</span>
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => setShowDocsReject(true)}
                                  className="bg-transparent hover:bg-red-500/8 text-[#f87171] border-[1.5px] border-red-500/40 p-[10px_24px] rounded-[8px] font-semibold text-[14px] transition-all active:scale-95"
                                >
                                  Rejeitar Documentos
                                </button>
                                <button
                                  onClick={handleApproveDocs}
                                  disabled={actionLoading}
                                  className="bg-[#13c8ec] hover:bg-[#0fb8d8] text-[#0a0f1a] border-none p-[10px_28px] rounded-[8px] font-bold text-[14px] flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-[#13c8ec]/20"
                                >
                                  {actionLoading ? 'Processando...' : <><CheckCircle size={16} className="text-black" /> Homologar & Avançar</>}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {tenant.onboarding_stage === 'contract' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-500">
                        <FileText size={15} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-855 dark:text-amber-400">Passo 3: Assinatura do Contrato</span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-300 font-semibold">O contrato está pendente de assinatura digital eletrônica pelas partes.</p>
                      <button
                        onClick={() => handleApproveStep('contract')}
                        disabled={approvingStep === 'contract'}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-650 rounded-xl text-[10px] font-black uppercase text-white flex items-center gap-2 transition-all active:scale-95"
                      >
                        {approvingStep === 'contract' ? 'Processando...' : 'Ignorar e Forçar Assinatura'}
                      </button>
                    </div>
                  )}

                  {tenant.onboarding_stage === 'inspection' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-500">
                        <ClipboardCheck size={15} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-855 dark:text-amber-400">Passo 4: Homologação de Vistoria</span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-300 font-semibold">O laudo de vistoria de entrada precisa ser aprovado pelo inquilino.</p>
                      <button
                        onClick={handleApproveInspection}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-650 rounded-xl text-[10px] font-black uppercase text-white flex items-center gap-2 transition-all active:scale-95"
                      >
                        Ignorar e Validar Laudo
                      </button>
                    </div>
                  )}

                  {tenant.onboarding_stage === 'keys' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-emerald-500">
                        <Key size={15} className="animate-bounce" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-855 dark:text-emerald-400">Passo 5: Liberação das Chaves</span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-300 font-semibold">Etapas jurídicas cumpridas. Libere as chaves físicas para concluir a integração.</p>
                      <button
                        onClick={handleReleaseKeys}
                        disabled={actionLoading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                      >
                        {actionLoading ? 'Processando...' : 'Liberar Chaves & Concluir'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Requirements Checklist Grouped */}
            <div className="space-y-6">
              {/* Segmented Filter Regime */}
              <div 
                className="border border-gray-200 dark:border-gray-800 p-5 rounded-xl space-y-3 text-left bg-white dark:bg-surface-dark"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Regime de Trabalho do Locatário</span>
                  <span className="px-2 py-0.5 bg-[#13c8ec]/10 text-[#13c8ec] border border-[#13c8ec]/20 text-[8px] font-bold rounded uppercase tracking-widest">Segmentado</span>
                </div>
                <div 
                  className="grid grid-cols-3 border border-gray-200 dark:border-gray-700 rounded-[10px] p-[4px] bg-slate-50 dark:bg-gray-900/60"
                >
                  {(['CLT', 'Autônomo', 'PJ'] as const).map((type) => {
                    const isActive = employmentType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => handleUpdateEmployment(type)}
                        className={`p-[10px] text-center text-[13px] transition-all cursor-pointer ${isActive ? '' : 'text-slate-500 dark:text-slate-400'}`}
                        style={{
                          background: isActive ? 'rgba(19,200,236,0.15)' : 'transparent',
                          color: isActive ? '#13c8ec' : undefined,
                          border: isActive ? '1px solid rgba(19,200,236,0.3)' : '1px solid transparent',
                          fontWeight: isActive ? 700 : 500,
                          borderRadius: '8px'
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Groups wrapper: 2-column grid de requisitos ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">

                {/* Group 1: Dados Pessoais */}
                <div>
                  <h4 className="text-[11px] font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase mt-5 mb-2 pl-[4px]">👤 Dados Pessoais</h4>
                  <div className="space-y-1">
                    <RequirementRow label="Nome Completo" isFulfilled={!!tenant.name} status="required" />
                    <RequirementRow label="CPF devidamente registrado" isFulfilled={!!tenant.cpf} status="required" />
                    {tenantRequirements?.sections.personal.occupation !== 'hidden' && (
                      <RequirementRow
                        label={`Profissão declarada (${employmentType})`}
                        isFulfilled={!!(tenant as any).occupation || !!tenant.email}
                        status={tenantRequirements?.sections.personal.occupation || 'required'}
                      />
                    )}
                  </div>
                </div>

                {/* Group 2: Comprovação Financeira */}
                <div>
                  <h4 className="text-[11px] font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase mt-5 mb-2 pl-[4px]">💰 Comprovação Financeira</h4>
                  <div className="space-y-1">
                    {tenantRequirements?.sections.requiredDocs.id_card !== 'hidden' && (
                      <RequirementRow
                        label="Cópia de RG ou CNH"
                        isFulfilled={docs.some((d: any) => d.name.toLowerCase().includes('identidade') || d.name.toLowerCase().includes('cnh')) || !!tenant.cpf}
                        status={tenantRequirements?.sections.requiredDocs.id_card || 'required'}
                      />
                    )}
                    {tenantRequirements?.sections.requiredDocs.income !== 'hidden' && (
                      <RequirementRow
                        label={employmentType === 'CLT' ? "3 últimos holerites" : employmentType === 'Autônomo' ? "IRPF + extrato bancário" : "Contrato social PJ + pró-labore"}
                        isFulfilled={docs.some((d: any) => d.name.toLowerCase().includes('renda') || d.name.toLowerCase().includes('holerite') || d.name.toLowerCase().includes('extrato')) || !!tenant.contract}
                        status={tenantRequirements?.sections.requiredDocs.income || 'required'}
                      />
                    )}
                    {tenantRequirements?.sections.requiredDocs.residence !== 'hidden' && (
                      <RequirementRow
                        label="Comprovante de residência legível"
                        isFulfilled={docs.some((d: any) => d.name.toLowerCase().includes('residencia') || d.name.toLowerCase().includes('endereço')) && residenceRecent && residenceMatch}
                        status={tenantRequirements?.sections.requiredDocs.residence || 'required'}
                      />
                    )}
                  </div>
                </div>

                {/* Group 3: Validações — full width */}
                <div className="md:col-span-2">
                  <h4 className="text-[11px] font-bold tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase mt-5 mb-2 pl-[4px]">🔍 Validações</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    <RequirementRow label="Consulta SPC / Serasa consolidada" isFulfilled={creditChecked} status="required" />
                    <RequirementRow label="Referências cadastrais checadas" isFulfilled={referencesVerified} status="required" />
                  </div>
                </div>

              </div>

              {/* ── Painéis de ação: 2 colunas ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

                {/* Auditoria de Residência */}
                <div className="border border-gray-200 dark:border-gray-800 p-5 rounded-xl space-y-4 bg-white dark:bg-surface-dark">
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary shrink-0" /> Auditoria de Residência
                  </span>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => handleToggleResidenceCheck(!residenceRecent, residenceMatch)}>
                      <div
                        className="w-[18px] h-[18px] rounded-[5px] border-[1.5px] transition-all flex items-center justify-center shrink-0 border-slate-300 dark:border-slate-600"
                        style={{
                          borderColor: residenceRecent ? '#13c8ec' : undefined,
                          backgroundColor: residenceRecent ? '#13c8ec' : 'transparent'
                        }}
                      >
                        {residenceRecent && (
                          <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[12px] text-slate-600 dark:text-slate-300 font-semibold leading-tight">Comprovante recente (menos de 90 dias)?</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => handleToggleResidenceCheck(residenceRecent, !residenceMatch)}>
                      <div
                        className="w-[18px] h-[18px] rounded-[5px] border-[1.5px] transition-all flex items-center justify-center shrink-0 border-slate-300 dark:border-slate-600"
                        style={{
                          borderColor: residenceMatch ? '#13c8ec' : undefined,
                          backgroundColor: residenceMatch ? '#13c8ec' : 'transparent'
                        }}
                      >
                        {residenceMatch && (
                          <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[12px] text-slate-600 dark:text-slate-300 font-semibold leading-tight">Titular coincide com o nome do locatário?</span>
                    </div>
                  </div>
                </div>

                {/* Serasa */}
                <div className="border border-gray-200 dark:border-gray-800 p-5 rounded-xl space-y-4 bg-white dark:bg-surface-dark">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-primary shrink-0" /> Consulta Birô Serasa
                    </h4>
                    {creditChecked && (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0 ${
                        creditStatus === 'clean' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {creditStatus === 'clean' ? 'Aprovado' : 'Pendência SPC'}
                      </span>
                    )}
                  </div>
                  {creditChecked ? (
                    <div className="p-4 bg-slate-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Score SPC/Serasa</span>
                        <p className={`text-2xl font-black ${creditStatus === 'clean' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {creditScore} <span className="text-xs font-semibold text-slate-400">/ 1000</span>
                        </p>
                      </div>
                      <button onClick={triggerCreditCheck} className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">
                        Reconsultar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={triggerCreditCheck}
                      disabled={isCheckingCredit}
                      className="w-full py-3 px-6 bg-primary/10 hover:bg-primary/15 border border-primary/30 rounded-xl text-primary font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    >
                      {isCheckingCredit ? 'Consultando...' : 'Iniciar Consulta SPC/Serasa'}
                    </button>
                  )}
                </div>

                {/* Ficha de referências — full width */}
                <div className="md:col-span-2 border border-gray-200 dark:border-gray-800 p-5 rounded-xl space-y-3 bg-white dark:bg-surface-dark">
                  <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={16} className="text-primary shrink-0" /> Avaliação de Referências Comerciais
                  </h4>
                  <textarea
                    value={referencesNotes}
                    onChange={(e) => handleUpdateReferences(referencesVerified, e.target.value)}
                    placeholder="Histórico ou observações sobre locações antigas do inquilino."
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-primary/40 text-slate-800 dark:text-slate-200 min-h-[60px] transition-all resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Homologação de Ficha</span>
                    <button
                      onClick={() => handleUpdateReferences(!referencesVerified, referencesNotes)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        referencesVerified ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {referencesVerified ? '✓ Verificado' : 'Marcar como Verificado'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fadeIn space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                  <Clock size={14} className="text-primary" /> Linha do Tempo
                </h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Histórico completo de eventos</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {([['all', 'Todos'], ['payments', 'Financeiro'], ['maintenance', 'Chamados'], ['contracts', 'Contratos']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setTimelineFilter(val)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                      timelineFilter === val ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Events view */}
            {(() => {
              const allEvents = [
                ...(tenant.contract ? [{
                  id: 'c-start',
                  type: 'contracts' as const,
                  date: tenant.contract.start_date,
                  title: 'Contrato Ativado',
                  desc: `Assinatura de locação para o imóvel ${tenant.property}`,
                  icon: FileText,
                  color: 'bg-primary text-white'
                }] : []),
                ...payments.map((p) => ({
                  id: `pay-${p.id}`,
                  type: 'payments' as const,
                  date: p.paid_date || p.due_date,
                  title: p.status === 'paid' ? 'Mensalidade Recebida' : 'Fatura Registrada',
                  desc: `Aluguel Ref: ${new Date(p.due_date).toLocaleString('pt-BR', { month: 'long' })} • R$ ${Number(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  icon: p.status === 'paid' ? CheckCircle2 : Clock,
                  color: p.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                })),
                ...maintenance.map((m) => ({
                  id: `maint-${m.id}`,
                  type: 'maintenance' as const,
                  date: m.created_at,
                  title: m.title,
                  desc: m.status === 'completed' ? 'Manutenção resolvida' : 'Chamado aberto em andamento',
                  icon: m.status === 'completed' ? CheckCircle2 : Wrench,
                  color: m.status === 'completed' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-white'
                }))
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

              const filtered = timelineFilter === 'all' ? allEvents : allEvents.filter(e => e.type === timelineFilter);

              if (filtered.length === 0) {
                return (
                  <div className="py-16 text-center">
                    <Clock size={36} className="text-slate-200 dark:text-white/10 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold text-xs">Sem registros históricos.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5">
                  {filtered.map((ev) => (
                    <div key={ev.id} className="relative flex gap-5 items-start">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-background-light dark:border-background-dark ${ev.color}`}>
                        <ev.icon size={14} />
                      </div>
                      <div className="flex-1 bg-white dark:bg-surface-dark border border-gray-200/50 dark:border-white/5 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4 className="text-xs font-black text-slate-800 dark:text-white">{ev.title}</h4>
                          <span className="text-[9px] font-bold text-slate-400">{new Date(ev.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal font-semibold">{ev.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper row for checklist items
const RequirementRow = ({ label, isFulfilled, status }: { label: string; isFulfilled: boolean; status: 'required' | 'optional' | 'hidden' }) => (
  <div 
    className="flex items-center min-h-[48px] p-[10px_16px] rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-gray-800/60 mb-[6px] transition-all"
  >
    <div className="flex items-center gap-[12px] flex-1 min-w-0 mr-[12px]">
      <div className="shrink-0 flex items-center justify-center">
        {isFulfilled ? (
          <CheckCircle size={16} className="text-emerald-500" />
        ) : (
          <span className="h-[10px] w-[10px] rounded-full bg-slate-300 dark:bg-slate-600 block" />
        )}
      </div>
      <span 
        className={`text-[14px] truncate ${
          isFulfilled 
            ? 'line-through text-slate-400 dark:text-slate-600 font-normal' 
            : 'text-slate-700 dark:text-slate-200 font-medium'
        }`}
      >
        {label}
      </span>
    </div>
    <span 
      className={`inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-wider px-[8px] py-[3px] rounded-[20px] shrink-0 ml-auto border ${
        status === 'required' 
          ? 'bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border-red-200 dark:border-red-500/20' 
          : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
      }`}
    >
      {status === 'required' ? 'Obrigatório' : 'Opcional'}
    </span>
  </div>
);

export default TenantDetailsPage;
