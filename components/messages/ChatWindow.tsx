import React from 'react';
import { ChevronLeft, LayoutDashboard, FileText, MoreVertical, Paperclip, Send } from 'lucide-react';
import { ChatThread, ChatMessage } from '../../services/messageService';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  activeChat: ChatThread;
  setActiveChatId: (id: string | null) => void;
  setShowDetailsPanel: (show: boolean) => void;
  showDetailsPanel: boolean;
  activeRightTab: 'ticket' | 'tenant';
  setActiveRightTab: (tab: 'ticket' | 'tenant') => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  quickReplies: string[];
  handleSendMessage: (e?: React.FormEvent, overrideText?: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  attachmentInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeChat,
  setActiveChatId,
  setShowDetailsPanel,
  showDetailsPanel,
  activeRightTab,
  setActiveRightTab,
  messagesEndRef,
  quickReplies,
  handleSendMessage,
  inputText,
  setInputText,
  attachmentInputRef,
  handleFileUpload,
  loadMoreMessages,
  loadingMore,
  typingUsers,
}) => {
  return (
    <div
      className={`flex-1 flex flex-col bg-slate-50 dark:bg-black/20 absolute md:relative w-full h-full transition-transform duration-300 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
    >
      <div className='h-16 px-4 md:px-6 flex items-center justify-between bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 shrink-0 z-20 shadow-sm'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => setActiveChatId(null)}
            className='md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
          >
            <ChevronLeft size={24} />
          </button>

          <div>
            <div className='flex flex-wrap items-center gap-1.5 md:gap-2'>
              <h2 className='text-sm md:text-base font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[140px] md:max-w-none'>
                {activeChat.tenantName}
              </h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  activeChat.category === 'maintenance'
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                    : activeChat.category === 'finance'
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }`}
              >
                {activeChat.category === 'maintenance'
                  ? 'Chamado'
                  : activeChat.category === 'finance'
                    ? 'Financeiro'
                    : 'Geral'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                {activeChat.property}
              </p>
              {Object.keys(typingUsers).length > 0 && (
                <span className='text-[10px] text-primary font-bold animate-pulse italic'>
                  • Digitando...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={() => {
              setShowDetailsPanel(true);
              setActiveRightTab('tenant');
            }}
            className='p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors'
            title='Mini Dashboard do Inquilino'
          >
            <LayoutDashboard size={20} />
          </button>
          {activeChat.ticket && (
            <button
              onClick={() => {
                setShowDetailsPanel(!showDetailsPanel);
                setActiveRightTab('ticket');
              }}
              className={`p-2 rounded-lg transition-colors ${showDetailsPanel && activeRightTab === 'ticket' ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}
              title='Ver detalhes do chamado'
            >
              <FileText size={20} />
            </button>
          )}
          <button className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors'>
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className='flex-1 flex flex-col min-w-0'>
        <div className='flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col'>
          <div className='flex flex-col items-center gap-4 mb-6'>
            {activeChat.hasMore && (
              <button
                onClick={loadMoreMessages}
                disabled={loadingMore}
                className='text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-all disabled:opacity-50'
              >
                {loadingMore ? 'Carregando...' : 'Carregar mensagens anteriores'}
              </button>
            )}
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full'>
              Mensagens recentes
            </span>
          </div>

          <div className='space-y-4 flex flex-col'>
            {activeChat.messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <div className='p-4 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-white/5 shrink-0'>
          <div className='flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1'>
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(undefined, reply)}
                className='whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors'
              >
                {reply}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => handleSendMessage(e)} className='flex gap-3 items-end'>
            <button
              type='button'
              onClick={() => attachmentInputRef.current?.click()}
              className='p-2 md:p-3 text-slate-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-white/5 rounded-full'
            >
              <Paperclip size={18} className='md:hidden' />
              <Paperclip size={20} className='hidden md:block' />
            </button>
            <input 
              type="file" 
              ref={attachmentInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
            <div className='flex-1 bg-gray-100 dark:bg-black/20 rounded-2xl border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden flex items-center'>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='Digite uma mensagem...'
                className='w-full h-12 px-4 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400'
              />
            </div>
            <button
              type='submit'
              disabled={!inputText.trim()}
              className='h-12 w-12 rounded-full bg-primary disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center shadow-lg shadow-primary/20 disabled:shadow-none hover:bg-primary-dark transition-all active:scale-95 shrink-0'
            >
              <Send size={20} className={inputText.trim() ? 'ml-0.5' : ''} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
