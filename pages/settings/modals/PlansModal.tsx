import React from 'react';
import { Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plan, BillingCycle, PlanTier } from '../../../types';

interface PlansModalProps {
  show: boolean;
  onClose: () => void;
  plans: Plan[];
  subscription: any;
  selectedBillingCycle: BillingCycle;
  onBillingCycleChange: (c: BillingCycle) => void;
  onSelectPlan: (planId: PlanTier) => void;
  onCalculateTotal: (planId: PlanTier, cycle: BillingCycle) => any;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  show,
  onClose,
  plans,
  subscription,
  selectedBillingCycle,
  onBillingCycleChange,
  onSelectPlan,
  onCalculateTotal,
}) => {
  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-6xl'>
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Planos e Preços</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='flex flex-col h-[85vh] bg-slate-50 dark:bg-black/20'>
          <div className='p-6 text-center shrink-0'>
            <div className='inline-flex bg-white dark:bg-surface-dark p-1 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 mb-6'>
              {(['monthly', 'semiannual', 'annual'] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => onBillingCycleChange(cycle)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedBillingCycle === cycle ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {cycle === 'monthly'
                    ? 'Mensal'
                    : cycle === 'semiannual'
                      ? 'Semestral (-10%)'
                      : 'Anual (-20%)'}
                </button>
              ))}
            </div>
          </div>
          <div className='flex-1 overflow-y-auto px-6 pb-8'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
              {plans
                .filter((p) => p.id !== 'free')
                .map((plan) => {
                  const pricing = onCalculateTotal(plan.id as PlanTier, selectedBillingCycle);
                  const isCurrent = subscription?.planId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all ${plan.highlight ? 'bg-white dark:bg-surface-dark border-indigo-500 shadow-xl scale-105 z-10' : 'bg-white/50 dark:bg-surface-dark/50 border-gray-200 dark:border-white/5 hover:border-indigo-200'}`}
                    >
                      {plan.highlight && (
                        <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg'>
                          Mais Popular
                        </div>
                      )}
                      <div className='mb-6'>
                        <h3 className='text-xl font-black text-slate-900 dark:text-white'>
                          {plan.name}
                        </h3>
                        <p className='text-sm text-slate-500 mt-2 h-10'>{plan.description}</p>
                      </div>
                      <div className='mb-6'>
                        <p className='flex items-baseline gap-1'>
                          <span className='text-3xl font-black text-slate-900 dark:text-white'>
                            R$ {pricing.pricePerMonth.toFixed(2)}
                          </span>
                          <span className='text-slate-500 text-sm font-medium'>/mês</span>
                        </p>
                        <p className='text-xs text-slate-400 mt-1'>
                          Cobrado{' '}
                          {selectedBillingCycle === 'monthly'
                            ? 'mensalmente'
                            : selectedBillingCycle === 'semiannual'
                              ? `R$ ${pricing.totalBilled.toFixed(2)} a cada 6 meses`
                              : `R$ ${pricing.totalBilled.toFixed(2)} anualmente`}
                        </p>
                        {pricing.savings > 0 && (
                          <span className='inline-block mt-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded'>
                            Economize R$ {pricing.savings.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className='flex-1 space-y-3 mb-8'>
                        {plan.features.map((feat, i) => (
                          <div
                            key={i}
                            className={`flex items-start gap-2 text-sm ${feat.included ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 line-through decoration-slate-300'}`}
                          >
                            {feat.included ? (
                              <Check size={16} className='text-emerald-500 shrink-0 mt-0.5' />
                            ) : (
                              <X size={16} className='text-slate-300 shrink-0 mt-0.5' />
                            )}
                            <span className='leading-tight'>{feat.text}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => !isCurrent && onSelectPlan(plan.id as PlanTier)}
                        disabled={isCurrent}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${isCurrent ? 'bg-slate-100 dark:bg-white/10 text-slate-400 cursor-default' : plan.highlight ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 active:scale-95' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-lg active:scale-95'}`}
                      >
                        {isCurrent ? 'Plano Atual' : 'Selecionar Plano'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
