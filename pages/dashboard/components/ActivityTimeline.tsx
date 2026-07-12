import React from 'react';
import { DollarSign, MapPin, Wrench, FileText, Calendar } from 'lucide-react';
import { SectionHeader, EmptyState } from '../../../components/ui/DashboardComponents';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { executeWorkflowAction } from '../../../services/workflow/workflowActions';

interface ActivityTimelineProps {
  activities: any[];
  onActionComplete?: () => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, onActionComplete }) => {
  const handleAction = async (e: React.MouseEvent, endpoint: string) => {
    e.stopPropagation();
    try {
      await executeWorkflowAction(endpoint);
      onActionComplete?.();
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all duration-200 ${
                        act.type === 'payment'
                          ? 'bg-card border-emerald-500 text-emerald-500'
                          : act.type === 'visit'
                            ? 'bg-card border-blue-500 text-blue-500'
                            : act.type === 'maintenance'
                              ? 'bg-card border-amber-500 text-amber-500'
                              : 'bg-card border-border text-muted-foreground'
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
                      <p className='text-sm font-semibold text-foreground leading-tight'>
                        {act.title}
                      </p>
                      <div className='flex items-center gap-2 mt-1'>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                            isToday
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : isTomorrow
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : act.date}
                        </span>
                        <span className='text-[10px] font-medium text-muted-foreground'>
                          {act.time}
                        </span>
                      </div>
                    </div>

                    {act.acao_pendente && (
                      <Button
                        onClick={(e) => handleAction(e, act.acao_pendente.endpoint)}
                        variant='outline'
                        size='sm'
                        className='shrink-0 text-xs font-semibold'
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
            className='w-full text-xs font-semibold'
          >
            Ver Agenda Completa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
