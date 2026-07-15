import React from 'react';
import { cn } from '@/lib/utils';

interface StickyTabBarProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyTabBar({ children, className }: StickyTabBarProps) {
  return (
    <div
      className={cn(
        'px-4 md:px-8 py-3 sticky top-0 z-20 flex justify-center',
        className
      )}
    >
      {children}
    </div>
  );
}
