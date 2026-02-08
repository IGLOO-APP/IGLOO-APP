import React, { useState } from 'react';
import {
    Settings,
    Shield,
    Database,
    Globe,
    Bell,
    Cpu,
    Save,
    RotateCcw,
    ToggleRight,
    Lock,
    Mail,
    Zap
} from 'lucide-react';
import FeatureFlagManager from '../../components/admin/FeatureFlagManager';
import PlanManager from '../../components/admin/PlanManager';

const SystemSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Geral');

    const tabs = ['Geral', 'Planos', 'Segurança', 'Integrações', 'Notificações', 'Feature Flags'];

    return (
        <div className="p-8 space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Configurações do Sistema</h2>
                    <p className="text-sm text-slate-500">Controle global da plataforma e parâmetros técnicos.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all">
                        <RotateCcw size={18} />
                        Descartar
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                        <Save size={18} />
                        Salvar Alterações
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Tabs */}
                <aside className="lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${activeTab === tab
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </aside>

                {/* Settings Content */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm space-y-8">
                        {activeTab === 'Geral' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Nome da Plataforma</label>
                                        <input type="text" defaultValue="Igloo Gestão Imobiliária" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">URL de Suporte</label>
                                        <input type="text" defaultValue="https://suporte.igloo.pt" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">E-mail de Contato Principal</label>
                                        <input type="email" defaultValue="contato@igloo.pt" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Idioma Padrão</label>
                                        <select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-medium appearance-none">
                                            <option>Português (Brasil)</option>
                                            <option>Português (Portugal)</option>
                                            <option>English (US)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-50 dark:border-white/5 space-y-6">
                                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Zap className="text-amber-500" size={20} />
                                        Limites Globais
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Max Imóveis (Free)</p>
                                            <input type="number" defaultValue="1" className="bg-transparent border-none p-0 text-xl font-bold dark:text-white w-full" />
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Max Fotos / Imóvel</p>
                                            <input type="number" defaultValue="20" className="bg-transparent border-none p-0 text-xl font-bold dark:text-white w-full" />
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Backup Retenção (Dias)</p>
                                            <input type="number" defaultValue="30" className="bg-transparent border-none p-0 text-xl font-bold dark:text-white w-full" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'Planos' && (
                            <PlanManager />
                        )}

                        {activeTab === 'Feature Flags' && (
                            <FeatureFlagManager />
                        )}

                        {activeTab === 'Segurança' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-3xl flex items-start gap-4">
                                    <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-rose-900 dark:text-rose-400">Proteção de Força Bruta</h4>
                                        <p className="text-sm text-rose-800/70 dark:text-rose-400/70">O sistema está configurado para bloquear IPs após 5 tentativas de login mal-sucedidas em 10 minutos.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 border border-gray-100 dark:border-white/5 rounded-[32px] space-y-4">
                                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold">
                                            <Lock size={20} className="text-primary" />
                                            <span>Políticas de Senha</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Mínimo de caracteres</span>
                                                <span className="font-bold dark:text-white">8</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Exigir letras maiúsculas</span>
                                                <div className="w-10 h-5 bg-primary rounded-full relative">
                                                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Exigir caracteres especiais</span>
                                                <div className="w-10 h-5 bg-primary rounded-full relative">
                                                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-gray-100 dark:border-white/5 rounded-[32px] space-y-4">
                                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold">
                                            <Cpu size={20} className="text-amber-500" />
                                            <span>Logs de Auditoria</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Retenção de Logs</span>
                                                <span className="font-bold dark:text-white">90 dias</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-500">Log de Visualização de Dados</span>
                                                <div className="w-10 h-5 bg-slate-200 dark:bg-white/10 rounded-full relative">
                                                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                                                </div>
                                            </div>
                                            <button className="w-full text-center py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">
                                                Baixar Backup Completo de Logs
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
