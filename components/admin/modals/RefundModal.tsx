import React, { useState } from 'react';
import { User } from '../../../types';
import { DollarSign, Loader2, CreditCard, Wallet } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RefundModalProps {
  user: User;
  lastPayment: {
    amount: number;
    date: string;
    method: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onRefund: (
    userId: string,
    amount: number,
    type: 'full' | 'partial',
    reason: string,
    method: 'stripe' | 'credit'
  ) => Promise<void>;
}

const RefundModal: React.FC<RefundModalProps> = ({
  user,
  lastPayment,
  isOpen,
  onClose,
  onRefund,
}) => {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [method, setMethod] = useState<'stripe' | 'credit'>('stripe');
  const [loading, setLoading] = useState(false);

  const reasons = [
    'Insatisfação com o serviço',
    'Problema técnico não resolvido',
    'Cobrança indevida',
    'Outro',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const amount =
      refundType === 'full' ? lastPayment.amount : parseFloat(partialAmount.replace(',', '.'));

    try {
      await onRefund(user.id.toString(), amount, refundType, reason, method);
      onClose();
    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-w-lg p-0 gap-0'>
        <DialogHeader className='p-6 border-b border-border flex flex-row items-center justify-between gap-3'>
          <div className='flex items-center gap-3 text-emerald-600'>
            <div className='bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-xl'>
              <DollarSign size={24} />
            </div>
            <DialogTitle className='text-xl font-bold'>Processar Reembolso</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Customer Info Summary */}
          <div className='bg-muted/50 p-4 rounded-xl flex justify-between items-center text-sm'>
            <div>
              <p className='text-muted-foreground'>Cliente</p>
              <p className='font-bold text-foreground'>{user.name}</p>
            </div>
            <div className='text-right'>
              <p className='text-muted-foreground'>Último Pagamento</p>
              <p className='font-bold text-foreground'>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  lastPayment.amount
                )}
              </p>
              <p className='text-xs text-muted-foreground'>{lastPayment.date}</p>
            </div>
          </div>

          {/* Amount Selection */}
          <div className='space-y-3'>
            <Label className='text-sm font-bold'>Valor a Reembolsar</Label>
            <div className='grid grid-cols-2 gap-4'>
              <Label
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  refundType === 'full'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-border hover:border-emerald-200'
                }`}
              >
                <input
                  type='radio'
                  name='refundType'
                  value='full'
                  checked={refundType === 'full'}
                  onChange={() => setRefundType('full')}
                  className='sr-only'
                />
                <span className='font-bold text-lg'>Total</span>
                <span className='text-xs mt-1'>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    lastPayment.amount
                  )}
                </span>
              </Label>

              <Label
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  refundType === 'partial'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-border hover:border-emerald-200'
                }`}
              >
                <input
                  type='radio'
                  name='refundType'
                  value='partial'
                  checked={refundType === 'partial'}
                  onChange={() => setRefundType('partial')}
                  className='sr-only'
                />
                <span className='font-bold text-lg'>Parcial</span>
                <span className='text-xs mt-1'>Valor customizado</span>
              </Label>
            </div>

            {refundType === 'partial' && (
              <div className='relative'>
                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold'>
                  R$
                </span>
                <Input
                  type='text'
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder='0,00'
                  className='pl-10 font-bold text-lg'
                />
              </div>
            )}
          </div>

          {/* Reason */}
          <div className='space-y-2'>
            <Label className='text-sm font-bold'>Motivo</Label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className='w-full px-4 py-3 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring'
            >
              <option value=''>Selecione um motivo...</option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Method */}
          <div className='space-y-3'>
            <Label className='text-sm font-bold'>Método de Reembolso</Label>
            <div className='flex gap-4'>
              <Label className='flex items-center gap-2 cursor-pointer font-normal'>
                <input
                  type='radio'
                  name='method'
                  value='stripe'
                  checked={method === 'stripe'}
                  onChange={() => setMethod('stripe')}
                  className='w-4 h-4 text-emerald-500 focus:ring-emerald-500'
                />
                <CreditCard size={16} className='text-muted-foreground' />
                <span className='text-sm'>Estornar no Cartão (Stripe)</span>
              </Label>
              <Label className='flex items-center gap-2 cursor-pointer font-normal'>
                <input
                  type='radio'
                  name='method'
                  value='credit'
                  checked={method === 'credit'}
                  onChange={() => setMethod('credit')}
                  className='w-4 h-4 text-emerald-500 focus:ring-emerald-500'
                />
                <Wallet size={16} className='text-muted-foreground' />
                <span className='text-sm'>Crédito na Conta</span>
              </Label>
            </div>
          </div>

          <div className='flex items-center gap-3 pt-4 border-t border-border'>
            <Button type='button' variant='outline' onClick={onClose} className='flex-1'>
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={loading || !reason || (refundType === 'partial' && !partialAmount)}
              className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white'
            >
              {loading ? <Loader2 size={18} className='animate-spin' /> : 'Confirmar Reembolso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RefundModal;
