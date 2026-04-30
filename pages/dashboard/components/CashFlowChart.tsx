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
                  return (
                    <div className='bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-white/10'>
                      <p className='font-bold mb-2 border-b border-white/10 pb-1'>
                        {label}
                      </p>
                      <div className='space-y-1 text-xs'>
                        <p className='flex justify-between gap-4'>
                          <span className='text-emerald-400'>Receita:</span>{' '}
                          <b>R$ {payload[0].value}</b>
                        </p>
                        <p className='flex justify-between gap-4'>
                          <span className='text-red-400'>Despesa:</span>{' '}
                          <b>R$ {payload[1].value}</b>
                        </p>
                        <p className='flex justify-between gap-4 border-t border-white/10 pt-1 mt-1'>
                          <span className='text-cyan-400 font-bold'>Líquido:</span>{' '}
                          <b>R$ {payload[2].value}</b>
                        </p>
                        {payload[0].payload.projected && (
                          <p className='text-[10px] text-amber-400 italic mt-2 text-center'>
                            *Valor Projetado
                          </p>
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
