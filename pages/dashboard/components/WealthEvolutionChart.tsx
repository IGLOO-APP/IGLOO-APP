import React, { useState } from 'react';
import { TrendingUp, Home, FileText, ChevronDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WealthEvolutionChartProps {
  wealthHistory: any[];
  isDark: boolean;
}

export const WealthEvolutionChart: React.FC<WealthEvolutionChartProps> = ({ wealthHistory, isDark }) => {
  const [period, setPeriod] = useState('Último ano');

  return (
    <div className='bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h3 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2'>
            <TrendingUp className='text-cyan-500' size={20} /> Evolução do Patrimônio
          </h3>
          <p className='text-xs text-slate-500 dark:text-slate-400 font-medium'>
            Valorização total da carteira imobiliária
          </p>
        </div>

        <div className='relative'>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className='appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors'
          >
            <option>Últimos 6 meses</option>
            <option>Último ano</option>
          </select>
          <ChevronDown size={12} className='absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' />
        </div>
      </div>

      <div className='h-[250px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={wealthHistory}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id='colorWealth' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#06b6d4' stopOpacity={0.2} />
                <stop offset='95%' stopColor='#06b6d4' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray='3 3'
              vertical={false}
              stroke={isDark ? '#334155' : '#e2e8f0'}
              opacity={0.3}
            />
            <XAxis
              dataKey='month'
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
              tickFormatter={(val) => `R$ ${val / 1000000}M`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className='bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-white/10'>
                      <p className='font-bold text-[10px] mb-2 uppercase tracking-widest text-slate-400 border-b border-white/5 pb-1'>{label}</p>
                      <p className='text-lg font-black text-cyan-400'>
                        R$ {(payload[0].value as number).toLocaleString('pt-BR')}
                      </p>
                      {data.events?.length > 0 && (
                        <div className='mt-2 space-y-1'>
                          {data.events.map((e: any, i: number) => (
                            <div key={i} className='flex items-center gap-1.5 text-[9px] font-bold text-slate-300'>
                              {e.type === 'property' ? <Home size={10} /> : <FileText size={10} />}
                              {e.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type='monotone'
              dataKey='value'
              stroke='#06b6d4'
              strokeWidth={3}
              fillOpacity={1}
              fill='url(#colorWealth)'
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.events?.length > 0) {
                  const isProperty = payload.events.some((e: any) => e.type === 'property');
                  return (
                    <g key={cx}>
                       <circle cx={cx} cy={cy} r={6} fill="#06b6d4" stroke="white" strokeWidth={2} />
                       <foreignObject x={cx - 10} y={cy - 28} width={20} height={20}>
                          <div className="flex items-center justify-center text-white bg-slate-900 rounded-full w-5 h-5 shadow-lg border border-white/20">
                             {isProperty ? <Home size={10} /> : <FileText size={10} />}
                          </div>
                       </foreignObject>
                    </g>
                  );
                }
                return <circle cx={cx} cy={cy} r={3} fill="#06b6d4" />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className='flex items-center gap-4 mt-6 px-2'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-[3px] bg-cyan-500 rounded-full'></div>
          <span className='text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest'>Valor Patrimonial</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-white'>
            <Home size={8} />
          </div>
          <span className='text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest'>Evento Relevante</span>
        </div>
      </div>
    </div>
  );
};
