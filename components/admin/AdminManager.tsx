import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Plus,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  UserPlus,
  X,
  ShieldCheck,
  Edit,
  ArrowDownCircle,
  ArrowUpCircle,
  Power,
} from 'lucide-react';
import { ModalWrapper } from '../../components/ui/ModalWrapper';

const AdminManager: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    admin_type: 'support' as any,
    permissions: {
      dashboard: true,
      users: false,
      subscriptions: false,
      support: false,
      settings: false,
    },
  });

  const [statusReason, setStatusReason] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  useEffect(() => {
    if (currentUser && currentUser.admin_type !== 'super') {
      navigate('/admin', {
        state: {
          toastMessage: 'Você não tem permissão para acessar esta área',
          toastType: 'error',
        },
      });
    }
  }, [currentUser, navigate]);

  const handleInvite = async () => {
    if (!formData.name || !formData.email) return;
    try {
      const perms = Object.entries(formData.permissions)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);

      await adminService.createAdmin(
        formData.email,
        formData.name,
        formData.admin_type,
        formData.admin_type === 'super' ? ['*'] : perms
      );

      // Log action
      await adminService.logActivity(
        'invite_admin',
        'system',
        formData.email,
        { name: formData.name, type: formData.admin_type }
      );

      setIsInviteModalOpen(false);
      fetchAdmins();
      showToast('Convite enviado com sucesso!', 'success');
      setFormData({
        name: '',
        email: '',
        admin_type: 'support',
        permissions: {
          dashboard: true,
          users: false,
          subscriptions: false,
          support: false,
          settings: false,
        },
      });
    } catch (error) {
      showToast('Erro ao enviar convite', 'error');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedAdmin) return;
    try {
      const newStatus = !selectedAdmin.is_suspended;
      if (newStatus) {
        await adminService.suspendUser(selectedAdmin.id.toString(), statusReason, '', true);
      } else {
        await adminService.unsuspendUser(selectedAdmin.id.toString());
      }

      await adminService.logActivity(
        newStatus ? 'suspend_admin' : 'unsuspend_admin',
        'user',
        selectedAdmin.id.toString(),
        { name: selectedAdmin.name, reason: statusReason }
      );

      setIsStatusModalOpen(false);
      setStatusReason('');
      fetchAdmins();
      showToast(`Admin ${newStatus ? 'desativado' : 'reativado'} com sucesso`, 'success');
    } catch (error) {
      showToast('Erro ao alterar status', 'error');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedAdmin) return;
    try {
      const newRole = selectedAdmin.admin_type === 'super' ? 'support' : 'super';
      await adminService.updateUserPlan(selectedAdmin.id.toString(), newRole);

      await adminService.logActivity(
        'update_admin_role',
        'user',
        selectedAdmin.id.toString(),
        { name: selectedAdmin.name, new_role: newRole }
      );

      setIsRoleModalOpen(false);
      fetchAdmins();
      showToast('Nível de acesso alterado com sucesso', 'success');
    } catch (error) {
      showToast('Erro ao alterar nível', 'error');
    }
  };

  if (!currentUser || currentUser.admin_type !== 'super') return null;

  return (
    <div className='p-8 space-y-8 animate-fadeIn relative min-h-screen'>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-2xl text-white font-bold shadow-2xl animate-slideDown flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-500 shadow-emerald-500/20'
              : 'bg-red-500 shadow-red-500/20'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <div>
            <p className='text-sm'>{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className='ml-2 opacity-70 hover:opacity-100 transition-opacity'
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-white tracking-tight'>
            Minha Equipe
          </h2>
          <p className='text-sm text-slate-500'>Gestão de administradores da plataforma</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className='flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95'
        >
          <Plus size={20} />
          Convidar Admin
        </button>
      </div>

      <div className='bg-white dark:bg-surface-dark rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='border-b border-gray-50 dark:border-white/5'>
                <th className='px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                  Administrador
                </th>
                <th className='px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                  Perfil
                </th>
                <th className='px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                  Último Acesso
                </th>
                <th className='px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                  Status
                </th>
                <th className='px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right'>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50 dark:divide-white/5'>
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className='hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group'
                >
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-white shrink-0 ring-1 ring-slate-200 dark:ring-white/10'>
                        {admin.name?.charAt(0)}
                      </div>
                      <div className='min-w-0'>
                        <h4 className='font-bold text-slate-900 dark:text-white text-sm truncate'>
                          {admin.name}
                        </h4>
                        <p className='text-xs text-slate-500 truncate'>{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        admin.admin_type === 'super'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                      }`}
                    >
                      {admin.admin_type === 'super' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2 text-xs text-slate-500 font-medium'>
                      <Clock size={14} className='text-slate-400' />
                      {admin.id === currentUser.id ? 'Agora' : '10/03/2024 14:32'}
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      {admin.is_pending ? (
                        <>
                          <div className='w-2 h-2 rounded-full bg-amber-500 animate-pulse'></div>
                          <span className='text-xs font-bold text-amber-500'>
                            Convite pendente
                          </span>
                        </>
                      ) : (
                        <>
                          <div
                            className={`w-2 h-2 rounded-full ${admin.is_suspended ? 'bg-red-500' : 'bg-emerald-500'}`}
                          ></div>
                          <span
                            className={`text-xs font-bold ${admin.is_suspended ? 'text-red-500' : 'text-emerald-500'}`}
                          >
                            {admin.is_suspended ? 'Inativo' : 'Ativo'}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-right relative'>
                    <button
                      onClick={() =>
                        setActiveDropdown(activeDropdown === admin.id.toString() ? null : admin.id.toString())
                      }
                      className='p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all'
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {activeDropdown === admin.id.toString() && (
                      <>
                        <div
                          className='fixed inset-0 z-10'
                          onClick={() => setActiveDropdown(null)}
                        ></div>
                        <div className='absolute right-6 top-12 w-56 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 py-2 z-20 animate-scaleUp origin-top-right overflow-hidden'>
                          <button
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setIsEditModalOpen(true);
                              setActiveDropdown(null);
                            }}
                            className='w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3'
                          >
                            <Edit size={16} /> Editar perfil
                          </button>

                          {admin.id !== currentUser.id ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedAdmin(admin);
                                  setIsRoleModalOpen(true);
                                  setActiveDropdown(null);
                                }}
                                className='w-full text-left px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/5 flex items-center gap-3'
                              >
                                {admin.admin_type === 'super' ? (
                                  <>
                                    <ArrowDownCircle size={16} /> Rebaixar para Admin
                                  </>
                                ) : (
                                  <>
                                    <ArrowUpCircle size={16} /> Alterar para Super Admin
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAdmin(admin);
                                  setIsStatusModalOpen(true);
                                  setActiveDropdown(null);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-3 ${admin.is_suspended ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-600 hover:bg-red-50'}`}
                              >
                                <Power size={16} />{' '}
                                {admin.is_suspended ? 'Reativar acesso' : 'Desativar acesso'}
                              </button>
                            </>
                          ) : (
                            <div className='relative group/self'>
                              <button
                                disabled
                                className='w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 dark:text-slate-600 flex items-center gap-3 cursor-not-allowed'
                              >
                                <Power size={16} /> Alterar status
                              </button>
                              <div className='absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/self:opacity-100 transition-opacity whitespace-nowrap pointer-events-none'>
                                Você não pode alterar seu próprio perfil
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <ModalWrapper
          onClose={() => setIsInviteModalOpen(false)}
          title='Convidar Administrador'
          showCloseButton={true}
          className='md:max-w-xl'
        >
          <div className='p-8 space-y-8 bg-background-light dark:bg-background-dark'>
            <div className='space-y-6'>
              <h3 className='text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2'>
                <UserPlus size={16} className='text-primary' /> Dados do Administrador
              </h3>
              <div className='grid grid-cols-1 gap-4'>
                <div>
                  <label className='block text-xs font-bold text-slate-500 mb-2 uppercase'>
                    Nome completo *
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className='w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none transition-all text-sm'
                    placeholder='Nome do administrador'
                  />
                </div>
                <div>
                  <label className='block text-xs font-bold text-slate-500 mb-2 uppercase'>
                    E-mail *
                  </label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className='w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none transition-all text-sm'
                    placeholder='email@exemplo.com'
                  />
                </div>
                <div>
                  <label className='block text-xs font-bold text-slate-500 mb-2 uppercase'>
                    Nível de acesso *
                  </label>
                  <select
                    value={formData.admin_type}
                    onChange={(e) => setFormData({ ...formData, admin_type: e.target.value as any })}
                    className='w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none transition-all text-sm'
                  >
                    <option value='support'>Admin</option>
                    <option value='super'>Super Admin</option>
                  </select>
                  <p className='mt-2 text-[10px] text-slate-400 font-medium italic'>
                    {formData.admin_type === 'super'
                      ? 'Super Admin tem acesso total à plataforma incluindo dados financeiros e gestão de equipe'
                      : 'Admin tem acesso restrito aos módulos permitidos abaixo'}
                  </p>
                </div>
              </div>
            </div>

            {formData.admin_type !== 'super' ? (
              <div className='space-y-6 pt-6 border-t border-gray-100 dark:border-white/5'>
                <h3 className='text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2'>
                  <ShieldCheck size={16} className='text-primary' /> Permissões Específicas
                </h3>
                <div className='space-y-3'>
                  {[
                    { id: 'dashboard', label: 'Dashboard', disabled: true },
                    { id: 'users', label: 'Gerenciar Usuários' },
                    { id: 'subscriptions', label: 'Assinaturas' },
                    { id: 'support', label: 'Central de Suporte' },
                    { id: 'settings', label: 'Configurações' },
                  ].map((module) => (
                    <div
                      key={module.id}
                      className='flex items-center justify-between p-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-50 dark:border-white/5'
                    >
                      <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>
                        {module.label}
                      </span>
                      <button
                        disabled={module.disabled}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              [module.id]: !(formData.permissions as any)[module.id],
                            },
                          })
                        }
                        className={`w-10 h-6 rounded-full relative transition-colors ${
                          (formData.permissions as any)[module.id] ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'
                        } ${module.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                            (formData.permissions as any)[module.id] ? 'left-5' : 'left-1'
                          }`}
                        ></div>
                      </button>
                    </div>
                  ))}
                  <p className='text-[10px] text-slate-400 font-medium italic'>
                    Super Admins têm acesso automático a todos os módulos
                  </p>
                </div>
              </div>
            ) : (
              <div className='p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-3'>
                <ShieldCheck size={20} className='text-amber-500 shrink-0' />
                <p className='text-xs text-amber-700 dark:text-amber-400 font-medium'>
                  Super Admins têm acesso automático a todos os módulos e configurações do sistema.
                </p>
              </div>
            )}

            <div className='pt-6 border-t border-gray-100 dark:border-white/5 flex gap-4'>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className='flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all hover:bg-slate-200'
              >
                Cancelar
              </button>
              <button
                onClick={handleInvite}
                disabled={!formData.name || !formData.email}
                className='flex-[2] py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark disabled:opacity-50 active:scale-[0.98]'
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Role Change Confirmation */}
      {isRoleModalOpen && selectedAdmin && (
        <ModalWrapper
          onClose={() => setIsRoleModalOpen(false)}
          title='Confirmar Alteração de Nível'
          showCloseButton={true}
        >
          <div className='p-8 space-y-6 text-center'>
            <div className='w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600'>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className='text-lg font-bold text-slate-900 dark:text-white'>
                Deseja alterar o nível de {selectedAdmin.name}?
              </h4>
              <p className='text-sm text-slate-500 mt-2'>
                {selectedAdmin.admin_type === 'super'
                  ? 'Ao rebaixar para Admin comum, o usuário perderá acesso às configurações críticas e gestão de equipe.'
                  : 'Ao tornar Super Admin, o usuário terá controle total sobre a plataforma, incluindo finanças e equipe.'}
              </p>
            </div>
            <div className='flex gap-4'>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className='flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold'
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateRole}
                className='flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20'
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && selectedAdmin && (
        <ModalWrapper
          onClose={() => setIsStatusModalOpen(false)}
          title={selectedAdmin.is_suspended ? 'Reativar Acesso' : 'Desativar Acesso'}
          showCloseButton={true}
        >
          <div className='p-8 space-y-6'>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${selectedAdmin.is_suspended ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}
            >
              <Power size={32} />
            </div>
            <div className='text-center'>
              <h4 className='text-lg font-bold text-slate-900 dark:text-white'>
                {selectedAdmin.is_suspended
                  ? `Reativar acesso de ${selectedAdmin.name}?`
                  : `Desativar acesso de ${selectedAdmin.name}?`}
              </h4>
              <p className='text-sm text-slate-500 mt-2'>
                {selectedAdmin.is_suspended
                  ? 'O administrador poderá voltar a acessar a plataforma com suas permissões anteriores.'
                  : 'O acesso será bloqueado imediatamente, mas o histórico de ações será mantido.'}
              </p>
            </div>

            {!selectedAdmin.is_suspended && (
              <div>
                <label className='block text-xs font-bold text-slate-500 mb-2 uppercase'>
                  Motivo da desativação *
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none transition-all text-sm h-24 resize-none'
                  placeholder='Descreva o motivo...'
                ></textarea>
              </div>
            )}

            <div className='flex gap-4 pt-4'>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className='flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold'
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!selectedAdmin.is_suspended && !statusReason}
                className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg ${selectedAdmin.is_suspended ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'} disabled:opacity-50`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default AdminManager;
