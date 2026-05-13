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
  getCategoryIcon: (category: string) => React.ReactNode;
  availableTenants: any[];
  handleSelectTenant: (tenantId: string) => void;
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
  getCategoryIcon,
  availableTenants,
  handleSelectTenant,
  scrollRef,
  handleMouseDown,
  handleMouseLeave,
  handleMouseUp,
  handleMouseMove,
  isDragging,
}: ChatSidebarProps) => {
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
      className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark transition-transform duration-300 absolute md:relative z-20 h-full min-h-0 ${activeChatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
    >
      <div className='p-6 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark sticky top-0 z-30'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex flex-col'>
            <h1 className='text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight'>Mensagens</h1>
            <p className='text-xs font-medium text-slate-400'>Central de comunicação</p>
          </div>
        </div>


        <div className='flex gap-2 mb-4'>
           <div className='relative flex-1'>
            <input
              type='text'
              placeholder='Buscar por nome ou imóvel...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-100 dark:bg-black/20 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all'
            />
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${showAdvancedFilters ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 border border-gray-100 dark:border-white/5'}`}
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

        {/* Categories Navigation */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-2 overflow-x-auto hide-scrollbar pb-3 cursor-grab active:cursor-grabbing select-none mb-4 ${isDragging ? 'cursor-grabbing' : ''}`}
        >
          {[
            { id: 'all', label: 'Tudo', icon: <MessageSquare size={12} /> },
            { id: 'urgent', label: 'Urgentes', icon: <AlertCircle size={12} /> },
            { id: 'maintenance', label: 'Chamados', icon: <Clock size={12} /> },
            { id: 'finance', label: 'Financeiro', icon: <User size={12} /> },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeFilter === filter.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
        </div>

        </div>

      <div className='flex-1 overflow-y-auto custom-scrollbar min-h-0'>
        {/* Recommended Contacts Section (Search Mode) */}
        {searchTerm && (
          <div className='mb-2'>
            {availableTenants
              .filter(tenant => {
                const isAlreadyInChat = chats.some(c => c.tenantName === tenant.name);
                const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                     tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
                return !isAlreadyInChat && matchesSearch;
              })
              .map(tenant => (
                <div
                  key={tenant.id}
                  onClick={() => handleSelectTenant(tenant.id)}
                  className='px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-primary/5 border-b border-gray-100 dark:border-white/5 group animate-fadeInLeft'
                >
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(tenant.name)} flex items-center justify-center text-white font-bold text-sm shadow-sm opacity-80 group-hover:opacity-100 transition-all`}>
                    {tenant.image ? (
                      <img src={tenant.image} alt='' className='w-full h-full object-cover rounded-full' />
                    ) : (
                      <span>{tenant.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors'>
                        {tenant.name}
                      </h4>
                      <span className='px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest'>Novo</span>
                    </div>
                    <p className='text-[10px] text-slate-400 font-medium truncate'>{tenant.email}</p>
                  </div>
                  <div className='w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all'>
                    <Plus size={14} strokeWidth={3} />
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Existing Chats Section */}
        {searchTerm && filteredChats.length > 0 && (
          <div className='px-6 py-3 bg-slate-50 dark:bg-white/[0.02]'>
            <span className='text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]'>Conversas Ativas</span>
          </div>
        )}

        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChatId(chat.id)}
            className={`group px-6 py-5 flex items-start gap-4 cursor-pointer transition-all relative border-b border-gray-100 dark:border-white/5 ${
              activeChatId === chat.id
                ? 'bg-slate-50 dark:bg-white/5'
                : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
            }`}
          >
            {/* Indicador de não lido — Ajuste 2 */}
            {chat.unreadCount > 0 && (
              <div className='absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]'></div>
            )}
            
            {activeChatId === chat.id && (
              <div className='absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'></div>
            )}
            
            {/* Avatar Profissional com Iniciais — Ajuste 2 */}
            <div className='relative shrink-0 mt-1'>
              <div className={`w-12 h-12 rounded-full ${getAvatarColor(chat.tenantName)} flex items-center justify-center text-white font-bold text-lg shadow-sm border border-white/20`}>
                {chat.tenantAvatar ? (
                  <img src={chat.tenantAvatar} alt='' className='w-full h-full object-cover rounded-full' />
                ) : (
                  <span>{chat.tenantName.charAt(0)}</span>
                )}
              </div>
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex justify-between items-baseline mb-1'>
                <h3 className={`text-sm truncate tracking-tight ${chat.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                  {chat.tenantName}
                </h3>
                <span className='text-[10px] text-slate-400 font-medium opacity-80'>
                  {chat.lastMessageTime === 'AGORA' ? 'Recém' : chat.lastMessageTime}
                </span>
              </div>
              
              {/* Labels Legíveis — Ajuste 2 */}
              <div className='flex items-center gap-2 mb-2'>
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                  chat.category === 'maintenance' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                  chat.category === 'finance' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  'bg-primary/10 text-primary'
                }`}>
                   {chat.category === 'maintenance' ? 'Manutenção' : chat.category === 'finance' ? 'Financeiro' : 'Geral'}
                </span>
                <p className='text-[10px] font-medium text-slate-400 truncate'>
                  {chat.property}
                </p>
              </div>

              <div className='flex justify-between items-end gap-3'>
                <div className='flex-1 min-w-0'>
                  <p className={`text-[13px] leading-snug truncate ${chat.unreadCount > 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className='px-2 py-0.5 min-w-[18px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center rounded shadow-lg'>
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
