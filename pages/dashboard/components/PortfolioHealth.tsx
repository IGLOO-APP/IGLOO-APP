import React from 'react';
import { TrendingUp, AlertCircle, ShieldCheck, Info } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface PortfolioHealthProps {
  health: {
    yield: string;
    vacancy: string;
    delinquency: string;
    delinquencyAbsolute: number;
  };
}

export const PortfolioHealth: React.FC<PortfolioHealthProps> = ({ health }) => {
  const isHealthyVacancy = parseFloat(health.vacancy) === 0;
  const isHealthyDelinquency = parseFloat(health.delinquency) === 0;

  return (
    <div className='w-full bg-white dark:bg-surface-dark rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-2 flex flex-col md:flex-row items-center gap-2 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/5'>
      {/* Yield Médio */}
      <div className='flex-1 w-full p-4 group relative'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-xl bg-primary/10 text-primary'>
              <TrendingUp size={18} />
            </div>
            <div>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Yield Médio</p>
              <div className='flex items-center gap-2'>
                <p className='text-lg font-black text-slate-900 dark:text-white'>{health.yield}%</p>
                <span className='text-[10px] font-bold text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded'>
                  +0.2%
                </span>
              </div>
            </div>
          </div>
          <div className='text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-help flex items-center gap-1'>
            <Info size={12} />
            vs. meta 6%
          </div>
        </div>
        
        {/* Tooltip Pattern */}
        <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl'>
          <p className='font-bold mb-1'>Cálculo do Yield Médio</p>
          <p className='text-slate-300 leading-relaxed'>Retorno anual médio da carteira. Calculado como (Receita Anual / Valor Patrimonial) × 100.</p>
          <div className='absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900' />
        </div>
      </div>

      {/* Vacância Financeira */}
      <div className='flex-1 w-full p-4 group relative'>
        <div className='flex items-center gap-3'>
          <div className={`p-2 rounded-xl ${isHealthyVacancy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
            <AlertCircle size={18} />
          </div>
          <div>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Vacância Financeira</p>
            {isHealthyVacancy ? (
              <p className='text-sm font-black text-emerald-500 uppercase tracking-tight'>Carteira 100% ocupada</p>
            ) : (
              <p className='text-lg font-black text-slate-900 dark:text-white'>{health.vacancy}%</p>
            )}
          </div>
        </div>

        {/* Tooltip Pattern */}
        <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl'>
          <p className='font-bold mb-1'>Cálculo de Vacância</p>
          <p className='text-slate-300 leading-relaxed'>Percentual da receita potencial perdida por imóveis vagos. (Imóveis vagos × Aluguel Médio / Receita Potencial) × 100.</p>
          <div className='absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900' />
        </div>
      </div>

      {/* Inadimplência */}
      <div className='flex-1 w-full p-4 group relative'>
        <div className='flex items-center gap-3'>
          <div className={`p-2 rounded-xl ${isHealthyDelinquency ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Inadimplência</p>
            {isHealthyDelinquency ? (
              <p className='text-sm font-black text-emerald-500 uppercase tracking-tight'>Sem inadimplência</p>
            ) : (
              <div className='flex items-center gap-2'>
                <p className='text-lg font-black text-red-500'>{health.delinquency}%</p>
                <span className='text-[10px] font-bold text-red-500/70'>
                  ({formatCurrency(health.delinquencyAbsolute)} em aberto)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tooltip Pattern */}
        <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-xl'>
          <p className='font-bold mb-1'>Cálculo de Inadimplência</p>
          <p className='text-slate-300 leading-relaxed'>Percentual do valor total em aberto sobre a receita esperada do mês.</p>
          <div className='absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900' />
        </div>
      </div>
    </div>
  );
};
