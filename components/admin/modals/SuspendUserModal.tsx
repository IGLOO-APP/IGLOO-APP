import React, { useState } from 'react';
import { User, AdminActivityLog } from '../../types';
import { X, AlertTriangle, Send, Loader } from 'lucide-react';

interface SuspendUserModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSuspend: (userId: string, reason: string, notes: string, notifyUser: boolean) => Promise<void>;
}

const SuspendUserModal: React.FC<SuspendUserModalProps> = ({ user, isOpen, onClose, onSuspend }) => {
    const [reason, setReason] = useState<string>('');
    const [customReason, setCustomReason] = useState('');
    const [notes, setNotes] = useState('');
    const [notifyUser, setNotifyUser] = useState(true);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const reasons = [
        'Pagamento não processado',
        'Violação dos termos',
        'Solicitação do usuário',
        'Atividade suspeita',
        'Outro'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const finalReason = reason === 'Outro' ? customReason : reason;
        try {
            await onSuspend(user.id.toString(), finalReason, notes, notifyUser);
            onClose();
        } catch (error) {
            console.error('Error suspending user:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-red-500">
                        <div className="bg-red-50 dark:bg-red-500/10 p-2 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Suspender Conta</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-red-50 dark:bg-red-500/5 p-4 rounded-2xl border border-red-100 dark:border-red-500/10">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            Você está prestes a suspender a conta de <strong>{user.name}</strong>.
                            O usuário perderá acesso imediato à plataforma.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            Motivo da Suspensão
                        </label>
                        <div className="space-y-2">
                            {reasons.map((r) => (
                                <label key={r} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r}
                                        checked={reason === r}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-4 h-4 text-red-500 focus:ring-red-500 border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{r}</span>
                                </label>
                            ))}
                        </div>
                        {reason === 'Outro' && (
                            <input
                                type="text"
                                placeholder="Especifique o motivo..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                required
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            Notas Internas <span className="text-slate-400 font-normal">(Opcional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Adicione detalhes para outros admins..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm min-h-[80px] resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="notifyUser"
                            checked={notifyUser}
                            onChange={(e) => setNotifyUser(e.target.checked)}
                            className="w-4 h-4 text-red-500 rounded border-gray-300 focus:ring-red-500"
                        />
                        <label htmlFor="notifyUser" className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                            Enviar email de notificação para o usuário
                        </label>
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
                            disabled={loading || !reason || (reason === 'Outro' && !customReason)}
                            className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader size={18} className="animate-spin" /> : 'Suspender Conta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SuspendUserModal;
