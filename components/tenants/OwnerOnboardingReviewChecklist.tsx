import React, { useState, useEffect } from 'react';
import { isValidUrl } from '../../utils/validation';
import {
  ShieldCheck,
  User,
  Upload,
  PenTool,
  ClipboardCheck,
  Key,
  CheckCircle,
  Check,
  X,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Search,
  ExternalLink,
  FileText,
  Loader,
} from 'lucide-react';
import { Tenant } from '../../types';
import { supabase } from '../../lib/supabase';
import { fixDocumentUrl } from '../../utils/mappingUtils';
import { OnboardingProgress, StepCard, ErrorAlert } from '../onboarding';
import type { OnboardingStepConfig } from '../onboarding';

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
    phone: { status: 'pending' },
    email: { status: 'pending' },
  });
  const [documentsStatus, setDocumentsStatus] = useState<
    Record<string, { status: 'pending' | 'approved' | 'rejected'; reason?: string }>
  >({
    rg: { status: 'pending' },
    income: { status: 'pending' },
  });
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
  }, [
    tenant.onboarding_profile_status,
    tenant.onboarding_documents_status,
    tenant.onboarding_contract_status,
    tenant.onboarding_inspection_status,
    tenant.onboarding_stage,
  ]);

  const toggleExpand = (stepId: string) => {
    setErrorMsg(null);
    setExpandedStep((prev) => (prev === stepId ? null : stepId));
  };

  const handlePreview = (url: string, title: string, id?: string) => {
    const fixedUrl = fixDocumentUrl(url);
    if (onPreview) {
      onPreview(url, title, id);
      return;
    }
    setPreviewTitle(title);
    setInternalPreviewUrl(fixedUrl);
  };

  // ----- Approve Step -----
  const handleApproveStep = async (stepId: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let updates: any = {};
      switch (stepId) {
        case 'profile':
          updates = { onboarding_profile_status: 'approved', onboarding_stage: 'documents' };
          break;
        case 'documents':
          updates = { onboarding_documents_status: 'approved', onboarding_stage: 'contract' };
          break;
        case 'contract':
          updates = { onboarding_contract_status: 'approved', onboarding_stage: 'inspection' };
          if (tenant.contract?.id)
            await supabase
              .from('contracts')
              .update({ status: 'active' })
              .eq('id', tenant.contract.id.toString());
          break;
        case 'inspection':
          updates = { onboarding_inspection_status: 'approved', onboarding_stage: 'keys' };
          break;
        case 'keys':
          updates = { onboarding_stage: 'completed' };
          break;
      }
      await supabase
        .from('profiles')
        .update(updates)
        .or(`email.eq.${tenant.email},id.eq.${tenant.id}`);
      onRefresh();
      setExpandedStep(null);
    } catch (err: any) {
      console.error('Error approving step:', err);
      setErrorMsg('Erro ao aprovar etapa. Tente novamente.');
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
      await supabase
        .from('profiles')
        .update({
          onboarding_profile_status: 'rejected',
          onboarding_profile_rejected_reason: compiledReason,
          onboarding_stage: 'profile',
          has_completed_onboarding: false,
        })
        .or(`email.eq.${tenant.email},id.eq.${tenant.id}`);
      onRefresh();
      setExpandedStep(null);
    } catch (err: any) {
      console.error(err);
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
      await supabase
        .from('profiles')
        .update({
          onboarding_documents_status: 'rejected',
          onboarding_documents_rejected_reason: compiledReason,
          onboarding_stage: 'documents',
          has_completed_onboarding: false,
        })
        .or(`email.eq.${tenant.email},id.eq.${tenant.id}`);
      onRefresh();
      setExpandedStep(null);
    } catch (err: any) {
      console.error(err);
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
      let updates: any = {};
      switch (stepId) {
        case 'profile':
          updates = {
            onboarding_profile_status: 'rejected',
            onboarding_profile_rejected_reason: rejectReason,
            onboarding_stage: 'profile',
            has_completed_onboarding: false,
          };
          break;
        case 'documents':
          updates = {
            onboarding_documents_status: 'rejected',
            onboarding_documents_rejected_reason: rejectReason,
            onboarding_stage: 'documents',
            has_completed_onboarding: false,
          };
          break;
        case 'contract':
          updates = {
            onboarding_contract_status: 'rejected',
            onboarding_stage: 'contract',
            has_completed_onboarding: false,
          };
          break;
        case 'inspection':
          updates = {
            onboarding_inspection_status: 'rejected',
            onboarding_stage: 'inspection',
            has_completed_onboarding: false,
          };
          break;
      }
      await supabase
        .from('profiles')
        .update(updates)
        .or(`email.eq.${tenant.email},id.eq.${tenant.id}`);
      onRefresh();
      setExpandedStep(null);
      setShowRejectModal(null);
      setRejectReason('');
    } catch (err: any) {
      console.error('Error rejecting step:', err);
      setErrorMsg('Erro ao rejeitar etapa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ----- Render helpers -----

  const renderApprovalActions = (
    stepId: string,
    canApprove: boolean,
    canReject: boolean,
    onApprove: () => void,
    onReject: () => void
  ) => (
    <div className='flex gap-3 mt-4'>
      <button
        onClick={onApprove}
        disabled={loading || !canApprove}
        className='flex-1 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all disabled:opacity-30 hover:scale-[1.02] shadow-lg'
      >
        {loading ? <Loader className='animate-spin' size={16} /> : <ThumbsUp size={16} />} Aprovar
      </button>
      {canReject && (
        <button
          onClick={onReject}
          disabled={loading}
          className='flex-1 h-12 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] shadow-lg'
        >
          <ThumbsDown size={16} /> Solicitar Ajuste
        </button>
      )}
    </div>
  );

  const renderDocViewer = (url: string | undefined, label: string) => (
    <div className='flex gap-2'>
      <button
        onClick={() => {
          if (url) {
            const id = url.split('/').pop()?.split('.')[0] || 'doc';
            handlePreview(url, label, id);
          }
        }}
        className='flex-1 h-10 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-white/20 transition-all'
      >
        <Search size={14} /> Visualizar
      </button>
      <button
        onClick={() => url && isValidUrl(url) && window.open(url, '_blank', 'noopener,noreferrer')}
        className='flex-1 h-10 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-white/20 transition-all'
      >
        <ExternalLink size={14} /> Abrir
      </button>
    </div>
  );

  const renderDocApproval = (docKey: string, label: string, placeholder: string) => (
    <div className='pt-2 border-t border-slate-100 dark:border-white/5'>
      {editingDoc === docKey ? (
        <div className='space-y-2'>
          <input
            type='text'
            value={docReason}
            onChange={(e) => setDocReason(e.target.value)}
            placeholder={placeholder}
            className='w-full h-8 px-3 rounded-lg border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-955/10 text-xs font-bold outline-none'
          />
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => {
                setEditingDoc(null);
                setDocReason('');
              }}
              className='px-2 py-1 text-slate-500 text-xs font-bold'
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (docReason.trim()) {
                  setDocumentsStatus((prev) => ({
                    ...prev,
                    [docKey]: { status: 'rejected', reason: docReason },
                  }));
                  setEditingDoc(null);
                  setDocReason('');
                }
              }}
              className='px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold'
            >
              Confirmar
            </button>
          </div>
        </div>
      ) : (
        <div className='flex gap-2'>
          <button
            onClick={() =>
              setDocumentsStatus((prev) => ({ ...prev, [docKey]: { status: 'approved' } }))
            }
            className={`flex-1 h-8 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${documentsStatus[docKey]?.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500'}`}
          >
            <Check size={12} /> Validar {label}
          </button>
          <button
            onClick={() => {
              setEditingDoc(docKey);
              setDocReason(documentsStatus[docKey]?.reason || '');
            }}
            className={`flex-1 h-8 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${documentsStatus[docKey]?.status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-955/20 hover:text-rose-500'}`}
          >
            <X size={12} /> Recusar {label}
          </button>
        </div>
      )}
    </div>
  );

  const renderProfileStepContent = () => (
    <div className='space-y-4'>
      <div className='bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl p-5 space-y-4'>
        {[
          { key: 'name', label: 'Nome Completo', value: tenant.name },
          { key: 'cpf', label: 'CPF', value: tenant.cpf || 'Não informado' },
          { key: 'phone', label: 'Celular', value: tenant.phone || 'Não informado' },
          { key: 'email', label: 'E-mail', value: tenant.email },
        ].map((field) => {
          const statusObj = profileFields[field.key] || { status: 'pending' };
          return (
            <div
              key={field.key}
              className='flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-white/5 last:border-0 pb-4 last:pb-0'
            >
              <div className='space-y-1'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  {field.label}
                </span>
                <span className='text-sm font-bold text-slate-800 dark:text-slate-200'>
                  {field.value}
                </span>
                {statusObj.status === 'rejected' && (
                  <span className='text-xs font-medium text-rose-500 block bg-rose-500/5 px-2 py-1 rounded-lg border border-rose-500/10 mt-1'>
                    ⚠️ Rejeitado: {statusObj.reason}
                  </span>
                )}
              </div>
              {steps[0].status === 'submitted' && (
                <div className='flex items-center gap-2'>
                  {editingField === field.key ? (
                    <div className='flex items-center gap-2 w-full max-w-xs'>
                      <input
                        type='text'
                        value={fieldReason}
                        onChange={(e) => setFieldReason(e.target.value)}
                        placeholder='Motivo da rejeição...'
                        className='h-8 px-3 rounded-lg border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 text-xs font-bold outline-none'
                      />
                      <button
                        onClick={() => {
                          if (fieldReason.trim()) {
                            setProfileFields((prev) => ({
                              ...prev,
                              [field.key]: { status: 'rejected', reason: fieldReason },
                            }));
                            setEditingField(null);
                            setFieldReason('');
                          }
                        }}
                        className='h-8 px-3 bg-rose-600 text-white rounded-lg text-xs font-bold'
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => {
                          setEditingField(null);
                          setFieldReason('');
                        }}
                        className='h-8 px-2 text-slate-505 text-xs font-bold'
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          setProfileFields((prev) => ({
                            ...prev,
                            [field.key]: { status: 'approved' },
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all ${statusObj.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500'}`}
                      >
                        <Check size={12} /> Aprovado
                      </button>
                      <button
                        onClick={() => {
                          setEditingField(field.key);
                          setFieldReason(statusObj.reason || '');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all ${statusObj.status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500'}`}
                      >
                        <X size={12} /> Rejeitar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {steps[0].status === 'rejected' && (
        <div className='p-4 bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-350 text-xs flex gap-2'>
          <XCircle size={18} className='shrink-0 mt-0.5' />
          <div>
            <p className='font-bold'>Motivos apontados para correção:</p>
            <p className='mt-1 font-medium whitespace-pre-line'>
              {tenant.onboarding_profile_rejected_reason}
            </p>
          </div>
        </div>
      )}

      {steps[0].status === 'submitted' && (
        <div className='flex gap-3 mt-4'>
          <button
            onClick={() => handleApproveStep('profile')}
            disabled={loading || Object.values(profileFields).some((f) => f.status === 'pending')}
            className='flex-1 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all disabled:opacity-30 hover:scale-[1.02] shadow-lg'
            title={
              Object.values(profileFields).some((f) => f.status === 'pending')
                ? 'Valide todos os campos acima antes de aprovar'
                : ''
            }
          >
            {loading ? <Loader className='animate-spin' size={16} /> : <ThumbsUp size={16} />}{' '}
            Aprovar Cadastro Completo
          </button>
          {Object.values(profileFields).some((f) => f.status === 'rejected') && (
            <button
              onClick={handleRejectProfileFields}
              disabled={loading}
              className='flex-1 h-12 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] shadow-lg'
            >
              <ThumbsDown size={16} /> Solicitar Ajustes Apontados
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderDocumentStepContent = () => (
    <div className='space-y-4'>
      {tenant.onboarding_documents_urls ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex flex-col justify-between'>
            <div>
              <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-3'>
                Documento de Identidade
              </p>
              <p className='text-sm font-bold text-slate-900 dark:text-white mb-3'>
                {tenant.onboarding_documents_urls.rg_name}
              </p>
              {documentsStatus.rg.status === 'rejected' && (
                <div className='text-xs font-medium text-rose-500 bg-rose-500/5 px-2 py-1.5 rounded-lg border border-rose-500/10 mb-3'>
                  ⚠️ Incorreto: {documentsStatus.rg.reason}
                </div>
              )}
            </div>
            <div className='space-y-3'>
              {renderDocViewer(tenant.onboarding_documents_urls?.rg_url, 'Documento de Identidade')}
              {steps[1].status === 'submitted' &&
                renderDocApproval('rg', 'RG', 'Motivo da recusa do RG...')}
            </div>
          </div>

          <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex flex-col justify-between'>
            <div>
              <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-3'>
                Comprovante de Renda
              </p>
              <p className='text-sm font-bold text-slate-900 dark:text-white mb-3'>
                {tenant.onboarding_documents_urls.income_name}
              </p>
              {documentsStatus.income.status === 'rejected' && (
                <div className='text-xs font-medium text-rose-500 bg-rose-500/5 px-2 py-1.5 rounded-lg border border-rose-500/10 mb-3'>
                  ⚠️ Incorreto: {documentsStatus.income.reason}
                </div>
              )}
            </div>
            <div className='space-y-3'>
              {renderDocViewer(
                tenant.onboarding_documents_urls?.income_url,
                'Comprovante de Renda'
              )}
              {steps[1].status === 'submitted' &&
                renderDocApproval('income', 'Renda', 'Motivo da recusa do holerite...')}
            </div>
          </div>
        </div>
      ) : (
        <div className='p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl text-amber-800 dark:text-amber-300 text-xs font-medium'>
          Nenhum documento foi enviado ainda.
        </div>
      )}

      {steps[1].status === 'rejected' && (
        <div className='p-4 bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-350 text-xs flex gap-2'>
          <XCircle size={18} className='shrink-0 mt-0.5' />
          <div>
            <p className='font-bold'>Motivos apontados para correção:</p>
            <p className='mt-1 font-medium whitespace-pre-line'>
              {tenant.onboarding_documents_rejected_reason}
            </p>
          </div>
        </div>
      )}

      {steps[1].status === 'submitted' &&
        renderApprovalActions(
          'documents',
          Object.values(documentsStatus).every((d) => d.status !== 'pending'),
          Object.values(documentsStatus).some((d) => d.status === 'rejected'),
          () => handleApproveStep('documents'),
          handleRejectDocs
        )}
    </div>
  );

  const renderContractStepContent = () => (
    <div className='space-y-4'>
      {tenant.contract && (
        <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl'>
          <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-3'>
            Contrato de Locação
          </p>
          {renderDocViewer(tenant.contract?.pdf_url, 'Contrato de Locação')}
        </div>
      )}
      {steps[2].status === 'submitted' &&
        renderApprovalActions(
          'contract',
          true,
          true,
          () => handleApproveStep('contract'),
          () => setShowRejectModal('contract')
        )}
      {steps[2].status === 'approved' && (
        <div className='p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2'>
          <CheckCircle size={18} /> Contrato aprovado e ativo!
        </div>
      )}
    </div>
  );

  const renderInspectionStepContent = () => (
    <div className='space-y-4'>
      <div className='p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-600 dark:text-slate-400 text-xs font-medium'>
        Esta etapa se refere ao laudo de vistoria de entrada.
      </div>
      {steps[3].status === 'submitted' &&
        renderApprovalActions(
          'inspection',
          true,
          true,
          () => handleApproveStep('inspection'),
          () => setShowRejectModal('inspection')
        )}
      {steps[3].status === 'approved' && (
        <div className='p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2'>
          <CheckCircle size={18} /> Laudo de vistoria aprovado!
        </div>
      )}
    </div>
  );

  const renderKeysStepContent = () => (
    <div className='space-y-4'>
      {steps[4].status === 'approved' ? (
        <div className='p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2'>
          <CheckCircle size={18} /> Chaves entregues e onboarding concluído!
        </div>
      ) : (
        <>
          <div className='p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-600 dark:text-slate-400 text-xs font-medium'>
            Quando o inquilino concluir a etapa de vistoria, você poderá marcar a entrega das chaves
            como concluída.
          </div>
          {tenant.onboarding_inspection_status === 'approved' && (
            <button
              onClick={() => handleApproveStep('keys')}
              disabled={loading}
              className='w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] shadow-lg'
            >
              {loading ? <Loader className='animate-spin' size={16} /> : <Key size={16} />}{' '}
              Confirmar Entrega das Chaves
            </button>
          )}
        </>
      )}
    </div>
  );

  const stepContent: Record<string, () => React.ReactNode> = {
    profile: renderProfileStepContent,
    documents: renderDocumentStepContent,
    contract: renderContractStepContent,
    inspection: renderInspectionStepContent,
    keys: renderKeysStepContent,
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

      {showRejectModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-surface-dark rounded-3xl p-6 w-full max-w-md shadow-2xl'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-black text-slate-900 dark:text-white'>Rejeitar Etapa</h3>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                className='w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-white/20 transition-all'
              >
                <X size={16} />
              </button>
            </div>
            <p className='text-sm text-slate-500 dark:text-slate-400 mb-4'>
              Por favor, informe o motivo da rejeição para que o inquilino possa corrigir.
            </p>
            <div className='mb-6'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2'>
                Motivo da Rejeição
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder='Descreva o que precisa ser corrigido...'
                rows={4}
                className='w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none'
              />
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
                disabled={loading}
                className='flex-1 h-12 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50'
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRejectStep(showRejectModal)}
                disabled={loading || !rejectReason.trim()}
                className='flex-1 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg'
              >
                {loading ? <Loader className='animate-spin' size={16} /> : <ThumbsDown size={16} />}{' '}
                Confirmar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {internalPreviewUrl && (
        <div className='fixed inset-0 bg-black/95 flex flex-col z-[100] animate-fadeIn'>
          <div className='flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md'>
            <div className='flex items-center gap-4'>
              <div className='w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
                <FileText size={20} />
              </div>
              <div>
                <h3 className='text-white font-black text-sm uppercase tracking-tight'>
                  {previewTitle}
                </h3>
                <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>
                  Visualizador de Documentos IGLOO
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <a
                href={internalPreviewUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='p-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10'
                title='Abrir Original'
              >
                <ExternalLink size={18} />
              </a>
              <button
                onClick={() => setInternalPreviewUrl(null)}
                className='p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all border border-rose-500/20'
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className='flex-1 overflow-auto flex items-center justify-center p-4 md:p-8 bg-black/40'>
            {internalPreviewUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ||
            internalPreviewUrl.includes('image') ||
            !internalPreviewUrl.toLowerCase().includes('.pdf') ? (
              <img
                src={internalPreviewUrl}
                alt={previewTitle}
                className='max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scaleIn'
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('placeholder')) {
                    const parent = target.parentElement;
                    if (parent) {
                      const iframe = document.createElement('iframe');
                      iframe.src = internalPreviewUrl.includes('docs.google.com')
                        ? internalPreviewUrl
                        : `${internalPreviewUrl}#toolbar=0`;
                      iframe.className =
                        'w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl border-0 animate-slideUp';
                      iframe.title = 'Document Preview';
                      parent.replaceChild(iframe, target);
                    }
                  } else {
                    target.onerror = null;
                    target.src =
                      'https://via.placeholder.com/800x600?text=Erro+ao+carregar+documento';
                  }
                }}
              />
            ) : (
              (() => {
                let directPdfUrl = internalPreviewUrl;
                if (directPdfUrl.includes('docs.google.com/viewer')) {
                  const urlParams = new URLSearchParams(new URL(directPdfUrl).search);
                  const extractedUrl = urlParams.get('url');
                  if (extractedUrl) directPdfUrl = decodeURIComponent(extractedUrl);
                }
                return (
                  <iframe
                    src={`${directPdfUrl}#toolbar=1`}
                    className='w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl border-0 animate-slideUp'
                    title={previewTitle}
                  />
                );
              })()
            )}
          </div>
          <div className='p-4 bg-slate-900/80 border-t border-white/5 text-center'>
            <p className='text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]'>
              Pressione fechar para retornar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
