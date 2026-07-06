import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MobileNavProps {
  navItems: { path: string; label: string; icon: React.ElementType }[];
}

export const MobileNav: React.FC<MobileNavProps> = ({ navItems }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  return (
    <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe-bottom pointer-events-none'>
      <div
        className='flex items-center gap-1 py-2 px-2 rounded-full overflow-hidden pointer-events-auto bg-white/70 dark:bg-white/5 border border-black/[0.06] dark:border-white/10 shadow-sm mb-4'
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className='relative cursor-pointer flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-full transition-colors duration-200 text-[9px] font-black uppercase tracking-wider min-w-[56px]'
            >
              {isActive && (
                <motion.span
                  layoutId='glass-lamp'
                  className='absolute inset-0 rounded-full bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-sm'
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}

              {isActive && (
                <motion.span
                  layoutId='glass-glow'
                  className='pointer-events-none absolute top-0 left-[calc(50%-20px)] w-10 h-[3px] rounded-full bg-primary/60 dark:bg-primary/80'
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                >
                  <span className='absolute -top-1 left-[calc(50%-28px)] w-14 h-4 rounded-full blur-md bg-primary/20 dark:bg-primary/30' />
                  <span className='absolute top-0 left-[calc(50%-16px)] w-8 h-3 rounded-full blur-md bg-primary/20 dark:bg-primary/30' />
                </motion.span>
              )}

              <span
                className={`relative z-10 flex flex-col items-center gap-0.5 ${
                  isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className='shrink-0' />
                <span>{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
