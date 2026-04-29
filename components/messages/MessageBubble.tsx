import React from 'react';
import { CheckCheck, Image as ImageIcon } from 'lucide-react';
import { ChatMessage } from '../../services/messageService';

interface MessageBubbleProps {
  msg: ChatMessage;
}

export const MessageBubble = React.memo(({ msg }: MessageBubbleProps) => {
  if (msg.sender === 'system') {
    return (
      <div className='flex w-full justify-center'>
        <div className='bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide my-2 shadow-sm'>
          {msg.text}
        </div>
      </div>
    );
  }

  const isMe = msg.sender === 'me';

  return (
    <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm shadow-sm relative group ${
            isMe
              ? 'bg-primary text-white rounded-tr-sm'
              : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-white rounded-tl-sm border border-gray-100 dark:border-gray-700'
          }`}
        >
          {msg.type === 'image' ? (
            <div className='relative'>
              <img 
                src={msg.text} 
                alt='Anexo' 
                className='max-w-[240px] md:max-w-xs rounded-xl border border-white/10 shadow-sm cursor-pointer hover:scale-[1.02] transition-transform' 
                onClick={() => window.open(msg.text, '_blank')}
              />
              <div className='absolute bottom-2 right-2 p-1 bg-black/40 backdrop-blur-md rounded-lg'>
                <ImageIcon size={14} className='text-white' />
              </div>
            </div>
          ) : (
            msg.text
          )}
        </div>
        <div className='flex items-center gap-1 mt-1 px-1'>
          <span className='text-[10px] text-slate-400 font-medium'>
            {msg.time}
          </span>
          {isMe && (
            <CheckCheck
              size={12}
              className={msg.isRead ? 'text-primary' : 'text-slate-300'}
            />
          )}
        </div>
      </div>
    </div>
  );
});
