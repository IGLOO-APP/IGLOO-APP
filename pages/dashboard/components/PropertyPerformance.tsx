import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { InfoTooltip } from '../../../components/ui/InfoTooltip';
import { formatCurrency } from '../../../utils/formatters';

interface PropertyPerformanceProps {
  topProperties: any[];
}

export const PropertyPerformance: React.FC<PropertyPerformanceProps> = ({ topProperties = [] }) => {
  const navigate = useNavigate();

  return (
    <div className='bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-500'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight'>
          Performance por Ativo
        </h3>
        <button 
          onClick={() => navigate('/properties')}
          className='text-[10px] font-black text-primary hover:underline uppercase tracking-widest'
        >
          Ver Todos
        </button>
      </div>

      <div className='overflow-x-auto hide-scrollbar'>
        <table className='w-full text-left border-separate border-spacing-y-2'>
          <thead>
            <tr className='text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]'>
              <th className='pb-2 pl-2'>Propriedade</th>
              <th className='pb-2 text-right'>Receita Mensal</th>
              <th className='pb-2 text-right px-4'>
                <InfoTooltip 
                  title="Yield (a.m)" 
                  description="Eficiência do capital. Valor do aluguel / Valor de mercado."
                >
                  <span className='cursor-help border-b border-dotted border-slate-300 pb-0.5'>Yield (a.m)</span>
                </InfoTooltip>
              </th>
              <th className='pb-2 text-center'>Status</th>
            </tr>
          </thead>
          <tbody className='text-sm'>
            {topProperties && topProperties.length > 0 ? topProperties.map((prop: any) => {
              const yieldVal = parseFloat(prop.yield) || 0;
              const revenueVal = parseFloat(prop.revenue) || 0;

              return (
                <tr
                  key={prop.id}
                  onClick={() => navigate(`/properties?id=${prop.id}`)}
                  className='group hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all duration-300 cursor-pointer active:scale-[0.99]'
                >
                  <td className='py-3 pl-2 rounded-l-2xl'>
                    <div className='flex items-center gap-3'>
                      {prop.image ? (
                        <div
                          className='w-10 h-10 rounded-xl bg-cover bg-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500'
                          style={{ backgroundImage: `url(${prop.image})` }}
                        />
                      ) : (
                        <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0'>
                          <Home size={18} />
                        </div>
                      )}
                      <span className='font-black text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-primary transition-colors'>
                        {prop.name}
                      </span>
                    </div>
                  </td>
                  <td className='py-3 text-right font-bold text-slate-600 dark:text-slate-300'>
                    {formatCurrency(revenueVal)}
                  </td>
                  <td className='py-3 text-right px-4'>
                    <div className='flex items-center justify-end gap-1'>
                      <span className={`font-black ${yieldVal > 0.5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {yieldVal > 0 ? `${yieldVal}%` : '0%'}
                      </span>
                      {yieldVal > 0.6 ? (
                        <TrendingUp size={12} className="text-emerald-500/50" />
                      ) : (
                        <TrendingDown size={12} className="text-amber-500/50" />
                      )}
                    </div>
                  </td>
                  <td className='py-3 text-center rounded-r-2xl pr-2'>
                    <div className='relative group/status inline-block'>
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto relative ${
                        prop.status === 'occupied'
                          ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : prop.status === 'warning'
                            ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse'
                            : prop.status === 'vacant'
                              ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
                              : 'bg-slate-400'
                      }`}>
                        {(prop.status === 'warning' || prop.status === 'vacant') && (
                          <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                            prop.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                        )}
                      </div>
                      
                      {/* Glassmorphism Status Tooltip */}
                      <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-950/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/status:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 border border-white/10 shadow-2xl translate-y-1 group-hover/status:translate-y-0'>
                        {prop.status === 'occupied' ? '✅ Estável' : 
                         prop.status === 'warning' ? '⚠️ Atenção' : 
                         prop.status === 'vacant' ? '❌ Vago' : 'Sem Status'}
                        <div className='absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-950/90'></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-50">
                    Sem dados de performance disponíveis
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className='mt-4 pt-4 border-t border-gray-50 dark:border-white/5 flex justify-end'>
        <div className='flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest group cursor-pointer' onClick={() => navigate('/financials')}>
          Análise Completa <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
