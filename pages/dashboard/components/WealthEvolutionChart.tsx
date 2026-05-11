import React, { useState } from 'react';
import { TrendingUp, Home, FileText, ChevronDown, Info } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
// import { motion } from 'framer-motion';
import { InfoTooltip } from '../../../components/ui/InfoTooltip';
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

export const WealthEvolutionChart: React.FC<WealthEvolutionChartProps> = ({ wealthHistory = [], isDark }) => {
  const [period, setPeriod] = useState('Último ano');

  return (
    <div 
      className='bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all'
    >
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h3 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2'>
            <TrendingUp className='text-cyan-500' size={20} /> Evolução do Patrimônio
            <InfoTooltip 
              title="Evolução do Patrimônio" 
              description="Esta métrica representa o valor total estimado de todos os seus ativos imobiliários cadastrados, considerando valorizações de mercado e novas aquisições ao longo do tempo."
            >
              <Info size={16} className='text-slate-400 cursor-help hover:text-cyan-500 transition-colors' />
            </InfoTooltip>
          </h3>
          <p className='text-xs text-slate-500 dark:text-slate-400 font-medium'>
            Valorização total da carteira imobiliária
          </p>
        </div>

        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className='flex items-center gap-2 pl-3 pr-8 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all relative'>
            {period}
            <ChevronDown size={12} className='absolute right-2 top-1/2 -translate-y-1/2 text-slate-400' />
          </MenuButton>

          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
              <div className="py-1">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => setPeriod('Últimos 6 meses')}
                      className={`${
                        focus ? 'bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                      } group flex w-full items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors`}
                    >
                      Últimos 6 meses
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => setPeriod('Último ano')}
                      className={`${
                        focus ? 'bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                      } group flex w-full items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors`}
                    >
                      Último ano
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      </div>

      <div className='h-[300px] w-full'>
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
                  const value = payload[0].value as number;
                  
                  return (
                    <div className='bg-slate-950/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[220px]'>
                      <p className='font-black text-[10px] mb-3 uppercase tracking-[0.2em] text-slate-400 border-b border-white/5 pb-2'>
                        {label}
                      </p>
                      <div className='mb-3'>
                        <p className='text-[9px] font-bold text-cyan-500 uppercase tracking-widest mb-1'>Valor Patrimonial</p>
                        <p className='text-xl font-black text-white'>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)}
                        </p>
                      </div>

                      {data.events && data.events.length > 0 && (
                        <div className='mt-2 space-y-2 py-2 border-t border-white/5'>
                          <p className='text-[8px] font-black text-slate-500 uppercase tracking-widest'>Eventos do Período</p>
                          {data.events.map((e: any, i: number) => (
                            <div key={i} className='flex items-center gap-2 text-[10px] font-bold text-slate-200'>
                              <div className='p-1 rounded-md bg-white/5'>
                                {e.type === 'property' ? <Home size={10} className="text-cyan-400" /> : <FileText size={10} className="text-emerald-400" />}
                              </div>
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
              animationDuration={2000}
              animationBegin={200}
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
