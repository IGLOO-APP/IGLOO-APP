import React from 'react';
import { Bell, Moon, Sun, Settings } from 'lucide-react';
import { User as UserType } from '../../../types';

interface DashboardHeaderProps {
  user: UserType | null;
  isDark: boolean;
  unreadCount: number;
  showNotifications: boolean;
  onToggleTheme: () => void;
  onToggleNotifications: () => void;
  onCloseNotifications: () => void;
  onNavigate: (path: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onTriggerTestNotification: () => void;
  notifications: Array<{
    id: string;
    is_read: boolean;
    title: string;
    message: string;
    created_at: string;
    link: string | null;
  }>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  isDark,
  unreadCount,
  showNotifications,
  onToggleTheme,
  onToggleNotifications,
  onCloseNotifications,
  onNavigate,
  onMarkAsRead,
  onMarkAllAsRead,
  onTriggerTestNotification,
  notifications,
}) => {
  return (
    <header className='w-full lg-topbar px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30'>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => onNavigate('/tenant/profile')}
          className='flex items-center gap-2 group'
        >
          <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-all'>
            {user?.avatar ? (
              <img src={user.avatar} className='w-full h-full object-cover' />
            ) : (
              <div className='w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-primary font-bold text-xs'>
                {user?.name?.[0] || 'T'}
              </div>
            )}
          </div>
          <div className='hidden sm:block text-left'>
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1'>
              Olá, {user?.name?.split(' ')[0] || 'Bem-vindo'}
            </p>
            <p className='text-xs font-bold text-slate-900 dark:text-white leading-none'>
              Meu Perfil
            </p>
          </div>
        </button>
      </div>

      <div className='flex items-center gap-3 relative z-30'>
        <button
          onClick={() => onNavigate('/tenant/settings')}
          className='w-9 h-9 flex items-center justify-center rounded-full bg-white/5 dark:bg-white/6 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all active-tap'
          title='Configurações'
        >
          <Settings size={16} strokeWidth={1.8} />
        </button>

        <button
          onClick={onToggleTheme}
          className='w-9 h-9 flex items-center justify-center rounded-full bg-white/5 dark:bg-white/6 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all active-tap'
        >
          {isDark ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
        </button>

        <div className='relative'>
          <button
            onClick={onToggleNotifications}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active-tap relative ${
              showNotifications
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white/5 dark:bg-white/6 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10'
            }`}
          >
            <Bell size={16} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark animate-pulse'></span>
            )}
          </button>
          {showNotifications && (
            <>
              <div
                className='fixed inset-0 z-20 cursor-default'
                onClick={onCloseNotifications}
              ></div>
              <div className='lg-card absolute top-full right-0 mt-2 w-80 animate-scaleUp origin-top-right z-30 overflow-hidden'>
                <div className='px-4 py-3 border-b border-white/10 flex justify-between items-center'>
                  <h3 className='text-sm font-bold text-foreground'>Notificações</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllAsRead}
                      className='text-xs text-primary font-bold hover:underline'
                    >
                      Ler tudo
                    </button>
                  )}
                </div>
                <div className='max-h-[300px] overflow-y-auto'>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onMarkAsRead(notif.id);
                          if (notif.link) onNavigate(notif.link);
                        }}
                        className={`px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors ${
                          !notif.is_read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className='flex justify-between items-start gap-3'>
                          <div>
                            <p
                              className={`text-sm ${
                                !notif.is_read
                                  ? 'font-bold text-foreground'
                                  : 'font-medium text-muted-foreground'
                              }`}
                            >
                              {notif.title}
                            </p>
                            <p className='text-xs text-muted-foreground mt-0.5 line-clamp-2'>
                              {notif.message}
                            </p>
                            <p className='text-[10px] text-muted-foreground/60 mt-1'>
                              {new Date(notif.created_at).toLocaleDateString()}{' '}
                              {new Date(notif.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <div className='w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0'></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='p-8 text-center text-muted-foreground text-sm'>
                      <Bell size={24} className='mx-auto mb-2 opacity-50' />
                      Nenhuma notificação
                    </div>
                  )}
                </div>
                <div className='p-2 border-t border-white/10 text-center'>
                  <button
                    onClick={onTriggerTestNotification}
                    className='text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors'
                  >
                    Simular Notificação (Teste)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
