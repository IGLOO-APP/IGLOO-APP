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
}

export const OnboardingChecklist: React.FC<OnboardingProps> = ({ onboarding }) => {
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
      completed: onboarding.step1,
      actionLabel: onboarding.step1 ? 'Novo Imóvel' : 'Adicionar Imóvel',
      onClick: () => navigate('/properties', { state: { openAdd: true } }),
      disabled: false,
      icon: Home,
      color: 'text-indigo-500',
    },
    {
      id: 2,
      title: onboarding.step2 ? 'Gerenciar inquilinos' : 'Cadastre seu primeiro inquilino',
      completed: onboarding.step2,
      actionLabel: onboarding.step2 ? 'Ver Inquilinos' : 'Adicionar Inquilino',
      onClick: () => navigate('/tenants', { state: { openAdd: true } }),
      disabled: !onboarding.step1,
      tooltip: 'Cadastre um imóvel primeiro',
      icon: UserPlus,
      color: 'text-violet-500',
    },
    {
      id: 3,
      title: onboarding.step3 ? 'Criar novos contratos' : 'Crie seu primeiro contrato',
      completed: onboarding.step3,
      actionLabel: onboarding.step3 ? 'Novo Contrato' : 'Criar Contrato',
      onClick: () => navigate('/contracts', { state: { openWizard: true } }),
      disabled: !onboarding.step1 || !onboarding.step2,
      tooltip: 'Cadastre um imóvel e um inquilino primeiro',
      icon: FileText,
      color: 'text-amber-500',
    },
    {
      id: 4,
      title: onboarding.step4 ? 'Financeiro configurado' : 'Configure seu método de recebimento',
      completed: onboarding.step4,
      actionLabel: onboarding.step4 ? 'Gerenciar Finanças' : 'Configurar',
      onClick: () => navigate('/settings', { state: { activeTab: 'financial' } }),
      disabled: false,
      icon: CreditCard,
      color: 'text-emerald-500',
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;

  return (
    <section className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fadeIn'>
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
            className={`group relative overflow-hidden text-left bg-white dark:bg-surface-dark p-3 md:p-5 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.98] ${
              step.completed
                ? 'border-emerald-200 dark:border-emerald-500/20'
                : isNext
                  ? 'border-primary/20 dark:border-primary/25 hover:border-primary/40'
                  : step.disabled
                    ? 'border-gray-100 dark:border-white/5 opacity-50 cursor-not-allowed'
                    : 'border-gray-100 dark:border-white/5 hover:border-primary/20'
            }`}
          >
            {/* Ghost icon — same as HeroCard */}
            <div
              className={`absolute top-0 right-0 p-2 md:p-4 transition-opacity opacity-5 group-hover:opacity-10 ${
                step.completed ? 'text-emerald-500' : step.color
              }`}
            >
              {step.completed ? (
                <Check size={80} className='hidden md:block' />
              ) : (
                <step.icon size={80} className='hidden md:block' />
              )}
            </div>

            {/* Top row: icon badge + counter pill */}
            <div className='flex justify-between items-start mb-2 md:mb-4'>
              <div
                className={`p-2 md:p-3 rounded-xl ${
                  step.completed
                    ? 'bg-emerald-50 dark:bg-emerald-500/10'
                    : step.disabled
                      ? 'bg-slate-100 dark:bg-white/5'
                      : step.color.replace('text-', 'bg-').replace('500', '50') + ' dark:bg-white/5'
                }`}
              >
                {step.completed ? (
                  <Check size={20} className='text-emerald-500' />
                ) : (
                  <step.icon
                    size={20}
                    className={step.disabled ? 'text-slate-400 dark:text-slate-500' : step.color}
                  />
                )}
              </div>

              <span
                className={`text-[9px] md:text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  step.completed
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : isNext
                      ? 'bg-primary/10 text-primary'
                      : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500'
                }`}
              >
                {step.completed ? 'Feito' : `${completedCount}/${steps.length}`}
              </span>
            </div>

            {/* Body — mirrors HeroCard */}
            <div>
              <p className='text-slate-500 dark:text-slate-400 text-[9px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1'>
                Passo {step.id}
              </p>
              <h3 className='text-sm md:text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight'>
                {step.title}
              </h3>
              <div className='flex items-center gap-1.5 md:gap-2 mt-1 md:mt-2'>
                <span
                  className={`flex items-center text-[9px] md:text-xs font-bold px-1.5 py-0.5 rounded ${
                    step.completed
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : isNext
                        ? 'bg-primary/10 text-primary'
                        : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                  }`}
                >
                  {step.completed ? '✓' : '→'}
                </span>
                <span className='text-[9px] md:text-xs text-slate-400 font-medium line-clamp-1'>
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
