import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Home,
  Activity,
  Users,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { HeroCard } from '../../../components/ui/DashboardComponents';

interface HeroMetricsProps {
  metrics: {
    totalWealth: string;
    mrr: string;
    occupancyRate: number;
    avgRoi: string;
    totalTenants: number;
    expiringContractsCount: number;
    trends: {
      wealth: string;
      mrr: string;
      occupancy: string;
      roi: string;
    };
    sparkData: {
      wealth: number[];
      mrr: number[];
    };
  };
  navigate: (path: string, state?: Record<string, unknown>) => void;
}

const fallbackSpark = [100, 90, 95, 92, 97, 94, 99];

export const HeroMetrics: React.FC<HeroMetricsProps> = ({ metrics, navigate }) => {
  const wealthSpark =
    metrics.sparkData?.wealth?.length >= 2 ? metrics.sparkData.wealth : fallbackSpark;
  const mrrSpark = metrics.sparkData?.mrr?.length >= 2 ? metrics.sparkData.mrr : fallbackSpark;

  return (
    <section className='space-y-4'>
      <div className='grid grid-cols-2 gap-3 md:gap-6 items-stretch'>
        <HeroCard
          title='Patrimônio Total'
          value={metrics.totalWealth}
          subtext='vs. mês anterior'
          trend={metrics.trends.wealth}
          trendUp={true}
          icon={TrendingUp}
          color='text-indigo-500'
          sparkData={wealthSpark}
          tooltip='Soma do valor de mercado estimado de todos os seus imóveis cadastrados. Ajuda a entender a evolução do seu equity imobiliário.'
        />

        <HeroCard
          title='Receita Recorrente (MRR)'
          value={metrics.mrr}
          subtext='vs. mês anterior'
          trend={metrics.trends.mrr}
          trendUp={true}
          icon={DollarSign}
          color='text-emerald-500'
          sparkData={mrrSpark}
          tooltip='Monthly Recurring Revenue. É a soma de todos os aluguéis ativos no mês atual. Representa a previsibilidade do seu fluxo de caixa.'
        />

        <HeroCard
          title='Taxa de Ocupação'
          value={`${metrics.occupancyRate}%`}
          subtext={
            metrics.occupancyRate < 80 ? 'Vacância crítica — agir agora' : 'Carteira saudável'
          }
          trend={metrics.trends.occupancy}
          trendUp={metrics.occupancyRate >= 80}
          icon={Home}
          color={metrics.occupancyRate < 80 ? 'text-red-500' : 'text-emerald-500'}
          variant={metrics.occupancyRate < 80 ? 'critical' : 'default'}
          tooltip='Percentual de imóveis alugados em relação ao total da sua carteira. Acima de 90% é considerado excelente.'
        />

        <HeroCard
          title='ROI Médio Anual'
          value={metrics.avgRoi === '0%' || !metrics.avgRoi ? '--' : metrics.avgRoi}
          subtext={metrics.avgRoi === '0%' ? 'Sem imóveis alugados' : 'Acima da inflação'}
          trend={metrics.trends.roi}
          trendUp={true}
          icon={Activity}
          color={metrics.avgRoi === '0%' ? 'text-slate-400' : 'text-cyan-500'}
          variant={metrics.avgRoi === '0%' || !metrics.avgRoi ? 'muted' : 'default'}
          tooltip='Retorno sobre Investimento anualizado. Calcula quanto o aluguel rende em relação ao valor de mercado do imóvel (Yield anual).'
        />
      </div>

      {/* Secondary stats row: Inquilinos + Alertas */}
      <div className='grid grid-cols-3 gap-3'>
        <button
          onClick={() => navigate('/tenants')}
          className='flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left active-tap'
        >
          <div className='p-2 rounded-lg bg-primary/10 text-primary'>
            <Users size={16} />
          </div>
          <div>
            <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight'>
              Inquilinos
            </p>
            <p className='text-sm font-black text-slate-900 dark:text-white'>
              {metrics.totalTenants ?? 0}
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/properties')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm transition-all text-left active-tap ${
            metrics.occupancyRate < 80
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 hover:shadow-md'
              : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5 opacity-60'
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              metrics.occupancyRate < 80
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-slate-100 dark:bg-white/5 text-slate-400'
            }`}
          >
            <AlertTriangle size={16} />
          </div>
          <div className='text-left'>
            <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight'>
              Vacância Crítica
            </p>
            {metrics.occupancyRate < 80 ? (
              <p className='text-sm font-black text-red-600 dark:text-red-400'>
                {100 - metrics.occupancyRate}% vagos
              </p>
            ) : (
              <p className='text-sm font-bold text-slate-400 italic'>Tudo em ordem</p>
            )}
          </div>
        </button>

        <button
          onClick={() => navigate('/contracts')}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-sm transition-all text-left active-tap ${
            (metrics.expiringContractsCount ?? 0) > 0
              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 hover:shadow-md'
              : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5 opacity-60'
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              (metrics.expiringContractsCount ?? 0) > 0
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-white/5 text-slate-400'
            }`}
          >
            <FileText size={16} />
          </div>
          <div className='text-left'>
            <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight'>
              Contratos Vencendo
            </p>
            {(metrics.expiringContractsCount ?? 0) > 0 ? (
              <p className='text-sm font-black text-amber-600 dark:text-amber-400'>
                {metrics.expiringContractsCount} pendentes
              </p>
            ) : (
              <p className='text-sm font-bold text-slate-400 italic'>Em dia</p>
            )}
          </div>
        </button>
      </div>
    </section>
  );
};
