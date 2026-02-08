import React from 'react';
import {
    CreditCard,
    TrendingUp,
    Users,
    DollarSign,
    ArrowUpRight,
    Download,
    Filter,
    MoreHorizontal,
    Plus
} from 'lucide-react';

const SubscriptionManagement: React.FC = () => {
    const metrics = [
        { label: 'MRR Global', value: 'R$ 98.765', change: '+12%', trend: 'up', icon: DollarSign, color: 'emerald' },
        { label: 'ARR Estimado', value: 'R$ 1.185.180', change: '+8%', trend: 'up', icon: TrendingUp, color: 'blue' },
        { label: 'Churn Rate', value: '3.2%', change: '-0.4%', trend: 'down', icon: Users, color: 'rose' },
        { label: 'Ticket Médio', value: 'R$ 79,90', change: '+2%', trend: 'up', icon: CreditCard, color: 'amber' },
    ];

    return (
        <div className="p-8 space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Assinaturas e Receita</h2>
                    <p className="text-sm text-slate-500">Gestão de planos, pagamentos e métricas financeiras.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all">
                        <Download size={18} />
                        Exportar Relatório
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                        <Plus size={18} />
                        Novo Plano
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m) => (
                    <div key={m.label} className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${m.color}-500/10 text-${m.color}-500`}>
                                <m.icon size={22} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                                {m.change}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{m.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Distribuição por Plano</h3>
                    <div className="space-y-6">
                        {[
                            { name: 'Professional', count: 650, percentage: 52, mrr: '51.935', color: 'primary' },
                            { name: 'Starter', count: 420, percentage: 34, mrr: '33.558', color: 'emerald' },
                            { name: 'Enterprise', count: 85, percentage: 7, mrr: '13.272', color: 'amber' },
                            { name: 'Free', count: 1234, percentage: 7, mrr: '0', color: 'slate' },
                        ].map((p) => (
                            <div key={p.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-700 dark:text-white">{p.name}</span>
                                    <span className="text-xs font-bold text-slate-400">R$ {p.mrr} MRR</span>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full bg-${p.color === 'primary' ? 'primary' : p.color + '-500'}`} style={{ width: `${p.percentage}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    <span>{p.count} assinaturas</span>
                                    <span>{p.percentage}% do total</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Histórico de Receita</h3>
                    <div className="h-64 flex items-end gap-3 px-4">
                        {[30, 45, 40, 60, 55, 75, 70, 90, 85, 100, 95, 110].map((v, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/20 to-emerald-500 rounded-lg group relative" style={{ height: `${v}%` }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all">
                                    R$ {(v * 1000).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Jan</span>
                        <span>Jun</span>
                        <span>Dez</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManagement;
