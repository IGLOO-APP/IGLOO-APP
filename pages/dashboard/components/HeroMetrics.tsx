import React from 'react';
import { TrendingUp, DollarSign, Home, Activity } from 'lucide-react';
import { HeroCard } from '../../../components/ui/DashboardComponents';
import { InfoTooltip } from '../../../components/ui/InfoTooltip';

interface HeroMetricsProps {
  metrics: {
    totalWealth: string;
    mrr: string;
    occupancyRate: number;
    avgRoi: string;
    trends: {
      wealth: string;
      mrr: string;
      occupancy: string;
      roi: string;
    };
  };
}

const SPARK_DATA_1 = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const SPARK_DATA_3 = [80, 85, 82, 88, 90, 95, 92];

export const HeroMetrics: React.FC<HeroMetricsProps> = ({ metrics }) => {
  return (
    <section className='grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 md:gap-6'>
      <InfoTooltip 
        title="Patrimônio Total" 
        description="Soma do valor de mercado estimado de todos os seus imóveis cadastrados. Ajuda a entender a evolução do seu equity imobiliário."
      >
        <HeroCard
          title='Patrimônio Total'
          value={metrics.totalWealth}
          subtext='vs. mês anterior'
          trend={metrics.trends.wealth}
          trendUp={true}
          icon={TrendingUp}
          color='text-indigo-500'
          sparkData={SPARK_DATA_3}
        />
      </InfoTooltip>

      <InfoTooltip 
        title="Receita Recorrente (MRR)" 
        description="Monthly Recurring Revenue. É a soma de todos os aluguéis ativos no mês atual. Representa a previsibilidade do seu fluxo de caixa."
      >
        <HeroCard
          title='Receita Recorrente (MRR)'
          value={metrics.mrr}
          subtext='vs. mês anterior'
          trend={metrics.trends.mrr}
          trendUp={true}
          icon={DollarSign}
          color='text-emerald-500'
          sparkData={SPARK_DATA_1}
        />
      </InfoTooltip>

      <InfoTooltip 
        title="Taxa de Ocupação" 
        description="Percentual de imóveis alugados em relação ao total da sua carteira. Acima de 90% é considerado excelente."
      >
        <HeroCard
          title='Taxa de Ocupação'
          value={`${metrics.occupancyRate}%`}
          subtext={metrics.occupancyRate < 80 ? 'Crítico (< 80%)' : 'Saudável (> 80%)'}
          trend={metrics.trends.occupancy}
          trendUp={metrics.occupancyRate >= 80}
          icon={Home}
          color={metrics.occupancyRate < 80 ? 'text-red-500' : 'text-emerald-500'}
        />
      </InfoTooltip>

      <InfoTooltip 
        title="ROI Médio (Yield)" 
        description="Retorno sobre Investimento anualizado. Calcula quanto o aluguel rende em relação ao valor de mercado do imóvel (Yield anual)."
      >
        <HeroCard
          title='ROI Médio Anual'
          value={metrics.avgRoi}
          subtext='Acima da inflação'
          trend={metrics.trends.roi}
          trendUp={true}
          icon={Activity}
          color='text-cyan-500'
        />
      </InfoTooltip>
    </section>
  );
};

