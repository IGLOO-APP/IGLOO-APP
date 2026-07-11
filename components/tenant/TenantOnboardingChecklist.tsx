import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, User, Upload, PenTool, ClipboardCheck, Key } from 'lucide-react';
import { Tenant } from '../../types';
import { contractService } from '../../services/tenancy/contractService';
import { OnboardingProgress, StepCard, ErrorAlert } from '../onboarding';
import type { OnboardingStepConfig } from '../onboarding';
import { useOnboardingDocuments } from '../../hooks/useOnboardingDocuments';
import { useOnboardingProfile } from '../../hooks/useOnboardingProfile';
import { ProfileSection } from './sections/ProfileSection';
import { DocumentsSection } from './sections/DocumentsSection';
import { ContractSection } from './sections/ContractSection';
import { InspectionSection } from './sections/InspectionSection';
import { KeysSection } from './sections/KeysSection';

interface TenantOnboardingChecklistProps {
  tenant: Tenant;
  pendingInspection: any;
  onStepComplete: () => void;
  onOpenInspection: () => void;
}

const buildSteps = (tenant: Tenant, pendingInspection: any): OnboardingStepConfig[] => [
  {
    id: 'profile',
    title: 'Dados Cadastrais',
    desc: 'Preencha seus dados de identificação e contato.',
    completed: tenant.onboarding_profile_status === 'approved',
    status: tenant.onboarding_profile_status || 'pending',
    unlocked: true,
    icon: User,
    color: 'text-blue-500 bg-blue-500/10',
  },
  {
    id: 'documents',
    title: 'Envio de Documentos',
    desc: 'Suba fotos ou PDFs do seu documento de identidade e comprovante de renda.',
    completed: tenant.onboarding_documents_status === 'approved',
    status: tenant.onboarding_documents_status || 'pending',
    unlocked: tenant.onboarding_profile_status === 'approved',
    icon: Upload,
    color: 'text-purple-500 bg-purple-500/10',
  },
  {
    id: 'contract',
    title: 'Contrato de Locação',
    desc: 'Revise e assine o contrato de locação do seu novo lar.',
    completed:
      tenant.onboarding_contract_status === 'approved' || tenant.contract?.status === 'active',
    status:
      tenant.onboarding_contract_status ||
      (tenant.contract?.status === 'active' ? 'approved' : 'pending'),
    unlocked: tenant.onboarding_documents_status === 'approved',
    icon: PenTool,
    color: 'text-amber-500 bg-amber-500/10',
  },
  {
    id: 'inspection',
    title: 'Laudo de Vistoria de Entrada',
    desc: 'Revise o laudo de vistoria e informe qualquer divergência.',
    completed: tenant.onboarding_inspection_status === 'approved' || !pendingInspection,
    status: tenant.onboarding_inspection_status || (!pendingInspection ? 'approved' : 'pending'),
    unlocked:
      tenant.onboarding_contract_status === 'approved' || tenant.contract?.status === 'active',
    icon: ClipboardCheck,
    color: 'text-orange-500 bg-orange-500/10',
  },
  {
    id: 'keys',
    title: 'Entrega das Chaves',
    desc: 'Liberação final e entrega das chaves do seu imóvel.',
    completed: tenant.onboarding_stage === 'completed',
    status: tenant.onboarding_stage === 'completed' ? 'approved' : 'pending',
    unlocked: tenant.onboarding_inspection_status === 'approved' || !pendingInspection,
    icon: Key,
    color: 'text-emerald-500 bg-emerald-500/10',
  },
];

const statusLabels: Record<string, string> = {
  approved: 'Concluído',
  submitted: 'Em Análise',
  rejected: 'Pendente Correção',
  pending: 'Pendente',
  locked: 'Bloqueado',
};

export const TenantOnboardingChecklist: React.FC<TenantOnboardingChecklistProps> = ({
  tenant,
  pendingInspection,
  onStepComplete,
  onOpenInspection,
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const docs = useOnboardingDocuments(tenant, onStepComplete);
  const profile = useOnboardingProfile(tenant, onStepComplete);

  const { loading: profileLoading, errorMsg: profileErrorMsg, handleSaveProfile } = profile;

  const mergedErrorMsg = profileErrorMsg || docs.errorMsg;
  const mergedLoading = profileLoading || docs.loading;

  const [typedSignature, setTypedSignature] = useState('');
  const [fullContract, setFullContract] = useState<any | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [contractMethod, setContractFlowMethod] = useState<'digital' | 'manual' | null>(null);
  const [manualContractFile, setManualContractFile] = useState<File | null>(null);

  useEffect(() => {
    if (expandedStep === 'contract' && tenant.contract?.id && !fullContract) {
      setLoadingContract(true);
      contractService.getWithDetails(tenant.contract.id.toString()).then((data) => {
        if (data) setFullContract(data);
        setLoadingContract(false);
      });
    }
  }, [expandedStep, tenant.contract?.id, fullContract]);

  useEffect(() => {
    const syncInspectionState = async () => {
      const contractSigned =
        tenant.onboarding_contract_status === 'approved' || tenant.contract?.status === 'active';
      if (
        !pendingInspection &&
        tenant.onboarding_inspection_status === 'pending' &&
        contractSigned
      ) {
        try {
          const { profileService } = await import('../../services/profileService');
          await profileService.updateByEmail(tenant.email, {
            onboarding_inspection_status: 'approved',
            onboarding_stage: 'keys',
          });
          onStepComplete();
        } catch (err) {
          console.error('Error syncing inspection state:', err);
        }
      }
    };
    syncInspectionState();
  }, [
    pendingInspection,
    tenant.onboarding_inspection_status,
    tenant.onboarding_contract_status,
    tenant.contract?.status,
    tenant.email,
    onStepComplete,
  ]);

  const steps = useMemo(() => buildSteps(tenant, pendingInspection), [tenant, pendingInspection]);
  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  const firstActiveStepId = useMemo(
    () => (!expandedStep ? steps.find((s) => !s.completed && s.unlocked)?.id : null),
    [expandedStep, steps]
  );

  useEffect(() => {
    if (firstActiveStepId) setExpandedStep(firstActiveStepId);
  }, [firstActiveStepId]);

  const toggleExpand = useCallback(
    (stepId: string) => {
      docs.setErrorMsg(null);
      profile.setErrorMsg(null);
      setExpandedStep((prev) => (prev === stepId ? null : stepId));
    },
    [docs, profile]
  );

  const handleWrappedSaveProfile = useCallback(() => {
    handleSaveProfile(docs.guaranteeType);
    setExpandedStep(null);
  }, [handleSaveProfile, docs.guaranteeType]);

  const handleWrappedUploadDocs = useCallback(() => {
    docs.handleUploadDocs();
    setExpandedStep(null);
  }, [docs]);

  const handleSignContract = useCallback(async () => {
    if (!typedSignature.trim()) {
      docs.setErrorMsg('Por favor, digite seu nome completo para assinar.');
      return;
    }
    if (!tenant.contract?.id) return;
    docs.setLoading(true);
    docs.setErrorMsg(null);
    try {
      await contractService.updateStatus(tenant.contract.id.toString(), 'active');
      const { profileService } = await import('../../services/profileService');
      await profileService.updateByEmail(tenant.email, {
        onboarding_contract_status: 'approved',
        onboarding_stage: 'inspection',
      });
      setExpandedStep(null);
      onStepComplete();
    } catch (err: unknown) {
      console.error(err);
      docs.setErrorMsg('Erro ao assinar o contrato.');
    } finally {
      docs.setLoading(false);
    }
  }, [typedSignature, docs, tenant.contract?.id, tenant.email, onStepComplete]);

  const handleManualUpload = useCallback(async () => {
    if (!manualContractFile || !tenant.contract?.id) return;
    docs.setLoading(true);
    try {
      const fileExt = manualContractFile.name.split('.').pop();
      const fileName = `manual_contract_${tenant.contract.id}_${Date.now()}.${fileExt}`;
      const filePath = `contracts/${fileName}`;
      const { storageService } = await import('../../services/storageService');
      const publicUrl = await storageService.uploadFile('documents', filePath, manualContractFile);
      if (publicUrl) {
        await contractService.update(tenant.contract.id.toString(), {
          pdf_url: publicUrl,
          status: 'pending_signature',
        });
      }
      const { profileService } = await import('../../services/profileService');
      await profileService.updateByEmail(tenant.email, {
        onboarding_contract_status: 'submitted',
      });
      onStepComplete();
      setExpandedStep(null);
    } catch (err) {
      console.error(err);
      docs.setErrorMsg('Erro ao enviar contrato.');
    } finally {
      docs.setLoading(false);
    }
  }, [manualContractFile, tenant.contract?.id, tenant.email, docs, onStepComplete]);

  const stepContent: Record<string, () => React.ReactNode> = useMemo(
    () => ({
      profile: () => (
        <ProfileSection
          tenant={tenant}
          profile={profile}
          guaranteeType={docs.guaranteeType}
          setGuaranteeType={docs.setGuaranteeType}
          guarantorName={docs.guarantorName}
          setGuarantorName={docs.setGuarantorName}
          guarantorCpf={docs.guarantorCpf}
          handleGuarantorCpfChange={docs.handleGuarantorCpfChange}
          guarantorRg={docs.guarantorRg}
          setGuarantorRg={docs.setGuarantorRg}
          guarantorPhone={docs.guarantorPhone}
          setGuarantorPhone={docs.setGuarantorPhone}
          guarantorEmail={docs.guarantorEmail}
          setGuarantorEmail={docs.setGuarantorEmail}
          step={steps[0]}
          loading={profileLoading}
          onSave={handleWrappedSaveProfile}
        />
      ),
      documents: () => (
        <DocumentsSection
          tenant={tenant}
          docs={docs}
          step={steps[1]}
          onUpload={handleWrappedUploadDocs}
        />
      ),
      contract: () => (
        <ContractSection
          tenant={tenant}
          step={steps[2]}
          fullContract={fullContract}
          loadingContract={loadingContract}
          contractMethod={contractMethod}
          setContractFlowMethod={setContractFlowMethod}
          typedSignature={typedSignature}
          setTypedSignature={setTypedSignature}
          manualContractFile={manualContractFile}
          setManualContractFile={setManualContractFile}
          mergedLoading={mergedLoading}
          onSign={handleSignContract}
          onManualUpload={handleManualUpload}
        />
      ),
      inspection: () => <InspectionSection step={steps[3]} onOpenInspection={onOpenInspection} />,
      keys: () => <KeysSection step={steps[4]} onStepComplete={onStepComplete} />,
    }),
    [
      tenant,
      profile,
      docs,
      steps,
      profileLoading,
      handleWrappedSaveProfile,
      handleWrappedUploadDocs,
      fullContract,
      loadingContract,
      contractMethod,
      setContractFlowMethod,
      typedSignature,
      setTypedSignature,
      manualContractFile,
      setManualContractFile,
      mergedLoading,
      handleSignContract,
      handleManualUpload,
      onOpenInspection,
      onStepComplete,
    ]
  );

  return (
    <div className='w-full max-w-3xl mx-auto p-4 md:p-8 space-y-8 animate-fadeIn'>
      <div className='text-center space-y-4'>
        <div className='inline-flex p-3 bg-primary/10 rounded-3xl text-primary animate-bounce'>
          <Sparkles size={32} />
        </div>
        <h1 className='text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none'>
          Boas-vindas ao seu novo lar!
        </h1>
        <p className='text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto text-sm'>
          Falta pouco para liberar seu acesso completo. Por favor, conclua as etapas abaixo para
          finalizarmos seu onboarding.
        </p>
      </div>

      <OnboardingProgress
        completedCount={completedCount}
        totalSteps={steps.length}
        progressPercent={progressPercent}
        label='tarefas feitas'
        doneLabel='Tudo pronto!'
      />

      <ErrorAlert message={mergedErrorMsg} />

      <div className='space-y-4'>
        {steps.map((step, idx) => (
          <StepCard
            key={step.id}
            step={step}
            index={idx}
            isExpanded={expandedStep === step.id}
            toggleExpand={toggleExpand}
            meta={{ label: 'Passo', statusLabels: { ...statusLabels, locked: 'Bloqueado' } }}
            renderContent={stepContent[step.id]}
          />
        ))}
      </div>
    </div>
  );
};
