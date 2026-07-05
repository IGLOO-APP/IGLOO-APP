import React, { useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronLeft, FileText, Paperclip, Send, X, Plus, Shield } from 'lucide-react';
import type { ChatThread } from '../../services/messageService';
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
  quickReplies,
  onAddQuickReply,
  onRemoveQuickReply,
  handleSendMessage,
  inputText,
  setInputText,
  attachmentInputRef,
  handleFileUpload,
  messagesEndRef,
  typingUsers,
  loadMoreMessages,
  loadingMore,
}) => {
  const [isAddingReply, setIsAddingReply] = React.useState(false);
  const [newReplyText, setNewReplyText] = React.useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const messages = activeChat.messages;

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || loadingMore) return;
    if (el.scrollTop < 100 && activeChat.hasMore) {
      loadMoreMessages();
    }
  }, [loadMoreMessages, loadingMore, activeChat.hasMore]);

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-cyan-500',
      'bg-indigo-500',
      'bg-orange-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`flex-1 flex flex-col bg-slate-50 dark:bg-black/20 absolute md:relative inset-0 md:inset-auto w-full md:w-auto h-full transition-transform duration-300 z-30 md:z-10 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
    >
      <div className='h-14 px-4 flex items-center justify-between bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 shrink-0 z-20 shadow-sm'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <button
            onClick={() => setActiveChatId(null)}
            className='p-1.5 -ml-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 md:hidden active:scale-95 transition-all'
            aria-label='Voltar'
          >
            <ChevronLeft size={16} />
          </button>

          <div className='flex items-center gap-2.5 flex-1 min-w-0'>
            {activeChat.category === 'support' ? (
              <div className='w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md border border-cyan-400/30 ring-2 ring-cyan-500/20 shrink-0'>
                <Shield size={16} className='text-white animate-pulse' />
              </div>
            ) : (
              <div
                className={`w-9 h-9 rounded-xl ${getAvatarColor(activeChat.tenantName)} flex items-center justify-center text-white font-black text-base shadow-md shadow-black/5 shrink-0 border border-white/10`}
              >
                {activeChat.tenantAvatar ? (
                  <img
                    src={activeChat.tenantAvatar}
                    alt=''
                    className='w-full h-full object-cover rounded-xl'
                  />
                ) : (
                  <span>{activeChat.tenantName.charAt(0)}</span>
                )}
              </div>
            )}

            <div className='flex flex-col min-w-0'>
              <div className='flex items-center gap-1.5'>
                <h2 className='text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none truncate'>
                  {activeChat.tenantName}
                </h2>
                <span className='hidden sm:inline-flex px-1 py-0.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[7px] font-black uppercase tracking-widest shrink-0'>
                  {activeChat.category === 'support'
                    ? activeChat.ticket?.id
                    : `#${activeChat.id.slice(0, 8)}`}
                </span>
              </div>
              <div className='flex items-center gap-1 mt-0.5'>
                <p className='text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] truncate max-w-[100px] md:max-w-none'>
                  {activeChat.property}
                </p>
                <span className='text-slate-300 dark:text-slate-800 text-[8px]'>•</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider truncate ${
                    activeChat.category === 'maintenance'
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : activeChat.category === 'finance'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : activeChat.category === 'support'
                          ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                          : 'bg-primary/10 text-primary'
                  }`}
                >
                  {activeChat.category === 'maintenance'
                    ? 'Manutenção'
                    : activeChat.category === 'finance'
                      ? 'Financeiro'
                      : activeChat.category === 'support'
                        ? 'Suporte'
                        : 'Geral'}
                </span>
              </div>

              {Object.values(typingUsers).some(Boolean) && (
                <div className='flex items-center gap-1 mt-0.5'>
                  <div className='flex items-center gap-0.5'>
                    <div className='w-0.5 h-0.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]' />
                    <div className='w-0.5 h-0.5 bg-primary rounded-full animate-bounce' />
                  </div>
                  <span className='text-[8px] text-primary font-black uppercase tracking-widest'>
                    Digitando
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowDetailsPanel(!showDetailsPanel)}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              showDetailsPanel
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                : 'bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            aria-label='Detalhes'
          >
            {showDetailsPanel ? (
              <X size={16} strokeWidth={2.5} />
            ) : (
              <FileText size={16} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      <div className='flex-1 flex flex-col min-w-0 min-h-0'>
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className='flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar'
        >
          {loadingMore && (
            <div className='flex justify-center mb-2'>
              <div className='bg-slate-100 dark:bg-white/5 text-slate-400 px-4 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.3em] border border-gray-100 dark:border-white/5'>
                Carregando...
              </div>
            </div>
          )}

          <div className='flex justify-center mb-3'>
            <div className='bg-slate-100 dark:bg-white/5 text-slate-400 px-4 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.3em] border border-gray-100 dark:border-white/5'>
              {activeChat.messages.length > 0 ? 'Histórico de Mensagens' : 'Nenhuma mensagem'}
            </div>
          </div>

          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const msg = messages[virtualItem.index];
              return (
                <div
                  key={msg.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <MessageBubble msg={msg} />
                </div>
              );
            })}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <div className='p-3 pb-16 md:pb-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 shrink-0'>
          <div className='flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1 items-center'>
            <span className='hidden md:inline-block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] self-center mr-1 shrink-0'>
              Sugestões:
            </span>

            {isAddingReply ? (
              <div className='flex items-center gap-1.5'>
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
                  className='h-7 px-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[9px] font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary/30 min-w-[80px]'
                />
                <button
                  onClick={() => setIsAddingReply(false)}
                  className='p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors'
                  aria-label='Cancelar'
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingReply(true)}
                className='p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shrink-0'
                title='Adicionar resposta rápida'
                aria-label='Adicionar resposta rápida'
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            )}

            <div className='h-3 w-px bg-gray-100 dark:bg-white/5 mx-1 shrink-0' />

            <div className='flex gap-1.5 overflow-x-auto hide-scrollbar pr-8'>
              {quickReplies.map((reply, i) => (
                <div key={i} className='relative group shrink-0'>
                  <button
                    onClick={() => handleSendMessage(undefined, reply)}
                    className='whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[8px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all shadow-sm'
                  >
                    {reply}
                  </button>
                  <button
                    onClick={() => onRemoveQuickReply?.(i)}
                    className='absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md'
                    aria-label='Remover'
                  >
                    <X size={8} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => handleSendMessage(e)}
            className='flex gap-2 items-end max-w-[800px] mx-auto'
          >
            <button
              type='button'
              onClick={() => attachmentInputRef.current?.click()}
              className='p-2.5 text-slate-400 hover:text-primary transition-all bg-slate-50 dark:bg-white/5 rounded-xl border-2 border-transparent active:scale-90 active:bg-slate-100'
              aria-label='Anexar arquivo'
            >
              <Paperclip size={16} strokeWidth={2.5} />
            </button>
            <input
              type='file'
              ref={attachmentInputRef}
              className='hidden'
              accept='image/*'
              onChange={handleFileUpload}
            />
            <div className='flex-1 bg-slate-50 dark:bg-black/40 rounded-[18px] border-2 border-gray-100 dark:border-white/10 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden flex items-center shadow-inner'>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='Mensagem...'
                className='w-full h-10 px-4 bg-transparent border-none focus:ring-0 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400'
              />
            </div>
            <button
              type='submit'
              disabled={!inputText.trim()}
              className='h-10 w-10 rounded-xl bg-slate-900 dark:bg-white disabled:bg-slate-100 dark:disabled:bg-white/5 text-white dark:text-slate-900 flex items-center justify-center shadow-md hover:scale-105 active:scale-90 transition-all shrink-0'
              aria-label='Enviar'
            >
              <Send size={16} strokeWidth={2.5} className={inputText.trim() ? 'ml-0.5' : ''} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
