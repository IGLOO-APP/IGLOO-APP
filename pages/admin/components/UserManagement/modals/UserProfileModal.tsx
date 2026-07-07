import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ShieldAlert, Calendar, Loader2 } from 'lucide-react';
import { User } from '../../../../../types';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../../../../services/adminService';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', user.id],
    queryFn: () => adminService.getUserStats(user.id),
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-2xl'>
        <DialogHeader className='px-6 py-4 border-b border-border flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Perfil Completo do Usuário</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='p-8 space-y-8'>
          <div className='flex items-center gap-6'>
            <div className='w-20 h-20 rounded-3xl bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center text-foreground text-3xl font-black shadow-inner'>
              {user.name ? user.name.charAt(0) : '?'}
            </div>
            <div>
              <h3 className='text-2xl font-black text-slate-900 dark:text-white'>{user.name}</h3>
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
            <div className='p-5 rounded-2xl bg-muted/50 border border-border'>
              <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1'>
                Cadastro
              </p>
              <p className='font-bold text-foreground'>
                {new Date((user as any).created_at || Date.now()).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className='p-5 rounded-2xl bg-muted/50 border border-border'>
              <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1'>
                Status da Conta
              </p>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-2 h-2 rounded-full ${!user.is_suspended ? 'bg-emerald-500' : 'bg-rose-500'}`}
                ></div>
                <p className='font-bold text-foreground'>
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
              <div className='text-center p-4 rounded-2xl border border-border bg-card shadow-sm dark:shadow-none'>
                {isLoading ? (
                  <div className='flex justify-center p-2'>
                    <Loader2 className='animate-spin text-primary' size={20} />
                  </div>
                ) : (
                  <p className='text-2xl font-black text-slate-900 dark:text-white'>
                    {stats?.metrics.properties || 0}
                  </p>
                )}
                <p className='text-[10px] font-bold text-slate-400 uppercase'>Imóveis</p>
              </div>
              <div className='text-center p-4 rounded-2xl border border-border bg-card shadow-sm dark:shadow-none'>
                {isLoading ? (
                  <div className='flex justify-center p-2'>
                    <Loader2 className='animate-spin text-primary' size={20} />
                  </div>
                ) : (
                  <p className='text-2xl font-black text-slate-900 dark:text-white'>
                    {stats?.metrics.tenants || 0}
                  </p>
                )}
                <p className='text-[10px] font-bold text-slate-400 uppercase'>Inquilinos</p>
              </div>
              <div className='text-center p-4 rounded-2xl border border-border bg-card shadow-sm dark:shadow-none'>
                {isLoading ? (
                  <div className='flex justify-center p-2'>
                    <Loader2 className='animate-spin text-primary' size={20} />
                  </div>
                ) : (
                  <p className='text-2xl font-black text-slate-900 dark:text-white'>
                    {stats?.metrics.contracts || 0}
                  </p>
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
                <div className='flex items-center justify-center p-8 bg-muted/30 rounded-xl border border-dashed border-border'>
                  <Loader2 className='animate-spin text-primary mr-2' size={20} />
                  <span className='text-sm text-muted-foreground font-medium'>
                    Carregando histórico...
                  </span>
                </div>
              ) : stats?.payments && stats.payments.length > 0 ? (
                stats.payments.map((pay, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border text-sm transition-all hover:bg-accent'
                  >
                    <span className='font-bold text-foreground uppercase text-[11px] tracking-tight'>
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
                <div className='flex flex-col items-center justify-center p-8 bg-muted/30 rounded-xl border border-dashed border-border opacity-60'>
                  <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest'>
                    Nenhum pagamento registrado
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
