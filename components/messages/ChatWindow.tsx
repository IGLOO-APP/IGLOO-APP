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
      className={`flex-1 flex flex-col bg-slate-50 dark:bg-black/20 absolute md:relative w-full md:w-auto h-full transition-transform duration-300 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
    >
      <div className='h-20 px-6 md:px-8 flex items-center justify-between bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 shrink-0 z-20 shadow-sm'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => setActiveChatId(null)}
            className='md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
          >
            <ChevronLeft size={24} />
          </button>

          <div className='flex items-center gap-4'>
            {/* Professional Header Avatar — Matching Sidebar Adjustment 2 */}
            <div className={`w-12 h-12 rounded-2xl ${getAvatarColor(activeChat.tenantName)} flex items-center justify-center text-white font-black text-xl shadow-lg shadow-black/5`}>
              {activeChat.tenantAvatar ? (
                <img src={activeChat.tenantAvatar} alt='' className='w-full h-full object-cover rounded-2xl' />
              ) : (
                <span>{activeChat.tenantName.charAt(0)}</span>
              )}
            </div>

            <div className='flex flex-col'>
              <div className='flex items-center gap-3'>
                <h2 className='text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none'>
                  {activeChat.tenantName}
                </h2>
                <span className={`px-2 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] font-black uppercase tracking-widest`}>
                   #{activeChat.id.slice(0, 8)}
                </span>
              </div>
              <div className='flex items-center gap-2 mt-1.5'>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]'>
                  {activeChat.property}
                </p>
                <span className='text-slate-300 dark:text-slate-800'>•</span>
                <span className={`text-[9px] font-black uppercase tracking-wider ${
                  activeChat.category === 'maintenance' ? 'text-orange-500' :
                  activeChat.category === 'finance' ? 'text-emerald-500' : 'text-primary'
                }`}>
                  {activeChat.category === 'maintenance' ? 'Chamado de Manutenção' : 
                   activeChat.category === 'finance' ? 'Financeiro' : 'Conversa Geral'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {Object.keys(typingUsers).length > 0 && (
            <div className='hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full'>
              <div className='flex gap-0.5'>
                <div className='w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]' />
                <div className='w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]' />
                <div className='w-1 h-1 bg-primary rounded-full animate-bounce' />
              </div>
              <span className='text-[9px] text-primary font-black uppercase tracking-widest'>Digitando</span>
            </div>
          )}
          <button
            onClick={() => setShowDetailsPanel(!showDetailsPanel)}
            className={`p-3 rounded-2xl transition-all ${
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

        <div className='p-6 md:p-8 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 shrink-0'>
          {/* Quick Replies - Professional Pills with Management */}
          <div className='flex gap-3 overflow-x-auto hide-scrollbar mb-6 pb-2 items-center'>
            <span className='text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] self-center mr-2 shrink-0'>Sugestões:</span>
            
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
                  placeholder='Nova resposta...'
                  className='h-9 px-4 rounded-xl bg-primary/5 border border-primary/20 text-[10px] font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/30 min-w-[120px]'
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
                className='p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shrink-0'
                title='Adicionar resposta rápida'
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            )}

            <div className='h-4 w-px bg-gray-100 dark:bg-white/5 mx-1 shrink-0' />

            {quickReplies.map((reply, i) => (
              <div key={i} className='relative group shrink-0'>
                <button
                  onClick={() => handleSendMessage(undefined, reply)}
                  className='whitespace-nowrap px-5 py-2 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all shadow-sm'
                >
                  {reply}
                </button>
                <button 
                  onClick={() => onRemoveQuickReply?.(i)}
                  className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110'
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => handleSendMessage(e)} className='flex gap-4 items-end max-w-[1000px] mx-auto'>
            <button
              type='button'
              onClick={() => attachmentInputRef.current?.click()}
              className='p-4 text-slate-400 hover:text-primary transition-all hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl border-2 border-transparent'
            >
              <Paperclip size={22} strokeWidth={2.5} />
            </button>
            <input 
              type="file" 
              ref={attachmentInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
            <div className='flex-1 bg-slate-50 dark:bg-black/40 rounded-[24px] border-2 border-gray-100 dark:border-white/10 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden flex items-center shadow-inner'>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='Escreva sua mensagem...'
                className='w-full h-14 px-6 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400'
              />
            </div>
            <button
              type='submit'
              disabled={!inputText.trim()}
              className='h-14 w-14 rounded-2xl bg-slate-900 dark:bg-white disabled:bg-slate-100 dark:disabled:bg-white/5 text-white dark:text-slate-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0'
            >
              <Send size={22} strokeWidth={2.5} className={inputText.trim() ? 'ml-0.5' : ''} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
