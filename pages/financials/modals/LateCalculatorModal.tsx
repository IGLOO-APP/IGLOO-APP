import React from 'react';
import { ModalWrapper } from '../../../components/ui/ModalWrapper';

import type { LateFeeResult } from '../../../types';

interface LateCalculatorModalProps {
  show: boolean;
  onClose: () => void;
  lateOriginalValue: string;
  onLateOriginalValueChange: (v: string) => void;
  lateDueDate: string;
  onLateDueDateChange: (v: string) => void;
  lateResult: LateFeeResult | null;
  onCalculate: () => void;
}

export const LateCalculatorModal: React.FC<LateCalculatorModalProps> = ({
  show,
  onClose,
  lateOriginalValue,
  onLateOriginalValueChange,
  lateDueDate,
  onLateDueDateChange,
  lateResult,
  onCalculate,
}) => {
  if (!show) return null;

  return (
    <ModalWrapper onClose={onClose} title='Calculadora de Atraso' showCloseButton={true}>
      <div className='p-6 bg-background-light dark:bg-background-dark h-full overflow-y-auto'>
        <div className='space-y-4'>
          <div className='bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800'>
            <p className='text-xs text-orange-800 dark:text-orange-300 font-medium'>
              Cálculo automático de Multa (10%) e Juros (1% a.m pro rata).
            </p>
          </div>

          <div>
            <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
              Valor Original
            </label>
            <input
              type='number'
              value={lateOriginalValue}
              onChange={(e) => onLateOriginalValueChange(e.target.value)}
              className='w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none'
              placeholder='0,00'
            />
          </div>
          <div>
            <label className='text-sm font-bold text-slate-700 dark:text-slate-300'>
              Data de Vencimento
            </label>
            <input
              type='date'
              value={lateDueDate}
              onChange={(e) => onLateDueDateChange(e.target.value)}
              className='w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none dark:text-white'
            />
          </div>
          <button
            onClick={onCalculate}
            className='w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95'
          >
            Calcular
          </button>

          {lateResult && (
            <div className='mt-6 space-y-3 animate-slideUp'>
              <div className='flex justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg'>
                <span className='text-slate-500 text-sm'>Dias de Atraso</span>
                <span className='font-bold dark:text-white'>{lateResult.diasAtraso} dias</span>
              </div>
              <div className='flex justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg'>
                <span className='text-slate-500 text-sm'>Multa (10%)</span>
                <span className='font-bold text-red-500'>R$ {lateResult.valorMulta}</span>
              </div>
              <div className='flex justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-lg'>
                <span className='text-slate-500 text-sm'>Juros (1% a.m)</span>
                <span className='font-bold text-red-500'>R$ {lateResult.valorJuros}</span>
              </div>
              <div className='flex justify-between p-4 bg-slate-900 dark:bg-white rounded-xl text-white dark:text-slate-900 items-center'>
                <span className='font-bold'>Total Atualizado</span>
                <span className='text-xl font-extrabold'>R$ {lateResult.totalPagar}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
