import React from 'react'

interface LiquidGlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function LiquidGlassCard({ children, className = '', onClick }: LiquidGlassCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[32px] border border-white/[0.08] ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      <div
        className='absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent backdrop-blur-[2px]'
        style={{ zIndex: 0 }}
      />
      <div
        className='absolute inset-0 rounded-[32px]'
        style={{
          boxShadow:
            'inset 2px 2px 6px 0 rgba(255,255,255,0.3), inset -1px -1px 3px 0 rgba(255,255,255,0.1)',
          zIndex: 1,
        }}
      />
      <div
        className='absolute inset-0 rounded-[32px]'
        style={{
          boxShadow: '0 4px 24px rgba(0,0,0,0.25), 0 1px 4px rgba(0,0,0,0.1)',
          zIndex: -1,
        }}
      />
      <div className='relative z-[3]'>{children}</div>
    </div>
  )
}