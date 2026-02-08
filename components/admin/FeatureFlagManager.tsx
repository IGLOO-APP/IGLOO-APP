import React, { useState, useEffect } from 'react';
import { FeatureFlag } from '../../types';
import { Switch } from '@headlessui/react';
import { supabase } from '../../lib/supabase';
import { Loader, Plus, Trash2, Tag } from 'lucide-react';

const FeatureFlagManager: React.FC = () => {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [newFlagName, setNewFlagName] = useState('');
    const [newFlagDescription, setNewFlagDescription] = useState('');

    const fetchFlags = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('feature_flags').select('*').order('created_at', { ascending: false });
        if (data) {
            setFlags(data as FeatureFlag[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFlags();
    }, []);

    const toggleFlag = async (id: string, currentState: boolean) => {
        const { error } = await supabase
            .from('feature_flags')
            .update({ enabled: !currentState })
            .eq('id', id);

        if (!error) {
            setFlags(flags.map(f => f.id === id ? { ...f, enabled: !currentState } : f));
        }
    };

    const createFlag = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('feature_flags').insert({
            name: newFlagName,
            description: newFlagDescription,
            enabled: false,
            target_audience: 'all'
        });

        if (!error) {
            setNewFlagName('');
            setNewFlagDescription('');
            fetchFlags();
        }
    };

    const deleteFlag = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover esta feature flag?')) return;
        const { error } = await supabase.from('feature_flags').delete().eq('id', id);
        if (!error) {
            setFlags(flags.filter(f => f.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Create New */}
            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Nova Feature Flag</h3>
                <form onSubmit={createFlag} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Nome (Chave)</label>
                        <input
                            type="text"
                            value={newFlagName}
                            onChange={e => setNewFlagName(e.target.value)}
                            placeholder="ex: new_dashboard_v2"
                            className="w-full px-4 py-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm font-mono"
                            required
                        />
                    </div>
                    <div className="flex-[2] space-y-1">
                        <label className="text-xs font-semibold text-slate-500">Descrição</label>
                        <input
                            type="text"
                            value={newFlagDescription}
                            onChange={e => setNewFlagDescription(e.target.value)}
                            placeholder="Habilita o novo dashboard para usuários..."
                            className="w-full px-4 py-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm"
                            required
                        />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2">
                        <Plus size={18} />
                        Criar
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader className="animate-spin text-slate-400" /></div>
                ) : flags.length === 0 ? (
                    <div className="text-center p-8 text-slate-500">Nenhuma flag configurada.</div>
                ) : (
                    flags.map(flag => (
                        <div key={flag.id} className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between group hover:border-primary/50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${flag.enabled ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-50 text-slate-400 dark:bg-white/5'}`}>
                                    <Tag size={20} />
                                </div>
                                <div>
                                    <h4 className="font-mono font-bold text-slate-900 dark:text-white">{flag.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{flag.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 rounded">
                                            {flag.target_audience}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <Switch
                                    checked={flag.enabled}
                                    onChange={() => toggleFlag(flag.id, flag.enabled)}
                                    className={`${flag.enabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'
                                        } relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
                                >
                                    <span
                                        className={`${flag.enabled ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>

                                <button
                                    onClick={() => deleteFlag(flag.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeatureFlagManager;
