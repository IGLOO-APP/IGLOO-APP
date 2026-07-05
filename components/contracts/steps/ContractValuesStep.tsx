import React from 'react';
import { Building2, DollarSign, TrendingUp, RotateCcw, Info } from 'lucide-react';
import { Property } from '../../../types';
import { ContractFormData } from './useContractWizard';

interface ContractValuesStepProps {
  properties: Property[];
  formData: ContractFormData;
  onFormDataChange: (data: Partial<ContractFormData>) => void;
}

export const ContractValuesStep: React.FC<ContractValuesStepProps> = ({
  properties,
  formData,
  onFormDataChange,
}) => {
  const selectedProp = properties.find((p) => p.name === formData.property);
  const basePrice = selectedProp?.price || '0,00';

  return (
    <div className='space-y-8 animate-fadeIn max-w-4xl mx-auto w-full'>
      <div className='text-center'>
        <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
          Valores do Contrato
        </h3>
        <p className='text-slate-500'>
          Valores sugeridos com base no perfil do imóvel selecionado.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-5 gap-8'>
        <div className='md:col-span-2 space-y-6'>
          <div className='bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 rounded-3xl p-6 relative overflow-hidden'>
            <div className='absolute -right-4 -top-4 text-primary/10 rotate-12'>
              <TrendingUp size={120} />
            </div>
            <div className='relative z-10'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center'>
                  <DollarSign size={18} />
                </div>
                <h4 className='font-black text-primary uppercase tracking-widest text-[10px]'>
                  Perfil do Imóvel
                </h4>
              </div>
              <div className='space-y-4'>
                <div>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>Aluguel Base</p>
                  <p className='text-2xl font-black text-slate-900 dark:text-white'>
                    R$ {basePrice}
                  </p>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-[10px] font-bold text-slate-400 uppercase'>Condomínio</p>
                    <p className='text-sm font-black text-emerald-500'>Incluso</p>
                  </div>
                  <div>
                    <p className='text-[10px] font-bold text-slate-400 uppercase'>IPTU</p>
                    <p className='text-sm font-black text-emerald-500'>Incluso</p>
                  </div>
                </div>
                <div className='pt-4 border-t border-primary/10'>
                  <p className='text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1'>
                    <Info size={10} /> Sugestão de Garantia
                  </p>
                  <p className='text-sm font-bold text-slate-600 dark:text-slate-300'>
                    3x o valor do aluguel
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400'>
              <Building2 size={20} />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-[10px] font-bold text-slate-400 uppercase'>Imóvel Selecionado</p>
              <p className='text-sm font-bold text-slate-900 dark:text-white truncate'>
                {formData.property}
              </p>
            </div>
          </div>
        </div>

        <div className='md:col-span-3 space-y-6'>
          <div className='bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 space-y-8'>
            <div>
              <div className='flex items-center justify-between mb-2 ml-1'>
                <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-black'>
                  Aluguel Negociado
                </label>
                {formData.rentValue !== basePrice.replace(/[^\d,]/g, '').replace(',', '.') && (
                  <button
                    onClick={() =>
                      onFormDataChange({
                        rentValue: basePrice.replace(/[^\d,]/g, '').replace(',', '.'),
                      })
                    }
                    className='text-[10px] font-black text-primary flex items-center gap-1 hover:underline'
                  >
                    <RotateCcw size={10} /> Restaurar Base
                  </button>
                )}
              </div>
              <div className='relative'>
                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl'>
                  R$
                </span>
                <input
                  type='number'
                  value={formData.rentValue}
                  onChange={(e) => onFormDataChange({ rentValue: e.target.value })}
                  className='w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-black/40 outline-none font-black text-3xl text-slate-900 dark:text-white transition-all'
                  placeholder='0,00'
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className='flex items-center justify-between mb-2 ml-1'>
                <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-black'>
                  Caução (Garantia)
                </label>
                {formData.depositValue !==
                  (parseFloat(formData.rentValue || '0') * 3).toString() && (
                  <button
                    onClick={() =>
                      onFormDataChange({
                        depositValue: (parseFloat(formData.rentValue || '0') * 3).toString(),
                      })
                    }
                    className='text-[10px] font-black text-primary flex items-center gap-1 hover:underline'
                  >
                    <RotateCcw size={10} /> Sugerir 3x
                  </button>
                )}
              </div>
              <div className='relative'>
                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl'>
                  R$
                </span>
                <input
                  type='number'
                  value={formData.depositValue}
                  onChange={(e) => onFormDataChange({ depositValue: e.target.value })}
                  className='w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-black/40 outline-none font-black text-3xl text-slate-900 dark:text-white transition-all'
                  placeholder='0,00'
                />
              </div>
              <div className='mt-4 p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border border-slate-100 dark:border-white/5'>
                <p className='text-xs text-slate-500 leading-relaxed font-medium'>
                  O valor da garantia é retido para cobrir eventuais danos ou inadimplência ao final
                  do contrato. O padrão de mercado é de até 3 vezes o valor do aluguel.
                </p>
              </div>
            </div>

            <div className='pt-6 border-t border-slate-100 dark:border-white/5'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex flex-col'>
                  <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-black'>
                    Taxa de Rateio Fixa
                  </label>
                  <span className='text-[10px] text-slate-400 font-bold'>
                    Para kitnets sem condomínio formal
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() =>
                    onFormDataChange({ hasMaintenanceFee: !formData.hasMaintenanceFee })
                  }
                  className={`w-12 h-7 rounded-full transition-all duration-300 relative shrink-0 ${formData.hasMaintenanceFee ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md ${formData.hasMaintenanceFee ? 'left-6' : 'left-1'}`}
                  />
                </button>
              </div>
              {formData.hasMaintenanceFee && (
                <div className='space-y-4 animate-fadeIn'>
                  <div className='relative'>
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl'>
                      R$
                    </span>
                    <input
                      type='number'
                      value={formData.maintenanceFee}
                      onChange={(e) => onFormDataChange({ maintenanceFee: e.target.value })}
                      className='w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-black/40 outline-none font-black text-3xl text-slate-900 dark:text-white transition-all'
                      placeholder='0,00'
                    />
                  </div>
                  <div className='p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20'>
                    <p className='text-xs text-slate-500 leading-relaxed font-medium'>
                      Rateio mensal fixo cobrado por você para cobrir limpeza de corredores,
                      internet coletiva, água compartilhada e demais serviços.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
