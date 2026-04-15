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
  });
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    // Simulate loading for animation
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  if (isLoading || !dashboardData) {
    return (
      <div className='flex h-screen items-center justify-center bg-background-light dark:bg-background-dark'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  const { metrics, financialHistory, topProperties, activities, onboarding } = dashboardData;

  return (
    <div
      className={`flex flex-col w-full max-w-[1600px] mx-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* --- HEADER --- */}
      <header className='sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <div
            className='relative group cursor-pointer'
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className='w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 p-[2px]'>
              <div className='w-full h-full rounded-[14px] bg-surface-light dark:bg-surface-dark flex items-center justify-center overflow-hidden'>
                <img
                  src={
                    user?.avatar ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuDwRIAHlgLaW6OqzLEr6KH9kj4TGcypVin8vG0nCnlg_EiRsv3e561_S0pU6gWh-_QTbZSo1wTTeTa1eUzsn3qDoV7F2ZkeYhUXC1qQ693w1T_qhEMSRNparuohwnqCxmtjp1WP7yfrOyV41z5DUDYQWtT2DN2BOuEvt-l4Zme5iHAST-ZPnDLEWyZDtU3KB7inrHYdgFQW0i41SlR9Gu26TEHY7zIfA7Yz2Y6_85c20Atg3MSIoA-q5EdHHyFckC73eced5eTGvEg3'
                  }
                  alt='User'
                  className='w-full h-full object-cover'
                />
              </div>
            </div>
            <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark'></div>
          </div>
          <div>
            <h1 className='text-xl font-bold text-slate-900 dark:text-white leading-tight'>
              Olá, Investidor
            </h1>
            <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
              Visão geral do seu portfólio
            </p>
          </div>
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

        {showUserMenu && (
          <>
            <div className='fixed inset-0 z-30' onClick={() => setShowUserMenu(false)}></div>
            <div className='absolute top-20 left-6 w-64 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 py-2 z-40 animate-scaleUp origin-top-left'>
              <button
                onClick={() => navigate('/profile')}
                className='w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200'
              >
                <User size={18} /> Meu Perfil
              </button>
              <button
                onClick={() => navigate('/settings')}
                className='w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200'
              >
                <Settings size={18} /> Configurações
              </button>
              <button
                onClick={async () => {
                  setShowUserMenu(false);
                  await logout();
                }}
                className='w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 text-sm font-bold text-red-500'
              >
                <LogOut size={18} /> Sair
              </button>
            </div>
          </>
        )}
      </header>

      <div className='p-6 space-y-8 pb-24'>
        {/* --- 0. ONBOARDING --- */}
        {!onboarding?.allCompleted && (
          <OnboardingChecklist onboarding={onboarding} />
        )}



        {/* --- 1. HERO METRICS --- */}
        <HeroMetrics metrics={metrics} />

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
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
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
