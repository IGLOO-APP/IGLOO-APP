import React from 'react';
import { Clock, Wrench, CheckCircle, AlertCircle, FileText, DollarSign, Calendar } from 'lucide-react';
import { ChatThread } from '../../../services/messageService';

interface TicketViewProps {
  activeChat: ChatThread;
  isStatusLocked: boolean;
  onStatusChange: (status: 'pending' | 'in_progress' | 'completed') => void;
  onCloseSupportTicket: () => Promise<void>;
  formatCurrency: (value?: number) => string;
}

export const TicketView: React.FC<TicketViewProps> = ({
  activeChat,
  isStatusLocked,
  onStatusChange,
  onCloseSupportTicket,
  formatCurrency,
}) => {
  return (
    <>
      {(activeChat.category === 'maintenance' || activeChat.category === 'support') && activeChat.ticket ? (
        <div className='space-y-4'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-muted-foreground'>Status Atual</span>
              <div className='flex items-center gap-1.5'>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  activeChat.ticket.status === 'completed' ? 'bg-emerald-500' : 
                  activeChat.ticket.status === 'in_progress' ? 'bg-blue-500' : 'bg-orange-500'
                }`} />
                <span className={`text-xs font-medium ${
                  activeChat.ticket.status === 'completed' ? 'text-emerald-500' : 
                  activeChat.ticket.status === 'in_progress' ? 'text-blue-500' : 'text-orange-500'
                }`}>
                  {activeChat.ticket.status === 'completed' ? 'Resolvido' : activeChat.ticket.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                </span>
              </div>
            </div>
            <div className='grid grid-cols-3 gap-1'>
              {(['pending', 'in_progress', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  disabled={isStatusLocked || activeChat.category === 'support'}
                  onClick={() => onStatusChange(status)}
                  className={`h-1 rounded-full transition-all ${
                    (activeChat.ticket!.status === status || 
                    (status === 'in_progress' && activeChat.ticket!.status === 'completed') ||
                    (status === 'pending' && ['pending', 'in_progress', 'completed'].includes(activeChat.ticket!.status)))
                      ? (status === 'completed' ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-blue-500' : 'bg-orange-500')
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className='p-4 lg-card rounded-2xl'>
            <h4 className='text-sm font-semibold text-foreground mb-1.5'>{activeChat.ticket.title}</h4>
            <p className='text-xs text-muted-foreground leading-relaxed mb-3'>{activeChat.ticket.description || 'Chamado de suporte registrado no sistema.'}</p>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1 px-1.5 py-1 bg-background rounded-lg border border-border'>
                <AlertCircle size={9} className='text-orange-500' />
                <span className='text-[10px] font-medium text-muted-foreground'>{activeChat.ticket.priority}</span>
              </div>
            </div>
          </div>

          {activeChat.ticket.status !== 'completed' && (
            <button
              disabled={isStatusLocked}
              onClick={() => {
                if (window.confirm('Deseja fechar este chamado?')) {
                  if (activeChat.category === 'support') onCloseSupportTicket();
                  else onStatusChange('completed');
                }
              }}
              className='w-full h-10 bg-foreground text-background rounded-xl text-xs font-semibold hover:scale-[1.02] active:scale-95 shadow-sm flex items-center justify-center gap-1.5'
            >
              <CheckCircle size={12} /> Finalizar Chamado
            </button>
          )}
        </div>
      ) : activeChat.category === 'finance' ? (
        <div className='space-y-4'>
          <div className='p-4 lg-card rounded-2xl border border-emerald-500/20'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-xs font-medium text-emerald-600'>Aluguel Mensal</span>
              <DollarSign size={14} className='text-emerald-500' />
            </div>
            <p className='text-xl font-semibold text-foreground'>{formatCurrency(activeChat.propertyValue)}</p>
            <div className='flex items-center gap-2 mt-3 text-xs text-muted-foreground'>
              <Calendar size={10} />
              <span>Vencimento dia {activeChat.paymentDay || '10'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-8 text-center opacity-40'>
          <FileText size={36} strokeWidth={1} />
          <p className='mt-3 text-xs font-medium text-muted-foreground'>Sem chamados vinculados</p>
        </div>
      )}
    </>
  );
};
