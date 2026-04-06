import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  ArrowUp,
  ArrowDown,
  Wrench,
  FileText,
  Plus,
  UserPlus,
  Home,
  Receipt,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  Activity,
  Zap,
  ChevronRight,
  Filter,
  PieChart as PieChartIcon,
  Search,
  Download,
  ExternalLink,
  Lightbulb,
  MoreHorizontal,
  Check,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Sector,
  ReferenceLine,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { dashboardService } from '../services/dashboardService';
import { HeroCard, AlertBadge } from '../components/ui/DashboardComponents';
const AnnouncementBanner = lazy(() => import('../components/AnnouncementBanner'));

const OnboardingChecklist: React.FC<{ onboarding: any }> = ({ onboarding }) => {
  const navigate = useNavigate();
  
  const steps = [
    {
      id: 1,
      title: 'Cadastre seu primeiro imóvel',
      completed: onboarding.step1,
      actionLabel: 'Adicionar Imóvel',
      onClick: () => navigate('/properties', { state: { openAdd: true } }),
      disabled: false,
    },
    {
      id: 2,
      title: 'Cadastre seu primeiro inquilino',
      completed: onboarding.step2,
      actionLabel: 'Adicionar Inquilino',
      onClick: () => navigate('/tenants', { state: { openAdd: true } }),
      disabled: !onboarding.step1,
      tooltip: 'Cadastre um imóvel primeiro',
    },
    {
      id: 3,
      title: 'Crie seu primeiro contrato',
      completed: onboarding.step3,
      actionLabel: 'Criar Contrato',
      onClick: () => navigate('/contracts', { state: { openWizard: true } }),
      disabled: !onboarding.step1 || !onboarding.step2,
      tooltip: 'Cadastre um imóvel e um inquilino primeiro',
    },
    {
      id: 4,
      title: 'Configure seu método de recebimento',
      completed: onboarding.step4,
      actionLabel: 'Configurar',
      onClick: () => navigate('/settings', { state: { activeTab: 'financial' } }),
      disabled: false,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className='bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden animate-fadeIn'>
      <div className='absolute top-0 right-0 p-4 opacity-10'>
        <Zap size={100} />
      </div>
      
      <div className='relative z-10'>
        <div className='flex items-center gap-2 mb-1'>
          <h2 className='text-xl font-bold'>Configure sua conta</h2>
        </div>
        <p className='text-sm text-indigo-100 opacity-90 mb-6'>Complete os passos abaixo para começar a usar o Igloo</p>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex justify-between text-xs font-bold uppercase tracking-wider'>
              <span>Progresso</span>
              <span>{completedCount} de {steps.length} concluídos</span>
            </div>
            <div className='w-full h-2 bg-white/20 rounded-full overflow-hidden'>
              <div 
                className='h-full bg-white rounded-full transition-all duration-1000' 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-2'>
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  step.completed 
                    ? 'bg-white/10 border-white/10 opacity-60' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    step.completed ? 'bg-emerald-400 text-indigo-900' : 'border-2 border-white/30'
                  }`}>
                    {step.completed && <Check size={14} strokeWidth={4} />}
                  </div>
                  <span className={`text-sm font-bold ${step.completed ? 'line-through opacity-80' : ''}`}>
                    {step.title}
                  </span>
                </div>

                {!step.completed && (
                  <div className='relative group/tooltip'>
                    <button
                      disabled={step.disabled}
                      onClick={step.onClick}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${
                        step.disabled
                          ? 'bg-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-white text-indigo-700 hover:scale-105 active:scale-95 shadow-lg'
                      }`}
                    >
                      {step.actionLabel}
                    </button>
                    {step.disabled && step.tooltip && (
                      <div className='absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10'>
                        {step.tooltip}
                        <div className='absolute top-full right-4 border-4 border-transparent border-t-slate-900'></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SPARK_DATA_1 = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const SPARK_DATA_3 = [80, 85, 82, 88, 90, 95, 92];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, triggerTestNotification } =
    useNotification();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: () => dashboardService.getDashboardData(),
  });

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver((mutations) =>
      mutations.forEach((m) => m.attributeName === 'class' && checkTheme())
    );
    observer.observe(document.documentElement, { attributes: true });

    // Simulate loading for animation
    setTimeout(() => setIsLoaded(true), 100);
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className='flex h-screen items-center justify-center bg-background-light dark:bg-background-dark'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  const { metrics, financialHistory, topProperties, activities } = dashboardData;
  const gaugeData = [
    { name: 'Occupied', value: metrics.occupancyRate },
    { name: 'Vacant', value: 100 - metrics.occupancyRate },
  ];

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
        {!dashboardData.onboarding?.allCompleted && (
          <OnboardingChecklist onboarding={dashboardData.onboarding} />
        )}

        {/* --- 0. ANNOUNCEMENTS --- */}
        <Suspense fallback={<div className='h-40 bg-slate-100 dark:bg-white/5 rounded-[32px] animate-pulse'></div>}>
          <AnnouncementBanner />
        </Suspense>

        {/* --- 1. HERO METRICS --- */}
        <section className='grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
          <HeroCard
            title='Patrimônio Total'
            value={metrics.totalWealth}
            subtext='vs. mês anterior'
            trend={metrics.trends.wealth}
            trendUp={true}
            icon={TrendingUp}
            color='text-indigo-500'
            sparkData={SPARK_DATA_3}
          />
          <HeroCard
            title='Receita Recorrente (MRR)'
            value={metrics.mrr}
            subtext='vs. mês anterior'
            trend={metrics.trends.mrr}
            trendUp={true}
            icon={DollarSign}
            color='text-emerald-500'
            sparkData={SPARK_DATA_1}
          />
          <HeroCard
            title='Taxa de Ocupação'
            value={`${metrics.occupancyRate}%`}
            subtext={metrics.occupancyRate < 80 ? 'Crítico (< 80%)' : 'Saudável (> 80%)'}
            trend={metrics.trends.occupancy}
            trendUp={metrics.occupancyRate >= 80}
            icon={Home}
            color={metrics.occupancyRate < 80 ? 'text-red-500' : 'text-emerald-500'}
          />
          <HeroCard
            title='ROI Médio Anual'
            value={metrics.avgRoi}
            subtext='Acima da inflação'
            trend={metrics.trends.roi}
            trendUp={true}
            icon={Activity}
            color='text-cyan-500'
          />
        </section>

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
            {/* CASH FLOW CHART */}
            <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
              <div className='flex justify-between items-center mb-6'>
                <div>
                  <h3 className='text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                    <DollarSign className='text-primary' size={20} /> Fluxo de Caixa & Projeção
                  </h3>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>
                    Análise financeira com previsão de 3 meses
                  </p>
                </div>
                <button className='p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors'>
                  <Download size={18} className='text-slate-400' />
                </button>
              </div>
              <div className='h-[250px] md:h-[350px] w-full mt-4 md:mt-0'>
                <ResponsiveContainer width='100%' height='100%'>
                  <ComposedChart
                    data={financialHistory}
                    margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      stroke={isDark ? '#334155' : '#e2e8f0'}
                    />
                    <XAxis
                      dataKey='month'
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
                      tickFormatter={(val) => `k${val / 1000}`}
                    />
                    <Tooltip
                      cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className='bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-white/10'>
                              <p className='font-bold mb-2 border-b border-white/10 pb-1'>
                                {label}
                              </p>
                              <div className='space-y-1 text-xs'>
                                <p className='flex justify-between gap-4'>
                                  <span className='text-emerald-400'>Receita:</span>{' '}
                                  <b>R$ {payload[0].value}</b>
                                </p>
                                <p className='flex justify-between gap-4'>
                                  <span className='text-red-400'>Despesa:</span>{' '}
                                  <b>R$ {payload[1].value}</b>
                                </p>
                                <p className='flex justify-between gap-4 border-t border-white/10 pt-1 mt-1'>
                                  <span className='text-cyan-400 font-bold'>Líquido:</span>{' '}
                                  <b>R$ {payload[2].value}</b>
                                </p>
                                {payload[0].payload.projected && (
                                  <p className='text-[10px] text-amber-400 italic mt-2 text-center'>
                                    *Valor Projetado
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey='income'
                      name='Receita'
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                      stackId='a'
                    >
                      {financialHistory.map((entry, index) => (
                        <Cell
                          key={`cell-income-${index}`}
                          fill={entry.projected ? '#10b981' : '#10b981'}
                          fillOpacity={entry.projected ? 0.4 : 1}
                          stroke={entry.projected ? '#10b981' : 'none'}
                          strokeDasharray={entry.projected ? '4 4' : '0'}
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey='expense'
                      name='Despesa'
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                      stackId='a'
                    >
                      {financialHistory.map((entry, index) => (
                        <Cell
                          key={`cell-expense-${index}`}
                          fill={entry.projected ? '#ef4444' : '#ef4444'}
                          fillOpacity={entry.projected ? 0.4 : 1}
                          stroke={entry.projected ? '#ef4444' : 'none'}
                          strokeDasharray={entry.projected ? '4 4' : '0'}
                        />
                      ))}
                    </Bar>
                    <Line
                      type='monotone'
                      dataKey='net'
                      name='Líquido'
                      stroke='#13c8ec'
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#13c8ec', strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                    <Area
                      type='monotone'
                      dataKey='net'
                      fill='url(#colorNet)'
                      stroke='none'
                      fillOpacity={0.1}
                    />
                    <defs>
                      <linearGradient id='colorNet' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#13c8ec' stopOpacity={0.3} />
                        <stop offset='95%' stopColor='#13c8ec' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend */}
              <div className='flex items-center gap-4 mt-4 px-2'>
                <div className='flex items-center gap-2'>
                  <div className='w-2.5 h-2.5 rounded-[2px] bg-[#10b981]'></div>
                  <span className='text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400'>Receita</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2.5 h-2.5 rounded-[2px] bg-[#ef4444]'></div>
                  <span className='text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400'>Despesa</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-[18px] h-[2px] bg-[#13c8ec]'></div>
                  <span className='text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400'>Projeção (3 meses)</span>
                </div>
              </div>
            </div>

            {/* TOP PROPERTIES TABLE */}
            <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-bold text-slate-900 dark:text-white'>
                  Performance por Propriedade
                </h3>
                <button className='text-xs font-bold text-primary hover:underline'>
                  Ver Todos
                </button>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full text-left'>
                  <thead>
                    <tr className='text-xs text-slate-400 border-b border-gray-100 dark:border-white/5'>
                      <th className='pb-3 font-bold uppercase pl-2'>Imóvel</th>
                      <th className='pb-3 font-bold uppercase text-right'>Receita</th>
                      <th className='pb-3 font-bold uppercase text-right'>Yield (a.m)</th>
                      <th className='pb-3 font-bold uppercase text-center'>Status</th>
                    </tr>
                  </thead>
                  <tbody className='text-sm'>
                    {topProperties.map((prop: any) => (
                      <tr
                        key={prop.id}
                        className='group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0'
                      >
                        <td className='py-3 pl-2'>
                          <div className='flex items-center gap-3'>
                            <div
                              className='w-10 h-10 rounded-lg bg-cover bg-center shrink-0 shadow-sm'
                              style={{ backgroundImage: `url(${prop.image})` }}
                            ></div>
                            <span className='font-bold text-slate-800 dark:text-white line-clamp-1'>
                              {prop.name}
                            </span>
                          </div>
                        </td>
                        <td className='py-3 text-right font-medium text-slate-600 dark:text-slate-300'>
                          R$ {prop.revenue}
                        </td>
                        <td className='py-3 text-right font-bold text-emerald-500'>
                          {prop.yield > 0 ? `${prop.yield}%` : '-'}
                        </td>
                        <td className='py-3 text-center'>
                          <div className='relative group/tooltip inline-block'>
                            <span
                              className={`inline-block w-2.5 h-2.5 rounded-full ${
                                prop.status === 'occupied'
                                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                                  : prop.status === 'warning'
                                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                    : prop.status === 'vacant'
                                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                                      : 'bg-slate-400'
                              }`}
                            ></span>
                            <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50'>
                              {prop.status === 'occupied'
                                ? 'Ocupado e em dia'
                                : prop.status === 'warning'
                                  ? 'Contrato vencendo em breve'
                                  : prop.status === 'vacant'
                                    ? 'Imóvel vago'
                                    : 'Sem contrato ativo'}
                              <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900'></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className='space-y-6'>
            {/* VACANCY GAUGE */}
            <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col items-center relative overflow-hidden'>
              <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-2 self-start'>
                Ocupação Atual
              </h3>
              <div className='w-[200px] h-[100px] relative mt-4'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      cx='50%'
                      cy='100%'
                      startAngle={180}
                      endAngle={0}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey='value'
                    >
                      <Cell
                        key='occupied'
                        fill={metrics.occupancyRate < 80 ? '#ef4444' : '#10b981'}
                      />
                      <Cell key='vacant' fill={isDark ? '#334155' : '#e2e8f0'} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className='absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2'>
                  <span className='text-3xl font-black text-slate-900 dark:text-white block leading-none'>
                    {metrics.occupancyRate}%
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold ${metrics.occupancyRate < 80 ? 'text-red-500' : 'text-emerald-500'}`}
                  >
                    {metrics.occupancyRate < 80 ? 'Crítico' : 'Saudável'}
                  </span>
                </div>
              </div>
              <p className='text-center text-xs text-slate-500 mt-4 px-4'>
                {metrics.occupancyRate < 100 ? (
                  <>
                    Você tem{' '}
                    <span className='font-bold text-slate-900 dark:text-white'>imóveis vagos</span>.
                    Melhore sua ocupação.
                  </>
                ) : (
                  <>
                    Sua ocupação está em{' '}
                    <span className='font-bold text-slate-900 dark:text-white'>100%</span>.
                    Parabéns!
                  </>
                )}
              </p>
              <button
                onClick={() => navigate('/properties')}
                className={`mt-4 w-full py-2 ${metrics.occupancyRate < 80 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'} rounded-xl text-xs font-bold hover:bg-opacity-80 transition-colors`}
              >
                {metrics.occupancyRate < 100 ? 'Anunciar Imóvel' : 'Ver Propriedades'}
              </button>
            </div>

            {/* AI INSIGHTS CARD */}
            <div className='bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden'>
              <div className='absolute top-0 right-0 p-4 opacity-10'>
                <Lightbulb size={100} />
              </div>
              <div className='flex items-center gap-2 mb-4'>
                <div className='bg-white/20 p-2 rounded-lg backdrop-blur-sm'>
                  <Zap size={18} className='text-yellow-300' />
                </div>
                <h3 className='font-bold text-lg'>Igloo Insights</h3>
              </div>
              <ul className='space-y-3 text-sm relative z-10'>
                <li className='flex gap-2 items-start'>
                  <span className='mt-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.8)]'></span>
                  <p className='opacity-90'>
                    {metrics.occupancyRate < 80
                      ? 'Sua vacância subiu. Revise o preço dos imóveis vagos.'
                      : 'Ótimo trabalho! Mantenha a qualidade do atendimento.'}
                  </p>
                </li>
                <li className='flex gap-2 items-start'>
                  <span className='mt-1 w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0'></span>
                  <p className='opacity-90'>Novos contratos de locação disponíveis para análise.</p>
                </li>
              </ul>
              <button className='mt-5 w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold transition-all border border-white/10'>
                Ver Recomendações
              </button>
            </div>

            {/* ACTIVITY TIMELINE */}
            <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-bold text-slate-900 dark:text-white'>Próximos Dias</h3>
                <Calendar size={18} className='text-slate-400' />
              </div>
              <div className='space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5'>
                {activities.map((act: any) => (
                  <div key={act.id} className='flex gap-3 relative'>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-surface-dark shadow-sm ${
                        act.type === 'payment'
                          ? 'bg-emerald-100 text-emerald-600'
                          : act.type === 'visit'
                            ? 'bg-blue-100 text-blue-600'
                            : act.type === 'maintenance'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {act.type === 'payment' ? (
                        <DollarSign size={16} />
                      ) : act.type === 'visit' ? (
                        <MapPin size={16} />
                      ) : act.type === 'maintenance' ? (
                        <Wrench size={16} />
                      ) : (
                        <FileText size={16} />
                      )}
                    </div>
                    <div className='pb-1'>
                      <p className='text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight'>
                        {act.title}
                      </p>
                      <div className='flex items-center gap-1.5 mt-0.5'>
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                          {act.date} • {act.time}
                        </p>
                        {act.date === 'Hoje' && (
                          <span className='px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-200 dark:border-amber-500/20'>
                            Hoje
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
