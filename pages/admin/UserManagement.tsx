import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { User } from '../../types';

// Components
import { UserFilters } from './components/UserManagement/UserFilters';
import { UserTable } from './components/UserManagement/UserTable';
import { UserProfileModal } from './components/UserManagement/modals/UserProfileModal';
import { UserPlanModal } from './components/UserManagement/modals/UserPlanModal';
import { AddOwnerModal } from './components/UserManagement/modals/AddOwnerModal';
import SuspendUserModal from '../../components/admin/modals/SuspendUserModal';

const UserManagement: React.FC = () => {
  const { startImpersonation } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'Todos';

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPlan, setFilterPlan] = useState(initialPlan);
  const [filterRole, setFilterRole] = useState('Todos');
  const [filterPeriod, setFilterPeriod] = useState('Todos');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAddOwnerModalOpen, setIsAddOwnerModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const itemsPerPage = 10;

  // React Query for data fetching
  const { data, isLoading } = useQuery({
    queryKey: ['users', currentPage, searchTerm, filterStatus, filterPlan, filterRole, filterPeriod],
    queryFn: () => adminService.getUsers(
      currentPage,
      itemsPerPage,
      searchTerm,
      filterStatus,
      filterPlan,
      filterRole,
      filterPeriod
    ),
    placeholderData: (previousData) => previousData, // Maintain UI during fetch
  });

  const users = data?.users || [];
  const totalUsers = data?.total || 0;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImpersonate = (u: User) => {
    if (window.confirm(`Deseja acessar o sistema como ${u.name}?`)) {
      startImpersonation(u);
    }
  };

  const handleExportCSV = async () => {
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
      showToast('Plano atualizado com sucesso.');
      setIsPlanModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      showToast('Erro ao atualizar plano.', 'error');
    }
  };

  const handleUnsuspend = async (user: User) => {
    if (!window.confirm(`Deseja reativar a conta de ${user.name}?`)) return;
    try {
      await adminService.unsuspendUser(user.id.toString());
      showToast('Usuário reativado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      showToast('Erro ao reativar usuário.', 'error');
    }
  };

  const handleConfirmSuspend = async (
    userId: string,
    reason: string,
    notes: string,
    notifyUser: boolean
  ) => {
    try {
      await adminService.suspendUser(userId, reason, notes, notifyUser);
      showToast('Usuário suspenso com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      showToast('Erro ao suspender usuário.', 'error');
    }
  };

  const handleApprove = async (user: User) => {
    if (!window.confirm(`Deseja aprovar o acesso de ${user.name} como Proprietário?`)) return;
    try {
      await adminService.updateUserRole(user.id.toString(), 'owner');
      showToast('Usuário aprovado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      showToast('Erro ao aprovar usuário.', 'error');
    }
  };

  const handleClearFilters = () => {
    setFilterStatus('Todos');
    setFilterPlan('Todos');
    setFilterRole('Todos');
    setFilterPeriod('Todos');
    setSearchTerm('');
    setCurrentPage(1);
  };

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

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPlan={filterPlan}
        setFilterPlan={setFilterPlan}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        filterPeriod={filterPeriod}
        setFilterPeriod={setFilterPeriod}
        onClearFilters={handleClearFilters}
        onExportCSV={handleExportCSV}
        onAddOwner={() => setIsAddOwnerModalOpen(true)}
      />

      <UserTable
        users={users}
        totalUsers={totalUsers}
        loading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onImpersonate={handleImpersonate}
        onViewProfile={(u) => { setSelectedUser(u); setIsProfileModalOpen(true); }}
        onUpdatePlan={(u) => { setSelectedUser(u); setNewPlan((u as any).plan || 'Free'); setIsPlanModalOpen(true); }}
        onSuspend={(u) => { setSelectedUser(u); setIsSuspendModalOpen(true); }}
        onUnsuspend={handleUnsuspend}
        onApprove={handleApprove}
        onExportData={async (u) => { await adminService.exportUserData(u.id.toString()); showToast('Dados exportados com sucesso.'); }}
        onClearFilters={handleClearFilters}
      />

      {/* Modals */}
      {selectedUser && (
        <>
          <UserProfileModal
            user={selectedUser}
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
          <UserPlanModal
            user={selectedUser}
            isOpen={isPlanModalOpen}
            onClose={() => setIsPlanModalOpen(false)}
            newPlan={newPlan}
            setNewPlan={setNewPlan}
            onUpdatePlan={handleUpdatePlan}
          />
          <SuspendUserModal
            user={selectedUser}
            isOpen={isSuspendModalOpen}
            onClose={() => setIsSuspendModalOpen(false)}
            onSuspend={handleConfirmSuspend}
          />
          <AddOwnerModal
            isOpen={isAddOwnerModalOpen}
            onClose={() => setIsAddOwnerModalOpen(false)}
            onSuccess={() => {
              showToast('Proprietário adicionado com sucesso!');
              queryClient.invalidateQueries({ queryKey: ['users'] });
            }}
          />
        </>
      )}

      {/* Fallback para quando nenhum usuário está selecionado mas o modal de adicionar está aberto */}
      {!selectedUser && isAddOwnerModalOpen && (
        <AddOwnerModal
          isOpen={isAddOwnerModalOpen}
          onClose={() => setIsAddOwnerModalOpen(false)}
          onSuccess={() => {
            showToast('Proprietário adicionado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['users'] });
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
