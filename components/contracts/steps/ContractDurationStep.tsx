import React from 'react';
import {
  ArrowRight,
  Calendar,
  ShieldCheck,
  History,
  ArrowDownToDot,
  RotateCcw,
  Infinity as InfinityIcon,
  AlertTriangle,
} from 'lucide-react';
import { ContractFormData } from './useContractWizard';

interface ContractDurationStepProps {
  formData: ContractFormData;
  onFormDataChange: (data: Partial<ContractFormData>) => void;
  getEndDate: () => string;
  getAdjustmentDate: () => string;
}

export const ContractDurationStep: React.FC<ContractDurationStepProps> = ({
  formData,
  onFormDataChange,
  getEndDate,
  getAdjustmentDate,
}) => {
  return (
    <div className='space-y-8 animate-fadeIn max-w-4xl mx-auto w-full'>
      <div className='text-center'>
        <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>Vigência</h3>
        <p className='text-slate-500'>Defina o período de validade e regras de renovação.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-5 gap-8'>
        <div className='md:col-span-2 space-y-6'>
          <div className='lg-card p-6 rounded-3xl relative'>
            <div className='absolute left-10 top-16 bottom-16 w-0.5 border-l border-dashed border-white/10'></div>
            <div className='space-y-12 relative z-10'>
              <div className='flex items-start gap-4'>
                <div className='w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20'>
                  <ArrowRight size={14} />
                </div>
                <div>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    Início do Contrato
                  </p>
                  <p className='text-lg font-black text-slate-900 dark:text-white'>
                    {new Date(formData.startDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <div className='w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center'>
                  <ArrowDownToDot size={14} />
                </div>
                <div>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    Duração Total
                  </p>
                  <div className='flex items-center gap-2'>
                    <span className='px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-sm font-black'>
                      {formData.duration} Meses
                    </span>
                    <span className='text-xs text-slate-400 font-medium'>Periodo padrão</span>
                  </div>
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <div className='w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg'>
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    Término Estimado
                  </p>
                  <p className='text-lg font-black text-slate-900 dark:text-white'>
                    {getEndDate()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 flex items-center gap-3'>
            <History size={20} className='text-indigo-500' />
            <div className='flex-1'>
              <p className='text-[10px] font-bold text-indigo-400 uppercase leading-none mb-1'>
                Primeiro Reajuste
              </p>
              <p className='text-xs font-bold text-indigo-900 dark:text-indigo-200'>
                Aniversário em {getAdjustmentDate()}
              </p>
            </div>
          </div>
        </div>

        <div className='md:col-span-3 space-y-6'>
          <div className='lg-card p-8 rounded-3xl space-y-8'>
            <div>
              <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-4 ml-1'>
                Quanto tempo durará o contrato?
              </label>
              <div className='grid grid-cols-3 gap-3'>
                {[12, 30, 36].map((m) => (
                  <button
                    key={m}
                    onClick={() => onFormDataChange({ duration: m.toString() })}
                    className={`py-4 rounded-2xl border font-black transition-all ${formData.duration === m.toString() ? 'border-primary bg-white/10 text-primary scale-[1.02] shadow-md' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}
                  >
                    {m} Meses
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1'>
                Data de Início
              </label>
              <div className='relative'>
                <Calendar
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                  size={20}
                />
                <input
                  type='date'
                  value={formData.startDate}
                  onChange={(e) => onFormDataChange({ startDate: e.target.value })}
                  className='w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-primary/50 focus:bg-white/10 outline-none font-bold text-foreground transition-all'
                />
              </div>
            </div>

            <div
              onClick={() => onFormDataChange({ autoRenew: !formData.autoRenew })}
              className={`relative group flex items-center gap-4 p-6 rounded-3xl border cursor-pointer transition-all overflow-hidden ${formData.autoRenew ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
            >
              {formData.autoRenew && (
                <div className='absolute -right-4 -bottom-4 text-emerald-500/10 rotate-12'>
                  <InfinityIcon size={100} />
                </div>
              )}
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${formData.autoRenew ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110' : 'border-white/10 bg-white/5 text-slate-400'}`}
              >
                {formData.autoRenew ? <InfinityIcon size={24} /> : <RotateCcw size={20} />}
              </div>
              <div className='relative z-10'>
                <p
                  className={`text-lg font-black ${formData.autoRenew ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  Renovação Automática
                </p>
                <p className='text-sm text-slate-500 font-medium'>
                  Deseja prorrogar o contrato por tempo indeterminado após o término?
                </p>
              </div>
            </div>

            <div className='pt-6 border-t border-slate-100 dark:border-white/5'>
              <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-4 ml-1'>
                Multa por Rescisão Antecipada
              </label>
              <div className='grid grid-cols-3 gap-3'>
                {[1, 2, 3].map((m) => (
                  <button
                    key={m}
                    onClick={() => onFormDataChange({ earlyTerminationFee: m.toString() })}
                    className={`py-4 rounded-2xl border font-black transition-all relative overflow-hidden ${formData.earlyTerminationFee === m.toString() ? 'border-primary bg-white/10 text-primary scale-[1.02] shadow-md' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}
                  >
                    {m} {m === 1 ? 'Mês' : 'Meses'}
                    {parseInt(formData.duration) <= 12 && m === 1 && (
                      <span className='absolute top-1 right-1 text-[7px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest'>
                        Short-stay
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {parseInt(formData.duration) <= 12 && (
                <div className='mt-3 p-3 bg-amber-500/5 rounded-2xl border border-amber-500/20 flex items-center gap-2'>
                  <AlertTriangle size={14} className='text-amber-500 shrink-0' />
                  <p className='text-[10px] text-amber-700 dark:text-amber-400 font-bold'>
                    Contratos curtos (≤12 meses): recomendamos multa de 1 mês, proporcional ao Art.
                    4º da Lei 8.245/91.
                  </p>
                </div>
              )}
            </div>

            <div className='pt-6 border-t border-slate-100 dark:border-white/5'>
              <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-4 ml-1'>
                Período Mínimo de Permanência (Lock-in)
              </label>
              <div className='grid grid-cols-3 gap-3'>
                {[3, 6, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => onFormDataChange({ lockInPeriod: m.toString() })}
                    className={`py-4 rounded-2xl border font-black transition-all ${formData.lockInPeriod === m.toString() ? 'border-primary bg-white/10 text-primary scale-[1.02] shadow-md' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}
                  >
                    {m} Meses
                  </button>
                ))}
              </div>
              <div className='mt-3 p-3 bg-white/5 rounded-2xl border border-white/10'>
                <p className='text-[10px] text-muted-foreground font-semibold leading-relaxed'>
                  Período mínimo em que a multa rescisória é cobrada integralmente, sem
                  proporcionalidade. Protege o investimento de reforma entre inquilinos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
