import React from 'react';
import { Zap } from 'lucide-react';

interface DashboardAIInsightsProps {
  metrics: {
    occupancyRate: number;
    pendingMaintenanceCount: number;
    expiringContractsCount: number;
  };
}

export const DashboardAIInsights: React.FC<DashboardAIInsightsProps> = ({ metrics }) => {
  const { occupancyRate, pendingMaintenanceCount, expiringContractsCount } = metrics;
  
  return (
    <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
      <div className='flex items-center gap-2 mb-4'>
        <div className='p-2 rounded-lg bg-amber-50 dark:bg-white/5'>
          <Zap size={18} className='text-amber-500' />
        </div>
        <h3 className='font-bold text-lg text-slate-900 dark:text-white'>Igloo Insights</h3>
      </div>
      <ul className='space-y-4 text-sm'>
        <li className='flex gap-3 items-start'>
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${occupancyRate < 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
          <p className='text-slate-600 dark:text-slate-300 leading-snug'>
            {occupancyRate < 80
              ? 'Sua vacância está acima do ideal. Considere revisar os preços.'
              : 'Ocupação excelente! Sua carteira está performando acima da média.'}
          </p>
        </li>

        {pendingMaintenanceCount > 0 && (
          <li className='flex gap-3 items-start'>
            <span className='mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0'></span>
            <p className='text-slate-600 dark:text-slate-300 leading-snug'>
              Existem {pendingMaintenanceCount} reparos pendentes. Resolvê-los rápido evita vacância futura.
            </p>
          </li>
        )}

        {expiringContractsCount > 0 ? (
          <li className='flex gap-3 items-start'>
            <span className='mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0'></span>
            <p className='text-slate-600 dark:text-slate-300 leading-snug'>
              {expiringContractsCount} contrato(s) vencendo em breve. Hora de negociar a renovação.
            </p>
          </li>
        ) : (
            <li className='flex gap-3 items-start'>
            <span className='mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0'></span>
            <p className='text-slate-600 dark:text-slate-300 leading-snug'>
              Nenhum contrato vencendo nos próximos 30 dias. Estabilidade garantida.
            </p>
          </li>
        )}
      </ul>
      <button className='mt-6 w-full py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 transition-all border border-gray-100 dark:border-white/5 uppercase tracking-widest'>
        Ver Recomendações
      </button>
    </div>
  );
};
