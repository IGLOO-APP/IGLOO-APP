import React from 'react';
import { ChevronLeft, FileText, Paperclip, Send, X, Plus } from 'lucide-react';
import { ChatThread, ChatMessage } from '../../services/messageService';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  activeChat: ChatThread;
  setActiveChatId: (id: string | null) => void;
  setShowDetailsPanel: (show: boolean) => void;
  showDetailsPanel: boolean;
  activeRightTab: 'ticket' | 'tenant';
  setActiveRightTab: (tab: 'ticket' | 'tenant') => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  quickReplies: string[];
  handleSendMessage: (e?: React.FormEvent, overrideText?: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  attachmentInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loadMoreMessages: () => void;
  loadingMore: boolean;
  typingUsers: Record<string, boolean>;
  onAddQuickReply: (text: string) => void;
  onRemoveQuickReply: (index: number) => void;
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
  onAddQuickReply,
  onRemoveQuickReply,
  handleSendMessage,
  inputText,
  setInputText,
  attachmentInputRef,
  handleFileUpload,
  loadMoreMessages,
  loadingMore,
  typingUsers,
}) => {
  const [isAddingReply, setIsAddingReply] = React.useState(false);
  const [newReplyText, setNewReplyText] = React.useState('');

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 
      'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`flex-1 flex flex-col bg-slate-50 dark:bg-black/20 absolute md:relative inset-0 md:inset-auto w-full md:w-auto h-full transition-transform duration-300 z-30 md:z-10 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
    >
      <div className='min-h-[72px] md:h-20 px-4 md:px-8 py-3 md:py-0 flex items-center justify-between bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 shrink-0 z-20 shadow-sm'>
        <div className='flex items-center gap-2 md:gap-4 flex-1 min-w-0'>
          <button
            onClick={() => setActiveChatId(null)}
            className='p-2 -ml-1 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 md:hidden active:scale-95 transition-all'
          >
            <ChevronLeft size={20} />
          </button>

          <div className='flex items-center gap-3 md:gap-4 flex-1 min-w-0'>
            {/* Professional Header Avatar */}
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${getAvatarColor(activeChat.tenantName)} flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg shadow-black/5 shrink-0 border border-white/10`}>
              {activeChat.tenantAvatar ? (
                <img src={activeChat.tenantAvatar} alt='' className='w-full h-full object-cover rounded-2xl' />
              ) : (
                <span>{activeChat.tenantName.charAt(0)}</span>
              )}
            </div>

            <div className='flex flex-col min-w-0'>
              <div className='flex items-center gap-2'>
                <h2 className='text-[13px] md:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none truncate'>
                  {activeChat.tenantName}
                </h2>
                <span className='hidden sm:inline-flex px-1.5 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[7px] md:text-[8px] font-black uppercase tracking-widest shrink-0'>
                   #{activeChat.id.slice(0, 8)}
                </span>
              </div>
              <div className='flex items-center gap-1.5 mt-1 md:mt-1.5'>
                <p className='text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] truncate max-w-[120px] md:max-w-none'>
                  {activeChat.property}
                </p>
                <span className='text-slate-300 dark:text-slate-800 text-[10px]'>•</span>
                <span className={`px-2 py-0.5 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-wider truncate ${
                  activeChat.category === 'maintenance' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                  activeChat.category === 'finance' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                  'bg-primary/10 text-primary'
                }`}>
                  {activeChat.category === 'maintenance' ? 'Manutenção' : 
                   activeChat.category === 'finance' ? 'Financeiro' : 'Geral'}
                </span>
              </div>
              
              {Object.values(typingUsers).some(Boolean) && (
                <div className='flex items-center gap-1.5 mt-1 animate-fadeIn'>
                  <div className='flex items-center gap-1'>
                    <div className='w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]' />
                    <div className='w-1 h-1 bg-primary rounded-full animate-bounce' />
                  </div>
                  <span className='text-[9px] text-primary font-black uppercase tracking-widest'>Digitando</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowDetailsPanel(!showDetailsPanel)}
            className={`p-2.5 md:p-3 rounded-2xl transition-all active:scale-95 ${
              showDetailsPanel 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' 
                : 'bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {showDetailsPanel ? <X size={20} strokeWidth={2.5} /> : <FileText size={20} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      <div className='flex-1 flex flex-col min-w-0 min-h-0'>
        <div className='flex-1 overflow-y-auto p-6 md:p-10 space-y-8 flex flex-col custom-scrollbar'>
          <div className='flex justify-center mb-4'>
            <div className='bg-slate-100 dark:bg-white/5 text-slate-400 px-6 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] border border-gray-100 dark:border-white/5'>
              Histórico de Mensagens
            </div>
          </div>

          <div className='space-y-6 flex flex-col'>
            {activeChat.messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <div className='p-4 pb-20 md:pb-8 md:p-8 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 shrink-0'>
          {/* Quick Replies - Professional Pills with Management */}
          <div className='flex gap-3 overflow-x-auto hide-scrollbar mb-4 md:mb-6 pb-2 items-center'>
            <span className='hidden md:inline-block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] self-center mr-2 shrink-0'>Sugestões:</span>
            
            {/* Add New Reply Button/Input */}
            {isAddingReply ? (
              <div className='flex items-center gap-2 animate-fadeInLeft'>
                <input 
                  autoFocus
                  type='text'
                  value={newReplyText}
                  onChange={(e) => setNewReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onAddQuickReply?.(newReplyText);
                      setNewReplyText('');
                      setIsAddingReply(false);
                    } else if (e.key === 'Escape') {
                      setIsAddingReply(false);
                    }
                  }}
                  placeholder='Nova...'
                  className='h-8 md:h-9 px-3 md:px-4 rounded-xl bg-primary/5 border border-primary/20 text-[10px] font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/30 min-w-[100px]'
                />
                <button 
                  onClick={() => setIsAddingReply(false)}
                  className='p-2 rounded-lg text-slate-400 hover:text-red-500 transition-colors'
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingReply(true)}
                className='p-2 md:p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shrink-0'
                title='Adicionar resposta rápida'
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            )}

            <div className='h-4 w-px bg-gray-100 dark:bg-white/5 mx-1 shrink-0' />

            <div className='flex gap-2 overflow-x-auto hide-scrollbar pr-10'>
              {quickReplies.map((reply, i) => (
                <div key={i} className='relative group shrink-0'>
                  <button
                    onClick={() => handleSendMessage(undefined, reply)}
                    className='whitespace-nowrap px-4 md:px-5 py-2 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[9px] md:text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all shadow-sm'
                  >
                    {reply}
                  </button>
                  <button 
                    onClick={() => onRemoveQuickReply?.(i)}
                    className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md'
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={(e) => handleSendMessage(e)} className='flex gap-2 md:gap-4 items-end max-w-[1000px] mx-auto'>
            <button
              type='button'
              onClick={() => attachmentInputRef.current?.click()}
              className='p-3 md:p-4 text-slate-400 hover:text-primary transition-all bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent active:scale-90 active:bg-slate-100'
            >
              <Paperclip size={20} md:size={22} strokeWidth={2.5} />
            </button>
            <input 
              type="file" 
              ref={attachmentInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
            <div className='flex-1 bg-slate-50 dark:bg-black/40 rounded-[22px] md:rounded-[24px] border-2 border-gray-100 dark:border-white/10 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden flex items-center shadow-inner'>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='Mensagem...'
                className='w-full h-12 md:h-14 px-5 md:px-6 bg-transparent border-none focus:ring-0 text-[13px] md:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400'
              />
            </div>
            <button
              type='submit'
              disabled={!inputText.trim()}
              className='h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-slate-900 dark:bg-white disabled:bg-slate-100 dark:disabled:bg-white/5 text-white dark:text-slate-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-90 transition-all shrink-0'
            >
              <Send size={20} md:size={22} strokeWidth={2.5} className={inputText.trim() ? 'ml-0.5' : ''} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
