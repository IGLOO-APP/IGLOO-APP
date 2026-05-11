import React, { useState } from 'react';
import { DollarSign, Download, Info, ChevronDown } from 'lucide-react';
import { InfoTooltip } from '../../../components/ui/InfoTooltip';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
// import { motion } from 'framer-motion';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CashFlowChartProps {
  financialHistory: any[];
  isDark: boolean;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ financialHistory = [], isDark }) => {
  const [period, setPeriod] = useState('Último ano');

  return (
    <div 
      className='bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all'
    >
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h3 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2'>
            <DollarSign className='text-emerald-500' size={20} /> Fluxo de Caixa & Projeção
            <InfoTooltip 
              title="Fluxo de Caixa & Projeção" 
              description="Visualize o histórico real de entradas e saídas financeiras. A área pontilhada representa a projeção para os próximos 3 meses baseada em contratos vigentes e despesas recorrentes."
            >
              <Info size={16} className='text-slate-400 cursor-help hover:text-emerald-500 transition-colors' />
            </InfoTooltip>
          </h3>
          <p className='text-xs text-slate-500 dark:text-slate-400 font-medium'>
            Histórico de transações e previsões contratuais
          </p>
        </div>

        <div className='flex items-center gap-3'>
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

          <button className='p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-primary'>
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className='h-[300px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart
            data={financialHistory}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id='colorIncome' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#10b981' stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id='colorExpense' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#ef4444' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#ef4444' stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id='colorNet' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#6366f1' stopOpacity={0.1} />
                <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
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
              tickFormatter={(val) => `R$ ${val / 1000}k`}
            />
            
            <Tooltip
              cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const income = payload[0]?.value || 0;
                  const expense = payload[1]?.value || 0;
                  const net = payload[2]?.value || 0;
                  const isProjected = payload[0].payload.projected;

                  return (
                    <div className='bg-slate-950/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[220px]'>
                      <p className='font-black text-[10px] mb-3 uppercase tracking-[0.2em] text-slate-400 border-b border-white/5 pb-2 flex justify-between items-center'>
                        {label}
                        {isProjected && <span className='text-amber-500 text-[8px]'>PROJEÇÃO</span>}
                      </p>
                      
                      <div className='space-y-3'>
                        <div className='flex justify-between items-center'>
                          <div className='flex items-center gap-2'>
                            <div className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                            <span className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>Receita</span>
                          </div>
                          <span className='text-xs font-black text-white'>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(income))}
                          </span>
                        </div>
                        
                        <div className='flex justify-between items-center'>
                          <div className='flex items-center gap-2'>
                            <div className='w-1.5 h-1.5 rounded-full bg-red-500' />
                            <span className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>Despesa</span>
                          </div>
                          <span className='text-xs font-black text-white'>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(expense))}
                          </span>
                        </div>

                        <div className='pt-2 mt-2 border-t border-white/5'>
                          <div className='flex justify-between items-center'>
                            <div className='flex items-center gap-2'>
                              <div className='w-1.5 h-1.5 rounded-full bg-indigo-500' />
                              <span className='text-[9px] font-black text-indigo-400 uppercase tracking-widest'>Líquido</span>
                            </div>
                            <span className='text-sm font-black text-indigo-400'>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(net))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Bar
              dataKey='income'
              name='Receita'
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
              stackId='a'
              animationDuration={2000}
              animationBegin={400}
            >
              {financialHistory.map((entry, index) => (
                <Cell
                  key={`income-${index}`}
                  fill='url(#colorIncome)'
                  fillOpacity={entry.projected ? 0.3 : 1}
                  stroke={entry.projected ? '#10b981' : 'none'}
                  strokeDasharray={entry.projected ? '3 3' : '0'}
                />
              ))}
            </Bar>

            <Bar
              dataKey='expense'
              name='Despesa'
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
              stackId='a'
              animationDuration={2000}
              animationBegin={600}
            >
              {financialHistory.map((entry, index) => (
                <Cell
                  key={`expense-${index}`}
                  fill='url(#colorExpense)'
                  fillOpacity={entry.projected ? 0.3 : 1}
                  stroke={entry.projected ? '#ef4444' : 'none'}
                  strokeDasharray={entry.projected ? '4 4' : '0'}
                />
              ))}
            </Bar>

            <Area
              type='monotone'
              dataKey='net'
              fill='url(#colorNet)'
              stroke='none'
              animationDuration={2500}
              animationBegin={800}
            />

            <Line
              type='monotone'
              dataKey='net'
              name='Líquido'
              stroke='#6366f1'
              strokeWidth={3}
              dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              animationDuration={2500}
              animationBegin={800}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className='flex items-center gap-6 mt-6 px-2'>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 rounded-full bg-emerald-500'></div>
          <span className='text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest'>Receita</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 rounded-full bg-red-500'></div>
          <span className='text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest'>Despesa</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-6 h-[2px] bg-indigo-500'></div>
          <span className='text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest'>Resultado Líquido</span>
        </div>
      </div>
    </div>
  );
};
