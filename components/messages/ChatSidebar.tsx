import React from 'react';
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  AlertCircle,
  Plus,
  User,
  ChevronDown,
  Shield,
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
  activeFilter: 'all' | 'maintenance' | 'finance' | 'general' | 'urgent' | 'support';
  setActiveFilter: (
    filter: 'all' | 'maintenance' | 'finance' | 'general' | 'urgent' | 'support'
  ) => void;
  filteredChats: ChatThread[];
  chats: ChatThread[];
  getCategoryIcon: (category: string) => React.ReactNode;
  availableTenants: { id: string; name: string; avatar_url?: string; email?: string }[];
  handleSelectTenant: (tenantId: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  handleMouseUp: () => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  isDragging: boolean;
  setIsCreateSupportOpen?: (open: boolean) => void;
  loading?: boolean;
}

export const ChatSidebar = React.memo(
  ({
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
    availableTenants,
    handleSelectTenant,
    scrollRef,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    isDragging,
    setIsCreateSupportOpen,
    loading = false,
  }: ChatSidebarProps) => {
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
        className={`w-full md:w-64 lg:w-72 shrink-0 flex flex-col border-r border-border text-foreground transition-transform duration-300 absolute md:relative z-20 h-full min-h-0 ${activeChatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
      >
        <div className='p-4 border-b border-border bg-background sticky top-0 z-30 lg-card rounded-none border-x-0 border-t-0'>
          <div className='flex gap-2 mb-3'>
            <div className='relative flex-1'>
              <input
                type='text'
                placeholder='Buscar conversa...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full h-10 pl-10 pr-3 rounded-2xl text-xs text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all lg-card'
              />
              <Search
                className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'
                size={15}
              />
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-90 ${showAdvancedFilters ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground lg-card'}`}
            >
              <Filter size={16} />
            </button>
          </div>

          {showAdvancedFilters && (
            <div className='p-3 rounded-2xl space-y-3 animate-slideDown mb-3 lg-card'>
              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-muted-foreground px-1'>
                  Prioridade
                </label>
                <div className='relative'>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className='w-full pl-3 pr-9 py-2 rounded-xl text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer lg-card'
                  >
                    <option value='all'>Todas as Prioridades</option>
                    <option value='urgent'>Urgente</option>
                    <option value='high'>Alta</option>
                    <option value='medium'>Média</option>
                    <option value='low'>Baixa</option>
                  </select>
                  <ChevronDown
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none'
                    size={12}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-medium text-muted-foreground px-1'>
                  Imóvel
                </label>
                <div className='relative'>
                  <select
                    value={propertyFilter}
                    onChange={(e) => setPropertyFilter(e.target.value)}
                    className='w-full pl-3 pr-9 py-2 rounded-xl text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer lg-card'
                  >
                    <option value='all'>Todos os Imóveis</option>
                    {Array.from(new Set(chats.map((c) => c.property))).map((prop) => (
                      <option key={prop} value={prop}>
                        {prop}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none'
                    size={12}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setPriorityFilter('all');
                  setPropertyFilter('all');
                  setActiveFilter('all');
                  setSearchTerm('');
                }}
                className='w-full py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all lg-card'
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
            className={`flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5 cursor-grab active:cursor-grabbing select-none mb-3 ${isDragging ? 'cursor-grabbing' : ''}`}
          >
            {[
              { id: 'all' as const, label: 'Tudo', icon: <MessageSquare size={12} /> },
              { id: 'support' as const, label: 'Suporte', icon: <Shield size={12} /> },
              { id: 'urgent' as const, label: 'Urgentes', icon: <AlertCircle size={12} /> },
              { id: 'maintenance' as const, label: 'Manutenção', icon: <Clock size={12} /> },
              { id: 'finance' as const, label: 'Financeiro', icon: <User size={12} /> },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                  activeFilter === filter.id
                    ? 'bg-foreground text-background shadow-md'
                    : 'text-muted-foreground lg-card'
                }`}
              >
                {filter.icon} {filter.label}
              </button>
            ))}
          </div>

          {activeFilter === 'support' && setIsCreateSupportOpen && (
            <div className='px-1 mb-1.5'>
              <button
                onClick={() => setIsCreateSupportOpen(true)}
                className='w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 hover:brightness-110'
              >
                <Plus size={12} strokeWidth={3} />
                Novo Chamado
              </button>
            </div>
          )}
        </div>

        <div className='flex-1 overflow-y-auto custom-scrollbar min-h-0 pb-20 md:pb-0'>
          {loading ? (
            <div className='p-4 space-y-4'>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className='flex items-start gap-3 animate-pulse'>
                  <div className='w-10 h-10 rounded-full bg-muted shrink-0' />
                  <div className='flex-1 space-y-2'>
                    <div className='flex justify-between'>
                      <div className='h-3 w-24 bg-muted rounded' />
                      <div className='h-3 w-8 bg-muted rounded' />
                    </div>
                    <div className='flex gap-1.5'>
                      <div className='h-4 w-16 bg-muted rounded' />
                      <div className='h-4 w-20 bg-muted rounded' />
                    </div>
                    <div className='h-3 w-full bg-muted rounded' />
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <>
          {/* Recommended Contacts Section (Search Mode) */}
          {searchTerm && (
            <div className='mb-1.5'>
              {availableTenants
                .filter((tenant) => {
                  const isAlreadyInChat = chats.some((c) => c.tenantName === tenant.name);
                  const matchesSearch =
                    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (tenant.email || '').toLowerCase().includes(searchTerm.toLowerCase());
                  return !isAlreadyInChat && matchesSearch;
                })
                .map((tenant) => (
                  <div
                    key={tenant.id}
                    onClick={() => handleSelectTenant(tenant.id)}
                    className='px-4 py-3 flex items-center gap-3 cursor-pointer group lg-card rounded-none border-b'
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${getAvatarColor(tenant.name)} flex items-center justify-center text-white font-semibold text-xs shadow-sm opacity-80 group-hover:opacity-100 transition-all`}
                    >
                      {tenant.avatar_url ? (
                        <img
                          src={tenant.avatar_url}
                          alt=''
                          className='w-full h-full object-cover rounded-full'
                        />
                      ) : (
                        <span>{tenant.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <h4 className='text-xs font-medium text-foreground group-hover:text-primary transition-colors'>
                          {tenant.name}
                        </h4>
                        <span className='px-1 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium'>
                          Novo
                        </span>
                      </div>
                      <p className='text-xs text-muted-foreground truncate'>
                        {tenant.email}
                      </p>
                    </div>
                    <div className='w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all'>
                      <Plus size={11} strokeWidth={3} />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Existing Chats Section */}
          {searchTerm && filteredChats.length > 0 && (
            <div className='px-4 py-2 lg-card rounded-none border-x-0 border-t-0'>
              <span className='text-xs font-medium text-muted-foreground'>
                Conversas Ativas
              </span>
            </div>
          )}

          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`group px-4 py-3 flex items-start gap-3 cursor-pointer transition-all relative lg-card rounded-none border-b ${
                activeChatId === chat.id
                  ? 'bg-accent/30'
                  : ''
              }`}
            >
              {/* Indicador de não lido */}
              {chat.unreadCount > 0 && (
                <div className='absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]'></div>
              )}

              {activeChatId === chat.id && (
                <div className='absolute left-0 top-0 bottom-0 w-0.5 bg-primary'></div>
              )}

              {/* Avatar Profissional com Iniciais */}
              <div className='relative shrink-0'>
                {chat.category === 'support' ? (
                  <div className='w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-sm'>
                    <Shield size={16} />
                  </div>
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full ${getAvatarColor(chat.tenantName)} flex items-center justify-center text-white font-semibold text-base shadow-sm`}
                  >
                    {chat.tenantAvatar ? (
                      <img
                        src={chat.tenantAvatar}
                        alt=''
                        className='w-full h-full object-cover rounded-full'
                      />
                    ) : (
                      <span>{chat.tenantName.charAt(0)}</span>
                    )}
                  </div>
                )}
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex justify-between items-baseline mb-0.5'>
                  <h3
                    className={`text-xs truncate tracking-tight ${chat.unreadCount > 0 ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}
                  >
                    {chat.tenantName}
                  </h3>
                  <span className='text-[10px] text-muted-foreground/60'>
                    {chat.lastMessageTime === 'AGORA' ? 'Recém' : chat.lastMessageTime}
                  </span>
                </div>

                {/* Labels Legíveis */}
                <div className='flex items-center gap-1.5 mb-1'>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      chat.category === 'maintenance'
                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        : chat.category === 'finance'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : chat.category === 'support'
                            ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                            : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {chat.category === 'maintenance'
                      ? 'Manutenção'
                      : chat.category === 'finance'
                        ? 'Financeiro'
                        : chat.category === 'support'
                          ? 'Suporte'
                          : 'Geral'}
                  </span>
                  <p className='text-xs text-muted-foreground/60 truncate'>{chat.property}</p>
                </div>

                <div className='flex justify-between items-end gap-2'>
                  <div className='flex-1 min-w-0'>
                    <p
                      className={`text-xs leading-snug truncate ${chat.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground/70'}`}
                    >
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className='px-1.5 py-0.5 min-w-[16px] bg-foreground text-background text-[10px] font-semibold flex items-center justify-center rounded shadow-sm'>
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

            {!loading && filteredChats.length === 0 && !searchTerm && (
              <div className='flex flex-col items-center justify-center py-12 px-6 text-center lg-card rounded-none border-x-0 border-b-0 mx-2 mt-2'>
                <MessageSquare size={28} className='text-muted-foreground/30 mb-3' />
                <p className='text-sm font-medium text-muted-foreground mb-1'>
                  Nenhuma conversa ativa
                </p>
                <p className='text-xs text-muted-foreground/60'>
                  Selecione um inquilino acima para iniciar
                </p>
              </div>
            )}

            {!loading && filteredChats.length === 0 && searchTerm && (
              <div className='flex flex-col items-center justify-center py-12 px-6 text-center lg-card rounded-none border-x-0 border-b-0 mx-2 mt-2'>
                <Search size={24} className='text-muted-foreground/30 mb-3' />
                <p className='text-sm font-medium text-muted-foreground'>
                  Nenhum resultado para "{searchTerm}"
                </p>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    );
  }
);
