import React, { useState } from 'react';
import { TrendingUp, Home, FileText } from 'lucide-react';
import { SectionHeader, PeriodSelector } from '../../../components/ui/DashboardComponents';
import { Card } from '../../../components/ui/card';
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
  className?: string;
}

const PERIOD_OPTIONS = [
  { label: 'Últimos 6 meses', value: 'Últimos 6 meses' },
  { label: 'Último ano', value: 'Último ano' },
];

export const WealthEvolutionChart: React.FC<WealthEvolutionChartProps> = ({
  wealthHistory = [],
  isDark,
  className = '',
}) => {
  const [period, setPeriod] = useState('Último ano');

  const displayData = period === 'Últimos 6 meses' ? wealthHistory.slice(-6) : wealthHistory;

  return (
    <Card
      className={
        'p-5 flex flex-col ' +
        className
      }
    >
      <div className='mb-4'>
        <SectionHeader
          title='Evolução do Patrimônio'
          subtitle='Valorização total da carteira imobiliária'
          icon={TrendingUp}
          iconColor='text-cyan-500'
          tooltip='Esta métrica representa o valor total estimado de todos os seus ativos imobiliários cadastrados, considerando valorizações de mercado e novas aquisições ao longo do tempo.'
          action={<PeriodSelector options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />}
        />
      </div>

      <div className='flex-1 w-full min-h-0 min-h-[200px] sm:min-h-0'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={displayData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
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
                    <div className='bg-slate-950/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[160px] sm:min-w-[220px]'>
                      <p className='font-black text-[10px] mb-3 uppercase tracking-[0.2em] text-slate-400 border-b border-white/5 pb-2'>
                        {label}
                      </p>
                      <div className='mb-3'>
                        <p className='text-[9px] font-bold text-cyan-500 uppercase tracking-widest mb-1'>
                          Valor Patrimonial
                        </p>
                        <p className='text-xl font-black text-white'>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            maximumFractionDigits: 0,
                          }).format(value)}
                        </p>
                      </div>

                      {data.events && data.events.length > 0 && (
                        <div className='mt-2 space-y-2 py-2 border-t border-white/5'>
                          <p className='text-[8px] font-black text-slate-500 uppercase tracking-widest'>
                            Eventos do Período
                          </p>
                          {data.events.map((e: any, i: number) => (
                            <div
                              key={i}
                              className='flex items-center gap-2 text-[10px] font-bold text-slate-200'
                            >
                              <div className='p-1 rounded-md bg-white/5'>
                                {e.type === 'property' ? (
                                  <Home size={10} className='text-cyan-400' />
                                ) : (
                                  <FileText size={10} className='text-emerald-400' />
                                )}
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
                      <circle cx={cx} cy={cy} r={6} fill='#06b6d4' stroke='white' strokeWidth={2} />
                      <foreignObject x={cx - 10} y={cy - 28} width={20} height={20}>
                        <div className='flex items-center justify-center text-white bg-slate-900 rounded-full w-5 h-5 shadow-lg border border-white/20'>
                          {isProperty ? <Home size={10} /> : <FileText size={10} />}
                        </div>
                      </foreignObject>
                    </g>
                  );
                }
                return <circle cx={cx} cy={cy} r={3} fill='#06b6d4' />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className='flex items-center gap-4 mt-4 px-2'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-[3px] bg-cyan-500 rounded-full'></div>
          <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
            Valor Patrimonial
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-white'>
            <Home size={8} />
          </div>
          <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
            Evento Relevante
          </span>
        </div>
      </div>
    </Card>
  );
};
