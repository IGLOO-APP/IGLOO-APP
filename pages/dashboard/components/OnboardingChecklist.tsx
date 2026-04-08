import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Check } from 'lucide-react';

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
  
  const steps = [
    {
      id: 1,
      title: 'Cadastre seu primeiro imóvel',
      completed: onboarding.step1,
      actionLabel: 'Adicionar Imóvel',
      onClick: () => navigate('/properties', { state: { openAdd: true } }),
      disabled: false,
    },
    {
      id: 2,
      title: 'Cadastre seu primeiro inquilino',
      completed: onboarding.step2,
      actionLabel: 'Adicionar Inquilino',
      onClick: () => navigate('/tenants', { state: { openAdd: true } }),
      disabled: !onboarding.step1,
      tooltip: 'Cadastre um imóvel primeiro',
    },
    {
      id: 3,
      title: 'Crie seu primeiro contrato',
      completed: onboarding.step3,
      actionLabel: 'Criar Contrato',
      onClick: () => navigate('/contracts', { state: { openWizard: true } }),
      disabled: !onboarding.step1 || !onboarding.step2,
      tooltip: 'Cadastre um imóvel e um inquilino primeiro',
    },
    {
      id: 4,
      title: 'Configure seu método de recebimento',
      completed: onboarding.step4,
      actionLabel: 'Configurar',
      onClick: () => navigate('/settings', { state: { activeTab: 'financial' } }),
      disabled: false,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className='bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden animate-fadeIn'>
      <div className='absolute top-0 right-0 p-4 opacity-10'>
        <Zap size={100} />
      </div>
      
      <div className='relative z-10'>
        <div className='flex items-center gap-2 mb-1'>
          <h2 className='text-xl font-bold'>Configure sua conta</h2>
        </div>
        <p className='text-sm text-indigo-100 opacity-90 mb-6'>Complete os passos abaixo para começar a usar o Igloo</p>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex justify-between text-xs font-bold uppercase tracking-wider'>
              <span>Progresso</span>
              <span>{completedCount} de {steps.length} concluídos</span>
            </div>
            <div className='w-full h-2 bg-white/20 rounded-full overflow-hidden'>
              <div 
                className='h-full bg-white rounded-full transition-all duration-1000' 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-2'>
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  step.completed 
                    ? 'bg-white/10 border-white/10 opacity-60' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    step.completed ? 'bg-emerald-400 text-indigo-900' : 'border-2 border-white/30'
                  }`}>
                    {step.completed && <Check size={14} strokeWidth={4} />}
                  </div>
                  <span className={`text-sm font-bold ${step.completed ? 'line-through opacity-80' : ''}`}>
                    {step.title}
                  </span>
                </div>

                {!step.completed && (
                  <div className='relative group/tooltip'>
                    <button
                      disabled={step.disabled}
                      onClick={step.onClick}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${
                        step.disabled
                          ? 'bg-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-white text-indigo-700 hover:scale-105 active:scale-95 shadow-lg'
                      }`}
                    >
                      {step.actionLabel}
                    </button>
                    {step.disabled && step.tooltip && (
                      <div className='absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10'>
                        {step.tooltip}
                        <div className='absolute top-full right-4 border-4 border-transparent border-t-slate-900'></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
