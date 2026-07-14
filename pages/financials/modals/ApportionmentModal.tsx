import React from 'react';
import { Building2, Users, Check, Calculator, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 border border-white/10 rounded-[22px]' style={{ background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
        <div aria-hidden='true' className='absolute inset-0 overflow-hidden pointer-events-none' style={{ borderRadius: 'inherit' }}>
          <div className='absolute w-[50vw] h-[50vw] top-[-20%] left-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-1), transparent 70%)', filter: 'blur(90px)' }} />
          <div className='absolute w-[42vw] h-[42vw] bottom-[-20%] right-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-2), transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className='relative z-10'>
        <DialogHeader className='px-6 py-4 border-b border-white/10 flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Rateio de Despesas</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='p-6'>
          <div className='space-y-6'>
            <p className='text-sm text-slate-400 bg-white/5 p-3 rounded-xl border border-white/10'>
              Divida contas únicas (Água, Luz) proporcionalmente entre as unidades selecionadas.
            </p>

            <div>
              <label className='text-sm font-bold text-slate-300 mb-2 block'>
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
                  className='w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-2xl font-bold text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-slate-500'
                  placeholder='0,00'
                />
              </div>
            </div>

            <div className='flex bg-white/10 p-1 rounded-xl border border-white/10'>
              <button
                onClick={() => onApportionMethodChange('fixed')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${apportionMethod === 'fixed' ? 'bg-white/20 text-primary shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <Building2 size={18} strokeWidth={1.8} /> Por Unidade
              </button>
              <button
                onClick={() => onApportionMethodChange('people')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${apportionMethod === 'people' ? 'bg-white/20 text-primary shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <Users size={18} strokeWidth={1.8} /> Por Pessoa
              </button>
            </div>

            <div>
              <div className='flex justify-between items-center mb-3'>
                <label className='text-sm font-bold text-slate-300'>
                  Unidades Participantes
                </label>
                <span className='text-xs font-medium text-slate-400 bg-white/10 px-2 py-1 rounded-md'>
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
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-900/10 border-indigo-900/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 bg-black/20'}`}
                        >
                          {isSelected && <Check size={14} strokeWidth={1.8} className='text-white' />}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}
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
                className='w-full rounded-full text-white font-semibold bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] hover:brightness-110 active:scale-[0.98] transition-all py-4 flex items-center justify-center gap-2 font-bold'
              >
                <Calculator size={20} strokeWidth={1.8} /> Calcular Divisão
              </button>
            </div>

            {apportionResult && (
              <div className='animate-slideUp border-t border-white/10 pt-6'>
                <h3 className='font-bold text-white mb-4 flex items-center gap-2'>
                  <CheckCircle size={18} strokeWidth={1.8} className='text-emerald-400' /> Resultado do Rateio
                </h3>
                <div className='space-y-3 mb-4'>
                  {apportionResult.distribution.map((item) => (
                    <div
                      key={item.id}
                      className='flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-xl'
                    >
                      <div>
                        <p className='font-bold text-sm text-slate-200'>
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
                  <div className='p-4 bg-orange-900/20 rounded-xl border border-orange-800'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <span className='text-sm font-bold text-orange-300 block'>
                          Custo Proprietário
                        </span>
                        <span className='text-xs text-orange-400/70'>
                          Unidades vagas ou isentas
                        </span>
                      </div>
                      <span className='font-bold text-lg text-orange-400'>
                        R$ {apportionResult.ownerTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
