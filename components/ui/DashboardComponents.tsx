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
  <div className='bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden'>
    <div
      className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}
    >
      <Icon size={80} />
    </div>
    <div className='flex justify-between items-start mb-4'>
      <div
        className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('500', '50')} dark:bg-white/5`}
      >
        <Icon size={24} className={color} />
      </div>
      {sparkData && <Sparkline data={sparkData} color={trendUp ? '#10b981' : '#ef4444'} />}
    </div>
    <div>
      <p className='text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1'>
        {title}
      </p>
      <h3 className='text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
        {value}
      </h3>
      <div className='flex items-center gap-2 mt-2'>
        <span
          className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
        >
          {trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {trend}
        </span>
        <span className='text-xs text-slate-400 font-medium'>{subtext}</span>
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
    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-95 ${color} bg-opacity-10 border-opacity-20 hover:bg-opacity-20`}
  >
    <div className='relative'>
      <Icon size={20} />
      {count > 0 && (
        <span className='absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark'></span>
      )}
    </div>
    <div className='text-left'>
      <p className='text-xs font-bold uppercase opacity-80'>{label}</p>
      {count > 0 && <p className='text-sm font-bold'>{count} pendentes</p>}
    </div>
    <ChevronRight size={16} className='opacity-50' />
  </button>
);
