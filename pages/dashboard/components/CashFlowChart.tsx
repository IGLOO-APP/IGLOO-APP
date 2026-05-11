import React from 'react';
import { DollarSign, Download, Info } from 'lucide-react';
import { InfoTooltip } from '../../../components/ui/InfoTooltip';
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
  return (
    <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h3 className='text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2'>
            <DollarSign className='text-primary' size={20} /> Fluxo de Caixa & Projeção
            <InfoTooltip 
              title="Fluxo de Caixa & Projeção" 
              description="O histórico mostra transações reais. A projeção de 3 meses é calculada somando os aluguéis de contratos ativos e subtraindo despesas fixas conhecidas."
            >
              <Info size={16} className='text-slate-400 cursor-help' />
            </InfoTooltip>
          </h3>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Análise financeira com previsão de 3 meses
          </p>
        </div>
        <button className='p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors'>
          <Download size={18} className='text-slate-400' />
        </button>
      </div>
      <div className='h-[250px] md:h-[350px] w-full mt-4 md:mt-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart
            data={financialHistory}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              vertical={false}
              stroke={isDark ? '#334155' : '#e2e8f0'}
            />
            <XAxis
              dataKey='month'
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
              tickFormatter={(val) => `k${val / 1000}`}
            />
            <Tooltip
              cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const income = payload[0]?.value || 0;
                  const expense = payload[1]?.value || 0;
                  const net = payload[2]?.value || 0;
                  const margin = income > 0 ? ((net / income) * 100).toFixed(1) : 0;

                  const formatBRL = (val: number) => 
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

                  return (
                    <div className='bg-slate-950/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[200px]'>
                      <p className='font-black text-xs uppercase tracking-[0.2em] mb-3 text-slate-400 border-b border-white/5 pb-2'>
                        {label}
                      </p>
                      <div className='space-y-2.5'>
                        <div className='flex justify-between items-center gap-4'>
                          <div className='flex items-center gap-2'>
                            <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' />
                            <span className='text-[10px] font-bold text-slate-400 uppercase'>Receita</span>
                          </div>
                          <span className='text-xs font-black text-emerald-400'>{formatBRL(income)}</span>
                        </div>
                        
                        <div className='flex justify-between items-center gap-4'>
                          <div className='flex items-center gap-2'>
                            <div className='w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' />
                            <span className='text-[10px] font-bold text-slate-400 uppercase'>Despesa</span>
                          </div>
                          <span className='text-xs font-black text-red-400'>{formatBRL(expense)}</span>
                        </div>

                        <div className='pt-2 mt-2 border-t border-white/5'>
                          <div className='flex justify-between items-center gap-4 mb-1'>
                            <span className='text-[10px] font-bold text-cyan-400 uppercase'>Resultado Líquido</span>
                            <span className='text-sm font-black text-cyan-400'>{formatBRL(net)}</span>
                          </div>
                          <div className='flex justify-between items-center gap-4'>
                            <span className='text-[9px] font-bold text-slate-500 uppercase'>Margem de Lucro</span>
                            <span className={`text-[10px] font-black ${Number(margin) > 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {margin}%
                            </span>
                          </div>
                        </div>

                        {payload[0].payload.projected && (
                          <div className='mt-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg'>
                            <p className='text-[8px] text-amber-500 font-black uppercase tracking-widest text-center'>
                              ✨ Análise Preditiva
                            </p>
                          </div>
                        )}
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
            >
              {financialHistory && financialHistory.length > 0 && financialHistory.map((entry, index) => (
                <Cell
                  key={`cell-income-${index}`}
                  fill={entry.projected ? '#10b981' : '#10b981'}
                  fillOpacity={entry.projected ? 0.4 : 1}
                  stroke={entry.projected ? '#10b981' : 'none'}
                  strokeDasharray={entry.projected ? '4 4' : '0'}
                />
              ))}
            </Bar>
            <Bar
              dataKey='expense'
              name='Despesa'
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
              stackId='a'
            >
              {financialHistory && financialHistory.length > 0 && financialHistory.map((entry, index) => (
                <Cell
                  key={`cell-expense-${index}`}
                  fill={entry.projected ? '#ef4444' : '#ef4444'}
                  fillOpacity={entry.projected ? 0.4 : 1}
                  stroke={entry.projected ? '#ef4444' : 'none'}
                  strokeDasharray={entry.projected ? '4 4' : '0'}
                />
              ))}
            </Bar>
            <Line
              type='monotone'
              dataKey='net'
              name='Líquido'
              stroke='#13c8ec'
              strokeWidth={3}
              dot={{ r: 4, fill: '#13c8ec', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
            <Area
              type='monotone'
              dataKey='net'
              fill='url(#colorNet)'
              stroke='none'
              fillOpacity={0.1}
            />
            <defs>
              <linearGradient id='colorNet' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#13c8ec' stopOpacity={0.3} />
                <stop offset='95%' stopColor='#13c8ec' stopOpacity={0} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className='flex items-center gap-4 mt-4 px-2'>
        <div className='flex items-center gap-2'>
          <div className='w-2.5 h-2.5 rounded-[2px] bg-[#10b981]'></div>
          <span className='text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400'>Receita</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-2.5 h-2.5 rounded-[2px] bg-[#ef4444]'></div>
          <span className='text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400'>Despesa</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-[18px] h-[2px] bg-[#13c8ec]'></div>
          <span className='text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400'>Projeção (3 meses)</span>
        </div>
      </div>
    </div>
  );
};
