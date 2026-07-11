import React from 'react';
import { CheckCircle, ClipboardCheck } from 'lucide-react';
import type { OnboardingStepConfig } from '../../onboarding/types';

interface InspectionSectionProps {
  step: OnboardingStepConfig;
  onOpenInspection: () => void;
}

export const InspectionSection: React.FC<InspectionSectionProps> = ({ step, onOpenInspection }) => {
  return (
    <div className='space-y-4'>
      {step.completed ? (
        <div className='p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2'>
          <CheckCircle size={18} /> Vistoria de entrada validada e concluída!
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='p-5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex flex-col items-center text-center space-y-3'>
            <div className='w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center'>
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h4 className='text-sm font-bold text-slate-800 dark:text-white text-center'>
                Laudo de Entrada Pendente
              </h4>
              <p className='text-xs text-slate-400 mt-1 max-w-sm text-center'>
                Revise os cômodos e itens do imóvel informando qualquer avaria para validação do
                proprietário.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenInspection}
            className='w-full h-12 bg-orange-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-orange-650 active:scale-[0.99] transition-all'
          >
            <ClipboardCheck size={16} /> Abrir Vistoria de Entrada
          </button>
        </div>
      )}
    </div>
  );
};
