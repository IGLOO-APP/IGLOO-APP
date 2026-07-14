import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 border border-white/10 rounded-[22px]' style={{ background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
        <div aria-hidden='true' className='absolute inset-0 overflow-hidden pointer-events-none' style={{ borderRadius: 'inherit' }}>
          <div className='absolute w-[50vw] h-[50vw] top-[-20%] left-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-1), transparent 70%)', filter: 'blur(90px)' }} />
          <div className='absolute w-[42vw] h-[42vw] bottom-[-20%] right-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-2), transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className='relative z-10'>
        <DialogHeader className='px-6 py-4 border-b border-white/10 flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Calculadora de Atraso</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='p-6'>
          <div className='space-y-4'>
            <div className='bg-orange-900/20 p-4 rounded-xl border border-orange-800'>
              <p className='text-xs text-orange-300 font-medium'>
                Cálculo automático de Multa (10%) e Juros (1% a.m pro rata).
              </p>
            </div>

            <div>
              <label className='text-sm font-bold text-slate-300'>
                Valor Original
              </label>
              <input
                type='number'
                value={lateOriginalValue}
                onChange={(e) => onLateOriginalValueChange(e.target.value)}
                className='w-full mt-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-primary outline-none text-white placeholder-slate-500'
                placeholder='0,00'
              />
            </div>
            <div>
              <label className='text-sm font-bold text-slate-300'>
                Data de Vencimento
              </label>
              <input
                type='date'
                value={lateDueDate}
                onChange={(e) => onLateDueDateChange(e.target.value)}
                className='w-full mt-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-primary outline-none text-white'
              />
            </div>
            <button
              onClick={onCalculate}
              className='w-full rounded-full text-white font-semibold bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] hover:brightness-110 active:scale-95 transition-all py-3 font-bold'
            >
              Calcular
            </button>

            {lateResult && (
              <div className='mt-6 space-y-3 animate-slideUp'>
                <div className='flex justify-between p-3 bg-white/5 rounded-lg border border-white/10'>
                  <span className='text-slate-400 text-sm'>Dias de Atraso</span>
                  <span className='font-bold text-white'>{lateResult.diasAtraso} dias</span>
                </div>
                <div className='flex justify-between p-3 bg-white/5 rounded-lg border border-white/10'>
                  <span className='text-slate-400 text-sm'>Multa (10%)</span>
                  <span className='font-bold text-red-400'>R$ {lateResult.valorMulta}</span>
                </div>
                <div className='flex justify-between p-3 bg-white/5 rounded-lg border border-white/10'>
                  <span className='text-slate-400 text-sm'>Juros (1% a.m)</span>
                  <span className='font-bold text-red-400'>R$ {lateResult.valorJuros}</span>
                </div>
                <div className='flex justify-between p-4 rounded-xl items-center bg-white/20 border border-white/20'>
                  <span className='font-bold text-white'>Total Atualizado</span>
                  <span className='text-xl font-extrabold text-white'>R$ {lateResult.totalPagar}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
