import React from 'react';
import { Check, X, Loader, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import { Tenant } from '../../../types';

interface ProfileStepContentProps {
  tenant: Tenant;
  loading: boolean;
  profileFields: Record<string, { status: 'pending' | 'approved' | 'rejected'; reason?: string }>;
  editingField: string | null;
  fieldReason: string;
  onToggleApprove: (key: string) => void;
  onStartReject: (key: string, reason: string) => void;
  onConfirmReject: (key: string) => void;
  onCancelEdit: () => void;
  onFieldReasonChange: (value: string) => void;
  onApproveStep: () => void;
  onRejectStep: () => void;
}

export const ProfileStepContent: React.FC<ProfileStepContentProps> = ({
  tenant,
  loading,
  profileFields,
  editingField,
  fieldReason,
  onToggleApprove,
  onStartReject,
  onConfirmReject,
  onCancelEdit,
  onFieldReasonChange,
  onApproveStep,
  onRejectStep,
}) => {
  const fields = [
    { key: 'name', label: 'Nome Completo', value: tenant.name },
    { key: 'cpf', label: 'CPF', value: tenant.cpf || 'Não informado' },
    { key: 'phone', label: 'Celular', value: tenant.phone || 'Não informado' },
    { key: 'email', label: 'E-mail', value: tenant.email },
  ];

  return (
    <div className='space-y-4'>
      <div className='bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl p-5 space-y-4'>
        {fields.map((field) => {
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
              {tenant.onboarding_profile_status === 'submitted' && (
                <div className='flex items-center gap-2'>
                  {editingField === field.key ? (
                    <div className='flex items-center gap-2 w-full max-w-xs'>
                      <input
                        type='text'
                        value={fieldReason}
                        onChange={(e) => onFieldReasonChange(e.target.value)}
                        placeholder='Motivo da rejeição...'
                        className='h-8 px-3 rounded-lg border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 text-xs font-bold outline-none'
                      />
                      <button
                        onClick={() => onConfirmReject(field.key)}
                        className='h-8 px-3 bg-rose-600 text-white rounded-lg text-xs font-bold'
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className='h-8 px-2 text-slate-500 text-xs font-bold'
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onToggleApprove(field.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all ${statusObj.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500'}`}
                      >
                        <Check size={12} /> Aprovado
                      </button>
                      <button
                        onClick={() => onStartReject(field.key, statusObj.reason || '')}
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

      {tenant.onboarding_profile_status === 'rejected' && (
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

      {tenant.onboarding_profile_status === 'submitted' && (
        <div className='flex gap-3 mt-4'>
          <button
            onClick={onApproveStep}
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
              onClick={onRejectStep}
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
};
