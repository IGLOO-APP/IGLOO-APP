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
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn px-2`}>
      <div className={`max-w-[88%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-5 py-3.5 shadow-lg relative group transition-all ${
            isMe
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 rounded-[24px] rounded-tr-none'
              : 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white rounded-[24px] rounded-tl-none border border-slate-100 dark:border-white/5'
          }`}
        >
          {msg.type === 'image' ? (
            <div className='relative'>
              <img 
                src={msg.text} 
                alt='Anexo' 
                className='max-w-full md:max-w-sm rounded-2xl border border-white/10 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform' 
                onClick={() => window.open(msg.text, '_blank')}
              />
              <div className='absolute bottom-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-xl'>
                <ImageIcon size={16} className='text-white' />
              </div>
            </div>
          ) : (
            <p className='text-[13px] md:text-sm leading-relaxed font-bold tracking-tight'>{msg.text}</p>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
          <span className='text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] opacity-60'>
            {msg.time}
          </span>
          {isMe && (
            <div className='flex items-center gap-1 opacity-70'>
              <CheckCheck
                size={12}
                strokeWidth={3}
                className={msg.isRead ? 'text-cyan-500' : 'text-slate-300 dark:text-white/20'}
              />
              <span className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>
                {msg.isRead ? 'LIDO' : 'ENTREGUE'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
