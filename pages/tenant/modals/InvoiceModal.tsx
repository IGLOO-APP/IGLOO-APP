import React from 'react';
import { Download, X, CheckCircle, Copy } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface InvoiceModalProps {
  show: boolean;
  onClose: () => void;
  monthlyValue: number | undefined;
  paymentDay: number | undefined;
  invoiceCopied: boolean;
  onCopyBarcode: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  onClose,
  monthlyValue,
  paymentDay,
  invoiceCopied,
  onCopyBarcode,
}) => {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-3xl'
        showCloseButton={false}
      >
        <div className='flex flex-col h-full bg-background-light dark:bg-background-dark'>
          <div className='flex items-center justify-between px-4 md:px-6 pt-2 pb-2 md:pb-4 shrink-0'>
            <h2 className='text-xl font-bold text-slate-900 dark:text-white'>Detalhes do Boleto</h2>
            <div className='flex items-center gap-2'>
              <button
                className='flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors'
                title='Baixar PDF'
              >
                <Download size={20} />
              </button>
              <button
                onClick={onClose}
                className='flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors ml-2'
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className='flex-1 overflow-y-auto px-4 md:px-6 bg-background-light dark:bg-background-dark scroll-smooth pb-8'>
            <div className='bg-white dark:bg-surface-dark border border-slate-400 dark:border-gray-600 font-sans text-slate-900 dark:text-white mb-4'>
              <div className='flex items-center border-b border-slate-400 dark:border-gray-600 px-3 py-2 gap-4'>
                <div className='flex items-center gap-3 px-2 border-r-2 border-slate-400 dark:border-gray-500 pr-4'>
                  <div className='w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs shrink-0'>
                    341
                  </div>
                  <span className='font-bold text-xl'>341-7</span>
                </div>
                <div className='flex-1 text-right font-mono text-xs md:text-sm font-bold tracking-wider text-slate-700 dark:text-slate-200 truncate'>
                  34191.79001 01043.510047 91020.150008 5 89230000015000
                </div>
              </div>
              <div className='p-4 text-center'>
                <p className='font-bold text-lg mb-2'>
                  R$ {monthlyValue?.toLocaleString('pt-BR') || '0,00'}
                </p>
                <p className='text-sm text-slate-500'>
                  Vencimento: {paymentDay?.toString().padStart(2, '0')}/
                  {new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
          <div className='flex-none p-4 md:p-6 pt-2 bg-background-light dark:bg-background-dark border-t border-transparent z-20'>
            <button
              onClick={onCopyBarcode}
              className='w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 dark:shadow-none whitespace-nowrap'
            >
              {invoiceCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
              {invoiceCopied ? 'Código Copiado!' : 'Copiar Código de Barras'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
