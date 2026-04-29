import React from 'react';
import { InfoTooltip } from '../../../components/ui/InfoTooltip';

interface PropertyPerformanceProps {
  topProperties: any[];
}

export const PropertyPerformance: React.FC<PropertyPerformanceProps> = ({ topProperties }) => {
  return (
    <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-bold text-slate-900 dark:text-white'>
          Performance por Propriedade
        </h3>
        <button className='text-xs font-bold text-primary hover:underline'>
          Ver Todos
        </button>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left'>
          <thead>
            <tr className='text-xs text-slate-400 border-b border-gray-100 dark:border-white/5'>
              <th className='pb-3 font-bold uppercase pl-2'>Imóvel</th>
              <th className='pb-3 font-bold uppercase text-right'>Receita</th>
              <th className='pb-3 font-bold uppercase text-right'>
                <InfoTooltip 
                  title="Yield (a.m)" 
                  description="Rendimento mensal do imóvel. É o valor do aluguel dividido pelo valor de mercado. Indica a eficiência do seu capital alocado."
                >
                  <span className='cursor-help underline decoration-dotted decoration-slate-300 underline-offset-4'>Yield (a.m)</span>
                </InfoTooltip>
              </th>
              <th className='pb-3 font-bold uppercase text-center'>Status</th>
            </tr>
          </thead>
          <tbody className='text-sm'>
            {topProperties.map((prop: any) => (
              <tr
                key={prop.id}
                className='group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0'
              >
                <td className='py-3 pl-2'>
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-10 h-10 rounded-lg bg-cover bg-center shrink-0 shadow-sm'
                      style={{ backgroundImage: `url(${prop.image})` }}
                    ></div>
                    <span className='font-bold text-slate-800 dark:text-white line-clamp-1'>
                      {prop.name}
                    </span>
                  </div>
                </td>
                <td className='py-3 text-right font-medium text-slate-600 dark:text-slate-300'>
                  R$ {prop.revenue}
                </td>
                <td className='py-3 text-right font-bold text-emerald-500'>
                  {prop.yield > 0 ? `${prop.yield}%` : '-'}
                </td>
                <td className='py-3 text-center'>
                  <div className='relative group/tooltip inline-block'>
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        prop.status === 'occupied'
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                          : prop.status === 'warning'
                            ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                            : prop.status === 'vacant'
                              ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                              : 'bg-slate-400'
                      }`}
                    ></span>
                    <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50'>
                      {prop.status === 'occupied'
                        ? 'Ocupado e em dia'
                        : prop.status === 'warning'
                          ? 'Contrato vencendo em breve'
                          : prop.status === 'vacant'
                            ? 'Imóvel vago'
                            : 'Sem contrato ativo'}
                      <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900'></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
