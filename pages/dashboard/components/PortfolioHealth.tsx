import React from 'react';
import { TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface PortfolioHealthProps {
  health: {
    yield: string;
    vacancy: string;
    delinquency: string;
    delinquencyAbsolute: number;
  };
}

const TooltipTrigger = ({ title, description }: { title: string; description: string }) => (
  <div className='relative shrink-0 group/tooltip'>
    <div className='w-3 h-3 rounded-full bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center text-[7px] font-bold leading-none cursor-help'>
      ?
    </div>
    <div
      className='absolute z-[100] w-52 p-2.5 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 translate-y-1 group-hover/tooltip:translate-y-0'
      style={{ bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' }}
    >
      <p className='text-[9px] font-black uppercase tracking-[0.15em] mb-1 text-slate-300'>
        {title}
      </p>
      <p className='text-[10px] leading-snug text-slate-400 font-medium'>{description}</p>
      <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95' />
    </div>
  </div>
);

export const PortfolioHealth: React.FC<PortfolioHealthProps> = ({ health }) => {
  const parseVal = (val: string | number) => {
    if (!val) return 0;
    const cleaned = typeof val === 'string' ? val.replace(/[^\d.-]/g, '') : val;
    return parseFloat(cleaned as string) || 0;
  };

  const isHealthyVacancy = parseVal(health?.vacancy) === 0;
  const isHealthyDelinquency = parseVal(health?.delinquency) === 0;

  return (
    <div className='w-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-[32px] shadow-sm flex flex-col md:flex-row items-center gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/5 transition-all duration-500'>
      {/* Yield Médio */}
      <div className='flex-1 w-full p-3 relative'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='p-2 rounded-xl bg-primary/10 text-primary transition-transform hover:scale-110 duration-300'>
              <TrendingUp size={15} />
            </div>
            <div>
              <div className='flex items-center gap-1.5 mb-0.5'>
                <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                  Yield Médio
                </p>
                <TooltipTrigger
                  title='Análise de Yield'
                  description='Retorno anual médio da carteira. Calculado como (Receita Anual / Valor Patrimonial) × 100.'
                />
              </div>
              <div className='flex items-center gap-1.5'>
                <p className='text-base font-black text-slate-900 dark:text-white'>
                  {health?.yield || '0'}%
                </p>
                <span className='text-[9px] font-bold text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded'>
                  +0.2%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vacância Financeira */}
      <div className='flex-1 w-full p-3 relative'>
        <div className='flex items-center gap-2.5'>
          <div
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${isHealthyVacancy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
          >
            <AlertCircle size={16} />
          </div>
          <div>
            <div className='flex items-center gap-1.5 mb-0.5'>
              <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                Vacância Financeira
              </p>
              <TooltipTrigger
                title='Cálculo de Vacância Financeira'
                description='Percentual da receita potencial perdida por imóveis vagos. Diferente da ocupação física (número de imóveis), esta métrica reflete o impacto financeiro real na sua receita.'
              />
            </div>
            {isHealthyVacancy ? (
              <p className='text-[11px] font-black text-emerald-500 uppercase tracking-tight'>
                Carteira 100% ocupada
              </p>
            ) : (
              <div className='flex items-center gap-3'>
                <p className='text-base font-black text-slate-900 dark:text-white'>
                  {health?.vacancy || '0'}%
                </p>
                <button 
                  onClick={() => window.location.href = '/properties'} 
                  className='text-[9px] font-black uppercase tracking-widest text-primary hover:underline'
                >
                  Agir Agora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inadimplência */}
      <div className='flex-1 w-full p-3 relative'>
        <div className='flex items-center gap-2.5'>
          <div
            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${isHealthyDelinquency ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
          >
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className='flex items-center gap-1.5 mb-0.5'>
              <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                Inadimplência
              </p>
              <TooltipTrigger
                title='Inadimplência Real'
                description='Percentual do valor total em aberto sobre a receita esperada do mês.'
              />
            </div>
            {isHealthyDelinquency ? (
              <p className='text-[11px] font-black text-emerald-500 uppercase tracking-tight'>
                Sem inadimplência
              </p>
            ) : (
              <div className='flex items-center gap-1.5'>
                <p className='text-base font-black text-red-500'>{health?.delinquency || '0'}%</p>
                <span className='text-[9px] font-bold text-red-500/70'>
                  ({formatCurrency(health?.delinquencyAbsolute || 0)})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
