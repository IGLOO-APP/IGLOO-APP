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
      className={`fixed lg:relative inset-y-0 right-0 w-80 md:w-96 lg:w-80 bg-white dark:bg-surface-dark border-l border-gray-200 dark:border-white/5 flex flex-col h-full z-40 lg:z-10 shadow-2xl lg:shadow-none transition-transform duration-300 animate-slideLeft`}
    >
      {/* Tabs for Right Panel */}
      <div className='flex border-b border-gray-200 dark:border-white/5 p-2 gap-2'>
        {activeChat.ticket && (
          <button
            onClick={() => setActiveRightTab('ticket')}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeRightTab === 'ticket' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
          >
            Chamado
          </button>
        )}
        <button
          onClick={() => setActiveRightTab('tenant')}
          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeRightTab === 'tenant' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
        >
          Inquilino
        </button>
        <button
          onClick={() => setShowDetailsPanel(false)}
          className='p-2 text-slate-400 hover:text-slate-600'
        >
          <X size={20} />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {activeRightTab === 'ticket' && activeChat.ticket ? (
          <div className='p-4 space-y-6'>
            <div>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1'>
                Título
              </span>
              <p className='font-bold text-slate-900 dark:text-white'>
                {activeChat.ticket.title}
              </p>
              <span className='text-xs text-slate-500'>{activeChat.ticket.id}</span>
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
                  Status Atual
                </span>
                <button
                  onClick={() => setIsStatusLocked(!isStatusLocked)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    !isStatusLocked 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {isStatusLocked ? <Edit size={12} /> : <Save size={12} />}
                  {isStatusLocked ? 'Alterar' : 'Pronto'}
                </button>
              </div>
              <div className={`flex flex-col gap-2 transition-all duration-300 ${isStatusLocked ? 'opacity-60 pointer-events-none grayscale-[0.5]' : 'opacity-100'}`}>
                <button
                  onClick={() => !isStatusLocked && onStatusChange('pending')}
                  disabled={isStatusLocked}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    activeChat.ticket.status === 'pending'
                      ? 'bg-orange-500 text-white border-transparent shadow-lg shadow-orange-500/20'
                      : 'bg-white dark:bg-black/20 text-slate-600 dark:text-slate-400 border-gray-100 dark:border-white/5 hover:bg-gray-50'
                  }`}
                >
                  <Clock size={14} /> Pendente
                </button>
                <button
                  onClick={() => !isStatusLocked && onStatusChange('in_progress')}
                  disabled={isStatusLocked}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    activeChat.ticket.status === 'in_progress'
                      ? 'bg-blue-500 text-white border-transparent shadow-lg shadow-blue-500/20'
                      : 'bg-white dark:bg-black/20 text-slate-600 dark:text-slate-400 border-gray-100 dark:border-white/5 hover:bg-gray-50'
                  }`}
                >
                  <Wrench size={14} /> Em Andamento
                </button>
                <button
                  onClick={() => !isStatusLocked && onStatusChange('completed')}
                  disabled={isStatusLocked}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    activeChat.ticket.status === 'completed'
                      ? 'bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/20'
                      : 'bg-white dark:bg-black/20 text-slate-600 dark:text-slate-400 border-gray-100 dark:border-white/5 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle size={14} /> Resolvido
                </button>
              </div>
            </div>

            <div>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1'>
                Descrição
              </span>
              <p className='text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-white/5'>
                {activeChat.ticket.description}
              </p>
            </div>

            {activeChat.ticket.images.length > 0 && (
              <div>
                <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2'>
                  Fotos Anexadas
                </span>
                <div className='grid grid-cols-2 gap-2'>
                  {activeChat.ticket.images.map((img, i) => (
                    <div
                      key={i}
                      className='aspect-square rounded-xl bg-cover bg-center border border-gray-100 dark:border-white/5 shadow-sm'
                      style={{ backgroundImage: `url(${img})` }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            <div className='pt-4 border-t border-gray-200 dark:border-white/5 space-y-3'>
              <button className='w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all'>
                <Calendar size={14} /> Agendar Visita Técnica
              </button>
            </div>
          </div>
        ) : (
          <div className='p-4 space-y-6'>
            {/* Mini Dashboard Inquilino */}
            <div className='flex flex-col items-center text-center pb-4 border-b border-gray-200 dark:border-white/5'>
              <div className='w-20 h-20 rounded-full bg-slate-200 dark:bg-white/10 mb-3 overflow-hidden border-2 border-primary/20'>
                {activeChat.tenantAvatar ? (
                  <img src={activeChat.tenantAvatar} alt='' className='w-full h-full object-cover' />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-slate-400'>
                    <User size={40} />
                  </div>
                )}
              </div>
              <h3 className='font-bold text-slate-900 dark:text-white'>{activeChat.tenantName}</h3>
              <p className='text-xs text-slate-500'>{activeChat.property}</p>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1'>Aluguel</span>
                <p className='text-xs font-bold text-emerald-500'>Em dia</p>
              </div>
              <div className='p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1'>Contrato</span>
                <p className='text-xs font-bold text-slate-700 dark:text-slate-300'>12/24 meses</p>
              </div>
            </div>

            <div className='space-y-3'>
              <button className='w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-black/10'>
                <FileText size={14} /> Ver Contrato
              </button>
              <button className='w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all'>
                Histórico de Pagamentos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
