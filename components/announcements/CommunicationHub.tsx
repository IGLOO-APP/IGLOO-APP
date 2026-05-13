import React, { useState, useEffect } from 'react';
import { Megaphone, Users, CheckCircle2, ChevronRight, Plus, History, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { announcementService } from '../../services/announcementService';
import { OwnerAnnouncement } from '../../types';
import AnnouncementsHistoryModal from './AnnouncementsHistoryModal';

interface CommunicationHubProps {
  onNewAnnouncement?: () => void;
  onDuplicate?: (announcement: OwnerAnnouncement) => void;
  tenantPropertyId?: string;
  condoName?: string;
}

const CommunicationHub: React.FC<CommunicationHubProps> = ({ onNewAnnouncement, onDuplicate, tenantPropertyId, condoName }) => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<OwnerAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPreviews, setShowPreviews] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    if (isHovered) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / 3000) * 100, 100);
        setHoverProgress(progress);
      }, 10);

      timer = setTimeout(() => {
        setShowPreviews(true);
      }, 3000);
    } else {
      setShowPreviews(false);
      setHoverProgress(0);
    }
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isHovered]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const data = user.role === 'owner' 
        ? await announcementService.getForOwner(user.id)
        : await announcementService.getForTenant(user.id, tenantPropertyId, condoName);
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAcknowledge = async (id: string) => {
    if (!user || user.role !== 'tenant') return;
    try {
      await announcementService.acknowledge(id, user.id);
      fetchData();
    } catch (error) {
      console.error('Error acknowledging:', error);
    }
  };

  if (loading) return (
    <div className='w-full h-full bg-slate-900/50 animate-pulse rounded-[32px] border border-white/5' />
  );

  const current = announcements[currentIndex];
  const isOwner = user?.role === 'owner';
  
  if (announcements.length === 0 && !isOwner) return null;

  return (
    <div 
      className='relative group h-full cursor-default'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        // Toggle on mobile/click if not already expanded
        if (showPreviews) setShowPreviews(false);
        else if (isHovered) setShowPreviews(true);
      }}
    >
      <div className='bg-white dark:bg-surface-dark h-full rounded-[24px] sm:rounded-[32px] p-3 sm:p-4 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative overflow-hidden'>
        {/* Progress Bar (Visible on hover) */}
        <div 
          className='absolute top-0 left-0 h-[2px] bg-primary transition-all duration-75 z-30' 
          style={{ width: `${hoverProgress}%`, opacity: isHovered && !showPreviews ? 1 : 0 }}
        />

        {/* Background Icon (HeroCard Pattern) */}
        <div className='absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity text-primary pointer-events-none'>
          <Megaphone className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>

        {/* Header Section Compact */}
        <div className='flex items-center justify-between mb-2 relative z-20'>
          <div className='flex items-center gap-2'>
            <div className='p-1.5 rounded-lg bg-primary/10 dark:bg-white/5'>
              <Megaphone className='w-3 h-3 text-primary' />
            </div>
            <div>
              <p className='text-slate-500 dark:text-slate-400 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] leading-none'>
                Governance Hub
              </p>
              <h3 className='text-[10px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mt-0.5'>
                Comunicações
              </h3>
            </div>
          </div>
          
          <div className='flex items-center gap-2'>
            {isOwner && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onNewAnnouncement?.();
                }}
                className='w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-white/40 transition-all'
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <div className={`w-1.5 h-1.5 rounded-full ${announcements.some(a => a.is_urgent) ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className='flex-1 relative z-20 overflow-hidden min-h-[30px] sm:min-h-[40px] flex items-center'>
          {!isOwner ? (
            /* Tenant Marquee Mode */
            <div className="w-full overflow-hidden whitespace-nowrap py-2 relative">
              <div className="flex animate-marquee hover:pause-marquee gap-12 items-center">
                {announcements.length > 0 ? (
                  /* Double the list to ensure seamless scrolling */
                  [...announcements, ...announcements].map((ann, idx) => (
                    <div 
                      key={`${ann.id}-${idx}`}
                      className="flex items-center gap-3 shrink-0 cursor-pointer"
                      onClick={() => {
                        setCurrentIndex(idx % announcements.length);
                        setShowPreviews(true);
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full ${ann.is_urgent ? 'bg-red-500 animate-pulse' : 'bg-primary'}`} />
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        {ann.title}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                        • {ann.content.slice(0, 50)}...
                      </span>
                    </div>
                  ))
                ) : (
                  <div className='w-full text-center opacity-30'>
                    <p className='text-[10px] font-black uppercase tracking-widest'>Sem avisos ativos</p>
                  </div>
                )}
              </div>
              
              {/* Fade masks for the marquee edges */}
              <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white dark:from-surface-dark to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white dark:from-surface-dark to-transparent z-10 pointer-events-none" />
            </div>
          ) : (
            /* Owner Static List Mode (unchanged) */
            <div className={`w-full transition-all duration-1000 ${showPreviews ? 'opacity-0 -translate-y-4 scale-95 pointer-events-none' : 'opacity-100'}`}>
              {announcements.length > 0 ? (
                <div className='space-y-2 sm:space-y-3 mt-1'>
                  {announcements.slice(0, 3).map((ann, idx) => (
                    <div 
                      key={ann.id} 
                      className='flex items-start gap-2 sm:gap-3 group/item cursor-pointer' 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                    >
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full transition-all shrink-0 ${
                        idx === currentIndex 
                          ? (ann.is_urgent ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]')
                          : 'bg-slate-200 dark:bg-white/10'
                      }`} />
                      <div className='flex-1 border-b border-gray-100 dark:border-white/5 pb-2 group-last/item:border-none'>
                        <div className='flex justify-between items-center gap-2'>
                          <h4 className={`text-[10px] sm:text-[11px] font-bold transition-colors line-clamp-1 ${idx === currentIndex ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover/item:text-primary'}`}>
                            {ann.title}
                          </h4>
                          {ann.is_urgent && idx !== currentIndex && <AlertCircle size={10} className='text-red-500/50 shrink-0' />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='py-6 text-center opacity-30 w-full'>
                  <p className='text-[8px] sm:text-[10px] font-black uppercase tracking-widest'>Sem avisos ativos</p>
                </div>
              )}
            </div>
          )}

          {/* Hover Preview Overlay */}
          <div className={`absolute inset-0 transition-all duration-1000 flex flex-col justify-center ${showPreviews ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            {current && (
              <div className='space-y-2 sm:space-y-3 bg-white/80 dark:bg-black/40 backdrop-blur-sm p-3 rounded-2xl border border-gray-100 dark:border-white/5'>
                <div className='flex items-center gap-2'>
                  <span className={`px-2 py-0.5 rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-[0.2em] ${
                    current.is_urgent ? 'bg-red-500 text-white' : 'bg-primary/20 text-primary border border-primary/20'
                  }`}>
                    {current.is_urgent ? '⚠️ Urgente' : 'Destaque'}
                  </span>
                </div>
                <h4 className='text-xs sm:text-base font-black text-slate-900 dark:text-white leading-tight'>{current.title}</h4>
                <p className='text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-white/50 leading-relaxed line-clamp-3'>
                  {current.content}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer (Adapted HeroCard style) */}
        <div className='pt-2 border-t border-gray-100 dark:border-white/5 mt-auto flex justify-between items-center relative z-20'>
          <button 
            onClick={() => setShowHistoryModal(true)}
            className='text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-2'
          >
            <History size={12} />
            Histórico
          </button>
          
          <div className='flex gap-1'>
            {announcements.slice(0, 5).map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary w-3' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        {/* Scanline Effect (Only visible on expansion) */}
        <div className={`absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] transition-opacity duration-1000 ${showPreviews ? 'opacity-[0.02]' : 'opacity-0'}`} />
      </div>
      
      {/* History Modal */}
      {user && (
        <AnnouncementsHistoryModal 
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          ownerId={user.id}
          onDuplicate={onDuplicate}
        />
      )}
    </div>
  );
};

export default CommunicationHub;
