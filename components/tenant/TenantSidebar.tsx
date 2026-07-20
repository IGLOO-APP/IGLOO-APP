import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { Lock, Zap, Sun, Moon, LogOut } from 'lucide-react';
import { Sidebar as SidebarBase } from '../ui/sidebar';
import { preloadRoute } from '../../lib/routePreloader';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  description: string;
  disabled: boolean;
}

interface TenantSidebarProps {
  navItems: NavItem[];
  userName?: string;
  onboardingRequired: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  logout: () => void;
}

export const TenantSidebar: React.FC<TenantSidebarProps> = ({
  navItems,
  userName,
  onboardingRequired,
  isDark,
  toggleTheme,
  logout,
}) => {
  return (
    <SidebarBase
      collapsible='none'
      className='hidden md:flex sticky top-0 h-full w-80 flex-col py-4 justify-between select-none text-sidebar-foreground transition-colors duration-200 relative overflow-hidden lg-sidebar bg-sidebar border-r border-sidebar-border'
    >
      <div className='flex flex-col flex-grow relative z-10'>
        <div className='px-6 mb-8 mt-4'>
          <Link to='/tenant' className='inline-block'>
            <h1 className='font-sans text-4xl font-bold tracking-tight text-foreground transition-colors duration-200'>
              Igloo
            </h1>
          </Link>
        </div>

        <ul className='flex flex-col gap-0.5 px-6 flex-grow overflow-y-auto scroll-smooth custom-scrollbar'>
          <p className='px-4 mb-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]'>
            Menu Principal
          </p>
          {navItems.map((item) => {
            if (item.disabled) {
              return (
                <li key={item.path}>
                  <div
                    title='Complete o onboarding para desbloquear este menu'
                    className='flex items-center gap-4 px-6 py-3 rounded-xl text-sidebar-foreground/40 cursor-not-allowed select-none'
                  >
                    <item.icon size={20} strokeWidth={1.8} />
                    <span className='text-sm font-medium'>{item.label}</span>
                    <Lock size={12} strokeWidth={1.8} className='ml-auto shrink-0' />
                  </div>
                </li>
              );
            }

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/tenant'}
                  onMouseEnter={() => preloadRoute(item.path)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'sidebar-item-active'
                        : 'text-sidebar-foreground/70 hover:text-white hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={20}
                        strokeWidth={1.8}
                        className={`transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-sidebar-foreground/50'
                        }`}
                      />
                      <span className='text-sm font-medium'>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
          {onboardingRequired && (
            <li className='px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20'>
              <div className='flex items-center gap-2'>
                <Zap size={13} strokeWidth={1.8} className='text-amber-500 shrink-0' />
                <span className='text-[10px] font-semibold text-amber-400 uppercase tracking-[0.1em]'>
                  Complete o cadastro
                </span>
              </div>
            </li>
          )}
        </ul>
      </div>

      <div className='px-4 flex flex-col gap-1.5 pt-2 border-t border-sidebar-border mx-3 mt-auto relative z-10'>
        <Link to='/tenant/settings' className='flex items-center gap-3 group/profile'>
          <div className='pointer-events-none transition-transform duration-200 group-hover/profile:scale-105'>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-9 h-9 rounded-full',
                  userButtonTrigger: 'pointer-events-none',
                },
              }}
            />
          </div>
          <div className='flex flex-col min-w-0'>
            <span className='text-sm font-semibold text-foreground truncate group-hover/profile:text-primary transition-colors duration-200'>
              {userName || 'Carregando...'}
            </span>
            <span className='text-xs text-muted-foreground capitalize'>Inquilino</span>
          </div>
        </Link>

        <div className='flex flex-col gap-0.5'>
          <button
            onClick={toggleTheme}
            className='flex items-center gap-3 px-3 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-200 text-left w-full'
          >
            {isDark ? (
              <>
                <Sun size={18} strokeWidth={1.8} className='text-sidebar-foreground/50' />
                <span className='text-sm font-medium'>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon size={18} strokeWidth={1.8} className='text-sidebar-foreground/50' />
                <span className='text-sm font-medium'>Modo Escuro</span>
              </>
            )}
          </button>
          <button
            onClick={logout}
            className='flex items-center gap-3 px-3 py-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 text-left w-full'
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span className='text-sm font-medium'>Sair</span>
          </button>
        </div>
      </div>
    </SidebarBase>
  );
};
