import React from 'react';
import { Megaphone, Zap, Calendar, CalendarDays, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OwnerAnnouncement } from '../../../types';

interface GovernanceListProps {
  announcements: OwnerAnnouncement[];
  meta: Record<string, any>; // Pode tipar melhor se necessário
  targetMeta: Record<string, any>;
  handleAction: (e: React.MouseEvent, endpoint: string) => Promise<void>;
  isOwner: boolean;
  startCreate: () => void;
}

export const GovernanceList: React.FC<GovernanceListProps> = ({
  announcements,
  meta,
  targetMeta,
  handleAction,
}) => {
  if (announcements.length === 0) return null;

  return (
    <div className='space-y-3'>
      {announcements.map((ann) => {
        const annMeta = meta[ann.type] ?? meta.info;
        const annTargetMeta = targetMeta[ann.target_type] ?? targetMeta.all;
        
        return (
          <div key={ann.id} className='lg-card w-full cursor-default'>
            <div className='flex gap-3 p-4'>
              <div
                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border bg-muted border-border ${annMeta.color}`}
              >
                {annMeta.icon}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2'>
                  <h3 className='text-sm font-semibold text-foreground leading-tight'>
                    {ann.is_urgent && (
                      <span className='inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5 align-middle' />
                    )}
                    {ann.title}
                  </h3>
                  {ann.is_urgent && (
                    <Badge variant='destructive' className='shrink-0'>
                      <Zap size={10} /> Urgente
                    </Badge>
                  )}
                </div>
                <p className='mt-1.5 text-sm text-muted-foreground line-clamp-2 group-hover/row:line-clamp-none transition-all'>
                  {ann.content}
                </p>
                {(ann as any).acao_pendente && (
                  <Button
                    onClick={(e) => handleAction(e, (ann as any).acao_pendente.endpoint)}
                    variant='outline'
                    size='sm'
                    className='mt-2 w-full text-xs font-semibold rounded-lg'
                  >
                    {(ann as any).acao_pendente.label}
                  </Button>
                )}
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 pt-2 border-t border-border/50'>
                  <div className='flex items-center gap-1 text-[11px] text-muted-foreground'>
                    <Calendar size={11} />
                    {new Date(ann.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {ann.expires_at && (
                    <div className='flex items-center gap-1 text-[11px] text-muted-foreground'>
                      <CalendarDays size={11} /> Expira{' '}
                      {new Date(ann.expires_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                  <Badge variant='outline' className={`text-[10px] ${annMeta.color}`}>
                    {annMeta.icon} {annMeta.label}
                  </Badge>
                  <span className='inline-flex items-center gap-1 text-[11px] text-muted-foreground'>
                    {annTargetMeta.icon} {annTargetMeta.label}
                  </span>
                  {ann.views_count != null && (
                    <span className='inline-flex items-center gap-1 text-[11px] text-muted-foreground'>
                      <Eye size={12} /> {ann.views_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
