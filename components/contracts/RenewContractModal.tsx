import React, { useState } from 'react';
import {
  FileText,
  User,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Contract } from '../../types';

interface RenewContractModalProps {
  contract: Contract;
  onClose: () => void;
  onConfirm: (data: { newEndDate: string; newValue: string; observations: string }) => void;
}

export const RenewContractModal: React.FC<RenewContractModalProps> = ({
  contract,
  onClose,
  onConfirm,
}) => {
  const [newEndDate, setNewEndDate] = useState('');
  const [newValue, setNewValue] = useState(contract.value);
  const [observations, setObservations] = useState('');

  const handleConfirm = () => {
    if (!newEndDate) return;
    onConfirm({ newEndDate, newValue, observations });
  };

  return (
    <ModalWrapper
      onClose={onClose}
      title='Renovação de Contrato'
      className='md:max-w-xl'
    >
      <div className='flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden'>
        <div className='flex-1 overflow-y-auto p-6 space-y-8'>
          
          {/* Section 1: CONTRATO ATUAL */}
          <section>
            <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2'>
              <FileText size={14} /> Contrato Atual
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <label className='text-xs font-bold text-slate-500'>Nº do Contrato</label>
                <div className='px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 cursor-not-allowed'>
                  {contract.contract_number}
                </div>
              </div>
              <div className='space-y-1'>
                <label className='text-xs font-bold text-slate-500'>Inquilino</label>
                <div className='px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 cursor-not-allowed'>
                  {contract.tenant_name}
                </div>
              </div>
              <div className='md:col-span-2 space-y-1'>
                <label className='text-xs font-bold text-slate-500'>Imóvel</label>
                <div className='px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 cursor-not-allowed truncate'>
                  {contract.property}
                </div>
              </div>
              <div className='space-y-1'>
                <label className='text-xs font-bold text-slate-500'>Data de Início</label>
                <div className='px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 cursor-not-allowed'>
                  {new Date(contract.start_date).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className='space-y-1'>
                <label className='text-xs font-bold text-slate-500'>Término Original</label>
                <div className='px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 cursor-not-allowed'>
                  {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </section>

          <hr className='border-slate-100 dark:border-white/5' />

          {/* Section 2: RENOVAÇÃO */}
          <section className='space-y-6'>
            <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2'>
              <RefreshCw size={14} /> Renovação
            </h3>
            
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <label className='text-xs font-bold text-slate-700 dark:text-slate-300'>Nova Data de Término*</label>
                  <div className='relative'>
                    <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
                    <input
                      type='date'
                      required
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className='w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all'
                    />
                  </div>
                </div>
                <div className='space-y-1'>
                  <label className='text-xs font-bold text-slate-700 dark:text-slate-300'>Novo Valor Mensal</label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs'>R$</span>
                    <input
                      type='text'
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className='w-full pl-9 pr-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all'
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-1'>
                <label className='text-xs font-bold text-slate-700 dark:text-slate-300'>Observações (Opcional)</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className='w-full h-24 px-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none leading-relaxed'
                  placeholder='Ex: Ajuste anual conforme IPCA...'
                />
              </div>

              <div className='flex items-start gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5'>
                <AlertCircle size={14} className='text-slate-400 mt-0.5 shrink-0' />
                <p className='text-[10px] font-medium text-slate-500 leading-normal'>
                  A renovação criará um novo contrato vinculado ao atual. O contrato original será mantido no histórico como "Encerrado".
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className='flex-none p-6 pt-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-white/5'>
          <button
            onClick={handleConfirm}
            disabled={!newEndDate}
            className='w-full h-14 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Confirmar Renovação
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};