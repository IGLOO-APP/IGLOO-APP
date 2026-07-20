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
import { TicketView } from './sections/TicketView';
import { TenantView } from './sections/TenantView';

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
      className={`fixed lg:relative inset-y-0 right-0 w-[85%] sm:w-72 md:w-80 lg:w-72 border-l border-border flex flex-col h-full z-[60] lg:z-10 transition-transform duration-300 shadow-2xl lg:shadow-none min-h-0`}
    >
      <div className='h-14 px-4 flex items-center justify-between border-b border-border shrink-0 sticky top-0 bg-background z-10'>
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
          <TicketView 
            activeChat={activeChat} 
            isStatusLocked={isStatusLocked} 
            onStatusChange={onStatusChange} 
            onCloseSupportTicket={handleCloseSupportTicket} 
            formatCurrency={formatCurrency}
          />
        ) : (
          <TenantView activeChat={activeChat} />
        )}
      </div>
    </div>
  );
};
