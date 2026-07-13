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
  DollarSign,
  Shield,
} from 'lucide-react';
import { ChatThread } from '../../services/messageService';
import { supportService } from '../../services/supportService';
import { toast } from 'sonner';

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Recém';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora mesmo';
  if (mins < 60) return `Há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Há ${days} dia${days > 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  return `Há ${months} mês${months > 1 ? 'es' : ''}`;
}

interface ContextPanelProps {
  activeChat: ChatThread;
  activeRightTab: 'ticket' | 'tenant';
  setActiveRightTab: (tab: 'ticket' | 'tenant') => void;
  setShowDetailsPanel: (show: boolean) => void;
  isStatusLocked: boolean;
  setIsStatusLocked: (locked: boolean) => void;
  onStatusChange: (status: 'pending' | 'in_progress' | 'completed') => void;
  onCloseSupportTicket?: () => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  activeChat,
  activeRightTab,
  setActiveRightTab,
  setShowDetailsPanel,
  isStatusLocked,
  setIsStatusLocked,
  onStatusChange,
  onCloseSupportTicket,
}) => {
  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleCloseSupportTicket = async () => {
    if (!activeChat.ticket?.realId) return;
    setIsStatusLocked(true);
    try {
      await supportService.updateTicketStatus(activeChat.ticket.realId, 'Fechado');
      await supportService.addSystemMessage(
        activeChat.ticket.realId,
        'Chamado encerrado pelo proprietário'
      );
      toast.success('Chamado de suporte fechado com sucesso!');
      onCloseSupportTicket?.();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao fechar chamado de suporte.');
    } finally {
      setIsStatusLocked(false);
    }
  };

  return (
    <div
      className={`fixed lg:relative inset-y-0 right-0 w-[85%] sm:w-72 md:w-80 lg:w-72 bg-background border-l border-border flex flex-col h-full z-[60] lg:z-10 transition-transform duration-300 shadow-2xl lg:shadow-none min-h-0`}
    >
      <div className='h-14 px-4 flex items-center justify-between border-b border-border shrink-0 bg-background sticky top-0 z-10'>
        <div className='flex flex-col'>
          <h3 className='text-xs font-semibold text-foreground'>
            Detalhamento
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Contexto da Conversa
          </p>
        </div>
        <button
          onClick={() => setShowDetailsPanel(false)}
          className='p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95'
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className='flex border-b border-border shrink-0'>
        <button
          onClick={() => setActiveRightTab('ticket')}
          className={`flex-1 py-3 text-xs font-medium transition-all relative ${
            activeRightTab === 'ticket'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeChat.category === 'maintenance'
            ? 'Chamado'
            : activeChat.category === 'finance'
              ? 'Finanças'
              : activeChat.category === 'support'
                ? 'Suporte'
                : 'Geral'}
          {activeRightTab === 'ticket' && (
            <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />
          )}
        </button>
        <button
          onClick={() => setActiveRightTab('tenant')}
          className={`flex-1 py-3 text-xs font-medium transition-all relative ${
            activeRightTab === 'tenant'
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {activeChat.category === 'support' ? 'Atendimento' : 'Inquilino'}
          {activeRightTab === 'tenant' && (
            <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />
          )}
        </button>
      </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 pb-20 md:pb-4'>
        {activeRightTab === 'ticket' ? (
          <>
            {(activeChat.category === 'maintenance' || activeChat.category === 'support') &&
            activeChat.ticket ? (
              <div className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Status Atual
                    </span>
                    <div className='flex items-center gap-1.5'>
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          activeChat.ticket.status === 'completed'
                            ? 'bg-emerald-500'
                            : activeChat.ticket.status === 'in_progress'
                              ? 'bg-blue-500'
                              : 'bg-orange-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          activeChat.ticket.status === 'completed'
                            ? 'text-emerald-500'
                            : activeChat.ticket.status === 'in_progress'
                              ? 'text-blue-500'
                              : 'text-orange-500'
                        }`}
                      >
                        {activeChat.ticket.status === 'completed'
                          ? 'Resolvido'
                          : activeChat.ticket.status === 'in_progress'
                            ? 'Em Andamento'
                            : 'Pendente'}
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
                          activeChat.ticket!.status === status ||
                          (status === 'pending' && activeChat.ticket!.status === 'pending') ||
                          (status === 'in_progress' &&
                            (activeChat.ticket!.status === 'in_progress' ||
                              activeChat.ticket!.status === 'completed')) ||
                          (status === 'completed' && activeChat.ticket!.status === 'completed')
                            ? status === 'completed'
                              ? 'bg-emerald-500'
                              : status === 'in_progress'
                                ? 'bg-blue-500'
                                : 'bg-orange-500'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className='p-4 bg-muted/30 rounded-2xl border border-border'>
                  <h4 className='text-sm font-semibold text-foreground mb-1.5'>
                    {activeChat.ticket.title}
                  </h4>
                  <p className='text-xs text-muted-foreground leading-relaxed mb-3'>
                    {activeChat.ticket.description || 'Chamado de suporte registrado no sistema.'}
                  </p>
                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1 px-1.5 py-1 bg-background rounded-lg border border-border'>
                      <AlertCircle size={9} className='text-orange-500' />
                      <span className='text-[10px] font-medium text-muted-foreground'>
                        {activeChat.ticket.priority}
                      </span>
                    </div>
                    <div className='flex items-center gap-1 px-1.5 py-1 bg-background rounded-lg border border-border'>
                      <Clock size={9} className='text-muted-foreground' />
                      <span className='text-[10px] font-medium text-muted-foreground'>
                        Aberto Recém
                      </span>
                    </div>
                  </div>
                </div>

                {activeChat.ticket.status !== 'completed' && (
                  <button
                    disabled={isStatusLocked}
                    onClick={() => {
                      if (window.confirm('Deseja fechar este chamado de suporte?')) {
                        if (activeChat.category === 'support') {
                          handleCloseSupportTicket();
                        } else {
                          onStatusChange('completed');
                        }
                      }
                    }}
                    className='w-full h-10 bg-foreground text-background rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-sm flex items-center justify-center gap-1.5'
                  >
                    <CheckCircle size={12} />
                    Finalizar Chamado
                  </button>
                )}
              </div>
            ) : activeChat.category === 'finance' ? (
              <div className='space-y-4'>
                <div className='p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10'>
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                      Aluguel Mensal
                    </span>
                    <DollarSign size={14} className='text-emerald-500' />
                  </div>
                  <p className='text-xl font-semibold text-foreground tracking-tight'>
                    {formatCurrency(activeChat.propertyValue)}
                  </p>
                  <div className='flex items-center gap-2 mt-3 text-xs text-muted-foreground'>
                    <Calendar size={10} />
                    <span>Vencimento todo dia {activeChat.paymentDay || '10'}</span>
                  </div>
                </div>

                <div className='space-y-3'>
                  <span className='text-xs font-medium text-muted-foreground'>
                    Próximas Faturas
                  </span>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between p-3 bg-card rounded-2xl border border-border'
                    >
                      <div className='flex flex-col'>
                        <span className='text-xs font-semibold text-foreground'>
                          Mensalidade {i === 1 ? 'Junho' : 'Julho'}
                        </span>
                        <span className='text-[10px] text-muted-foreground font-medium'>
                          {i === 1 ? '10/06/2024' : '10/07/2024'}
                        </span>
                      </div>
                      <span className='text-xs font-semibold text-foreground'>
                        {formatCurrency(activeChat.propertyValue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-8 text-center opacity-40'>
                <FileText size={36} strokeWidth={1} />
                <p className='mt-3 text-xs font-medium text-muted-foreground'>
                  Sem chamados vinculados
                </p>
              </div>
            )}

            <div className='space-y-4 pt-3'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-muted-foreground'>
                  Linha do Tempo
                </span>
                <div className='flex items-center gap-1'>
                  <div className='w-1 h-1 rounded-full bg-emerald-500 animate-pulse' />
                  <span className='text-[10px] font-medium text-emerald-500'>Ao vivo</span>
                </div>
              </div>

              <div className='relative space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-border'>
                <div className='relative flex gap-3 items-start group'>
                  <div className='w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center z-10 shrink-0 border-4 border-background shadow-sm'>
                    <Clock size={10} />
                  </div>
                  <div className='flex-1'>
                    <p className='text-xs font-semibold text-foreground'>
                      Início da Conversa
                    </p>
                    <p className='text-[10px] text-muted-foreground mt-0.5'>
                      {activeChat.lastMessageTime}
                    </p>
                  </div>
                </div>
                {activeChat.ticket && (
                  <div className='relative flex gap-3 items-start group'>
                    <div className='w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-10 shrink-0 border-4 border-background shadow-sm'>
                      <Wrench size={10} />
                    </div>
                    <div className='flex-1'>
                      <p className='text-xs font-semibold text-foreground'>
                        Chamado Aberto
                      </p>
                      <p className='text-[10px] text-muted-foreground mt-0.5'>
                        {formatRelativeTime(activeChat.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : activeChat.category === 'support' ? (
          <div className='space-y-4'>
            <div className='p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 flex flex-col items-center text-center'>
              <div className='w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3'>
                <Shield size={22} />
              </div>
              <h4 className='text-xs font-semibold text-foreground mb-2'>
                Suporte Oficial Igloo
              </h4>
              <p className='text-xs text-muted-foreground leading-relaxed mb-3'>
                Nossa equipe de especialistas operacionais está pronta para te atender.
              </p>
              <div className='w-full p-3 bg-card rounded-2xl border border-border space-y-2.5 text-left'>
                <div className='flex items-center gap-2.5'>
                  <Clock size={12} className='text-cyan-500 shrink-0' />
                  <div>
                    <p className='text-xs font-medium text-foreground leading-none'>
                      Tempo de Resposta
                    </p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      Máximo de 2 horas
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2.5'>
                  <Calendar size={12} className='text-blue-500 shrink-0' />
                  <div>
                    <p className='text-xs font-medium text-foreground leading-none'>
                      Horário de Atendimento
                    </p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      Seg a Sex, 08h às 18h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-5'>
            <div className='space-y-3'>
              <span className='text-xs font-medium text-muted-foreground'>
                Imóvel Vinculado
              </span>
              <div className='group relative overflow-hidden rounded-2xl bg-card border border-border'>
                {activeChat.propertyImage ? (
                  <img
                    src={activeChat.propertyImage}
                    className='w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-all duration-500'
                    alt=''
                  />
                ) : (
                  <div className='w-full h-24 flex items-center justify-center text-muted-foreground/30'>
                    <Home size={24} />
                  </div>
                )}
                <div className='p-4'>
                  <h4 className='text-sm font-semibold text-foreground leading-snug'>
                    {activeChat.property}
                  </h4>
                  <div className='flex items-center gap-2 mt-1.5 text-xs text-muted-foreground'>
                    <MapPin size={10} className='text-primary' />
                    <span>São Paulo, SP</span>
                  </div>
                  <button className='mt-3 flex items-center gap-1.5 text-xs font-medium text-primary group-hover:gap-2 transition-all'>
                    Ver Contrato <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <span className='text-xs font-medium text-muted-foreground'>
                Informações do Locatário
              </span>
              <div className='space-y-2'>
                <div className='flex items-center gap-3 p-3 bg-card rounded-2xl border border-border'>
                  <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0'>
                    <User size={14} />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[10px] font-medium text-muted-foreground'>
                      Nome Completo
                    </span>
                    <span className='text-xs font-medium text-foreground truncate'>
                      {activeChat.tenantName}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-3 bg-card rounded-2xl border border-border'>
                  <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0'>
                    <Mail size={14} />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[10px] font-medium text-muted-foreground'>
                      E-mail
                    </span>
                    <span className='text-xs font-medium text-foreground truncate'>
                      {activeChat.tenantEmail || 'não informado'}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-3 bg-card rounded-2xl border border-border'>
                  <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0'>
                    <Phone size={14} />
                  </div>
                  <div className='flex flex-col min-w-0'>
                    <span className='text-[10px] font-medium text-muted-foreground'>
                      Telefone
                    </span>
                    <span className='text-xs font-medium text-foreground truncate'>
                      {activeChat.tenantPhone || 'não informado'}
                    </span>
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
