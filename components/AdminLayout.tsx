import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    LifeBuoy,
    Settings,
    Moon,
    Sun,
    LogOut,
    ShieldCheck,
    UserCog
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Gerenciar Usuários', icon: Users },
    { path: '/admin/team', label: 'Minha Equipe', icon: UserCog },
    { path: '/admin/subscriptions', label: 'Assinaturas', icon: CreditCard },
    { path: '/admin/support', label: 'Central de Suporte', icon: LifeBuoy },
    { path: '/admin/settings', label: 'Configurações', icon: Settings },
];

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkTheme();
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') checkTheme();
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
        <div className="flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300 pointer-events-auto">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 dark:bg-surface-dark border-r border-slate-800 dark:border-white/5 h-full shrink-0 transition-colors z-20 text-slate-300 pointer-events-auto">
                <div className="p-6 flex items-center gap-3 mb-2">
                    <Link to="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">Admin</h1>
                            <p className="text-[10px] uppercase font-bold text-amber-500 tracking-widest">Igloo Plataforma</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-4">
                    {adminNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                `group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 ease-out ${isActive
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`transition-colors duration-300 ${isActive ? 'text-white' : 'group-hover:text-slate-200'}`}>
                                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>

                                    <span className={`text-sm font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 mx-4 mb-4 border-t border-white/5 space-y-1">
                    <button
                        onClick={toggleTheme}
                        className="group flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer transition-all duration-200"
                    >
                        <div className="group-hover:text-amber-500 transition-colors">
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </div>
                        <span className="font-medium text-sm">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
                    </button>
                    <button
                        onClick={logout}
                        className="group flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 cursor-pointer transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden flex flex-col relative h-full w-full bg-background-light dark:bg-background-dark transition-colors duration-300 pointer-events-auto">
                {/* Header */}
                <header className="h-20 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {adminNavItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                        <p className="text-xs text-slate-500">Bem-vindo, {user?.name}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-tighter">Super Admin</span>
                            <span className="text-[10px] text-slate-400">Acesso Total</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 ring-2 ring-amber-500 font-bold flex items-center justify-center text-slate-600 dark:text-white">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pb-24 md:pb-0 w-full scroll-smooth">
                    <Outlet />
                </div>

                {/* Mobile Nav */}
                <nav className="md:hidden fixed bottom-0 w-full bg-slate-900 dark:bg-surface-dark/95 backdrop-blur-xl border-t border-white/5 pb-safe-bottom pt-1 px-2 z-50">
                    <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                        {adminNavItems.slice(0, 4).map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={`relative flex flex-col items-center justify-center w-16 gap-1 transition-all duration-300 ${isActive ? 'text-amber-500 scale-105' : 'text-slate-500'
                                        }`}
                                >
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-[10px] font-bold truncate w-full text-center">{item.label.split(' ')[0]}</span>
                                </NavLink>
                            )
                        })}
                        <button
                            onClick={logout}
                            className="flex flex-col items-center justify-center w-16 gap-1 text-slate-500 hover:text-red-400"
                        >
                            <LogOut size={22} />
                            <span className="text-[10px] font-medium">Sair</span>
                        </button>
                    </div>
                </nav>
            </main>
        </div>
    );
};

export default AdminLayout;
