import React from 'react';
import { CheckCheck, Image as ImageIcon } from 'lucide-react';
import { ChatMessage } from '../../services/messageService';

interface MessageBubbleProps {
  msg: ChatMessage;
}

export const MessageBubble = React.memo(({ msg }: MessageBubbleProps) => {
  if (msg.sender === 'system') {
    return (
      <div className='flex w-full justify-center my-6'>
        <div className='bg-slate-100 dark:bg-white/5 text-slate-400 px-8 py-2 rounded-full text-[8px] font-black uppercase tracking-[0.3em] border border-gray-100 dark:border-white/5 shadow-inner'>
          {msg.text}
        </div>
      </div>
    );
  }

  const isMe = msg.sender === 'me';

  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-6 py-4 shadow-xl relative group transition-all border-2 ${
            isMe
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[28px] rounded-tr-none border-transparent'
              : 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white rounded-[28px] rounded-tl-none border-slate-100 dark:border-white/10'
          }`}
        >
          {msg.type === 'image' ? (
            <div className='relative'>
              <img 
                src={msg.text} 
                alt='Anexo' 
                className='max-w-full md:max-w-sm rounded-[20px] border border-white/10 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform' 
                onClick={() => window.open(msg.text, '_blank')}
              />
              <div className='absolute bottom-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-xl'>
                <ImageIcon size={16} className='text-white' />
              </div>
            </div>
          ) : (
            <p className='text-sm leading-relaxed font-bold tracking-tight'>{msg.text}</p>
          )}
        </div>
        
        <div className={`flex items-center gap-3 mt-2 px-4 ${isMe ? 'flex-row-reverse' : ''}`}>
          <span className='text-[10px] text-slate-400 font-black uppercase tracking-[0.1em] opacity-50'>
            {msg.time}
          </span>
          {isMe && (
            <div className='flex items-center gap-1.5'>
              <CheckCheck
                size={14}
                strokeWidth={3}
                className={msg.isRead ? 'text-emerald-500' : 'text-slate-300 dark:text-white/20'}
              />
              <span className='text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-40'>
                {msg.isRead ? 'LIDO' : 'ENVIADO'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
