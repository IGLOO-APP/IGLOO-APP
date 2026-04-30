import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface RiskItem {
  id?: string;
  type: 'critical' | 'warning' | 'success';
  message: string;
  link: string;
}

interface RiskRadarProps {
  risks: RiskItem[];
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ risks }) => {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle size={18} className='text-red-500' />;
      case 'warning': return <AlertTriangle size={18} className='text-amber-500' />;
      case 'success': return <CheckCircle2 size={18} className='text-emerald-500' />;
      default: return null;
    }
  };

  return (
    <div className='bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider'>
          Radar de Riscos
        </h3>
        <span className='px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest'>
          {risks.length} alertas
        </span>
      </div>

      <div className='space-y-3'>
        {risks.length > 0 ? (
          risks.map((risk, idx) => (
            <button
              key={idx}
              onClick={() => navigate(risk.link, { state: { highlightId: risk.id } })}
              className='w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-white/5 transition-all text-left group'
            >
              <div className='shrink-0'>{getIcon(risk.type)}</div>
              <p className='flex-1 text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight group-hover:text-primary transition-colors'>
                {risk.message}
              </p>
              <ChevronRight size={14} className='text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-0.5' />
            </button>
          ))
        ) : (
          <div className='py-6 text-center'>
            <CheckCircle2 size={32} className='mx-auto mb-2 text-emerald-500 opacity-30' />
            <p className='text-xs font-bold text-emerald-500'>Carteira saudável — nenhum alerta no momento</p>
          </div>
        )}
      </div>

      {risks.length > 0 && (
        <button 
          onClick={() => navigate('/contracts')} 
          className='w-full mt-4 py-2 text-center text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest border-t border-gray-50 dark:border-white/5 transition-colors pt-4'
        >
          Ver todos os alertas
        </button>
      )}
    </div>
  );
};
