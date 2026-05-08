import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  Plus,
  Moon,
  Sun,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { dashboardService } from '../services/dashboardService';
import { AlertBadge } from '../components/ui/DashboardComponents';
import { useTheme } from '../hooks/useTheme';

// Modular Dashboard Components
import { HeroMetrics } from './dashboard/components/HeroMetrics';
import { PortfolioHealth } from './dashboard/components/PortfolioHealth';
import { CashFlowChart } from './dashboard/components/CashFlowChart';
import { WealthEvolutionChart } from './dashboard/components/WealthEvolutionChart';
import { PropertyPerformance } from './dashboard/components/PropertyPerformance';
// import { PropertyYieldChart } from './dashboard/components/PropertyYieldChart'; // Unused
import { ActivityTimeline } from './dashboard/components/ActivityTimeline';
import { DashboardAIInsights } from './dashboard/components/DashboardAIInsights';
import { RiskRadar } from './dashboard/components/RiskRadar';
import { PropertyCard } from '../components/properties/PropertyCard';
import { propertyService } from '../services/propertyService';

import AnnouncementTicker from '../components/AnnouncementTicker';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, tokenReady } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: dashboardData, isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['dashboardData', user?.id],
    queryFn: () => dashboardService.getDashboardData(String(user!.id)),
    enabled: !!user && tokenReady,
    staleTime: 1000 * 60,
    retry: 1,
  });

  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-background-light dark:bg-background-dark'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className='flex h-screen flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6 text-center'>
        <div className='w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-4'>
          <AlertTriangle size={32} />
        </div>
        <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>Erro ao carregar Dashboard</h2>
        <p className='text-slate-500 dark:text-slate-400 mb-6 max-w-md'>
          Não conseguimos sincronizar seus dados agora.
        </p>
        <button
          onClick={() => refetch()}
          className='px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all'
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const {
    metrics,
    financialHistory,
    activities,
    topProperties,
    portfolioHealth,
    risks,
    wealthHistory,
    properties
  } = dashboardData;

  return (
    <div className={`flex flex-col w-full max-w-[1600px] mx-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <header className='sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center gap-4'></div>
        <AnnouncementTicker />
        <div className='flex items-center gap-3'>
          <button onClick={toggleTheme} className='w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors'>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className='relative'>
            <button onClick={() => setShowNotifications(!showNotifications)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors relative ${showNotifications ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}>
              <Bell size={20} />
              {unreadCount > 0 && <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark'></span>}
            </button>
            {showNotifications && (
              <>
                <div className='fixed inset-0 z-30' onClick={() => setShowNotifications(false)}></div>
                <div className='absolute top-12 right-0 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 py-2 z-40 animate-scaleUp origin-top-right overflow-hidden'>
                  <div className='px-4 py-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 text-sm font-bold'>Notificações</div>
                  <div className='max-h-80 overflow-y-auto'>
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <div key={notif.id} onClick={() => markAsRead(notif.id)} className='px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0'>
                        <p className='text-sm font-bold text-slate-900 dark:text-white'>{notif.title}</p>
                        <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>{notif.message}</p>
                      </div>
                    )) : <div className='p-8 text-center text-slate-400 text-sm'>Nenhuma notificação</div>}
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => navigate('/properties', { state: { openAdd: true } })}
            className='flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95'
          >
            <Plus size={18} />
            <span className='hidden md:inline'>Novo Imóvel</span>
          </button>
        </div>
      </header>

      <div className='p-6 space-y-12 pb-24'>
        {/* Row 1: Metrics */}
        <HeroMetrics metrics={metrics} />

        {/* Row 2: Health */}
        <PortfolioHealth health={portfolioHealth} />

        {/* Row 3: Assets & Wealth Evolution (SIDE BY SIDE) */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          <section className="lg:col-span-5 flex flex-col gap-4">
            <div className='flex justify-between items-end px-1 h-[42px]'>
              <div className='flex items-end gap-6'>
                <div>
                  <h2 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight'>Gestão de Ativos</h2>
                  <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Patrimônio ativo</p>
                </div>
                <button onClick={() => navigate('/properties')} className='text-[10px] font-black text-primary uppercase tracking-widest hover:underline pb-0.5'>Ver todos</button>
              </div>
            </div>
            <div className="relative group/carousel">
              {properties.length > 0 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {properties.slice(0, 5).map((prop) => (
                      <CarouselItem key={prop.id} className="basis-full">
                        <div className="px-1">
                          <PropertyCard
                            property={prop}
                            onClick={(p) => navigate(`/properties?id=${p.id}`)}
                            viewMode='grid'
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {properties.length > 1 && (
                    <div className="absolute -right-2 -top-12 flex gap-2">
                      <CarouselPrevious className="static translate-y-0 h-8 w-8 bg-white dark:bg-surface-dark border-slate-200 dark:border-white/10" />
                      <CarouselNext className="static translate-y-0 h-8 w-8 bg-white dark:bg-surface-dark border-slate-200 dark:border-white/10" />
                    </div>
                  )}
                </Carousel>
              ) : (
                <div onClick={() => navigate('/properties', { state: { openAdd: true } })} className="h-48 flex flex-col items-center justify-center p-8 bg-white dark:bg-surface-dark rounded-[32px] border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-primary transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-primary transition-all mb-3"><Plus size={24} strokeWidth={3} /></div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Cadastrar imóvel</p>
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-7 h-full">
            <WealthEvolutionChart wealthHistory={wealthHistory || []} isDark={isDark} />
          </section>
        </div>

        {/* Row 4: Alerts */}
        <section className='flex flex-wrap gap-4'>
          <AlertBadge icon={AlertTriangle} label='Vacância Crítica' count={metrics.occupancyRate < 80 ? 1 : 0} color='bg-red-500 border-red-500 text-red-600 dark:text-red-400' onClick={() => navigate('/properties')} />
          <AlertBadge icon={FileText} label='Contratos Vencendo' count={metrics.expiringContractsCount || 0} color='bg-amber-500 border-amber-500 text-amber-600 dark:text-amber-400' onClick={() => navigate('/contracts')} />
        </section>

        {/* Row 5 & 6: Main Content & Sidebar */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          {/* Main Area (Left) */}
          <div className='lg:col-span-8 flex flex-col gap-8'>
            <CashFlowChart financialHistory={financialHistory || []} isDark={isDark} />
            <ActivityTimeline activities={activities || []} />
          </div>

          {/* Sidebar (Right) */}
          <div className='lg:col-span-4 flex flex-col gap-8'>
            <DashboardAIInsights metrics={metrics} />
            <PropertyPerformance topProperties={topProperties || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
