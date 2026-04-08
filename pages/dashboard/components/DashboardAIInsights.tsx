import React from 'react';
import { Lightbulb, Zap } from 'lucide-react';

interface DashboardAIInsightsProps {
  occupancyRate: number;
}

export const DashboardAIInsights: React.FC<DashboardAIInsightsProps> = ({ occupancyRate }) => {
  return (
    <div className='bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden'>
      <div className='absolute top-0 right-0 p-4 opacity-10'>
        <Lightbulb size={100} />
      </div>
      <div className='flex items-center gap-2 mb-4'>
        <div className='bg-white/20 p-2 rounded-lg backdrop-blur-sm'>
          <Zap size={18} className='text-yellow-300' />
        </div>
        <h3 className='font-bold text-lg'>Igloo Insights</h3>
      </div>
      <ul className='space-y-3 text-sm relative z-10'>
        <li className='flex gap-2 items-start'>
          <span className='mt-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.8)]'></span>
          <p className='opacity-90'>
            {occupancyRate < 80
              ? 'Sua vacância subiu. Revise o preço dos imóveis vagos.'
              : 'Ótimo trabalho! Mantenha a qualidade do atendimento.'}
          </p>
        </li>
        <li className='flex gap-2 items-start'>
          <span className='mt-1 w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0'></span>
          <p className='opacity-90'>Novos contratos de locação disponíveis para análise.</p>
        </li>
      </ul>
      <button className='mt-5 w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold transition-all border border-white/10'>
        Ver Recomendações
      </button>
    </div>
  );
};
