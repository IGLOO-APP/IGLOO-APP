import React from 'react';
import { CreditCard, CheckCircle, Loader } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CreditCardModalProps {
  show: boolean;
  onClose: () => void;
  processingPayment: boolean;
  paymentSuccess: boolean;
  onCardPayment: (e: React.FormEvent) => void;
}

export const CreditCardModal: React.FC<CreditCardModalProps> = ({
  onClose,
  processingPayment,
  paymentSuccess,
  onCardPayment,
}) => {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0'>
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Pagar com Cartão</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden'>
          <div className='flex-1 overflow-y-auto p-6 space-y-6'>
            {paymentSuccess ? (
              <div className='flex flex-col items-center justify-center h-full text-center space-y-4 py-10 animate-scaleUp'>
                <div className='w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-2'>
                  <CheckCircle size={40} />
                </div>
                <h3 className='text-2xl font-bold text-slate-900 dark:text-white'>
                  Pagamento Confirmado!
                </h3>
              </div>
            ) : (
              <form id='card-form' onSubmit={onCardPayment} className='space-y-6 animate-fadeIn'>
                <div className='w-full aspect-[1.586] rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between'>
                  <CreditCard size={24} className='opacity-80' />
                  <p className='font-mono text-xl tracking-wider'>•••• •••• •••• ••••</p>
                </div>
                <div className='p-4 text-center text-sm text-slate-500'>
                  Formulário de cartão simulado. Clique em Pagar.
                </div>
              </form>
            )}
          </div>
          {!paymentSuccess && (
            <div className='p-6 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/5 z-20'>
              <button
                form='card-form'
                type='submit'
                disabled={processingPayment}
                className='w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]'
              >
                {processingPayment ? (
                  <Loader className='animate-spin' size={24} />
                ) : (
                  <>
                    <CreditCard size={24} /> Pagar Agora
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
