import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserButton } from '@clerk/clerk-react';
import { MoreHorizontal, X, Moon, Sun, LogOut } from 'lucide-react';

interface MobileNavProps {
  primaryNavItems: any[];
  secondaryNavItems: any[];
  showMoreMenu: boolean;
  setShowMoreMenu: (show: boolean) => void;
  isSecondaryActive: boolean;
  isDark: boolean;
  toggleTheme: () => void;
  logout: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  primaryNavItems,
  secondaryNavItems,
  showMoreMenu,
  setShowMoreMenu,
  isSecondaryActive,
  isDark,
  toggleTheme,
  logout,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  return (
    <nav
      className='md:hidden fixed bottom-0 w-full z-50 pb-safe-bottom'
      style={{
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      {/* Frosted glass background */}
      <div className='absolute inset-0 bg-white/70 dark:bg-[#0f1419]/80 border-t border-black/[0.06] dark:border-white/10' />

      <div className='relative flex justify-around items-center h-[72px] max-w-lg mx-auto px-2'>
        {primaryNavItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className='relative flex flex-col items-center justify-center w-14 gap-0.5 cursor-pointer'
            >
              {/* Spring-animated active pill */}
              {isActive && (
                <motion.span
                  layoutId='glass-lamp'
                  className='absolute inset-0 rounded-2xl bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-sm'
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}

              {/* Lamp glow above active tab */}
              {isActive && (
                <motion.span
                  layoutId='glass-glow'
                  className='pointer-events-none absolute -top-0 left-[calc(50%-16px)] w-8 h-[3px] rounded-full bg-primary/60 dark:bg-primary/80'
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                >
                  <span className='absolute -top-1 left-[calc(50%-20px)] w-10 h-4 rounded-full blur-md bg-primary/20 dark:bg-primary/30' />
                  <span className='absolute top-0 left-[calc(50%-12px)] w-6 h-3 rounded-full blur-md bg-primary/20 dark:bg-primary/30' />
                </motion.span>
              )}

              <div
                className={`relative z-10 p-1.5 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`relative z-10 text-[9px] font-black uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More button */}
        <div className='relative'>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className='relative flex flex-col items-center justify-center w-14 gap-0.5 cursor-pointer'
          >
            {(isSecondaryActive || showMoreMenu) && (
              <motion.span
                layoutId='glass-lamp'
                className='absolute inset-0 rounded-2xl bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-sm'
                initial={false}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}

            {(isSecondaryActive || showMoreMenu) && (
              <motion.span
                layoutId='glass-glow'
                className='pointer-events-none absolute -top-0 left-[calc(50%-16px)] w-8 h-[3px] rounded-full bg-primary/60 dark:bg-primary/80'
                initial={false}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              >
                <span className='absolute -top-1 left-[calc(50%-20px)] w-10 h-4 rounded-full blur-md bg-primary/20 dark:bg-primary/30' />
                <span className='absolute top-0 left-[calc(50%-12px)] w-6 h-3 rounded-full blur-md bg-primary/20 dark:bg-primary/30' />
              </motion.span>
            )}

            <div
              className={`relative z-10 p-1.5 rounded-xl transition-colors ${
                isSecondaryActive || showMoreMenu
                  ? 'text-primary'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {showMoreMenu ? (
                <X size={20} strokeWidth={2.5} />
              ) : (
                <MoreHorizontal size={20} strokeWidth={2} />
              )}
            </div>
            <span
              className={`relative z-10 text-[9px] font-black uppercase tracking-wider transition-colors ${
                isSecondaryActive || showMoreMenu
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              Mais
            </span>

            {(isSecondaryActive || activePath.includes('/settings')) && !showMoreMenu && (
              <span className='absolute top-1 right-1 z-20 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-[#0f1419]' />
            )}
          </button>

          {showMoreMenu && (
            <>
              <div className='fixed inset-0 z-40' onClick={() => setShowMoreMenu(false)} />
              <div className='absolute bottom-[76px] right-0 w-60 bg-white/80 dark:bg-[#0f1419]/80 backdrop-blur-2xl rounded-3xl border border-black/[0.06] dark:border-white/10 overflow-hidden z-50 shadow-2xl animate-scaleUp origin-bottom-right'>
                <div className='p-2 space-y-1'>
                  {secondaryNavItems.map((item) => {
                    const isActive = activePath === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setShowMoreMenu(false)}
                        className='relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors cursor-pointer'
                      >
                        {isActive && (
                          <motion.span
                            layoutId='glass-lamp-dropdown'
                            className='absolute inset-0 rounded-2xl bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-sm'
                            initial={false}
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        <div
                          className={`relative z-10 p-2 rounded-xl ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}
                        >
                          <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span
                          className={`relative z-10 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <div className='relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-primary' />
                        )}
                      </NavLink>
                    );
                  })}

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className='relative flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold transition-colors cursor-pointer'
                  >
                    <div className='relative z-10 p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-amber-500 dark:text-amber-400'>
                      {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </div>
                    <span className='relative z-10 text-slate-600 dark:text-slate-300'>
                      {isDark ? 'Modo Claro' : 'Modo Escuro'}
                    </span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className='relative flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 cursor-pointer'
                  >
                    <div className='relative z-10 p-2 rounded-xl bg-slate-100 dark:bg-white/5'>
                      <LogOut size={18} />
                    </div>
                    <span className='relative z-10 text-slate-600 dark:text-slate-300'>Sair</span>
                  </button>
                </div>

                {/* Profile section */}
                <div className='border-t border-black/[0.06] dark:border-white/10 p-3 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <UserButton
                      afterSignOutUrl='/login'
                      appearance={{
                        elements: {
                          userButtonAvatarBox:
                            'w-8 h-8 border border-gray-200 dark:border-white/10 shadow-sm',
                          userButtonTrigger: 'focus:shadow-none focus:outline-none',
                          userButtonPopoverCard:
                            'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 shadow-2xl rounded-2xl',
                          userButtonPopoverFooter: 'hidden',
                        },
                      }}
                    />
                    <div className='flex flex-col'>
                      <span className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                        Minha Conta
                      </span>
                      <span className='text-[10px] text-slate-500 font-bold uppercase'>
                        Sair ou Configurar
                      </span>
                    </div>
                  </div>
                  <NavLink
                    to='/settings'
                    onClick={() => setShowMoreMenu(false)}
                    className='p-2 text-slate-400 hover:text-primary transition-colors'
                  >
                    <MoreHorizontal size={20} />
                  </NavLink>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
