import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, ArrowUp, ArrowDown, Wrench, FileText, Plus, UserPlus, 
    Home, Receipt, LogOut, Settings, User, Moon, Sun, 
    AlertTriangle, TrendingUp, DollarSign, Calendar, 
    MapPin, Activity, Zap, ChevronRight, Filter, PieChart as PieChartIcon,
    Search, Download, ExternalLink, Lightbulb, MoreHorizontal
} from 'lucide-react';
import { 
    ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell, PieChart, Pie, Sector, ReferenceLine
} from 'recharts';
import { useAuth } from '../context/AuthContext';

// --- MOCK DATA GENERATION ---

const FINANCIAL_HISTORY = [
  { month: 'Set', income: 12500, expense: 4200, net: 8300, projected: false },
  { month: 'Out', income: 13200, expense: 3800, net: 9400, projected: false },
  { month: 'Nov', income: 14100, expense: 5100, net: 9000, projected: false },
  { month: 'Dez', income: 15800, expense: 6200, net: 9600, projected: false },
  { month: 'Jan', income: 14500, expense: 4500, net: 10000, projected: false },
  { month: 'Fev', income: 16200, expense: 4100, net: 12100, projected: false }, // Current
  { month: 'Mar', income: 16500, expense: 4000, net: 12500, projected: true },
  { month: 'Abr', income: 17000, expense: 3800, net: 13200, projected: true },
  { month: 'Mai', income: 17500, expense: 3500, net: 14000, projected: true },
];

const SPARK_DATA_1 = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const SPARK_DATA_2 = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const SPARK_DATA_3 = [80, 85, 82, 88, 90, 95, 92];

const TOP_PROPERTIES = [
    { id: 1, name: 'Loft Industrial Sul', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrarWz4gL9lkfBoellhAl5mW22mgklGbB9dEr_NaGa6vlQy5SqOrn2pM6ppygSc_gLkAc1gFaNbmJjui8AxPoHqC9FzTvxLno9SbfC_2TPnUHnTW1hW3iNpzdSKjvYFZSwlZ6dX_H-1KM-w0s7uUAsl_9l9mwmLwfZ9ojV9I1jzq3g3hHhAdyrN9D8oAVpIC11r1eltNskvYupRGPJK8-DIFVuoxb9lIi6rgbsZE3K35P5p61IdjrVaKjtfGrQONxubXSW-PpczAp-', revenue: 2400, yield: 0.72, status: 'occupied' },
    { id: 2, name: 'Studio Centro 01', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgfR0PLTBL8ZIF2qB0vPybwAfsoDq8YSZzrKO3YvbwHO-Dpx9DUD2lZhqZkykfNGgmlkvRF9VoaOcFSV48Ht6XdzQp1ASbt0CpENqCrjtZ6x_SpyNv4OXSv-OUKF3My_NTXKXoNBwigKtzWOjuevabMquLo_GRZDELE3S0LAzp4Pt566NLfyIwPht6jvwGH-diZQCj-F-TMnZkCJ3Li_A3_jxlfoFWldjBhZH7bF-J3hqcCscwB5q2HZdGT9WVIuT8DAJFDjet9POu', revenue: 1800, yield: 0.68, status: 'occupied' },
    { id: 3, name: 'Apt Jardins', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=300', revenue: 0, yield: 0, status: 'vacant' },
];

const ACTIVITIES = [
    { id: 1, title: 'Vencimento Aluguel - Apt 104', type: 'payment', date: 'Hoje', time: '23:59' },
    { id: 2, title: 'Vistoria de Saída - Kitnet 05', type: 'visit', date: 'Amanhã', time: '14:00' },
    { id: 3, title: 'Renovação Contrato - Studio 22', type: 'contract', date: '12 Mar', time: '-' },
    { id: 4, title: 'Manutenção Elétrica - Loft', type: 'maintenance', date: '15 Mar', time: '09:00' },
];

// --- COMPONENTS ---

const Sparkline = ({ data, color }: { data: number[], color: string }) => (
    <div className="h-10 w-24">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.map((val, i) => ({ i, val }))}>
                <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

// Helper for Sparkline above (simplified imports in main file, so we need to grab LineChart here locally or assume imports)
import { LineChart } from 'recharts';

const HeroCard = ({ title, value, subtext, trend, trendUp, icon: Icon, color, sparkData }: any) => (
    <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color.replace('text-', 'text-')}`}>
            <Icon size={80} />
        </div>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('500', '50')} dark:bg-white/5`}>
                <Icon size={24} className={color} />
            </div>
            {sparkData && <Sparkline data={sparkData} color={trendUp ? '#10b981' : '#ef4444'} />}
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h3>
            <div className="flex items-center gap-2 mt-2">
                <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {trend}
                </span>
                <span className="text-xs text-slate-400 font-medium">{subtext}</span>
            </div>
        </div>
    </div>
);

const AlertBadge = ({ icon: Icon, label, count, color, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-95 ${color} bg-opacity-10 border-opacity-20 hover:bg-opacity-20`}>
        <div className="relative">
            <Icon size={20} />
            {count > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>}
        </div>
        <div className="text-left">
            <p className="text-xs font-bold uppercase opacity-80">{label}</p>
            {count > 0 && <p className="text-sm font-bold">{count} pendentes</p>}
        </div>
        <ChevronRight size={16} className="opacity-50" />
    </button>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver((mutations) => mutations.forEach((m) => m.attributeName === 'class' && checkTheme()));
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

  // Occupancy Gauge Data
  const occupancyRate = 60; // Critical
  const gaugeData = [
    { name: 'Occupied', value: occupancyRate },
    { name: 'Vacant', value: 100 - occupancyRate },
  ];

  return (
    <div className={`flex flex-col w-full max-w-[1600px] mx-auto transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 p-[2px]">
                    <div className="w-full h-full rounded-[14px] bg-surface-light dark:bg-surface-dark flex items-center justify-center overflow-hidden">
                         <img src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDwRIAHlgLaW6OqzLEr6KH9kj4TGcypVin8vG0nCnlg_EiRsv3e561_S0pU6gWh-_QTbZSo1wTTeTa1eUzsn3qDoV7F2ZkeYhUXC1qQ693w1T_qhEMSRNparuohwnqCxmtjp1WP7yfrOyV41z5DUDYQWtT2DN2BOuEvt-l4Zme5iHAST-ZPnDLEWyZDtU3KB7inrHYdgFQW0i41SlR9Gu26TEHY7zIfA7Yz2Y6_85c20Atg3MSIoA-q5EdHHyFckC73eced5eTGvEg3"} alt="User" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark"></div>
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Olá, Investidor</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Visão geral do seu portfólio</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden md:flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                {['Semana', 'Mês', 'Ano'].map(p => (
                    <button 
                        key={p} 
                        onClick={() => setPeriod(p === 'Semana' ? 'week' : p === 'Mês' ? 'month' : 'year')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            (p === 'Mês' && period === 'month') || (p === 'Ano' && period === 'year') 
                            ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {p}
                    </button>
                ))}
            </div>
            <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
                onClick={() => navigate('/properties', { state: { openAdd: true } })}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform"
                title="Novo Imóvel"
            >
                <Plus size={20} />
            </button>
        </div>

        {showUserMenu && (
            <>
                <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute top-20 left-6 w-64 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 py-2 z-40 animate-scaleUp origin-top-left">
                    <button onClick={() => navigate('/settings')} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                        <User size={18} /> Meu Perfil
                    </button>
                    <button onClick={logout} className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 text-sm font-bold text-red-500">
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            </>
        )}
      </header>

      <div className="p-6 space-y-8 pb-24">
        
        {/* --- 1. HERO METRICS --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HeroCard 
                title="Patrimônio Total" 
                value="R$ 1.5M" 
                subtext="vs. mês anterior" 
                trend="+2.5%" 
                trendUp={true} 
                icon={TrendingUp} 
                color="text-indigo-500" 
                sparkData={SPARK_DATA_3}
            />
            <HeroCard 
                title="Receita Recorrente (MRR)" 
                value="R$ 16.2k" 
                subtext="vs. mês anterior" 
                trend="+12%" 
                trendUp={true} 
                icon={DollarSign} 
                color="text-emerald-500" 
                sparkData={SPARK_DATA_1}
            />
            <HeroCard 
                title="Taxa de Ocupação" 
                value="60%" 
                subtext="Crítico (< 80%)" 
                trend="-15%" 
                trendUp={false} 
                icon={Home} 
                color="text-red-500" 
            />
            <HeroCard 
                title="ROI Médio Anual" 
                value="7.2%" 
                subtext="Acima da inflação" 
                trend="+0.8%" 
                trendUp={true} 
                icon={Activity} 
                color="text-cyan-500" 
            />
        </section>

        {/* --- 2. ALERTS & ACTIONS --- */}
        <section className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 overflow-x-auto hide-scrollbar flex gap-4 pb-2 md:pb-0">
                <AlertBadge 
                    icon={AlertTriangle} 
                    label="Vacância Crítica" 
                    count={1} 
                    color="bg-red-500 border-red-500 text-red-600 dark:text-red-400" 
                    onClick={() => navigate('/properties')}
                />
                <AlertBadge 
                    icon={FileText} 
                    label="Contratos Vencendo" 
                    count={2} 
                    color="bg-amber-500 border-amber-500 text-amber-600 dark:text-amber-400" 
                    onClick={() => navigate('/contracts')}
                />
                <AlertBadge 
                    icon={Wrench} 
                    label="Manutenções" 
                    count={3} 
                    color="bg-blue-500 border-blue-500 text-blue-600 dark:text-blue-400" 
                    onClick={() => navigate('/messages')}
                />
            </div>
            <div className="flex gap-3 shrink-0">
                <button onClick={() => navigate('/financials', { state: { openAdd: true, type: 'expense' } })} className="h-14 px-6 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 font-bold text-sm text-slate-700 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2">
                    <Receipt size={18} className="text-red-500" /> Nova Despesa
                </button>
                <button onClick={() => navigate('/tenants', { state: { openAdd: true } })} className="h-14 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
                    <UserPlus size={18} /> Novo Inquilino
                </button>
            </div>
        </section>

        {/* --- 3. MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN (2/3) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* CASH FLOW CHART */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <DollarSign className="text-primary" size={20} /> Fluxo de Caixa & Projeção
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Análise financeira com previsão de 3 meses</p>
                        </div>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"><Download size={18} className="text-slate-400" /></button>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={FINANCIAL_HISTORY} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }} tickFormatter={(val) => `k${val/1000}`} />
                                <Tooltip 
                                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-white/10">
                                                    <p className="font-bold mb-2 border-b border-white/10 pb-1">{label}</p>
                                                    <div className="space-y-1 text-xs">
                                                        <p className="flex justify-between gap-4"><span className="text-emerald-400">Receita:</span> <b>R$ {payload[0].value}</b></p>
                                                        <p className="flex justify-between gap-4"><span className="text-red-400">Despesa:</span> <b>R$ {payload[1].value}</b></p>
                                                        <p className="flex justify-between gap-4 border-t border-white/10 pt-1 mt-1"><span className="text-cyan-400 font-bold">Líquido:</span> <b>R$ {payload[2].value}</b></p>
                                                        {payload[0].payload.projected && <p className="text-[10px] text-amber-400 italic mt-2 text-center">*Valor Projetado</p>}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="income" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} stackId="a" />
                                <Bar dataKey="expense" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} stackId="a" />
                                <Line type="monotone" dataKey="net" name="Líquido" stroke="#13c8ec" strokeWidth={3} dot={{ r: 4, fill: '#13c8ec', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                <Area type="monotone" dataKey="net" fill="url(#colorNet)" stroke="none" fillOpacity={0.1} />
                                <defs>
                                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#13c8ec" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#13c8ec" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TOP PROPERTIES TABLE */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Performance por Propriedade</h3>
                        <button className="text-xs font-bold text-primary hover:underline">Ver Todos</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-slate-400 border-b border-gray-100 dark:border-white/5">
                                    <th className="pb-3 font-bold uppercase pl-2">Imóvel</th>
                                    <th className="pb-3 font-bold uppercase text-right">Receita</th>
                                    <th className="pb-3 font-bold uppercase text-right">Yield (a.m)</th>
                                    <th className="pb-3 font-bold uppercase text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {TOP_PROPERTIES.map((prop, idx) => (
                                    <tr key={prop.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0">
                                        <td className="py-3 pl-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0 shadow-sm" style={{ backgroundImage: `url(${prop.image})` }}></div>
                                                <span className="font-bold text-slate-800 dark:text-white line-clamp-1">{prop.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right font-medium text-slate-600 dark:text-slate-300">R$ {prop.revenue}</td>
                                        <td className="py-3 text-right font-bold text-emerald-500">{prop.yield > 0 ? `${prop.yield}%` : '-'}</td>
                                        <td className="py-3 text-center">
                                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${prop.status === 'occupied' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN (1/3) */}
            <div className="space-y-6">
                
                {/* VACANCY GAUGE */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col items-center relative overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 self-start">Ocupação Atual</h3>
                    <div className="w-[200px] h-[100px] relative mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={gaugeData}
                                    cx="50%"
                                    cy="100%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    <Cell key="occupied" fill="#ef4444" /> {/* Red because occupancy is low (60%) */}
                                    <Cell key="vacant" fill={isDark ? '#334155' : '#e2e8f0'} />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
                            <span className="text-3xl font-black text-slate-900 dark:text-white block leading-none">{occupancyRate}%</span>
                            <span className="text-[10px] uppercase font-bold text-red-500">Crítico</span>
                        </div>
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-4 px-4">
                        Você tem <span className="font-bold text-slate-900 dark:text-white">1 imóvel vago</span> há 12 dias.
                    </p>
                    <button onClick={() => navigate('/properties')} className="mt-4 w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                        Anunciar Imóvel
                    </button>
                </div>

                {/* AI INSIGHTS CARD */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Lightbulb size={100} /></div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm"><Zap size={18} className="text-yellow-300" /></div>
                        <h3 className="font-bold text-lg">Igloo Insights</h3>
                    </div>
                    <ul className="space-y-3 text-sm relative z-10">
                        <li className="flex gap-2 items-start">
                            <span className="mt-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
                            <p className="opacity-90">Sua vacância subiu 10%. Considere revisar o preço do <b>Apt Jardins</b>.</p>
                        </li>
                        <li className="flex gap-2 items-start">
                            <span className="mt-1 w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span>
                            <p className="opacity-90">O contrato de <b>Carlos Pereira</b> vence em 25 dias. Inicie a renovação.</p>
                        </li>
                    </ul>
                    <button className="mt-5 w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold transition-all border border-white/10">
                        Ver Recomendações
                    </button>
                </div>

                {/* ACTIVITY TIMELINE */}
                <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Próximos Dias</h3>
                        <Calendar size={18} className="text-slate-400" />
                    </div>
                    <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5">
                        {ACTIVITIES.map((act) => (
                            <div key={act.id} className="flex gap-3 relative">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-surface-dark shadow-sm ${
                                    act.type === 'payment' ? 'bg-emerald-100 text-emerald-600' : 
                                    act.type === 'visit' ? 'bg-blue-100 text-blue-600' :
                                    act.type === 'maintenance' ? 'bg-orange-100 text-orange-600' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    {act.type === 'payment' ? <DollarSign size={16} /> : 
                                     act.type === 'visit' ? <MapPin size={16} /> :
                                     act.type === 'maintenance' ? <Wrench size={16} /> : <FileText size={16} />}
                                </div>
                                <div className="pb-1">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{act.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.date} • {act.time}</p>
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