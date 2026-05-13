import React from 'react';
import { X, Edit, Save, Clock, Wrench, CheckCircle, Calendar, User, FileText } from 'lucide-react';
import { ChatThread } from '../../services/messageService';

interface ContextPanelProps {
  activeChat: ChatThread;
  activeRightTab: 'ticket' | 'tenant';
  setActiveRightTab: (tab: 'ticket' | 'tenant') => void;
  setShowDetailsPanel: (show: boolean) => void;
  isStatusLocked: boolean;
  setIsStatusLocked: (locked: boolean) => void;
  onStatusChange: (status: 'pending' | 'in_progress' | 'completed') => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  activeChat,
  activeRightTab,
  setActiveRightTab,
  setShowDetailsPanel,
  isStatusLocked,
  setIsStatusLocked,
  onStatusChange,
}) => {
  return (
    <div 
      className={`fixed lg:relative inset-y-0 right-0 w-[85%] sm:w-80 md:w-96 lg:w-80 bg-white dark:bg-background-dark border-l border-gray-100 dark:border-white/5 flex flex-col h-full z-[60] lg:z-10 transition-transform duration-300 shadow-2xl lg:shadow-none min-h-0`}
    >
      {/* Drawer Header - Visible only on mobile/tablet */}
      <div className='lg:hidden h-20 px-6 flex items-center justify-between border-b border-gray-100 dark:border-white/5 shrink-0'>
        <div className='flex flex-col'>
          <h3 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight'>Detalhes</h3>
          <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Informações do Chat</p>
        </div>
        <button 
          onClick={() => setShowDetailsPanel(false)}
          className='p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500'
        >
          <X size={20} />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-6 space-y-8'>
        {/* Ticket Status Bar - Integrated if active */}
        {activeChat.ticket && (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Status do Chamado</span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                activeChat.ticket.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                activeChat.ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' : 
                'bg-orange-500/10 text-orange-500'
              }`}>
                {activeChat.ticket.status === 'completed' ? 'Resolvido' : 
                 activeChat.ticket.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
              </span>
            </div>
            <div className='grid grid-cols-3 gap-1.5'>
              {['pending', 'in_progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status as any)}
                  className={`h-1 rounded-full transition-all ${
                    activeChat.ticket!.status === status || 
                    (status === 'pending' && activeChat.ticket!.status === 'pending') ||
                    (status === 'in_progress' && (activeChat.ticket!.status === 'in_progress' || activeChat.ticket!.status === 'completed')) ||
                    (status === 'completed' && activeChat.ticket!.status === 'completed')
                      ? status === 'completed' ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-blue-500' : 'bg-orange-500'
                      : 'bg-slate-100 dark:bg-white/5'
                  }`}
                />
              ))}
            </div>

            {activeChat.ticket.status !== 'completed' && (
              <div className='mt-3'>
                <button 
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja encerrar este chamado?')) {
                      onStatusChange('completed');
                    }
                  }}
                  className='w-full h-10 border-2 border-slate-900 dark:border-white hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95'
                >
                  <CheckCircle size={14} strokeWidth={3} />
                  Encerrar Chamado
                </button>
              </div>
            )}
          </div>
        )}

        {/* Linha do Tempo - Robust Style */}
        <div className='space-y-6 pt-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Linha do Tempo</span>
            <div className='flex items-center gap-1'>
               <div className='w-1 h-1 rounded-full bg-emerald-500 animate-pulse' />
               <span className='text-[8px] font-black text-emerald-500 uppercase'>Real-time</span>
            </div>
          </div>

          {/* Timeline Structure */}
          <div className='space-y-8'>
            {/* May 2024 */}
            <div>
              <div className='flex items-center gap-3 mb-6'>
                <span className='h-px flex-1 bg-gray-100 dark:bg-white/5'></span>
                <span className='text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]'>Maio de 2024</span>
                <span className='h-px flex-1 bg-gray-100 dark:bg-white/5'></span>
              </div>

              <div className='relative space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5'>
                {/* Event 1 */}
                <div className='relative flex gap-4 items-start group'>
                   <div className='w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center z-10 shrink-0 border-4 border-white dark:border-[#0f172a] shadow-sm'>
                      <Wrench size={12} />
                   </div>
                   <div className='flex-1 bg-slate-50 dark:bg-surface-dark rounded-2xl p-3 border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all'>
                      <div className='flex justify-between items-start mb-1'>
                         <p className='text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight'>Manutenção Elétrica</p>
                         <span className='text-[8px] font-bold text-slate-400 uppercase'>12 Mai</span>
                      </div>
                      <p className='text-[10px] text-slate-500 font-medium'>Em atendimento</p>
                      <span className='mt-2 inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest'>ESTRUTURAL</span>
                   </div>
                </div>

                {/* Event 2 */}
                <div className='relative flex gap-4 items-start group'>
                   <div className='w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center z-10 shrink-0 border-4 border-white dark:border-[#0f172a] shadow-sm'>
                      <Wrench size={12} />
                   </div>
                   <div className='flex-1 bg-slate-50 dark:bg-surface-dark rounded-2xl p-3 border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all'>
                      <div className='flex justify-between items-start mb-1'>
                         <p className='text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight'>Reparo Hidráulico</p>
                         <span className='text-[8px] font-bold text-slate-400 uppercase'>10 Mai</span>
                      </div>
                      <p className='text-[10px] text-slate-500 font-medium'>Aguardando Peças</p>
                      <span className='mt-2 inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest'>HIDRÁULICO</span>
                   </div>
                </div>
              </div>
            </div>

            {/* April 2024 */}
            <div>
              <div className='flex items-center gap-3 mb-6'>
                <span className='h-px flex-1 bg-gray-100 dark:bg-white/5'></span>
                <span className='text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]'>Abril de 2024</span>
                <span className='h-px flex-1 bg-gray-100 dark:bg-white/5'></span>
              </div>

              <div className='relative space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5'>
                <div className='relative flex gap-4 items-start group'>
                   <div className='w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center z-10 shrink-0 border-4 border-white dark:border-[#0f172a] shadow-sm'>
                      <CheckCircle size={12} />
                   </div>
                   <div className='flex-1 bg-emerald-50/30 dark:bg-surface-dark rounded-2xl p-3 border border-emerald-100/50 dark:border-emerald-500/10 hover:border-emerald-500/30 transition-all'>
                      <div className='flex justify-between items-start mb-1'>
                         <p className='text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight'>Pagamento Recebido</p>
                         <span className='text-[8px] font-bold text-emerald-500/60 uppercase'>27 Abr</span>
                      </div>
                      <p className='text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-medium'>Ref. abr. de 2024 - R$ 2.500,00</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
