import React from 'react';
import {
  X,
  Check,
  Search,
  ExternalLink,
  XCircle,
  Loader,
  ThumbsDown,
  ThumbsUp,
  User,
  Shield,
  MapPin,
  Banknote,
  RotateCcw,
} from 'lucide-react';
import { Tenant, Guarantor } from '../../../types';
import { isValidUrl } from '../../../utils/validation';

interface PaymentReceipt {
  id: string;
  name: string;
  url?: string;
  status: string;
}

interface DocumentStepContentProps {
  tenant: Tenant;
  loading: boolean;
  documentsStatus: Record<string, { status: 'pending' | 'approved' | 'rejected'; reason?: string }>;
  editingDoc: string | null;
  docReason: string;
  onDocApprove: (key: string) => void;
  onDocStartReject: (key: string, reason: string) => void;
  onDocConfirmReject: () => void;
  onDocCancelEdit: () => void;
  onDocReasonChange: (value: string) => void;
  onStepApprove: () => void;
  onStepReject: () => void;
  onPreview: (url: string, title: string, id?: string) => void;
  guarantor?: Guarantor | null;
  paymentReceipt?: PaymentReceipt | null;
  onConfirmReceipt?: () => Promise<void>;
  onRejectReceipt?: () => Promise<void>;
  onApproveGuarantor?: () => Promise<void>;
  onRejectGuarantor?: () => Promise<void>;
}

export const DocumentStepContent: React.FC<DocumentStepContentProps> = ({
  tenant,
  loading,
  documentsStatus,
  editingDoc,
  docReason,
  onDocApprove,
  onDocStartReject,
  onDocConfirmReject,
  onDocCancelEdit,
  onDocReasonChange,
  onStepApprove,
  onStepReject,
  onPreview,
  guarantor,
  paymentReceipt,
  onConfirmReceipt,
  onRejectReceipt,
  onApproveGuarantor,
  onRejectGuarantor,
}) => {
  const renderDocViewer = (url: string | undefined, label: string) => (
    <div className='flex gap-2'>
      <button
        onClick={() => {
          if (url) {
            const id = url.split('/').pop()?.split('.')[0] || 'doc';
            onPreview(url, label, id);
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
            onChange={(e) => onDocReasonChange(e.target.value)}
            placeholder={placeholder}
            className='w-full h-8 px-3 rounded-lg border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-955/10 text-xs font-bold outline-none'
          />
          <div className='flex justify-end gap-2'>
            <button
              onClick={onDocCancelEdit}
              className='px-2 py-1 text-slate-500 text-xs font-bold'
            >
              Cancelar
            </button>
            <button
              onClick={onDocConfirmReject}
              className='px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold'
            >
              Confirmar
            </button>
          </div>
        </div>
      ) : (
        <div className='flex gap-2'>
          <button
            onClick={() => onDocApprove(docKey)}
            className={`flex-1 h-8 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${documentsStatus[docKey]?.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500'}`}
          >
            <Check size={12} /> Validar {label}
          </button>
          <button
            onClick={() => onDocStartReject(docKey, documentsStatus[docKey]?.reason || '')}
            className={`flex-1 h-8 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${documentsStatus[docKey]?.status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-955/20 hover:text-rose-500'}`}
          >
            <X size={12} /> Recusar {label}
          </button>
        </div>
      )}
    </div>
  );

  if (!tenant.onboarding_documents_urls) {
    return (
      <div className='p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl text-amber-800 dark:text-amber-300 text-xs font-medium'>
        Nenhum documento foi enviado ainda.
      </div>
    );
  }

  const urls = tenant.onboarding_documents_urls;

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex flex-col justify-between'>
          <div>
            <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-3'>
              Documento de Identidade
            </p>
            <p className='text-sm font-bold text-slate-900 dark:text-white mb-3'>{urls.rg_name}</p>
            {documentsStatus.rg?.status === 'rejected' && (
              <div className='text-xs font-medium text-rose-500 bg-rose-500/5 px-2 py-1.5 rounded-lg border border-rose-500/10 mb-3'>
                ⚠️ Incorreto: {documentsStatus.rg.reason}
              </div>
            )}
          </div>
          <div className='space-y-3'>
            {renderDocViewer(urls.rg_url, 'Documento de Identidade')}
            {tenant.onboarding_documents_status === 'submitted' &&
              renderDocApproval('rg', 'RG', 'Motivo da recusa do RG...')}
          </div>
        </div>

        <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex flex-col justify-between'>
          <div>
            <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-3'>
              Comprovante de Renda
            </p>
            <p className='text-sm font-bold text-slate-900 dark:text-white mb-3'>
              {urls.income_name}
            </p>
            {documentsStatus.income?.status === 'rejected' && (
              <div className='text-xs font-medium text-rose-500 bg-rose-500/5 px-2 py-1.5 rounded-lg border border-rose-500/10 mb-3'>
                ⚠️ Incorreto: {documentsStatus.income.reason}
              </div>
            )}
          </div>
          <div className='space-y-3'>
            {renderDocViewer(urls.income_url, 'Comprovante de Renda')}
            {tenant.onboarding_documents_status === 'submitted' &&
              renderDocApproval('income', 'Renda', 'Motivo da recusa do holerite...')}
          </div>
        </div>
      </div>

      {/* Comprovante de Residência */}
      {urls.residence_url && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex flex-col justify-between'>
            <div>
              <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1'>
                <MapPin size={12} className='text-emerald-500' /> Comprovante de Residência
              </p>
              <p className='text-sm font-bold text-slate-900 dark:text-white mb-3'>
                {urls.residence_name}
              </p>
            </div>
            <div className='space-y-3'>
              {renderDocViewer(urls.residence_url, 'Comprovante de Residência')}
              {tenant.onboarding_documents_status === 'submitted' &&
                renderDocApproval('residence', 'Residência', 'Motivo da recusa do comprovante...')}
            </div>
          </div>

          {/* Garantia Locatícia */}
          {(urls.guarantee_url || tenant.guarantee_type) && (
            <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex flex-col justify-between'>
              <div>
                <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1'>
                  <Shield size={12} className='text-amber-500' /> Garantia Locatícia
                </p>
                {tenant.guarantee_type && (
                  <p className='text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2'>
                    {tenant.guarantee_type === 'fiador'
                      ? 'Fiador'
                      : tenant.guarantee_type === 'seguro_fianca'
                        ? 'Seguro Fiança'
                        : tenant.guarantee_type === 'deposito_caucao'
                          ? 'Depósito / Caução'
                          : 'Outros'}
                  </p>
                )}
                {urls.guarantee_name && (
                  <p className='text-sm font-bold text-slate-900 dark:text-white mb-3'>
                    {urls.guarantee_name}
                  </p>
                )}
              </div>
              {urls.guarantee_url && (
                <div className='space-y-3'>{renderDocViewer(urls.guarantee_url, 'Garantia')}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Depósito Caução section */}
      {tenant.guarantee_type === 'deposito_caucao' && (
        <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl space-y-3'>
          <p className='text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5'>
            <Banknote size={12} className='text-[#13c8ec]' /> Comprovante de Depósito Caução
          </p>
          {paymentReceipt ? (
            <>
              <p className='text-sm font-bold text-slate-900 dark:text-white'>{paymentReceipt.name}</p>
              {/* Status badge */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                paymentReceipt.status === 'Confirmado' ? 'bg-emerald-500/10 text-emerald-500' :
                paymentReceipt.status === 'Reenvio Solicitado' ? 'bg-rose-500/10 text-rose-500' :
                'bg-amber-500/10 text-amber-600'
              }`}>
                {paymentReceipt.status === 'Confirmado' ? <Check size={10} /> :
                 paymentReceipt.status === 'Reenvio Solicitado' ? <X size={10} /> :
                 <Loader size={10} />}
                {paymentReceipt.status === 'Confirmado' ? 'CONFIRMADO' :
                 paymentReceipt.status === 'Reenvio Solicitado' ? 'REENVIO SOLICITADO' : 'AGUARDANDO ANÁLISE'}
              </div>
              {paymentReceipt.url && renderDocViewer(paymentReceipt.url, 'Comprovante de Depósito')}
              {tenant.onboarding_documents_status === 'submitted' && paymentReceipt.status !== 'Confirmado' && (
                <div className='flex gap-2 pt-2'>
                  <button
                    onClick={() => void onConfirmReceipt?.()}
                    disabled={loading}
                    className='flex-1 h-10 bg-[#13c8ec]/10 text-[#13c8ec] border border-[#13c8ec]/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#13c8ec]/20 transition-colors disabled:opacity-50'
                  >
                    <Check size={14} /> Confirmar Recebimento
                  </button>
                  <button
                    onClick={() => void onRejectReceipt?.()}
                    disabled={loading}
                    className='flex-1 h-10 bg-transparent text-rose-500 border border-rose-500/40 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-rose-500/10 transition-colors disabled:opacity-50'
                  >
                    <RotateCcw size={14} /> Solicitar Reenvio
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className='text-xs text-slate-400 font-medium'>Nenhum comprovante enviado ainda.</p>
          )}
        </div>
      )}
      {/* Fiador Information */}
      {guarantor && tenant.guarantee_type === 'fiador' && (
        <div className='p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl space-y-3'>
          <p className='text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest flex items-center gap-1.5'>
            <User size={14} /> Dados do Fiador
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-xs'>
            <div>
              <span className='text-slate-400 font-medium'>Nome:</span>{' '}
              <span className='font-bold text-slate-700 dark:text-slate-300'>{guarantor.name}</span>
            </div>
            <div>
              <span className='text-slate-400 font-medium'>CPF:</span>{' '}
              <span className='font-bold text-slate-700 dark:text-slate-300'>
                {guarantor.cpf
                  ? guarantor.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                  : '\u2014'}
              </span>
            </div>
            <div>
              <span className='text-slate-400 font-medium'>RG:</span>{' '}
              <span className='font-bold text-slate-700 dark:text-slate-300'>
                {guarantor.rg || '\u2014'}
              </span>
            </div>
            <div>
              <span className='text-slate-400 font-medium'>Data de Nascimento:</span>{' '}
              <span className='font-bold text-slate-700 dark:text-slate-300'>
                {guarantor.birth_date
                  ? new Date(guarantor.birth_date).toLocaleDateString('pt-BR')
                  : '\u2014'}
              </span>
            </div>
            <div>
              <span className='text-slate-400 font-medium'>Telefone:</span>{' '}
              <span className='font-bold text-slate-700 dark:text-slate-300'>
                {guarantor.phone || '\u2014'}
              </span>
            </div>
            <div>
              <span className='text-slate-400 font-medium'>E-mail:</span>{' '}
              <span className='font-bold text-slate-700 dark:text-slate-300'>
                {guarantor.email || '\u2014'}
              </span>
            </div>
            {guarantor.status && (
              <div className='md:col-span-2 flex items-center gap-2'>
                <span className='text-slate-400 font-medium'>Status:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                    guarantor.status === 'aprovado'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : guarantor.status === 'reprovado'
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {guarantor.status === 'aprovado' ? 'APROVADO' : guarantor.status === 'reprovado' ? 'REPROVADO' : 'PENDENTE'}
                </span>
              </div>
            )}
          </div>
          {/* Fiador docs */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pt-2'>
            {guarantor.rg_document_url && (
              <div className='flex flex-col gap-2'>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                  RG do Fiador
                </p>
                {renderDocViewer(guarantor.rg_document_url, 'RG do Fiador')}
              </div>
            )}
            {guarantor.income_proof_url && (
              <div className='flex flex-col gap-2'>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                  Comp. Renda do Fiador
                </p>
                {renderDocViewer(guarantor.income_proof_url, 'Comprovante de Renda do Fiador')}
              </div>
            )}
          </div>
          {/* Guarantor action buttons */}
          {tenant.onboarding_documents_status === 'submitted' && guarantor.status === 'pendente' && (
            <div className='flex gap-2 pt-2 border-t border-amber-100 dark:border-amber-900/30'>
              <button
                onClick={() => void onApproveGuarantor?.()}
                disabled={loading}
                className='flex-1 h-10 bg-[#13c8ec]/10 text-[#13c8ec] border border-[#13c8ec]/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#13c8ec]/20 transition-colors disabled:opacity-50'
              >
                <ThumbsUp size={14} /> Aprovar Fiador
              </button>
              <button
                onClick={() => void onRejectGuarantor?.()}
                disabled={loading}
                className='flex-1 h-10 bg-transparent text-rose-500 border border-rose-500/40 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-rose-500/10 transition-colors disabled:opacity-50'
              >
                <ThumbsDown size={14} /> Reprovar Fiador
              </button>
            </div>
          )}
        </div>
      )}

      {tenant.onboarding_documents_status === 'rejected' && (
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

      {tenant.onboarding_documents_status === 'submitted' && (
        <div className='flex gap-3 mt-4'>
          <button
            onClick={onStepApprove}
            disabled={
              loading ||
              Object.values(documentsStatus).some((d) => d.status === 'pending') ||
              (tenant.guarantee_type === 'fiador' && guarantor?.status !== 'aprovado') ||
              (tenant.guarantee_type === 'deposito_caucao' && paymentReceipt?.status !== 'Confirmado')
            }
            className='flex-1 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all disabled:opacity-30 hover:scale-[1.02] shadow-lg'
          >
            {loading ? <Loader className='animate-spin' size={16} /> : <ThumbsUp size={16} />}{' '}
            Aprovar Documentos
          </button>
          {Object.values(documentsStatus).some((d) => d.status === 'rejected') && (
            <button
              onClick={onStepReject}
              disabled={loading}
              className='flex-1 h-12 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] shadow-lg'
            >
              <ThumbsDown size={16} /> Solicitar Ajustes
            </button>
          )}
        </div>
      )}
    </div>
  );
};
