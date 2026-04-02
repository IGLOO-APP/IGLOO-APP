import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUp, ArrowDown, ChevronRight, LucideIcon } from 'lucide-react';

export const Sparkline = ({ data, color }: { data: number[]; color: string }) => (
  <div className='h-10 w-24'>
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
}: HeroCardProps) => (
  <div className='bg-white dark:bg-surface-dark p-3 md:p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden'>
    <div
      className={`absolute top-0 right-0 p-2 md:p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}
    >
      <Icon size={60} className='md:hidden' />
      <Icon size={80} className='hidden md:block' />
    </div>
    <div className='flex justify-between items-start mb-2 md:mb-4'>
      <div
        className={`p-2 md:p-3 rounded-xl ${color.replace('text-', 'bg-').replace('500', '50')} dark:bg-white/5`}
      >
        <Icon size={20} className={color} />
      </div>
      {sparkData && (
        <div className='hidden sm:block'>
          <Sparkline data={sparkData} color={trendUp ? '#10b981' : '#ef4444'} />
        </div>
      )}
    </div>
    <div>
      <p className='text-slate-500 dark:text-slate-400 text-[9px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1'>
        {title}
      </p>
      <h3 className='text-lg md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
        {value}
      </h3>
      <div className='flex flex-wrap items-center gap-1.5 md:gap-2 mt-1 md:mt-2'>
        <span
          className={`flex items-center text-[9px] md:text-xs font-bold px-1.5 py-0.5 rounded ${trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
        >
          {trendUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {trend}
        </span>
        <span className='text-[9px] md:text-xs text-slate-400 font-medium line-clamp-1'>{subtext}</span>
      </div>
    </div>
  </div>
);

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
    className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl border transition-all active:scale-95 shrink-0 ${color} bg-opacity-10 border-opacity-20 hover:bg-opacity-20`}
  >
    <div className='relative shrink-0'>
      <Icon size={18} className='md:hidden shrink-0' />
      <Icon size={20} className='hidden md:block shrink-0' />
      {count > 0 && (
        <span className='absolute -top-1 -right-1 w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark'></span>
      )}
    </div>
    <div className='text-left flex-1 min-w-0'>
      <p className='text-[9px] md:text-xs font-bold uppercase opacity-80 truncate'>{label}</p>
      {count > 0 && <p className='text-[10px] md:text-sm font-bold truncate'>{count} pendentes</p>}
    </div>
    <ChevronRight size={14} className='opacity-50 shrink-0' />
  </button>
);
