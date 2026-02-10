import React, { useEffect, useState } from 'react';
import {
    Users,
    Building2,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    MoreVertical,
    Activity,
    CreditCard,
    Cpu,
    Server,
    Bell
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { adminService } from '../../services/adminService';

const growthData = [
    { name: 'Jan', users: 400, revenue: 2400 },
    { name: 'Fev', users: 300, revenue: 1398 },
    { name: 'Mar', users: 200, revenue: 9800 },
    { name: 'Abr', users: 278, revenue: 3908 },
    { name: 'Mai', users: 189, revenue: 4800 },
    { name: 'Jun', users: 239, revenue: 3800 },
    { name: 'Jul', users: 349, revenue: 4300 },
];

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await adminService.getStats();
                setStats(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const dashboardStats = [
        { label: 'Proprietários Ativos', value: stats?.active_owners || '1.234', change: '+15%', trend: 'up', icon: Users, color: 'blue' },
        { label: 'Receita Mensal (MRR)', value: stats?.mrr ? `R$ ${stats.mrr.toLocaleString()}` : 'R$ 98.765', change: '+8.2%', trend: 'up', icon: TrendingUp, color: 'emerald' },
        { label: 'Total de Imóveis', value: '3.456', change: '+2.4%', trend: 'up', icon: Building2, color: 'amber' },
        { label: 'Churn Rate', value: stats?.churn_rate ? `${stats.churn_rate}%` : '3.2%', change: '-0.5%', trend: 'down', icon: AlertCircle, color: 'rose' },
    ];

    const recentUsers = [
        { id: 1, name: 'João Silva', email: 'joao@email.com', plan: 'Professional', status: 'Ativo', date: 'Hoje, 14:30' },
        { id: 2, name: 'Maria Santos', email: 'maria@email.com', plan: 'Enterprise', status: 'Trial', date: 'Hoje, 12:15' },
        { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com', plan: 'Starter', status: 'Ativo', date: 'Ontem, 18:45' },
        { id: 4, name: 'Ana Costa', email: 'ana@email.com', plan: 'Free', status: 'Inativo', date: 'Ontem, 16:20' },
    ];

    const recentActivity = [
        { id: 1, text: 'Novo usuário registrado: Carlos M.', time: 'há 5 min', type: 'user' },
        { id: 2, text: 'Pagamento recebido: R$ 79,90', time: 'há 12 min', type: 'money' },
        { id: 3, text: 'Erro na integração ClickSign', time: 'há 45 min', type: 'error' },
        { id: 4, text: 'Backup do sistema concluído', time: 'há 2 horas', type: 'system' },
    ];

    return (
        <div className="p-8 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Painel de Controle</h1>
                    <p className="text-slate-400">Visão geral da performance do Igloo.</p>
                </div>
                <div className="relative z-10 flex gap-3">
                    <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold backdrop-blur-md transition-all flex items-center gap-2">
                        <Activity size={18} />
                        Relatórios
                    </button>
                    <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                        <Bell size={18} />
                        Notificações
                    </button>
                </div>

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-purple-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, i) => (
                    <div key={stat.label} className="bg-white dark:bg-surface-dark p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-4 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform shadow-sm`}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'} bg-${stat.trend === 'up' ? 'emerald' : 'rose'}-50 dark:bg-${stat.trend === 'up' ? 'emerald' : 'rose'}-500/10 px-3 py-1.5 rounded-full`}>
                                {stat.change}
                                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Growth Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Receita Recorrente</h3>
                            <p className="text-sm text-slate-500">Crescimento de MRR nos últimos 6 meses</p>
                        </div>
                        <select className="bg-slate-50 dark:bg-white/5 border-none rounded-xl text-sm font-bold text-slate-600 px-4 py-2 focus:ring-2 focus:ring-primary cursor-pointer">
                            <option>Últimos 6 meses</option>
                            <option>Este ano</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(value) => `R$${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px 16px' }}
                                    cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Health & Activity */}
                <div className="space-y-6">
                    <div className="bg-slate-900 dark:bg-surface-dark p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                    <Activity size={24} />
                                </div>
                                <h3 className="text-lg font-bold">Status do Sistema</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <Server size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                                        <span className="text-sm font-bold">API Server</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-emerald-400">99.9%</span>
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                                        <span className="text-sm font-bold">Stripe</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-emerald-400">Online</span>
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Blob */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full"></div>
                    </div>

                    {/* Recent Activity Mini-Feed */}
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Atividade Recente</h3>
                        <div className="space-y-4">
                            {recentActivity.map((activity, i) => (
                                <div key={i} className="flex gap-3 items-start pb-4 border-b border-gray-50 dark:border-white/5 last:border-0 last:pb-0">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${activity.type === 'error' ? 'bg-red-500' :
                                            activity.type === 'money' ? 'bg-emerald-500' :
                                                'bg-blue-500'
                                        }`}></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{activity.text}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="bg-white dark:bg-surface-dark rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Novos Proprietários</h3>
                        <p className="text-xs text-slate-500">Últimos signups na plataforma.</p>
                    </div>
                    <button className="text-primary hover:text-primary-dark text-sm font-bold px-6 py-3 bg-primary/5 hover:bg-primary/10 rounded-2xl transition-all">
                        Ver Todos
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Usuário</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Plano</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Data</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {recentUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white font-bold shadow-inner">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</p>
                                                <p className="text-xs text-slate-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                            {u.plan}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Ativo' ? 'bg-emerald-500' : u.status === 'Trial' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-white/80">{u.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-slate-500">{u.date}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-primary transition-colors">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
