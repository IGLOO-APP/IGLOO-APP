import React, { useCallback } from 'react';
import { CheckCheck, Image as ImageIcon, Megaphone, Shield } from 'lucide-react';
import { ChatMessage } from '../../services/messageService';
import { isValidUrl } from '../../utils/validation';

function formatDateTime(dateStr?: string, timeStr?: string) {
  if (!dateStr) return timeStr || '';
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

interface MessageBubbleProps {
  msg: ChatMessage;
}

export const MessageBubble = React.memo(({ msg }: MessageBubbleProps) => {
  const openImage = useCallback(() => {
    if (isValidUrl(msg.text)) window.open(msg.text, '_blank', 'noopener,noreferrer');
  }, [msg.text]);

  if (msg.sender === 'system') {
    return (
      <div className='flex w-full justify-start px-1 my-3'>
        <div className='max-w-[88%] md:max-w-[70%] flex flex-col items-start'>
          <div className='flex items-center gap-1.5 mb-2 px-1 text-xs font-semibold text-primary'>
            <Megaphone size={12} className='shrink-0' />
            <span>Comunicado do proprietário</span>
          </div>
          <div className='px-4 py-3 bg-primary/5 dark:bg-primary/10 text-foreground rounded-[20px] rounded-tl-none border border-primary/10 shadow-sm'>
            <p className='text-sm leading-relaxed whitespace-pre-wrap'>{msg.text}</p>
          </div>
          <span className='text-xs text-muted-foreground mt-1.5 px-1'>
            {formatDateTime(msg.created_at, msg.time)}
          </span>
        </div>
      </div>
    );
  }

  const isMe = msg.sender === 'me';

  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} px-1`}>
      <div
        className={`max-w-[88%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
      >
        {!isMe && msg.isSupport && (
          <div className='flex items-center gap-1 mb-1 px-1 text-[10px] font-medium text-cyan-600 dark:text-cyan-400'>
            <Shield size={10} /> Suporte Autorizado
          </div>
        )}
        <div
          className={`px-4 py-2.5 shadow-sm relative group transition-all ${
            isMe
              ? 'bg-foreground text-background rounded-[20px] rounded-tr-none'
              : 'bg-card text-foreground rounded-[20px] rounded-tl-none border border-border'
          }`}
        >
          {msg.type === 'image' ? (
            <div className='relative'>
              <img
                src={msg.text}
                alt='Anexo'
                className='max-w-full md:max-w-sm rounded-xl border border-white/10 shadow-sm cursor-pointer hover:scale-[1.02] transition-transform'
                onClick={openImage}
              />
              <div className='absolute bottom-2 right-2 p-1.5 bg-black/40 rounded-lg'>
                <ImageIcon size={12} className='text-white' />
              </div>
            </div>
          ) : (
            <p className='text-sm leading-relaxed'>{msg.text}</p>
          )}
        </div>

        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
          <span className='text-xs text-muted-foreground'>
            {formatDateTime(msg.created_at, msg.time)}
          </span>
          {isMe && (
            <div className='flex items-center gap-1 opacity-60'>
              <CheckCheck
                size={10}
                strokeWidth={3}
                className={msg.isRead ? 'text-cyan-500' : 'text-muted-foreground/40'}
              />
              <span className='text-[10px] text-muted-foreground'>
                {msg.isRead ? 'Lido' : 'Entregue'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
