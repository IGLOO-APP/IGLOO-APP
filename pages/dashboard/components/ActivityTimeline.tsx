import React from 'react';
import { DollarSign, MapPin, Wrench, FileText, Calendar } from 'lucide-react';
import { SectionHeader, EmptyState } from '../../../components/ui/DashboardComponents';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { executeWorkflowAction } from '../../../services/workflow/workflowActions';

interface ActivityTimelineProps {
  activities: any[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const handleAction = async (e: React.MouseEvent, endpoint: string) => {
    e.stopPropagation();
    try {
      await executeWorkflowAction(endpoint);
      // In a real app, you'd trigger a parent re-fetch here
      window.location.reload();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  return (
    <Card className='flex flex-col'>
      <CardHeader className='pb-0'>
        <SectionHeader
          title='Próximos Dias'
          subtitle='Agenda de Ativos'
          icon={Calendar}
          iconColor='text-slate-400'
        />
      </CardHeader>
      <CardContent className='pt-5 flex flex-col flex-grow'>
        <div className='flex-grow space-y-0 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-white/5'>
          {activities && activities.length > 0 ? (
            activities.map((act: any, index: number) => {
              const today = new Date();
              const tomorrow = new Date();
              tomorrow.setDate(today.getDate() + 1);

              const todayStr = today.toLocaleDateString('pt-BR');
              const tomorrowStr = tomorrow.toLocaleDateString('pt-BR');

              const isToday = act.date === todayStr;
              const isTomorrow = act.date === tomorrowStr;

              return (
                <div key={act.id || index} className='flex gap-4 relative group'>
                  <div className='flex flex-col items-center shrink-0'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all duration-300 ${
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
                        <DollarSign size={14} strokeWidth={3} />
                      ) : act.type === 'visit' ? (
                        <MapPin size={14} strokeWidth={3} />
                      ) : act.type === 'maintenance' ? (
                        <Wrench size={14} strokeWidth={3} />
                      ) : (
                        <FileText size={14} strokeWidth={3} />
                      )}
                    </div>
                  </div>

                  <div className='pb-6 flex-1 transition-all flex items-start justify-between gap-4'>
                    <div>
                      <p className='text-xs font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight uppercase'>
                        {act.title}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <span
                          className={`text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-md ${
                            isToday
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : isTomorrow
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                          }`}
                        >
                          {isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : act.date}
                        </span>
                        <span className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
                          {act.time}
                        </span>
                      </div>
                    </div>

                    {act.acao_pendente && (
                      <Button
                        onClick={(e) => handleAction(e, act.acao_pendente.endpoint)}
                        variant='outline'
                        size='sm'
                        className='shrink-0 text-[9px] font-black uppercase tracking-widest'
                      >
                        Ação
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState icon={Calendar} message='Nenhum compromisso agendado' />
          )}
        </div>

        <div className='mt-3'>
          <Button
            variant='secondary'
            size='sm'
            className='w-full text-[9px] font-black uppercase tracking-widest'
          >
            Ver Agenda Completa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
