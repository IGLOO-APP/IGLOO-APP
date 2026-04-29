import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, UserPlus, FileText, CreditCard, Check, LucideIcon } from 'lucide-react';

interface OnboardingProps {
  onboarding: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
  };
  variant?: 'full' | 'compact-2x2';
}

export const OnboardingChecklist: React.FC<OnboardingProps> = ({ onboarding, variant = 'full' }) => {
  const navigate = useNavigate();

  const steps: {
    id: number;
    title: string;
    completed: boolean;
    actionLabel: string;
    onClick: () => void;
    disabled: boolean;
    tooltip?: string;
    icon: LucideIcon;
    color: string;
  }[] = [
    {
      id: 1,
      title: onboarding.step1 ? 'Cadastrar mais imóveis' : 'Cadastre seu primeiro imóvel',
      originalTitle: 'Cadastre seu primeiro imóvel',
      completed: onboarding.step1,
      actionLabel: onboarding.step1 ? 'Novo Imóvel' : 'Adicionar Imóvel',
      onClick: () => navigate('/properties', { state: { openAdd: true } }),
      disabled: false,
      icon: Home,
      color: 'text-primary',
    },
    {
      id: 2,
      title: onboarding.step2 ? 'Gerenciar inquilinos' : 'Cadastre seu primeiro inquilino',
      originalTitle: 'Cadastre seu primeiro inquilino',
      completed: onboarding.step2,
      actionLabel: onboarding.step2 ? 'Ver Inquilinos' : 'Adicionar Inquilino',
      onClick: () => navigate('/tenants', { state: { openAdd: true } }),
      disabled: !onboarding.step1,
      tooltip: 'Cadastre um imóvel primeiro',
      icon: UserPlus,
      color: 'text-violet-400',
    },
    {
      id: 3,
      title: onboarding.step3 ? 'Criar novos contratos' : 'Crie seu primeiro contrato',
      originalTitle: 'Crie seu primeiro contrato',
      completed: onboarding.step3,
      actionLabel: onboarding.step3 ? 'Novo Contrato' : 'Criar Contrato',
      onClick: () => navigate('/contracts', { state: { openWizard: true } }),
      disabled: !onboarding.step1 || !onboarding.step2,
      tooltip: 'Cadastre um imóvel e um inquilino primeiro',
      icon: FileText,
      color: 'text-blue-400',
    },
    {
      id: 4,
      title: onboarding.step4 ? 'Financeiro configurado' : 'Configure seu método de recebimento',
      originalTitle: 'Configure seu método de recebimento',
      completed: onboarding.step4,
      actionLabel: onboarding.step4 ? 'Gerenciar Finanças' : 'Configurar',
      onClick: () => navigate('/settings', { state: { activeTab: 'financial' } }),
      disabled: false,
      icon: CreditCard,
      color: 'text-emerald-400',
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;

  return (
    <section className={
      variant === 'compact-2x2' 
        ? 'grid grid-cols-2 gap-x-3 gap-y-2' 
        : 'grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fadeIn'
    }>
      {steps.map((step, index) => {
        const isNext =
          !step.completed &&
          !step.disabled &&
          !steps.slice(0, index).some(s => !s.completed && !s.disabled);

        return (
          <button
            key={step.id}
            disabled={step.disabled && !step.completed}
            onClick={step.onClick}
            className={`group relative overflow-hidden text-left bg-white dark:bg-surface-dark p-2.5 md:p-3 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.98] ${
              variant === 'compact-2x2' ? 'min-h-[90px]' : 'md:p-5'
            } ${
              step.completed
                ? 'border-emerald-500/20 dark:border-emerald-500/10'
                : isNext
                  ? `border-primary/30 dark:border-primary/20 bg-primary/5 dark:bg-primary/5`
                  : step.disabled
                    ? 'border-gray-100 dark:border-white/5 opacity-40 cursor-not-allowed'
                    : 'border-gray-100 dark:border-white/5 hover:border-primary/20'
            }`}
          >
            {/* Background Decorative Step Label — Stealth Silver */}
            <div className='absolute right-2 -bottom-2 md:right-4 md:-bottom-4 select-none pointer-events-none whitespace-nowrap overflow-visible z-0'>
              <span className={`text-5xl md:text-7xl font-black italic tracking-tighter transition-all duration-700 ${
                step.completed 
                  ? 'text-slate-900/5 dark:text-white/5' 
                  : 'text-slate-200 dark:text-white/5'
              } group-hover:scale-110 group-hover:-translate-y-2`}>
                PASSO 0{step.id}
              </span>
            </div>

            {/* Subtle Silver Glow for Active Step */}
            {isNext && (
              <div className='absolute -inset-1 bg-gradient-to-r from-slate-400/10 to-white/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity' />
            )}

            {/* Top row: Icon + Status */}
            <div className='relative z-10 flex justify-between items-center mb-5 md:mb-8'>
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${
                  step.completed
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rotate-3'
                    : step.disabled
                      ? 'bg-slate-100 dark:bg-white/5 text-slate-400'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                } group-hover:rotate-0`}
              >
                <step.icon size={variant === 'compact-2x2' ? 18 : 24} />
              </div>

              <div className='flex items-center gap-2'>
                {step.completed ? (
                  <div className='flex items-center justify-center w-8 h-8 bg-slate-900 dark:bg-white rounded-full shadow-lg'>
                    <Check size={14} className='text-white dark:text-slate-900' strokeWidth={4} />
                  </div>
                ) : (
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    isNext 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                  }`}>
                    {completedCount}/{steps.length}
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className='relative z-10'>
              <div className='flex flex-col gap-1'>
                <h3 className={`text-sm md:text-xl font-black tracking-tight leading-tight transition-colors ${
                  step.completed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                }`}>
                  {step.title}
                </h3>
                {step.completed && (
                  <p className='text-[10px] md:text-xs font-bold text-slate-300 dark:text-slate-600 line-through decoration-slate-400/50'>
                    {step.originalTitle}
                  </p>
                )}
              </div>
              
              <div className='flex items-center gap-3 mt-4'>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  step.completed
                    ? 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600'
                    : isNext
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-300'
                } group-hover:translate-x-1`}>
                  {step.completed ? <Check size={14} /> : <span className='font-black'>→</span>}
                </div>
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${
                  step.completed ? 'text-slate-300 dark:text-slate-600' : isNext ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                }`}>
                  {step.actionLabel}
                </span>
              </div>
            </div>

            {/* Tooltip for disabled */}
            {step.disabled && !step.completed && step.tooltip && (
              <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10'>
                {step.tooltip}
                <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900' />
              </div>
            )}
          </button>
        );
      })}
    </section>
  );
};
