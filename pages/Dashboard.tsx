import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowUp, ArrowDown, Wrench, FileText, Plus, UserPlus, Home, Receipt, LogOut, Settings, User, CheckCircle, Moon, Sun, AlertTriangle, Info, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis, CartesianGrid, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { calculateVacancyMetrics, calculatePortfolioYield, generateCashFlowProjection } from '../utils/financialCalculations';
import { Property, Contract } from '../types';

// Mock Data for calculations
const mockProperties: Property[] = [
    { id: 1, name: 'Studio Centro', address: 'Rua Augusta', status: 'ALUGADO', price: 'R$ 1.500', numeric_price: 1500, market_value: 250000, area: '32m²', image: '' },
    { id: 2, name: 'Loft Industrial', address: 'Av Brasil', status: 'ALUGADO', price: 'R$ 2.400', numeric_price: 2400, market_value: 380000, area: '55m²', image: '' },
    { id: 3, name: 'Kitnet Univ.', address: 'Rua Estudantes', status: 'MANUTENÇÃO', price: 'R$ 850', numeric_price: 850, market_value: 180000, area: '28m²', image: '' },
    { id: 4, name: 'Apt Jardins', address: 'Alameda Lorena', status: 'DISPONÍVEL', price: 'R$ 3.200', numeric_price: 3200, market_value: 600000, area: '70m²', image: '' },
];

const mockContracts: Contract[] = [
    { id: 1, property: 'Studio Centro', value: 'R$ 1.500', numeric_value: 1500, status: 'active', start_date: '', end_date: '2025-10-10' },
    { id: 2, property: 'Loft Industrial', value: 'R$ 2.400', numeric_value: 2400, status: 'active', start_date: '', end_date: '2024-05-10' }, // Ends soon
];

const pastCashFlow = [
  { name: 'Jan', value: 3900 },
  { name: 'Fev', value: 3900 },
  { name: 'Mar', value: 3900 },
  { name: 'Abr', value: 3900 }, // Current month roughly
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [isDark, setIsDark] = useState(false);
  
  // Metrics State
  const [vacancy, setVacancy] = useState({ physical: 0, financial: 0, alert: false });
  const [yieldRate, setYieldRate] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Theme Check
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => m.attributeName === 'class' && checkTheme());
    });
    observer.observe(document.documentElement, { attributes: true });

    // Calculate Real Metrics
    const vacMetrics = calculateVacancyMetrics(mockProperties);
    setVacancy(vacMetrics);

    const yieldMetrics = calculatePortfolioYield(mockProperties);
    setYieldRate(yieldMetrics);

    // Calculate Projection
    const projection = generateCashFlowProjection(pastCashFlow, mockContracts);
    setChartData(projection);

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
    { id: 2, title: 'Vacância Alta', desc: 'Sua taxa subiu para 25%', time: '1h', type: 'alert' },
    { id: 3, title: 'Contrato Vencendo', desc: 'Loft Industrial em 2 meses', time: '2 dias', type: 'info' },
  ];

  return (
    <div className="flex flex-col w-full max-w-md mx-auto md:max-w-5xl md:px-6">
      <header className="flex items-center px-6 py-5 justify-between sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/80 backdrop-blur-md transition-colors border-b border-transparent dark:border-white/5">
        <div className="relative z-30">
            <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
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
                        <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary font-medium flex items-center gap-2 transition-colors">
                            <User size={16} /> Meu Perfil
                        </button>
                        <button onClick={() => { setShowUserMenu(false); logout(); }} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium flex items-center gap-2 transition-colors">
                            <LogOut size={16} /> Sair da conta
                        </button>
                    </div>
                </>
            )}
        </div>

        <div className="flex items-center gap-3 relative z-30">
            <button onClick={toggleTheme} className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative">
                <button onClick={() => { setShowNotifications(!showNotifications); setHasUnread(false); }} className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm text-slate-800 dark:text-white relative transition-all ${showNotifications ? 'bg-primary text-white shadow-primary/30' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5'}`}>
                    <Bell size={20} />
                    {hasUnread && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>}
                </button>
                {showNotifications && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 py-2 animate-scaleUp z-30">
                        {notifications.map((n) => (
                            <div key={n.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-gray-50 dark:border-white/5 last:border-0 flex gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{n.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </header>

      {/* QUICK ACTIONS */}
      <div className="w-full px-6 mb-2">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          <button onClick={() => navigate('/financials', { state: { openAdd: true, type: 'expense' } })} className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary text-white pl-4 pr-5 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
            <Plus size={20} /> <span className="text-sm font-bold">Nova Despesa</span>
          </button>
          <button onClick={() => navigate('/tenants', { state: { openAdd: true } })} className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 pl-4 pr-5 shadow-sm active:scale-95 hover:border-primary/50">
            <UserPlus size={20} className="text-primary" /> <span className="text-sm font-semibold text-slate-900 dark:text-white">Novo Inquilino</span>
          </button>
        </div>
      </div>

      {/* MAIN METRICS CARDS */}
      <div className="w-full px-6 mb-6">
        <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2">
          {/* Card 1: Total Recebido */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-surface-dark min-w-[220px] shadow-sm border border-gray-100 dark:border-white/5 h-36 relative overflow-hidden">
             <div>
               <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                   <Receipt size={16} /> Receita Mensal
               </p>
               <p className="text-slate-900 dark:text-white text-3xl font-extrabold mt-2">R$ 3.900</p>
             </div>
             <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
               <ArrowUp size={16} />
               <span className="text-xs font-bold">Na meta</span>
             </div>
          </div>

          {/* Card 2: Vacância (Intelligent) */}
          <div className={`flex flex-col justify-between p-5 rounded-2xl min-w-[220px] shadow-sm border h-36 relative overflow-hidden ${
              vacancy.alert 
              ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
              : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5'
          }`}>
             <div>
               <div className="flex justify-between items-start">
                   <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vacancy.alert ? 'text-red-700 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                       <Home size={16} /> Vacância Financeira
                   </p>
                   {vacancy.alert && <AlertTriangle size={18} className="text-red-500 animate-pulse" />}
               </div>
               <p className={`text-3xl font-extrabold mt-2 ${vacancy.alert ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                   {vacancy.financial}%
               </p>
             </div>
             <div className="text-xs font-medium opacity-80">
                 {vacancy.alert ? 'Atenção: Perda de receita alta!' : 'Dentro do esperado.'}
             </div>
          </div>

          {/* Card 3: Yield (Rentabilidade) */}
          <div className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-surface-dark min-w-[220px] shadow-sm border border-gray-100 dark:border-white/5 h-36 relative overflow-hidden">
             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl max-w-[140px] z-10">
                     Rentabilidade anual sobre o valor do imóvel. Poupança ref: ~6.17% a.a.
                 </div>
             </div>
             <div>
               <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                   <TrendingUp size={16} /> Yield Anual (ROI)
               </p>
               <p className="text-slate-900 dark:text-white text-3xl font-extrabold mt-2">{yieldRate}%</p>
             </div>
             <div className={`flex items-center gap-1 w-fit px-2 py-1 rounded-md ${yieldRate > 6.2 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-amber-500 bg-amber-50'}`}>
               <Info size={14} />
               <span className="text-xs font-bold">{yieldRate > 6.2 ? 'Acima da Poupança' : 'Abaixo da média'}</span>
             </div>
          </div>
        </div>
      </div>

      {/* CHART: CASH FLOW + PROJECTION */}
      <div className="px-6 mb-8">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 transition-colors">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                  <DollarSign className="text-primary" size={20} />
                  Fluxo & Projeção
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Realizado vs. Previsto (Próx. 3 meses)</p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span> Realizado
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-primary/50 border-dashed"></span> Previsto
                </div>
            </div>
          </div>
          
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} 
                />
                <Tooltip 
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="bg-white dark:bg-black border border-slate-100 dark:border-white/10 p-3 rounded-xl shadow-xl">
                                    <p className="font-bold text-slate-900 dark:text-white mb-1">{data.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {data.isProjection ? 'Projeção: ' : 'Realizado: '}
                                        <span className="font-bold text-primary">
                                            R$ {(data.isProjection ? data.projected : data.actual).toLocaleString()}
                                        </span>
                                    </p>
                                    {data.isProjection && data.projected < 3900 && (
                                        <p className="text-[10px] text-red-500 mt-1 font-bold flex items-center gap-1">
                                            <ArrowDown size={10} /> Queda prevista (Fim de contrato)
                                        </p>
                                    )}
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                {/* Actual Data Bar */}
                <Bar dataKey="actual" stackId="a" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#13c8ec" />
                  ))}
                </Bar>
                {/* Projected Data Bar (Stacked visually but functionally separate in time) */}
                <Bar dataKey="projected" stackId="a" radius={[4, 4, 0, 0]} maxBarSize={40}>
                   {chartData.map((entry, index) => (
                    <Cell 
                        key={`cell-proj-${index}`} 
                        fill={isDark ? 'rgba(19, 200, 236, 0.2)' : 'rgba(19, 200, 236, 0.3)'} 
                        stroke="#13c8ec"
                        strokeDasharray="4 4"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;