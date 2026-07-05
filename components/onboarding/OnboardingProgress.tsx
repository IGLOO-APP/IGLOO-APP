import React from 'react';
import { CheckCircle } from 'lucide-react';

interface OnboardingProgressProps {
  completedCount: number;
  totalSteps: number;
  progressPercent: number;
  label: string;
  doneLabel: string;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  completedCount,
  totalSteps,
  progressPercent,
  label,
  doneLabel,
}) => (
  <div className='bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl'>
    <div className='flex justify-between items-center mb-3'>
      <span className='text-xs font-black text-slate-400 uppercase tracking-widest'>
        Progresso Geral
      </span>
      <span className='text-sm font-black text-primary'>{progressPercent}% Concluído</span>
    </div>
    <div className='w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden'>
      <div
        className='h-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700 ease-out'
        style={{ width: `${progressPercent}%` }}
      />
    </div>
    <div className='mt-4 flex justify-between text-[11px] text-slate-400 font-medium'>
      <span>
        {completedCount} de {totalSteps} {label}
      </span>
      {progressPercent === 100 && (
        <span className='text-emerald-500 font-black uppercase tracking-wider flex items-center gap-1'>
          <CheckCircle size={12} /> {doneLabel}
        </span>
      )}
    </div>
  </div>
);
