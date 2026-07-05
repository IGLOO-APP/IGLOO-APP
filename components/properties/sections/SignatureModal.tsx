import React from 'react';
import { Lock } from 'lucide-react';

interface SignatureModalProps {
  show: boolean;
  signName: string;
  setSignName: (val: string) => void;
  signCpf: string;
  setSignCpf: (val: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSign: () => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  show,
  signName,
  setSignName,
  signCpf,
  setSignCpf,
  isSubmitting,
  onClose,
  onSign,
}) => {
  if (!show) return null;

  return (
    <div className='fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl animate-scaleIn'>
        <div>
          <h3 className='text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider'>
            Assinar Laudo de Vistoria
          </h3>
          <p className='text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1'>
            Insira os seus dados autenticados para concluir a assinatura.
          </p>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>
              Nome Completo
            </label>
            <input
              type='text'
              value={signName}
              onChange={(e) => setSignName(e.target.value)}
              placeholder='Nome completo do assinante...'
              className='w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>
              CPF do Assinante
            </label>
            <input
              type='text'
              value={signCpf}
              onChange={(e) => setSignCpf(e.target.value)}
              placeholder='000.000.000-00'
              className='w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
            />
          </div>

          <div className='p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed flex gap-2'>
            <Lock size={12} className='text-[#13c8ec] shrink-0 mt-0.5' />
            <span>
              Ao clicar em assinar, você concorda com a validade deste laudo sob os termos
              contratuais estabelecidos. Sua assinatura eletrônica registrará as informações de IP e
              carimbo de data/hora (timestamp).
            </span>
          </div>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold transition-all'
          >
            Cancelar
          </button>
          <button
            onClick={onSign}
            disabled={isSubmitting || !signName.trim() || !signCpf.trim()}
            className='flex-1 py-2.5 bg-[#13c8ec] text-[#0a0f1a] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-[#13c8ec]/10'
          >
            {isSubmitting ? 'Assinando...' : 'Assinar Agora'}
          </button>
        </div>
      </div>
    </div>
  );
};
