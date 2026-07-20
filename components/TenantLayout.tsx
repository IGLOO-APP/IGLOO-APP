import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Receipt,
  User,
  LifeBuoy,
  Settings as SettingsIcon,
  FileText,
  Lock,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserButton } from '@clerk/clerk-react';
import { Toolbar, Tabbar, TabbarLink } from 'konsta/react';
import { tenantService } from '../services/tenancy/tenantService';
import { inspectionService } from '../services/maintenance/inspectionService';
import { preloadRoute } from '../lib/routePreloader';
import { TopBar } from './layout/TopBar';

const TenantLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMaintenanceRoute = location.pathname === '/tenant/maintenance';

  const [isOnboardingRequired, setIsOnboardingRequired] = useState(false);
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);
  const [tenantData, setTenantData] = useState<any>(null);
  const [pendingInspection, setPendingInspection] = useState<any>(null);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await tenantService.getById(user.id);
      if (data) {
        setTenantData(data);

        if (data.property_id) {
          const inspections = await inspectionService.getByProperty(data.property_id);
          const pending = inspections.find((i) =>
            ['Pendente', 'Em Revisão'].includes(i.status)
          );
          setPendingInspection(pending || null);
        } else {
          setPendingInspection(null);
        }

        const hasActiveContract = data.contract?.status === 'active';
        const hasCpf = !!data.cpf;

        // Check if ANY step is rejected or pending
        const hasRejectedProfile = data.onboarding_profile_status === 'rejected';
        const hasRejectedDocuments = data.onboarding_documents_status === 'rejected';
        const hasRejectedContract = data.onboarding_contract_status === 'rejected';
        const hasRejectedInspection = data.onboarding_inspection_status === 'rejected';
        const hasPendingProfile = data.onboarding_profile_status !== 'approved';
        const hasPendingDocuments = data.onboarding_documents_status !== 'approved';
        const hasPendingContract =
          data.onboarding_contract_status !== 'approved' && !hasActiveContract;
        const hasPendingOnboardingInspection = data.onboarding_inspection_status !== 'approved';

        const hasRejectedAny =
          hasRejectedProfile ||
          hasRejectedDocuments ||
          hasRejectedContract ||
          hasRejectedInspection;
        const hasPendingAny =
          hasPendingProfile ||
          hasPendingDocuments ||
          hasPendingContract ||
          hasPendingOnboardingInspection;

        const isRequired =
          hasRejectedAny ||
          hasPendingAny ||
          (data.onboarding_stage !== 'completed' &&
            !(data.has_completed_onboarding && hasActiveContract && hasCpf));
        setIsOnboardingRequired(isRequired);
      }
    } catch (err) {
      console.error('Error checking tenant onboarding status:', err);
    } finally {
      setLoadingOnboarding(false);
    }
  }, [user?.id]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  useEffect(() => {
    if (!loadingOnboarding && isOnboardingRequired && location.pathname !== '/tenant') {
      navigate('/tenant', { replace: true });
    }
  }, [loadingOnboarding, isOnboardingRequired, location.pathname, navigate]);

  const navItems = [
    {
      path: '/tenant',
      label: 'Início',
      icon: Home,
      description: 'Painel principal',
    },
    {
      path: '/tenant/contract',
      label: 'Contrato',
      icon: FileText,
      description: 'Meu contrato de locação',
      disabled: isOnboardingRequired,
    },
    {
      path: '/tenant/payments',
      label: 'Pagamentos',
      icon: Receipt,
      description: 'Histórico e boletos',
      disabled: isOnboardingRequired,
    },
    {
      path: '/tenant/maintenance',
      label: 'Suporte',
      icon: LifeBuoy,
      description: 'Chamados e ajuda',
      disabled: isOnboardingRequired,
    },
    {
      path: '/tenant/messages',
      label: 'Mensagens',
      icon: MessageSquare,
      description: 'Comunicados e conversas',
      disabled: isOnboardingRequired,
    },
    {
      path: '/tenant/profile',
      label: 'Meu Perfil',
      icon: User,
      description: 'Dados e documentos',
      disabled: isOnboardingRequired,
    },
    {
      path: '/tenant/settings',
      label: 'Configurações',
      icon: SettingsIcon,
      description: 'Conta e preferências',
      disabled: isOnboardingRequired,
    },
  ];

  if (loadingOnboarding) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='relative'>
            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center'>
              <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin' />
            </div>
          </div>
          <p className='text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]'>
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className='flex h-full w-full overflow-hidden text-foreground relative gap-5'
      style={{ background: 'transparent' }}
    >
      {/* Blob background */}
      <div className='lg-blob-field' aria-hidden='true' />
      <div className='lg-blob-3' aria-hidden='true' />

      {/* ─── Desktop Sidebar ─── */}
      <aside
        className='hidden md:flex flex-col w-64 shrink-0 relative z-10 lg-sidebar pl-5'
        style={{ background: 'transparent' }}
      >
        <div className='px-6 mb-6 mt-4'>
          <Link to='/tenant' className='inline-block'>
            <h1 className='font-sans text-4xl font-bold tracking-tight text-foreground transition-colors duration-200'>
              Igloo
            </h1>
          </Link>
        </div>

        <nav className='flex-1 overflow-y-auto scroll-smooth custom-scrollbar'>
          <ul className='flex flex-col gap-0.5 px-6'>
            <p className='px-4 mb-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]'>
              Menu Principal
            </p>
            {navItems.map((item) => {
              const isDisabled = item.disabled;

              if (isDisabled) {
                return (
                  <li key={item.path}>
                    <div
                      title='Complete o onboarding para desbloquear este menu'
                      className='flex items-center gap-4 px-6 py-3 rounded-xl text-sidebar-foreground/40 cursor-not-allowed select-none'
                    >
                      <item.icon size={20} strokeWidth={1.8} />
                      <span className='text-sm font-medium'>{item.label}</span>
                      <Lock size={12} strokeWidth={1.8} className='ml-auto shrink-0' />
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/tenant'}
                    onMouseEnter={() => preloadRoute(item.path)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'sidebar-item-active'
                          : 'text-sidebar-foreground/70 hover:text-white hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={20}
                          strokeWidth={1.8}
                          className={`transition-colors duration-200 ${
                            isActive ? 'text-white' : 'text-sidebar-foreground/50'
                          }`}
                        />
                        <span className='text-sm font-medium'>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
            {isOnboardingRequired && (
              <li className='px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20'>
                <div className='flex items-center gap-2'>
                  <Zap size={13} strokeWidth={1.8} className='text-amber-500 shrink-0' />
                  <span className='text-[10px] font-semibold text-amber-400 uppercase tracking-[0.1em]'>
                    Complete o cadastro
                  </span>
                </div>
              </li>
            )}
          </ul>
        </nav>

        {/* Bottom Section: Profile */}
        <div className='px-6 flex flex-col gap-2 pt-3 border-t border-sidebar-border mt-auto relative z-10'>
          <Link to='/tenant/settings' className='flex items-center gap-3 group/profile'>
            <div className='pointer-events-none transition-transform duration-200 group-hover/profile:scale-105'>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-9 h-9 rounded-full',
                    userButtonTrigger: 'pointer-events-none',
                  },
                }}
              />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-sm font-semibold text-foreground truncate group-hover/profile:text-primary transition-colors duration-200'>
                {user?.name || 'Carregando...'}
              </span>
              <span className='text-xs text-muted-foreground capitalize'>Inquilino</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main
        className={`flex-1 lg-card p-0 ${
          isMaintenanceRoute ? 'overflow-hidden' : 'overflow-y-auto'
        } flex flex-col relative h-full w-full custom-scrollbar`}
      >
        {/* Mobile TopBar Header */}
        <div className='md:hidden block shrink-0'>
          <TopBar
            title={navItems.find((i) => i.path === location.pathname)?.label || 'Portal do Inquilino'}
            subtitle='Área do Locatário'
          />
        </div>

        <div
          className={`flex-1 w-full relative ${
            isMaintenanceRoute ? 'h-full min-h-0 overflow-hidden' : ''
          }`}
        >
          <Outlet
            context={{
              isOnboardingRequired,
              loadingOnboarding,
              tenantData,
              pendingInspection,
              refetchOnboarding: checkOnboardingStatus,
            }}
          />
        </div>

        {/* ─── Mobile Bottom Navigation — Konsta Tabbar ─── */}
        <Toolbar className='md:hidden fixed bottom-0 left-0 right-0 z-50' tabbar>
          <Tabbar>
            {navItems
              .filter((item) => item.path !== '/tenant/profile' && item.path !== '/tenant/settings')
              .map((item) => {
                const isActive = !item.disabled && location.pathname === item.path;
                if (item.disabled) {
                  return (
                    <TabbarLink
                      key={item.path}
                      active={false}
                      label={item.label}
                      className='opacity-35 cursor-not-allowed'
                      title='Complete o onboarding para desbloquear'
                    >
                      <span className='relative inline-flex'>
                        <item.icon size={21} strokeWidth={1.8} />
                        <span className='absolute -top-1 -right-2 w-3 h-3 bg-slate-400 rounded-full flex items-center justify-center'>
                          <Lock size={6} className='text-white' />
                        </span>
                      </span>
                    </TabbarLink>
                  );
                }
                return (
                  <TabbarLink
                    key={item.path}
                    active={isActive}
                    label={item.label}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                  </TabbarLink>
                );
              })}
          </Tabbar>
        </Toolbar>
      </main>
    </div>
  );
};

export default TenantLayout;
