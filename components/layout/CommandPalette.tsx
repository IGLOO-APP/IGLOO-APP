import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  Users, 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  MessageSquare,
  Settings,
  ArrowRight,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { propertyService } from '../../services/propertyService';
import { tenantService } from '../../services/tenantService';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch data for searching
  const { data: properties = [] } = useQuery({
    queryKey: ['properties-search'],
    queryFn: () => propertyService.getAll(),
    enabled: isOpen
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants-search'],
    queryFn: () => tenantService.getAll(),
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') onClose();
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      
      if (e.key === 'Enter') {
        const selected = filteredItems[selectedIndex];
        if (selected) handleSelect(selected);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  const navigationItems = [
    { id: 'nav-dashboard', title: 'Painel Geral', subtitle: 'Visão geral do seu patrimônio', icon: LayoutDashboard, path: '/', type: 'Página' },
    { id: 'nav-properties', title: 'Meus Imóveis', subtitle: 'Gestão de ativos e unidades', icon: Building2, path: '/properties', type: 'Página' },
    { id: 'nav-tenants', title: 'Inquilinos', subtitle: 'Base de locatários e contratos', icon: Users, path: '/tenants', type: 'Página' },
    { id: 'nav-messages', title: 'Mensagens', subtitle: 'Central de comunicação', icon: MessageSquare, path: '/messages', type: 'Página' },
    { id: 'nav-financials', title: 'Finanças', subtitle: 'Fluxo de caixa e cobranças', icon: Receipt, path: '/financials', type: 'Página' },
    { id: 'nav-settings', title: 'Configurações', subtitle: 'Perfil e preferências', icon: Settings, path: '/settings', type: 'Página' },
  ];

  const filteredProperties = properties
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.address.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .map(p => ({
      id: `prop-${p.id}`,
      title: p.name,
      subtitle: p.address,
      icon: Building2,
      path: `/properties?id=${p.id}`,
      type: 'Imóvel'
    }));

  const filteredTenants = tenants
    .filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .map(t => ({
      id: `tenant-${t.id}`,
      title: t.name,
      subtitle: t.email,
      icon: Users,
      path: `/tenants?id=${t.id}`,
      type: 'Inquilino'
    }));

  const filteredNav = navigationItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredItems = [...filteredNav, ...filteredProperties, ...filteredTenants];

  const handleSelect = (item: any) => {
    navigate(item.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 md:pt-[10%]'>
      <div className='fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fadeIn' onClick={onClose} />
      
      <div className='relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-scaleUp'>
        {/* Search Input Area */}
        <div className='flex items-center px-6 py-5 border-b border-slate-100 dark:border-white/5'>
          <Search className='text-slate-400 mr-4 shrink-0' size={24} />
          <input
            ref={inputRef}
            type='text'
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder='O que você está procurando? (Imóveis, Inquilinos, Páginas...)'
            className='w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white text-lg placeholder-slate-400'
          />
          <div className='flex items-center gap-2'>
            <span className='hidden sm:flex px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md text-[10px] font-black text-slate-400 uppercase tracking-widest'>ESC</span>
            <button onClick={onClose} className='p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors'>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className='max-h-[60vh] overflow-y-auto p-4 custom-scrollbar'>
          {filteredItems.length > 0 ? (
            <div className='space-y-1'>
              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    index === selectedIndex 
                      ? 'bg-slate-100 dark:bg-white/5 shadow-inner' 
                      : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <div className='flex items-center gap-4 min-w-0'>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      index === selectedIndex 
                        ? 'bg-primary text-white' 
                        : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500'
                    }`}>
                      <item.icon size={22} strokeWidth={index === selectedIndex ? 2.5 : 2} />
                    </div>
                    <div className='text-left min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-slate-900 dark:text-white font-black text-sm tracking-tight truncate'>{item.title}</span>
                        {item.type && (
                          <span className='px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[8px] font-black uppercase text-slate-400 tracking-widest border border-slate-200 dark:border-white/5'>{item.type}</span>
                        )}
                      </div>
                      <span className='text-xs text-slate-500 dark:text-slate-400 font-medium truncate block'>{item.subtitle}</span>
                    </div>
                  </div>
                  {index === selectedIndex && (
                    <div className='flex items-center gap-2 animate-fadeIn'>
                      <span className='text-[10px] font-black text-primary uppercase tracking-widest'>Abrir</span>
                      <ArrowRight size={14} className='text-primary' />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className='py-12 flex flex-col items-center justify-center text-center'>
              <div className='w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4'>
                <Search size={32} />
              </div>
              <p className='text-slate-900 dark:text-white font-bold mb-1'>Nenhum resultado encontrado</p>
              <p className='text-sm text-slate-500 dark:text-slate-400'>Tente usar outras palavras-chave ou navegue pelo menu.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between'>
          <div className='flex items-center gap-6'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                <span className='px-1.5 py-0.5 bg-white dark:bg-white/10 rounded shadow-sm text-[9px] font-bold text-slate-500'>↑</span>
                <span className='px-1.5 py-0.5 bg-white dark:bg-white/10 rounded shadow-sm text-[9px] font-bold text-slate-500'>↓</span>
              </div>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Navegar</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='px-1.5 py-0.5 bg-white dark:bg-white/10 rounded shadow-sm text-[9px] font-bold text-slate-500'>Enter</span>
              <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Selecionar</span>
            </div>
          </div>
          <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-40'>Meu Igloo Search</p>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
