import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Receipt,
  User,
  LogOut,
  Moon,
  Sun,
  LifeBuoy,
  Settings as SettingsIcon,
  Lock,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { UserButton } from '@clerk/clerk-react';
import { tenantService } from '../services/tenantService';
import { supabase } from '../lib/supabase';

const TenantLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMaintenanceRoute = location.pathname === '/tenant/maintenance';

  const [isOnboardingRequired, setIsOnboardingRequired] = useState(false);
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);
  const [tenantData, setTenantData] = useState<any>(null);
  const [pendingInspection, setPendingInspection] = useState<any>(null);

  const checkOnboardingStatus = async () => {
    if (!user?.id) return;
    try {
      const data = await tenantService.getById(user.id);
      if (data) {
        setTenantData(data);

        let hasPendingInspection = false;
        if (data.property_id) {
          const { data: inspRes } = await supabase
            .from('inspections')
            .select('*')
            .eq('property_id', data.property_id)
            .in('status', ['Pendente', 'Em Revisão'])
            .maybeSingle();

          if (inspRes) {
            setPendingInspection(inspRes);
            hasPendingInspection = true;
          } else {
            setPendingInspection(null);
          }
        } else {
          setPendingInspection(null);
        }

        const hasActiveContract = data.contract?.status === 'active';
        const hasCpf = !!data.cpf;
        const isRequired =
          data.onboarding_stage !== 'completed' &&
          !(data.has_completed_onboarding && hasActiveContract && hasCpf);
        setIsOnboardingRequired(isRequired);
      }
    } catch (err) {
      console.error('Error checking tenant onboarding status:', err);
    } finally {
      setLoadingOnboarding(false);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, [user?.id]);

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
    <div className='flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark transition-colors'>
      {/* ─── Desktop Sidebar ─── */}
      <aside className='hidden md:flex flex-col w-72 h-full shrink-0 relative'>
        {/* Glass background layer */}
        <div className='absolute inset-0 bg-white/80 dark:bg-[#0d1517]/90 backdrop-blur-xl border-r border-slate-200/60 dark:border-white/[0.06]' />

        {/* Subtle top gradient accent */}
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent' />

        <div className='relative flex flex-col h-full z-10'>
          {/* ── Brand Header ── */}
          <div className='px-6 pt-7 pb-6'>
            <Link
              to='/tenant'
              className='flex items-center gap-3 group'
            >
              {/* Logo mark */}
              <div className='relative w-9 h-9 shrink-0'>
                <div className='absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow duration-300' />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-white font-black text-base tracking-tighter'>I</span>
                </div>
              </div>
              <div>
                <h1 className='text-[15px] font-black text-slate-900 dark:text-white tracking-tight leading-none'>
                  Igloo
                </h1>
                <span className='text-[9px] font-black text-primary uppercase tracking-[0.18em] leading-none'>
                  Portal Inquilino
                </span>
              </div>
            </Link>
          </div>

          {/* ── User Card ── */}
          <div className='px-4 mb-6'>
            <div className='relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.07] p-4'>
              <div className='flex items-center gap-3'>
                <div className='pointer-events-none shrink-0'>
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox: 'w-10 h-10 rounded-xl',
                        userButtonTrigger: 'pointer-events-none',
                      },
                    }}
                  />
                </div>
                <div className='flex flex-col min-w-0 flex-1'>
                  <span className='text-sm font-bold text-slate-800 dark:text-white truncate leading-none mb-1'>
                    {user?.name || 'Bem-vindo'}
                  </span>
                  <span className='text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] leading-none'>
                    Inquilino
                  </span>
                </div>
                {!isOnboardingRequired && (
                  <Link to='/tenant/settings'>
                    <div className='w-7 h-7 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all'>
                      <ChevronRight size={14} />
                    </div>
                  </Link>
                )}
              </div>

              {/* Onboarding progress indicator */}
              {isOnboardingRequired && (
                <div className='mt-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.06]'>
                  <div className='flex items-center gap-2'>
                    <Zap size={11} className='text-amber-500 shrink-0' />
                    <span className='text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.1em]'>
                      Complete o cadastro
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Navigation Label ── */}
          <div className='px-6 mb-2'>
            <span className='text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.22em]'>
              Navegação
            </span>
          </div>

          {/* ── Nav Items ── */}
          <nav className='flex-1 px-3 space-y-0.5 overflow-y-auto'>
            {navItems.map((item) => {
              const isDisabled = item.disabled;

              if (isDisabled) {
                return (
                  <div
                    key={item.path}
                    title='Complete o onboarding para desbloquear este menu'
                    className='group flex items-center justify-between px-3 py-3.5 rounded-2xl text-slate-300 dark:text-slate-700 cursor-not-allowed select-none'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.03] flex items-center justify-center'>
                        <item.icon size={17} strokeWidth={2} className='text-slate-300 dark:text-slate-700' />
                      </div>
                      <div>
                        <span className='text-sm font-semibold text-slate-300 dark:text-slate-700 leading-none block'>
                          {item.label}
                        </span>
                        <span className='text-[10px] text-slate-300 dark:text-slate-700 leading-none mt-0.5 block'>
                          {item.description}
                        </span>
                      </div>
                    </div>
                    <Lock size={12} className='text-slate-300 dark:text-slate-700 shrink-0' />
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/tenant'}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-3.5 rounded-2xl transition-all duration-200 ease-out ${
                      isActive
                        ? 'bg-primary/[0.08] dark:bg-primary/[0.12]'
                        : 'hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator line */}
                      {isActive && (
                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full' />
                      )}

                      {/* Icon container */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/80 dark:group-hover:bg-white/[0.08] group-hover:text-slate-700 dark:group-hover:text-slate-200'
                        }`}
                      >
                        <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                      </div>

                      {/* Label + description */}
                      <div className='flex-1 min-w-0'>
                        <span
                          className={`text-sm leading-none block mb-0.5 transition-colors ${
                            isActive
                              ? 'font-bold text-primary'
                              : 'font-semibold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`text-[10px] leading-none block transition-colors ${
                            isActive
                              ? 'text-primary/60'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          {item.description}
                        </span>
                      </div>

                      {isActive && (
                        <div className='w-1.5 h-1.5 rounded-full bg-primary shrink-0' />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* ── Footer Actions ── */}
          <div className='p-3 mt-2 border-t border-slate-200/60 dark:border-white/[0.05] space-y-0.5'>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className='group flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-all duration-200'
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-white/[0.05] transition-all group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 group-hover:text-amber-500`}
              >
                {isDark ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
              </div>
              <span className='text-sm font-semibold'>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className='group flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-red-50/80 dark:hover:bg-red-500/[0.08] hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 cursor-pointer'
            >
              <div className='w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-white/[0.05] transition-all group-hover:bg-red-50 dark:group-hover:bg-red-500/10 group-hover:text-red-500'>
                <LogOut size={17} strokeWidth={2} />
              </div>
              <span className='text-sm font-semibold'>Sair</span>
            </button>
          </div>

          {/* Bottom gradient fade */}
          <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none' />
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
                      <item.icon size={22} strokeWidth={1.8} className='text-slate-300 dark:text-slate-700' />
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
                          isActive
                            ? 'text-primary'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Logout button */}
            <button
              onClick={async () => await logout()}
              className='flex flex-col items-center justify-center w-14 gap-1 text-slate-400 dark:text-slate-500 hover:text-red-400 transition-colors active:scale-90'
            >
              <div className='w-10 h-10 rounded-2xl flex items-center justify-center'>
                <LogOut size={21} strokeWidth={1.8} />
              </div>
              <span className='text-[9px] font-black leading-none'>Sair</span>
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
};

export default TenantLayout;
