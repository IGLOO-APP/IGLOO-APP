import React from 'react';
import { CheckCircle, Loader, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Tenant } from '../../../types';

interface InspectionStepContentProps {
  tenant: Tenant;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export const InspectionStepContent: React.FC<InspectionStepContentProps> = ({
  tenant,
  loading,
  onApprove,
  onReject,
}) => {
  return (
    <div className='space-y-4'>
      <div className='p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-600 dark:text-slate-400 text-xs font-medium'>
        Esta etapa se refere ao laudo de vistoria de entrada.
      </div>
      {tenant.onboarding_inspection_status === 'submitted' && (
        <div className='flex gap-3 mt-4'>
          <button
            onClick={onApprove}
            disabled={loading}
            className='flex-1 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all disabled:opacity-30 hover:scale-[1.02] shadow-lg'
          >
            {loading ? <Loader className='animate-spin' size={16} /> : <ThumbsUp size={16} />}{' '}
            Aprovar
          </button>
          <button
            onClick={onReject}
            disabled={loading}
            className='flex-1 h-12 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02] shadow-lg'
          >
            <ThumbsDown size={16} /> Solicitar Ajuste
          </button>
        </div>
      )}
      {tenant.onboarding_inspection_status === 'approved' && (
        <div className='p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2'>
          <CheckCircle size={18} /> Laudo de vistoria aprovado!
        </div>
      )}
    </div>
  );
};
