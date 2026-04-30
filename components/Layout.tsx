import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  FileText,
  Moon,
  Sun,
  MessageSquare,
  Settings as SettingsIcon,
  User as UserIcon,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserButton } from '@clerk/clerk-react';
import { useTheme } from '../hooks/useTheme';

const navItems = [
  { path: '/', label: 'Início', icon: LayoutDashboard },
  { path: '/properties', label: 'Imóveis', icon: Building2 },
  { path: '/tenants', label: 'Inquilinos', icon: Users },
  { path: '/messages', label: 'Mensagens', icon: MessageSquare },
  { path: '/contracts', label: 'Contratos', icon: FileText },
  { path: '/financials', label: 'Finanças', icon: Receipt },
  { path: '/settings', label: 'Configurações', icon: SettingsIcon },
];

const adminItems = [
  { path: '/admin', label: 'Painel Admin', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Gestão de Usuários', icon: Users },
  { path: '/admin/announcements', label: 'Comunicados', icon: MessageSquare },
];

const Layout: React.FC = () => {
  const location = useLocation();
  const { logout, impersonatingFrom, user, stopImpersonation } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className='flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300'>
      {/* Desktop Sidebar */}
      <aside className='hidden md:flex flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-white/5 h-full shrink-0 transition-colors z-20'>
        <div className='p-6 flex items-center gap-3 mb-2'>
          <Link
            to='/'
            className='flex items-center gap-3 hover:opacity-80 transition-opacity group'
          >
            <div className='w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-lg shadow-black/10 group-hover:scale-105 transition-transform'>
              I
            </div>
            <h1 className='text-xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
              Igloo
            </h1>
          </Link>
        </div>

        <nav className='flex-1 px-4 space-y-1.5 overflow-y-auto'>
          {/* Menu Normal */}
          <div className='mb-6'>
            <p className='px-4 mb-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]'>Menu Principal</p>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 ease-out ${isActive
                    ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/5'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
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

          {/* Menu Admin (Se for admin e não estiver impersonando) */}
          {user?.role === 'admin' && !impersonatingFrom && (
            <div className='pt-2'>
              <p className='px-4 mb-2 text-[10px] font-black uppercase text-amber-500 tracking-[0.2em]'>Administração</p>
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 ease-out ${isActive
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-200 dark:ring-amber-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
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
          <Link
            to='/settings'
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
                {user?.role === 'owner' ? 'Proprietário' : user?.role === 'admin' ? 'Administrador' : 'Inquilino'}
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

      {/* Main Content Area */}
      <main className='flex-1 overflow-hidden flex flex-col relative h-full w-full bg-background-light dark:bg-background-dark transition-colors duration-300'>
        {/* Impersonation Banner */}
        {impersonatingFrom && (
          <div className='bg-amber-500 text-white px-6 py-2 flex items-center justify-between shadow-lg z-50 animate-slideDown'>
            <div className='flex items-center gap-3'>
              <div className='p-1.5 bg-white/20 rounded-lg'>
                <AlertTriangle size={18} className='animate-pulse' />
              </div>
              <div className='text-sm leading-tight'>
                <span className='font-black uppercase tracking-wider text-[10px] opacity-80 block'>Modo Admin Ativo</span>
                <p className='font-bold'>Visualizando como: <span className='underline decoration-white/30 underline-offset-2'>{user?.name}</span> ({user?.email})</p>
              </div>
            </div>
            <button
              onClick={stopImpersonation}
              className='flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm'
            >
              <LogOut size={14} />
              Parar Acesso
            </button>
          </div>
        )}

        <div className='flex-1 overflow-y-auto pb-24 md:pb-0 w-full scroll-smooth'>
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className='md:hidden fixed bottom-0 w-full bg-surface-light/90 dark:bg-surface-dark/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 pb-safe-bottom pt-1 px-2 z-50 shadow-2xl'>
          <div className='flex justify-around items-center h-16 max-w-lg mx-auto'>
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center w-16 gap-1 transition-all duration-300 ${isActive
                    ? 'text-primary scale-105'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                >
                  <div
                    className={`p-1 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className='text-[10px] font-bold'>{item.label}</span>
                </NavLink>
              );
            })}
            <div className='flex flex-col items-center justify-center w-16 gap-1'>
              <UserButton afterSignOutUrl='/login' />
              <span className='text-[10px] font-medium text-slate-500 dark:text-slate-400'>Perfil</span>
            </div>
          </div>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
