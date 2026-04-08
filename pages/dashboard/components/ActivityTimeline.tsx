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
        {activities.map((act: any) => (
          <div key={act.id} className='flex gap-3 relative'>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-surface-dark shadow-sm ${
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
            <div className='pb-1'>
              <p className='text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight'>
                {act.title}
              </p>
              <div className='flex items-center gap-1.5 mt-0.5'>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  {act.date} • {act.time}
                </p>
                {act.date === 'Hoje' && (
                  <span className='px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-200 dark:border-amber-500/20'>
                    Hoje
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
