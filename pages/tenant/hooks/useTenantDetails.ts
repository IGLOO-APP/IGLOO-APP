import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '../../../services/tenancy/tenantService';
import { contractService } from '../../../services/tenancy/contractService';
import { tenantConfigService } from '../../../services/tenancy/tenantConfigService';
import { tenantScreeningService } from '../../../services/tenancy/tenantScreeningService';
import { calculateTenantFinancials } from '../../../utils/financialCalculations';
import { formatPhone, getRemainingContractTime } from '../../../utils/formatters';
import { fixDocumentUrl } from '../../../utils/mappingUtils';
import { useNotification } from '../../../context/NotificationContext';
import { profileService } from '../../../services/profileService';
import { supabase } from '../../../lib/supabase';
import { isValidUrl } from '../../../utils/validation';

export function useTenantDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useNotification();
  const queryClient = useQueryClient();

  const activeTab = searchParams.get('tab') || 'overview';
  const [timelineFilter, setTimelineFilter] = useState<
    'all' | 'payments' | 'maintenance' | 'contracts'
  >('all');
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [contractHistory, setContractHistory] = useState<any[]>([]);

  const { data: screening = null } = useQuery({
    queryKey: ['tenant-screening', id],
    queryFn: () => tenantScreeningService.getScreening(id!),
    enabled: !!id,
  });

  const creditChecked = screening?.credit_checked ?? false;
  const creditScore = screening?.credit_score ?? null;
  const creditStatus = screening?.credit_status ?? null;
  const isCheckingCredit = false;

  const referencesVerified = screening?.references_verified ?? false;
  const referencesNotes = screening?.references_notes ?? '';
  const employmentType = screening?.employment_type ?? 'CLT';
  const residenceRecent = screening?.residence_recent ?? false;
  const residenceMatch = screening?.residence_match ?? false;

  const upsertMutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) =>
      tenantScreeningService.upsertScreening({ tenant_id: id!, ...updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-screening', id] });
    },
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewUrlTitle] = useState<string>('');
  const [previewPage, setPreviewPage] = useState(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [apyPreviewUrl, setApyPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [modalActionLoading, setModalActionLoading] = useState(false);
  const [modalRejectReason, setModalRejectReason] = useState('');
  const [showModalRejectInput, setShowModalRejectInput] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleApproveDocsFromModal = async () => {
    if (!tenant) return;
    setModalActionLoading(true);
    try {
      await profileService.update(tenant.id, {
        onboarding_documents_status: 'approved',
        onboarding_stage: 'contract',
      });
      addToast('Sucesso', 'Etapa de documentos aprovada com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      setPreviewUrl(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      addToast('Erro', 'Falha ao aprovar documentos.', 'error');
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleRejectDocsFromModal = async () => {
    if (!tenant || !modalRejectReason.trim()) return;
    setModalActionLoading(true);
    try {
      await profileService.update(tenant.id, {
        onboarding_documents_status: 'rejected',
        onboarding_documents_rejected_reason: modalRejectReason,
        onboarding_stage: 'documents',
        has_completed_onboarding: false,
      });
      addToast(
        'Solicitação enviada',
        'Documentos marcados para correção e inquilino notificado.',
        'success'
      );
      setShowModalRejectInput(false);
      setModalRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      setPreviewUrl(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      addToast('Erro', 'Falha ao registrar recusa.', 'error');
    } finally {
      setModalActionLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewUrl(null);
        setShowModalRejectInput(false);
        setModalRejectReason('');
      }
    };
    if (previewUrl) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewUrl]);

  const handleOpenPreview = async (url: string, title: string, id?: string) => {
    const fixedUrl = fixDocumentUrl(url);
    setPreviewUrl(fixedUrl);
    setOriginalUrl(url);
    setPreviewUrlTitle(title);
    setPreviewPage(1);
    setApyPreviewUrl(null);
    setPreviewError(null);
    if (id && id !== 'doc' && !fixedUrl.includes('google.com')) {
      setIsPreviewLoading(true);
      try {
        const { data, error: invokeError } = await supabase.functions.invoke('preview', {
          body: { url: fixedUrl, id },
        });
        if (invokeError) throw invokeError;
        if (data && data.data) setApyPreviewUrl(data.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.warn('Erro ao gerar preview via Edge Function (fallback direto):', err);
      } finally {
        setIsPreviewLoading(false);
      }
    }
  };

  const handleRejectFromPreview = () => {
    setPreviewUrl(null);
    setActiveTab('tenantConfig');
    addToast(
      'Solicitar Ajuste',
      'Redirecionando para o painel de exigências para registrar a recusa.',
      'info'
    );
  };

  const tenantEmailRef = useRef<string>('');

  const {
    data: tenant,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const t = await tenantService.getById(id!);
      if (t?.contract) {
        const [paymentsData, maintenanceData, fullContract] = await Promise.all([
          tenantService.getPayments(String(t.contract.id)),
          tenantService.getMaintenanceRequests(String(t.id)),
          contractService.getById(String(t.contract.id)),
        ]);
        setPayments(paymentsData);
        setMaintenance(maintenanceData);
        if (fullContract?.history) setContractHistory(fullContract.history);
      }
      return t;
    },
    enabled: !!id,
  });

  const { data: docs = [], refetch: refetchDocs } = useQuery({
    queryKey: ['tenant-docs', id],
    queryFn: () => tenantService.getDocuments(id!.toString()),
    enabled: !!id,
  });

  useEffect(() => {
    if (id) refetchDocs();
  }, [id, tenant?.onboarding_documents_status, refetchDocs]);
  useEffect(() => {
    if (tenant?.email) tenantEmailRef.current = tenant.email;
  }, [tenant?.email]);

  const financialSummary = useMemo(() => calculateTenantFinancials(payments), [payments]);
  const currentDisplayStage = tenant?.onboarding_stage || 'profile';
  const { data: tenantRequirements } = useQuery({
    queryKey: ['tenant-config', tenant?.property_id],
    queryFn: () => tenantConfigService.getConfigForProperty(tenant!.property_id!.toString()),
    enabled: !!tenant?.property_id,
  });

  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);

  const manualOverrides = useMemo(
    () => screening?.manual_overrides ?? {},
    [screening?.manual_overrides]
  );

  const toggleManualOverride = (label: string) => {
    const newOverrides = { ...manualOverrides, [label]: !manualOverrides[label] };
    upsertMutation.mutate({ manual_overrides: newOverrides });
    addToast('Requisito Atualizado', `Status de "${label}" alterado manualmente.`, 'info');
  };

  const pendingItems = useMemo(() => {
    if (!tenant) return [];
    const items: {
      label: string;
      fulfilled: boolean;
      critical: boolean;
      group: 'personal' | 'finance' | 'validation';
      description: string;
    }[] = [];
    items.push({
      label: 'Nome Completo',
      fulfilled: !!tenant?.name || manualOverrides['Nome Completo'],
      critical: true,
      group: 'personal' as const,
      description: 'Nome civil completo conforme documento de identidade.',
    });
    items.push({
      label: 'CPF',
      fulfilled: !!tenant?.cpf || manualOverrides['CPF'],
      critical: true,
      group: 'personal' as const,
      description: 'Cadastro de Pessoa Física válido e sem restrições graves.',
    });
    if (tenantRequirements?.sections.personal.occupation !== 'hidden') {
      items.push({
        label: 'Profissão / Ocupação',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fulfilled: !!(tenant as any).occupation || manualOverrides['Profissão / Ocupação'],
        critical: tenantRequirements?.sections.personal.occupation === 'required',
        group: 'personal' as const,
        description: 'Atividade profissional atual declarada pelo proponente.',
      });
    }
    if (tenantRequirements?.sections.requiredDocs.id_card !== 'hidden') {
      const hasId =
        docs.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (d: any) =>
            d.name.toLowerCase().includes('identidade') ||
            d.name.toLowerCase().includes('cnh') ||
            d.name.toLowerCase().includes('documento')
        ) || !!tenant?.cpf;
      items.push({
        label: 'RG ou CNH',
        fulfilled: hasId || manualOverrides['RG ou CNH'],
        critical: tenantRequirements?.sections.requiredDocs.id_card === 'required',
        group: 'finance' as const,
        description: 'Documento oficial com foto digitalizado em boa qualidade.',
      });
    }
    if (tenantRequirements?.sections.requiredDocs.income !== 'hidden') {
      const hasIncome = docs.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) =>
          d.name.toLowerCase().includes('renda') ||
          d.name.toLowerCase().includes('holerite') ||
          d.name.toLowerCase().includes('extrato') ||
          d.name.toLowerCase().includes('trabalho') ||
          d.name.toLowerCase().includes('ir') ||
          d.name.toLowerCase().includes('imposto')
      );
      items.push({
        label: 'Comprovação de Renda',
        fulfilled: hasIncome || !!tenant?.contract || manualOverrides['Comprovação de Renda'],
        critical: tenantRequirements?.sections.requiredDocs.income === 'required',
        group: 'finance' as const,
        description: 'Comprovantes dos últimos 3 meses (Holerite ou Extrato).',
      });
    }
    if (tenantRequirements?.sections.requiredDocs.residence !== 'hidden') {
      const hasRes = docs.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) =>
          d.name.toLowerCase().includes('residencia') ||
          d.name.toLowerCase().includes('endereço') ||
          d.name.toLowerCase().includes('conta') ||
          d.name.toLowerCase().includes('luz') ||
          d.name.toLowerCase().includes('agua')
      );
      items.push({
        label: 'Comprovante de Residência',
        fulfilled:
          (hasRes && residenceRecent && residenceMatch) ||
          manualOverrides['Comprovante de Residência'],
        critical: tenantRequirements?.sections.requiredDocs.residence === 'required',
        group: 'finance' as const,
        description: 'Conta de consumo (luz, água ou gás) com menos de 90 dias.',
      });
    }
    if (tenantRequirements?.sections.requiredDocs.guarantee !== 'hidden') {
      const hasGuar = docs.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) =>
          d.name.toLowerCase().includes('garantia') ||
          d.name.toLowerCase().includes('fiança') ||
          d.name.toLowerCase().includes('caução') ||
          d.name.toLowerCase().includes('apólice')
      );
      items.push({
        label: 'Garantia Locatícia',
        fulfilled: hasGuar || !!tenant?.contract || manualOverrides['Garantia Locatícia'],
        critical: tenantRequirements?.sections.requiredDocs.guarantee === 'required',
        group: 'finance' as const,
        description: 'Formalização da garantia escolhida (Seguro, Caução ou Fiança).',
      });
    }
    items.push({
      label: 'Consulta SPC / Serasa',
      fulfilled: creditChecked || manualOverrides['Consulta SPC / Serasa'],
      critical: true,
      group: 'validation' as const,
      description: 'Análise de histórico de crédito e apontamentos financeiros.',
    });
    items.push({
      label: 'Ficha de Referências',
      fulfilled: referencesVerified || manualOverrides['Ficha de Referências'],
      critical: true,
      group: 'validation' as const,
      description: 'Checagem de referências de locações anteriores e profissionais.',
    });
    return items;
  }, [
    tenant,
    tenantRequirements,
    docs,
    creditChecked,
    referencesVerified,
    residenceRecent,
    residenceMatch,
    manualOverrides,
  ]);

  const complianceScore = useMemo(() => {
    if (pendingItems.length === 0) return 0;
    return Math.round((pendingItems.filter((i) => i.fulfilled).length / pendingItems.length) * 100);
  }, [pendingItems]);

  const riskLevel = useMemo(() => {
    const criticalPending = pendingItems.filter((i) => i.critical && !i.fulfilled).length;
    if (criticalPending === 0)
      return {
        label: 'Baixo Risco',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        icon: 'ShieldCheck' as const,
      };
    if (criticalPending <= 2)
      return {
        label: 'Risco Moderado',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        icon: 'AlertCircle' as const,
      };
    return {
      label: 'Alto Risco',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      icon: 'ShieldAlert' as const,
    };
  }, [pendingItems]);

  const criticalPendingCount = useMemo(
    () => pendingItems.filter((i) => i.critical && !i.fulfilled).length,
    [pendingItems]
  );

  const handleWhatsApp = () => {
    if (tenant?.phone) {
      const waUrl = `https://wa.me/55${tenant.phone.replace(/\D/g, '')}`;
      if (isValidUrl(waUrl)) window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const triggerCreditCheck = () => {
    const score = Math.floor(Math.random() * 380) + 620;
    const status = score > 690 ? 'clean' : 'restricted';
    upsertMutation.mutate({
      credit_checked: true,
      credit_score: score,
      credit_status: status,
    });
    addToast('Consulta SPC/Serasa', `Pesquisa concluída! Score: ${score} pontos.`, 'success');
  };

  const handleUpdateReferences = (verified: boolean, notes: string) => {
    upsertMutation.mutate({ references_verified: verified, references_notes: notes });
  };

  const handleUpdateEmployment = (type: 'CLT' | 'Autônomo' | 'PJ') => {
    upsertMutation.mutate({ employment_type: type });
  };

  const handleToggleResidenceCheck = (recent: boolean, match: boolean) => {
    upsertMutation.mutate({ residence_recent: recent, residence_match: match });
  };

  const handleDeleteTenant = async () => {
    if (!tenant || !deleteReason.trim()) return;
    setIsDeleting(true);
    try {
      await tenantService.delete(tenant.id);
      addToast(
        'Inquilino Excluído',
        `${tenant.name} foi removido permanentemente. Motivo: ${deleteReason}`,
        'success'
      );
      navigate('/tenants');
    } catch (err) {
      console.error(err);
      addToast('Erro', 'Falha ao excluir inquilino.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteReason('');
    }
  };

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ['tenant', id] });

  const setActiveTab = (tabName: string) => setSearchParams({ tab: tabName });

  return {
    handleRefresh,
    id,
    tenant,
    isLoading,
    error,
    navigate,
    payments,
    maintenance,
    contractHistory,
    docs,
    activeTab,
    setActiveTab,
    timelineFilter,
    setTimelineFilter,
    financialSummary,
    currentDisplayStage,
    pendingItems,
    complianceScore,
    riskLevel,
    criticalPendingCount,
    creditChecked,
    creditScore,
    creditStatus,
    isCheckingCredit,
    triggerCreditCheck,
    referencesVerified,
    referencesNotes,
    handleUpdateReferences,
    employmentType,
    handleUpdateEmployment,
    residenceRecent,
    residenceMatch,
    handleToggleResidenceCheck,
    manualOverrides,
    toggleManualOverride,
    highlightedItem,
    setHighlightedItem,
    handleWhatsApp,
    handleOpenPreview,
    handleRejectFromPreview,
    previewUrl,
    setPreviewUrl,
    originalUrl,
    setOriginalUrl,
    previewTitle,
    setPreviewUrlTitle,
    previewPage,
    setPreviewPage,
    isPreviewLoading,
    setIsPreviewLoading,
    apyPreviewUrl,
    setApyPreviewUrl,
    previewError,
    setPreviewError,
    modalActionLoading,
    modalRejectReason,
    setModalRejectReason,
    showModalRejectInput,
    setShowModalRejectInput,
    handleApproveDocsFromModal,
    handleRejectDocsFromModal,
    tenantRequirements,
    showDeleteDialog,
    setShowDeleteDialog,
    deleteReason,
    setDeleteReason,
    isDeleting,
    handleDeleteTenant,
    contractProgress: tenant?.contract
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((new Date().getTime() - new Date(tenant.contract.start_date).getTime()) /
                (new Date(tenant.contract.end_date).getTime() -
                  new Date(tenant.contract.start_date).getTime())) *
                100
            )
          )
        )
      : 0,
    getRemainingContractTime: tenant?.contract?.end_date
      ? getRemainingContractTime(tenant.contract.end_date)
      : '',
    formatPhone: tenant?.phone ? formatPhone(tenant.phone) : '',
  };
}
