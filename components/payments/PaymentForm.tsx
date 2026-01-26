import React, { useState } from 'react';
import { CreditCard, Lock, Calendar, HelpCircle, Loader2 } from 'lucide-react';

// NOTE: In a real integration, you would import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// This component simulates the visual behavior of Stripe Elements for demonstration purposes.

interface PaymentFormProps {
    onSubmit: (cardDetails: any) => Promise<void>;
    isLoading: boolean;
    buttonText?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, isLoading, buttonText = "Pagar Agora" }) => {
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [saveCard, setSaveCard] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            cardName,
            saveCard
        });
    };

    // Simple formatting for demo
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i=0, len=match.length; i<len; i+=4) {
            parts.push(match.substring(i, i+4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Simulated Card Element */}
                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Detalhes do Cartão</span>
                        <div className="flex gap-1">
                            <div className="w-8 h-5 bg-slate-200 rounded"></div>
                            <div className="w-8 h-5 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <input 
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                                placeholder="0000 0000 0000 0000"
                                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-lg font-mono text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-300"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                    maxLength={5}
                                    placeholder="MM / AA"
                                    className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-base font-mono text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-300"
                                    required
                                />
                                <Calendar size={16} className="absolute right-0 top-3 text-slate-400" />
                            </div>
                            <div className="relative">
                                <input 
                                    type="text"
                                    value={cvc}
                                    onChange={(e) => setCvc(e.target.value)}
                                    maxLength={3}
                                    placeholder="CVC"
                                    className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-base font-mono text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-300"
                                    required
                                />
                                <HelpCircle size={16} className="absolute right-0 top-3 text-slate-400" />
                            </div>
                        </div>
                        <div>
                            <input 
                                type="text"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                placeholder="Nome no Cartão"
                                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-300 uppercase"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <input 
                        type="checkbox" 
                        id="saveCard"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" 
                    />
                    <label htmlFor="saveCard" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer leading-tight">
                        Salvar cartão com segurança para pagamentos futuros.
                    </label>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-4">
                <Lock size={12} /> Pagamento processado de forma segura pelo Stripe.
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <><CreditCard size={24} /> {buttonText}</>}
            </button>
        </form>
    );
};