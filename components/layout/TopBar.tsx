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
import { useAuth } from '../../context/AuthContext';
import { UserButton } from '@clerk/clerk-react';

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
  const { user } = useAuth();

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
      if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        const item = filteredItems[selectedIndex];
        if (item) {
          navigate(item.path);
          setIsSearchOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchOpen, selectedIndex, query, properties, tenants]);

  return (
    <header className='sticky top-0 z-40 lg-topbar px-4 md:px-8 py-3 md:py-4 flex justify-between items-center transition-all min-h-[56px] md:min-h-[80px] overflow-visible border-b border-border/10 bg-background/80 backdrop-blur-md'>
      <div className='flex items-center gap-3 min-w-0 flex-1 mr-2'>
        {/* Clerk User Button on Mobile Left */}
        <div className='md:hidden shrink-0 flex items-center justify-center'>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-8 h-8 rounded-full border border-border/20 shadow-sm',
              },
            }}
          />
        </div>

        {!isDashboard && (
          <button
            onClick={() => navigate(-1)}
            className='w-8 h-8 flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground transition-all shrink-0'
            aria-label='Voltar'
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className='flex flex-col min-w-0 flex-1 cursor-pointer' onClick={() => isDashboard ? null : navigate('/')}>
          {title && (
            <h1 className='text-base md:text-lg font-bold text-foreground tracking-tight truncate'>{title}</h1>
          )}
          {subtitle && (
            <p className='text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate'>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className='flex items-center gap-1.5 md:gap-3 shrink-0' ref={searchRef}>
        {isDashboard && (<>
        {/* Inline Search */}
        <div className={isSearchOpen ? 'absolute inset-x-4 md:relative md:inset-auto z-50 flex items-center' : 'relative'}>
          {isSearchOpen ? (
            <div className='flex items-center w-full md:w-[280px] bg-card rounded-2xl border border-border shadow-sm focus-within:border-primary transition-all p-1'>
              <Search size={16} className='text-muted-foreground ml-3 shrink-0' />
              <input
                ref={inputRef}
                type='text'
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder='Pesquisar...'
                className='flex-1 md:w-[240px] bg-transparent border-none focus:outline-none focus:ring-0 px-2.5 py-1 text-sm text-foreground placeholder:text-muted-foreground'
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className='p-1.5 mr-1 hover:bg-accent rounded-xl text-muted-foreground transition-colors'
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className='w-9 h-9 flex items-center justify-center rounded-full bg-card/50 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-all active-tap group'
              title='Pesquisa Global (Ctrl+K)'
            >
              <Search size={16} className='group-hover:text-primary transition-colors' />
            </button>
          )}

          {/* Results Dropdown */}
          {isSearchOpen && (query || filteredItems.length > 0) && (
            <div className='absolute top-full right-0 mt-2 w-[320px] max-w-[calc(100vw-2rem)] md:w-[400px] bg-card border border-border rounded-[32px] shadow-lg animate-scaleUp origin-top-right z-50 overflow-hidden'>
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
                        index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className='flex items-center gap-3 min-w-0'>
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                            index === selectedIndex
                              ? 'bg-primary text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <item.icon size={18} strokeWidth={index === selectedIndex ? 2.5 : 2} />
                        </div>
                        <div className='text-left min-w-0'>
                          <div className='flex items-center gap-2'>
                            <span className='text-foreground font-black text-xs tracking-tight truncate'>
                              {item.title}
                            </span>
                            {item.type && (
                              <span className='px-1.5 py-0.5 rounded-md bg-muted text-[7px] font-black uppercase text-muted-foreground tracking-widest'>
                                {item.type}
                              </span>
                            )}
                          </div>
                          <span className='text-[10px] text-muted-foreground font-medium truncate block'>
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
                  <div className='w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3'>
                    <Search size={20} />
                  </div>
                  <p className='text-foreground font-bold text-xs mb-1'>Nenhum resultado</p>
                  <p className='text-[10px] text-muted-foreground'>Tente outras palavras-chave.</p>
                </div>
              ) : null}

              {/* Footer hints */}
              {filteredItems.length > 0 && (
                <div className='px-4 py-2.5 bg-muted/30 border-t border-border flex items-center gap-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest'>
                  <span className='flex items-center gap-1'>
                    <span className='px-1 py-0.5 bg-muted rounded text-[7px]'>↑↓</span> Navegar
                  </span>
                  <span className='flex items-center gap-1'>
                    <span className='px-1 py-0.5 bg-muted rounded text-[7px]'>Enter</span> Abrir
                  </span>
                  <span className='flex items-center gap-1 ml-auto'>
                    <span className='px-1 py-0.5 bg-muted rounded text-[7px]'>Esc</span> Fechar
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings Button Mobile */}
        <button
          onClick={() => navigate(location.pathname.startsWith('/tenant') ? '/tenant/settings' : location.pathname.startsWith('/admin') ? '/admin/settings' : '/settings')}
          className='md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-card/50 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-all active-tap'
          aria-label='Configurações'
        >
          <Settings size={16} />
        </button>

        {/* Theme Toggle Mobile */}
        <button
          onClick={toggleTheme}
              className='md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-card/50 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-all active-tap'
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className='relative'>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active-tap relative ${
              showNotifications
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-card/50 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-card'
            }`}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse'></span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className='fixed inset-0 z-30' onClick={() => setShowNotifications(false)}></div>
              <div className='absolute top-12 right-0 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-[32px] shadow-2xl py-2 z-40 animate-scaleUp origin-top-right overflow-hidden'>
                <div className='px-4 py-3 border-b border-border flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground'>
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
                        className='px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0 group transition-colors'
                      >
                        <p className='text-sm font-bold text-foreground group-hover:text-primary transition-colors'>
                          {notif.title}
                        </p>
                        <p className='text-xs text-muted-foreground mt-0.5 line-clamp-2'>
                          {notif.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className='p-12 text-center'>
                      <div className='w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground'>
                        <Bell size={20} />
                      </div>
                      <p className='text-muted-foreground text-xs font-bold uppercase tracking-widest'>
                        Tudo limpo por aqui
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        </>)}

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
