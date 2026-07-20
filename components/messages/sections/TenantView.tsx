import React from 'react';
import { User, Phone, Mail, Home, MapPin, ExternalLink } from 'lucide-react';
import { ChatThread } from '../../../services/messageService';

interface TenantViewProps {
  activeChat: ChatThread;
}

export const TenantView: React.FC<TenantViewProps> = ({ activeChat }) => {
  return (
    <div className='space-y-5'>
      <div className='space-y-3'>
        <span className='text-xs font-medium text-muted-foreground'>Imóvel Vinculado</span>
        <div className='group relative overflow-hidden rounded-2xl lg-card'>
          {activeChat.propertyImage ? (
            <img src={activeChat.propertyImage} className='w-full h-32 object-cover opacity-80' alt='' />
          ) : (
            <div className='w-full h-24 flex items-center justify-center text-muted-foreground/30'>
              <Home size={24} />
            </div>
          )}
          <div className='p-4'>
            <h4 className='text-sm font-semibold text-foreground leading-snug'>{activeChat.property}</h4>
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
        <span className='text-xs font-medium text-muted-foreground'>Informações do Locatário</span>
        <div className='space-y-2'>
          <div className='flex items-center gap-3 p-3 lg-card rounded-2xl'>
            <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0'>
              <User size={14} />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-[10px] font-medium text-muted-foreground'>Nome Completo</span>
              <span className='text-xs font-medium text-foreground truncate'>{activeChat.tenantName}</span>
            </div>
          </div>
          <div className='flex items-center gap-3 p-3 lg-card rounded-2xl'>
            <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0'>
              <Mail size={14} />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-[10px] font-medium text-muted-foreground'>E-mail</span>
              <span className='text-xs font-medium text-foreground truncate'>{activeChat.tenantEmail || 'não informado'}</span>
            </div>
          </div>
          <div className='flex items-center gap-3 p-3 lg-card rounded-2xl'>
            <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0'>
              <Phone size={14} />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-[10px] font-medium text-muted-foreground'>Telefone</span>
              <span className='text-xs font-medium text-foreground truncate'>{activeChat.tenantPhone || 'não informado'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
