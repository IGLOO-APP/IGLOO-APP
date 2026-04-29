import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  Plus,
  Moon,
  Sun,
  Settings,
  User,
  LogOut,
  Receipt,
  UserPlus,
  AlertTriangle,
  FileText,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { dashboardService } from '../services/dashboardService';
import { AlertBadge } from '../components/ui/DashboardComponents';
import { useTheme } from '../hooks/useTheme';

// Modular Dashboard Components
import { OnboardingChecklist } from './dashboard/components/OnboardingChecklist';
import { HeroMetrics } from './dashboard/components/HeroMetrics';
import { CashFlowChart } from './dashboard/components/CashFlowChart';
import { PropertyPerformance } from './dashboard/components/PropertyPerformance';
import { ActivityTimeline } from './dashboard/components/ActivityTimeline';
import { DashboardAIInsights } from './dashboard/components/DashboardAIInsights';
import { PropertyCard } from '../components/properties/PropertyCard';
import { propertyService } from '../services/propertyService';

import AnnouncementTicker from '../components/AnnouncementTicker';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, triggerTestNotification } =
    useNotification();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: () => dashboardService.getDashboardData(),
    staleTime: 1000 * 60, // 1 minute
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyService.getAll(),
    staleTime: 1000 * 60 * 5,
  });
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (isLoading || !dashboardData) {
    return (
      <div className='flex h-screen items-center justify-center bg-background-light dark:bg-background-dark'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  const { metrics, financialHistory, topProperties, activities, onboarding: rawOnboarding } = dashboardData;

  // Merge raw onboarding with live data to ensure sync
  const onboarding = {
    ...rawOnboarding,
    step1: properties.length > 0 || rawOnboarding?.step1,
  };

  return (
    <div
      className={`flex flex-col w-full max-w-[1600px] mx-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* --- HEADER --- */}
      <header className='sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          {/* Menu moved to sidebar */}
        </div>

        {/* ── TICKER: announcements between greeting and actions ── */}
        <AnnouncementTicker />

        <div className='flex items-center gap-3'>
          <button
            onClick={toggleTheme}
            className='w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors'
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* NOTIFICATION BELL */}
          <div className='relative'>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors relative ${showNotifications ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark'></span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className='fixed inset-0 z-30'
                  onClick={() => setShowNotifications(false)}
                ></div>
                <div className='absolute top-12 right-0 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 py-2 z-40 animate-scaleUp origin-top-right overflow-hidden'>
                  <div className='px-4 py-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5'>
                    <h3 className='font-bold text-slate-900 dark:text-white text-sm'>
                      Notificações
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className='text-xs text-primary font-bold hover:underline'
                      >
                        Ler tudo
                      </button>
                    )}
                  </div>
                  <div className='max-h-80 overflow-y-auto'>
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.link) navigate(notif.link);
                          }}
                          className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0 transition-colors ${!notif.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                        >
                          <div className='flex justify-between items-start gap-3'>
                            <div>
                              <p
                                className={`text-sm ${!notif.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}
                              >
                                {notif.title}
                              </p>
                              <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2'>
                                {notif.message}
                              </p>
                              <p className='text-[10px] text-slate-400 mt-1'>
                                {new Date(notif.created_at).toLocaleDateString()}{' '}
                                {new Date(notif.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <div className='w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0'></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='p-8 text-center text-slate-400 text-sm'>
                        <Bell size={24} className='mx-auto mb-2 opacity-50' />
                        Nenhuma notificação
                      </div>
                    )}
                  </div>
                  <div className='p-2 border-t border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-center'>
                    <button
                      onClick={triggerTestNotification}
                      className='text-[10px] font-bold text-slate-400 hover:text-primary transition-colors'
                    >
                      Simular Notificação (Teste)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/properties', { state: { openAdd: true } })}
            className='w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform'
            title='Novo Imóvel'
          >
            <Plus size={20} />
          </button>
        </div>

      </header>

      <div className='p-6 space-y-12 pb-24'>
        {/* --- 0. HERO METRICS --- */}
        <HeroMetrics metrics={metrics} />

        {/* --- 1. GESTÃO DE ATIVOS & ONBOARDING --- */}
        <div className='grid grid-cols-1 lg:grid-cols-6 gap-6 mb-16'>
          {/* Left: Highlighted Property - Spans 2 columns */}
          <section className='lg:col-span-2 space-y-4'>
            <div className='flex justify-between items-end px-1'>
              <div>
                <h2 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight'>Gestão de Ativos</h2>
                <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Patrimônio em destaque</p>
              </div>
              <button 
                onClick={() => navigate('/properties')}
                className='text-[10px] font-black text-primary uppercase tracking-widest hover:underline'
              >
                Ver todos
              </button>
            </div>
            
            <div className='w-full'>
              {/* Highlighted Property Card (Full Detail) */}
              {properties.slice(0, 1).map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onClick={(p) => navigate(`/properties?id=${p.id}`)}
                  viewMode='grid'
                />
              ))}
            </div>
          </section>

          {/* Right: Onboarding Steps (2x2) - Spans 4 columns (fills the space) */}
          {!onboarding?.allCompleted && (
            <section className='lg:col-span-4 space-y-4'>
              <div className='px-1'>
                <h2 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight'>Próximos Passos</h2>
                <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Complete seu perfil</p>
              </div>
              <OnboardingChecklist 
                onboarding={onboarding} 
                variant='compact-2x2' 
              />
            </section>
          )}
        </div>

        {/* --- 2. ALERTS & ACTIONS --- */}
        <section className='flex flex-col md:flex-row gap-6'>
          <div className='flex-1 overflow-x-auto hide-scrollbar flex gap-3 pb-2 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0'>
            <AlertBadge
              icon={AlertTriangle}
              label='Vacância Crítica'
              count={metrics.occupancyRate < 80 ? 1 : 0}
              color='bg-red-500 border-red-500 text-red-600 dark:text-red-400'
              onClick={() => navigate('/properties')}
            />
            <AlertBadge
              icon={FileText}
              label='Contratos Vencendo'
              count={2}
              color='bg-amber-500 border-amber-500 text-amber-600 dark:text-amber-400'
              onClick={() => navigate('/contracts')}
            />
            <AlertBadge
              icon={Wrench}
              label='Manutenções'
              count={3}
              color='bg-blue-500 border-blue-500 text-blue-600 dark:text-blue-400'
              onClick={() => navigate('/messages')}
            />
          </div>
          <div className='grid grid-cols-2 md:flex gap-3 shrink-0'>
            <button
              onClick={() => navigate('/financials', { state: { openAdd: true, type: 'expense' } })}
              className='h-12 md:h-14 px-3 md:px-6 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 font-bold text-[10px] md:text-sm text-slate-700 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5 md:gap-2'
            >
              <Receipt size={16} className='text-red-500 shrink-0' /> <span className='truncate'>Despesa</span>
            </button>
            <button
              onClick={() => navigate('/tenants', { state: { openAdd: true } })}
              className='h-12 md:h-14 px-3 md:px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] md:text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5 md:gap-2'
            >
              <UserPlus size={16} className='shrink-0' /> <span className='truncate'>Inquilino</span>
            </button>
          </div>
        </section>

        {/* --- 3. MAIN GRID --- */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16'>
          {/* LEFT COLUMN (2/3) */}
          <div className='lg:col-span-2 space-y-6'>
            <CashFlowChart financialHistory={financialHistory} isDark={isDark} />
            <PropertyPerformance topProperties={topProperties} />
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className='space-y-6'>
            <DashboardAIInsights occupancyRate={metrics.occupancyRate} />
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
