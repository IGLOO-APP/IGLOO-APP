import React from 'react';
import { HelpCircle, Filter, Megaphone, Plus, Shield, Trash2 } from 'lucide-react';
import { ChatSidebar } from '../components/messages/ChatSidebar';
import { ChatWindow } from '../components/messages/ChatWindow';
import { ContextPanel } from '../components/messages/ContextPanel';
import { FAQManager } from '../components/messages/FAQManager';
import { CategoryManager } from '../components/messages/CategoryManager';
import CreateAnnouncementModal from '../components/announcements/CreateAnnouncementModal';
import { CreateTicketModal } from '../components/support/CreateTicketModal';
import { TopBar } from '../components/layout/TopBar';
import { useOwnerMessages } from './owner/hooks/useOwnerMessages';

const OwnerMessages: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    activeChatId,
    setActiveChatId,
    inputText,
    setInputText,
    activeFilter,
    setActiveFilter,
    showCreateSupportModal,
    setShowCreateSupportModal,
    showDetailsPanel,
    setShowDetailsPanel,
    activeRightTab,
    setActiveRightTab,
    showFAQManager,
    setShowFAQManager,
    showCategoryManager,
    setShowCategoryManager,
    editingFaq,
    setEditingFaq,
    newFaq,
    setNewFaq,
    showAnnouncementModal,
    setShowAnnouncementModal,
    showAdvancedFilters,
    setShowAdvancedFilters,
    priorityFilter,
    setPriorityFilter,
    propertyFilter,
    setPropertyFilter,
    isStatusLocked,
    setIsStatusLocked,
    chats,
    loading,
    availableTenants,
    faqs,
    categories,
    properties,
    loadingMore,
    typingUsers,
    quickReplies,
    messagesEndRef,
    attachmentInputRef,
    scrollRef,
    isDragging,
    filteredChats,
    activeChat,
    handleAddQuickReply,
    handleRemoveQuickReply,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    loadMoreMessages,
    handleSaveCategory,
    handleDeleteCategory,
    handleSaveFAQ,
    handleDeleteFAQ,
    toggleFAQStatus,
    onSendMessage,
    handleFileUpload,
    handleStatusChange,
    handleSelectTenant,
    handleCreateSupportSubmit,
    getCategoryIcon,
    getIconComponent,
  } = useOwnerMessages();

  return (
    <div className='flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden relative transition-colors duration-300'>
      <div className={`${activeChatId ? 'hidden md:block' : 'block'} shrink-0`}>
        <TopBar title='Central de Mensagens' subtitle='Comunicação direta com locatários'>
          <div className='flex items-center gap-1.5 md:gap-2 flex-wrap sm:flex-nowrap shrink-0'>
            <button
              onClick={() => setShowFAQManager(true)}
              className='flex items-center justify-center gap-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-2 py-1.5 rounded-xl font-bold text-[10px] transition-all active:scale-95 shrink-0'
              title='Gerenciar FAQs'
            >
              <HelpCircle size={12} className='text-primary' />
              <span>FAQs</span>
            </button>

            <button
              onClick={() => setShowCategoryManager(true)}
              className='flex items-center justify-center gap-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-2 py-1.5 rounded-xl font-bold text-[10px] transition-all active:scale-95 shrink-0'
              title='Gerenciar Categorias'
            >
              <Filter size={12} className='text-orange-500' />
              <span>Categorias</span>
            </button>

            <button
              onClick={() => setShowAnnouncementModal(true)}
              className='flex items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white px-2.5 py-1.5 rounded-xl font-bold text-[10px] shadow-md shadow-indigo-500/20 transition-all active:scale-95 shrink-0'
              title='Novo Comunicado'
            >
              <Megaphone size={12} />
              <span>Comunicado</span>
            </button>
          </div>
        </TopBar>
      </div>

      {loading && (
        <div className='absolute inset-0 z-[60] bg-white/80 dark:bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center'>
          <div className='w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4'></div>
          <p className='text-sm font-bold text-slate-900 dark:text-white'>
            Carregando mensagens...
          </p>
        </div>
      )}

      <div className='flex flex-1 overflow-hidden relative min-h-0 bg-white dark:bg-background-dark'>
        <ChatSidebar
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          propertyFilter={propertyFilter}
          setPropertyFilter={setPropertyFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          filteredChats={filteredChats}
          chats={chats}
          getCategoryIcon={getCategoryIcon}
          availableTenants={availableTenants}
          handleSelectTenant={handleSelectTenant}
          scrollRef={scrollRef}
          handleMouseDown={handleMouseDown}
          handleMouseLeave={handleMouseLeave}
          handleMouseUp={handleMouseUp}
          handleMouseMove={handleMouseMove}
          isDragging={isDragging}
          setIsCreateSupportOpen={setShowCreateSupportModal}
        />

        {activeChat ? (
          <div className='flex-1 flex overflow-hidden min-h-0 h-full'>
            <ChatWindow
              activeChat={activeChat}
              setActiveChatId={setActiveChatId}
              setShowDetailsPanel={setShowDetailsPanel}
              showDetailsPanel={showDetailsPanel}
              activeRightTab={activeRightTab}
              setActiveRightTab={setActiveRightTab}
              messagesEndRef={messagesEndRef}
              quickReplies={quickReplies}
              onAddQuickReply={handleAddQuickReply}
              onRemoveQuickReply={handleRemoveQuickReply}
              handleSendMessage={onSendMessage}
              inputText={inputText}
              setInputText={setInputText}
              attachmentInputRef={attachmentInputRef}
              handleFileUpload={handleFileUpload}
              loadMoreMessages={loadMoreMessages}
              loadingMore={loadingMore}
              typingUsers={typingUsers}
            />

            {showDetailsPanel && (
              <>
                <div
                  className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden animate-fadeIn'
                  onClick={() => setShowDetailsPanel(false)}
                />
                <ContextPanel
                  activeChat={activeChat}
                  activeRightTab={activeRightTab}
                  setActiveRightTab={setActiveRightTab}
                  setShowDetailsPanel={setShowDetailsPanel}
                  isStatusLocked={isStatusLocked}
                  setIsStatusLocked={setIsStatusLocked}
                  onStatusChange={handleStatusChange}
                />
              </>
            )}
          </div>
        ) : (
          <div className='hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-black/20'>
            <div className='max-w-md space-y-3 flex flex-col items-center'>
              <h2 className='text-lg font-black text-slate-900 dark:text-white tracking-tighter'>
                Central de Mensagens Igloo
              </h2>
              <p className='text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed'>
                Gerencie todos os seus chamados de manutenção, dúvidas financeiras e conversas
                gerais em um só lugar.
                <span className='block mt-1 font-bold text-slate-700 dark:text-slate-300'>
                  Selecione um chat ao lado para começar.
                </span>
              </p>
              <button
                onClick={() => setShowCreateSupportModal(true)}
                className='mt-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-[9px] uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 flex items-center gap-1.5'
              >
                <Shield size={11} className='text-primary' />
                Precisa de ajuda? Suporte Técnico
              </button>
            </div>

            <div className='w-full max-w-4xl mt-8'>
              <div className='flex items-center justify-between mb-4 px-2'>
                <h3 className='text-[9px] font-black uppercase tracking-[0.3em] text-slate-400'>
                  Tipos de Chamados Ativos
                </h3>
                <button
                  onClick={() => setShowCategoryManager(true)}
                  className='flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all text-[9px] font-black uppercase tracking-widest'
                >
                  <Plus size={12} /> Adicionar
                </button>
              </div>

              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                {categories.map((cat) => {
                  const Icon = getIconComponent(cat.icon_name);
                  return (
                    <div
                      key={cat.id}
                      className='group relative p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-white/10 transition-all cursor-default'
                    >
                      <div className={`p-3 rounded-2xl ${cat.bg_class} ${cat.color_class}`}>
                        <Icon size={20} strokeWidth={2.5} />
                      </div>
                      <span className='text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white'>
                        {cat.name}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat.id);
                        }}
                        className='absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md'
                        title='Excluir categoria'
                      >
                        <Trash2 size={10} strokeWidth={3} />
                      </button>
                    </div>
                  );
                })}

                {categories.length === 0 && (
                  <div className='col-span-full p-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-white/5 rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center'>
                    Nenhuma categoria configurada
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <FAQManager
        show={showFAQManager}
        onClose={() => setShowFAQManager(false)}
        faqs={faqs}
        editingFaq={editingFaq}
        setEditingFaq={setEditingFaq}
        newFaq={newFaq}
        setNewFaq={setNewFaq}
        onSave={handleSaveFAQ}
        onDelete={handleDeleteFAQ}
        onToggleStatus={toggleFAQStatus}
      />

      <CategoryManager
        show={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        categories={categories}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />

      <CreateAnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        properties={properties}
        onSuccess={() => {
          setShowAnnouncementModal(false);
        }}
      />

      <CreateTicketModal
        isOpen={showCreateSupportModal}
        onClose={() => setShowCreateSupportModal(false)}
        onSubmit={handleCreateSupportSubmit}
      />
    </div>
  );
};

export default OwnerMessages;
