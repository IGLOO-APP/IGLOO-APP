import React, { useState, useEffect } from 'react';
import { Megaphone, X, ChevronRight, Zap, AlertTriangle, Clock, Info, ExternalLink } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance' | 'feature';
  link?: string;
}

// Mock data for now - in a real app this would come from an API/Supabase
const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Nova Funcionalidade: Relatórios de Yield',
    content: 'Agora você pode acompanhar o rendimento de seus imóveis em tempo real com gráficos interativos.',
    type: 'feature',
  },
  {
    id: 'ann-2',
    title: 'Manutenção Programada',
    content: 'O sistema ficará instável no dia 10/04 entre 02h e 04h para atualizações de segurança.',
    type: 'maintenance',
  }
];

const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Filter out closed announcements from localStorage
    const closed = JSON.parse(localStorage.getItem('closed_announcements') || '[]');
    const active = mockAnnouncements.filter(a => !closed.includes(a.id));
    setAnnouncements(active);
    
    if (active.length === 0) setIsVisible(false);
  }, []);

  const handleClose = () => {
    const closed = JSON.parse(localStorage.getItem('closed_announcements') || '[]');
    closed.push(announcements[currentIndex].id);
    localStorage.setItem('closed_announcements', JSON.stringify(closed));
    
    const newAnnouncements = announcements.filter((_, i) => i !== currentIndex);
    setAnnouncements(newAnnouncements);
    
    if (newAnnouncements.length === 0) {
      setIsVisible(false);
    } else if (currentIndex >= newAnnouncements.length) {
      setCurrentIndex(0);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const getTypeStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'feature':
        return 'from-primary/90 to-indigo-600 shadow-primary/20';
      case 'warning':
        return 'from-amber-500 to-orange-500 shadow-amber-500/20';
      case 'maintenance':
        return 'from-blue-500 to-blue-700 shadow-blue-500/20';
      default:
        return 'from-slate-700 to-slate-900 shadow-slate-900/20';
    }
  };

  const getTypeIcon = (type: Announcement['type']) => {
    switch (type) {
      case 'feature':
        return <Zap size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'maintenance':
        return <Clock size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className='relative group animate-fadeIn'>
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getTypeStyles(current.type)} p-6 md:p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300`}>
        <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity'>
          {getTypeIcon(current.type)}
        </div>
        
        <div className='relative z-10 flex flex-col md:flex-row items-center gap-5 md:gap-8'>
          <div className='w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-sm'>
            {getTypeIcon(current.type)}
          </div>
          
          <div className='flex-1 text-center md:text-left space-y-1 md:space-y-2'>
            <div className='flex items-center justify-center md:justify-start gap-2'>
              <span className='px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest'>
                {current.type === 'feature' ? 'Novidade' : current.type === 'maintenance' ? 'Sistema' : 'Aviso'}
              </span>
            </div>
            <h3 className='text-lg md:text-2xl font-extrabold tracking-tight'>
              {current.title}
            </h3>
            <p className='text-xs md:text-sm opacity-90 font-medium line-clamp-2'>
              {current.content}
            </p>
          </div>
          
          <div className='flex items-center gap-2 md:gap-3 shrink-0'>
            {announcements.length > 1 && (
              <button 
                onClick={handleNext}
                className='p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-md'
                title='Próximo'
              >
                <ChevronRight size={18} />
              </button>
            )}
            <button 
              className='flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-white text-slate-900 rounded-xl font-bold text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg'
            >
              Ver Detalhes
              <ChevronRight size={16} />
            </button>
            <button 
              onClick={handleClose}
              className='p-2 md:p-3 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white'
              title='Fechar'
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
