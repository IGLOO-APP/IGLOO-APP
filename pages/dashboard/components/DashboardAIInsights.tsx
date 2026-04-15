import React from 'react';
import { Zap } from 'lucide-react';

interface DashboardAIInsightsProps {
  occupancyRate: number;
}

export const DashboardAIInsights: React.FC<DashboardAIInsightsProps> = ({ occupancyRate }) => {
  return (
    <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
      <div className='flex items-center gap-2 mb-4'>
        <div className='p-2 rounded-lg bg-amber-50 dark:bg-white/5'>
          <Zap size={18} className='text-amber-500' />
        </div>
        <h3 className='font-bold text-lg text-slate-900 dark:text-white'>Igloo Insights</h3>
      </div>
      <ul className='space-y-3 text-sm'>
        <li className='flex gap-2 items-start'>
          <span className='mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0'></span>
          <p className='text-slate-600 dark:text-slate-300'>
            {occupancyRate < 80
              ? 'Sua vacância subiu. Revise o preço dos imóveis vagos.'
              : 'Ótimo trabalho! Mantenha a qualidade do atendimento.'}
          </p>
        </li>
        <li className='flex gap-2 items-start'>
          <span className='mt-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0'></span>
          <p className='text-slate-600 dark:text-slate-300'>Novos contratos de locação disponíveis para análise.</p>
        </li>
      </ul>
      <button className='mt-5 w-full py-2.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors border border-gray-100 dark:border-white/5'>
        Ver Recomendações
      </button>
    </div>
  );
};
