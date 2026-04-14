import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { adminService } from '../../services/adminService';
import { InfoTooltip } from '../../components/ui/InfoTooltip';

const ConversionReport: React.FC = () => {
  const [period, setPeriod] = useState('30_days');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['conversionStats', period],
    queryFn: () => adminService.getConversionStats(period),
  });

  if (isLoading || !stats) {
    return (
      <div className='p-8 flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='p-8 space-y-8 animate-fadeIn'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h2 className='text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight'>
            Relatório de Conversão Trial → Pago
          </h2>
          <p className='text-sm text-slate-500'>
            Acompanhe a eficiência do seu funil de vendas e o crescimento do MRR.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl'>
            {['7_days', '30_days', '90_days'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === p 
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                    : 'text-slate-400'
                }`}
              >
                {p === '7_days' ? '7d' : p === '30_days' ? '30d' : '90d'}
              </button>
            ))}
          </div>
          <button className='p-2 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl hover:bg-slate-50 transition-all text-slate-500 shadow-sm'>
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <InfoTooltip 
          title='Novos Trials' 
          description='Total de proprietários que iniciaram o período de teste gratuito no intervalo selecionado.'
        >
          <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm h-full'>
            <div className='flex justify-between items-start mb-4'>
              <div className='p-3 bg-indigo-500/10 text-indigo-500 rounded-xl'>
                <Users size={20} />
              </div>
              <span className='flex items-center text-xs font-bold text-slate-400'>
                +0%
              </span>
            </div>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Novos Trials</p>
            <h3 className='text-2xl font-extrabold text-slate-900 dark:text-white'>{stats?.total_trials || 0}</h3>
          </div>
        </InfoTooltip>

        <InfoTooltip 
          title='Conversões' 
          description='Número de usuários Trial que realizaram o pagamento da primeira mensalidade e tornaram-se assinantes pagos.'
        >
          <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm h-full'>
            <div className='flex justify-between items-start mb-4'>
              <div className='p-3 bg-emerald-500/10 text-emerald-500 rounded-xl'>
                <CreditCard size={20} />
              </div>
              <span className='flex items-center text-xs font-bold text-slate-400'>
                +0%
              </span>
            </div>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Conversões</p>
            <h3 className='text-2xl font-extrabold text-slate-900 dark:text-white'>{stats?.total_converted || 0}</h3>
          </div>
        </InfoTooltip>

        <InfoTooltip 
          title='Taxa de Conversão' 
          description='A porcentagem de Trials que converteram para planos pagos. É o principal indicador de eficiência do produto.'
        >
          <div className='bg-primary/5 dark:bg-primary/10 p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden h-full'>
            <div className='flex justify-between items-start mb-4 relative z-10'>
              <div className='p-3 bg-primary text-white rounded-xl'>
                <TrendingUp size={20} />
              </div>
            </div>
            <p className='text-[10px] font-bold text-primary uppercase tracking-widest mb-1 relative z-10'>Taxa de Conversão</p>
            <h3 className='text-2xl font-extrabold text-slate-900 dark:text-white relative z-10'>{stats?.conversion_rate || 0}%</h3>
            <div className='absolute -bottom-2 -right-2 opacity-5 pointer-events-none'>
              <TrendingUp size={100} />
            </div>
          </div>
        </InfoTooltip>

        <InfoTooltip 
          title='Tempo de Decisão' 
          description='Tempo médio (em dias) que os usuários levam desde o cadastro inicial até o pagamento da assinatura.'
        >
          <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm h-full'>
            <div className='flex justify-between items-start mb-4'>
              <div className='p-3 bg-amber-500/10 text-amber-500 rounded-xl'>
                <Clock size={20} />
              </div>
            </div>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Tempo Médio p/ Converter</p>
            <h3 className='text-2xl font-extrabold text-slate-900 dark:text-white'>{stats.time_to_convert_avg} dias</h3>
          </div>
        </InfoTooltip>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Conversion Chart */}
        <div className='lg:col-span-2 bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm'>
          <div className='flex items-center justify-between mb-8'>
            <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2'>
              <BarChart3 className='text-primary' size={20} /> Conversão por Semana
            </h3>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-slate-200'></div>
                <span className='text-[10px] font-bold text-slate-400 uppercase'>Trials</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-primary'></div>
                <span className='text-[10px] font-bold text-slate-400 uppercase'>Pagos</span>
              </div>
            </div>
          </div>
          <div className='h-[300px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={stats.history}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='rgba(0,0,0,0.05)' />
                <XAxis 
                  dataKey='name' 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey='trials' fill='#e2e8f0' radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey='conversions' fill='var(--color-primary, #6366f1)' radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Insights */}
        <div className='bg-slate-900 rounded-3xl p-6 text-white flex flex-col'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='p-2 bg-amber-500 rounded-xl text-slate-900'>
              <TrendingUp size={20} />
            </div>
            <h3 className='font-bold'>Estratégias de Conversão</h3>
          </div>
          
          <div className='flex-1 space-y-4'>
            <div className='p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group'>
              <p className='text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1'>Campanha Sugerida</p>
              <h4 className='text-sm font-bold mb-2 group-hover:text-amber-400 transition-colors'>Upgrade de Última Hora</h4>
              <p className='text-xs text-slate-400 leading-relaxed'>
                Usuários que estão no dia 6 do Trial têm maior propensão a converter com um cupom de 10% de desconto.
              </p>
              <button className='mt-4 w-full py-2 bg-amber-500 text-slate-900 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2'>
                Criar Comunicado <ChevronRight size={14} />
              </button>
            </div>

            <div className='p-4 bg-white/5 rounded-2xl border border-white/5 opacity-60'>
              <p className='text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1'>Insights</p>
              <h4 className='text-sm font-bold mb-2'>Retenção Saudável</h4>
              <p className='text-xs text-slate-400 leading-relaxed'>
                Seus usuários convertidos estão ativos há mais de 3 meses. Foque em manter esse LTV.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation for New Users (Admin) */}
      <div className='bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-3xl p-6'>
        <div className='flex items-start gap-4'>
          <div className='p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0'>
            <Info size={24} />
          </div>
          <div className='space-y-2'>
            <h3 className='font-bold text-slate-900 dark:text-white'>Como ler este relatório?</h3>
            <p className='text-sm text-slate-500 leading-relaxed'>
              Este painel ajuda você a entender se o IGLOO está "se pagando". A <strong>Taxa de Conversão</strong> é o seu KPI mais importante: ela diz quantos proprietários que testam o sistema realmente decidem assinar. 
              <br/><br/>
              Use os <strong>Insights de Estratégia</strong> ao lado para decidir quando é o melhor momento para enviar um <strong>Comunicado Global</strong> sugerindo o upgrade de plano.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionReport;
