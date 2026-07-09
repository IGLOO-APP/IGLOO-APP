import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { User } from '../../types';
import { Sun, Moon, LogOut } from 'lucide-react';
import { Sidebar as SidebarRoot } from '../ui/sidebar';
import { preloadRoute } from '../../lib/routePreloader';

interface SidebarProps {
  navItems: { path: string; label: string; icon: React.ElementType }[];
  adminItems?: { path: string; label: string; icon: React.ElementType }[];
  user: User | null;
  impersonatingFrom?: User | null;
  isDark: boolean;
  toggleTheme: () => void;
  logout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  adminItems,
  user,
  impersonatingFrom,
  isDark,
  toggleTheme,
  logout,
}) => {
  return (
    <SidebarRoot
      collapsible='none'
      className='hidden md:flex !bg-white/45 dark:!bg-zinc-400/10 backdrop-blur-3xl h-screen sticky top-0 !w-80 rounded-r-3xl !border-r !border-white/40 dark:!border-zinc-400/10 shadow-2xl shadow-black/5 flex flex-col py-6 justify-between transition-all duration-300 select-none'
    >
      <div className='flex flex-col flex-grow'>
        {/* Header */}
        <div className='px-6 mb-8 mt-4'>
          <Link to='/' className='inline-block'>
            <h1 className='font-sans text-4xl font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm transition-colors duration-300'>
              Igloo
            </h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className='flex flex-col gap-2 px-4 flex-grow overflow-y-auto scroll-smooth hide-scrollbar'>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onMouseEnter={() => preloadRoute(item.path)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-6 py-3 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-sky-400 text-white dark:bg-white/20 dark:border dark:border-white/20 dark:text-white scale-95 shadow-[0_4px_30px_rgba(0,0,0,0.05)] font-bold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`transition-colors duration-300 ${
                          isActive ? 'text-white' : 'text-slate-500 dark:text-zinc-400'
                        }`}
                        size={24}
                      />
                      <span className='text-sm tracking-wide'>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}

          {/* Admin Items */}
          {user?.role === 'admin' && !impersonatingFrom && adminItems && (
            <>
              <div className='my-4 border-t border-slate-200/50 dark:border-white/10 mx-2' />
              <span className='px-6 mb-2 block text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider'>
                Administração
              </span>
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onMouseEnter={() => preloadRoute(item.path)}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-6 py-3 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-sky-400 text-white dark:bg-white/20 dark:border dark:border-white/20 dark:text-white scale-95 shadow-[0_4px_30px_rgba(0,0,0,0.05)] font-bold'
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`transition-colors duration-300 ${
                              isActive ? 'text-white' : 'text-slate-500 dark:text-zinc-400'
                            }`}
                            size={24}
                          />
                          <span className='text-sm tracking-wide'>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </>
          )}
        </ul>
      </div>

      {/* Bottom Section: Profile & Actions */}
      <div className='px-6 flex flex-col gap-4 pt-4 border-t border-slate-200/50 dark:border-white/10 mx-4 mt-auto'>
        {/* Profile */}
        <Link to='/settings' className='flex items-center gap-3 group/profile'>
          {user?.avatar_url || user?.avatar ? (
            <img
              alt={`${user.name} Avatar`}
              className='w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/20 shadow-sm transition-transform duration-300 group-hover/profile:scale-105'
              src={user.avatar_url || user.avatar}
            />
          ) : (
            <div className='pointer-events-none w-10 h-10 transition-transform duration-300 group-hover/profile:scale-105'>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-10 h-10 rounded-full',
                    userButtonTrigger: 'pointer-events-none',
                  },
                }}
              />
            </div>
          )}
          <div className='flex flex-col min-w-0'>
            <span className='text-sm font-semibold text-slate-900 dark:text-white truncate group-hover/profile:text-sky-500 dark:group-hover/profile:text-white/80 transition-colors duration-300'>
              {user?.name || 'Arthur Alencar'}
            </span>
            <span className='text-xs text-slate-500 dark:text-zinc-400 capitalize'>
              {user?.role === 'owner'
                ? 'Proprietário'
                : user?.role === 'admin'
                  ? 'Administrador'
                  : 'Inquilino'}
            </span>
          </div>
        </Link>

        {/* System Actions */}
        <div className='flex flex-col gap-1 mt-2'>
          <button
            onClick={toggleTheme}
            className='flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all duration-200 text-left w-full'
          >
            {isDark ? (
              <>
                <Sun size={20} className='text-slate-500 dark:text-zinc-400' />
                <span className='text-sm font-medium'>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon size={20} className='text-slate-500 dark:text-zinc-400' />
                <span className='text-sm font-medium'>Modo Escuro</span>
              </>
            )}
          </button>
          <button
            onClick={logout}
            className='flex items-center gap-3 px-4 py-2 text-red-500/80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 text-left w-full'
          >
            <LogOut size={20} />
            <span className='text-sm font-medium'>Sair</span>
          </button>
        </div>
      </div>
    </SidebarRoot>
  );
};
