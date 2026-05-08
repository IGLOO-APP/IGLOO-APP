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
      className={`fixed xl:relative inset-y-0 right-0 w-80 md:w-96 xl:w-80 bg-white dark:bg-surface-dark border-l border-gray-200 dark:border-white/5 flex flex-col h-full z-40 xl:z-10 shadow-2xl xl:shadow-none transition-transform duration-300 animate-slideLeft`}
    >
      {/* Tabs for Right Panel */}
      {/* Segmented Control Tabs */}
      <div className='p-3 border-b border-gray-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/10'>
        <div className='flex items-center gap-3'>
          <div className='flex-1 flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-xl relative'>
            {activeChat.ticket && (
              <button
                onClick={() => setActiveRightTab('ticket')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeRightTab === 'ticket' ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-500'}`}
              >
                Chamado
              </button>
            )}
            <button
              onClick={() => setActiveRightTab('tenant')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeRightTab === 'tenant' ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-500'}`}
            >
              Inquilino
            </button>
            
            {/* Sliding Background Indicator */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(${activeChat.ticket ? '50%-4px' : '100%-8px'})] bg-white dark:bg-surface-dark rounded-lg shadow-sm transition-all duration-300 ${
                activeRightTab === 'ticket' ? 'left-1' : activeChat.ticket ? 'left-[calc(50%+2px)]' : 'left-1'
              }`}
            />
          </div>

          <button
            onClick={() => setShowDetailsPanel(false)}
            className='p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all'
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {activeRightTab === 'ticket' && activeChat.ticket ? (
          <div className='p-4 space-y-6'>
            <div>
              <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1'>
                Título do Registro
              </span>
              <p className='text-base font-black text-slate-900 dark:text-white tracking-tight'>
                {activeChat.ticket.title}
              </p>
              <span className='text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10'>
                Ref: {activeChat.ticket.id}
              </span>
            </div>

            <div className='bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5'>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest block'>
                  Status do Chamado
                </span>
                <button
                  onClick={() => setIsStatusLocked(!isStatusLocked)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    !isStatusLocked 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white dark:bg-surface-dark text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ring-1 ring-black/5 dark:ring-white/5'
                  }`}
                >
                  {isStatusLocked ? <Edit size={10} /> : <Save size={10} />}
                  {isStatusLocked ? 'Alterar' : 'Pronto'}
                </button>
              </div>
              <div className={`flex flex-col gap-2 transition-all duration-300 ${isStatusLocked ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                <button
                  onClick={() => !isStatusLocked && onStatusChange('pending')}
                  disabled={isStatusLocked}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    activeChat.ticket.status === 'pending'
                      ? 'bg-orange-500 text-white border-transparent shadow-lg shadow-orange-500/20'
                      : 'bg-white dark:bg-surface-dark text-slate-400 border-gray-100 dark:border-white/5 hover:bg-gray-50'
                  }`}
                >
                  <Clock size={12} /> Pendente
                </button>
                <button
                  onClick={() => !isStatusLocked && onStatusChange('in_progress')}
                  disabled={isStatusLocked}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    activeChat.ticket.status === 'in_progress'
                      ? 'bg-blue-500 text-white border-transparent shadow-lg shadow-blue-500/20'
                      : 'bg-white dark:bg-surface-dark text-slate-400 border-gray-100 dark:border-white/5 hover:bg-gray-50'
                  }`}
                >
                  <Wrench size={12} /> Em Andamento
                </button>
                <button
                  onClick={() => !isStatusLocked && onStatusChange('completed')}
                  disabled={isStatusLocked}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    activeChat.ticket.status === 'completed'
                      ? 'bg-emerald-500 text-white border-transparent shadow-lg shadow-emerald-500/20'
                      : 'bg-white dark:bg-surface-dark text-slate-400 border-gray-100 dark:border-white/5 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle size={12} /> Resolvido
                </button>
              </div>
            </div>

            <div>
              <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2'>
                Descrição Detalhada
              </span>
              <p className='text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5'>
                {activeChat.ticket.description}
              </p>
            </div>

            {activeChat.ticket.images.length > 0 && (
              <div>
                <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2'>
                  Evidências Fotográficas
                </span>
                <div className='grid grid-cols-2 gap-3'>
                  {activeChat.ticket.images.map((img, i) => (
                    <div
                      key={i}
                      className='aspect-video rounded-xl bg-cover bg-center border border-gray-100 dark:border-white/5 shadow-sm hover:scale-[1.05] transition-transform cursor-pointer'
                      style={{ backgroundImage: `url(${img})` }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className='p-4 space-y-6'>
            {/* Perfil do Inquilino Header */}
            <div className='flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-white/5'>
              <div className='w-16 h-16 rounded-[24px] bg-slate-200 dark:bg-white/10 overflow-hidden border-2 border-primary/20 shrink-0 shadow-lg'>
                {activeChat.tenantAvatar ? (
                  <img src={activeChat.tenantAvatar} alt='' className='w-full h-full object-cover' />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-slate-400'>
                    <User size={28} />
                  </div>
                )}
              </div>
              <div className='min-w-0'>
                <h3 className='text-lg font-black text-slate-900 dark:text-white truncate tracking-tight'>{activeChat.tenantName}</h3>
                <div className='flex items-center gap-2 mt-1'>
                  <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]'></div>
                  <span className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>Online Agora</span>
                </div>
              </div>
            </div>

            {/* Card do Imóvel */}
            <div className='space-y-3'>
              <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest block'>Vínculo Contratual</span>
              <div className='relative rounded-[24px] overflow-hidden bg-slate-900 aspect-video group cursor-pointer border border-white/5'>
                {activeChat.propertyImage ? (
                  <img src={activeChat.propertyImage} alt='' className='w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity' />
                ) : (
                  <div className='w-full h-full bg-slate-800 flex items-center justify-center'>
                    <Calendar className='text-slate-700' size={32} />
                  </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-5 flex flex-col justify-end'>
                  <p className='text-sm font-black text-white truncate tracking-tight'>{activeChat.property}</p>
                  <p className='text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1'>{activeChat.propertyUnit || 'Apto 402'}</p>
                </div>
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10'>
                <span className='text-[9px] font-black text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest block mb-1'>Mensalidade</span>
                <p className='text-base font-black text-emerald-700 dark:text-emerald-300'>
                  R$ {activeChat.propertyValue?.toLocaleString('pt-BR') || '--'}
                </p>
              </div>
              <div className='p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5'>
                <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1'>Vencimento</span>
                <p className='text-base font-black text-slate-700 dark:text-slate-300'>Dia 10</p>
              </div>
            </div>

            {/* Contatos Interativos */}
            <div className='space-y-3'>
              <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1'>Canais de Comunicação</span>
              <a 
                href={`mailto:${activeChat.tenantEmail}`}
                className='flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-primary/30 transition-all group'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-xl bg-white dark:bg-surface-dark flex items-center justify-center text-slate-400 shadow-sm group-hover:text-primary transition-colors'>
                    <FileText size={18} />
                  </div>
                  <div className='min-w-0'>
                    <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest block'>E-mail Oficial</span>
                    <p className='text-xs font-bold text-slate-700 dark:text-slate-300 truncate'>{activeChat.tenantEmail || 'Não informado'}</p>
                  </div>
                </div>
              </a>

              <a 
                href={`tel:${activeChat.tenantPhone}`}
                className='flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-emerald-500/30 transition-all group'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-xl bg-white dark:bg-surface-dark flex items-center justify-center text-slate-400 shadow-sm group-hover:text-emerald-500 transition-colors'>
                    <Edit size={18} />
                  </div>
                  <div className='min-w-0'>
                    <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest block'>Telefone Celular</span>
                    <p className='text-xs font-bold text-slate-700 dark:text-slate-300'>{activeChat.tenantPhone || 'Não informado'}</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Ações Estratégicas */}
            <div className='pt-6 border-t border-gray-200 dark:border-white/5 space-y-4'>
              <button className='w-full py-4 rounded-[20px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10'>
                <FileText size={16} /> Gerenciar Contrato
              </button>
              <div className='grid grid-cols-2 gap-3'>
                <button className='py-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-transparent active:scale-95'>
                  Histórico
                </button>
                <button className='py-3.5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95'>
                  Nova Manutenção
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
