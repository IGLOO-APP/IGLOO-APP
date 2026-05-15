import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { TopBar } from '../components/layout/TopBar';
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
import CommunicationHub from '../components/announcements/CommunicationHub';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';
import CreateAnnouncementModal from '../components/announcements/CreateAnnouncementModal';
import { OwnerOnboardingWizard } from '../components/layout/OwnerOnboardingWizard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, tokenReady } = useAuth();
  const { isDark } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementToDuplicate, setAnnouncementToDuplicate] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: dashboardData, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboardData', user?.id],
    queryFn: () => dashboardService.getDashboardData(String(user!.id)),
    enabled: !!user && tokenReady,
    staleTime: 1000 * 60,
    retry: 1,
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (dashboardData && dashboardData.properties.length === 0 && !sessionStorage.getItem(`onboarding_owner_seen_${user?.id}`)) {
      setShowOnboarding(true);
    }
  }, [dashboardData, user?.id]);

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
        <h2 className='text-xl font-bold text-slate-main dark:text-white mb-2'>Erro ao carregar Dashboard</h2>
        <p className='text-slate-body dark:text-slate-400 mb-6 max-w-md'>
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
      {showOnboarding && (
        <OwnerOnboardingWizard 
          onComplete={() => {
            setShowOnboarding(false);
            sessionStorage.setItem(`onboarding_owner_seen_${user?.id}`, 'true');
          }}
        />
      )}
      <TopBar 
        title="Dashboard" 
        subtitle="Visão Geral do Patrimônio"
      >
        <button
          onClick={() => navigate('/properties', { state: { openAdd: true } })}
          className='flex items-center justify-center gap-1.5 md:gap-2 bg-primary hover:bg-primary-hover text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-bold text-xs md:text-sm shadow-cyan-glow transition-all active:scale-95'
        >
          <Plus size={16} className="md:size-[18px]" />
          <span className='hidden sm:inline'>Novo Imóvel</span>
        </button>
      </TopBar>

      <div className='px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 pb-24'>
        {/* Top Section: Metrics, Health & Communication Integrated */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Main Area (Left) - 9/12 Columns */}
          <div className='lg:col-span-9 flex flex-col gap-6'>
            <HeroMetrics metrics={metrics} />
            <PortfolioHealth health={portfolioHealth} />
          </div>

          {/* Side Hub (Right) - 3/12 Columns */}
          <div className='lg:col-span-3 h-full'>
            <CommunicationHub
              onNewAnnouncement={() => {
                setAnnouncementToDuplicate(null);
                setShowAnnouncementModal(true);
              }}
              onDuplicate={(ann) => {
                setAnnouncementToDuplicate(ann);
                setShowAnnouncementModal(true);
              }}
            />
          </div>
        </div>

        {/* Row 3: Assets & Wealth Evolution (SIDE BY SIDE) */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          <section className="lg:col-span-5 flex flex-col gap-4">
            <div className='flex justify-between items-end px-1 h-[42px]'>
              <div className='flex items-end gap-6'>
                <div>
                  <h2 className='text-base font-black text-slate-main dark:text-white uppercase tracking-tight'>Gestão de Ativos</h2>
                  <p className='text-[10px] text-slate-muted font-bold uppercase tracking-widest'>Patrimônio ativo</p>
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
                  <p className="text-sm font-black text-slate-main dark:text-white">Cadastrar imóvel</p>
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

        {/* Row 5: Full-Width Cash Flow */}
        <section className='w-full'>
          <CashFlowChart financialHistory={financialHistory || []} isDark={isDark} />
        </section>

        {/* Row 6: Main Content & Sidebar */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch'>
          {/* Left: Activity Timeline */}
          <div className='lg:col-span-8 flex flex-col'>
            <ActivityTimeline activities={activities || []} />
          </div>

          {/* Right: AI Insights */}
          <div className='lg:col-span-4 flex flex-col'>
            <DashboardAIInsights metrics={metrics} />
          </div>
        </div>

        {/* Row 7: Full-Width Property Performance */}
        <section className='w-full'>
          <PropertyPerformance topProperties={topProperties || []} />
        </section>
      </div>

      <CreateAnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => {
          setShowAnnouncementModal(false);
          setAnnouncementToDuplicate(null);
        }}
        properties={properties}
        initialData={announcementToDuplicate}
        onSuccess={() => {
          refetch();
          setAnnouncementToDuplicate(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
