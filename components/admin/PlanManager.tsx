import React, { useState, useEffect } from 'react';
import { Plan, PlanTier } from '../../types';
import { supabase } from '../../lib/supabase';
import { Loader, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const PlanManager: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);

    const fetchPlans = async () => {
        setLoading(true);
        // In a real scenario, fetch from DB. 
        // For now, we simulate fetching or use the mock data if DB is empty.
        const { data, error } = await supabase.from('plans').select('*').order('price_monthly', { ascending: true });

        if (data && data.length > 0) {
            setPlans(data as any);
        } else {
            // Fallback to initial seed if empty
            const seedPlans: Plan[] = [
                {
                    id: 'starter',
                    name: 'Starter',
                    description: 'Para quem está começando',
                    price: { monthly: 29.90, semiannual: 29.90 * 6 * 0.9, annual: 29.90 * 12 * 0.8 },
                    limits: { properties: 5, tenants: 10, storage_gb: 1, users: 1 },
                    features: [{ text: 'Gestão Básica', included: true }],
                    is_active: true
                },
                {
                    id: 'professional',
                    name: 'Professional',
                    description: 'Para corretores e pequenas imobiliárias',
                    price: { monthly: 79.90 },
                    limits: { properties: 50, tenants: 100, storage_gb: 10, users: 3 },
                    features: [{ text: 'Gestão Completa', included: true }],
                    is_active: true,
                    highlight: true
                }
            ];
            setPlans(seedPlans);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlan || !editingPlan.id) return;

        // Upsert to Supabase
        const { error } = await supabase.from('plans').upsert({
            id: editingPlan.id,
            name: editingPlan.name,
            description: editingPlan.description,
            price_monthly: editingPlan.price?.monthly,
            price_semiannual: editingPlan.price?.semiannual,
            price_annual: editingPlan.price?.annual,
            limits: editingPlan.limits,
            features: editingPlan.features,
            is_active: editingPlan.is_active
        });

        if (!error) {
            setEditingPlan(null);
            fetchPlans();
        } else {
            alert('Erro ao salvar plano: ' + error.message);
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm('Tem certeza? Isso pode afetar assinaturas existentes!')) return;
        const { error } = await supabase.from('plans').delete().eq('id', id);
        if (!error) {
            setPlans(plans.filter(p => p.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Planos de Assinatura</h3>
                    <p className="text-sm text-slate-500">Gerencie os preços e limites da plataforma.</p>
                </div>
                <button
                    onClick={() => setEditingPlan({ is_active: true, features: [], limits: { properties: 0, tenants: 0, storage_gb: 0, users: 0 } })}
                    className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    Novo Plano
                </button>
            </div>

            {/* Editor */}
            {editingPlan && (
                <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-xl border-2 border-primary/20 animate-slideUp">
                    <h4 className="font-bold text-lg mb-4">{editingPlan.id ? 'Editar Plano' : 'Novo Plano'}</h4>
                    <form onSubmit={handleSavePlan} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">ID (Slug)</label>
                                <input
                                    value={editingPlan.id || ''}
                                    onChange={e => setEditingPlan({ ...editingPlan, id: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                                    disabled={!!plans.find(p => p.id === editingPlan.id && p.id !== '')} // Disable if editing existing
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                                <input
                                    value={editingPlan.name || ''}
                                    onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Preço Mensal (R$)</label>
                                <input
                                    type="number" step="0.01"
                                    value={editingPlan.price?.monthly || ''}
                                    onChange={e => setEditingPlan({ ...editingPlan, price: { ...editingPlan.price!, monthly: parseFloat(e.target.value) } })}
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Limites (JSON)</label>
                                <textarea
                                    value={JSON.stringify(editingPlan.limits, null, 2)}
                                    onChange={e => {
                                        try {
                                            setEditingPlan({ ...editingPlan, limits: JSON.parse(e.target.value) })
                                        } catch (err) { } // Simple ignore error for now
                                    }}
                                    className="w-full h-32 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono text-xs"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Ex: {'{"properties": 10, "tenants": 20}'}</p>
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setEditingPlan(null)}
                                className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 flex justify-center p-12"><Loader className="animate-spin text-slate-400" /></div>
                ) : plans.map(plan => (
                    <div key={plan.id} className={`bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-sm border ${plan.is_active ? 'border-gray-100 dark:border-white/5' : 'border-red-100 dark:border-red-500/20 opacity-75'} relative group hover:shadow-lg transition-all`}>
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingPlan(plan)} className="p-2 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white rounded-lg hover:bg-primary hover:text-white transition-colors">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeletePlan(plan.id)} className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                            <p className="text-sm text-slate-500 h-10">{plan.description}</p>
                        </div>

                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price.monthly)}
                            </span>
                            <span className="text-sm font-medium text-slate-400">/mês</span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Imóveis</span>
                                <span className="font-bold text-slate-900 dark:text-white">{plan.limits.properties === -1 ? 'Ilimitado' : plan.limits.properties}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Inquilinos</span>
                                <span className="font-bold text-slate-900 dark:text-white">{plan.limits.tenants}</span>
                            </div>
                        </div>

                        <div className={`text-center py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${plan.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600'}`}>
                            {plan.is_active ? 'Ativo' : 'Inativo'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlanManager;
