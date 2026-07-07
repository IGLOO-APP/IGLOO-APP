import React from 'react';
import { Plus, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plan, BillingCycle } from '../../../types';

interface CheckoutModalProps {
  show: boolean;
  onClose: () => void;
  checkoutPlanDetails: Plan | undefined;
  checkoutStep: 'summary' | 'payment' | 'processing' | 'success';
  selectedBillingCycle: BillingCycle;
  checkoutTotals: { totalBilled: number; savings: number; pricePerMonth: number };
  subscription: any;
  onProcess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  show,
  onClose,
  checkoutPlanDetails,
  checkoutStep,
  selectedBillingCycle,
  checkoutTotals,
  subscription,
  onProcess,
}) => {
  if (!checkoutPlanDetails) return null;

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-lg'>
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Finalizar Assinatura</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='p-6 bg-background-light dark:bg-background-dark'>
          {checkoutStep === 'summary' && (
            <div className='space-y-6 animate-fadeIn'>
              <div className='bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10'>
                <h3 className='font-bold text-slate-900 dark:text-white flex justify-between items-center'>
                  <span>Plano {checkoutPlanDetails.name}</span>
                  <span className='bg-indigo-100 text-indigo-700 text-[10px] uppercase px-2 py-1 rounded'>
                    {selectedBillingCycle === 'annual'
                      ? 'Anual'
                      : selectedBillingCycle === 'semiannual'
                        ? 'Semestral'
                        : 'Mensal'}
                  </span>
                </h3>
                <div className='mt-4 space-y-2 text-sm'>
                  <div className='flex justify-between text-slate-600 dark:text-slate-400'>
                    <span>Preço do Plano</span>
                    <span>R$ {checkoutTotals.totalBilled.toFixed(2)}</span>
                  </div>
                  {checkoutTotals.savings > 0 && (
                    <div className='flex justify-between text-emerald-600 font-bold'>
                      <span>Desconto Aplicado</span>
                      <span>- R$ {checkoutTotals.savings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className='border-t border-gray-200 dark:border-white/10 pt-2 flex justify-between text-lg font-black text-slate-900 dark:text-white'>
                    <span>Total Hoje</span>
                    <span>R$ {checkoutTotals.totalBilled.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className='space-y-3'>
                <h4 className='text-sm font-bold text-slate-700 dark:text-slate-300'>
                  Método de Pagamento
                </h4>
                {subscription?.paymentMethod ? (
                  <div className='flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark'>
                    <div className='p-1.5 bg-white dark:bg-white/10 rounded-lg shadow-sm text-slate-600 dark:text-slate-300'>
                      <svg
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <rect x='1' y='4' width='22' height='16' rx='2' />
                        <line x1='1' y1='10' x2='23' y2='10' />
                      </svg>
                    </div>
                    <span className='text-sm font-bold text-slate-900 dark:text-white capitalize'>
                      {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                    </span>
                  </div>
                ) : (
                  <button className='w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5'>
                    <Plus size={16} /> Adicionar Cartão
                  </button>
                )}
              </div>
              <button
                onClick={onProcess}
                className='w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2'
              >
                Confirmar e Assinar <ArrowRight size={20} />
              </button>
            </div>
          )}
          {checkoutStep === 'processing' && (
            <div className='py-20 flex flex-col items-center justify-center text-center animate-fadeIn'>
              <Loader2 size={48} className='text-primary animate-spin mb-4' />
              <h3 className='text-xl font-bold text-slate-900 dark:text-white'>
                Processando pagamento...
              </h3>
              <p className='text-slate-500 text-sm mt-2'>Por favor, não feche esta janela.</p>
            </div>
          )}
          {checkoutStep === 'success' && (
            <div className='py-10 flex flex-col items-center justify-center text-center animate-scaleUp'>
              <div className='w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6'>
                <CheckCircle size={40} />
              </div>
              <h3 className='text-2xl font-black text-slate-900 dark:text-white'>Parabéns!</h3>
              <p className='text-slate-500 max-w-xs mx-auto mt-2 mb-8'>
                Sua assinatura do plano <strong>{checkoutPlanDetails.name}</strong> foi confirmada.
                Você já tem acesso a todos os recursos.
              </p>
              <button
                onClick={onClose}
                className='px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg active:scale-95 transition-all'
              >
                Continuar para o Dashboard
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
