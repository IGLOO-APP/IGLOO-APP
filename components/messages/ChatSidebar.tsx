import React from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  MessageSquare, 
  Clock, 
  AlertCircle,
  Plus,
  HelpCircle, 
  ChevronRight, 
  User, 
  ChevronDown 
} from 'lucide-react';
import { ChatThread } from '../../services/messageService';

interface ChatSidebarProps {
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  propertyFilter: string;
  setPropertyFilter: (property: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: any) => void;
  filteredChats: ChatThread[];
  chats: ChatThread[];
  setShowFAQManager: (show: boolean) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
  onNewChat: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  handleMouseUp: () => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  isDragging: boolean;
}

export const ChatSidebar = React.memo(({
  activeChatId,
  setActiveChatId,
  searchTerm,
  setSearchTerm,
  showAdvancedFilters,
  setShowAdvancedFilters,
  priorityFilter,
  setPriorityFilter,
  propertyFilter,
  setPropertyFilter,
  activeFilter,
  setActiveFilter,
  filteredChats,
  chats,
  setShowFAQManager,
  getCategoryIcon,
  onNewChat,
  scrollRef,
  handleMouseDown,
  handleMouseLeave,
  handleMouseUp,
  handleMouseMove,
  isDragging,
}: ChatSidebarProps) => {
  return (
    <div
      className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 dark:border-white/5 bg-surface-light dark:bg-surface-dark transition-transform duration-300 absolute md:relative z-20 h-full ${activeChatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
    >
      <div className='p-4 border-b border-gray-200 dark:border-white/5 space-y-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-bold text-slate-900 dark:text-white'>Central de Mensagens</h1>
          <div className='flex items-center gap-1'>
            <button
              onClick={onNewChat}
              className='p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-primary transition-all active:scale-95'
              title='Nova Conversa'
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-xl transition-all ${showAdvancedFilters ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400'}`}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowFAQManager(true)}
          className='w-full p-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group'
        >
          <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all'>
            <HelpCircle size={20} />
          </div>
          <div className='text-left'>
            <p className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest'>Editar FAQs</p>
            <p className='text-[10px] text-slate-500'>Gerenciar dúvidas dos inquilinos</p>
          </div>
          <ChevronRight size={16} className='ml-auto text-slate-400' />
        </button>

        {/* Search */}
        <div className='relative'>
          <input
            type='text'
            placeholder='Buscar...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full h-10 pl-10 pr-4 rounded-xl bg-gray-100 dark:bg-black/20 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all'
          />
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
        </div>

        {showAdvancedFilters && (
          <div className='p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 space-y-4 animate-slideDown'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                Prioridade
              </label>
              <div className='relative'>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className='w-full pl-4 pr-10 py-2.5 bg-white dark:bg-white/5 border border-transparent rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer'
                  style={{ colorScheme: 'dark' }}
                >
                  <option value='Todos'>Todas as Prioridades</option>
                  <option value='Urgent'>Urgente</option>
                  <option value='High'>Alta</option>
                  <option value='Medium'>Média</option>
                  <option value='Low'>Baixa</option>
                </select>
                <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' size={14} />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                Imóvel
              </label>
              <div className='relative'>
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className='w-full pl-4 pr-10 py-2.5 bg-white dark:bg-white/5 border border-transparent rounded-xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer'
                  style={{ colorScheme: 'dark' }}
                >
                  <option value='Todos'>Todos os Imóveis</option>
                  {Array.from(new Set(chats.map(c => c.property))).map(prop => (
                    <option key={prop} value={prop}>{prop}</option>
                  ))}
                </select>
                <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' size={14} />
              </div>
            </div>
            
            <button 
              onClick={() => {
                setPriorityFilter('Todos');
                setPropertyFilter('Todos');
                setActiveFilter('all');
                setSearchTerm('');
              }}
              className='w-full py-2.5 text-[10px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all uppercase tracking-widest'
            >
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-2 overflow-x-auto hide-scrollbar pb-1 cursor-grab active:cursor-grabbing select-none ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          {[
            { id: 'all', label: 'Tudo' },
            { id: 'urgent', label: 'Urgentes' },
            { id: 'maintenance', label: 'Chamados' },
            { id: 'finance', label: 'Financeiro' },
            { id: 'general', label: 'Geral' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => !isDragging && setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                activeFilter === f.id
                  ? f.id === 'urgent' 
                    ? 'bg-red-500 text-white border-transparent' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                  : 'bg-white dark:bg-surface-dark text-slate-500 border-gray-200 dark:border-white/10 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-2 space-y-1'>
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChatId(chat.id)}
            className={`group p-3 rounded-xl flex items-start gap-3 cursor-pointer transition-all border border-transparent ${
              activeChatId === chat.id
                ? 'bg-primary/10 dark:bg-primary/20 border-primary/20'
                : 'hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <div className='relative shrink-0 mt-1'>
              {chat.tenantAvatar ? (
                <div
                  className='w-12 h-12 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700'
                  style={{ backgroundImage: `url(${chat.tenantAvatar})` }}
                ></div>
              ) : (
                <div className='w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400'>
                  <User size={24} />
                </div>
              )}
              {chat.ticket && (
                <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-surface-dark rounded-full flex items-center justify-center shadow-sm'>
                  {getCategoryIcon(chat.category)}
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex justify-between items-baseline mb-0.5'>
                <h3
                  className={`text-sm truncate flex-1 min-w-0 pr-2 ${chat.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}
                >
                  {chat.tenantName}
                </h3>
                <span className='text-[10px] text-slate-400 shrink-0 font-medium'>
                  {chat.lastMessageTime}
                </span>
              </div>
              <p className='text-[10px] text-primary uppercase font-bold tracking-wider mb-0.5 truncate flex items-center gap-1'>
                {chat.ticket?.id || chat.property}
              </p>

              <div className='flex justify-between items-end gap-2'>
                <p
                  className={`text-xs truncate flex-1 min-w-0 ${chat.unreadCount > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  {chat.messages.length > 0 && chat.messages[chat.messages.length - 1].sender === 'me' && (
                    <span className='mr-1'>Você:</span>
                  )}
                  {chat.lastMessage}
                </p>
                {chat.unreadCount > 0 && (
                  <div className='w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full shrink-0 mb-0.5'>
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
