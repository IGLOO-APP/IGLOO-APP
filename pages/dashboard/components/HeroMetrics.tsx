import React from 'react';
import { TrendingUp, DollarSign, Home, Activity, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../../../components/ui/tooltip';

interface WealthHistoryEntry {
  month: string;
  value: number;
}

interface FinancialHistoryEntry {
  month: string;
  income: number;
  expense: number;
  net: number;
  projected?: boolean;
}

interface HeroMetricsProps {
  metrics: {
    totalWealth: string;
    mrr: string;
    mrr_bruto?: number;
    mrr_liquido?: number;
    occupancyRate: number;
    occupancyPhysicalRate?: number;
    occupancyFinancialRate?: number;
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
  portfolioHealth?: {
    yield: string;
    vacancy: string;
    delinquency: string;
    delinquencyAbsolute: number;
  };
  wealthHistory?: WealthHistoryEntry[];
  financialHistory?: FinancialHistoryEntry[];
  propertyCount?: number;
  navigate: (path: string, state?: Record<string, unknown>) => void;
  className?: string;
}

function DonutRing({ value, color, size = 48 }: { value: number; color: string; size?: number }) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className='shrink-0'>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill='none'
        stroke='hsl(var(--muted))'
        strokeWidth={5}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill='none'
        stroke={color}
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap='round'
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export const HeroMetrics: React.FC<HeroMetricsProps> = ({
  metrics,
  portfolioHealth,
  propertyCount,
  navigate,
  className = '',
}) => {
  const occRate = metrics.occupancyPhysicalRate ?? metrics.occupancyRate;
  const occFinRate = metrics.occupancyFinancialRate ?? metrics.occupancyRate;
  const occLow = occRate < 70 && occFinRate < 90;

  return (
    <section className={'h-full ' + className}>
      <svg className='absolute w-0 h-0' aria-hidden='true'>
        <filter id='distorsion'>
          <feTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='1' result='noise' />
          <feDisplacementMap
            in='SourceGraphic'
            in2='noise'
            scale='8'
            xChannelSelector='R'
            yChannelSelector='G'
          />
        </filter>
      </svg>
      <div className='grid grid-cols-4 gap-3 h-full grid-rows-3 items-stretch'>
        {/* Patrimônio */}
        <div
          className='col-span-4 lg-card lg-card-lift flex items-center justify-center p-6'
          onClick={() => navigate('/financials')}
          style={{ cursor: 'pointer' }}
        >
          <div className='flex items-center justify-between gap-4 w-full relative z-10'>
            <div className='space-y-1.5'>
              <div className='flex items-center gap-1.5'>
                <TrendingUp size={16} strokeWidth={1.8} className='text-indigo-500' />
                <span className='text-xs font-medium text-muted-foreground'>Patrimônio Total</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className='w-3 h-3 rounded-full bg-muted-foreground/10 text-muted-foreground flex items-center justify-center text-[7px] font-bold cursor-help'>
                      ?
                    </TooltipTrigger>
                    <TooltipContent side='top'>
                      <p className='text-xs font-medium'>
                        Soma do valor de mercado estimado de todos os seus imóveis cadastrados.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <h3 className='text-2xl font-bold tracking-tight text-foreground text-balance'>
                {metrics.totalWealth}
              </h3>
              <div className='flex items-center gap-2 flex-wrap'>
                <Badge variant='default'>
                  <ArrowUp size={10} strokeWidth={1.8} /> {metrics.trends.wealth}
                </Badge>
                <span className='text-xs text-muted-foreground/60'>vs. mês anterior</span>
                {portfolioHealth?.yield && (
                  <span className='text-xs text-muted-foreground/40'>
                    &middot; Yield {portfolioHealth.yield}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Ocupação */}
        <div className={`col-span-2 lg-card lg-card-lift`}>
          <div className='p-6 flex flex-col h-full gap-4 w-full relative z-10'>
            <div className='flex items-center gap-1.5'>
              <Home
                size={16}
                strokeWidth={1.8}
                className={occLow ? 'text-destructive' : 'text-emerald-500'}
              />
              <span className='text-xs font-medium text-muted-foreground'>Ocupação</span>
            </div>

            <div className='flex items-center gap-4'>
              <DonutRing value={occRate} color={occLow ? '#ef4444' : '#10b981'} size={52} />
              <div>
                <h3 className='text-2xl font-bold tracking-tight text-foreground text-balance'>
                  {occRate}%
                </h3>
                <div className='flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1'>
                  <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${occLow ? 'bg-destructive' : 'bg-emerald-500'}`}
                    />
                    Física {occRate}%
                  </span>
                  <span className='flex items-center gap-1.5 text-xs text-muted-foreground/60'>
                    <span className='w-1.5 h-1.5 rounded-full bg-muted-foreground/30' />
                    Financeira {occFinRate}%
                  </span>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2 mt-auto'>
              <Badge variant={occLow ? 'destructive' : 'default'}>
                {Number(metrics.trends.occupancy) >= 0 ? (
                  <ArrowUp size={10} strokeWidth={1.8} />
                ) : (
                  <ArrowDown size={10} strokeWidth={1.8} />
                )}{' '}
                {metrics.trends.occupancy}
              </Badge>
              <span className={`text-xs ${occLow ? 'text-destructive' : 'text-muted-foreground'}`}>
                {metrics.occupancyRate < 80
                  ? `${100 - metrics.occupancyRate}% vagos`
                  : 'Carteira cheia'}
              </span>
              {propertyCount != null && (
                <span className='text-xs text-muted-foreground/40 ml-auto'>
                  {propertyCount} imóveis
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ROI */}
        <div
          className={`col-span-2 lg-card lg-card-lift ${metrics.avgRoi === '0%' || !metrics.avgRoi ? 'opacity-70' : ''}`}
        >
          <div className='p-6 flex flex-col justify-between h-full w-full relative z-10'>
            <div className='space-y-2'>
              <div className='flex items-center gap-1.5'>
                <Activity
                  size={16}
                  strokeWidth={1.8}
                  className={metrics.avgRoi === '0%' ? 'text-muted-foreground' : 'text-cyan-500'}
                />
                <span className='text-xs font-medium text-muted-foreground'>ROI Anual</span>
              </div>
              <h3 className='text-xl font-bold tracking-tight text-foreground text-balance'>
                {metrics.avgRoi === '0%' || !metrics.avgRoi ? '--' : metrics.avgRoi}
              </h3>
              {portfolioHealth?.yield && metrics.avgRoi !== '0%' && (
                <div className='flex items-center gap-2 text-xs'>
                  <span className='text-muted-foreground/60'>Yield carteira:</span>
                  <span className='font-medium text-muted-foreground'>
                    {portfolioHealth.yield}%
                  </span>
                </div>
              )}
            </div>
            <div className='mt-2 flex flex-wrap items-center gap-2'>
              <Badge variant={metrics.avgRoi === '0%' ? 'outline' : 'default'}>
                <ArrowUp size={10} strokeWidth={1.8} /> {metrics.trends.roi}
              </Badge>
              {(metrics.expiringContractsCount ?? 0) > 0 && (
                <span className='text-xs font-medium text-amber-600 dark:text-amber-400'>
                  {metrics.expiringContractsCount} contratos vencendo
                </span>
              )}
              {portfolioHealth?.delinquency != null && Number(portfolioHealth.delinquency) > 0 && (
                <span className='text-xs text-muted-foreground/40'>
                  &middot; Inadimplência {portfolioHealth.delinquency}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MRR */}
        <div className='col-span-4 lg-card lg-card-lift'>
          <div className='p-6 flex flex-row items-center justify-between gap-6 w-full relative z-10'>
            <div className='flex items-start justify-between flex-1'>
              <div>
                <div className='flex items-center gap-1.5 mb-1'>
                  <DollarSign size={16} strokeWidth={1.8} className='text-emerald-500' />
                  <span className='text-xs font-medium text-muted-foreground'>
                    Receita Recorrente
                  </span>
                </div>
                <h3 className='text-xl font-bold tracking-tight text-foreground text-balance'>
                  {metrics.mrr}
                </h3>
                <div className='flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground'>
                  {metrics.mrr_bruto != null && (
                    <span>
                      Bruto: R${' '}
                      {metrics.mrr_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {metrics.mrr_liquido != null && metrics.mrr_liquido !== metrics.mrr_bruto && (
                    <span className='text-muted-foreground/60'>
                      Líquido: R${' '}
                      {metrics.mrr_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <span className='text-muted-foreground/40'>&middot;</span>
                  <span>
                    <Users size={12} strokeWidth={1.8} className='inline mr-0.5' />
                    {metrics.totalTenants ?? 0} inquilinos
                  </span>
                  {portfolioHealth?.vacancy != null && Number(portfolioHealth.vacancy) > 0 && (
                    <>
                      <span className='text-muted-foreground/40'>&middot;</span>
                      <span className='text-destructive/70'>
                        {portfolioHealth.vacancy}% vacância financeira
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3 shrink-0'>
              <Badge variant='default'>
                <ArrowUp size={10} strokeWidth={1.8} /> {metrics.trends.mrr}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
