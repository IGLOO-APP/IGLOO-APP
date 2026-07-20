import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Receipt,
  User,
  LifeBuoy,
  Settings as SettingsIcon,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { tenantService } from '../services/tenancy/tenantService';
import { inspectionService } from '../services/maintenance/inspectionService';
import { SidebarProvider } from './ui/sidebar';
import { MobileNav } from './layout/MobileNav';
import { TenantSidebar } from './tenant/TenantSidebar';

const mobileNavItems = [
  { path: '/tenant', label: 'Início', icon: Home },
  { path: '/tenant/contract', label: 'Contrato', icon: FileText },
  { path: '/tenant/payments', label: 'Pagamentos', icon: Receipt },
  { path: '/tenant/maintenance', label: 'Suporte', icon: LifeBuoy },
  { path: '/tenant/messages', label: 'Mensagens', icon: MessageSquare },
];

const TenantLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

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
          const pending = inspections.find((i) => ['Pendente', 'Em Revisão'].includes(i.status));
          setPendingInspection(pending || null);
        } else {
          setPendingInspection(null);
        }

        const hasActiveContract = data.contract?.status === 'active';
        const hasCpf = !!data.cpf;

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
      disabled: false,
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
    <SidebarProvider className='h-full w-full overflow-hidden'>
      <div className='lg-blob-field' aria-hidden='true' />
      <div className='lg-blob-3' aria-hidden='true' />

      <div
        className='flex h-full w-full overflow-hidden text-foreground relative gap-5'
        style={{ background: 'transparent' }}
      >
        <div className='hidden md:block shrink-0 relative z-10 pl-5'>
          <TenantSidebar
            navItems={navItems}
            userName={user?.name}
            onboardingRequired={isOnboardingRequired}
            isDark={isDark}
            toggleTheme={toggleTheme}
            logout={logout}
          />
        </div>

        <main className='flex-1 min-w-0 overflow-hidden flex flex-col relative h-full w-full text-foreground'>
          <div className='relative z-10 flex flex-col flex-1 min-h-0'>
            <div
              className={`flex-1 overflow-y-auto w-full scroll-smooth ${location.pathname === '/tenant/messages' ? 'pb-0' : 'pb-24 md:pb-0'}`}
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

            <MobileNav navItems={mobileNavItems} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TenantLayout;
