import React from 'react';
import { ModalWrapper } from '../../../../../components/ui/ModalWrapper';
import { CheckCircle } from 'lucide-react';
import { User } from '../../../../../types';

interface UserPlanModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  newPlan: string;
  setNewPlan: (plan: string) => void;
  onUpdatePlan: () => Promise<void>;
}

export const UserPlanModal: React.FC<UserPlanModalProps> = ({
  user,
  isOpen,
  onClose,
  newPlan,
  setNewPlan,
  onUpdatePlan,
}) => {
  if (!isOpen) return null;

  return (
    <ModalWrapper
      onClose={onClose}
      title='Alterar Plano do Usuário'
      className='md:max-w-md'
    >
      <div className='p-8 space-y-6'>
        <div className='bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20'>
          <p className='text-sm text-blue-800 dark:text-blue-200'>
            Alterar o plano afetará os limites de imóveis e funcionalidades de{' '}
            <strong>{user.name}</strong>.
          </p>
        </div>

        <div className='space-y-3'>
          <label className='block text-sm font-bold text-slate-700 dark:text-slate-300'>
            Selecione o Novo Plano
          </label>
          <div className='grid grid-cols-1 gap-2'>
            {['Free', 'Pro', 'Elite', 'Trial', 'Premium'].map((p) => (
              <button
                key={p}
                onClick={() => setNewPlan(p)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${newPlan === p ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
              >
                <span className='font-bold'>{p}</span>
                {newPlan === p && <CheckCircle size={18} />}
              </button>
            ))}
          </div>
        </div>

        <div className='flex gap-3 pt-4 border-t border-gray-100 dark:border-white/10'>
          <button
            onClick={onClose}
            className='flex-1 h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all'
          >
            Cancelar
          </button>
          <button
            onClick={onUpdatePlan}
            className='flex-1 h-12 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95'
          >
            Confirmar Alteração
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
