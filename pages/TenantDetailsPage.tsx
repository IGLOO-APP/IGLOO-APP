import React from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Clock,
  Trash2,
} from 'lucide-react';
import { GlassmorphismNav } from '../components/ui/GlassmorphismNav';
import { OwnerOnboardingReviewChecklist } from '../components/tenants/OwnerOnboardingReviewChecklist';
import { useTenantDetails } from './tenant/hooks/useTenantDetails';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DocumentPreviewModal } from './tenant/modals/DocumentPreviewModal';
import { OverviewTab } from './tenant/sections/OverviewTab';
import { PaymentsTab } from './tenant/sections/PaymentsTab';
import { DocsTab } from './tenant/sections/DocsTab';
import { HistoryTab } from './tenant/sections/HistoryTab';

const TenantDetailsPage: React.FC = () => {
  const h = useTenantDetails();

  if (h.isLoading) {
    return (
      <div className='p-8 space-y-6 animate-pulse'>
        <div className='h-4 w-36 bg-gray-200 dark:bg-white/10 rounded' />
        <div className='lg-card lg-card-lift p-6 flex items-center gap-6'>
          <div className='w-16 h-16 rounded-2xl bg-gray-200 dark:bg-white/10' />
          <div className='space-y-2 flex-1'>
            <div className='h-5 w-48 bg-gray-200 dark:bg-white/10 rounded' />
            <div className='h-4 w-72 bg-gray-200 dark:bg-white/10 rounded' />
          </div>
        </div>
        <div className='h-11 bg-gray-200 dark:bg-white/10 rounded-xl' />
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='h-40 bg-gray-200 dark:bg-white/10 rounded-2xl col-span-2' />
          <div className='h-40 bg-gray-200 dark:bg-white/10 rounded-2xl' />
        </div>
      </div>
    );
  }

  if (h.error || !h.tenant) {
    return (
      <div className='p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-screen'>
        <div className='w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/20 text-red-500 flex items-center justify-center'>
          <ShieldAlert size={40} strokeWidth={1.8} />
        </div>
        <div>
          <h2 className='text-xl font-bold text-slate-900 dark:text-white'>
            Perfil não localizado
          </h2>
          <p className='text-sm text-slate-500 max-w-sm mt-1'>
            Não foi possível carregar os detalhes do inquilino requisitado.
          </p>
        </div>
        <button
          onClick={() => h.navigate('/tenants')}
          className='px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm shadow-md flex items-center gap-2 hover:scale-105 transition-transform'
        >
          <ArrowLeft size={16} strokeWidth={1.8} /> Voltar para Inquilinos
        </button>
      </div>
    );
  }

  const { tenant } = h;

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='px-8 pt-6 pb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-widest'>
          <button
            onClick={() => h.navigate('/tenants')}
            className='hover:text-primary transition-colors flex items-center gap-1'
          >
            <ArrowLeft size={13} strokeWidth={1.8} /> Inquilinos
          </button>
          <span>/</span>
          <span className='text-slate-700 dark:text-slate-200 font-black'>{tenant.name}</span>
        </div>
        <button
          onClick={() => h.setShowDeleteDialog(true)}
          className='flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all'
        >
          <Trash2 size={14} strokeWidth={1.8} /> Excluir
        </button>
      </div>

      <div className='px-8 py-3 sticky top-[0px] z-20 flex justify-center'>
        <GlassmorphismNav
          activeTab={h.activeTab}
          onChange={h.setActiveTab}
          items={[
            { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
            { id: 'payments', label: 'Financeiro', icon: DollarSign },
            {
              id: 'tenantConfig',
              label: 'Exigências',
              icon: ShieldCheck,
              badge: h.criticalPendingCount > 0 ? h.criticalPendingCount : undefined,
            },
            { id: 'history', label: 'Histórico', icon: Clock },
          ]}
        />
      </div>

      <div className='flex-1 p-6 pb-32 relative space-y-6'>
        {h.activeTab === 'overview' && (
          <div className='space-y-6'>
            <OverviewTab
              tenant={tenant}
              financialSummary={h.financialSummary}
              contractProgress={h.contractProgress}
              remainingTime={h.getRemainingContractTime}
              formattedPhone={h.formatPhone}
            />
            <DocsTab tenant={tenant} docs={h.docs} onOpenPreview={h.handleOpenPreview} />
          </div>
        )}
        {h.activeTab === 'payments' && (
          <PaymentsTab payments={h.payments} financialSummary={h.financialSummary} />
        )}
        {h.activeTab === 'tenantConfig' && (
          <div className='animate-fadeIn space-y-8 pb-20'>
            <OwnerOnboardingReviewChecklist
              tenant={tenant}
              onRefresh={h.handleRefresh}
              onPreview={(url: string, title: string, docId?: string) =>
                h.handleOpenPreview(url, title, docId)
              }
            />
          </div>
        )}
        {h.activeTab === 'history' && (
          <HistoryTab
            tenant={tenant}
            payments={h.payments}
            maintenance={h.maintenance}
            contractHistory={h.contractHistory}
            timelineFilter={h.timelineFilter}
            onFilterChange={h.setTimelineFilter}
          />
        )}
      </div>

      <AlertDialog open={h.showDeleteDialog} onOpenChange={h.setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Inquilino?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover permanentemente o perfil de <strong>{tenant.name}</strong>. Os
              dados de contratos e financeiros permanecerão para registro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='space-y-2'>
            <label className='text-xs font-semibold text-slate-600 dark:text-slate-400'>
              Motivo da Exclusão
            </label>
            <textarea
              value={h.deleteReason}
              onChange={(e) => h.setDeleteReason(e.target.value)}
              placeholder='Descreva o motivo da exclusão...'
              className='w-full min-h-[80px] rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={h.handleDeleteTenant}
              disabled={!h.deleteReason.trim() || h.isDeleting}
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              {h.isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DocumentPreviewModal
        previewUrl={h.previewUrl}
        previewTitle={h.previewTitle}
        previewPage={h.previewPage}
        onPageChange={h.setPreviewPage}
        isPreviewLoading={h.isPreviewLoading}
        apyPreviewUrl={h.apyPreviewUrl}
        previewError={h.previewError}
        originalUrl={h.originalUrl}
        tenant={tenant}
        modalActionLoading={h.modalActionLoading}
        modalRejectReason={h.modalRejectReason}
        showModalRejectInput={h.showModalRejectInput}
        onRejectReasonChange={h.setModalRejectReason}
        onShowRejectInput={h.setShowModalRejectInput}
        onClose={() => {
          h.setPreviewUrl(null);
          h.setShowModalRejectInput(false);
          h.setModalRejectReason('');
        }}
        onApprove={h.handleApproveDocsFromModal}
        onReject={h.handleRejectDocsFromModal}
      />
    </div>
  );
};

export default TenantDetailsPage;
