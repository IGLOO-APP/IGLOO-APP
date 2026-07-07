import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface GlassNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface GlassmorphismNavProps {
  items: GlassNavItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function GlassmorphismNav({ items, activeTab, onChange, className }: GlassmorphismNavProps) {
  return (
    <div className='w-full flex justify-start md:justify-center'>
      {/* Mobile: full-width static bar, Desktop: pill */}
      <div
        className={cn(
          // Mobile: stretch full width, no scroll
          'flex items-center w-full md:w-auto',
          'gap-1 py-1 px-1 rounded-full overflow-hidden',
          // Frosted glass pill
          'bg-muted/80',
          'border border-border',
          'shadow-sm',
          className
        )}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                'relative cursor-pointer flex flex-col items-center justify-center gap-0.5',
                'flex-1 md:flex-none md:shrink-0',
                'text-[9px] font-black uppercase tracking-wider',
                'px-4 py-2 rounded-full transition-colors duration-200 min-w-[56px]',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Spring-animated active background */}
              {isActive && (
                <motion.span
                  layoutId='glass-lamp'
                  className='absolute inset-0 rounded-full bg-background border border-border shadow-sm'
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}

              {/* Lamp glow above active pill */}
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

              <Icon size={20} className='shrink-0 relative z-10' />
              <span className='relative z-10'>{item.label}</span>

              {/* Badge dot */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className='absolute -top-0.5 -right-0.5 flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75' />
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
