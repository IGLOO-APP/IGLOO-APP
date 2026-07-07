import React, { useMemo } from 'react';
import { Zap, ArrowUpRight } from 'lucide-react';
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
    <div className='w-full h-full bg-white dark:bg-surface-dark p-5 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col'>
      <div className='flex items-center justify-between mb-5'>
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
        <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5'>
          <span className='w-1 h-1 rounded-full bg-emerald-500' />
          <span className='text-[7px] font-black uppercase tracking-widest text-slate-400'>
            Live Analysis
          </span>
        </div>
      </div>

      <div className='space-y-3 flex-grow'>
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
            <button
              onClick={() => handleAction('/api/imoveis/sugestao-preco')}
              className='text-[9px] font-black text-primary hover:underline self-end uppercase tracking-widest'
            >
              Revisar preço
            </button>
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
            <button
              onClick={() => handleAction('/api/manutencao/resolver')}
              className='text-[9px] font-black text-primary hover:underline self-end uppercase tracking-widest'
            >
              Resolver reparo
            </button>
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
      </div>

      <div className='mt-4'>
        <button className='w-full py-2.5 rounded-2xl bg-slate-50 dark:bg-black/20 text-slate-500 dark:text-slate-400 font-black text-[9px] uppercase tracking-widest border border-transparent hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center gap-2'>
          Ver Recomendações
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};
