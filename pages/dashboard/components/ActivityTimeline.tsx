import React from 'react';
import { Calendar, DollarSign, MapPin, Wrench, FileText } from 'lucide-react';

interface ActivityTimelineProps {
  activities: any[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  return (
    <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-bold text-slate-900 dark:text-white'>Próximos Dias</h3>
        <Calendar size={18} className='text-slate-400' />
      </div>
      <div className='space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5'>
        {activities.length > 0 ? activities.map((act: any) => {
          const isToday = act.date === new Date().toLocaleDateString('pt-BR');
          
          return (
            <div key={act.id} className='flex gap-4 relative group'>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-surface-dark shadow-sm transition-transform group-hover:scale-110 ${
                  act.type === 'payment'
                    ? 'bg-emerald-100 text-emerald-600'
                    : act.type === 'visit'
                      ? 'bg-blue-100 text-blue-600'
                      : act.type === 'maintenance'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-slate-100 text-slate-600'
                }`}
              >
                {act.type === 'payment' ? (
                  <DollarSign size={16} />
                ) : act.type === 'visit' ? (
                  <MapPin size={16} />
                ) : act.type === 'maintenance' ? (
                  <Wrench size={16} />
                ) : (
                  <FileText size={16} />
                )}
              </div>
              <div className='pb-6 flex-1'>
                <p className='text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors'>
                  {act.title}
                </p>
                <div className='flex items-center gap-2 mt-1'>
                  <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>
                    {isToday ? 'Hoje' : act.date} • {act.time}
                  </p>
                  {isToday && (
                    <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse' />
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className='py-8 text-center'>
            <p className='text-sm text-slate-400 font-medium'>Nenhuma atividade nos próximos dias</p>
          </div>
        )}
      </div>
    </div>
  );
};
