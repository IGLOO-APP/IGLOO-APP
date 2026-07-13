import React from 'react';
import { FlickeringGrid } from '../ui/FlickeringGrid';

interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
}

export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div className={`relative min-h-screen w-full bg-black ${className || ''}`}>
      <FlickeringGrid squareSize={4} gridGap={6} flickerChance={0.1} maxOpacity={0.5} color='#6B7280' />
      <div className='relative z-10'>{children}</div>
    </div>
  );
}
