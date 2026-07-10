import React from 'react';
import { X, ThumbsDown, Loader } from 'lucide-react';

interface OnboardingRejectModalProps {
  show: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rejectReason: string;
  onRejectReasonChange: (value: string) => void;
}

export const OnboardingRejectModal: React.FC<OnboardingRejectModalProps> = ({
  show,
  loading,
  onClose,
  onConfirm,
  rejectReason,
  onRejectReasonChange,
}) => {
  if (!show) return null;

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-surface-dark rounded-3xl p-6 w-full max-w-md shadow-2xl'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-black text-slate-900 dark:text-white'>Rejeitar Etapa</h3>
          <button
            onClick={onClose}
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
            onChange={(e) => onRejectReasonChange(e.target.value)}
            placeholder='Descreva o que precisa ser corrigido...'
            rows={4}
            className='w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none'
          />
        </div>
        <div className='flex gap-3'>
          <button
            onClick={onClose}
            disabled={loading}
            className='flex-1 h-12 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50'
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || !rejectReason.trim()}
            className='flex-1 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg'
          >
            {loading ? <Loader className='animate-spin' size={16} /> : <ThumbsDown size={16} />}{' '}
            Confirmar Ajuste
          </button>
        </div>
      </div>
    </div>
  );
};
