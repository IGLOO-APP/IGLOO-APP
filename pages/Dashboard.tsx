import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowUp, ArrowDown, Wrench, FileText, Plus, UserPlus, Home, Receipt, LogOut, Settings, User, CheckCircle, Moon, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';

const data = [
  { name: 'Jan', value: 4500 },
  { name: 'Fev', value: 5500 },
  { name: 'Mar', value: 4000 },
  { name: 'Abr', value: 6500 },
  { name: 'Mai', value: 8500 },
  { name: 'Jun', value: 7000 },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

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

  const notifications = [
    { id: 1, title: 'Aluguel Recebido', desc: 'João Silva pagou R$ 1.500', time: '2 min', type: 'success' },
    { id: 2, title: 'Manutenção', desc: 'Solicitação em Apt 104', time: '1h', type: 'alert' },
    { id: 3, title: 'Contrato Vencendo', desc: 'Renovação: Maria Oliveira', time: '2 dias', type: 'info' },
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setHasUnread(false);
    setShowUserMenu(false);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto md:max-w-4xl md:px-6">
      <header className="flex items-center px-6 py-5 justify-between sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/80 backdrop-blur-md transition-colors border-b border-transparent dark:border-white/5">
        <div className="relative z-30">
            <div 
                onClick={handleUserMenuClick}
                className="flex items-center gap-3 cursor-pointer p-1 -ml-1 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors select-none group"
            >
                <div className="relative">
                    <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 border-2 border-primary shadow-sm group-hover:border-primary-dark transition-colors"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDwRIAHlgLaW6OqzLEr6KH9kj4TGcypVin8vG0nCnlg_EiRsv3e561_S0pU6gWh-_QTbZSo1wTTeTa1eUzsn3qDoV7F2ZkeYhUXC1qQ693w1T_qhEMSRNparuohwnqCxmtjp1WP7yfrOyV41z5DUDYQWtT2DN2BOuEvt-l4Zme5iHAST-ZPnDLEWyZDtU3KB7inrHYdgFQW0i41SlR9Gu26TEHY7zIfA7Yz2Y6_85c20Atg3MSIoA-q5EdHHyFckC73eced5eTGvEg3")' }}
                    ></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark"></div>
                </div>
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-tight group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Bom dia,</p>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">Investidor</h2>
                </div>
            </div>

            {showUserMenu && (
                <>
                    <div className="fixed inset-0 z-20 cursor-default" onClick={() => setShowUserMenu(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 py-2 animate-scaleUp origin-top-left z-30 ring-1 ring-black/5">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 mb-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Investidor</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">investidor@igloo.com</p>
                        </div>
                        
                        <button 
                            onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary font-medium flex items-center gap-2 transition-colors"
                        >
                            <User size={16} /> Meu Perfil
                        </button>
                        <button 
                            onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary font-medium flex items-center gap-2 transition-colors"
                        >
                            <Settings size={16} /> Configurações
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-white/5 my-1"></div>
                        <button 
                            onClick={() => { setShowUserMenu(false); logout(); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium flex items-center gap-2 transition-colors"
                        >
                            <LogOut size={16} /> Sair da conta
                        </button>
                    </div>
                </>
            )}
        </div>

        <div className="flex items-center gap-3 relative z-30">
            <button 
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95"
                title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
                <button 
                    onClick={handleNotificationClick}
                    className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm text-slate-800 dark:text-white relative transition-all ${showNotifications ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                    <Bell size={20} />
                    {hasUnread && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>}
                </button>

                {showNotifications && (
                    <>
                        <div className="fixed inset-0 z-20 cursor-default" onClick={() => setShowNotifications(false)}></div>
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 py-2 animate-scaleUp origin-top-right z-30 ring-1 ring-black/5">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notificações</h3>
                                <button className="text-xs text-primary font-bold hover:underline">Marcar lidas</button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-white/5 last:border-0 cursor-pointer transition-colors flex gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.type === 'success' ? 'bg-emerald-500' : notif.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{notif.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.desc}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{notif.time} atrás</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-2 border-t border-gray-100 dark:border-white/5">
                                <button className="w-full py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                                    Ver todas
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      </header>

      <div className="w-full px-6 mb-2">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          <button 
            onClick={() => navigate('/financials', { state: { openAdd: true, type: 'expense' } })}
            className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary text-white pl-4 pr-5 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            <Plus size={20} />
            <span className="text-sm font-bold">Nova Despesa</span>
          </button>
          <button 
            onClick={() => navigate('/tenants', { state: { openAdd: true } })}
            className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 pl-4 pr-5 shadow-sm active:scale-95 transition-transform hover:border-primary/50 dark:hover:border-primary/50"
          >
            <UserPlus size={20} className="text-primary" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Novo Inquilino</span>
          </button>
          <button 
            onClick={() => navigate('/properties')}
            className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 pl-4 pr-5 shadow-sm active:scale-95 transition-transform hover:border-primary/50 dark:hover:border-primary/50"
          >
            <Home size={20} className="text-primary" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Imóveis</span>
          </button>
        </div>
      </div>

      <div className="w-full pl-6 mb-6">
        <div className="flex overflow-x-auto hide-scrollbar gap-4 pr-6 pb-2">
          <div className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-surface-dark min-w-[200px] w-[200px] shadow-sm border border-gray-100 dark:border-white/5 h-32 relative group overflow-hidden transition-colors">
             <div className="absolute top-0 right-0 p-3 opacity-10">
               <Receipt size={64} className="text-primary" />
             </div>
             <div>
               <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Recebido</p>
               <p className="text-slate-900 dark:text-white text-2xl font-bold mt-1">R$ 12.450</p>
             </div>
             <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
               <ArrowUp size={16} />
               <span className="text-xs font-bold">+12%</span>
             </div>
          </div>
          <div className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-surface-dark min-w-[200px] w-[200px] shadow-sm border border-gray-100 dark:border-white/5 h-32 relative overflow-hidden transition-colors">
             <div className="absolute top-0 right-0 p-3 opacity-10">
               <FileText size={64} className="text-orange-500" />
             </div>
             <div>
               <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Pendente</p>
               <p className="text-slate-900 dark:text-white text-2xl font-bold mt-1">R$ 850</p>
             </div>
             <div className="flex items-center gap-1 text-orange-500 bg-orange-50 dark:bg-orange-500/10 w-fit px-2 py-1 rounded-md">
               <span className="text-xs font-bold">2 Atrasos</span>
             </div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-8">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5 transition-colors">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">Fluxo de Caixa</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Últimos 6 meses</p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold">
              Mensal
            </div>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} 
                    dy={10}
                />
                <Tooltip 
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} 
                    contentStyle={{ 
                        borderRadius: '12px', 
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
                        backgroundColor: isDark ? '#141b1d' : '#fff', 
                        color: isDark ? '#fff' : '#000' 
                    }} 
                    itemStyle={{ color: isDark ? '#cbd5e1' : '#000' }}
                    labelStyle={{ color: isDark ? '#fff' : '#000', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#13c8ec' : (isDark ? '#334155' : '#e2e8f0')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">Atividades Recentes</h3>
          <button className="text-primary text-sm font-semibold hover:text-primary-dark">Ver tudo</button>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center p-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mr-3 shrink-0">
              <ArrowDown size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-slate-200 text-sm font-bold truncate">Aluguel Recebido</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs truncate">Studio 304 - Centro</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">+ R$ 1.200</p>
              <p className="text-slate-500 dark:text-slate-500 text-[10px]">Hoje, 09:30</p>
            </div>
          </div>
          <div className="flex items-center p-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mr-3 shrink-0">
              <Wrench size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-slate-200 text-sm font-bold truncate">Manutenção Elétrica</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs truncate">Kitnet 102 - Jardins</p>
            </div>
            <div className="text-right">
              <p className="text-slate-900 dark:text-slate-200 text-sm font-bold">- R$ 350</p>
              <p className="text-slate-500 dark:text-slate-500 text-[10px]">Ontem</p>
            </div>
          </div>
          <div className="flex items-center p-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3 shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-slate-200 text-sm font-bold truncate">Novo Contrato</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs truncate">Marcos Silva - Ap 201</p>
            </div>
            <div className="text-right">
              <p className="text-slate-900 dark:text-slate-200 text-sm font-bold">Assinado</p>
              <p className="text-slate-500 dark:text-slate-500 text-[10px]">2 dias atrás</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;