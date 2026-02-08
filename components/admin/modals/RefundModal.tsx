import React, { useState } from 'react';
import { User, PlanTier } from '../../types';
import { X, DollarSign, RefreshCcw, Loader, CreditCard, Wallet } from 'lucide-react';

interface RefundModalProps {
    user: User;
    plan: PlanTier;
    lastPayment: {
        amount: number;
        date: string;
        method: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onRefund: (userId: string, amount: number, type: 'full' | 'partial', reason: string, method: 'stripe' | 'credit') => Promise<void>;
}

const RefundModal: React.FC<RefundModalProps> = ({ user, plan, lastPayment, isOpen, onClose, onRefund }) => {
    const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
    const [partialAmount, setPartialAmount] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [method, setMethod] = useState<'stripe' | 'credit'>('stripe');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const reasons = [
        'Insatisfação com o serviço',
        'Problema técnico não resolvido',
        'Cobrança indevida',
        'Outro'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const amount = refundType === 'full' ? lastPayment.amount : parseFloat(partialAmount.replace(',', '.'));

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-emerald-600">
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Processar Reembolso</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Customer Info Summary */}
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl flex justify-between items-center text-sm">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400">Cliente</p>
                            <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-500 dark:text-slate-400">Último Pagamento</p>
                            <p className="font-bold text-slate-900 dark:text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lastPayment.amount)}
                            </p>
                            <p className="text-xs text-slate-500">{lastPayment.date}</p>
                        </div>
                    </div>

                    {/* Amount Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            Valor a Reembolsar
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${refundType === 'full'
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                    : 'border-gray-100 dark:border-white/10 hover:border-emerald-200'
                                }`}>
                                <input
                                    type="radio"
                                    name="refundType"
                                    value="full"
                                    checked={refundType === 'full'}
                                    onChange={() => setRefundType('full')}
                                    className="hidden"
                                />
                                <span className="font-bold text-lg">Total</span>
                                <span className="text-xs mt-1">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lastPayment.amount)}
                                </span>
                            </label>

                            <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${refundType === 'partial'
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                    : 'border-gray-100 dark:border-white/10 hover:border-emerald-200'
                                }`}>
                                <input
                                    type="radio"
                                    name="refundType"
                                    value="partial"
                                    checked={refundType === 'partial'}
                                    onChange={() => setRefundType('partial')}
                                    className="hidden"
                                />
                                <span className="font-bold text-lg">Parcial</span>
                                <span className="text-xs mt-1">Valor customizado</span>
                            </label>
                        </div>

                        {refundType === 'partial' && (
                            <div className="relative animate-fadeIn">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                <input
                                    type="text"
                                    value={partialAmount}
                                    onChange={(e) => setPartialAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg"
                                />
                            </div>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            Motivo
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        >
                            <option value="">Selecione um motivo...</option>
                            {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* Method */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            Método de Reembolso
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="method"
                                    value="stripe"
                                    checked={method === 'stripe'}
                                    onChange={() => setMethod('stripe')}
                                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                                />
                                <CreditCard size={16} className="text-slate-500" />
                                <span className="text-sm">Estornar no Cartão (Stripe)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="method"
                                    value="credit"
                                    checked={method === 'credit'}
                                    onChange={() => setMethod('credit')}
                                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                                />
                                <Wallet size={16} className="text-slate-500" />
                                <span className="text-sm">Crédito na Conta</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-bold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !reason || (refundType === 'partial' && !partialAmount)}
                            className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader size={18} className="animate-spin" /> : 'Confirmar Reembolso'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RefundModal;
