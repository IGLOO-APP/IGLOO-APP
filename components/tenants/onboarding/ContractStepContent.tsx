import React from 'react';
import { Search, ExternalLink, CheckCircle, Loader, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Tenant } from '../../../types';
import { isValidUrl } from '../../../utils/validation';

interface ContractStepContentProps {
  tenant: Tenant;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onPreview: (url: string, title: string, id?: string) => void;
}

export const ContractStepContent: React.FC<ContractStepContentProps> = ({
  tenant,
  loading,
  onApprove,
  onReject,
  onPreview,
}) => {
  return (
    <div className='space-y-4'>
      {tenant.contract && (
        <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl'>
          <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-3'>
            Contrato de Locação
          </p>
          <div className='flex gap-2'>
            <button
              onClick={() => {
                if (tenant.contract?.pdf_url) {
                  const id = tenant.contract.pdf_url.split('/').pop()?.split('.')[0] || 'doc';
                  onPreview(tenant.contract.pdf_url, 'Contrato de Locação', id);
                }
              }}
              className='flex-1 h-10 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-white/20 transition-all'
            >
              <Search size={14} /> Visualizar
            </button>
            <button
              onClick={() =>
                tenant.contract?.pdf_url &&
                isValidUrl(tenant.contract.pdf_url) &&
                window.open(tenant.contract.pdf_url, '_blank', 'noopener,noreferrer')
              }
              className='flex-1 h-10 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-white/20 transition-all'
            >
              <ExternalLink size={14} /> Abrir
            </button>
          </div>
        </div>
      )}
      {tenant.onboarding_contract_status === 'submitted' && (
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
      {tenant.onboarding_contract_status === 'approved' && (
        <div className='p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2'>
          <CheckCircle size={18} /> Contrato aprovado e ativo!
        </div>
      )}
    </div>
  );
};
