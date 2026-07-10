import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { TopBar } from '../components/layout/TopBar';
import { dashboardService } from '../services/dashboardService';
import { HeroCardSkeleton, SectionHeader } from '../components/ui/DashboardComponents';
import { useTheme } from '../hooks/useTheme';

// Modular Dashboard Components
import { HeroMetrics } from './dashboard/components/HeroMetrics';
import { PortfolioHealth } from './dashboard/components/PortfolioHealth';
import { CashFlowChart } from './dashboard/components/CashFlowChart';
import { WealthEvolutionChart } from './dashboard/components/WealthEvolutionChart';
import { PropertyPerformance } from './dashboard/components/PropertyPerformance';

import { ActivityTimeline } from './dashboard/components/ActivityTimeline';
import { DashboardAIInsights } from './dashboard/components/DashboardAIInsights';
import { PropertyCard } from '../components/properties/PropertyCard';
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
  // Local guard so the wizard doesn't re-open in the same session
  // after the user completes it (the auth refresh will confirm later)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboardData', user?.id],
    queryFn: () => dashboardService.getDashboardData(String(user!.id)),
    enabled: !!user && tokenReady,
    staleTime: 1000 * 60,
    retry: 1,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (
      dashboardData &&
      dashboardData.properties.length === 0 &&
      !user?.has_completed_onboarding &&
      !onboardingDismissed
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOnboarding(true);
    }
  }, [dashboardData, user, onboardingDismissed]);

  if (isLoading) {
    return (
      <div className='flex flex-col w-full max-w-[1600px] mx-auto px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-5 pb-20 opacity-60'>
        <div className='grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 items-stretch'>
          {[1, 2, 3, 4].map((i) => (
            <HeroCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className='flex h-screen flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6 text-center'>
        <Card className='w-16 h-16 flex items-center justify-center text-red-500 mb-4'>
          <AlertTriangle size={32} />
        </Card>
        <h2 className='text-xl font-black text-slate-900 dark:text-white mb-2'>
          Erro ao carregar Dashboard
        </h2>
        <p className='text-slate-500 dark:text-slate-400 mb-6 max-w-md font-medium'>
          Não conseguimos sincronizar seus dados agora.
        </p>
        <Button onClick={() => refetch()} variant='default' size='lg'>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const {
    metrics,
    financialHistory,
    activities,
    topProperties,
    portfolioHealth,
    wealthHistory,
    properties,
  } = dashboardData;

  return (
    <div
      className={`flex flex-col w-full max-w-[1600px] mx-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    >
      {showOnboarding && (
        <OwnerOnboardingWizard
          onComplete={() => {
            setShowOnboarding(false);
            setOnboardingDismissed(true);
          }}
        />
      )}
      <TopBar title='Dashboard' subtitle='Visão Geral do Patrimônio'>
        <Button
          onClick={() => navigate('/properties', { state: { openAdd: true } })}
          variant='default'
          size='default'
        >
          <Plus size={16} />
          <span className='hidden sm:inline'>Novo Imóvel</span>
        </Button>
      </TopBar>

      <div className='px-4 md:px-6 py-4 md:py-5 space-y-5 pb-20'>
        {/* Top Section: Metrics & Communication Integrated */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
          {/* Main Area (Left) - 2x2 Grid */}
          <div className='lg:col-span-8 flex flex-col gap-4'>
            <HeroMetrics metrics={metrics} navigate={navigate} />
          </div>

          {/* Side Hub (Right) - 4/12 Columns */}
          <div className='lg:col-span-4 h-full'>
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

        <PortfolioHealth health={portfolioHealth} />

        {/* Row 3: Assets & Wealth Evolution (SIDE BY SIDE) */}
        <div className='grid grid-cols-1 lg:grid-cols-12 items-stretch'>
          <section className='lg:col-span-5 flex flex-col gap-0 relative'>
            <SectionHeader title='Gestão de Ativos' subtitle='Patrimônio ativo' />
            <Button
              onClick={() => navigate('/properties')}
              variant='link'
              size='sm'
              className='self-center -mt-2 mb-0.5'
            >
              Ver todos
            </Button>
            <div className='relative group/carousel'>
              {properties.length > 0 ? (
                <Carousel
                  className='w-full'
                  opts={{
                    duration: 1,
                    align: 'start',
                    containScroll: 'trimSnaps',
                  }}
                >
                  <CarouselContent className='ml-0'>
                    {properties.slice(0, 5).map((prop: any) => (
                      <CarouselItem key={prop.id} className='basis-full p-2'>
                        <PropertyCard
                          property={prop}
                          onClick={(p: any) => navigate(`/properties?id=${p.id}`)}
                          viewMode='grid'
                          className='h-full w-full'
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {properties.length > 1 && (
                    <div className='absolute -right-2 -top-12 flex gap-2'>
                      <CarouselPrevious className='static translate-y-0 h-8 w-8' />
                      <CarouselNext className='static translate-y-0 h-8 w-8' />
                    </div>
                  )}
                </Carousel>
              ) : (
                <Card
                  onClick={() => navigate('/properties', { state: { openAdd: true } })}
                  className='h-48 flex flex-col items-center justify-center p-8 border-2 border-dashed border-border hover:border-primary transition-all cursor-pointer group'
                >
                  <div className='w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all mb-3'>
                    <Plus size={24} strokeWidth={3} />
                  </div>
                  <p className='text-sm font-black text-card-foreground'>Cadastrar imóvel</p>
                </Card>
              )}
            </div>
          </section>

          <section className='lg:col-span-7 lg:pl-5 lg:pt-6'>
            <WealthEvolutionChart
              wealthHistory={wealthHistory || []}
              isDark={isDark}
              className='h-full'
            />
          </section>
        </div>

        {/* Row 5: Full-Width Cash Flow */}
        <section className='w-full'>
          <CashFlowChart financialHistory={financialHistory || []} isDark={isDark} />
        </section>

        {/* Row 6: Main Content & Sidebar */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch'>
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
