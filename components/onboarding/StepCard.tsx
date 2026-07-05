import React, { ReactNode } from 'react';
import { ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { OnboardingStepConfig } from './types';

interface StepCardProps {
  step: OnboardingStepConfig;
  index: number;
  isExpanded: boolean;
  toggleExpand: (id: string) => void;
  meta: {
    label: string;
    statusLabels: Record<string, string>;
  };
  renderContent: () => ReactNode;
}

const statusBadge = (status: string, statusLabels: Record<string, string>) => {
  const map: Record<string, { bg: string; text: string; pulse?: boolean }> = {
    approved: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
    },
    submitted: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      pulse: true,
    },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    pending: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
    },
  };
  const style = map[status] || map.pending;
  return (
    <span
      className={`${style.bg} ${style.text} text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${style.pulse ? 'animate-pulse' : ''}`}
    >
      {statusLabels[status] || status}
    </span>
  );
};

export const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  isExpanded,
  toggleExpand,
  meta,
  renderContent,
}) => {
  const Icon = step.icon;
  const isCompleted = step.completed;
  const isUnlocked = step.unlocked;

  const borderClass = !isUnlocked
    ? 'border-slate-100 dark:border-white/5 opacity-50'
    : isCompleted
      ? 'border-emerald-100 dark:border-emerald-900/10 opacity-90'
      : isExpanded
        ? 'border-primary ring-1 ring-primary/20 scale-[1.01]'
        : 'border-gray-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10';

  return (
    <div
      className={`bg-white dark:bg-surface-dark border rounded-3xl shadow-sm overflow-hidden transition-all duration-300 ${borderClass}`}
    >
      <button
        onClick={() => isUnlocked && toggleExpand(step.id)}
        disabled={!isUnlocked}
        className={`w-full p-5 flex items-center justify-between text-left focus:outline-none ${!isUnlocked ? 'cursor-not-allowed' : ''}`}
      >
        <div className='flex items-center gap-4'>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${step.color}`}>
            <Icon size={24} />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-bold text-slate-400 uppercase tracking-widest leading-none'>
                {meta.label} 0{index + 1}
              </span>
              {isCompleted
                ? statusBadge('approved', meta.statusLabels)
                : statusBadge(step.status, meta.statusLabels)}
            </div>
            <h3 className='text-base font-black text-slate-900 dark:text-white mt-1'>
              {step.title}
            </h3>
          </div>
        </div>
        <div>
          {!isUnlocked ? (
            <Lock size={18} className='text-slate-350' />
          ) : isExpanded ? (
            <ChevronDown size={20} className='text-slate-450' />
          ) : (
            <ChevronRight size={20} className='text-slate-450' />
          )}
        </div>
      </button>

      {isUnlocked && isExpanded && (
        <div className='px-5 pb-6 pt-2 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-black/5 animate-slideDown'>
          {renderContent()}
        </div>
      )}
    </div>
  );
};
