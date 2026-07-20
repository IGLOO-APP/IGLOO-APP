import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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

  // Confirmation modals
  const [confirmAction, setConfirmAction] = useState<{
    type: 'impersonate' | 'unsuspend' | 'approve';
    user: User;
  } | null>(null);

  const itemsPerPage = 10;

  // React Query for data fetching
  const { data, isLoading } = useQuery({
    queryKey: [
      'users',
      currentPage,
      searchTerm,
      filterStatus,
      filterPlan,
      filterRole,
      filterPeriod,
    ],
    queryFn: () =>
      adminService.getUsers(
        currentPage,
        itemsPerPage,
        searchTerm,
        filterStatus,
        filterPlan,
        filterRole,
        filterPeriod
      ),
    placeholderData: (previousData) => previousData,
  });

  const users = data?.users || [];
  const totalUsers = data?.total || 0;

  const handleImpersonate = (u: User) => {
    setConfirmAction({ type: 'impersonate', user: u });
  };

  const handleConfirmImpersonate = () => {
    if (!confirmAction) return;
    startImpersonation(confirmAction.user);
    setConfirmAction(null);
  };

  const handleExportCSV = async () => {
    const headers = ['ID', 'Nome', 'Email', 'Role', 'Status', 'Plano', 'Cadastro'];
    const rows = users.map((u) => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.is_suspended ? 'Suspenso' : 'Ativo',
      u.plan || 'Free',
      u.created_at || '-',
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'usuarios_igloo.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleUpdatePlan = async () => {
    if (!selectedUser || !newPlan) return;
    try {
      await adminService.updateUserPlan(selectedUser.id.toString(), newPlan);
      toast.success('Plano atualizado com sucesso.');
      setIsPlanModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      toast.error('Erro ao atualizar plano.');
    }
  };

  const handleUnsuspend = (user: User) => {
    setConfirmAction({ type: 'unsuspend', user });
  };

  const handleConfirmUnsuspend = async () => {
    if (!confirmAction) return;
    try {
      await adminService.unsuspendUser(confirmAction.user.id.toString());
      toast.success('Usuário reativado com sucesso.');
      setConfirmAction(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      toast.error('Erro ao reativar usuário.');
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
      toast.success('Usuário suspenso com sucesso.');
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      toast.error('Erro ao suspender usuário.');
    }
  };

  const handleApprove = (user: User) => {
    setConfirmAction({ type: 'approve', user });
  };

  const handleConfirmApprove = async () => {
    if (!confirmAction) return;
    try {
      await adminService.updateUserRole(confirmAction.user.id.toString(), 'owner');
      toast.success('Usuário aprovado com sucesso.');
      setConfirmAction(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      toast.error('Erro ao aprovar usuário.');
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

  const confirmConfig = (() => {
    if (!confirmAction) return null;
    switch (confirmAction.type) {
      case 'impersonate':
        return {
          title: 'Acessar como Usuário',
          description: `Deseja acessar o sistema como ${confirmAction.user.name}? Você poderá ver o dashboard, mensagens e configurações como se fosse este usuário.`,
          confirmLabel: 'Acessar',
          onConfirm: handleConfirmImpersonate,
        };
      case 'unsuspend':
        return {
          title: 'Reativar Usuário',
          description: `Deseja reativar a conta de ${confirmAction.user.name}? O usuário poderá acessar o sistema novamente.`,
          confirmLabel: 'Reativar',
          onConfirm: handleConfirmUnsuspend,
        };
      case 'approve':
        return {
          title: 'Aprovar Proprietário',
          description: `Deseja aprovar o acesso de ${confirmAction.user.name} como Proprietário? Ele terá acesso completo ao painel de proprietário.`,
          confirmLabel: 'Aprovar',
          onConfirm: handleConfirmApprove,
        };
    }
  })();

  return (
    <div className='p-8 space-y-6 animate-fadeIn'>
      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
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
        onViewProfile={(u) => {
          setSelectedUser(u);
          setIsProfileModalOpen(true);
        }}
        onUpdatePlan={(u) => {
          setSelectedUser(u);
          setNewPlan(u.plan || 'Free');
          setIsPlanModalOpen(true);
        }}
        onSuspend={(u) => {
          setSelectedUser(u);
          setIsSuspendModalOpen(true);
        }}
        onUnsuspend={handleUnsuspend}
        onApprove={handleApprove}
        onExportData={async (u) => {
          try {
            const data = await adminService.exportUserData(u.id.toString());
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `export_${u.name.replace(/\s+/g, '_')}_${u.id.substring(0, 5)}.json`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Dados exportados com sucesso.');
          } catch {
            toast.error('Erro ao exportar dados.');
          }
        }}
        onClearFilters={handleClearFilters}
      />

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className='max-w-md p-0 gap-0'>
          <DialogHeader className='px-6 py-4 border-b border-border'>
            <DialogTitle className='text-lg font-bold'>{confirmConfig?.title}</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className='p-6 space-y-4'>
            <p className='text-sm text-muted-foreground'>{confirmConfig?.description}</p>
            <div className='flex gap-3'>
              <button
                onClick={() => setConfirmAction(null)}
                className='flex-1 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-sm rounded-xl hover:bg-slate-200 transition-all'
              >
                Cancelar
              </button>
              <button
                onClick={confirmConfig?.onConfirm}
                className='flex-[2] py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all'
              >
                {confirmConfig?.confirmLabel}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              toast.success('Proprietário adicionado com sucesso!');
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
            toast.success('Proprietário adicionado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['users'] });
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
