import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Receipt, FileText, Moon, Sun, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Início', icon: LayoutDashboard },
  { path: '/properties', label: 'Imóveis', icon: Building2 },
  { path: '/tenants', label: 'Inquilinos', icon: Users },
  { path: '/messages', label: 'Mensagens', icon: MessageSquare },
  { path: '/contracts', label: 'Contratos', icon: FileText },
  { path: '/financials', label: 'Finanças', icon: Receipt },
];

const Layout: React.FC = () => {
  const location = useLocation();
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

  return (
    <div className="flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-white/5 h-full shrink-0 transition-colors z-20">
        <div className="p-6 flex items-center gap-3 mb-2">
           <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
             <div className="w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-lg shadow-black/10 group-hover:scale-105 transition-transform">
               I
             </div>
             <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Igloo</h1>
           </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out ${
                  isActive
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
                  
                  <span className={`text-sm font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>

                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,200,236,0.6)] animate-scaleUp"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 mx-4 mb-4 border-t border-gray-100 dark:border-white/5 space-y-1">
            <button 
                onClick={toggleTheme}
                className="group flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
            >
                <div className="group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </div>
                <span className="font-medium text-sm">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative h-full w-full bg-background-light dark:bg-background-dark transition-colors duration-300">
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0 w-full scroll-smooth">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 w-full bg-surface-light/90 dark:bg-surface-dark/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 pb-safe-bottom pt-1 px-2 z-50 shadow-2xl">
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
            {navItems.slice(0, 5).map((item) => {
               const isActive = location.pathname === item.path;
               return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center w-16 gap-1 transition-all duration-300 ${
                    isActive ? 'text-primary scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-bold">{item.label}</span>
                </NavLink>
               )
            })}
            <button 
                onClick={logout}
                className="flex flex-col items-center justify-center w-16 gap-1 text-slate-300 hover:text-red-400 transition-colors active:scale-90"
            >
                <LogOut size={22} strokeWidth={2} />
                <span className="text-[10px] font-medium">Sair</span>
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
};

export default Layout;