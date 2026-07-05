import { ContractStatus } from '../types';

export const getStatusColor = (status: ContractStatus) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'pending_signature':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'draft':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'expiring_soon':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'expired':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    case 'renewed':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

export const getStatusLabel = (status: ContractStatus) => {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'pending_signature':
      return 'Aguardando Assinatura';
    case 'draft':
      return 'Rascunho';
    case 'expiring_soon':
      return 'Vencendo';
    case 'expired':
      return 'Vencido';
    case 'cancelled':
      return 'Cancelado';
    case 'renewed':
      return 'Renovado';
    default:
      return status;
  }
};
