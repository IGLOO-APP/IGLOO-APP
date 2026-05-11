import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Trash2, Megaphone, AlertTriangle, Info, Clock, CheckCircle2, ChevronRight, Search, History, Copy, Eye } from 'lucide-react';
import { announcementService } from '../../services/announcementService';
import { OwnerAnnouncement } from '../../types';

interface AnnouncementsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId: string;
  onDuplicate?: (announcement: OwnerAnnouncement) => void;
}

const AnnouncementsHistoryModal: React.FC<AnnouncementsHistoryModalProps> = ({ isOpen, onClose, ownerId, onDuplicate }) => {
  const [announcements, setAnnouncements] = useState<OwnerAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<{id: string, viewers: any[]} | null>(null);
  const [loadingAudience, setLoadingAudience] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAllForOwner(ownerId);
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen, ownerId]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este comunicado? Esta ação não pode ser desfeita.')) return;
    try {
      await announcementService.delete(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      if (selectedAudience?.id === id) setSelectedAudience(null);
    } catch (error) {
      alert('Erro ao excluir comunicado.');
    }
  };

  const handleShowAudience = async (announcement: OwnerAnnouncement) => {
    if (selectedAudience?.id === announcement.id) {
      setSelectedAudience(null);
      return;
    }
    try {
      setLoadingAudience(true);
      const viewers = await announcementService.getAcknowledgments(announcement.id);
      setSelectedAudience({ id: announcement.id, viewers });
    } catch (error) {
      console.error('Error fetching audience:', error);
    } finally {
      setLoadingAudience(false);
    }
  };

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6'>
      <div className='fixed inset-0 bg-slate-900/80 backdrop-blur-md animate-fadeIn' onClick={onClose} />
      
      <div className='bg-white dark:bg-[#0A0C10] w-full max-w-4xl h-[95vh] sm:h-[85vh] rounded-t-[40px] sm:rounded-[40px] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden animate-scaleUp z-10 flex flex-col'>
        {/* Header Section */}
        <div className='px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5'>
          <div className='flex items-center gap-3 sm:gap-4'>
            <div className='w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xl'>
              <History size={20} className="sm:size-7" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className='text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight'>Gestão</h2>
              <p className='text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5 sm:mt-1'>{announcements.length} Comunicados</p>
            </div>
          </div>
          <button onClick={onClose} className='w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-colors text-slate-400'>
            <X size={20} sm:size={24} />
          </button>
        </div>

        <div className='flex-1 flex flex-col md:flex-row overflow-hidden relative'>
          {/* Main List Column */}
          <div className='flex-1 flex flex-col border-r border-gray-100 dark:border-white/5 overflow-hidden'>
            {/* Search Bar */}
            <div className='px-6 sm:px-10 py-4 sm:py-6'>
              <div className='relative group'>
                <Search size={16} className='absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors' />
                <input 
                  type="text" 
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl sm:rounded-2xl pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 ring-primary/10 transition-all'
                />
              </div>
            </div>

            {/* List */}
            <div className='flex-1 overflow-y-auto px-6 sm:px-10 pb-6 sm:pb-10 space-y-3 custom-scrollbar'>
              {loading ? (
                <div className='flex flex-col items-center justify-center h-full space-y-4'>
                  <div className='w-8 h-8 border-4 border-primary/20 border-t-primary animate-spin rounded-full' />
                  <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>Sincronizando...</p>
                </div>
              ) : filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((ann) => {
                  const isExpired = ann.expires_at && new Date(ann.expires_at) < new Date();
                  const isSelected = selectedAudience?.id === ann.id;
                  
                  return (
                    <div 
                      key={ann.id} 
                      className={`group relative bg-slate-50 dark:bg-white/5 rounded-2xl sm:rounded-3xl border transition-all ${
                        isSelected ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-transparent hover:border-slate-200 dark:hover:border-white/10'
                      }`}
                    >
                      <div className='p-4 sm:p-5 flex items-center gap-3 sm:gap-4'>
                        {/* Status Icon */}
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                          ann.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                          ann.type === 'maintenance' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {ann.type === 'info' && <Info size={14} className="sm:size-5" />}
                          {ann.type === 'maintenance' && <Clock size={14} className="sm:size-5" />}
                          {ann.type === 'warning' && <AlertTriangle size={14} className="sm:size-5" />}
                          {ann.type === 'event' && <CheckCircle2 size={14} className="sm:size-5" />}
                        </div>

                        {/* Title & Info */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex flex-wrap items-center gap-1.5 mb-0.5 sm:mb-1'>
                            <h4 className='text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight'>{ann.title}</h4>
                            <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-1 py-0.5 rounded-md ${
                              isExpired ? 'bg-slate-200 dark:bg-white/10 text-slate-400' : 'bg-emerald-500 text-white'
                            }`}>
                              {isExpired ? 'Expirado' : 'Ativo'}
                            </span>
                          </div>
                          <div className='flex items-center gap-2 sm:gap-3 text-[8px] sm:text-[10px] text-slate-400 font-bold'>
                            <span className='flex items-center gap-1'><Calendar size={10} /> {new Date(ann.created_at).toLocaleDateString('pt-BR')}</span>
                            <button 
                              onClick={() => handleShowAudience(ann)}
                              className={`flex items-center gap-1 hover:text-primary transition-colors ${isSelected ? 'text-primary' : ''}`}
                            >
                              <Users size={10} /> {ann.views_count} Leituras
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-0.5 sm:gap-1'>
                          <button 
                            onClick={() => onDuplicate?.(ann)}
                            className='w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all'
                            title="Duplicar"
                          >
                            <Copy size={14} className="sm:size-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(ann.id)}
                            className='w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all'
                            title="Excluir"
                          >
                            <Trash2 size={14} className="sm:size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className='h-full flex flex-col items-center justify-center text-center space-y-4'>
                  <Megaphone size={32} className='sm:size-12 text-slate-100 dark:text-white/5' />
                  <p className='text-[10px] font-black text-slate-300 uppercase tracking-widest'>Nenhum registro</p>
                </div>
              )}
            </div>
          </div>

          {/* Details Column (Audience) - Mobile Adaptive */}
          <div className={`
            absolute md:relative inset-0 md:inset-auto md:w-80 bg-white dark:bg-[#0A0C10] md:bg-slate-50/50 md:dark:bg-black/20 
            transition-all duration-500 z-20 flex flex-col 
            ${selectedAudience ? 'translate-x-0 opacity-100' : 'translate-x-full md:translate-x-10 opacity-0 pointer-events-none md:hidden'}
          `}>
            <div className='px-6 sm:px-8 py-6 sm:py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center'>
              <div className='flex items-center gap-3'>
                <button onClick={() => setSelectedAudience(null)} className='md:hidden w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-lg'><ChevronRight size={18} className="rotate-180" /></button>
                <h3 className='text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest'>Audiência</h3>
              </div>
              <button onClick={() => setSelectedAudience(null)} className='hidden md:block text-slate-400 hover:text-slate-900'><X size={16} /></button>
            </div>
            
            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
              {loadingAudience ? (
                <div className='flex justify-center py-10'><div className='w-6 h-6 border-2 border-primary/20 border-t-primary animate-spin rounded-full' /></div>
              ) : selectedAudience?.viewers.length ? (
                selectedAudience.viewers.map((viewer: any, idx: number) => (
                  <div key={idx} className='flex items-center gap-3 animate-fadeIn'>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden shrink-0 flex items-center justify-center'>
                      {viewer.profiles?.avatar_url ? (
                        <img src={viewer.profiles.avatar_url} alt="" className='w-full h-full object-cover' />
                      ) : (
                        <Users size={14} className='sm:size-4 text-slate-400' />
                      )}
                    </div>
                    <div className='min-w-0'>
                      <p className='text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate'>{viewer.profiles?.name || 'Inquilino'}</p>
                      <p className='text-[8px] sm:text-[9px] font-medium text-slate-400 flex items-center gap-1 uppercase tracking-tighter'>
                        <Clock size={8} /> {new Date(viewer.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-10 space-y-2 opacity-30'>
                  <Eye size={24} className='mx-auto' />
                  <p className='text-[10px] font-black uppercase tracking-widest'>Sem leituras</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsHistoryModal;
