import React, { useState } from 'react';
import { UserPlus, Mail, Phone, User, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { adminService } from '../../../../../services/adminService';
import { ModalWrapper } from '../../../../../components/ui/ModalWrapper';

interface AddOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddOwnerModal: React.FC<AddOwnerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError('Nome e E-mail são obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await adminService.createOwner(formData.email, formData.name, formData.phone);
      onSuccess();
      onClose();
      setFormData({ name: '', email: '', phone: '' });
    } catch (err: any) {
      console.error('Error creating owner:', err);
      setError(err.message || 'Erro ao criar proprietário. Verifique se o e-mail já existe.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      onClose={onClose}
      title="Adicionar Novo Proprietário"
      showCloseButton={true}
      className="md:max-w-xl"
    >
      <div className="p-8 space-y-8 bg-background-light dark:bg-background-dark">
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Cadastro Manual</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O proprietário será criado como "Ativo" e poderá acessar o sistema assim que realizar o login com este e-mail.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                Nome Completo *
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                  placeholder="Ex: João Silva da Costa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                E-mail Principal *
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                  placeholder="joao@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                Telefone / WhatsApp
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.email}
                className="flex-[2] py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> Adicionar Proprietário
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalWrapper>
  );
};
