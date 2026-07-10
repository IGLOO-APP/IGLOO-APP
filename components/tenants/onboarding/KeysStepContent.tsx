import React from 'react';
import { CheckCircle, Key, Loader } from 'lucide-react';
import { Tenant } from '../../../types';

interface KeysStepContentProps {
  tenant: Tenant;
  loading: boolean;
  onConfirmDelivery: () => void;
}

export const KeysStepContent: React.FC<KeysStepContentProps> = ({
  tenant,
  loading,
  onConfirmDelivery,
}) => {
  return (
    <div className='space-y-4'>
      {tenant.onboarding_stage === 'completed' ? (
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
              onClick={onConfirmDelivery}
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
};
