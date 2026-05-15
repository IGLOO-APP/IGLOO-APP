import React from 'react';
import { ModalWrapper } from '../../../../../components/ui/ModalWrapper';
import { ShieldAlert, Calendar, Loader2 } from 'lucide-react';
import { User } from '../../../../../types';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../../../../services/adminService';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', user.id],
    queryFn: () => adminService.getUserStats(user.id),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <ModalWrapper
      onClose={onClose}
      title='Perfil Completo do Usuário'
      className='md:max-w-2xl'
    >
      <div className='p-8 space-y-8 overflow-y-auto max-h-[80vh]'>
        <div className='flex items-center gap-6'>
          <div className='w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-slate-600 dark:text-white text-3xl font-black shadow-inner'>
            {user.name ? user.name.charAt(0) : '?'}
          </div>
          <div>
            <h3 className='text-2xl font-black text-slate-900 dark:text-white'>
              {user.name}
            </h3>
            <p className='text-slate-500 font-medium'>{user.email}</p>
            <div className='flex gap-2 mt-2'>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
              >
                {user.role === 'owner' ? 'Proprietário' : 'Inquilino'}
              </span>
              <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'>
                {(user as any).plan || 'Free'}
              </span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          <div className='p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5'>
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
              Cadastro
            </p>
            <p className='font-bold text-slate-700 dark:text-slate-200'>
              {new Date((user as any).created_at || Date.now()).toLocaleDateString(
                'pt-BR',
                {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }
              )}
            </p>
          </div>
          <div className='p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5'>
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
              Status da Conta
            </p>
            <div className='flex items-center gap-2'>
              <div
                className={`w-2 h-2 rounded-full ${!user.is_suspended ? 'bg-emerald-500' : 'bg-rose-500'}`}
              ></div>
              <p className='font-bold text-slate-700 dark:text-slate-200'>
                {!user.is_suspended ? 'Ativo' : 'Suspenso'}
              </p>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <h4 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2'>
            <ShieldAlert size={16} className='text-primary' /> Métricas de Uso
          </h4>
          <div className='grid grid-cols-3 gap-4'>
            <div className='text-center p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-transparent shadow-sm dark:shadow-none'>
              {isLoading ? (
                <div className="flex justify-center p-2"><Loader2 className="animate-spin text-primary" size={20} /></div>
              ) : (
                <p className='text-2xl font-black text-slate-900 dark:text-white'>{stats?.metrics.properties || 0}</p>
              )}
              <p className='text-[10px] font-bold text-slate-400 uppercase'>Imóveis</p>
            </div>
            <div className='text-center p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-transparent shadow-sm dark:shadow-none'>
              {isLoading ? (
                <div className="flex justify-center p-2"><Loader2 className="animate-spin text-primary" size={20} /></div>
              ) : (
                <p className='text-2xl font-black text-slate-900 dark:text-white'>{stats?.metrics.tenants || 0}</p>
              )}
              <p className='text-[10px] font-bold text-slate-400 uppercase'>Inquilinos</p>
            </div>
            <div className='text-center p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-transparent shadow-sm dark:shadow-none'>
              {isLoading ? (
                <div className="flex justify-center p-2"><Loader2 className="animate-spin text-primary" size={20} /></div>
              ) : (
                <p className='text-2xl font-black text-slate-900 dark:text-white'>{stats?.metrics.contracts || 0}</p>
              )}
              <p className='text-[10px] font-bold text-slate-400 uppercase'>Contratos</p>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <h4 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2'>
            <Calendar size={16} className='text-primary' /> Últimos Pagamentos do Plano
          </h4>
          <div className='space-y-2'>
            {isLoading ? (
              <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                <Loader2 className="animate-spin text-primary mr-2" size={20} />
                <span className="text-sm text-slate-400 font-medium">Carregando histórico...</span>
              </div>
            ) : stats?.payments && stats.payments.length > 0 ? (
              stats.payments.map((pay, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-sm transition-all hover:bg-slate-100 dark:hover:bg-white/10'
                >
                  <span className='font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px] tracking-tight'>
                    {pay.month}
                  </span>
                  <div className='flex items-center gap-4'>
                    <span className='font-black text-slate-900 dark:text-white'>{pay.val}</span>
                    <span className='px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-500 uppercase'>
                      {pay.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className='flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10 opacity-60'>
                <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Nenhum pagamento registrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
