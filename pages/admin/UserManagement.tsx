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
  Loader,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Download,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import SuspendUserModal from '../../components/admin/modals/SuspendUserModal';
import { ModalWrapper } from '../../components/ui/ModalWrapper';
import { useSearchParams } from 'react-router-dom';

const UserManagement: React.FC = () => {
  const { startImpersonation } = useAuth();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'Todos';

  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters state
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPlan, setFilterPlan] = useState(initialPlan);
  const [filterRole, setFilterRole] = useState('Todos');
  const [filterPeriod, setFilterPeriod] = useState('Todos');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { users, total } = await adminService.getUsers(
        currentPage,
        itemsPerPage,
        searchTerm,
        filterStatus,
        filterPlan,
        filterRole,
        filterPeriod
      );
      setUsers(users);
      setTotalUsers(total || 0);
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
  }, [searchTerm, filterStatus, filterPlan, filterRole, filterPeriod, currentPage]);

  const handleImpersonate = (u: User) => {
    if (window.confirm(`Deseja acessar o sistema como ${u.name}?`)) {
      startImpersonation(u);
    }
  };

  const handleExportCSV = async () => {
    // Basic CSV export simulation
    const headers = ['ID', 'Nome', 'Email', 'Role', 'Status', 'Plano', 'Cadastro'];
    const rows = users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.is_suspended ? 'Suspenso' : 'Ativo',
      (u as any).plan || 'Free',
      (u as any).created_at || '-',
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'usuarios_igloo.csv';
    link.click();
  };

  const handleUpdatePlan = async () => {
    if (!selectedUser || !newPlan) return;
    try {
      await adminService.updateUserPlan(selectedUser.id.toString(), newPlan);
      setToast({ message: 'Plano atualizado com sucesso.', type: 'success' });
      setIsPlanModalOpen(false);
      fetchUsers();
    } catch (error) {
      setToast({ message: 'Erro ao atualizar plano.', type: 'error' });
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

  const handleSuspendClick = (user: User) => {
    setSelectedUser(user);
    setIsSuspendModalOpen(true);
  };

  const handleConfirmSuspend = async (
    userId: string,
    reason: string,
    notes: string,
    notifyUser: boolean
  ) => {
    try {
      await adminService.suspendUser(userId, reason, notes, notifyUser);
      setToast({ message: 'Usuário suspenso com sucesso.', type: 'success' });
      fetchUsers(); // Refresh list
    } catch (error) {
      setToast({ message: 'Erro ao suspender usuário.', type: 'error' });
    }
  };

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const FilterSelect = ({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (val: string) => void;
  }) => (
    <div className='relative group'>
      <button
        onClick={() => setActiveDropdown(activeDropdown === label ? null : label)}
        className='flex items-center gap-2 px-4 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all min-w-[140px] justify-between'
      >
        <span className='truncate'>
          {label}: {value}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${activeDropdown === label ? 'rotate-180' : ''}`}
        />
      </button>

      {activeDropdown === label && (
        <>
          <div className='fixed inset-0 z-10' onClick={() => setActiveDropdown(null)}></div>
          <div className='absolute top-full left-0 mt-2 w-full bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-20 animate-scaleUp origin-top'>
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setActiveDropdown(null);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${value === opt ? 'text-primary bg-primary/5' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className='p-8 space-y-6 animate-fadeIn'>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-xl text-white font-bold shadow-xl animate-slideDown ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
        >
          <div className='flex items-center gap-3'>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className='opacity-70 hover:opacity-100'>
              ✕
            </button>
          </div>
        </div>
      )}

      <div className='flex flex-col gap-6'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className='relative flex-1 max-w-md group'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors'
              size={20}
            />
            <input
              type='text'
              placeholder='Buscar por nome, email...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className='w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-900 dark:text-white font-medium'
            />
          </div>

          <button
            onClick={handleExportCSV}
            className='px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95'
          >
            Exportar CSV
          </button>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <FilterSelect
            label='Status'
            value={filterStatus}
            options={['Todos', 'Ativo', 'Trial', 'Inativo', 'Suspenso']}
            onChange={setFilterStatus}
          />
          <FilterSelect
            label='Plano'
            value={filterPlan}
            options={['Todos', 'Free', 'Pro', 'Elite', 'Trial', 'Premium']}
            onChange={setFilterPlan}
          />
          <FilterSelect
            label='Role'
            value={filterRole}
            options={['Todos', 'Proprietário', 'Inquilino', 'Administrador']}
            onChange={setFilterRole}
          />
          <FilterSelect
            label='Período'
            value={filterPeriod}
            options={['Todos', 'Hoje', 'Últimos 7 dias', 'Último mês', 'Último ano']}
            onChange={setFilterPeriod}
          />

          {(filterStatus !== 'Todos' ||
            filterPlan !== 'Todos' ||
            filterRole !== 'Todos' ||
            filterPeriod !== 'Todos' ||
            searchTerm) && (
            <button
              onClick={() => {
                setFilterStatus('Todos');
                setFilterPlan('Todos');
                setFilterRole('Todos');
                setFilterPeriod('Todos');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className='text-xs font-bold text-primary hover:underline'
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className='bg-white dark:bg-surface-dark rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-slate-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10'>
                <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                  Usuário
                </th>
                <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                  Role
                </th>
                <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                  Plano
                </th>
                <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                  Status
                </th>
                <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                  Cadastro
                </th>
                <th className='px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right'>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 dark:divide-white/5'>
              {loading ? (
                <tr>
                  <td colSpan={6} className='px-8 py-20 text-center text-slate-500'>
                    <div className='flex flex-col justify-center items-center gap-4'>
                      <Loader className='animate-spin text-primary' size={32} />
                      <p className='font-bold text-sm'>Carregando usuários...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-8 py-20 text-center'>
                    <div className='flex flex-col items-center gap-3'>
                      <div className='w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400'>
                        <Search size={32} />
                      </div>
                      <h4 className='font-bold text-slate-900 dark:text-white'>
                        Nenhum usuário encontrado
                      </h4>
                      <p className='text-sm text-slate-500 max-w-xs'>
                        Não encontramos resultados para os filtros selecionados. Tente ajustar sua
                        busca.
                      </p>
                      <button
                        onClick={() => {
                          setFilterStatus('Todos');
                          setFilterPlan('Todos');
                          setFilterRole('Todos');
                          setFilterPeriod('Todos');
                          setSearchTerm('');
                        }}
                        className='mt-2 text-primary font-bold hover:underline text-sm'
                      >
                        Limpar todos os filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className='hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group'
                  >
                    <td className='px-8 py-5'>
                      <div className='flex items-center gap-4'>
                        <div className='w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-slate-600 dark:text-white font-black shadow-inner'>
                          {u.name ? u.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className='font-bold text-slate-900 dark:text-white leading-tight'>
                            {u.name}
                          </p>
                          <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-8 py-5'>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                            : u.role === 'owner'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            : 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                        }`}
                      >
                        {u.role === 'admin' ? 'Administrador' : u.role === 'owner' ? 'Proprietário' : 'Inquilino'}
                      </span>
                    </td>
                    <td className='px-8 py-5'>
                      {u.role === 'admin' ? (
                        <span className='text-[10px] font-black px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-lg uppercase tracking-widest'>
                          Sistema
                        </span>
                      ) : (
                        <span className='text-[10px] font-black px-2.5 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-400 uppercase tracking-widest'>
                          {(u as any).plan || 'Free'}
                        </span>
                      )}
                    </td>
                    <td className='px-8 py-5'>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          !u.is_suspended
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${!u.is_suspended ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        ></div>
                        {!u.is_suspended ? 'Ativo' : 'Suspenso'}
                      </span>
                    </td>
                    <td className='px-8 py-5'>
                      <p className='text-sm font-bold text-slate-600 dark:text-slate-400'>
                        {new Date((u as any).created_at || Date.now()).toLocaleDateString(
                          'pt-BR',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </td>
                    <td className='px-8 py-5'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsProfileModalOpen(true);
                          }}
                          title='Ver perfil completo'
                          className='p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all'
                        >
                          <Eye size={18} />
                        </button>
                        <div className='relative'>
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === `actions-${u.id}` ? null : `actions-${u.id}`
                              )
                            }
                            className='p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all'
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {activeDropdown === `actions-${u.id}` && (
                            <>
                              <div
                                className='fixed inset-0 z-10'
                                onClick={() => setActiveDropdown(null)}
                              ></div>
                              <div className='absolute right-0 top-full mt-1 w-56 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 py-2 z-20 animate-scaleUp origin-top-right'>
                                <button
                                  onClick={() => {
                                    handleImpersonate(u);
                                    setActiveDropdown(null);
                                  }}
                                  className='w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3'
                                >
                                  <ExternalLink size={16} className='text-amber-500' />
                                  Acessar como usuário
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setNewPlan((u as any).plan || 'Free');
                                    setIsPlanModalOpen(true);
                                    setActiveDropdown(null);
                                  }}
                                  className='w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3'
                                >
                                  <ShieldAlert size={16} className='text-blue-500' />
                                  Alterar plano
                                </button>
                                <button
                                  onClick={() => {
                                    if (u.is_suspended) handleUnsuspend(u);
                                    else handleSuspendClick(u);
                                    setActiveDropdown(null);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 ${u.is_suspended ? 'text-emerald-600' : 'text-rose-600'}`}
                                >
                                  {u.is_suspended ? (
                                    <>
                                      <UserCheck size={16} /> Reativar conta
                                    </>
                                  ) : (
                                    <>
                                      <Ban size={16} /> Suspender conta
                                    </>
                                  )}
                                </button>
                                <div className='my-1 border-t border-gray-100 dark:border-white/5'></div>
                                <button
                                  onClick={async () => {
                                    await adminService.exportUserData(u.id.toString());
                                    setToast({
                                      message: 'Dados exportados com sucesso.',
                                      type: 'success',
                                    });
                                    setActiveDropdown(null);
                                  }}
                                  className='w-full text-left px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3'
                                >
                                  <Download size={16} />
                                  Exportar dados
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className='px-8 py-5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-white/5'>
            <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalUsers)} a{' '}
              {Math.min(currentPage * itemsPerPage, totalUsers)} de {totalUsers} usuários
            </p>
            <div className='flex items-center gap-2'>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className='p-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm'
              >
                <ChevronLeft size={20} />
              </button>
              <div className='flex items-center gap-1'>
                {Array.from({ length: Math.ceil(totalUsers / itemsPerPage) }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === Math.ceil(totalUsers / itemsPerPage) || Math.abs(p - currentPage) <= 1)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className='text-slate-400'>...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === p ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-white/5 hover:bg-slate-50'}`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <button
                disabled={currentPage >= Math.ceil(totalUsers / itemsPerPage)}
                onClick={() => setCurrentPage(currentPage + 1)}
                className='p-2 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm'
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUser && isProfileModalOpen && (
        <ModalWrapper
          onClose={() => setIsProfileModalOpen(false)}
          title='Perfil Completo do Usuário'
          className='md:max-w-2xl'
        >
          <div className='p-8 space-y-8 overflow-y-auto max-h-[80vh]'>
            <div className='flex items-center gap-6'>
              <div className='w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-slate-600 dark:text-white text-3xl font-black shadow-inner'>
                {selectedUser.name ? selectedUser.name.charAt(0) : '?'}
              </div>
              <div>
                <h3 className='text-2xl font-black text-slate-900 dark:text-white'>
                  {selectedUser.name}
                </h3>
                <p className='text-slate-500 font-medium'>{selectedUser.email}</p>
                <div className='flex gap-2 mt-2'>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedUser.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
                  >
                    {selectedUser.role === 'owner' ? 'Proprietário' : 'Inquilino'}
                  </span>
                  <span className='px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'>
                    {(selectedUser as any).plan || 'Free'}
                  </span>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <div className='p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5'>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
                  Cadastro
                </p>
                <p className='font-bold text-slate-700 dark:text-slate-200'>
                  {new Date((selectedUser as any).created_at || Date.now()).toLocaleDateString(
                    'pt-BR',
                    {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                </p>
              </div>
              <div className='p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-gray-100 dark:border-white/5'>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
                  Status da Conta
                </p>
                <div className='flex items-center gap-2'>
                  <div
                    className={`w-2 h-2 rounded-full ${!selectedUser.is_suspended ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  ></div>
                  <p className='font-bold text-slate-700 dark:text-slate-200'>
                    {!selectedUser.is_suspended ? 'Ativo' : 'Suspenso'}
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h4 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2'>
                <ShieldAlert size={16} className='text-primary' /> Métricas de Uso
              </h4>
              <div className='grid grid-cols-3 gap-4'>
                <div className='text-center p-4 rounded-2xl border border-gray-100 dark:border-white/5'>
                  <p className='text-2xl font-black text-slate-900 dark:text-white'>12</p>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>Imóveis</p>
                </div>
                <div className='text-center p-4 rounded-2xl border border-gray-100 dark:border-white/5'>
                  <p className='text-2xl font-black text-slate-900 dark:text-white'>8</p>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>Inquilinos</p>
                </div>
                <div className='text-center p-4 rounded-2xl border border-gray-100 dark:border-white/5'>
                  <p className='text-2xl font-black text-slate-900 dark:text-white'>10</p>
                  <p className='text-[10px] font-bold text-slate-400 uppercase'>Contratos</p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h4 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2'>
                <Calendar size={16} className='text-primary' /> Últimos Pagamentos do Plano
              </h4>
              <div className='space-y-2'>
                {[
                  { month: 'Março 2024', val: 'R$ 79,90', status: 'Pago' },
                  { month: 'Fevereiro 2024', val: 'R$ 79,90', status: 'Pago' },
                  { month: 'Janeiro 2024', val: 'R$ 79,90', status: 'Pago' },
                ].map((pay, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-sm'
                  >
                    <span className='font-bold text-slate-700 dark:text-slate-300'>
                      {pay.month}
                    </span>
                    <div className='flex items-center gap-4'>
                      <span className='font-medium text-slate-500'>{pay.val}</span>
                      <span className='text-[10px] font-black text-emerald-500 uppercase'>
                        {pay.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Change Plan Modal */}
      {selectedUser && isPlanModalOpen && (
        <ModalWrapper
          onClose={() => setIsPlanModalOpen(false)}
          title='Alterar Plano do Usuário'
          className='md:max-w-md'
        >
          <div className='p-8 space-y-6'>
            <div className='bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20'>
              <p className='text-sm text-blue-800 dark:text-blue-200'>
                Alterar o plano afetará os limites de imóveis e funcionalidades de{' '}
                <strong>{selectedUser.name}</strong>.
              </p>
            </div>

            <div className='space-y-3'>
              <label className='block text-sm font-bold text-slate-700 dark:text-slate-300'>
                Selecione o Novo Plano
              </label>
              <div className='grid grid-cols-1 gap-2'>
                {['Free', 'Pro', 'Elite', 'Trial', 'Premium'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewPlan(p)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${newPlan === p ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                  >
                    <span className='font-bold'>{p}</span>
                    {newPlan === p && <CheckCircle size={18} />}
                  </button>
                ))}
              </div>
            </div>

            <div className='flex gap-3 pt-4 border-t border-gray-100 dark:border-white/10'>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className='flex-1 h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all'
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdatePlan}
                className='flex-1 h-12 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95'
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

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
