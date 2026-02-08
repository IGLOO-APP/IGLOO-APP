import React from 'react';
import {
    Users,
    Building2,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    MoreVertical,
    Activity
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const stats = [
        { label: 'Proprietários Ativos', value: '1.234', change: '+15%', trend: 'up', icon: Users, color: 'blue' },
        { label: 'Receita Mensal (MRR)', value: 'R$ 98.765', change: '+8.2%', trend: 'up', icon: TrendingUp, color: 'emerald' },
        { label: 'Total de Imóveis', value: '3.456', change: '+2.4%', trend: 'up', icon: Building2, color: 'amber' },
        { label: 'Churn Rate', value: '3.2%', change: '-0.5%', trend: 'down', icon: AlertCircle, color: 'rose' },
    ];

    const recentUsers = [
        { id: 1, name: 'João Silva', email: 'joao@email.com', plan: 'Professional', status: 'Ativo', date: 'Hoje, 14:30' },
        { id: 2, name: 'Maria Santos', email: 'maria@email.com', plan: 'Enterprise', status: 'Trial', date: 'Hoje, 12:15' },
        { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com', plan: 'Starter', status: 'Ativo', date: 'Ontem, 18:45' },
        { id: 4, name: 'Ana Costa', email: 'ana@email.com', plan: 'Free', status: 'Inativo', date: 'Ontem, 16:20' },
    ];

    return (
        <div className="p-8 space-y-8 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'} bg-${stat.trend === 'up' ? 'emerald' : 'rose'}-50 dark:bg-${stat.trend === 'up' ? 'emerald' : 'rose'}-500/10 px-2.5 py-1 rounded-full`}>
                                {stat.change}
                                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Chart Placeholder */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Crescimento da Plataforma</h3>
                            <p className="text-sm text-slate-500">Novos usuários vs Cancelamentos</p>
                        </div>
                        <select className="bg-slate-50 dark:bg-white/5 border-none rounded-xl text-sm font-medium px-4 py-2 focus:ring-2 focus:ring-primary">
                            <option>Últimos 30 dias</option>
                            <option>Últimos 90 dias</option>
                            <option>Este ano</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end gap-2 px-4">
                        {[45, 60, 55, 78, 90, 85, 100, 110, 95, 120, 135, 125].map((val, i) => (
                            <div key={i} className="flex-1 space-y-2 group relative">
                                <div className="bg-primary/20 dark:bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/30" style={{ height: `${val * 0.4}%` }}></div>
                                <div className="bg-primary rounded-t-lg transition-all group-hover:bg-primary-dark" style={{ height: `${val * 0.5}%` }}></div>
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    Mes {i + 1}: {val} users
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Jan</span>
                        <span>Jun</span>
                        <span>Dez</span>
                    </div>
                </div>

                {/* Global Notifications / System Health */}
                <div className="bg-slate-900 dark:bg-amber-500 p-8 rounded-3xl shadow-xl text-white space-y-6">
                    <div className="flex items-center gap-3">
                        <Activity className="text-amber-400 dark:text-white" size={24} />
                        <h3 className="text-lg font-bold">Status do Sistema</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                            <div>
                                <p className="text-xs font-medium text-white/60">API Global</p>
                                <p className="text-sm font-bold">Operacional</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                            <div>
                                <p className="text-xs font-medium text-white/60">Pagamentos (Stripe)</p>
                                <p className="text-sm font-bold">Operacional</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                            <div>
                                <p className="text-xs font-medium text-white/60">ClickSign</p>
                                <p className="text-sm font-bold">Lentidão Detectada</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                        </div>
                    </div>

                    <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-2xl hover:bg-slate-50 transition-colors shadow-lg">
                        Ver Status Completo
                    </button>
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Novos Proprietários</h3>
                    <button className="text-primary hover:text-primary-dark text-sm font-bold px-4 py-2 hover:bg-primary/10 rounded-xl transition-all">
                        Ver Todos
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Usuário</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Plano</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Cadastro</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {recentUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white font-bold">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</p>
                                                <p className="text-xs text-slate-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-slate-600 dark:text-slate-400">
                                            {u.plan}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${u.status === 'Ativo' ? 'bg-emerald-500' : u.status === 'Trial' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                                            <span className="text-sm font-medium dark:text-white/80">{u.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-sm text-slate-500">{u.date}</td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-primary transition-colors">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400">
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
