import React from 'react';
import { ShieldCheck, Key } from 'lucide-react';
import type { OnboardingStepConfig } from '../../onboarding/types';

interface KeysSectionProps {
  step: OnboardingStepConfig;
  onStepComplete: () => void;
}

export const KeysSection: React.FC<KeysSectionProps> = ({ step, onStepComplete }) => {
  return (
    <div className='space-y-4'>
      {step.completed ? (
        <div className='text-center p-6 space-y-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl'>
          <div className='w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-md'>
            <ShieldCheck size={36} />
          </div>
          <div>
            <h4 className='text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight'>
              Onboarding Concluído!
            </h4>
            <p className='text-xs text-slate-500 mt-1'>
              Sua chave foi liberada pelo proprietário e seu acesso ao painel do inquilino está 100%
              liberado.
            </p>
          </div>
          <button
            onClick={onStepComplete}
            className='w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98'
          >
            Entrar no Painel do Inquilino
          </button>
        </div>
      ) : (
        <div className='text-center p-6 space-y-4 bg-slate-50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-2xl'>
          <div className='w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto animate-pulse'>
            <Key size={28} />
          </div>
          <div>
            <h4 className='text-sm font-bold text-slate-800 dark:text-white'>
              Aguardando Liberação das Chaves
            </h4>
            <p className='text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed'>
              Parabéns! Você concluiu todas as etapas obrigatórias. O proprietário foi notificado e
              fará a entrega física e liberação das chaves em breve.
            </p>
          </div>
          <div className='text-[10px] font-black uppercase text-amber-600 bg-amber-500/5 py-1 px-3.5 rounded-full inline-block'>
            Notificação enviada ao proprietário
          </div>
        </div>
      )}
    </div>
  );
};
