import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { User } from '../../types';
import { Sun, Moon, LogOut } from 'lucide-react';
import { Sidebar as SidebarRoot } from '../ui/sidebar';
import { preloadRoute } from '../../lib/routePreloader';
import { FlickeringGrid } from '../ui/FlickeringGrid';

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
      className='hidden md:flex h-screen sticky top-0 !w-80 flex-col py-6 justify-between select-none text-sidebar-foreground border-r border-sidebar-border transition-colors duration-200 relative overflow-hidden'
    >
      {/* Flickering grid background */}
      <div className='absolute inset-0 bg-card'>
        <FlickeringGrid squareSize={4} gridGap={6} maxOpacity={0.35} color='#6B7280' />
      </div>

      <div className='flex flex-col flex-grow relative z-10'>
        {/* Header */}
        <div className='px-6 mb-8 mt-4'>
          <Link to='/' className='inline-block'>
            <h1 className='font-sans text-4xl font-bold tracking-tight text-foreground transition-colors duration-200'>
              Igloo
            </h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className='flex flex-col gap-1 px-3 flex-grow overflow-y-auto scroll-smooth custom-scrollbar'>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onMouseEnter={() => preloadRoute(item.path)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/15 backdrop-blur-md text-primary font-semibold shadow-sm'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`transition-colors duration-200 ${
                          isActive ? 'text-primary' : 'text-sidebar-foreground/50'
                        }`}
                        size={20}
                      />
                      <span className='text-sm font-medium'>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}

          {/* Admin Items */}
          {user?.role === 'admin' && !impersonatingFrom && adminItems && (
            <>
              <div className='my-3 border-t border-sidebar-border mx-2' />
              <span className='px-4 mb-1 block text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider'>
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
                        `flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-primary/15 backdrop-blur-md text-primary font-semibold shadow-sm'
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`transition-colors duration-200 ${
                              isActive ? 'text-primary' : 'text-sidebar-foreground/50'
                            }`}
                            size={20}
                          />
                          <span className='text-sm font-medium'>{item.label}</span>
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
      <div className='px-4 flex flex-col gap-4 pt-4 border-t border-sidebar-border mx-3 mt-auto relative z-10'>
        {/* Profile */}
        <Link to='/settings' className='flex items-center gap-3 group/profile'>
          {user?.avatar_url || user?.avatar ? (
            <img
              alt={`${user.name} Avatar`}
              className='w-9 h-9 rounded-full object-cover border border-sidebar-border shadow-sm transition-transform duration-200 group-hover/profile:scale-105'
              src={user.avatar_url || user.avatar}
            />
          ) : (
            <div className='pointer-events-none w-9 h-9 transition-transform duration-200 group-hover/profile:scale-105'>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-9 h-9 rounded-full',
                    userButtonTrigger: 'pointer-events-none',
                  },
                }}
              />
            </div>
          )}
          <div className='flex flex-col min-w-0'>
            <span className='text-sm font-semibold text-foreground truncate group-hover/profile:text-primary transition-colors duration-200'>
              {user?.name || 'Arthur Alencar'}
            </span>
            <span className='text-xs text-muted-foreground capitalize'>
              {user?.role === 'owner'
                ? 'Proprietário'
                : user?.role === 'admin'
                  ? 'Administrador'
                  : 'Inquilino'}
            </span>
          </div>
        </Link>

        {/* System Actions */}
        <div className='flex flex-col gap-0.5 mt-1'>
          <button
            onClick={toggleTheme}
            className='flex items-center gap-3 px-3 py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-all duration-200 text-left w-full'
          >
            {isDark ? (
              <>
                <Sun size={18} className='text-sidebar-foreground/50' />
                <span className='text-sm font-medium'>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon size={18} className='text-sidebar-foreground/50' />
                <span className='text-sm font-medium'>Modo Escuro</span>
              </>
            )}
          </button>
          <button
            onClick={logout}
            className='flex items-center gap-3 px-3 py-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 text-left w-full'
          >
            <LogOut size={18} />
            <span className='text-sm font-medium'>Sair</span>
          </button>
        </div>
      </div>
    </SidebarRoot>
  );
};
