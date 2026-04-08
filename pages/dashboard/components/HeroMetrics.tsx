import React from 'react';
import { TrendingUp, DollarSign, Home, Activity } from 'lucide-react';
import { HeroCard } from '../../../components/ui/DashboardComponents';

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
    <section className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
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
      <HeroCard
        title='Taxa de Ocupação'
        value={`${metrics.occupancyRate}%`}
        subtext={metrics.occupancyRate < 80 ? 'Crítico (< 80%)' : 'Saudável (> 80%)'}
        trend={metrics.trends.occupancy}
        trendUp={metrics.occupancyRate >= 80}
        icon={Home}
        color={metrics.occupancyRate < 80 ? 'text-red-500' : 'text-emerald-500'}
      />
      <HeroCard
        title='ROI Médio Anual'
        value={metrics.avgRoi}
        subtext='Acima da inflação'
        trend={metrics.trends.roi}
        trendUp={true}
        icon={Activity}
        color='text-cyan-500'
      />
    </section>
  );
};
