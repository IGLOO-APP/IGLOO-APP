import React, { useState } from 'react';
import { BarChart3, Info, ChevronDown } from 'lucide-react';
import { InfoTooltip } from '../../../components/ui/InfoTooltip';

interface PropertyYieldChartProps {
  yieldData: any[];
  avgYield: string;
}

export const PropertyYieldChart: React.FC<PropertyYieldChartProps> = ({ yieldData, avgYield }) => {
  const [period, setPeriod] = useState('Último mês');
  const avgValue = parseFloat(avgYield);

  return (
    <div className='bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h3 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2'>
            <BarChart3 className='text-primary' size={20} /> Yield por Imóvel
            <InfoTooltip 
              title="Yield por Imóvel" 
              description="Compara o retorno individual de cada imóvel com a média da carteira. A linha pontilhada indica o yield médio atual."
            >
              <Info size={16} className='text-slate-400 cursor-help' />
            </InfoTooltip>
          </h3>
        </div>
        
        {/* Period Selector */}
        <div className='relative'>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className='appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer hover:bg-slate-100 transition-colors'
          >
            <option>Último mês</option>
            <option>Últimos 3 meses</option>
            <option>Último ano</option>
          </select>
          <ChevronDown size={12} className='absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' />
        </div>
      </div>

      <div className='relative h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-4'>
        {/* Dashed vertical line for average */}
        <div 
          className='absolute top-0 bottom-0 border-l border-dashed border-slate-300 dark:border-white/20 z-0'
          style={{ left: '60%' }} 
        >
          <span className='absolute top-0 -translate-x-1/2 -translate-y-full text-[8px] font-black text-slate-400 uppercase bg-white dark:bg-surface-dark px-1 whitespace-nowrap'>
            Média ({avgYield}%)
          </span>
        </div>

        {yieldData.map((item) => {
          const isAbove = item.yield > avgValue;
          const isBelow = item.yield < (avgValue * 0.8);
          const barColor = isAbove ? 'bg-emerald-500' : isBelow ? 'bg-red-500' : 'bg-amber-500';
          
          // Width calc: item.yield / maxYield * 100
          // For mock, we'll use a relative scale where avg is at 60%
          const width = (item.yield / (avgValue || 1)) * 60;

          return (
            <div key={item.id} className='relative z-10 flex items-center gap-3 group'>
              {/* Photo */}
              <div 
                className='w-10 h-10 rounded-xl bg-cover bg-center shrink-0 border border-white dark:border-white/10 shadow-sm group-hover:scale-110 transition-transform'
                style={{ backgroundImage: `url(${item.image})` }}
              />
              
              <div className='flex-1'>
                <div className='flex justify-between items-center mb-1.5'>
                  <span className='text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]'>
                    {item.name}
                  </span>
                  <span className={`text-[11px] font-black ${isAbove ? 'text-emerald-500' : isBelow ? 'text-red-500' : 'text-amber-500'}`}>
                    {item.yield}%
                  </span>
                </div>
                
                {/* Bar Container */}
                <div className='h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden'>
                  <div 
                    className={`h-full ${barColor} transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                    style={{ width: `${Math.min(width, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
