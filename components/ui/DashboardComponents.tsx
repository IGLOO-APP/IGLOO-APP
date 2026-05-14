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
  <div className='h-full bg-white dark:bg-surface-dark p-3.5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden flex flex-col justify-between'>
    <div
      className={`absolute top-0 right-0 p-2 md:p-4 opacity-5 group-hover:opacity-15 transition-opacity duration-500 ${color} rotate-12 group-hover:rotate-0 pointer-events-none`}
    >
      <Icon size={120} className='hidden md:block' />
      <Icon size={60} className='md:hidden' />
    </div>

    <div className='relative z-10 w-full'>
      {/* Top Section: Icon & Sparkline */}
      <div className='flex justify-between items-start mb-4 md:mb-6 h-10 md:h-14'>
        <div
          className={`p-2.5 md:p-4 rounded-xl ${color.replace('text-', 'bg-').replace('500', '100')} dark:bg-white/5 transition-colors duration-500 group-hover:bg-primary/20 shrink-0`}
        >
          <Icon size={20} className={`md:size-6 ${color} group-hover:scale-110 transition-transform duration-500`} />
        </div>
        {sparkData ? (
          <div className='hidden sm:block pt-1'>
            <Sparkline data={sparkData} color={trendUp ? '#10b981' : '#ef4444'} />
          </div>
        ) : (
          <div className='hidden sm:block w-24 h-10'></div> // Placeholder to maintain alignment
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col">
        <div className="h-6 md:h-10 flex items-start"> {/* Reduced fixed height for mobile */}
          <p className='text-slate-500 dark:text-slate-400 text-[9px] md:text-xs font-black uppercase tracking-[0.15em] leading-tight'>
            {title}
          </p>
        </div>
        <h3 className='text-xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 md:mb-4 truncate'>
          {value}
        </h3>
      </div>
    </div>

    <div className='relative z-10 flex flex-wrap items-center gap-2 md:gap-3 mt-auto'>
      <span
        className={`flex items-center gap-1 text-[9px] md:text-[10px] font-black px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} whitespace-nowrap`}
      >
        {trendUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {trend}
      </span>
      <span className='text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wide opacity-60 line-clamp-1'>{subtext}</span>
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
    className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 rounded-2xl border transition-all duration-300 active:scale-95 shrink-0 ${color} bg-opacity-5 border-opacity-10 hover:bg-opacity-15 hover:border-opacity-20 hover:shadow-lg group/alert`}
  >
    <div className='relative shrink-0'>
      <div className={`absolute inset-0 rounded-full ${color.replace('text-', 'bg-')} opacity-0 group-hover/alert:opacity-20 animate-ping`} />
      <Icon size={20} className='shrink-0 transition-transform duration-500 group-hover/alert:scale-110' />
      {count > 0 && (
        <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark shadow-[0_0_10px_rgba(239,68,68,0.5)]'></span>
      )}
    </div>
    <div className='text-left flex-1 min-w-0'>
      <p className='text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60 mb-0.5 truncate'>{label}</p>
      {count > 0 ? (
        <p className='text-xs md:text-sm font-black truncate flex items-center gap-1.5'>
          {count} <span className="opacity-50 font-bold">pendentes</span>
        </p>
      ) : (
        <p className='text-xs md:text-sm font-bold opacity-40 italic'>Tudo em ordem</p>
      )}
    </div>
    <ChevronRight size={16} className='opacity-30 group-hover/alert:opacity-100 group-hover/alert:translate-x-1 transition-all duration-300' />
  </button>
);
