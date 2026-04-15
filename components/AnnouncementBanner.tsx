import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Zap, AlertTriangle, Clock, Info } from 'lucide-react';

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

const getTypeAccent = (type: Announcement['type']) => {
  switch (type) {
    case 'feature':
      return { bg: 'bg-primary/10 dark:bg-primary/10', text: 'text-primary', badge: 'bg-primary/10 text-primary border-primary/20' };
    case 'warning':
      return { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-500', badge: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' };
    case 'maintenance':
      return { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500', badge: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' };
    default:
      return { bg: 'bg-slate-50 dark:bg-white/5', text: 'text-slate-500', badge: 'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10' };
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

const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Filter out closed announcements from localStorage
    const closed = JSON.parse(localStorage.getItem('closed_announcements') || '[]');
    const active = mockAnnouncements.filter(a => !closed.includes(a.id));
    setAnnouncements(active);
    
    if (active.length === 0) setIsVisible(false);
  }, []);

  if (!isVisible || announcements.length === 0) return null;

  return (
    <div className='flex flex-col gap-4 animate-fadeIn'>
      {announcements.map((current) => {
        const accent = getTypeAccent(current.type);
        
        return (
          <div key={current.id} className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-5 md:p-6 hover:shadow-md transition-all duration-300'>
            <div className='flex flex-col md:flex-row items-center gap-4 md:gap-6'>
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${accent.bg} flex items-center justify-center shrink-0 ${accent.text}`}>
                {getTypeIcon(current.type)}
              </div>
              
              {/* Content */}
              <div className='flex-1 text-center md:text-left space-y-1'>
                <div className='flex items-center justify-center md:justify-start gap-2'>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${accent.badge}`}>
                    {current.type === 'feature' ? 'Novidade' : current.type === 'maintenance' ? 'Sistema' : 'Aviso'}
                  </span>
                </div>
                <h3 className='text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight'>
                  {current.title}
                </h3>
                <p className='text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2'>
                  {current.content}
                </p>
              </div>
              
              {/* Actions */}
              <div className='flex items-center gap-2 md:gap-3 shrink-0'>
                <button 
                  className='flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs md:text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm'
                >
                  Ver Detalhes
                  <ChevronRight size={14} />
                </button>
                <button 
                  onClick={() => {
                    const closed = JSON.parse(localStorage.getItem('closed_announcements') || '[]');
                    closed.push(current.id);
                    localStorage.setItem('closed_announcements', JSON.stringify(closed));
                    setAnnouncements(prev => prev.filter(a => a.id !== current.id));
                  }}
                  className='p-2 md:p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  title='Fechar'
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
