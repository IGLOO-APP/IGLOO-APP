import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Receipt,
  FileText,
  MessageSquare,
  Settings as SettingsIcon,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Sidebar } from './layout/Sidebar';
import { MobileNav } from './layout/MobileNav';
import { useSearch } from '../context/SearchContext';
import CommandPalette from './layout/CommandPalette';

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

const primaryNavItems = navItems.slice(0, 4);
const secondaryNavItems = navItems.slice(4);

const Layout: React.FC = () => {
  const location = useLocation();
  const { logout, impersonatingFrom, user, stopImpersonation } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isOpen, closeSearch } = useSearch();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    setShowMoreMenu(false);
  }, [location.pathname]);

  const isSecondaryActive = secondaryNavItems.some(item => location.pathname === item.path);

  return (
    <div className='flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300'>
      <CommandPalette isOpen={isOpen} onClose={closeSearch} />
      <Sidebar
        navItems={navItems}
        adminItems={adminItems}
        user={user}
        impersonatingFrom={impersonatingFrom}
        isDark={isDark}
        toggleTheme={toggleTheme}
        logout={logout}
      />

      <main className='flex-1 overflow-hidden flex flex-col relative h-full w-full bg-background-light dark:bg-background-dark transition-colors duration-300'>
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

        <MobileNav
          primaryNavItems={primaryNavItems}
          secondaryNavItems={secondaryNavItems}
          showMoreMenu={showMoreMenu}
          setShowMoreMenu={setShowMoreMenu}
          isSecondaryActive={isSecondaryActive}
        />
      </main>
    </div>
  );
};

export default Layout;
