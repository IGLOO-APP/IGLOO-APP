import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  navItems: any[];
  adminItems: any[];
  user: User | null;
  impersonatingFrom: User | null | undefined;
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
    <aside className='hidden md:flex flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-white/5 h-full shrink-0 transition-colors z-50'>
      <div className='p-6 flex items-center gap-3 mb-2'>
        <Link to='/' className='flex items-center gap-3 hover:opacity-80 transition-opacity group'>
          <div className='w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-lg shadow-black/10 group-hover:scale-105 transition-transform'>
            I
          </div>
          <h1 className='text-xl font-extrabold text-slate-900 dark:text-white tracking-tight'>Igloo</h1>
        </Link>
      </div>

      <nav className='flex-1 px-4 space-y-1.5 overflow-y-auto'>
        <div className='mb-6'>
          <p className='px-4 mb-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]'>Menu Principal</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 ease-out ${isActive
                  ? 'bg-primary/5 dark:bg-white/10 text-slate-main dark:text-white shadow-premium ring-1 ring-primary/10 dark:ring-white/5'
                  : 'text-slate-body dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-main dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`transition-colors duration-300 ${isActive ? 'text-primary drop-shadow-sm' : 'group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-sm font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                  {isActive && <div className='absolute right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,200,236,0.6)] animate-scaleUp'></div>}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {user?.role === 'admin' && !impersonatingFrom && (
          <div className='pt-2'>
            <p className='px-4 mb-2 text-[10px] font-black uppercase text-amber-500 tracking-[0.2em]'>Administração</p>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 ease-out ${isActive
                    ? 'bg-amber-500/10 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-premium ring-1 ring-amber-500/20 dark:ring-amber-500/20'
                    : 'text-slate-body dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-main dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`transition-colors duration-300 ${isActive ? 'text-amber-500' : 'group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-sm font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                    {isActive && <div className='absolute right-4 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-scaleUp'></div>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className='p-4 mx-4 mb-4 border-t border-gray-100 dark:border-white/5 space-y-1'>
        <Link to='/settings' className='flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all group'>
          <div className='pointer-events-none'>
            <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-10 h-10 rounded-xl', userButtonTrigger: 'pointer-events-none' } }} />
          </div>
          <div className='flex flex-col min-w-0'>
            <span className='text-sm font-bold text-slate-main dark:text-slate-200 truncate'>{user?.name || 'Carregando...'}</span>
            <span className='text-[10px] font-medium text-slate-body dark:text-slate-400 capitalize'>
              {user?.role === 'owner' ? 'Proprietário' : user?.role === 'admin' ? 'Administrador' : 'Inquilino'}
            </span>
          </div>
        </Link>

        <button onClick={toggleTheme} className='group flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-200'>
          <div className='group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors'>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </div>
          <span className='font-medium text-sm'>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>

        <button onClick={logout} className='group flex items-center gap-3.5 w-full px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 cursor-pointer'>
          <div className='group-hover:scale-110 transition-transform'><LogOut size={20} /></div>
          <span className='font-medium text-sm'>Sair</span>
        </button>
      </div>
    </aside>
  );
};
