import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home, Receipt, User, LogOut, Moon, Sun, LifeBuoy, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { UserButton } from '@clerk/clerk-react';

const TenantLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { path: '/tenant', label: 'Início', icon: Home },
    { path: '/tenant/payments', label: 'Pagamentos', icon: Receipt },
    { path: '/tenant/maintenance', label: 'Ajuda', icon: LifeBuoy },
    { path: '/tenant/settings', label: 'Configurações', icon: SettingsIcon },
  ];

  return (
    <div className='flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors'>
      {/* Desktop Sidebar */}
      <aside className='hidden md:flex flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 h-full shrink-0 transition-colors'>
        <div className='p-6 flex items-center gap-2'>
          <Link
            to='/tenant'
            className='flex items-center gap-2 hover:opacity-80 transition-opacity group'
          >
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform'>
              I
            </div>
            <h1 className='text-xl font-bold text-slate-800 dark:text-white tracking-tight'>
              Igloo{' '}
              <span className='text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded ml-1'>
                Inquilino
              </span>
            </h1>
          </Link>
        </div>
        <nav className='flex-1 px-4 space-y-2 overflow-y-auto'>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/tenant'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 ease-out ${isActive
                  ? 'bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon size={20} strokeWidth={2} />
              <span className='text-sm font-medium tracking-wide'>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className='p-4 border-t border-gray-200 dark:border-gray-800 space-y-1 bg-surface-light/50 dark:bg-surface-dark/50'>
          <Link 
            to='/tenant/settings'
            className='flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all group'
          >
            <div className='pointer-events-none'>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-10 h-10 rounded-xl',
                    userButtonTrigger: 'pointer-events-none'
                  },
                }}
              />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-sm font-bold text-slate-700 dark:text-slate-200 truncate'>
                {user?.name || 'Carregando...'}
              </span>
              <span className='text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize'>
                Inquilino
              </span>
            </div>
          </Link>

          <button
            onClick={toggleTheme}
            className='group flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-200'
          >
            <div className='group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors'>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <span className='font-medium text-sm'>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          <button
            onClick={logout}
            className='group flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 cursor-pointer'
          >
            <div className='group-hover:scale-110 transition-transform'>
              <LogOut size={20} />
            </div>
            <span className='font-medium text-sm'>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 overflow-hidden flex flex-col relative h-full w-full'>
        <div className='flex-1 overflow-y-auto pb-24 md:pb-0 w-full scroll-smooth'>
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className='md:hidden fixed bottom-0 w-full bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe-bottom pt-2 px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'>
          <div className='flex justify-around items-center h-16 max-w-lg mx-auto'>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/tenant'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-14 gap-1 transition-all duration-200 active:scale-90 ${
                    isActive
                      ? 'text-primary'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`
                }
              >
                <item.icon size={22} strokeWidth={2} />
                <span className='text-[9px] font-bold'>{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={async () => await logout()}
              className='flex flex-col items-center justify-center w-14 gap-1 text-slate-300 hover:text-red-400 transition-colors active:scale-90'
            >
              <LogOut size={22} strokeWidth={2} />
              <span className='text-[9px] font-medium'>Sair</span>
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
};

export default TenantLayout;
