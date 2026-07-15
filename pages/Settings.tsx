import React, { useEffect } from 'react';
import {
  User,
  CreditCard,
  Crown,
  Bell,
  ShieldCheck,
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
  LogOut,
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { GlassmorphismNav } from '../components/ui/GlassmorphismNav';
import { StickyTabBar } from '../components/ui/StickyTabBar';
import { TenantProfileConfigPanel } from '../components/properties/TenantProfileConfigPanel';
import { useSettings } from './settings/hooks/useSettings';
import { PlansModal } from './settings/modals/PlansModal';
import { CheckoutModal } from './settings/modals/CheckoutModal';
import { GeneralTab } from './settings/sections/GeneralTab';
import { FinancialTab } from './settings/sections/FinancialTab';
import { SubscriptionTab } from './settings/sections/SubscriptionTab';
import { GuaranteeTab } from './settings/sections/GuaranteeTab';
import { subscriptionService } from '../services/subscriptionService';

function SaveBtn({ h }: { h: ReturnType<typeof useSettings> }) {
  return (
    <button
      onClick={h.handleSave}
      disabled={h.isSaving}
      className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg transition-all active:scale-95 shrink-0 ${h.saveSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-primary text-primary-foreground shadow-lg'}`}
    >
      <span className='hidden sm:inline'>
        {h.isSaving ? 'Salvando...' : h.saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
      </span>
      <span className='sm:hidden'>{h.isSaving ? '...' : h.saveSuccess ? 'Salvo' : 'Salvar'}</span>
      {!h.isSaving && !h.saveSuccess && <Save size={16} className='md:size-[18px]' />}
      {h.saveSuccess && <CheckCircle size={16} className='md:size-[18px]' />}
    </button>
  );
}

const Settings: React.FC = () => {
  const h = useSettings();
  const { signOut } = useClerk();

  const tabs = [
    {
      id: 'general',
      label: h.user?.role === 'tenant' ? 'Perfil' : 'Perfil & Empresa',
      icon: User,
    },
    ...(h.user?.role === 'owner' || h.user?.role === 'admin'
      ? [
          { id: 'financial', label: 'Financeiro', icon: CreditCard },
          { id: 'guarantee', label: 'Garantias', icon: ShieldCheck },
          { id: 'subscription', label: 'Assinatura', icon: Crown },
          { id: 'maintenance', label: 'Manutenção', icon: SettingsIcon },
        ]
      : []),
    { id: 'notifications', label: 'Notificações', icon: Bell },
    ...(h.user?.role === 'owner' || h.user?.role === 'admin'
      ? [{ id: 'tenantProfile', label: 'Perfil Inquilino', icon: User }]
      : []),
  ];

  // Global cursor spotlight: delegates to all .lg-card elements on the page
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = (e.target as Element).closest('.lg-card, .lg-topbar') as HTMLElement | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      target.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className='flex flex-col min-h-full w-full text-foreground'>
      {/* Pill flutuante com vidro — igual ao menu inquilino */}
      <StickyTabBar className='z-40 pt-4'>
        <GlassmorphismNav
          activeTab={h.activeTab}
          onChange={(id) => h.setActiveTab(id as typeof h.activeTab)}
          items={tabs}
        />
      </StickyTabBar>

      <div className='px-4 md:px-8 pb-8 pt-4 space-y-6'>
        {h.activeTab === 'financial' && (
          <div className='lg-card lg-card-lift p-6 space-y-6 animate-fadeIn'>
            <FinancialTab
              paymentMethods={h.paymentMethods}
              onToggleMethod={h.togglePaymentMethod}
              onUpdateField={h.updatePaymentField}
              expandedMethodId={h.expandedMethodId}
              onExpandedChange={h.setExpandedMethodId}
              stripeConnected={h.stripeConnected}
              onConnectStripe={h.handleConnectStripe}
            />
            <div className='flex justify-end pt-4 border-t border-border/50'>
              <SaveBtn h={h} />
            </div>
          </div>
        )}
        {h.activeTab === 'guarantee' && (
          <div className='lg-card lg-card-lift p-6 animate-fadeIn'>
            <GuaranteeTab />
          </div>
        )}
        {h.activeTab === 'subscription' && (
          <div className='lg-card lg-card-lift p-6 space-y-6 animate-fadeIn'>
            <SubscriptionTab
              loadingSub={h.loadingSub}
              subscription={h.subscription}
              currentPlanDetails={h.currentPlanDetails}
              invoices={h.invoices}
              onOpenPlanModal={h.openPlanModal}
              onLoadSubscription={h.loadSubscriptionData}
              onCancelSubscription={h.handleCancelSubscription}
            />
            <div className='flex justify-end pt-4 border-t border-border/50'>
              <SaveBtn h={h} />
            </div>
          </div>
        )}
        {h.activeTab === 'maintenance' && (
          <div className='lg-card lg-card-lift p-6 space-y-6 animate-fadeIn max-w-4xl'>
            <div className='space-y-6'>
              <div>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
                    <SettingsIcon size={20} />
                  </div>
                  <div>
                    <h3 className='font-bold text-foreground text-lg'>Categorias de Chamados</h3>
                    <p className='text-sm text-muted-foreground'>
                      Ative ou desative categorias que o inquilino pode selecionar.
                    </p>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {h.maintenanceSettings.categories.map((cat) => (
                    <div
                      key={cat.id}
                      className='flex items-center justify-between p-4 rounded-xl border border-border bg-muted/35'
                    >
                      <span className='font-bold text-sm text-foreground'>{cat.label}</span>
                      <button
                        onClick={() =>
                          h.setMaintenanceSettings({
                            ...h.maintenanceSettings,
                            categories: h.maintenanceSettings.categories.map((c) =>
                              c.id === cat.id ? { ...c, enabled: !c.enabled } : c
                            ),
                          })
                        }
                        className={`transition-all ${cat.enabled ? 'text-primary' : 'text-muted-foreground/50'}`}
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
              <div className='pt-4 border-t border-border/50'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center'>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className='font-bold text-foreground text-lg'>Níveis de Urgência</h3>
                    <p className='text-sm text-muted-foreground'>
                      Configure quais níveis de prioridade estarão disponíveis.
                    </p>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {h.maintenanceSettings.urgencies.map((urg) => (
                    <div
                      key={urg.id}
                      className='flex items-center justify-between p-4 rounded-xl border border-border bg-muted/35'
                    >
                      <span className='font-bold text-sm text-foreground'>{urg.id}</span>
                      <button
                        onClick={() =>
                          h.setMaintenanceSettings({
                            ...h.maintenanceSettings,
                            urgencies: h.maintenanceSettings.urgencies.map((u) =>
                              u.id === urg.id ? { ...u, enabled: !u.enabled } : u
                            ),
                          })
                        }
                        className={`transition-all ${urg.enabled ? 'text-primary' : 'text-muted-foreground/50'}`}
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
            <div className='flex justify-end pt-4 border-t border-border/50'>
              <SaveBtn h={h} />
            </div>
          </div>
        )}
        {h.activeTab === 'general' && (
          <div className='lg-card lg-card-lift p-6 space-y-6 animate-fadeIn max-w-2xl'>
            <GeneralTab
              user={h.user}
              profileData={h.profileData}
              onProfileDataChange={h.setProfileData}
              isUploadingAvatar={h.isUploadingAvatar}
              onAvatarUpload={h.handleAvatarUpload}
              onOpenUserProfile={h.openUserProfile}
            />
            <div className='flex justify-end pt-4 border-t border-border/50'>
              <SaveBtn h={h} />
            </div>
          </div>
        )}
        {h.activeTab === 'notifications' && (
          <div className='lg-card lg-card-lift p-6 space-y-6 animate-fadeIn max-w-2xl'>
            <div className='space-y-6'>
              <div>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className='font-bold text-foreground text-lg'>Canais de Envio</h3>
                    <p className='text-sm text-muted-foreground'>
                      Por onde você deseja receber notificações?
                    </p>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between p-4 rounded-xl bg-muted/35 border border-border'>
                    <div className='flex items-center gap-3'>
                      <Mail className='text-muted-foreground' size={20} />
                      <div>
                        <p className='font-bold text-sm text-foreground'>E-mail</p>
                        <p className='text-xs text-muted-foreground'>
                          Resumos periódicos e alertas importantes
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        h.setNotifications({
                          ...h.notifications,
                          email_alerts: !h.notifications.email_alerts,
                        })
                      }
                      className={`transition-all ${h.notifications.email_alerts ? 'text-primary' : 'text-muted-foreground/50'}`}
                    >
                      {h.notifications.email_alerts ? (
                        <ToggleRight size={32} strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft size={32} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                  <div className='flex items-center justify-between p-4 rounded-xl bg-muted/35 border border-border'>
                    <div className='flex items-center gap-3'>
                      <Smartphone className='text-muted-foreground' size={20} />
                      <div>
                        <p className='font-bold text-sm text-foreground'>SMS</p>
                        <p className='text-xs text-muted-foreground'>
                          Alertas urgentes via mensagem de texto
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        h.setNotifications({
                          ...h.notifications,
                          sms_alerts: !h.notifications.sms_alerts,
                        })
                      }
                      className={`transition-all ${h.notifications.sms_alerts ? 'text-primary' : 'text-muted-foreground/50'}`}
                    >
                      {h.notifications.sms_alerts ? (
                        <ToggleRight size={32} strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft size={32} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className='pt-4 border-t border-border/50'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center'>
                    <Activity size={20} />
                  </div>
                  <div>
                    <h3 className='font-bold text-foreground text-lg'>Eventos</h3>
                    <p className='text-sm text-muted-foreground'>
                      Quais eventos devem gerar notificações?
                    </p>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between p-4 rounded-xl bg-muted/35 border border-border'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center'>
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <p className='font-bold text-sm text-foreground'>Pagamento Recebido</p>
                        <p className='text-xs text-muted-foreground'>
                          Confirmar quando o inquilino pagar
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        h.setNotifications({
                          ...h.notifications,
                          payment_received: !h.notifications.payment_received,
                        })
                      }
                      className={`transition-all ${h.notifications.payment_received ? 'text-primary' : 'text-muted-foreground/50'}`}
                    >
                      {h.notifications.payment_received ? (
                        <ToggleRight size={32} strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft size={32} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                  <div className='flex items-center justify-between p-4 rounded-xl bg-muted/35 border border-border'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center'>
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <p className='font-bold text-sm text-foreground'>Pagamento em Atraso</p>
                        <p className='text-xs text-muted-foreground'>
                          Alertar quando um pagamento vencer
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        h.setNotifications({
                          ...h.notifications,
                          late_payment: !h.notifications.late_payment,
                        })
                      }
                      className={`transition-all ${h.notifications.late_payment ? 'text-primary' : 'text-muted-foreground/50'}`}
                    >
                      {h.notifications.late_payment ? (
                        <ToggleRight size={32} strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft size={32} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                  <div className='flex items-center justify-between p-4 rounded-xl bg-muted/35 border border-border'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center'>
                        <Wrench size={18} />
                      </div>
                      <div>
                        <p className='font-bold text-sm text-foreground'>Manutenção</p>
                        <p className='text-xs text-muted-foreground'>
                          Solicitações de reparo dos inquilinos
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        h.setNotifications({
                          ...h.notifications,
                          maintenance_updates: !h.notifications.maintenance_updates,
                        })
                      }
                      className={`transition-all ${h.notifications.maintenance_updates ? 'text-primary' : 'text-muted-foreground/50'}`}
                    >
                      {h.notifications.maintenance_updates ? (
                        <ToggleRight size={32} strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft size={32} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex justify-end pt-4 border-t border-border/50'>
              <SaveBtn h={h} />
            </div>
          </div>
        )}
        {h.activeTab === 'tenantProfile' && (
          <div className='lg-card lg-card-lift p-6 space-y-6 animate-fadeIn max-w-4xl'>
            <div className='mb-6 px-1'>
              <h2 className='text-xl font-black text-foreground uppercase tracking-[0.2em]'>
                Perfil Padrão do Inquilino
              </h2>
              <p className='text-sm text-muted-foreground font-medium mt-1'>
                Defina as exigências base que serão aplicadas automaticamente a todos os seus novos
                imóveis.
              </p>
            </div>
            <TenantProfileConfigPanel propertyId='global' />
            <div className='flex justify-end pt-4 border-t border-border/50'>
              <SaveBtn h={h} />
            </div>
          </div>
        )}

        {/* Botão Sair - Localizado no final do container de abas */}
        <div className='lg-card lg-card-lift p-4 animate-fadeIn'>
          <button
            onClick={() => signOut()}
            className='w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors'
          >
            <LogOut size={18} /> Sair da Conta
          </button>
        </div>
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
