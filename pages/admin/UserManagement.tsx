import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreHorizontal,
    Ban,
    UserCheck,
    Mail,
    ExternalLink,
    ChevronDown,
    Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import SuspendUserModal from '../../components/admin/modals/SuspendUserModal';
import { Toast } from '../../components/ui/Toast';

const UserManagement: React.FC = () => {
    const { startImpersonation } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todos');

    // Modals state
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { users } = await adminService.getUsers(1, 100, searchTerm, filterStatus === 'Suspenso' ? 'suspended' : undefined);
            setUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(debounce);
    }, [searchTerm, filterStatus]);

    const handleSuspendClick = (user: User) => {
        setSelectedUser(user);
        setIsSuspendModalOpen(true);
    };

    const handleConfirmSuspend = async (userId: string, reason: string, notes: string, notifyUser: boolean) => {
        try {
            await adminService.suspendUser(userId, reason, notes, notifyUser);
            setToast({ message: 'Usuário suspenso com sucesso.', type: 'success' });
            fetchUsers(); // Refresh list
        } catch (error) {
            setToast({ message: 'Erro ao suspender usuário.', type: 'error' });
        }
    };

    const handleUnsuspend = async (user: User) => {
        if (!window.confirm(`Deseja reativar a conta de ${user.name}?`)) return;
        try {
            await adminService.unsuspendUser(user.id.toString());
            setToast({ message: 'Usuário reativado com sucesso.', type: 'success' });
            fetchUsers();
        } catch (error) {
            setToast({ message: 'Erro ao reativar usuário.', type: 'error' });
        }
    };

    return (
        <div className="p-8 space-y-6 animate-fadeIn">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl text-white font-bold shadow-xl animate-slideDown ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {toast.message}
                    <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
                    {/* Auto dismiss logic would be handled by a proper Toast context, this is a local inline fallback */}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                            <Filter size={18} />
                            Status: {filterStatus}
                            <ChevronDown size={16} />
                        </button>
                    </div>

                    <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Usuário</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Cadastro</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações Administrativas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader className="animate-spin" size={20} /> Carregando usuários...
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-slate-600 dark:text-white font-bold shadow-inner">
                                                {u.name ? u.name.charAt(0) : '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white leading-tight">{u.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${!u.is_suspended
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${!u.is_suspended ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            {!u.is_suspended ? 'Ativo' : 'Suspenso'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {/* u.created_at is likely an ISO string in a real DB, but User type might not have it yet? assuming user has created_at from supbase default */}
                                            {/* We'll assume User interface has standard supabase fields or we map them */}
                                            Currently Active
                                        </p>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-2 group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <button
                                                onClick={() => startImpersonation({
                                                    id: u.id.toString(),
                                                    name: u.name,
                                                    email: u.email,
                                                    role: 'owner'
                                                })}
                                                title="Login como usuário"
                                                className="p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                            <button title="Enviar Mensagem" className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-xs font-bold uppercase tracking-tighter">
                                                <Mail size={18} />
                                            </button>
                                            <button
                                                onClick={() => u.is_suspended ? handleUnsuspend(u) : handleSuspendClick(u)}
                                                title={!u.is_suspended ? 'Suspender Conta' : 'Reativar Conta'}
                                                className={`p-2.5 rounded-xl transition-all ${!u.is_suspended
                                                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white'
                                                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
                                                    }`}
                                            >
                                                {!u.is_suspended ? <Ban size={18} /> : <UserCheck size={18} />}
                                            </button>
                                            <button className="p-2.5 bg-slate-50 dark:bg-white/10 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <SuspendUserModal
                    user={selectedUser}
                    isOpen={isSuspendModalOpen}
                    onClose={() => setIsSuspendModalOpen(false)}
                    onSuspend={handleConfirmSuspend}
                />
            )}
        </div>
    );
};

export default UserManagement;
