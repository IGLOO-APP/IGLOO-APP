import React from 'react';
import {
  CreditCard,
  CheckCircle,
  ArrowRight,
  QrCode,
  Barcode,
  Settings,
  ToggleRight,
  ToggleLeft,
} from 'lucide-react';
import { PaymentMethodConfig } from '../hooks/useSettings';

const iconMap: Record<string, any> = { QrCode, Barcode, CreditCard };

interface FinancialTabProps {
  paymentMethods: PaymentMethodConfig[];
  onToggleMethod: (id: string) => void;
  onUpdateField: (methodId: string, field: string, value: string) => void;
  expandedMethodId: string | null;
  onExpandedChange: (id: string | null) => void;
  stripeConnected: boolean;
  onConnectStripe: () => void;
}

const renderPaymentFields = (
  method: PaymentMethodConfig,
  onUpdateField: (methodId: string, field: string, value: string) => void
) => {
  if (method.id === 'pix') {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl animate-fadeIn'>
        <div>
          <label className='text-xs font-bold text-slate-500 uppercase mb-1 block'>
            Tipo de Chave
          </label>
          <select
            value={method.fields.type}
            onChange={(e) => onUpdateField(method.id, 'type', e.target.value)}
            className='w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white'
          >
            <option value='CPF'>CPF</option>
            <option value='CNPJ'>CNPJ</option>
            <option value='Email'>E-mail</option>
            <option value='Phone'>Telefone</option>
            <option value='Random'>Aleatória</option>
          </select>
        </div>
        <div>
          <label className='text-xs font-bold text-slate-500 uppercase mb-1 block'>Chave Pix</label>
          <input
            value={method.fields.key}
            onChange={(e) => onUpdateField(method.id, 'key', e.target.value)}
            className='w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white font-mono'
            placeholder='Insira sua chave'
          />
        </div>
      </div>
    );
  }
  if (method.id === 'boleto') {
    return (
      <div className='grid grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl animate-fadeIn'>
        <div>
          <label className='text-xs font-bold text-slate-500 uppercase mb-1 block'>Banco</label>
          <input
            value={method.fields.bank}
            onChange={(e) => onUpdateField(method.id, 'bank', e.target.value)}
            className='w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white'
          />
        </div>
        <div>
          <label className='text-xs font-bold text-slate-500 uppercase mb-1 block'>Carteira</label>
          <input
            value={method.fields.wallet}
            onChange={(e) => onUpdateField(method.id, 'wallet', e.target.value)}
            className='w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white'
          />
        </div>
        <div>
          <label className='text-xs font-bold text-slate-500 uppercase mb-1 block'>Agência</label>
          <input
            value={method.fields.agency}
            onChange={(e) => onUpdateField(method.id, 'agency', e.target.value)}
            className='w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white'
          />
        </div>
        <div>
          <label className='text-xs font-bold text-slate-500 uppercase mb-1 block'>Conta</label>
          <input
            value={method.fields.account}
            onChange={(e) => onUpdateField(method.id, 'account', e.target.value)}
            className='w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white'
          />
        </div>
      </div>
    );
  }
  if (method.id === 'credit_card') {
    return (
      <div className='space-y-4 mt-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl animate-fadeIn'>
        <div>
          <label className='text-xs font-bold text-slate-500 uppercase mb-1 block'>
            Gateway de Pagamento
          </label>
          <select
            value={method.fields.gateway}
            onChange={(e) => onUpdateField(method.id, 'gateway', e.target.value)}
            className='w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white'
          >
            <option value='Stripe'>Stripe</option>
            <option value='Mercado Pago'>Mercado Pago</option>
            <option value='Pagar.me'>Pagar.me</option>
            <option value='Iugu'>Iugu</option>
          </select>
        </div>
        <div>
          <label className='text-xs font-bold text-slate-500 uppercase mb-1 block'>
            Chave Pública (Public Key)
          </label>
          <input
            value={method.fields.publicKey}
            onChange={(e) => onUpdateField(method.id, 'publicKey', e.target.value)}
            className='w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white font-mono'
            placeholder='pk_test_...'
            type='password'
          />
        </div>
        <div>
          <label className='text-xs font-bold text-slate-500 uppercase mb-1 block'>
            Parcelamento Máximo
          </label>
          <select
            value={method.fields.maxInstallments}
            onChange={(e) => onUpdateField(method.id, 'maxInstallments', e.target.value)}
            className='w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white'
          >
            <option value='1'>À vista (1x)</option>
            <option value='3'>Até 3x</option>
            <option value='6'>Até 6x</option>
            <option value='12'>Até 12x</option>
          </select>
        </div>
      </div>
    );
  }
  return null;
};

export const FinancialTab: React.FC<FinancialTabProps> = ({
  paymentMethods,
  onToggleMethod,
  onUpdateField,
  expandedMethodId,
  onExpandedChange,
  stripeConnected,
  onConnectStripe,
}) => {
  return (
    <div className='animate-fadeIn space-y-6'>
      <div className='bg-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden'>
        <div className='relative z-10 flex flex-col md:flex-row justify-between items-center gap-6'>
          <div>
            <h3 className='font-bold text-xl flex items-center gap-2'>
              <CreditCard /> Stripe Connect
            </h3>
            <p className='text-indigo-100 text-sm mt-2 max-w-md'>
              Conecte sua conta bancária para receber pagamentos de aluguéis automaticamente via
              Cartão e Pix com split de taxas.
            </p>
          </div>
          {stripeConnected ? (
            <div className='bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl font-bold flex items-center gap-2'>
              <CheckCircle size={20} className='text-emerald-300' />
              Conta Conectada
            </div>
          ) : (
            <button
              onClick={onConnectStripe}
              className='bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2'
            >
              Conectar Agora <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
      <div className='space-y-4'>
        {paymentMethods.map((method) => {
          const IconComp = iconMap[method.iconName] || CreditCard;
          return (
            <div
              key={method.id}
              className={`bg-white dark:bg-surface-dark rounded-2xl border transition-all duration-300 ${method.enabled ? 'border-primary shadow-md shadow-primary/5 ring-1 ring-primary/20' : 'border-gray-200 dark:border-white/5 opacity-80'}`}
            >
              <div className='p-5'>
                <div className='flex items-start justify-between'>
                  <div className='flex gap-4'>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${method.color}`}
                    >
                      <IconComp size={24} />
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-slate-900 dark:text-white'>
                        {method.name}
                      </h3>
                      <p className='text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1'>
                        {method.description}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() =>
                        onExpandedChange(expandedMethodId === method.id ? null : method.id)
                      }
                      className='p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-colors'
                      title='Configurar'
                    >
                      <Settings size={20} />
                    </button>
                    <button
                      onClick={() => onToggleMethod(method.id)}
                      className={`transition-colors ${method.enabled ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}
                      title={method.enabled ? 'Desativar' : 'Ativar'}
                    >
                      {method.enabled ? (
                        <ToggleRight size={40} strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft size={40} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>
                {expandedMethodId === method.id && (
                  <div className='border-t border-gray-100 dark:border-white/5 mt-4 pt-2'>
                    {renderPaymentFields(method, onUpdateField)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
