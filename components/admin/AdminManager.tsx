import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Toast } from '../../components/ui/Toast';
import {
    Shield,
    Plus,
    MoreHorizontal,
    Trash2,
    CheckCircle,
    Clock,
    AlertCircle,
    UserPlus,
    X
} from 'lucide-react';

const AdminManager: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [admins, setAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Delete Confirmation State
    const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form state
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminName, setNewAdminName] = useState('');
    const [newAdminType, setNewAdminType] = useState<'support' | 'finance' | 'content' | 'super'>('support');

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAdmins();
            setAdmins(data || []);
        } catch (error) {
            console.error('Error fetching admins:', error);
            showToast('Erro ao carregar lista de administradores', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.createAdmin(newAdminEmail, newAdminName, newAdminType, []);
            setIsCreateModalOpen(false);
            fetchAdmins();
            setNewAdminEmail('');
            setNewAdminName('');
            showToast('Convite enviado com sucesso (Simulado)', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao criar administrador', 'error');
        }
    };

    const confirmDelete = (id: string) => {
        setAdminToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleRemoveAdmin = async () => {
        if (!adminToDelete) return;

        try {
            await adminService.removeAdmin(adminToDelete);
            fetchAdmins();
            showToast('Administrador removido com sucesso', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao remover administrador', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setAdminToDelete(null);
        }
    };

    if (currentUser?.admin_type !== 'super') {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center p-8">
                <Shield size={64} className="text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Acesso Restrito</h2>
                <p className="text-slate-500 max-w-md">Apenas super administradores podem gerenciar outros administradores.</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-fadeIn relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-2xl text-white font-bold shadow-2xl animate-slideDown flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <div>
                        <p className="text-sm">{toast.message}</p>
                    </div>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciamento de Admins</h2>
                    <p className="text-sm text-slate-500">Adicione e gerencie permissões da equipe interna.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-slate-900/20"
                >
                    <UserPlus size={20} />
                    Novo Admin
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map(admin => (
                    <div key={admin.id} className="bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 ${admin.admin_type === 'super' ? 'bg-purple-500' :
                                admin.admin_type === 'finance' ? 'bg-emerald-500' :
                                    'bg-blue-500'
                            }`}></div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xl font-bold text-slate-600 dark:text-white">
                                    {admin.name?.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{admin.name}</h4>
                                    <p className="text-xs text-slate-500">{admin.email}</p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${admin.admin_type === 'super' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' :
                                        admin.admin_type === 'finance' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                            'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                    }`}>
                                    {admin.admin_type || 'Admin'}
                                </span>
                                {admin.id === currentUser.id && (
                                    <span className="text-xs text-slate-400 font-medium">(Você)</span>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-50 dark:border-white/5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Permissões</p>
                                <div className="flex flex-wrap gap-2">
                                    {admin.admin_type === 'super' ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            <Shield size={12} /> Acesso Total
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-500">Limitado ao cargo</span>
                                    )}
                                </div>
                            </div>

                            {admin.id !== currentUser.id && (
                                <button
                                    onClick={() => confirmDelete(admin.id.toString())}
                                    className="w-full py-2 mt-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} />
                                    Remover Acesso
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-md p-8 rounded-[32px] shadow-2xl animate-scaleIn border border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Adicionar Administrador</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={newAdminName}
                                    onChange={e => setNewAdminName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent focus:bg-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Ex: Ana Silva"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newAdminEmail}
                                    onChange={e => setNewAdminEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent focus:bg-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Ex: ana@exemplo.com"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tipo de Acesso</label>
                                <div className="relative">
                                    <select
                                        value={newAdminType}
                                        onChange={e => setNewAdminType(e.target.value as any)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent focus:bg-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="support">Suporte (Atendimento)</option>
                                        <option value="finance">Financeiro</option>
                                        <option value="content">Conteúdo</option>
                                        <option value="super">Super Admin (Acesso Total)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                                >
                                    <UserPlus size={18} />
                                    Enviar Convite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-sm p-6 rounded-[32px] shadow-2xl animate-scaleIn border border-gray-100 dark:border-white/5 text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Remover Administrador?</h3>
                        <p className="text-sm text-slate-500 mb-6">Esta ação removerá as permissões administrativas deste usuário. Ele voltará a ser um usuário comum (Tenant).</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRemoveAdmin}
                                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                            >
                                Confirmar e Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManager;
