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
import { tenantService } from '../services/tenancy/tenantService';
import { supabase } from '../lib/supabase';

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
          const { data: inspRes } = await supabase
            .from('inspections')
            .select('*')
            .eq('property_id', data.property_id)
            .in('status', ['Pendente', 'Em Revisão'])
            .maybeSingle();

          if (inspRes) {
            setPendingInspection(inspRes);
          } else {
            setPendingInspection(null);
          }
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
      <div className='flex h-screen items-center justify-center bg-background-light dark:bg-background-dark'>
        <div className='flex flex-col items-center gap-4'>
          <div className='relative'>
            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center'>
              <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin' />
            </div>
          </div>
          <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark'>
      {/* ─── Desktop Sidebar ─── */}
      <aside className='hidden md:flex flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-white/5 h-full shrink-0 z-50'>
        <div className='p-6 flex items-center gap-3 mb-2'>
          <Link
            to='/tenant'
            className='flex items-center gap-3 hover:opacity-80 transition-opacity group'
          >
            <div className='w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-bold shadow-lg shadow-black/10 group-hover:scale-105 transition-transform'>
              I
            </div>
            <div>
              <h1 className='text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none'>
                Igloo
              </h1>
              <span className='text-[9px] font-black text-primary uppercase tracking-[0.18em] leading-none'>
                Portal Inquilino
              </span>
            </div>
          </Link>
        </div>

        <nav className='flex-1 px-4 space-y-1.5 overflow-y-auto'>
          <div className='mb-6'>
            <p className='px-4 mb-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]'>
              Menu Principal
            </p>
            {navItems.map((item) => {
              const isDisabled = item.disabled;

              if (isDisabled) {
                return (
                  <div
                    key={item.path}
                    title='Complete o onboarding para desbloquear este menu'
                    className='group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-300 dark:text-slate-700 cursor-not-allowed select-none'
                  >
                    <item.icon size={20} strokeWidth={2} />
                    <span className='text-sm font-medium tracking-wide'>{item.label}</span>
                    <Lock size={12} className='ml-auto shrink-0' />
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/tenant'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 ease-out ${
                      isActive
                        ? 'bg-primary/5 dark:bg-white/10 text-slate-main dark:text-white shadow-premium ring-1 ring-primary/10 dark:ring-white/5'
                        : 'text-slate-body dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-main dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`transition-colors duration-300 ${isActive ? 'text-primary drop-shadow-sm' : 'group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}
                      >
                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span
                        className={`text-sm font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <div className='absolute right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,200,236,0.6)] animate-scaleUp' />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {isOnboardingRequired && (
            <div className='px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20'>
              <div className='flex items-center gap-2'>
                <Zap size={13} className='text-amber-500 shrink-0' />
                <span className='text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.1em]'>
                  Complete o cadastro
                </span>
              </div>
            </div>
          )}
        </nav>

        <div className='p-4 mx-4 mb-4 border-t border-gray-100 dark:border-white/5 space-y-1'>
          <Link
            to='/tenant/settings'
            className='flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all group'
          >
            <div className='pointer-events-none'>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-10 h-10 rounded-xl',
                    userButtonTrigger: 'pointer-events-none',
                  },
                }}
              />
            </div>
            <div className='flex flex-col min-w-0'>
              <span className='text-sm font-bold text-slate-main dark:text-slate-200 truncate'>
                {user?.name || 'Carregando...'}
              </span>
              <span className='text-[10px] font-medium text-slate-body dark:text-slate-400 capitalize'>
                Inquilino
              </span>
            </div>
          </Link>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main
        className={`flex-1 ${
          isMaintenanceRoute ? 'overflow-hidden' : 'overflow-y-auto'
        } flex flex-col relative h-full w-full custom-scrollbar`}
      >
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

        {/* ─── Mobile Bottom Navigation ─── */}
        <nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom'>
          {/* Glass background */}
          <div className='absolute inset-0 bg-white/90 dark:bg-[#0d1517]/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-white/[0.07] shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.08)]' />

          <div className='relative flex justify-around items-center h-16 max-w-lg mx-auto px-2'>
            {navItems.map((item) => {
              const isDisabled = item.disabled;
              if (isDisabled) {
                return (
                  <div
                    key={item.path}
                    className='flex flex-col items-center justify-center w-14 gap-1 cursor-not-allowed select-none'
                    title='Complete o onboarding para desbloquear'
                  >
                    <div className='relative'>
                      <item.icon
                        size={22}
                        strokeWidth={1.8}
                        className='text-slate-300 dark:text-slate-700'
                      />
                      <div className='absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center'>
                        <Lock size={7} className='text-white dark:text-slate-900' />
                      </div>
                    </div>
                    <span className='text-[9px] font-bold text-slate-300 dark:text-slate-700'>
                      {item.label}
                    </span>
                  </div>
                );
              }
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/tenant'}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center w-14 gap-1 transition-all duration-200 active:scale-90 ${
                      isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className='relative'>
                        {/* Active pill indicator */}
                        {isActive && (
                          <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full' />
                        )}
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          <item.icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-black leading-none transition-colors ${
                          isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
};

export default TenantLayout;
