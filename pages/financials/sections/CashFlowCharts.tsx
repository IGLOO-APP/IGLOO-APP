import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface CashFlowChartsProps {
  trendData: { name: string; receita: number; despesa: number }[];
  forecastData: { name: string; valor: number }[];
  totalForecast: number;
}

export const CashFlowCharts: React.FC<CashFlowChartsProps> = ({
  trendData,
  forecastData,
  totalForecast,
}) => {
  return (
    <>
      <div className='mt-2 mb-6 bg-card text-card-foreground p-4 rounded-2xl border border-border shadow-sm'>
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className='text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 cursor-help'>
              <TrendingUp size={16} className='text-primary' /> Tendência Financeira
            </h3>
          </TooltipTrigger>
          <TooltipContent side='bottom' className='max-w-xs'>
            <p className='font-semibold'>Tendência Financeira</p>
            <p className='text-muted-foreground'>
              Exibe o comparativo histórico entre o dinheiro que efetivamente entrou (Receitas) e o
              que saiu (Despesas) do seu caixa.
            </p>
          </TooltipContent>
        </Tooltip>
        <div className='h-48 sm:h-64 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={trendData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id='colorReceita' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.2} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='colorDespesa' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#ef4444' stopOpacity={0.2} />
                  <stop offset='95%' stopColor='#ef4444' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='#e2e8f0'
                opacity={0.3}
              />
              <XAxis
                dataKey='name'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                itemStyle={{ fontSize: 12 }}
              />
              <Area
                type='monotone'
                dataKey='receita'
                stroke='#10b981'
                fillOpacity={1}
                fill='url(#colorReceita)'
                strokeWidth={2}
              />
              <Area
                type='monotone'
                dataKey='despesa'
                stroke='#ef4444'
                fillOpacity={1}
                fill='url(#colorDespesa)'
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className='flex items-center gap-4 mt-4 px-2'>
          <div className='flex items-center gap-2'>
            <div className='w-2.5 h-2.5 rounded-[2px] bg-[#10b981]' />
            <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>Receita</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-2.5 h-2.5 rounded-[2px] bg-[#ef4444]' />
            <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>Despesa</span>
          </div>
        </div>
      </div>

      <div className='mb-6 bg-card text-card-foreground p-4 rounded-2xl border border-border shadow-sm relative'>
        <div className='absolute top-0 right-0 p-4 opacity-5'>
          <TrendingUp size={80} className='text-primary' />
        </div>
        <div className='flex justify-between items-start mb-6 relative z-10'>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <h3 className='text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-help'>
                  <Clock size={16} className='text-primary' /> Fluxo de Caixa (Forecast)
                </h3>
                <p className='text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1'>
                  Projeção dos próximos 3 meses
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='max-w-xs'>
              <p className='font-semibold'>Fluxo de Caixa (Forecast)</p>
              <p className='text-muted-foreground'>
                Uma projeção de quanto você deve receber nos próximos meses, calculada
                automaticamente com base nos seus contratos assinados e ativos.
              </p>
            </TooltipContent>
          </Tooltip>
          <div className='text-right'>
            <p className='text-[10px] text-slate-500 font-bold uppercase'>Total Previsto</p>
            <p className='text-lg font-black text-primary'>{formatCurrency(totalForecast)}</p>
          </div>
        </div>
        <div className='h-40 sm:h-56 w-full mb-4'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='#e2e8f0'
                opacity={0.2}
              />
              <XAxis
                dataKey='name'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <RechartsTooltip
                cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
                itemStyle={{ fontSize: 12, fontWeight: 'bold', color: '#10b981' }}
                formatter={(value) => [formatCurrency(Number(value) || 0), 'Recebível']}
              />
              <Bar dataKey='valor' fill='#10b981' radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className='grid grid-cols-3 gap-2 relative z-10'>
          {forecastData.map((item, idx) => (
            <div
              key={idx}
              className='bg-muted/50 p-2 rounded-xl border border-border'
            >
              <p className='text-[9px] font-black text-slate-400 uppercase'>{item.name}</p>
              <p className='text-xs font-bold text-slate-900 dark:text-white mt-0.5'>
                {formatCurrency(item.valor)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
