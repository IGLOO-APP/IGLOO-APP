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
  // Robust parsing to handle strings like "0.00%", "0", or actual numbers safely
  const parseVal = (val: string | number) => {
    if (!val) return 0;
    const cleaned = typeof val === 'string' ? val.replace(/[^\d.-]/g, '') : val;
    return parseFloat(cleaned as string) || 0;
  };

  const isHealthyVacancy = parseVal(health?.vacancy) === 0;
  const isHealthyDelinquency = parseVal(health?.delinquency) === 0;

  const tooltipClass = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 bg-slate-950/95 backdrop-blur-md text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 shadow-2xl border border-white/10 translate-y-2 group-hover:translate-y-0';

  return (
    <div className='w-full bg-white dark:bg-surface-dark rounded-[24px] md:rounded-[32px] border border-slate-200/60 dark:border-white/5 shadow-premium p-1.5 md:p-2 flex flex-col md:flex-row items-center gap-1 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200/60 dark:divide-white/5 transition-all duration-500'>
      {/* Yield Médio */}
      <div className='flex-1 w-full p-3 md:p-4 group relative'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 md:p-2.5 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110 duration-300'>
              <TrendingUp size={16} className="md:size-[18px]" />
            </div>
            <div>
              <p className='text-[8px] md:text-[9px] font-black text-slate-muted uppercase tracking-[0.2em] mb-0.5'>Yield Médio</p>
              <div className='flex items-center gap-2'>
                <p className='text-base md:text-lg font-black text-slate-main dark:text-white'>{health?.yield || '0'}%</p>
                <span className='text-[9px] md:text-[10px] font-bold text-emerald-500 flex items-center bg-emerald-500/10 px-1 md:px-1.5 py-0.5 rounded'>
                  +0.2%
                </span>
              </div>
            </div>
          </div>
          <div className='text-[10px] font-bold text-slate-muted opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-help flex items-center gap-1 -translate-x-2 group-hover:translate-x-0'>
            <Info size={12} />
            vs. meta 6%
          </div>
        </div>
        
        {/* Tooltip Pattern */}
        <div className={tooltipClass}>
          <p className='font-black uppercase tracking-[0.15em] mb-1.5 text-primary border-b border-white/5 pb-1.5'>Análise de Yield</p>
          <p className='text-slate-300 leading-snug font-medium'>Retorno anual médio da carteira. Calculado como (Receita Anual / Valor Patrimonial) × 100.</p>
          <div className='absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-950/90' />
        </div>
      </div>

      {/* Vacância Financeira */}
      <div className='flex-1 w-full p-4 group relative'>
        <div className='flex items-center gap-3'>
          <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${isHealthyVacancy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
            <AlertCircle size={18} />
          </div>
          <div>
            <p className='text-[9px] font-black text-slate-muted uppercase tracking-[0.2em] mb-0.5'>Vacância Financeira</p>
            {isHealthyVacancy ? (
              <p className='text-[11px] font-black text-emerald-500 uppercase tracking-tight'>Carteira 100% ocupada</p>
            ) : (
              <p className='text-lg font-black text-slate-main dark:text-white'>{health?.vacancy || '0'}%</p>
            )}
          </div>
        </div>

        {/* Tooltip Pattern */}
        <div className={tooltipClass}>
          <p className='font-black uppercase tracking-[0.15em] mb-1.5 text-amber-400 border-b border-white/5 pb-1.5'>Cálculo de Vacância</p>
          <p className='text-slate-300 leading-snug font-medium'>Percentual da receita potencial perdida por imóveis vagos. (Imóveis vagos × Aluguel Médio / Receita Potencial) × 100.</p>
          <div className='absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-950/90' />
        </div>
      </div>

      {/* Inadimplência */}
      <div className='flex-1 w-full p-4 group relative'>
        <div className='flex items-center gap-3'>
          <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 ${isHealthyDelinquency ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className='text-[9px] font-black text-slate-muted uppercase tracking-[0.2em] mb-0.5'>Inadimplência</p>
            {isHealthyDelinquency ? (
              <p className='text-[11px] font-black text-emerald-500 uppercase tracking-tight'>Sem inadimplência</p>
            ) : (
              <div className='flex items-center gap-2'>
                <p className='text-lg font-black text-red-500'>{health?.delinquency || '0'}%</p>
                <span className='text-[10px] font-bold text-red-500/70'>
                  ({formatCurrency(health?.delinquencyAbsolute || 0)} em aberto)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tooltip Pattern */}
        <div className={tooltipClass}>
          <p className='font-black uppercase tracking-[0.15em] mb-1.5 text-red-500 border-b border-white/5 pb-1.5'>Inadimplência Real</p>
          <p className='text-slate-300 leading-snug font-medium'>Percentual do valor total em aberto sobre a receita esperada do mês.</p>
          <div className='absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-950/90' />
        </div>
      </div>
    </div>
  );
};
