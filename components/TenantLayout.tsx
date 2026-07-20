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
import { tenantService } from '../services/tenancy/tenantService';
import { inspectionService } from '../services/maintenance/inspectionService';
import { TopBar } from './layout/TopBar';
import { TenantSidebar } from './tenant/TenantSidebar';
import { TenantMobileNav } from './tenant/TenantMobileNav';

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
    <div
      className='flex h-full w-full overflow-hidden text-foreground relative gap-5'
      style={{ background: 'transparent' }}
    >
      <div className='lg-blob-field' aria-hidden='true' />
      <div className='lg-blob-3' aria-hidden='true' />

      <TenantSidebar
        navItems={navItems}
        userName={user?.name}
        onboardingRequired={isOnboardingRequired}
      />

      <main className='flex-1 min-w-0 overflow-hidden flex flex-col relative h-full w-full'>
        <div className='md:hidden block shrink-0'>
          <TopBar
            title={
              navItems.find((i) => i.path === location.pathname)?.label || 'Portal do Inquilino'
            }
            subtitle='Área do Locatário'
          />
        </div>

        <div
          className={`flex-1 overflow-y-auto pb-24 w-full scroll-smooth ${
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

        <TenantMobileNav navItems={navItems} />
      </main>
    </div>
  );
};

export default TenantLayout;
