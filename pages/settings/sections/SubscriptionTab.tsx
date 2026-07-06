import React from 'react';
import { Loader2, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { Subscription, Plan } from '../../../types';

interface SubscriptionTabProps {
  loadingSub: boolean;
  subscription: Subscription | null;
  currentPlanDetails: Plan | undefined;
  invoices: any[];
  onOpenPlanModal: () => void;
  onLoadSubscription: () => void;
  onCancelSubscription?: () => void;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({
  loadingSub,
  subscription,
  currentPlanDetails,
  invoices,
  onOpenPlanModal,
  onLoadSubscription,
  onCancelSubscription,
}) => {
  if (loadingSub)
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='animate-spin text-primary' size={32} />
      </div>
    );
  if (!subscription || !currentPlanDetails) {
    return (
      <div className='p-10 flex flex-col items-center justify-center text-center'>
        <AlertTriangle className='text-amber-500 mb-4' size={40} />
        <h3 className='text-lg font-bold text-slate-900 dark:text-white'>
          Erro ao carregar assinatura
        </h3>
        <p className='text-slate-500 mt-2 mb-6'>
          Não foi possível carregar os detalhes do plano. Tente novamente.
        </p>
        <button
          onClick={onLoadSubscription}
          className='px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold shadow-lg'
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className='animate-fadeIn space-y-6 max-w-4xl'>
      <div className='bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden'>
        <div className='p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6'>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <span className='text-sm font-bold text-slate-500 uppercase tracking-wider'>
                Plano Atual
              </span>
              {subscription.status === 'active' && (
                <span className='bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase'>
                  Ativo
                </span>
              )}
              {subscription.status === 'trialing' && (
                <span className='bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase'>
                  Período de Teste
                </span>
              )}
            </div>
            <h2 className='text-3xl font-black text-slate-900 dark:text-white mb-2'>
              {currentPlanDetails.name}
            </h2>
            <p className='text-slate-500 dark:text-slate-400 max-w-md text-sm'>
              {currentPlanDetails.description}
            </p>
            <div className='mt-6 flex flex-col gap-1'>
              <p className='text-sm font-bold text-slate-900 dark:text-white'>
                R$ {subscription.amount.toFixed(2)}{' '}
                <span className='text-slate-400 font-normal'>
                  /{' '}
                  {subscription.billingCycle === 'monthly'
                    ? 'mês'
                    : subscription.billingCycle === 'semiannual'
                      ? 'semestre'
                      : 'ano'}
                </span>
              </p>
              <p className='text-xs text-slate-500'>
                {subscription.trialEndsAt
                  ? `Teste gratuito até ${new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}`
                  : `Próxima cobrança em ${new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}`}
              </p>
            </div>
          </div>
          <div className='flex flex-col justify-center gap-3 min-w-[200px]'>
            <button
              onClick={onOpenPlanModal}
              className='w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95'
            >
              Alterar Plano
            </button>
            <button
              onClick={onCancelSubscription}
              className='w-full py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors'
            >
              Cancelar Assinatura
            </button>
          </div>
        </div>
        <div className='bg-slate-50 dark:bg-black/20 p-6 border-t border-gray-200 dark:border-white/5'>
          <h4 className='text-xs font-bold text-slate-500 uppercase mb-4'>Uso do Plano</h4>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[
              {
                label: 'Imóveis',
                used: subscription.usage.properties,
                limit: currentPlanDetails.limits.properties,
                color: 'bg-primary',
              },
              {
                label: 'Inquilinos',
                used: subscription.usage.tenants,
                limit: currentPlanDetails.limits.tenants,
                color: 'bg-indigo-500',
              },
              {
                label: 'Armazenamento',
                used: subscription.usage.storage_used_gb,
                limit: currentPlanDetails.limits.storage_gb,
                suffix: ' GB',
                color: 'bg-emerald-500',
              },
            ].map((item) => (
              <div key={item.label}>
                <div className='flex justify-between text-xs mb-2 font-bold text-slate-700 dark:text-slate-300'>
                  <span>{item.label}</span>
                  <span>
                    {item.limit === -1
                      ? item.used
                      : `${item.used} / ${item.limit}${item.suffix || ''}`}
                  </span>
                </div>
                <div className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.limit === -1 ? 5 : (item.used / item.limit) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='grid md:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm'>
          <h3 className='font-bold text-slate-900 dark:text-white mb-4'>Método de Pagamento</h3>
          {subscription.paymentMethod ? (
            <div className='flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-black/20'>
              <div className='flex items-center gap-3'>
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
                <div>
                  <p className='text-sm font-bold text-slate-900 dark:text-white capitalize'>
                    {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                  </p>
                  <p className='text-xs text-slate-500'>Padrão</p>
                </div>
              </div>
              <button className='text-xs font-bold text-primary hover:underline'>Alterar</button>
            </div>
          ) : (
            <div className='text-sm text-slate-500'>Nenhum método salvo.</div>
          )}
        </div>
        <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-bold text-slate-900 dark:text-white'>Histórico de Faturas</h3>
            <button className='text-xs font-bold text-primary hover:underline'>Ver tudo</button>
          </div>
          <div className='space-y-3'>
            {invoices.length > 0 ? (
              invoices.slice(0, 3).map((inv: any) => (
                <div
                  key={inv.id}
                  className='flex items-center justify-between text-sm p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors'
                >
                  <div className='flex items-center gap-3'>
                    <div className='p-1.5 bg-emerald-100 text-emerald-600 rounded-md'>
                      <CheckCircle size={14} />
                    </div>
                    <div>
                      <p className='font-bold text-slate-700 dark:text-slate-200'>
                        {new Date(inv.date).toLocaleDateString()}
                      </p>
                      <p className='text-xs text-slate-500'>{inv.number}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='font-bold text-slate-900 dark:text-white'>
                      R$ {inv.amount.toFixed(2)}
                    </span>
                    <button className='text-slate-400 hover:text-primary'>
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-sm text-slate-500 text-center py-4'>
                Nenhuma fatura gerada ainda.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
