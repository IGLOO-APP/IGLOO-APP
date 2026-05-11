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
  // Ensure metrics always have a fallback to prevent UI crashes or NaN displays
  const safeMetrics = useMemo(() => ({
    occupancyRate: metrics?.occupancyRate ?? 0,
    pendingMaintenanceCount: metrics?.pendingMaintenanceCount ?? 0,
    expiringContractsCount: metrics?.expiringContractsCount ?? 0,
  }), [metrics]);

  const { occupancyRate, pendingMaintenanceCount, expiringContractsCount } = safeMetrics;

  return (
    <div className='bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-500 group/card'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='p-2 rounded-lg bg-amber-50 dark:bg-white/5 relative overflow-hidden'>
            <Zap size={18} className='text-amber-500 relative z-10 animate-pulse' />
            <div className='absolute inset-0 bg-amber-500/20 animate-ping opacity-20' />
          </div>
          <h3 className='font-bold text-lg text-slate-900 dark:text-white'>Igloo Insights</h3>
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-[8px] font-black uppercase tracking-widest text-slate-400'>Live Analysis</span>
        </div>
      </div>

      <ul className='space-y-4 text-sm'>
        {/* Occupancy Insight */}
        <li className='flex gap-3 items-start transition-all duration-700 animate-in fade-in slide-in-from-left-2'>
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500 ${occupancyRate < 80 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}></span>
          <p className='text-slate-600 dark:text-slate-300 leading-snug font-medium'>
            {occupancyRate < 80
              ? 'Sua vacância está acima do ideal. Considere revisar os preços.'
              : 'Ocupação excelente! Sua carteira está performando acima da média.'}
          </p>
        </li>

        {/* Maintenance Insight (Conditional but robust) */}
        {pendingMaintenanceCount > 0 && (
          <li className='flex gap-3 items-start transition-all duration-700 delay-150 animate-in fade-in slide-in-from-left-2'>
            <span className='mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.4)]'></span>
            <p className='text-slate-600 dark:text-slate-300 leading-snug font-medium'>
              Existem {pendingMaintenanceCount} reparos pendentes. Resolvê-los rápido evita vacância futura.
            </p>
          </li>
        )}

        {/* Contracts Insight */}
        <li className='flex gap-3 items-start transition-all duration-700 delay-300 animate-in fade-in slide-in-from-left-2'>
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500 ${expiringContractsCount > 0 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}></span>
          <p className='text-slate-600 dark:text-slate-300 leading-snug font-medium'>
            {expiringContractsCount > 0 
              ? `${expiringContractsCount} contrato(s) vencendo em breve. Hora de negociar a renovação.`
              : 'Nenhum contrato vencendo nos próximos 30 dias. Estabilidade garantida.'}
          </p>
        </li>
      </ul>

      <button className='mt-5 w-full py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-700 dark:text-slate-300 transition-all border border-gray-100 dark:border-white/5 uppercase tracking-widest flex items-center justify-center gap-2 group/btn active:scale-95'>
        Ver Recomendações
        <ArrowUpRight size={12} className='transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5' />
      </button>
    </div>
  );
};
