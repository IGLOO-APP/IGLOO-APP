import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { MoreHorizontal, X } from 'lucide-react';

interface MobileNavProps {
  primaryNavItems: any[];
  secondaryNavItems: any[];
  showMoreMenu: boolean;
  setShowMoreMenu: (show: boolean) => void;
  isSecondaryActive: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  primaryNavItems,
  secondaryNavItems,
  showMoreMenu,
  setShowMoreMenu,
  isSecondaryActive,
}) => {
  const location = useLocation();

  return (
    <nav className='md:hidden fixed bottom-0 w-full bg-surface-light/90 dark:bg-surface-dark/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 pb-safe-bottom pt-1 px-2 z-50 shadow-2xl'>
      <div className='flex justify-around items-center h-16 max-w-lg mx-auto'>
        {primaryNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-14 gap-1 transition-all duration-300 ${isActive
                ? 'text-primary scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className='text-[10px] font-bold'>{item.label}</span>
            </NavLink>
          );
        })}

        <div className='relative'>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`relative flex flex-col items-center justify-center w-14 gap-1 transition-all duration-300 ${isSecondaryActive || showMoreMenu
              ? 'text-primary scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isSecondaryActive || showMoreMenu ? 'bg-primary/10' : ''}`}>
              {showMoreMenu ? <X size={22} strokeWidth={2.5} /> : <MoreHorizontal size={22} strokeWidth={2} />}
            </div>
            <span className='text-[10px] font-bold'>Mais</span>
            {(isSecondaryActive || location.pathname.includes('/settings')) && !showMoreMenu && (
              <span className='absolute top-0 right-1 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-surface-dark' />
            )}
          </button>

          {showMoreMenu && (
            <>
              <div className='fixed inset-0 z-40' onClick={() => setShowMoreMenu(false)} />
              <div className='absolute bottom-[72px] right-0 w-60 bg-white dark:bg-surface-dark rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 animate-scaleUp origin-bottom-right'>
                <div className='p-2 space-y-1'>
                  {secondaryNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}
                      >
                        <div className={`p-2 rounded-xl ${isActive ? 'bg-primary/10' : 'bg-slate-100 dark:bg-white/5'}`}>
                          <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className='text-sm font-bold'>{item.label}</span>
                        {isActive && <div className='ml-auto w-1.5 h-1.5 rounded-full bg-primary' />}
                      </NavLink>
                    );
                  })}
                </div>

                {/* Profile/Clerk Section at bottom of menu */}
                <div className='border-t border-gray-100 dark:border-white/5 p-3 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <UserButton 
                      afterSignOutUrl='/login'
                      appearance={{
                        elements: {
                          userButtonAvatarBox: 'w-8 h-8 border border-gray-200 dark:border-white/10 shadow-sm',
                          userButtonTrigger: 'focus:shadow-none focus:outline-none',
                          userButtonPopoverCard: 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 shadow-2xl rounded-2xl',
                          userButtonPopoverFooter: 'hidden',
                        }
                      }}
                    />
                    <div className='flex flex-col'>
                      <span className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight'>Minha Conta</span>
                      <span className='text-[10px] text-slate-500 font-bold uppercase'>Sair ou Configurar</span>
                    </div>
                  </div>
                  <NavLink to='/settings' className='p-2 text-slate-400 hover:text-primary transition-colors'>
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
