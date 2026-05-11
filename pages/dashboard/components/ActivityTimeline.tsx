import React from 'react';
import { Calendar, DollarSign, MapPin, Wrench, FileText, ChevronRight } from 'lucide-react';

interface ActivityTimelineProps {
  activities: any[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  return (
    <div className='w-full h-full bg-white dark:bg-surface-dark p-6 md:p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col'>
      <div className='flex justify-between items-center mb-8'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400'>
            <Calendar size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight'>
              Próximos Dias
            </h3>
            <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Agenda de Ativos</p>
          </div>
        </div>
      </div>

      <div className='flex-grow space-y-0 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-white/5'>
        {activities && activities.length > 0 ? activities.map((act: any, index: number) => {
          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);

          const todayStr = today.toLocaleDateString('pt-BR');
          const tomorrowStr = tomorrow.toLocaleDateString('pt-BR');

          const isToday = act.date === todayStr;
          const isTomorrow = act.date === tomorrowStr;

          return (
            <div key={act.id || index} className='flex gap-5 relative group cursor-pointer'>
              <div className='flex flex-col items-center shrink-0'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all duration-300 ${
                    act.type === 'payment'
                      ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500'
                      : act.type === 'visit'
                        ? 'bg-white dark:bg-slate-900 border-blue-500 text-blue-500'
                        : act.type === 'maintenance'
                          ? 'bg-white dark:bg-slate-900 border-amber-500 text-amber-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400'
                  }`}
                >
                  {act.type === 'payment' ? (
                    <DollarSign size={16} strokeWidth={3} />
                  ) : act.type === 'visit' ? (
                    <MapPin size={16} strokeWidth={3} />
                  ) : act.type === 'maintenance' ? (
                    <Wrench size={16} strokeWidth={3} />
                  ) : (
                    <FileText size={16} strokeWidth={3} />
                  )}
                </div>
              </div>

              <div className='pb-10 flex-1 transition-all'>
                <div className='flex items-center justify-between gap-2 mb-1.5'>
                  <p className='text-sm font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight uppercase'>
                    {act.title}
                  </p>
                  <ChevronRight size={14} className='text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all' />
                </div>

                <div className='flex items-center gap-3'>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${
                    isToday
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : isTomorrow
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                  }`}>
                    {isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : act.date}
                  </span>
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                    {act.time}
                  </span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className='py-16 text-center'>
            <div className='w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-200 mx-auto mb-4'>
              <Calendar size={24} strokeWidth={1} />
            </div>
            <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
              Nenhum compromisso agendado
            </p>
          </div>
        )}
      </div>

      <div className='mt-4'>
        <button className='w-full py-3 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest border border-slate-100 dark:border-white/5 hover:bg-slate-100 transition-all active:scale-95'>
          Ver Agenda Completa
        </button>
      </div>
    </div>
  );
};
