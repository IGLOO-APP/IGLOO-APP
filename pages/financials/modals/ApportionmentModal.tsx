import React from 'react';
import { Building2, Users, Check, Calculator, CheckCircle } from 'lucide-react';
import { ModalWrapper } from '../../../components/ui/ModalWrapper';
import { UnitParams } from '../../../utils/financialCalculations';

import type { ApportionmentResult } from '../../../types';

interface ApportionmentModalProps {
  show: boolean;
  onClose: () => void;
  apportionTotal: string;
  onApportionTotalChange: (v: string) => void;
  apportionMethod: 'fixed' | 'people';
  onApportionMethodChange: (m: 'fixed' | 'people') => void;
  apportionResult: ApportionmentResult | null;
  mockUnits: UnitParams[];
  selectedUnitsIds: string[];
  onToggleUnit: (id: string) => void;
  onCalculate: () => void;
}

export const ApportionmentModal: React.FC<ApportionmentModalProps> = ({
  show,
  onClose,
  apportionTotal,
  onApportionTotalChange,
  apportionMethod,
  onApportionMethodChange,
  apportionResult,
  mockUnits,
  selectedUnitsIds,
  onToggleUnit,
  onCalculate,
}) => {
  if (!show) return null;

  return (
    <ModalWrapper onClose={onClose} title='Rateio de Despesas' showCloseButton={true}>
      <div className='p-6 bg-background-light dark:bg-background-dark h-full overflow-y-auto'>
        <div className='space-y-6'>
          <p className='text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-3 rounded-xl'>
            Divida contas únicas (Água, Luz) proporcionalmente entre as unidades selecionadas.
          </p>

          <div>
            <label className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block'>
              Valor da Conta
            </label>
            <div className='relative group'>
              <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl group-focus-within:text-primary transition-colors'>
                R$
              </span>
              <input
                autoFocus
                type='number'
                value={apportionTotal}
                onChange={(e) => onApportionTotalChange(e.target.value)}
                className='w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-gray-700 text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-slate-300'
                placeholder='0,00'
              />
            </div>
          </div>

          <div className='flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl'>
            <button
              onClick={() => onApportionMethodChange('fixed')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${apportionMethod === 'fixed' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Building2 size={18} /> Por Unidade
            </button>
            <button
              onClick={() => onApportionMethodChange('people')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${apportionMethod === 'people' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Users size={18} /> Por Pessoa
            </button>
          </div>

          <div>
            <div className='flex justify-between items-center mb-3'>
              <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
                Unidades Participantes
              </label>
              <span className='text-xs font-medium text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md'>
                {selectedUnitsIds.length} selecionadas
              </span>
            </div>
            <div className='max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar'>
              {mockUnits.map((unit) => {
                const isSelected = selectedUnitsIds.includes(unit.id);
                return (
                  <div
                    key={unit.id}
                    onClick={() => onToggleUnit(unit.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/30' : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 bg-white dark:bg-black/20'}`}
                      >
                        {isSelected && <Check size={14} className='text-white' />}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-400'}`}
                        >
                          {unit.name}
                        </p>
                        <p className='text-[10px] text-slate-500'>
                          {unit.residentsCount} moradores • {unit.isOccupied ? 'Ocupado' : 'Vago'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='pt-2'>
            <button
              onClick={onCalculate}
              className='w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2'
            >
              <Calculator size={20} /> Calcular Divisão
            </button>
          </div>

          {apportionResult && (
            <div className='animate-slideUp border-t border-gray-200 dark:border-white/10 pt-6'>
              <h3 className='font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2'>
                <CheckCircle size={18} className='text-emerald-500' /> Resultado do Rateio
              </h3>
              <div className='space-y-3 mb-4'>
                {apportionResult.distribution.map((item) => (
                  <div
                    key={item.id}
                    className='flex justify-between items-center p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm'
                  >
                    <div>
                      <p className='font-bold text-sm text-slate-800 dark:text-slate-200'>
                        {item.name}
                      </p>
                      <p className='text-xs text-slate-400'>
                        {item.note ||
                          (apportionMethod === 'people'
                            ? `${item.residentsCount} pessoas`
                            : 'Cota Fixa')}
                      </p>
                    </div>
                    <span className='font-bold text-lg text-primary'>
                      R$ {item.share.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              {apportionResult.ownerTotal > 0 && (
                <div className='p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <span className='text-sm font-bold text-orange-800 dark:text-orange-300 block'>
                        Custo Proprietário
                      </span>
                      <span className='text-xs text-orange-600/80 dark:text-orange-400/70'>
                        Unidades vagas ou isentas
                      </span>
                    </div>
                    <span className='font-bold text-lg text-orange-600 dark:text-orange-400'>
                      R$ {apportionResult.ownerTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
