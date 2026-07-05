import React from 'react';
import {
  User,
  CreditCard,
  Crown,
  Bell,
  Settings as SettingsIcon,
  Save,
  CheckCircle,
  Mail,
  AlertTriangle,
  ToggleRight,
  ToggleLeft,
  Smartphone,
  Activity,
  DollarSign,
  Wrench,
} from 'lucide-react';
import { GlassmorphismNav } from '../components/ui/GlassmorphismNav';
import { TopBar } from '../components/layout/TopBar';
import { TenantProfileConfigPanel } from '../components/properties/TenantProfileConfigPanel';
import { useSettings } from './settings/hooks/useSettings';
import { PlansModal } from './settings/modals/PlansModal';
import { CheckoutModal } from './settings/modals/CheckoutModal';
import { GeneralTab } from './settings/sections/GeneralTab';
import { FinancialTab } from './settings/sections/FinancialTab';
import { SubscriptionTab } from './settings/sections/SubscriptionTab';
import { subscriptionService } from '../services/subscriptionService';

const Settings: React.FC = () => {
  const h = useSettings();

  const tabs = [
    {
      id: 'general',
      label: h.user?.role === 'tenant' ? 'Perfil' : 'Perfil & Empresa',
      icon: User,
    },
    ...(h.user?.role === 'owner' || h.user?.role === 'admin'
      ? [
          { id: 'financial', label: 'Financeiro', icon: CreditCard },
          { id: 'subscription', label: 'Assinatura', icon: Crown },
          { id: 'maintenance', label: 'Manutenção', icon: SettingsIcon },
        ]
      : []),
    { id: 'notifications', label: 'Notificações', icon: Bell },
    ...(h.user?.role === 'owner' || h.user?.role === 'admin'
      ? [{ id: 'tenantProfile', label: 'Perfil Inquilino', icon: User }]
      : []),
  ];

  return (
    <div className='flex flex-col h-full w-full relative bg-background-light dark:bg-background-dark'>
      <TopBar
        title='Configurações'
        subtitle={
          h.user?.role === 'tenant'
            ? 'Gerencie seus dados e preferências'
            : 'Administração do sistema'
        }
      >
        <button
          onClick={h.handleSave}
          disabled={h.isSaving}
          className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg transition-all active:scale-95 ${h.saveSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20'}`}
        >
          <span className='hidden sm:inline'>
            {h.isSaving ? 'Salvando...' : h.saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
          </span>
          <span className='sm:hidden'>
            {h.isSaving ? '...' : h.saveSuccess ? 'Salvo' : 'Salvar'}
          </span>
          {!h.isSaving && !h.saveSuccess && <Save size={16} className='md:size-[18px]' />}
          {h.saveSuccess && <CheckCircle size={16} className='md:size-[18px]' />}
        </button>
      </TopBar>

      <div className='px-4 md:px-8 pt-4 pb-2 flex justify-center'>
        <GlassmorphismNav
          activeTab={h.activeTab}
          onChange={(id) => h.setActiveTab(id as typeof h.activeTab)}
          items={tabs}
        />
      </div>

      <div className='flex-1 overflow-y-auto p-4 md:p-8 space-y-6'>
        {h.activeTab === 'financial' && (
          <FinancialTab
            paymentMethods={h.paymentMethods}
            onToggleMethod={h.togglePaymentMethod}
            onUpdateField={h.updatePaymentField}
            expandedMethodId={h.expandedMethodId}
            onExpandedChange={h.setExpandedMethodId}
            stripeConnected={h.stripeConnected}
            onConnectStripe={h.handleConnectStripe}
          />
        )}
        {h.activeTab === 'subscription' && (
          <SubscriptionTab
            loadingSub={h.loadingSub}
            subscription={h.subscription}
            currentPlanDetails={h.currentPlanDetails}
            invoices={h.invoices}
            onOpenPlanModal={h.openPlanModal}
            onLoadSubscription={h.loadSubscriptionData}
          />
        )}
        {h.activeTab === 'maintenance' && (
          <div className='animate-fadeIn space-y-8 max-w-4xl'>
            <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
                  <SettingsIcon size={20} />
                </div>
                <div>
                  <h3 className='font-bold text-slate-900 dark:text-white text-lg'>
                    Categorias de Chamados
                  </h3>
                  <p className='text-sm text-slate-500'>
                    Ative ou desative categorias que o inquilino pode selecionar.
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {h.maintenanceSettings.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className='flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/10'
                  >
                    <span className='font-bold text-sm text-slate-700 dark:text-slate-200'>
                      {cat.label}
                    </span>
                    <button
                      onClick={() =>
                        h.setMaintenanceSettings({
                          ...h.maintenanceSettings,
                          categories: h.maintenanceSettings.categories.map((c) =>
                            c.id === cat.id ? { ...c, enabled: !c.enabled } : c
                          ),
                        })
                      }
                      className={`transition-all ${cat.enabled ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}
                    >
                      {cat.enabled ? (
                        <ToggleRight size={32} strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft size={32} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center'>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className='font-bold text-slate-900 dark:text-white text-lg'>
                    Níveis de Urgência
                  </h3>
                  <p className='text-sm text-slate-500'>
                    Configure quais níveis de prioridade estarão disponíveis.
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {h.maintenanceSettings.urgencies.map((urg) => (
                  <div
                    key={urg.id}
                    className='flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/10'
                  >
                    <span className='font-bold text-sm text-slate-700 dark:text-slate-200'>
                      {urg.id}
                    </span>
                    <button
                      onClick={() =>
                        h.setMaintenanceSettings({
                          ...h.maintenanceSettings,
                          urgencies: h.maintenanceSettings.urgencies.map((u) =>
                            u.id === urg.id ? { ...u, enabled: !u.enabled } : u
                          ),
                        })
                      }
                      className={`transition-all ${urg.enabled ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}
                    >
                      {urg.enabled ? (
                        <ToggleRight size={32} strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft size={32} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {h.activeTab === 'general' && (
          <GeneralTab
            user={h.user}
            profileData={h.profileData}
            onProfileDataChange={h.setProfileData}
            isUploadingAvatar={h.isUploadingAvatar}
            onAvatarUpload={h.handleAvatarUpload}
            onOpenUserProfile={h.openUserProfile}
          />
        )}
        {h.activeTab === 'notifications' && (
          <div className='animate-fadeIn space-y-6 max-w-2xl'>
            {/* Canais de Envio */}
            <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className='font-bold text-slate-900 dark:text-white text-lg'>
                    Canais de Envio
                  </h3>
                  <p className='text-sm text-slate-500'>
                    Por onde voce deseja receber notificacoes?
                  </p>
                </div>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-100 dark:border-white/5'>
                  <div className='flex items-center gap-3'>
                    <Mail className='text-slate-500' size={20} />
                    <div>
                      <p className='font-bold text-sm text-slate-900 dark:text-white'>E-mail</p>
                      <p className='text-xs text-slate-500'>
                        Resumos periodicos e alertas importantes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      h.setNotifications({
                        ...h.notifications,
                        emailAlerts: !h.notifications.emailAlerts,
                      })
                    }
                    className={`transition-all ${h.notifications.emailAlerts ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    {h.notifications.emailAlerts ? (
                      <ToggleRight size={32} strokeWidth={1.5} />
                    ) : (
                      <ToggleLeft size={32} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                <div className='flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-100 dark:border-white/5'>
                  <div className='flex items-center gap-3'>
                    <Smartphone className='text-slate-500' size={20} />
                    <div>
                      <p className='font-bold text-sm text-slate-900 dark:text-white'>SMS</p>
                      <p className='text-xs text-slate-500'>
                        Alertas urgentes via mensagem de texto
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      h.setNotifications({
                        ...h.notifications,
                        smsAlerts: !h.notifications.smsAlerts,
                      })
                    }
                    className={`transition-all ${h.notifications.smsAlerts ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    {h.notifications.smsAlerts ? (
                      <ToggleRight size={32} strokeWidth={1.5} />
                    ) : (
                      <ToggleLeft size={32} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Eventos */}
            <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center'>
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className='font-bold text-slate-900 dark:text-white text-lg'>Eventos</h3>
                  <p className='text-sm text-slate-500'>Quais eventos devem gerar notificacoes?</p>
                </div>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-100 dark:border-white/5'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center'>
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className='font-bold text-sm text-slate-900 dark:text-white'>
                        Pagamento Recebido
                      </p>
                      <p className='text-xs text-slate-500'>Confirmar quando o inquilino pagar</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      h.setNotifications({
                        ...h.notifications,
                        paymentReceived: !h.notifications.paymentReceived,
                      })
                    }
                    className={`transition-all ${h.notifications.paymentReceived ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    {h.notifications.paymentReceived ? (
                      <ToggleRight size={32} strokeWidth={1.5} />
                    ) : (
                      <ToggleLeft size={32} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                <div className='flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-100 dark:border-white/5'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center'>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <p className='font-bold text-sm text-slate-900 dark:text-white'>
                        Pagamento em Atraso
                      </p>
                      <p className='text-xs text-slate-500'>Alertar quando um pagamento vencer</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      h.setNotifications({
                        ...h.notifications,
                        latePayment: !h.notifications.latePayment,
                      })
                    }
                    className={`transition-all ${h.notifications.latePayment ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    {h.notifications.latePayment ? (
                      <ToggleRight size={32} strokeWidth={1.5} />
                    ) : (
                      <ToggleLeft size={32} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                <div className='flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-100 dark:border-white/5'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center'>
                      <Wrench size={18} />
                    </div>
                    <div>
                      <p className='font-bold text-sm text-slate-900 dark:text-white'>Manuten��o</p>
                      <p className='text-xs text-slate-500'>
                        Solicitacoes de reparo dos inquilinos
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      h.setNotifications({
                        ...h.notifications,
                        maintenance: !h.notifications.maintenance,
                      })
                    }
                    className={`transition-all ${h.notifications.maintenance ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    {h.notifications.maintenance ? (
                      <ToggleRight size={32} strokeWidth={1.5} />
                    ) : (
                      <ToggleLeft size={32} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {h.activeTab === 'tenantProfile' && (
          <div className='animate-fadeIn space-y-6 max-w-4xl'>
            <div className='mb-6 px-1'>
              <h2 className='text-xl font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]'>
                Perfil Padrão do Inquilino
              </h2>
              <p className='text-sm text-slate-500 font-medium mt-1'>
                Defina as exigências base que serão aplicadas automaticamente a todos os seus novos
                imóveis.
              </p>
            </div>
            <TenantProfileConfigPanel propertyId='global' />
          </div>
        )}
      </div>

      <PlansModal
        show={h.showPlansModal}
        onClose={() => h.setShowPlansModal(false)}
        plans={h.plans}
        subscription={h.subscription}
        selectedBillingCycle={h.selectedBillingCycle}
        onBillingCycleChange={h.setSelectedBillingCycle}
        onSelectPlan={h.selectPlan}
        onCalculateTotal={(planId, cycle) => subscriptionService.calculateTotal(planId, cycle)}
      />

      <CheckoutModal
        show={h.showCheckoutModal}
        onClose={() => h.setShowCheckoutModal(false)}
        checkoutPlanDetails={h.checkoutPlanDetails}
        checkoutStep={h.checkoutStep}
        selectedBillingCycle={h.selectedBillingCycle}
        checkoutTotals={h.checkoutTotals}
        subscription={h.subscription}
        onProcess={h.handleCheckoutProcess}
      />
    </div>
  );
};

export default Settings;
