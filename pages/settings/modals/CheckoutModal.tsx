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
        <div className='p-6 bg-muted/50'>
          {checkoutStep === 'summary' && (
            <div className='space-y-6 animate-fadeIn'>
              <div className='bg-card p-4 rounded-2xl border border-border'>
                <h3 className='font-bold text-foreground flex justify-between items-center'>
                  <span>Plano {checkoutPlanDetails.name}</span>
                  <span className='bg-primary/10 text-primary text-[10px] uppercase px-2 py-1 rounded'>
                    {selectedBillingCycle === 'annual'
                      ? 'Anual'
                      : selectedBillingCycle === 'semiannual'
                        ? 'Semestral'
                        : 'Mensal'}
                  </span>
                </h3>
                <div className='mt-4 space-y-2 text-sm'>
                  <div className='flex justify-between text-muted-foreground'>
                    <span>Preço do Plano</span>
                    <span>R$ {checkoutTotals.totalBilled.toFixed(2)}</span>
                  </div>
                  {checkoutTotals.savings > 0 && (
                    <div className='flex justify-between text-emerald-600 font-bold'>
                      <span>Desconto Aplicado</span>
                      <span>- R$ {checkoutTotals.savings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className='border-t border-border pt-2 flex justify-between text-lg font-black text-foreground'>
                    <span>Total Hoje</span>
                    <span>R$ {checkoutTotals.totalBilled.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className='space-y-3'>
                <h4 className='text-sm font-bold text-foreground/80'>
                  Método de Pagamento
                </h4>
                {subscription?.paymentMethod ? (
                  <div className='flex items-center gap-3 p-3 border border-border rounded-xl bg-card'>
                    <div className='p-1.5 bg-background rounded-lg shadow-sm text-foreground/80'>
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
                    <span className='text-sm font-bold text-foreground capitalize'>
                      {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                    </span>
                  </div>
                ) : (
                  <button className='w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-bold text-muted-foreground flex items-center justify-center gap-2 hover:bg-muted'>
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
              <h3 className='text-xl font-bold text-foreground'>
                Processando pagamento...
              </h3>
              <p className='text-muted-foreground text-sm mt-2'>Por favor, não feche esta janela.</p>
            </div>
          )}
          {checkoutStep === 'success' && (
            <div className='py-10 flex flex-col items-center justify-center text-center animate-scaleUp'>
              <div className='w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6'>
                <CheckCircle size={40} />
              </div>
              <h3 className='text-2xl font-black text-foreground'>Parabéns!</h3>
              <p className='text-muted-foreground max-w-xs mx-auto mt-2 mb-8'>
                Sua assinatura do plano <strong>{checkoutPlanDetails.name}</strong> foi confirmada.
                Você já tem acesso a todos os recursos.
              </p>
              <button
                onClick={onClose}
                className='px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg active:scale-95 transition-all'
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
