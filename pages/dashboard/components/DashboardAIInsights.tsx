import React, { useMemo } from 'react';
import { Zap, ArrowUpRight } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { executeWorkflowAction } from '../../../services/workflow/workflowActions';

interface DashboardAIInsightsProps {
  metrics: {
    occupancyRate: number;
    pendingMaintenanceCount: number;
    expiringContractsCount: number;
  };
}

export const DashboardAIInsights: React.FC<DashboardAIInsightsProps> = ({ metrics }) => {
  // 1. Data Validation & Robustness
  const safeMetrics = useMemo(
    () => ({
      occupancyRate: metrics?.occupancyRate ?? 0,
      pendingMaintenanceCount: metrics?.pendingMaintenanceCount ?? 0,
      expiringContractsCount: metrics?.expiringContractsCount ?? 0,
    }),
    [metrics]
  );

  const { occupancyRate, pendingMaintenanceCount, expiringContractsCount } = safeMetrics;

  const handleAction = async (endpoint: string) => {
    try {
      await executeWorkflowAction(endpoint);
      window.location.reload();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  return (
    <Card className='flex flex-col'>
      <CardHeader className='flex flex-row items-center justify-between pb-0 w-full'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
            <Zap size={16} />
          </div>
          <div>
            <h3 className='font-black text-base text-slate-900 dark:text-white uppercase tracking-tight'>
              Igloo Insights
            </h3>
            <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
              Financial Advisor
            </p>
          </div>
        </div>
        <Badge variant='outline'>
          <span className='w-1 h-1 rounded-full bg-emerald-500' />
          Live Analysis
        </Badge>
      </CardHeader>

      <CardContent className='space-y-3 flex flex-col flex-grow pt-4'>
        {/* Occupancy Insight */}
        <div className='flex flex-col gap-2 p-4 rounded-[24px] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5'>
          <div className='flex items-start gap-3'>
            <div
              className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${occupancyRate < 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
            />
            <div className='space-y-0.5'>
              <p className='text-[9px] font-black uppercase tracking-widest text-slate-400'>
                Ocupação da Carteira
              </p>
              <p className='text-xs font-bold text-slate-500 dark:text-slate-300 leading-relaxed'>
                {occupancyRate < 80
                  ? 'Sua vacância está acima do ideal. Considere revisar os preços.'
                  : 'Ocupação excelente! Sua carteira está performando acima da média.'}
              </p>
            </div>
          </div>
          {occupancyRate < 80 && (
            <Button
              onClick={() => handleAction('/api/imoveis/sugestao-preco')}
              variant='link'
              size='sm'
              className='text-[9px] font-black uppercase tracking-widest self-end'
            >
              Revisar preço
            </Button>
          )}
        </div>

        {/* Maintenance Insight */}
        {pendingMaintenanceCount > 0 && (
          <div className='flex flex-col gap-2 p-4 rounded-[24px] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5'>
            <div className='flex items-start gap-3'>
              <div className='mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0' />
              <div className='space-y-0.5'>
                <p className='text-[9px] font-black uppercase tracking-widest text-slate-400'>
                  Manutenção Preventiva
                </p>
                <p className='text-xs font-bold text-slate-500 dark:text-slate-300 leading-relaxed'>
                  Existem {pendingMaintenanceCount} reparos pendentes.
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleAction('/api/manutencao/resolver')}
              variant='link'
              size='sm'
              className='text-[9px] font-black uppercase tracking-widest self-end'
            >
              Resolver reparo
            </Button>
          </div>
        )}

        {/* Contracts Insight */}
        <div className='flex items-start gap-3 p-4 rounded-[24px] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5'>
          <div
            className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${expiringContractsCount > 0 ? 'bg-blue-500' : 'bg-emerald-500'}`}
          />
          <div className='space-y-0.5'>
            <p className='text-[9px] font-black uppercase tracking-widest text-slate-400'>
              Vigência de Contratos
            </p>
            <p className='text-xs font-bold text-slate-500 dark:text-slate-300 leading-relaxed'>
              {expiringContractsCount > 0
                ? `${expiringContractsCount} contrato(s) vencendo em breve.`
                : 'Nenhum contrato vencendo nos próximos 30 dias.'}
            </p>
          </div>
        </div>

        <div className='mt-auto pt-4'>
          <Button
            variant='secondary'
            size='sm'
            className='w-full text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2'
          >
            Ver Recomendações
            <ArrowUpRight size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
