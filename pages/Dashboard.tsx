import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertTriangle, ChevronRight, Settings } from 'lucide-react';
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
import { OwnerOnboardingWizard } from '../components/layout/OwnerOnboardingWizard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, tokenReady } = useAuth();
  const { isDark } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [governanceExpanded, setGovernanceExpanded] = useState(false);
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

  // Global cursor spotlight: delegates to all .lg-card and .lg-topbar elements on the page
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.target as Element).closest('.lg-card, .lg-topbar') as HTMLElement | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      target.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
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
      <div className='flex h-screen flex-col items-center justify-center bg-background p-6 text-center'>
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
    <div className='flex flex-col w-full max-w-[1600px] mx-auto'>
      <div
        className={`transition-opacity duration-200 motion-safe:transition-opacity motion-safe:duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
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
          <div className='flex items-center gap-1.5'>
            <Button
              onClick={() => navigate('/settings')}
              variant='glass'
              size='icon-sm'
              className='md:hidden'
              title='Configurações'
            >
              <Settings size={16} />
            </Button>
            <Button
              onClick={() => navigate('/properties', { state: { openAdd: true } })}
              variant='glass'
              size='default'
            >
              <Plus size={16} />
              <span className='hidden sm:inline'>Novo Imóvel</span>
            </Button>
          </div>
        </TopBar>

        <div className='px-4 md:px-6 py-4 md:py-5 space-y-5 pb-20'>
          {/* Top Section: Metrics & Communication Integrated */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch'>
            {governanceExpanded ? (
              <>
                <div className='lg:col-span-12 h-full'>
                  <CommunicationHub
                    expanded
                    onToggleExpand={() => setGovernanceExpanded(false)}
                    onNewAnnouncement={() => navigate('/governance', { state: { create: true } })}
                  />
                </div>
                <div className='lg:col-span-12 flex flex-col gap-4'>
                  <HeroMetrics metrics={metrics} navigate={navigate} />
                </div>
              </>
            ) : (
              <>
                {/* Main Area (Left) - 2x2 Grid */}
                <div className='lg:col-span-8 flex flex-col'>
                  <HeroMetrics
                    metrics={metrics}
                    navigate={navigate}
                    portfolioHealth={portfolioHealth}
                    propertyCount={properties?.length}
                    className='h-full'
                  />
                </div>

                {/* Side Hub (Right) - 4/12 Columns */}
                <div className='lg:col-span-4 h-full'>
                  <CommunicationHub
                    onToggleExpand={() => setGovernanceExpanded(true)}
                    onNewAnnouncement={() => navigate('/governance', { state: { create: true } })}
                  />
                </div>
              </>
            )}
          </div>

          <PortfolioHealth health={portfolioHealth} />

          {/* Row 3: Assets & Wealth Evolution (SIDE BY SIDE) */}
          <div className='grid grid-cols-1 lg:grid-cols-12 items-stretch'>
            <section className='lg:col-span-5 flex flex-col gap-3'>
              <div className='flex items-center justify-between'>
                <SectionHeader title='Gestão de Ativos' subtitle='Patrimônio ativo' />
                <Button
                  onClick={() => navigate('/properties')}
                  variant='link'
                  size='sm'
                  className='text-xs font-semibold text-muted-foreground'
                >
                  Ver Todos <ChevronRight size={12} />
                </Button>
              </div>
              <div className='lg-card group/carousel p-3'>
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
                        <CarouselItem key={prop.id} className='basis-full p-1'>
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
                      <div className='flex gap-2 mt-3 justify-center'>
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
              <ActivityTimeline activities={activities || []} onActionComplete={() => refetch()} />
            </div>

            {/* Right: AI Insights */}
            <div className='lg:col-span-4 flex flex-col'>
              <DashboardAIInsights metrics={metrics} onActionComplete={() => refetch()} />
            </div>
          </div>

          {/* Row 7: Full-Width Property Performance */}
          <section className='w-full'>
            <PropertyPerformance topProperties={topProperties || []} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
