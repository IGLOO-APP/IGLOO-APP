import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Upload, PenTool, ClipboardCheck, Key } from 'lucide-react';
import { Tenant, Guarantor } from '../../types';
import { fixDocumentUrl } from '../../utils/mappingUtils';
import { OnboardingProgress, StepCard, ErrorAlert } from '../onboarding';
import type { OnboardingStepConfig } from '../onboarding';
import { OnboardingRejectModal } from './onboarding/OnboardingRejectModal';
import { OnboardingDocumentPreview } from './onboarding/OnboardingDocumentPreview';
import { ProfileStepContent } from './onboarding/ProfileStepContent';
import { DocumentStepContent } from './onboarding/DocumentStepContent';
import { ContractStepContent } from './onboarding/ContractStepContent';
import { InspectionStepContent } from './onboarding/InspectionStepContent';
import { KeysStepContent } from './onboarding/KeysStepContent';
import { documentService, PropertyDocument } from '../../services/documentService';
import { profileService } from '../../services/profileService';
import { contractService } from '../../services/tenancy/contractService';

interface OwnerOnboardingReviewChecklistProps {
  tenant: Tenant;
  onRefresh: () => void;
  onPreview?: (url: string, title: string, id?: string) => void;
}

const buildSteps = (tenant: Tenant): OnboardingStepConfig[] => [
  {
    id: 'profile',
    title: 'Dados Cadastrais',
    desc: 'Valide os dados de identificação e contato do inquilino.',
    completed: tenant.onboarding_profile_status === 'approved',
    status: tenant.onboarding_profile_status || 'pending',
    unlocked: true,
    icon: User,
    color: 'text-blue-500 bg-blue-500/10',
  },
  {
    id: 'documents',
    title: 'Envio de Documentos',
    desc: 'Revise o documento de identidade e comprovante de renda.',
    completed: tenant.onboarding_documents_status === 'approved',
    status: tenant.onboarding_documents_status || 'pending',
    unlocked: true,
    icon: Upload,
    color: 'text-purple-500 bg-purple-500/10',
  },
  {
    id: 'contract',
    title: 'Contrato de Locação',
    desc: 'Confirme a assinatura do contrato de locação.',
    completed:
      tenant.onboarding_contract_status === 'approved' || tenant.contract?.status === 'active',
    status:
      tenant.onboarding_contract_status ||
      (tenant.contract?.status === 'active' ? 'approved' : 'pending'),
    unlocked: true,
    icon: PenTool,
    color: 'text-amber-500 bg-amber-500/10',
  },
  {
    id: 'inspection',
    title: 'Laudo de Vistoria de Entrada',
    desc: 'Confirme o laudo de vistoria de entrada.',
    completed: tenant.onboarding_inspection_status === 'approved',
    status: tenant.onboarding_inspection_status || 'pending',
    unlocked: true,
    icon: ClipboardCheck,
    color: 'text-orange-500 bg-orange-500/10',
  },
  {
    id: 'keys',
    title: 'Entrega das Chaves',
    desc: 'Liberação final e entrega das chaves do imóvel.',
    completed: tenant.onboarding_stage === 'completed',
    status: tenant.onboarding_stage === 'completed' ? 'approved' : 'pending',
    unlocked: true,
    icon: Key,
    color: 'text-emerald-500 bg-emerald-500/10',
  },
];

const statusLabels: Record<string, string> = {
  approved: 'Aprovado',
  submitted: 'Em Análise',
  rejected: 'Rejeitado',
  pending: 'Pendente',
};

export const OwnerOnboardingReviewChecklist: React.FC<OwnerOnboardingReviewChecklistProps> = ({
  tenant,
  onRefresh,
  onPreview,
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [internalPreviewUrl, setInternalPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('Documento');

  const [profileFields, setProfileFields] = useState<
    Record<string, { status: 'pending' | 'approved' | 'rejected'; reason?: string }>
  >({
    name: { status: 'pending' },
    cpf: { status: 'pending' },
    rg: { status: 'pending' },
    phone: { status: 'pending' },
    email: { status: 'pending' },
    company_name: { status: 'pending' },
    company_cnpj: { status: 'pending' },
    company_address: { status: 'pending' },
    occupation: { status: 'pending' },
    monthly_income: { status: 'pending' },
    admission_date: { status: 'pending' },
  });
  const [documentsStatus, setDocumentsStatus] = useState<
    Record<string, { status: 'pending' | 'approved' | 'rejected'; reason?: string }>
  >({
    rg: { status: 'pending' },
    income: { status: 'pending' },
    residence: { status: 'pending' },
    guarantee: { status: 'pending' },
  });
  const [guarantorData, setGuarantorData] = useState<Guarantor | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<PropertyDocument | null>(null);

  useEffect(() => {
    if (tenant?.id) {
      import('../../services/tenancy/guarantorService').then(({ guarantorService }) => {
        guarantorService.getByTenant(tenant.id).then(setGuarantorData);
      });
      documentService.getPaymentReceipt(tenant.id).then(setPaymentReceipt);
    }
  }, [tenant?.id]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [fieldReason, setFieldReason] = useState<string>('');
  const [docReason, setDocReason] = useState<string>('');

  const steps = buildSteps(tenant);
  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  useEffect(() => {
    if (!expandedStep) {
      const activeStep = steps.find((s) => s.status === 'submitted');
      if (activeStep) setExpandedStep(activeStep.id);
    }
    // Sync employment profile fields
    if (tenant.company_name && profileFields.company_name.status === 'pending') {
      setProfileFields((prev) => ({ ...prev, company_name: { status: 'approved' } }));
    }
    if (tenant.occupation && profileFields.occupation.status === 'pending') {
      setProfileFields((prev) => ({ ...prev, occupation: { status: 'approved' } }));
    }
    if (tenant.monthly_income && profileFields.monthly_income.status === 'pending') {
      setProfileFields((prev) => ({ ...prev, monthly_income: { status: 'approved' } }));
    }
    if (tenant.admission_date && profileFields.admission_date.status === 'pending') {
      setProfileFields((prev) => ({ ...prev, admission_date: { status: 'approved' } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tenant.onboarding_profile_status,
    tenant.onboarding_documents_status,
    tenant.onboarding_contract_status,
    tenant.onboarding_inspection_status,
    tenant.onboarding_stage,
    tenant.company_name,
    tenant.occupation,
    tenant.monthly_income,
    tenant.admission_date,
  ]);

  const toggleExpand = (stepId: string) => {
    setErrorMsg(null);
    setExpandedStep((prev) => (prev === stepId ? null : stepId));
  };

  const handlePreview = (url: string, title: string, id?: string) => {
    if (onPreview) {
      onPreview(url, title, id);
      return;
    }
    const fixedUrl = fixDocumentUrl(url);
    setPreviewTitle(title);
    setInternalPreviewUrl(fixedUrl);
  };

  const handleApproveStep = async (stepId: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const updates: Record<string, string | boolean> = {};
      switch (stepId) {
        case 'profile':
          updates.onboarding_profile_status = 'approved';
          updates.onboarding_stage = 'documents';
          break;
        case 'documents':
          updates.onboarding_documents_status = 'approved';
          updates.onboarding_stage = 'contract';
          // Auto-approve guarantor if fiador
          if (tenant.guarantee_type === 'fiador' && guarantorData?.id) {
            const { guarantorService } = await import('../../services/tenancy/guarantorService');
            await guarantorService.updateStatus(guarantorData.id, 'aprovado');
          }
          break;
        case 'contract':
          updates.onboarding_contract_status = 'approved';
          updates.onboarding_stage = 'inspection';
          if (tenant.contract?.id)
            await contractService.updateStatus(tenant.contract.id.toString(), 'active');
          break;
        case 'inspection':
          updates.onboarding_inspection_status = 'approved';
          updates.onboarding_stage = 'keys';
          break;
        case 'keys':
          updates.onboarding_stage = 'completed';
          break;
      }
      await profileService.updateByEmail(
        tenant.email,
        updates as Record<string, string | boolean | null>
      );
      onRefresh();
      setExpandedStep(null);
    } catch {
      setErrorMsg('Erro ao aprovar etapa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const checkAndAutoApproveDocuments = async () => {
    // After guarantee action, check if all docs are approved and auto-advance
    const allDocsApproved = Object.values(documentsStatus).every((d) => d.status === 'approved');
    if (allDocsApproved) {
      await handleApproveStep('documents');
    }
  };

  const handleConfirmReceipt = async () => {
    if (!paymentReceipt?.id) return;
    setLoading(true);
    try {
      await documentService.updatePropertyDocument(paymentReceipt.id, { status: 'Validado' });
      setPaymentReceipt((prev) => (prev ? { ...prev, status: 'Validado' } : prev));
      await checkAndAutoApproveDocuments();
    } catch {
      setErrorMsg('Erro ao confirmar recibo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReceipt = async () => {
    if (!paymentReceipt?.id) return;
    setLoading(true);
    try {
      await documentService.updatePropertyDocument(paymentReceipt.id, { status: 'Pendente' });
      setPaymentReceipt((prev) => (prev ? { ...prev, status: 'Pendente' } : prev));
      // Also mark onboarding docs as pending resubmission
      await profileService.updateByEmail(tenant.email, {
        onboarding_documents_status: 'rejected',
        onboarding_documents_rejected_reason:
          'Comprovante de depósito inválido. Por favor, reenvie.',
      });
      onRefresh();
    } catch {
      setErrorMsg('Erro ao solicitar reenvio do comprovante.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveGuarantor = async () => {
    if (!guarantorData?.id) return;
    setLoading(true);
    try {
      const { guarantorService } = await import('../../services/tenancy/guarantorService');
      await guarantorService.updateStatus(guarantorData.id, 'aprovado');
      setGuarantorData((prev: any) => ({ ...prev, status: 'aprovado' }));
      await checkAndAutoApproveDocuments();
    } catch {
      setErrorMsg('Erro ao aprovar fiador.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectGuarantor = async () => {
    if (!guarantorData?.id) return;
    setLoading(true);
    try {
      const { guarantorService } = await import('../../services/tenancy/guarantorService');
      await guarantorService.updateStatus(guarantorData.id, 'reprovado');
      setGuarantorData((prev) => (prev ? { ...prev, status: 'reprovado' } : prev));
      // Mark docs as rejected too
      await profileService.updateByEmail(tenant.email, {
        onboarding_documents_status: 'rejected',
        onboarding_documents_rejected_reason:
          'Fiador reprovado. Por favor, indique um novo fiador.',
      });
      onRefresh();
    } catch {
      setErrorMsg('Erro ao reprovar fiador.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProfileFields = async () => {
    const rejectedFields = Object.entries(profileFields)
      .filter(([, v]) => v.status === 'rejected')
      .map(([k, v]) => {
        const map: Record<string, string> = {
          name: 'Nome Completo',
          cpf: 'CPF',
          phone: 'Celular',
          email: 'E-mail',
        };
        return `${map[k] || k}: ${v.reason}`;
      });
    if (!rejectedFields.length) {
      setErrorMsg('Nenhum campo está marcado como rejeitado.');
      return;
    }
    const compiledReason = `Ajustes necessários nos seguintes dados:\n${rejectedFields.map((f) => `• ${f}`).join('\n')}`;
    setLoading(true);
    try {
      await profileService.updateByEmail(tenant.email, {
        onboarding_profile_status: 'rejected',
        onboarding_profile_rejected_reason: compiledReason,
        onboarding_stage: 'profile',
        has_completed_onboarding: false,
      });
      onRefresh();
      setExpandedStep(null);
    } catch {
      setErrorMsg('Erro ao registrar rejeição dos dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDocs = async () => {
    const rejectedDocs = Object.entries(documentsStatus)
      .filter(([, v]) => v.status === 'rejected')
      .map(([k, v]) => {
        const map: Record<string, string> = {
          rg: 'Documento de Identidade',
          income: 'Comprovante de Renda',
          residence: 'Comprovante de Residência',
          guarantee: 'Garantia Locatícia',
        };
        return `${map[k] || k}: ${v.reason}`;
      });
    if (!rejectedDocs.length) {
      setErrorMsg('Nenhum documento está marcado como rejeitado.');
      return;
    }
    const compiledReason = `Ajustes necessários nos seguintes documentos:\n${rejectedDocs.map((d) => `• ${d}`).join('\n')}`;
    setLoading(true);
    try {
      await profileService.updateByEmail(tenant.email, {
        onboarding_documents_status: 'rejected',
        onboarding_documents_rejected_reason: compiledReason,
        onboarding_stage: 'documents',
        has_completed_onboarding: false,
      });
      onRefresh();
      setExpandedStep(null);
    } catch {
      setErrorMsg('Erro ao registrar rejeição dos documentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectStep = async (stepId: string) => {
    if (!rejectReason.trim()) {
      setErrorMsg('Por favor, informe o motivo da rejeição.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const updates: Record<string, string | boolean> = {};
      switch (stepId) {
        case 'profile':
          updates.onboarding_profile_status = 'rejected';
          updates.onboarding_profile_rejected_reason = rejectReason;
          updates.onboarding_stage = 'profile';
          updates.has_completed_onboarding = false;
          break;
        case 'documents':
          updates.onboarding_documents_status = 'rejected';
          updates.onboarding_documents_rejected_reason = rejectReason;
          updates.onboarding_stage = 'documents';
          updates.has_completed_onboarding = false;
          break;
        case 'contract':
          updates.onboarding_contract_status = 'rejected';
          updates.onboarding_stage = 'contract';
          updates.has_completed_onboarding = false;
          break;
        case 'inspection':
          updates.onboarding_inspection_status = 'rejected';
          updates.onboarding_stage = 'inspection';
          updates.has_completed_onboarding = false;
          break;
      }
      await profileService.updateByEmail(
        tenant.email,
        updates as Record<string, string | boolean | null>
      );
      onRefresh();
      setExpandedStep(null);
      setShowRejectModal(null);
      setRejectReason('');
    } catch {
      setErrorMsg('Erro ao rejeitar etapa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const stepContent: Record<string, () => React.ReactNode> = {
    profile: () => (
      <ProfileStepContent
        tenant={tenant}
        loading={loading}
        profileFields={profileFields}
        editingField={editingField}
        fieldReason={fieldReason}
        onToggleApprove={(key) =>
          setProfileFields((prev) => ({ ...prev, [key]: { status: 'approved' } }))
        }
        onStartReject={(key, reason) => {
          setEditingField(key);
          setFieldReason(reason);
        }}
        onConfirmReject={(key) => {
          if (fieldReason.trim()) {
            setProfileFields((prev) => ({
              ...prev,
              [key]: { status: 'rejected', reason: fieldReason },
            }));
            setEditingField(null);
            setFieldReason('');
          }
        }}
        onCancelEdit={() => {
          setEditingField(null);
          setFieldReason('');
        }}
        onFieldReasonChange={setFieldReason}
        onApproveStep={() => handleApproveStep('profile')}
        onRejectStep={handleRejectProfileFields}
      />
    ),
    documents: () => (
      <DocumentStepContent
        tenant={tenant}
        loading={loading}
        documentsStatus={documentsStatus}
        editingDoc={editingDoc}
        docReason={docReason}
        onDocApprove={(key) =>
          setDocumentsStatus((prev) => ({ ...prev, [key]: { status: 'approved' } }))
        }
        onDocStartReject={(key, reason) => {
          setEditingDoc(key);
          setDocReason(reason);
        }}
        onDocConfirmReject={() => {
          if (docReason.trim()) {
            setDocumentsStatus((prev) => ({
              ...prev,
              [editingDoc!]: { status: 'rejected', reason: docReason },
            }));
            setEditingDoc(null);
            setDocReason('');
          }
        }}
        onDocCancelEdit={() => {
          setEditingDoc(null);
          setDocReason('');
        }}
        onDocReasonChange={setDocReason}
        onStepApprove={() => handleApproveStep('documents')}
        onStepReject={handleRejectDocs}
        onPreview={handlePreview}
        guarantor={guarantorData}
        paymentReceipt={paymentReceipt}
        onConfirmReceipt={handleConfirmReceipt}
        onRejectReceipt={handleRejectReceipt}
        onApproveGuarantor={handleApproveGuarantor}
        onRejectGuarantor={handleRejectGuarantor}
      />
    ),
    contract: () => (
      <ContractStepContent
        tenant={tenant}
        loading={loading}
        onApprove={() => handleApproveStep('contract')}
        onReject={() => setShowRejectModal('contract')}
        onPreview={handlePreview}
      />
    ),
    inspection: () => (
      <InspectionStepContent
        tenant={tenant}
        loading={loading}
        onApprove={() => handleApproveStep('inspection')}
        onReject={() => setShowRejectModal('inspection')}
      />
    ),
    keys: () => (
      <KeysStepContent
        tenant={tenant}
        loading={loading}
        onConfirmDelivery={() => handleApproveStep('keys')}
      />
    ),
  };

  return (
    <div className='w-full max-w-3xl mx-auto p-4 md:p-8 space-y-8'>
      <div className='text-center space-y-4'>
        <div className='inline-flex p-3 bg-primary/10 rounded-3xl text-primary'>
          <ShieldCheck size={32} />
        </div>
        <h1 className='text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none'>
          Análise do Onboarding
        </h1>
        <p className='text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto text-sm'>
          Revise e valide cada etapa do processo de onboarding do inquilino.
        </p>
      </div>

      <OnboardingProgress
        completedCount={completedCount}
        totalSteps={steps.length}
        progressPercent={progressPercent}
        label='etapas validadas'
        doneLabel='Onboarding Concluído!'
      />

      <ErrorAlert message={errorMsg} />

      <div className='space-y-4'>
        {steps.map((step, idx) => (
          <StepCard
            key={step.id}
            step={step}
            index={idx}
            isExpanded={expandedStep === step.id}
            toggleExpand={toggleExpand}
            meta={{ label: 'Etapa', statusLabels }}
            renderContent={stepContent[step.id]}
          />
        ))}
      </div>

      <OnboardingRejectModal
        show={!!showRejectModal}
        loading={loading}
        onClose={() => {
          setShowRejectModal(null);
          setRejectReason('');
        }}
        onConfirm={() => handleRejectStep(showRejectModal!)}
        rejectReason={rejectReason}
        onRejectReasonChange={setRejectReason}
      />

      <OnboardingDocumentPreview
        url={internalPreviewUrl}
        title={previewTitle}
        onClose={() => setInternalPreviewUrl(null)}
      />
    </div>
  );
};
