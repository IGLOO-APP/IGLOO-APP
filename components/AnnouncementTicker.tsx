import React, { useState, useEffect, useRef } from 'react';
import { Zap, AlertTriangle, Clock, Info } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance' | 'feature';
}

// Mock data — will be replaced by Supabase announcements
const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Nova Funcionalidade: Relatórios de Yield',
    content: 'Acompanhe o rendimento de seus imóveis em tempo real com gráficos interativos.',
    type: 'feature',
  },
  {
    id: 'ann-2',
    title: 'Manutenção Programada',
    content: 'O sistema ficará instável no dia 10/04 entre 02h e 04h para atualizações de segurança.',
    type: 'maintenance',
  },
];

const typeConfig = {
  feature:     { label: 'NOVIDADE', icon: Zap,           color: 'text-primary',   dot: 'bg-primary'   },
  warning:     { label: 'AVISO',    icon: AlertTriangle, color: 'text-amber-400', dot: 'bg-amber-400' },
  maintenance: { label: 'SISTEMA',  icon: Clock,         color: 'text-blue-400',  dot: 'bg-blue-400'  },
  info:        { label: 'INFO',     icon: Info,          color: 'text-slate-400', dot: 'bg-slate-400' },
};

const TickerItem: React.FC<{ item: Announcement }> = ({ item }) => {
  const cfg = typeConfig[item.type];
  const Icon = cfg.icon;
  return (
    <span className='inline-flex items-center gap-2.5 whitespace-nowrap select-none px-6'>
      {/* Separator bullet */}
      <span className='opacity-20 text-white text-xs'>◆</span>

      {/* Type badge */}
      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>
        <Icon size={9} strokeWidth={3} />
        {cfg.label}
      </span>

      {/* Accent dot */}
      <span className={`w-1 h-1 rounded-full ${cfg.dot} opacity-70 shrink-0`} />

      {/* Title */}
      <span className='text-[11px] font-semibold text-slate-200 tracking-tight'>
        {item.title}
      </span>

      {/* Detail — hidden on mobile */}
      <span className='text-[11px] text-slate-500 hidden lg:inline'>
        — {item.content}
      </span>
    </span>
  );
};

/**
 * AnnouncementTicker
 *
 * Lives in the dashboard header between the greeting and the action icons.
 * Announcements scroll right-to-left with a bilateral CSS mask-image fade.
 * Hovering pauses the animation. Only renders when there are active announcements.
 *
 * Seamless infinite loop achieved by duplicating the content track and
 * animating translateX(0%) → translateX(-50%).
 */
const AnnouncementTicker: React.FC = () => {
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    const closed = JSON.parse(localStorage.getItem('closed_announcements') || '[]');
    const active = mockAnnouncements.filter(a => !closed.includes(a.id));
    setItems(active);
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className='ticker-mask flex-1 overflow-hidden min-w-0 h-8 flex items-center mx-2'
      role='marquee'
      aria-label='Anúncios e novidades do sistema'
    >
      {/*
        The track is duplicated so translateX(-50%) brings the
        second copy perfectly into position → seamless loop.
      */}
      <div className='ticker-track inline-flex items-center whitespace-nowrap will-change-transform'>
        {/* First copy */}
        {items.map(item => <TickerItem key={`a-${item.id}`} item={item} />)}
        {/* Duplicate copy for seamless loop */}
        {items.map(item => <TickerItem key={`b-${item.id}`} item={item} />)}
      </div>
    </div>
  );
};

export default AnnouncementTicker;
