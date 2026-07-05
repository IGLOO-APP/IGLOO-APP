import React from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
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
  notifications: any[];
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
    <header className='flex items-center px-6 py-5 justify-between sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm transition-colors'>
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
          onClick={onToggleTheme}
          className='flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95'
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className='relative'>
          <button
            onClick={onToggleNotifications}
            className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm text-slate-800 dark:text-white relative transition-all ${
              showNotifications
                ? 'bg-primary text-white shadow-primary/30'
                : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className='absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-surface-dark'></span>
            )}
          </button>
          {showNotifications && (
            <>
              <div
                className='fixed inset-0 z-20 cursor-default'
                onClick={onCloseNotifications}
              ></div>
              <div className='absolute top-full right-0 mt-2 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 animate-scaleUp origin-top-right z-30 overflow-hidden'>
                <div className='px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5'>
                  <h3 className='text-sm font-bold text-slate-900 dark:text-white'>Notificações</h3>
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
                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0 transition-colors ${
                          !notif.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''
                        }`}
                      >
                        <div className='flex justify-between items-start gap-3'>
                          <div>
                            <p
                              className={`text-sm ${
                                !notif.is_read
                                  ? 'font-bold text-slate-900 dark:text-white'
                                  : 'font-medium text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {notif.title}
                            </p>
                            <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2'>
                              {notif.message}
                            </p>
                            <p className='text-[10px] text-slate-400 mt-1'>
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
                    <div className='p-8 text-center text-slate-400 text-sm'>
                      <Bell size={24} className='mx-auto mb-2 opacity-50' />
                      Nenhuma notificação
                    </div>
                  )}
                </div>
                <div className='p-2 border-t border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-center'>
                  <button
                    onClick={onTriggerTestNotification}
                    className='text-[10px] font-bold text-slate-400 hover:text-primary transition-colors'
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
