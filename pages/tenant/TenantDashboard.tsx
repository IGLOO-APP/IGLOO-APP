import React from 'react';
import { Loader, ClipboardCheck, ChevronRight } from 'lucide-react';
import { TenantOnboardingChecklist } from '../../components/tenant/TenantOnboardingChecklist';
import { useTenantDashboard } from './hooks/useTenantDashboard';
import { DashboardHeader } from './sections/DashboardHeader';
import { FinancialCard } from './sections/FinancialCard';
import { Announcements } from './sections/Announcements';
import { InspectionModal } from './modals/InspectionModal';
import { InvoiceModal } from './modals/InvoiceModal';
import { CreditCardModal } from './modals/CreditCardModal';

const TenantDashboard: React.FC = () => {
  const {
    user,
    isOnboardingRequired,
    refetchOnboarding,
    contextPendingInspection,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    triggerTestNotification,
    navigate,
    loading,
    tenantData,
    currentTenant,
    tenantProperty,
    recentPayments,
    announcements,
    copied,
    showNotifications,
    setShowNotifications,
    isDark,
    showInspection,
    setShowInspection,
    pendingInspection,
    showInvoice,
    setShowInvoice,
    invoiceCopied,
    showCreditCard,
    setShowCreditCard,
    processingPayment,
    paymentSuccess,
    getFinancialCardBorder,
    getDueBadge,
    validity,
    toggleTheme,
    handleCopyPix,
    handleCopyBarcode,
    handleCardPayment,
  } = useTenantDashboard();

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='flex flex-col items-center gap-4'>
          <Loader className='animate-spin text-primary' size={40} strokeWidth={1.8} />
          <p className='text-sm font-bold text-slate-500 animate-pulse'>Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  if (isOnboardingRequired) {
    return (
      <div className='h-full overflow-y-auto w-full max-w-md mx-auto md:max-w-4xl md:px-6 py-6 custom-scrollbar p-6'>
        {currentTenant && (
          <TenantOnboardingChecklist
            tenant={currentTenant}
            pendingInspection={contextPendingInspection || pendingInspection}
            onStepComplete={refetchOnboarding}
            onOpenInspection={() => setShowInspection(true)}
          />
        )}
        <InspectionModal
          show={showInspection}
          property={tenantProperty}
          onClose={() => {
            setShowInspection(false);
            refetchOnboarding();
          }}
          initialView='detail'
        />
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-auto w-full max-w-md mx-auto md:max-w-4xl md:px-6 custom-scrollbar p-6'>
      <DashboardHeader
        user={user}
        isDark={isDark}
        unreadCount={unreadCount}
        showNotifications={showNotifications}
        onToggleTheme={toggleTheme}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        onCloseNotifications={() => setShowNotifications(false)}
        onNavigate={navigate}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onTriggerTestNotification={triggerTestNotification}
        notifications={notifications}
      />

      {/* PENDING INSPECTION ALERT */}
      {pendingInspection && (
        <div className='px-6 mb-4'>
          <button
            onClick={() => setShowInspection(true)}
            className='w-full lg-card lg-card-lift p-5 flex items-center justify-between group text-left'
          >
            <div className='flex items-center gap-4 relative z-10'>
              <div className='w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 border border-orange-500/20'>
                <ClipboardCheck size={24} strokeWidth={1.8} />
              </div>
              <div>
                <h4 className='font-bold text-white text-base'>
                  Vistoria {pendingInspection.status}
                </h4>
                <p className='text-sm text-orange-200/70 mt-0.5'>
                  {pendingInspection.type === 'entrada' ? 'Entrada' : pendingInspection.type === 'saída' ? 'Saída' : 'Periódica'} • Revise os itens do
                  imóvel.
                </p>
              </div>
            </div>
            <ChevronRight
              className='text-orange-500 group-hover:translate-x-1 transition-transform'
              size={24}
              strokeWidth={1.8}
            />
          </button>
        </div>
      )}

      <FinancialCard
        tenantProperty={tenantProperty}
        tenantData={tenantData}
        recentPayments={recentPayments}
        copied={copied}
        validity={validity}
        getFinancialCardBorder={getFinancialCardBorder}
        getDueBadge={getDueBadge}
        onCopyPix={handleCopyPix}
        onOpenCreditCard={() => setShowCreditCard(true)}
        onOpenInvoice={() => setShowInvoice(true)}
        onNavigate={navigate}
      />

      <Announcements announcements={announcements} />

      <InspectionModal
        show={showInspection}
        property={tenantProperty}
        onClose={() => setShowInspection(false)}
        initialView='list'
      />

      <InvoiceModal
        show={showInvoice}
        onClose={() => setShowInvoice(false)}
        monthlyValue={tenantData?.contract?.monthly_value}
        paymentDay={tenantData?.contract?.payment_day}
        invoiceCopied={invoiceCopied}
        onCopyBarcode={handleCopyBarcode}
      />

      <CreditCardModal
        show={showCreditCard}
        onClose={() => setShowCreditCard(false)}
        processingPayment={processingPayment}
        paymentSuccess={paymentSuccess}
        onCardPayment={handleCardPayment}
      />
    </div>
  );
};

export default TenantDashboard;
