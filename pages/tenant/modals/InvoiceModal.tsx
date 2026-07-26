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
  show,
  onClose,
  monthlyValue,
  paymentDay,
  invoiceCopied,
  onCopyBarcode,
}) => {
  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className='max-h-[90vh] p-0 gap-0 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg md:max-w-3xl lg-card flex flex-col overflow-hidden'
        showCloseButton={false}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 md:px-6 md:py-4 shrink-0'>
          <h2 className='text-lg font-bold text-slate-900 dark:text-white'>Detalhes do Boleto</h2>
          <div className='flex items-center gap-2'>
            <button
              className='flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors'
              title='Baixar PDF'
            >
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className='flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors'
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-4 md:px-6 pb-4'>
          <div className='lg-card font-sans mb-4'>
            {/* Bank header row — wraps gracefully on tiny screens */}
            <div className='flex flex-wrap items-start gap-3 border-b border-slate-300 dark:border-gray-600 px-3 py-3'>
              <div className='flex items-center gap-2 shrink-0'>
                <div className='w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-[10px] shrink-0'>
                  341
                </div>
                <span className='font-bold text-base whitespace-nowrap'>341-7</span>
              </div>
              <div className='flex-1 min-w-0 font-mono text-[9px] sm:text-[10px] md:text-xs font-bold tracking-wider text-slate-700 dark:text-slate-200 break-all leading-relaxed'>
                34191.79001 01043.510047 91020.150008 5 89230000015000
              </div>
            </div>
            <div className='p-4 text-center'>
              <p className='font-bold text-xl mb-1'>
                R$ {monthlyValue?.toLocaleString('pt-BR') || '0,00'}
              </p>
              <p className='text-sm text-slate-500'>
                Vencimento: {paymentDay?.toString().padStart(2, '0')}/
                {new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer — pinned to bottom */}
        <div className='flex-none px-4 pb-5 pt-3 md:px-6 border-t border-white/10'>
          <button
            onClick={onCopyBarcode}
            className='w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 dark:shadow-none'
          >
            {invoiceCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
            {invoiceCopied ? 'Código Copiado!' : 'Copiar Código de Barras'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
