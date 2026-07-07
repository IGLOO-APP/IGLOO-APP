import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Building2,
  Users,
  LayoutDashboard,
  Receipt,
  MessageSquare,
  Settings,
  X,
  ArrowRight,
  ArrowLeft,
  Moon,
  Sun,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNotification } from '../../context/NotificationContext';
import { propertyService } from '../../services/propertyService';
import { tenantService } from '../../services/tenancy/tenantService';
import { useTheme } from '../../hooks/useTheme';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const navItems = [
  {
    id: 'nav-dashboard',
    title: 'Painel Geral',
    subtitle: 'Visão geral',
    icon: LayoutDashboard,
    path: '/',
    type: 'Página',
  },
  {
    id: 'nav-properties',
    title: 'Meus Imóveis',
    subtitle: 'Gestão de ativos',
    icon: Building2,
    path: '/properties',
    type: 'Página',
  },
  {
    id: 'nav-tenants',
    title: 'Inquilinos',
    subtitle: 'Base de locatários',
    icon: Users,
    path: '/tenants',
    type: 'Página',
  },
  {
    id: 'nav-messages',
    title: 'Mensagens',
    subtitle: 'Central de comunicação',
    icon: MessageSquare,
    path: '/messages',
    type: 'Página',
  },
  {
    id: 'nav-financials',
    title: 'Finanças',
    subtitle: 'Fluxo de caixa',
    icon: Receipt,
    path: '/financials',
    type: 'Página',
  },
  {
    id: 'nav-settings',
    title: 'Configurações',
    subtitle: 'Perfil e preferências',
    icon: Settings,
    path: '/settings',
    type: 'Página',
  },
];

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, children }) => {
  const { isDark, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const { notifications, unreadCount, markAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-search-inline'],
    queryFn: () => propertyService.getAll(),
    enabled: isSearchOpen,
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants-search-inline'],
    queryFn: () => tenantService.getAll(),
    enabled: isSearchOpen,
  });

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((p) => !p);
      }
      if (!isSearchOpen) return;
      if (e.key === 'Escape') setIsSearchOpen(false);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === 'Enter') {
        const item = filteredItems[selectedIndex];
        if (item) {
          navigate(item.path);
          setIsSearchOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, selectedIndex, query, properties, tenants]);

  const filteredProperties = properties
    .filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.address.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3)
    .map((p) => ({
      id: `prop-${p.id}`,
      title: p.name,
      subtitle: p.address,
      icon: Building2,
      path: `/properties?id=${p.id}`,
      type: 'Imóvel',
    }));

  const filteredTenants = tenants
    .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .map((t) => ({
      id: `tenant-${t.id}`,
      title: t.name,
      subtitle: t.email,
      icon: Users,
      path: `/tenants?id=${t.id}`,
      type: 'Inquilino',
    }));

  const filteredNav = navItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredItems = [...filteredNav, ...filteredProperties, ...filteredTenants];

  return (
    <header className='sticky top-0 z-40 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-4 md:px-8 py-4 flex justify-between items-center transition-colors min-h-[80px]'>
      <div className='flex items-center gap-2 min-w-0 flex-1 mr-2'>
        {!isDashboard && (
          <button
            onClick={() => navigate('/')}
            className='md:hidden w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 text-slate-400 transition-all shrink-0'
            aria-label='Voltar ao início'
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className='flex flex-col min-w-0 flex-1 cursor-pointer' onClick={() => navigate('/')}>
          {title && (
            <h1 className='text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate'>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest truncate'>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className='flex items-center gap-1.5 md:gap-3 shrink-0' ref={searchRef}>
        {/* Inline Search */}
        <div className='relative'>
          {isSearchOpen ? (
            <div className='flex items-center bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm focus-within:border-primary transition-all'>
              <Search size={16} className='text-slate-400 ml-3 shrink-0' />
              <input
                ref={inputRef}
                type='text'
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder='Pesquisar...'
                className='w-[200px] md:w-[280px] bg-transparent border-none focus:outline-none focus:ring-0 px-2.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400'
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className='p-1.5 mr-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-slate-400 transition-colors'
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className='w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 text-slate-400 transition-all active-tap group'
              title='Pesquisa Global (Ctrl+K)'
            >
              <Search size={20} className='group-hover:text-primary transition-colors' />
            </button>
          )}

          {/* Results Dropdown */}
          {isSearchOpen && (query || filteredItems.length > 0) && (
            <div className='absolute top-full right-0 mt-2 w-[320px] md:w-[400px] bg-white dark:bg-surface-dark rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden animate-scaleUp origin-top-right z-50'>
              {filteredItems.length > 0 ? (
                <div className='p-2 max-h-[60vh] overflow-y-auto custom-scrollbar'>
                  {filteredItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setIsSearchOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                        index === selectedIndex
                          ? 'bg-gray-50 dark:bg-white/5'
                          : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className='flex items-center gap-3 min-w-0'>
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                            index === selectedIndex
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          <item.icon size={18} strokeWidth={index === selectedIndex ? 2.5 : 2} />
                        </div>
                        <div className='text-left min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='text-slate-900 dark:text-white font-black text-xs tracking-tight truncate'>
                              {item.title}
                            </span>
                            {item.type && (
                              <span className='px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[7px] font-black uppercase text-slate-400 tracking-widest'>
                                {item.type}
                              </span>
                            )}
                          </div>
                          <span className='text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate block'>
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      {index === selectedIndex && (
                        <ArrowRight size={12} className='text-primary shrink-0' />
                      )}
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className='p-8 flex flex-col items-center justify-center text-center'>
                  <div className='w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 mb-3'>
                    <Search size={20} />
                  </div>
                  <p className='text-slate-900 dark:text-white font-bold text-xs mb-1'>
                    Nenhum resultado
                  </p>
                  <p className='text-[10px] text-slate-500 dark:text-slate-400'>
                    Tente outras palavras-chave.
                  </p>
                </div>
              ) : null}

              {/* Footer hints */}
              {filteredItems.length > 0 && (
                <div className='px-4 py-2.5 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
                  <span className='flex items-center gap-1'>
                    <span className='px-1 py-0.5 bg-white dark:bg-white/5 rounded text-[7px]'>
                      ↑↓
                    </span>{' '}
                    Navegar
                  </span>
                  <span className='flex items-center gap-1'>
                    <span className='px-1 py-0.5 bg-white dark:bg-white/5 rounded text-[7px]'>
                      Enter
                    </span>{' '}
                    Abrir
                  </span>
                  <span className='flex items-center gap-1 ml-auto'>
                    <span className='px-1 py-0.5 bg-white dark:bg-white/5 rounded text-[7px]'>
                      Esc
                    </span>{' '}
                    Fechar
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle Mobile */}
        <button
          onClick={toggleTheme}
          className='md:hidden w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 text-slate-400 transition-all active-tap'
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className='relative'>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all active-tap relative ${
              showNotifications
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'hover:bg-gray-100 dark:hover:bg-white/5 text-slate-400'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark animate-pulse'></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className='fixed inset-0 z-30' onClick={() => setShowNotifications(false)}></div>
              <div className='absolute top-12 right-0 w-80 bg-white dark:bg-surface-dark rounded-[32px] shadow-2xl border border-gray-100 dark:border-white/5 py-2 z-40 animate-scaleUp origin-top-right overflow-hidden'>
                <div className='px-4 py-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400'>
                  Notificações
                  {unreadCount > 0 && (
                    <span className='bg-primary text-white px-2 py-0.5 rounded-full text-[8px]'>
                      {unreadCount} novas
                    </span>
                  )}
                </div>
                <div className='max-h-80 overflow-y-auto custom-scrollbar'>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          setShowNotifications(false);
                        }}
                        className='px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0 group transition-colors'
                      >
                        <p className='text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors'>
                          {notif.title}
                        </p>
                        <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2'>
                          {notif.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className='p-12 text-center'>
                      <div className='w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300'>
                        <Bell size={20} />
                      </div>
                      <p className='text-slate-400 text-xs font-bold uppercase tracking-widest'>
                        Tudo limpo por aqui
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom Action Buttons */}
        {children && (
          <div className='flex items-center gap-1.5 md:gap-3 ml-1 md:ml-2 overflow-x-auto hide-scrollbar'>
            {children}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
