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
  scrollRef: React.RefObject<HTMLDivElement>;
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
      className={`w-full md:w-72 lg:w-80 xl:w-96 flex flex-col border-r border-gray-200 dark:border-white/5 bg-surface-light dark:bg-surface-dark transition-transform duration-300 absolute md:relative z-20 h-full ${activeChatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
    >
      <div className='p-4 md:p-6 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark sticky top-0 z-30'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex flex-col'>
            <h1 className='text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter'>Igloo Chat</h1>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]'>Central de Comando</p>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={onNewChat}
              className='w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all'
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className='flex gap-2 mb-2'>
           <div className='relative flex-1'>
            <input
              type='text'
              placeholder='Buscar conversas...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-100 dark:bg-black/20 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner'
            />
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${showAdvancedFilters ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600'}`}
          >
            <Filter size={18} />
          </button>
        </div>

        {showAdvancedFilters && (
          <div className='p-4 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 space-y-4 animate-slideDown mb-4'>
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
                  <option value='all'>Todas as Prioridades</option>
                  <option value='urgent'>Urgente</option>
                  <option value='high'>Alta</option>
                  <option value='medium'>Média</option>
                  <option value='low'>Baixa</option>
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
                  <option value='all'>Todos os Imóveis</option>
                  {Array.from(new Set(chats.map(c => c.property))).map(prop => (
                    <option key={prop} value={prop}>{prop}</option>
                  ))}
                </select>
                <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none' size={14} />
              </div>
            </div>
            
            <button 
              onClick={() => {
                setPriorityFilter('all');
                setPropertyFilter('all');
                setActiveFilter('all');
                setSearchTerm('');
              }}
              className='w-full py-2.5 text-[10px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all uppercase tracking-widest'
            >
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Categories Navigation - Mobile Sticky Style */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 cursor-grab active:cursor-grabbing select-none ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          {[
            { id: 'all', label: 'Tudo', icon: <MessageSquare size={12} /> },
            { id: 'urgent', label: 'Urgentes', icon: <AlertCircle size={12} /> },
            { id: 'maintenance', label: 'Chamados', icon: <Clock size={12} /> },
            { id: 'finance', label: 'Financeiro', icon: <User size={12} /> },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => !isDragging && setActiveFilter(f.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === f.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-600'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChatId(chat.id)}
            className={`group p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${
              activeChatId === chat.id
                ? 'bg-white dark:bg-white/10 border-primary shadow-xl shadow-primary/5'
                : 'bg-white dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/10'
            }`}
          >
            <div className='relative shrink-0'>
              <div className='w-14 h-14 rounded-2xl bg-slate-200 dark:bg-white/10 overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all'>
                {chat.tenantAvatar ? (
                  <img src={chat.tenantAvatar} alt='' className='w-full h-full object-cover' />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-slate-400'>
                    <User size={28} />
                  </div>
                )}
              </div>
              <div className='absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-dark shadow-[0_0_8px_rgba(16,185,129,0.5)]'></div>
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex justify-between items-start mb-0.5'>
                <h3 className={`text-sm md:text-base truncate ${chat.unreadCount > 0 ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-700 dark:text-slate-300'}`}>
                  {chat.tenantName}
                </h3>
                <span className='text-[10px] text-slate-400 font-black uppercase tracking-tighter whitespace-nowrap ml-2'>
                  {chat.lastMessageTime}
                </span>
              </div>
              
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 truncate ${
                chat.category === 'maintenance' ? 'text-orange-500' :
                chat.category === 'finance' ? 'text-emerald-500' :
                'text-primary'
              }`}>
                {chat.ticket?.title || chat.property}
              </p>

              <div className='flex justify-between items-center gap-2'>
                <p className={`text-xs truncate flex-1 ${chat.unreadCount > 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {chat.lastMessage}
                </p>
                {chat.unreadCount > 0 && (
                  <div className='px-2 h-5 min-w-[20px] bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg shadow-primary/20'>
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* FAQ Manager Trigger for Mobile */}
        <button
          onClick={() => setShowFAQManager(true)}
          className='w-full mt-6 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5 flex items-center justify-center gap-3 text-slate-400 hover:text-primary hover:border-primary/50 transition-all group'
        >
          <HelpCircle size={20} />
          <span className='text-[10px] font-black uppercase tracking-widest'>Gerenciar FAQ do Inquilino</span>
        </button>
      </div>
    </div>
  );
});
