import React from 'react';
import { 
  X, 
  Clock, 
  Wrench, 
  CheckCircle, 
  User, 
  Phone, 
  Mail, 
  Home, 
  Calendar,
  AlertCircle,
  FileText,
  MapPin,
  ExternalLink,
  DollarSign
} from 'lucide-react';
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
  // Helper to format currency
  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div 
      className={`fixed lg:relative inset-y-0 right-0 w-[85%] sm:w-80 md:w-96 lg:w-80 bg-white dark:bg-background-dark border-l border-gray-100 dark:border-white/5 flex flex-col h-full z-[60] lg:z-10 transition-transform duration-300 shadow-2xl lg:shadow-none min-h-0`}
    >
      {/* Drawer Header - Premium Glassmorphism */}
      <div className='h-20 px-6 flex items-center justify-between border-b border-gray-100 dark:border-white/5 shrink-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl sticky top-0 z-10'>
        <div className='flex flex-col'>
          <h3 className='text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]'>Detalhamento</h3>
          <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5'>Contexto da Conversa</p>
        </div>
        <button 
          onClick={() => setShowDetailsPanel(false)}
          className='p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95'
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Tabs Navigation - Minimal & Elegant */}
      <div className='flex border-b border-gray-100 dark:border-white/5 shrink-0'>
        <button
          onClick={() => setActiveRightTab('ticket')}
          className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all relative ${
            activeRightTab === 'ticket' 
              ? 'text-primary' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          {activeChat.category === 'maintenance' ? 'Chamado' : activeChat.category === 'finance' ? 'Finanças' : 'Geral'}
          {activeRightTab === 'ticket' && (
            <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />
          )}
        </button>
        <button
          onClick={() => setActiveRightTab('tenant')}
          className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all relative ${
            activeRightTab === 'tenant' 
              ? 'text-primary' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Inquilino
          {activeRightTab === 'tenant' && (
            <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />
          )}
        </button>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-24 md:pb-8'>
        {activeRightTab === 'ticket' ? (
          <>
            {/* Ticket Section */}
            {activeChat.category === 'maintenance' && activeChat.ticket ? (
              <div className='space-y-6 animate-fadeIn'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Status Atual</span>
                    <div className='flex items-center gap-1.5'>
                       <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                         activeChat.ticket.status === 'completed' ? 'bg-emerald-500' : 
                         activeChat.ticket.status === 'in_progress' ? 'bg-blue-500' : 'bg-orange-500'
                       }`} />
                       <span className={`text-[9px] font-black uppercase tracking-widest ${
                         activeChat.ticket.status === 'completed' ? 'text-emerald-500' : 
                         activeChat.ticket.status === 'in_progress' ? 'text-blue-500' : 'text-orange-500'
                       }`}>
                         {activeChat.ticket.status === 'completed' ? 'Resolvido' : 
                          activeChat.ticket.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                       </span>
                    </div>
                  </div>
                  <div className='grid grid-cols-3 gap-1.5'>
                    {['pending', 'in_progress', 'completed'].map((status) => (
                      <button
                        key={status}
                        disabled={isStatusLocked}
                        onClick={() => onStatusChange(status as any)}
                        className={`h-1.5 rounded-full transition-all ${
                          activeChat.ticket!.status === status || 
                          (status === 'pending' && activeChat.ticket!.status === 'pending') ||
                          (status === 'in_progress' && (activeChat.ticket!.status === 'in_progress' || activeChat.ticket!.status === 'completed')) ||
                          (status === 'completed' && activeChat.ticket!.status === 'completed')
                            ? status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : status === 'in_progress' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                            : 'bg-slate-100 dark:bg-white/5'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className='p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5'>
                  <h4 className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2'>{activeChat.ticket.title}</h4>
                  <p className='text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4'>
                    {activeChat.ticket.description || 'Sem descrição detalhada fornecida.'}
                  </p>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-1 px-2 py-1 bg-white dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5'>
                      <AlertCircle size={10} className='text-orange-500' />
                      <span className='text-[8px] font-black text-slate-500 uppercase'>{activeChat.ticket.priority}</span>
                    </div>
                    <div className='flex items-center gap-1 px-2 py-1 bg-white dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5'>
                      <Clock size={10} className='text-slate-400' />
                      <span className='text-[8px] font-black text-slate-500 uppercase'>Aberto 2d</span>
                    </div>
                  </div>
                </div>

                {activeChat.ticket.status !== 'completed' && (
                  <button 
                    disabled={isStatusLocked}
                    onClick={() => {
                      if (window.confirm('Deseja marcar este chamado como resolvido?')) {
                        onStatusChange('completed');
                      }
                    }}
                    className='w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-2'
                  >
                    <CheckCircle size={14} strokeWidth={3} />
                    Finalizar Chamado
                  </button>
                )}
              </div>
            ) : activeChat.category === 'finance' ? (
              <div className='space-y-6 animate-fadeIn'>
                <div className='p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10'>
                  <div className='flex items-center justify-between mb-4'>
                    <span className='text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest'>Aluguel Mensal</span>
                    <DollarSign size={16} className='text-emerald-500' />
                  </div>
                  <p className='text-2xl font-black text-slate-900 dark:text-white tracking-tighter'>
                    {formatCurrency(activeChat.propertyValue)}
                  </p>
                  <div className='flex items-center gap-2 mt-4 text-[9px] font-bold text-slate-500'>
                    <Calendar size={12} />
                    <span>Vencimento todo dia {activeChat.paymentDay || '10'}</span>
                  </div>
                </div>

                <div className='space-y-4'>
                   <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Próximas Faturas</span>
                   {[1, 2].map((i) => (
                     <div key={i} className='flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5'>
                        <div className='flex flex-col'>
                           <span className='text-[10px] font-black text-slate-900 dark:text-white uppercase'>Mensalidade {i === 1 ? 'Junho' : 'Julho'}</span>
                           <span className='text-[8px] text-slate-400 font-bold uppercase'>{i === 1 ? '10/06/2024' : '10/07/2024'}</span>
                        </div>
                        <span className='text-[10px] font-black text-slate-900 dark:text-white'>{formatCurrency(activeChat.propertyValue)}</span>
                     </div>
                   ))}
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-12 text-center opacity-40 grayscale'>
                <FileText size={48} strokeWidth={1} />
                <p className='mt-4 text-[10px] font-black uppercase tracking-widest'>Sem chamados vinculados</p>
              </div>
            )}

            {/* Timeline - Common for all categories */}
            <div className='space-y-6 pt-4'>
              <div className='flex items-center justify-between'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Linha do Tempo</span>
                <div className='flex items-center gap-1'>
                   <div className='w-1 h-1 rounded-full bg-emerald-500 animate-pulse' />
                   <span className='text-[8px] font-black text-emerald-500 uppercase'>Ao vivo</span>
                </div>
              </div>

              <div className='relative space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5'>
                <div className='relative flex gap-4 items-start group animate-fadeIn'>
                   <div className='w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center z-10 shrink-0 border-4 border-white dark:border-[#0f172a] shadow-sm'>
                      <Clock size={12} strokeWidth={3} />
                   </div>
                   <div className='flex-1'>
                      <p className='text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight'>Início da Conversa</p>
                      <p className='text-[9px] text-slate-400 font-bold uppercase mt-0.5'>{activeChat.lastMessageTime}</p>
                   </div>
                </div>
                {activeChat.ticket && (
                   <div className='relative flex gap-4 items-start group animate-fadeIn'>
                      <div className='w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center z-10 shrink-0 border-4 border-white dark:border-[#0f172a] shadow-sm'>
                         <Wrench size={12} strokeWidth={3} />
                      </div>
                      <div className='flex-1'>
                         <p className='text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight'>Chamado Aberto</p>
                         <p className='text-[9px] text-slate-400 font-bold uppercase mt-0.5'>Há 2 dias</p>
                      </div>
                   </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Tenant & Property Section */
          <div className='space-y-8 animate-fadeIn'>
            {/* Property Card */}
            <div className='space-y-4'>
              <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Imóvel Vinculado</span>
              <div className='group relative overflow-hidden rounded-[32px] bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/5'>
                {activeChat.propertyImage ? (
                  <img src={activeChat.propertyImage} className='w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-all duration-500' alt='' />
                ) : (
                  <div className='w-full h-32 flex items-center justify-center text-slate-300'>
                    <Home size={32} />
                  </div>
                )}
                <div className='p-5'>
                  <h4 className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-snug'>{activeChat.property}</h4>
                  <div className='flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold'>
                    <MapPin size={12} className='text-primary' />
                    <span>São Paulo, SP</span>
                  </div>
                  <button className='mt-4 flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest group-hover:gap-3 transition-all'>
                    Ver Contrato <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tenant Details */}
            <div className='space-y-4'>
              <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Informações do Locatário</span>
              <div className='space-y-3'>
                <div className='flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5'>
                  <div className='w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 shrink-0'>
                    <User size={18} />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>Nome Completo</span>
                    <span className='text-xs font-bold text-slate-900 dark:text-white truncate'>{activeChat.tenantName}</span>
                  </div>
                </div>

                <div className='flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5'>
                  <div className='w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 shrink-0'>
                    <Mail size={18} />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>E-mail</span>
                    <span className='text-xs font-bold text-slate-900 dark:text-white truncate'>{activeChat.tenantEmail || 'não informado'}</span>
                  </div>
                </div>

                <div className='flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5'>
                  <div className='w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 shrink-0'>
                    <Phone size={18} />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>Telefone</span>
                    <span className='text-xs font-bold text-slate-900 dark:text-white truncate'>{activeChat.tenantPhone || 'não informado'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
