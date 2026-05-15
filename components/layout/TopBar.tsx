import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useSearch } from '../../context/SearchContext';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, children }) => {
  const { notifications, unreadCount, markAsRead } = useNotification();
  const { toggleSearch } = useSearch();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className='sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 px-4 md:px-6 py-2.5 md:py-4 flex justify-between items-center transition-colors min-h-[64px]'>
      <div className='flex flex-col min-w-0 flex-1 mr-2'>
        {title && <h1 className='text-lg md:text-xl font-black text-slate-main dark:text-white tracking-tight uppercase truncate'>{title}</h1>}
        {subtitle && <p className='text-[9px] md:text-[10px] text-slate-muted font-bold uppercase tracking-widest truncate'>{subtitle}</p>}
      </div>

      <div className='flex items-center gap-1.5 md:gap-3 shrink-0'>
        {/* Global Search Button */}
        <button 
          onClick={toggleSearch}
          className='w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-all active-tap group'
          title='Pesquisa Global (Ctrl+K)'
        >
          <Search size={18} className='md:size-5 group-hover:text-primary transition-colors' />
        </button>

        {/* Notifications */}
        <div className='relative'>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl transition-all active-tap relative ${
              showNotifications ? 'bg-primary text-white shadow-cyan-glow' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-muted'
            }`}
          >
            <Bell size={18} className='md:size-5' />
            {unreadCount > 0 && <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark animate-pulse'></span>}
          </button>
          
          {showNotifications && (
            <>
              <div className='fixed inset-0 z-30' onClick={() => setShowNotifications(false)}></div>
              <div className='absolute top-12 right-0 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 py-2 z-40 animate-scaleUp origin-top-right overflow-hidden'>
                <div className='px-4 py-3 border-b border-slate-200/60 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-muted'>
                  Notificações
                  {unreadCount > 0 && <span className='bg-primary text-white px-2 py-0.5 rounded-full text-[8px]'>{unreadCount} novas</span>}
                </div>
                <div className='max-h-80 overflow-y-auto custom-scrollbar'>
                  {notifications.length > 0 ? notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        markAsRead(notif.id);
                        setShowNotifications(false);
                      }} 
                      className='px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0 group transition-colors'
                    >
                      <p className='text-sm font-bold text-slate-main dark:text-white group-hover:text-primary transition-colors'>{notif.title}</p>
                      <p className='text-xs text-slate-body dark:text-slate-400 mt-0.5 line-clamp-2'>{notif.message}</p>
                    </div>
                  )) : (
                    <div className='p-12 text-center'>
                      <div className='w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300'>
                        <Bell size={20} />
                      </div>
                      <p className='text-slate-400 text-xs font-bold uppercase tracking-widest'>Tudo limpo por aqui</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom Action Buttons */}
        {children && (
          <div className='flex items-center gap-1.5 md:gap-3 ml-1 md:ml-2 overflow-x-auto hide-scrollbar'>
            {children}
          </div>
        )}
      </div>
    </header>
  );
};


export default TopBar;
