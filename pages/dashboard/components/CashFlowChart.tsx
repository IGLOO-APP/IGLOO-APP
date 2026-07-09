import React, { useState } from 'react';
import { Download, DollarSign } from 'lucide-react';
import { SectionHeader, PeriodSelector } from '../../../components/ui/DashboardComponents';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
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

const PERIOD_OPTIONS = [
  { label: 'Últimos 6 meses', value: 'Últimos 6 meses' },
  { label: 'Último ano', value: 'Último ano' },
];

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ financialHistory = [], isDark }) => {
  const [period, setPeriod] = useState('Último ano');

  const realHistory = financialHistory.filter((h) => !h.projected);
  const projected = financialHistory.filter((h) => h.projected);
  const slicedReal = period === 'Últimos 6 meses' ? realHistory.slice(-6) : realHistory;
  const displayData = [...slicedReal, ...projected];

  return (
    <Card>
      <CardHeader className='pb-0'>
        <SectionHeader
          title='Fluxo de Caixa & Projeção'
          subtitle='Histórico de transações e previsões contratuais'
          icon={DollarSign}
          iconColor='text-emerald-500'
          tooltip='Visualize o histórico real de entradas e saídas financeiras. A área pontilhada representa a projeção para os próximos 3 meses baseada em contratos vigentes e despesas recorrentes.'
          action={
            <div className='flex items-center gap-3'>
              <PeriodSelector options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
              <Button variant='ghost' size='icon' className='rounded-xl'>
                <Download size={18} />
              </Button>
            </div>
          }
        />
      </CardHeader>
      <CardContent className='pt-4'>
        <div className='h-[220px] sm:h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={displayData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
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
                    const repasseData = payload[0].payload.repasse_previsto_data;

                    return (
                      <div className='bg-slate-950/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[160px] sm:min-w-[220px]'>
                        <p className='font-black text-[10px] mb-3 uppercase tracking-[0.2em] text-slate-400 border-b border-white/5 pb-2 flex justify-between items-center'>
                          {label}
                          {isProjected && (
                            <span className='text-amber-500 text-[8px]'>PROJEÇÃO</span>
                          )}
                        </p>

                        <div className='space-y-3'>
                          <div className='flex justify-between items-center'>
                            <div className='flex items-center gap-2'>
                              <div className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                              <span className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
                                Receita
                              </span>
                            </div>
                            <span className='text-xs font-black text-white'>
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(Number(income))}
                            </span>
                          </div>

                          <div className='flex justify-between items-center'>
                            <div className='flex items-center gap-2'>
                              <div className='w-1.5 h-1.5 rounded-full bg-red-500' />
                              <span className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
                                Despesa
                              </span>
                            </div>
                            <span className='text-xs font-black text-white'>
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(Number(expense))}
                            </span>
                          </div>

                          {repasseData && (
                            <div className='flex justify-between items-center pt-1 border-t border-white/5'>
                              <span className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
                                Repasse Previsto
                              </span>
                              <span className='text-xs font-bold text-white'>
                                {new Date(repasseData).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}

                          <div className='pt-2 mt-2 border-t border-white/5'>
                            <div className='flex justify-between items-center'>
                              <div className='flex items-center gap-2'>
                                <div className='w-1.5 h-1.5 rounded-full bg-indigo-500' />
                                <span className='text-[9px] font-black text-indigo-400 uppercase tracking-widest'>
                                  Líquido
                                </span>
                              </div>
                              <span className='text-sm font-black text-indigo-400'>
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(Number(net))}
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
                {displayData.map((entry, index) => (
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
                {displayData.map((entry, index) => (
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

        <div className='flex items-center gap-2 sm:gap-4 mt-3 px-2 flex-wrap'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-emerald-500'></div>
            <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
              Receita
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-red-500'></div>
            <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
              Despesa
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-6 h-[2px] bg-indigo-500'></div>
            <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
              Resultado Líquido
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
