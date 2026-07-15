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
    estimateSize: (index) => {
      const msg = messages[index];
      return msg?.sender === 'system' ? 160 : 64;
    },
    overscan: 8,
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
      className={`flex-1 min-w-0 flex flex-col absolute md:relative inset-0 md:inset-auto w-full md:w-auto h-full transition-transform duration-300 z-30 md:z-10 ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
    >
      <div className='h-14 px-4 flex items-center justify-between bg-background border-b border-border shrink-0 z-20 shadow-sm'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <button
            onClick={() => setActiveChatId(null)}
            className='p-1.5 -ml-1 rounded-xl hover:bg-accent text-muted-foreground md:hidden active:scale-95 transition-all'
            aria-label='Voltar'
          >
            <ChevronLeft size={16} />
          </button>

          <div className='flex items-center gap-2.5 flex-1 min-w-0'>
            {activeChat.category === 'support' ? (
              <div className='w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0'>
                <Shield size={16} />
              </div>
            ) : (
              <div
                className={`w-9 h-9 rounded-xl ${getAvatarColor(activeChat.tenantName)} flex items-center justify-center text-white font-semibold text-base shadow-sm shrink-0`}
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
                <h2 className='text-sm font-semibold text-foreground tracking-tight leading-none truncate'>
                  {activeChat.tenantName}
                </h2>
                <span className='hidden sm:inline-flex px-1 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-medium shrink-0'>
                  {activeChat.category === 'support'
                    ? activeChat.ticket?.id
                    : `#${activeChat.id.slice(0, 8)}`}
                </span>
              </div>
              <div className='flex items-center gap-1 mt-0.5'>
                <p className='text-xs text-muted-foreground/60 truncate max-w-[100px] md:max-w-none'>
                  {activeChat.property}
                </p>
                <span className='text-muted-foreground/30 text-xs'>&middot;</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${
                    activeChat.category === 'maintenance'
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : activeChat.category === 'finance'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : activeChat.category === 'support'
                          ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
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
                  <span className='text-[10px] text-primary font-medium'>
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
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
            aria-label='Detalhes'
          >
            <FileText size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className='flex-1 flex flex-col min-w-0 min-h-0'>
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className='flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar bg-muted/10'
        >
          {loadingMore && (
            <div className='flex justify-center mb-2'>
              <div className='text-muted-foreground px-4 py-1 rounded-full text-xs lg-card'>
                Carregando...
              </div>
            </div>
          )}

          <div className='flex justify-center mb-3'>
            <div className='text-muted-foreground px-4 py-1 rounded-full text-xs lg-card'>
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

        <div className='p-3 pb-24 md:pb-4 bg-background border-t border-border shrink-0 lg-card rounded-none border-x-0 border-b-0'>
          <div className='flex gap-2 overflow-x-auto hide-scrollbar mb-3 pb-1 items-center'>
            <span className='hidden md:inline-block text-xs text-muted-foreground self-center mr-1 shrink-0'>
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
                  className='h-7 px-2.5 rounded-xl text-xs font-medium text-foreground focus:ring-1 focus:ring-primary/30 min-w-[80px] bg-muted/20'
                />
                <button
                  onClick={() => setIsAddingReply(false)}
                  className='p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors'
                  aria-label='Cancelar'
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingReply(true)}
                className='p-1.5 rounded-xl text-primary transition-all shrink-0 bg-primary/10 hover:bg-foreground hover:text-background'
                title='Adicionar resposta rápida'
                aria-label='Adicionar resposta rápida'
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            )}

            <div className='h-3 w-px bg-border mx-1 shrink-0' />

            <div className='flex gap-1.5 overflow-x-auto hide-scrollbar pr-8'>
              {quickReplies.map((reply, i) => (
                <div key={i} className='relative group shrink-0'>
                  <button
                    onClick={() => handleSendMessage(undefined, reply)}
                    className='whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-foreground hover:text-background transition-all shadow-sm bg-muted/20'
                  >
                    {reply}
                  </button>
                  <button
                    onClick={() => onRemoveQuickReply?.(i)}
                    className='absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md'
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
              className='p-2.5 text-muted-foreground hover:text-primary transition-all hover:bg-muted/30 rounded-xl active:scale-90'
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
            <div className='flex-1 rounded-[18px] border border-border focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden flex items-center bg-muted/10'>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleSendMessage(e);
                  }
                }}
                placeholder='Mensagem... (Ctrl+Enter para enviar)'
                className='w-full h-10 px-4 bg-transparent border-none focus:ring-0 text-sm font-medium text-foreground placeholder:text-muted-foreground'
              />
            </div>
            <button
              type='submit'
              disabled={!inputText.trim()}
              className='h-10 w-10 rounded-xl bg-foreground disabled:bg-muted text-background flex items-center justify-center shadow-md hover:scale-105 active:scale-90 transition-all shrink-0'
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
