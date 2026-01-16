import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home, Receipt, User, LogOut, Moon, Sun, LifeBuoy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TenantLayout: React.FC = () => {
  const { logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  };

  const navItems = [
    { path: '/tenant', label: 'Início', icon: Home },
    { path: '/tenant/payments', label: 'Pagamentos', icon: Receipt },
    { path: '/tenant/maintenance', label: 'Ajuda', icon: LifeBuoy },
    { path: '/tenant/profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 h-full shrink-0 transition-colors">
        <div className="p-6 flex items-center gap-2">
           <Link to="/tenant" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">I</div>
             <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Igloo <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded ml-1">Inquilino</span></h1>
           </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/tenant'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <button 
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all group"
            >
                {isDark ? <Sun size={20} className="group-hover:text-amber-400" /> : <Moon size={20} className="group-hover:text-amber-500" />}
                <span className="font-medium text-sm">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>
            <button 
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
            >
                <LogOut size={20} />
                <span className="font-medium text-sm">Sair</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative h-full w-full">
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0 w-full scroll-smooth">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe-bottom pt-2 px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/tenant'}
                className={({ isActive }) => `flex flex-col items-center justify-center w-14 gap-1 transition-all duration-200 active:scale-90 ${
                  isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <item.icon size={22} strokeWidth={2} />
                <span className="text-[9px] font-bold">{item.label}</span>
              </NavLink>
            ))}
            <button 
                onClick={logout}
                className="flex flex-col items-center justify-center w-14 gap-1 text-slate-300 hover:text-red-400 transition-colors active:scale-90"
            >
                <LogOut size={22} strokeWidth={2} />
                <span className="text-[9px] font-medium">Sair</span>
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
};

export default TenantLayout;