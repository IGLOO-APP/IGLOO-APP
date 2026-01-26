import React from 'react';
import { CreditCard, Trash2, CheckCircle, Plus } from 'lucide-react';
import { PaymentMethod } from '../../services/stripeService';

interface SavedCardsProps {
    cards: PaymentMethod[];
    selectedId?: string;
    onSelect?: (id: string) => void;
    onDelete?: (id: string) => void;
    onAddNew?: () => void;
}

export const SavedCards: React.FC<SavedCardsProps> = ({ cards, selectedId, onSelect, onDelete, onAddNew }) => {
    return (
        <div className="space-y-3">
            {cards.map((card) => (
                <div 
                    key={card.id}
                    onClick={() => onSelect && onSelect(card.id)}
                    className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedId === card.id 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark hover:border-primary/50'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                                {card.brand} •••• {card.last4}
                                {card.is_default && <span className="text-[10px] bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-slate-500 uppercase tracking-wider">Padrão</span>}
                            </p>
                            <p className="text-xs text-slate-500">Expira em {card.exp_month}/{card.exp_year}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {selectedId === card.id && (
                            <CheckCircle size={20} className="text-primary" />
                        )}
                        {onDelete && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {onAddNew && (
                <button 
                    onClick={onAddNew}
                    className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-500 font-bold text-sm hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                >
                    <Plus size={18} /> Adicionar Novo Cartão
                </button>
            )}
        </div>
    );
};