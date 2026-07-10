import React from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Building2,
  User,
  CircleDollarSign,
  Calendar,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { STEPS } from './steps/useContractWizard';

interface ContractWizardHeaderProps {
  currentStep: number;
  canAdvance: boolean;
  saving: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  stepRequirement?: string;
}

const STEP_ICONS = [Building2, User, CircleDollarSign, Calendar, FileText, CheckCircle2];

export const ContractWizardHeader: React.FC<ContractWizardHeaderProps> = ({
  currentStep,
  canAdvance,
  saving,
  onClose,
  onBack,
  onNext,
  stepRequirement,
}) => {
  return (
    <>
      <div className='flex-none bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-white/5 z-40 shadow-sm'>
        <div className='max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-4 min-w-[200px]'>
            <button
              onClick={onClose}
              className='p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white'
            >
              <X size={20} />
            </button>
            <div className='hidden sm:block'>
              <h2 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none'>
                Novo Contrato
              </h2>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                Igloo Wizard
              </p>
            </div>
          </div>

          <div className='hidden md:flex items-center gap-2'>
            {STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <React.Fragment key={step.id}>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                      currentStep === step.id
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                        : currentStep > step.id
                          ? 'text-emerald-500'
                          : 'text-slate-300'
                    }`}
                  >
                    <Icon size={12} className={currentStep === step.id ? 'animate-pulse' : ''} />
                    <span className='text-[9px] font-black uppercase tracking-widest'>
                      {step.title}
                    </span>
                  </div>
                  {i < 5 && (
                    <div
                      className={`w-4 h-0.5 rounded-full ${currentStep > step.id ? 'bg-emerald-500/30' : 'bg-slate-100 dark:bg-white/5'}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className='flex items-center gap-3 min-w-[200px] justify-end'>
            <button
              onClick={onBack}
              disabled={currentStep === 1}
              className='px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-0 transition-all flex items-center gap-2'
            >
              <ArrowLeft size={14} /> Voltar
            </button>
            <div className='relative group'>
              {!canAdvance && (
                <div className='absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-50'>
                  {stepRequirement || 'Preencha os campos obrigatórios'}
                </div>
              )}
              <button
                onClick={onNext}
                disabled={!canAdvance || saving}
                className={`px-5 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center gap-2 ${
                  !canAdvance || saving
                    ? 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className='animate-spin' /> Salvando
                  </>
                ) : currentStep === 6 ? (
                  'Finalizar'
                ) : (
                  'Próxima'
                )}
                {!saving && <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='md:hidden w-full h-1 bg-slate-100 dark:bg-white/5'>
        <div
          className='h-full bg-primary transition-all duration-300'
          style={{ width: `${(currentStep / 6) * 100}%` }}
        />
      </div>
    </>
  );
};
