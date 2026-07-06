import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUp, ArrowDown, ChevronRight, ChevronDown, LucideIcon } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';

export const Sparkline = ({ data, color }: { data: number[]; color: string }) => (
  <div className='h-8 w-16 sm:h-10 sm:w-20 md:w-24 xl:w-16 xl:h-8 2xl:w-24 2xl:h-10'>
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart data={data.map((val, i) => ({ i, val }))}>
        <Line type='monotone' dataKey='val' stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

interface HeroCardProps {
  title: string;
  value: string;
  subtext: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
  color: string;
  sparkData?: number[];
  variant?: 'default' | 'critical' | 'muted';
  tooltip?: string;
}

export const HeroCard = ({
  title,
  value,
  subtext,
  trend,
  trendUp,
  icon: Icon,
  color,
  sparkData,
  variant = 'default',
  tooltip,
}: HeroCardProps) => {
  return (
    <div
      className={`h-full p-4 rounded-[32px] active-tap transition-all duration-500 group relative flex flex-col justify-between ${
        variant === 'critical'
          ? 'bg-white dark:bg-surface-dark border border-red-300 dark:border-red-800/40 shadow-sm'
          : variant === 'muted'
            ? 'bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/10 opacity-70'
            : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md'
      }`}
    >
      {variant === 'critical' && (
        <div className='absolute top-3 right-3 z-20'>
          <span className='flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 text-red-600 rounded-full text-[8px] font-black uppercase tracking-widest'>
            <span className='w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse' />
            Atenção
          </span>
        </div>
      )}

      <div
        className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity duration-500 ${color} rotate-12 group-hover:rotate-0 pointer-events-none`}
      >
        <Icon size={120} />
      </div>

      <div className='relative z-10 w-full'>
        <div className='flex justify-between items-start mb-3 h-12'>
          <div
            className={`p-2.5 rounded-xl shrink-0 transition-all duration-500 ${
              variant === 'critical'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                : variant === 'muted'
                  ? 'bg-slate-100 dark:bg-white/5 text-slate-400'
                  : `${color.replace('text-', 'bg-').replace('500', '100')} dark:bg-white/5 group-hover:bg-primary/20`
            }`}
          >
            <Icon
              size={18}
              className={`w-5 h-5 group-hover:scale-110 transition-transform duration-500 ${
                variant === 'critical'
                  ? 'text-red-500'
                  : variant === 'muted'
                    ? 'text-slate-400'
                    : color
              }`}
            />
          </div>
          {sparkData ? (
            <div className='hidden sm:block pt-1 shrink-0'>
              <Sparkline data={sparkData} color={trendUp ? '#10b981' : '#ef4444'} />
            </div>
          ) : (
            <div className='hidden sm:block shrink-0 w-24 h-8'></div>
          )}
        </div>

        <div className='flex flex-col gap-0.5'>
          <div className='flex items-start gap-1.5'>
            <p
              className={`text-[10px] font-black uppercase tracking-[0.15em] leading-tight ${
                variant === 'muted' ? 'text-slate-400' : 'text-slate-400 dark:text-slate-400'
              }`}
            >
              {title}
            </p>
            {tooltip && (
              <div className='relative shrink-0 group/tooltip'>
                <div className='w-3 h-3 rounded-full bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center text-[7px] font-bold leading-none cursor-help'>
                  ?
                </div>
                <div
                  className='absolute z-[100] w-52 p-2.5 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 translate-y-1 group-hover/tooltip:translate-y-0'
                  style={{ bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' }}
                >
                  <p className='text-[9px] font-black uppercase tracking-[0.15em] mb-1 text-slate-300'>
                    {title}
                  </p>
                  <p className='text-[10px] leading-snug text-slate-400 font-medium'>{tooltip}</p>
                  <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95' />
                </div>
              </div>
            )}
          </div>
          <h3
            className={`text-xl xl:text-2xl font-black tracking-tighter truncate ${
              variant === 'muted'
                ? 'text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {variant === 'muted' && !value ? '--' : value}
          </h3>
        </div>
      </div>

      <div className='relative z-10 flex flex-wrap items-center gap-2 mt-2'>
        {variant !== 'muted' && (
          <span
            className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-lg ${
              trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            } whitespace-nowrap`}
          >
            {trendUp ? <ArrowUp size={9} /> : <ArrowDown size={9} />} {trend}
          </span>
        )}
        <span
          className={`text-[10px] font-bold uppercase tracking-wide line-clamp-1 ${
            variant === 'muted' ? 'text-slate-400 opacity-60' : 'text-slate-500 opacity-60'
          }`}
        >
          {variant === 'muted' ? 'Indisponível' : subtext}
        </span>
      </div>
    </div>
  );
};

interface AlertBadgeProps {
  icon: LucideIcon;
  label: string;
  count: number;
  color: string;
  onClick: () => void;
}

export const AlertBadge = ({ icon: Icon, label, count, color, onClick }: AlertBadgeProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-[32px] border transition-all duration-300 active-tap shrink-0 ${color} bg-opacity-5 border-opacity-10 hover:bg-opacity-15 hover:border-opacity-20 shadow-sm hover:shadow-md group/alert`}
  >
    <div className='relative shrink-0'>
      <div
        className={`absolute inset-0 rounded-full ${color.replace('text-', 'bg-')} opacity-0 group-hover/alert:opacity-20 animate-ping`}
      />
      <Icon
        size={20}
        className='shrink-0 transition-transform duration-500 group-hover/alert:scale-110'
      />
      {count > 0 && (
        <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark shadow-[0_0_10px_rgba(239,68,68,0.5)]'></span>
      )}
    </div>
    <div className='text-left flex-1 min-w-0'>
      <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 truncate'>
        {label}
      </p>
      {count > 0 ? (
        <p className='text-sm font-black truncate flex items-center gap-1.5 text-slate-900 dark:text-white'>
          {count} <span className='opacity-50 font-bold'>pendentes</span>
        </p>
      ) : (
        <p className='text-sm font-bold opacity-40 italic'>Tudo em ordem</p>
      )}
    </div>
    <ChevronRight
      size={16}
      className='opacity-30 group-hover/alert:opacity-100 group-hover/alert:translate-x-1 transition-all duration-300 text-slate-400 group-hover:text-primary'
    />
  </button>
);

// ─── Shared Design System Components ─────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  iconColor?: string;
  tooltip?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  action,
  icon: Icon,
  iconColor = 'text-primary',
  tooltip,
}: SectionHeaderProps) => {
  return (
    <div className='flex justify-between items-center'>
      <div className='flex items-center gap-3'>
        {Icon && (
          <div
            className={`w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center ${iconColor} shrink-0`}
          >
            <Icon size={18} />
          </div>
        )}
        <div>
          <h2 className='text-base lg:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2'>
            {title}
            {tooltip && (
              <div className='relative shrink-0 group/tooltip'>
                <div className='w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center text-[8px] font-bold leading-none cursor-help'>
                  ?
                </div>
                <div
                  className='absolute z-[100] w-56 p-3 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 translate-y-1 group-hover/tooltip:translate-y-0'
                  style={{ bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' }}
                >
                  <p className='text-[10px] font-black uppercase tracking-[0.15em] mb-1 text-slate-300'>
                    {title}
                  </p>
                  <p className='text-[11px] leading-snug text-slate-400 font-medium'>{tooltip}</p>
                  <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95' />
                </div>
              </div>
            )}
          </h2>
          {subtitle && (
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className='shrink-0'>{action}</div>}
    </div>
  );
};

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState = ({ icon: Icon, message, action, className = '' }: EmptyStateProps) => (
  <div className={`flex flex-col items-center justify-center py-10 ${className}`}>
    <div className='w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 mb-4'>
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center max-w-xs'>
      {message}
    </p>
    {action && (
      <button
        onClick={action.onClick}
        className='px-4 py-2 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95'
      >
        {action.label}
      </button>
    )}
  </div>
);

export const HeroCardSkeleton = () => (
  <div className='h-full bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-white/5 animate-pulse'>
    <div className='flex justify-between items-start mb-6'>
      <div className='w-14 h-14 rounded-xl bg-slate-200 dark:bg-white/10' />
      <div className='w-20 h-8 rounded bg-slate-200 dark:bg-white/10' />
    </div>
    <div className='space-y-3'>
      <div className='h-3 w-28 rounded bg-slate-200 dark:bg-white/10' />
      <div className='h-9 w-36 rounded bg-slate-200 dark:bg-white/10' />
    </div>
    <div className='flex gap-2 mt-4'>
      <div className='h-6 w-16 rounded-lg bg-slate-200 dark:bg-white/10' />
      <div className='h-6 w-24 rounded-lg bg-slate-200 dark:bg-white/10' />
    </div>
  </div>
);

interface PeriodOption {
  label: string;
  value: string;
}

interface PeriodSelectorProps {
  options: PeriodOption[];
  value: string;
  onChange: (value: string) => void;
}

export const PeriodSelector = ({ options, value, onChange }: PeriodSelectorProps) => (
  <Menu as='div' className='relative inline-block text-left'>
    <MenuButton className='flex items-center gap-2 pl-4 pr-9 py-2 rounded-2xl bg-slate-50 dark:bg-black/20 border border-transparent text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-all relative'>
      {value}
      <ChevronDown size={12} className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400' />
    </MenuButton>

    <Transition
      enter='transition ease-out duration-100'
      enterFrom='transform opacity-0 scale-95'
      enterTo='transform opacity-100 scale-100'
      leave='transition ease-in duration-75'
      leaveFrom='transform opacity-100 scale-100'
      leaveTo='transform opacity-0 scale-95'
    >
      <MenuItems className='absolute right-0 mt-2 w-40 origin-top-right rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden'>
        <div className='py-1'>
          {options.map((opt) => (
            <MenuItem key={opt.value}>
              {({ focus }) => (
                <button
                  onClick={() => onChange(opt.value)}
                  className={`${
                    focus
                      ? 'bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  } group flex w-full items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors`}
                >
                  {opt.label}
                </button>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Transition>
  </Menu>
);
