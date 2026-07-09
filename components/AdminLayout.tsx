import React from 'react';
import { Outlet, NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LifeBuoy,
  Settings,
  ShieldCheck,
  UserCog,
  Megaphone,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { useAuth } from '../context/AuthContext';
import { Toolbar, Tabbar, TabbarLink } from 'konsta/react';

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Gerenciar Usuários', icon: Users },
  { path: '/admin/team', label: 'Minha Equipe', icon: UserCog },
  { path: '/admin/subscriptions', label: 'Assinaturas', icon: CreditCard },
  { path: '/admin/support', label: 'Central de Suporte', icon: LifeBuoy },
  { path: '/admin/conversations', label: 'Conversas', icon: MessageSquare },
  { path: '/admin/announcements', label: 'Comunicados', icon: Megaphone },
  { path: '/admin/conversion', label: 'Vendas', icon: TrendingUp },
  { path: '/admin/settings', label: 'Configurações', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const filteredNavItems = adminNavItems.filter((item) => {
    if (item.path === '/admin/team') {
      return user?.admin_type === 'super';
    }
    return true;
  });

  return (
    <div className='flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark pointer-events-auto'>
      {/* Sidebar */}
      <aside className='hidden md:flex flex-col w-64 bg-slate-900 dark:bg-surface-dark border-r border-slate-800 dark:border-white/5 h-full shrink-0 z-20 text-slate-300 pointer-events-auto'>
        <div className='p-6 flex items-center gap-3 mb-2'>
          <Link
            to='/admin'
            className='flex items-center gap-3 hover:opacity-80 transition-opacity group'
          >
            <div className='w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform'>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className='text-xl font-extrabold text-white tracking-tight leading-tight'>
                Admin
              </h1>
              <p className='text-[10px] uppercase font-bold text-primary tracking-widest'>
                Igloo Plataforma
              </p>
            </div>
          </Link>
        </div>

        <nav className='flex-1 px-4 space-y-1.5 overflow-y-auto mt-4'>
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 ease-out ${
                  isActive
                    ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20 font-bold'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`transition-colors duration-300 ${isActive ? 'text-slate-900' : 'group-hover:text-slate-200'}`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  <span
                    className={`text-sm font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className='p-4 mx-4 mb-4 border-t border-white/5 space-y-1'>
          <Link
            to='/admin/settings'
            className='flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent hover:bg-white/5 transition-all group'
          >
            <div className='pointer-events-none'>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-10 h-10 rounded-xl',
                    userButtonTrigger: 'pointer-events-none',
                  },
                }}
              />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-sm font-bold text-white truncate'>
                {user?.name || 'Administrador'}
              </span>
              <span className='text-[10px] font-medium text-slate-500 capitalize'>
                Administrador {user?.admin_type === 'super' ? 'Master' : ''}
              </span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className='flex-1 overflow-hidden flex flex-col relative h-full w-full bg-background-light dark:bg-background-dark pointer-events-auto'>
        {/* Header */}
        <header className='h-20 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 shrink-0'>
          <div>
            <h2 className='text-lg font-bold text-slate-900 dark:text-white'>
              {filteredNavItems.find((i) => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
        </header>

        <div className='flex-1 overflow-y-auto pb-24 md:pb-0 w-full scroll-smooth'>
          <Outlet />
        </div>

        {/* Mobile Nav — Konsta Tabbar */}
        <Toolbar className='md:hidden fixed bottom-0 left-0 right-0 z-50' tabbar>
          <Tabbar>
            {filteredNavItems.slice(0, 4).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <TabbarLink
                  key={item.path}
                  active={isActive}
                  label={item.label.split(' ')[0]}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </TabbarLink>
              );
            })}
          </Tabbar>
        </Toolbar>
      </main>
    </div>
  );
};

export default AdminLayout;
