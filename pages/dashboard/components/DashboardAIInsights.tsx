import React, { useMemo } from 'react';
import { Zap, ArrowUpRight } from 'lucide-react';

interface DashboardAIInsightsProps {
  metrics: {
    occupancyRate: number;
    pendingMaintenanceCount: number;
    expiringContractsCount: number;
  };
}

export const DashboardAIInsights: React.FC<DashboardAIInsightsProps> = ({ metrics }) => {
  // 1. Data Validation & Robustness
  const safeMetrics = useMemo(() => ({
    occupancyRate: metrics?.occupancyRate ?? 0,
    pendingMaintenanceCount: metrics?.pendingMaintenanceCount ?? 0,
    expiringContractsCount: metrics?.expiringContractsCount ?? 0,
  }), [metrics]);

  const { occupancyRate, pendingMaintenanceCount, expiringContractsCount } = safeMetrics;

  return (
    <div className='w-full h-full bg-white dark:bg-surface-dark p-6 md:p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400'>
            <Zap size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className='font-black text-base text-slate-900 dark:text-white uppercase tracking-tight'>Igloo Insights</h3>
            <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Financial Advisor</p>
          </div>
        </div>
        <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5'>
          <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
          <span className='text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400'>Live Analysis</span>
        </div>
      </div>

      <div className='space-y-4 flex-grow'>
        {/* Occupancy Insight */}
        <div className='flex items-start gap-4 p-5 rounded-[24px] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 transition-all'>
          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${occupancyRate < 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          <div className='space-y-1'>
            <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Ocupação da Carteira</p>
            <p className='text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed'>
              {occupancyRate < 80
                ? 'Sua vacância está acima do ideal. Considere revisar os preços.'
                : 'Ocupação excelente! Sua carteira está performando acima da média.'}
            </p>
          </div>
        </div>

        {/* Maintenance Insight */}
        {pendingMaintenanceCount > 0 && (
          <div className='flex items-start gap-4 p-5 rounded-[24px] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 transition-all'>
            <div className='mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0' />
            <div className='space-y-1'>
              <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Manutenção Preventiva</p>
              <p className='text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed'>
                Existem {pendingMaintenanceCount} reparos pendentes. Resolvê-los evita vacância futura.
              </p>
            </div>
          </div>
        )}

        {/* Contracts Insight */}
        <div className='flex items-start gap-4 p-5 rounded-[24px] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 transition-all'>
          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${expiringContractsCount > 0 ? 'bg-blue-500' : 'bg-emerald-500'}`} />
          <div className='space-y-1'>
            <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Vigência de Contratos</p>
            <p className='text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed'>
              {expiringContractsCount > 0
                ? `${expiringContractsCount} contrato(s) vencendo em breve. Hora de negociar a renovação.`
                : 'Nenhum contrato vencendo nos próximos 30 dias.'}
            </p>
          </div>
        </div>
      </div>

      <div className='mt-6'>
        <button className='w-full py-3.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2'>
          Ver Recomendações
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};
