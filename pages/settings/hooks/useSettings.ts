import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useClerk } from '@clerk/clerk-react';
import { stripeService } from '../../../services/stripeService';
import { subscriptionService } from '../../../services/subscriptionService';
import { profileService } from '../../../services/profileService';
import { storageService } from '../../../services/storageService';
import { notificationService, NotificationPrefs } from '../../../services/notificationService';
import { paymentConfigService } from '../../../services/finance/paymentConfigService';
import { maintenanceSettingsService } from '../../../services/maintenance/maintenanceSettingsService';
import { Subscription, Plan, BillingCycle, Invoice, PlanTier } from '../../../types';

export interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  iconName: string;
  color: string;
  fields: Record<string, string>;
  description: string;
}

const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'pix',
    name: 'Pix',
    enabled: true,
    iconName: 'QrCode',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    fields: { key: '12.345.678/0001-90', type: 'CNPJ' },
    description: 'Recebimento instantâneo via QR Code e Copia e Cola.',
  },
  {
    id: 'boleto',
    name: 'Boleto Bancário',
    enabled: true,
    iconName: 'Barcode',
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    fields: { bank: 'Itaú', agency: '0001', account: '12345-6', wallet: '109' },
    description: 'Emissão automática com registro. Requer convênio.',
  },
  {
    id: 'credit_card',
    name: 'Cartão de Crédito',
    enabled: false,
    iconName: 'CreditCard',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    fields: { gateway: 'Mercado Pago', publicKey: 'pk_test_...', maxInstallments: '12' },
    description: 'Receba via cartão. Taxas de gateway aplicáveis.',
  },
];

export function useSettings() {
  const { user } = useAuth();
  const { openUserProfile } = useClerk();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<
    'general' | 'financial' | 'maintenance' | 'notifications' | 'subscription' | 'tenantProfile'
  >('general');

  useEffect(() => {
    if (location.state && (location.state as Record<string, unknown>).activeTab) {
      setActiveTab((location.state as Record<string, unknown>).activeTab as typeof activeTab);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingSub, setLoadingSub] = useState(false);

  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState<PlanTier>('professional');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>('annual');
  const [checkoutStep, setCheckoutStep] = useState<
    'summary' | 'payment' | 'processing' | 'success'
  >('summary');

  const [expandedMethodId, setExpandedMethodId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethodConfig[]>(DEFAULT_PAYMENT_METHODS);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: ((user as unknown as Record<string, unknown>)?.company_name as string) || '',
    avatarUrl: user?.avatar || '',
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: '',
        avatarUrl: user.avatar || '',
      });
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const publicUrl = await storageService.uploadFile('avatars', fileName, file);
      if (publicUrl) {
        await profileService.update(String(user.id), { avatar_url: publicUrl });
        setProfileData((prev) => ({ ...prev, avatarUrl: publicUrl }));
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const [maintenanceSettings, setMaintenanceSettings] = useState({
    categories: [
      { id: 'Hidráulico', label: 'Hidráulico', enabled: true },
      { id: 'Elétrico', label: 'Elétrico', enabled: true },
      { id: 'Estrutural', label: 'Estrutural', enabled: true },
      { id: 'Infiltração', label: 'Infiltração', enabled: true },
      { id: 'Fechadura / Segurança', label: 'Segurança', enabled: true },
      { id: 'Eletrodoméstico', label: 'Eletrodoméstico', enabled: true },
      { id: 'Internet / TV', label: 'Internet / TV', enabled: true },
      { id: 'Limpeza / Área Comum', label: 'Limpeza', enabled: true },
      { id: 'Outros', label: 'Outros', enabled: true },
    ],
    urgencies: [
      { id: 'Normal', enabled: true },
      { id: 'Alta', enabled: true },
      { id: 'Emergência', enabled: true },
    ],
  });

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email_alerts: true,
    sms_alerts: false,
    payment_received: true,
    late_payment: true,
    maintenance_updates: true,
    payment_reminders: true,
    new_messages: true,
    announcements: false,
  });

  useEffect(() => {
    loadSettingsData();
    loadSubscriptionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadSettingsData = async () => {
    if (!user) return;
    try {
      const prefs = await notificationService.get(user.id);
      setNotifications(prefs);

      const dbMethods = await paymentConfigService.getAll(user.id);
      if (dbMethods.length > 0) {
        setPaymentMethods((prev) =>
          prev.map((m) => {
            const db = dbMethods.find((d) => d.method === m.id);
            return db ? { ...m, enabled: db.enabled, fields: { ...m.fields, ...db.fields } } : m;
          })
        );
      }

      const dbCategories = await maintenanceSettingsService.getAll(user.id);
      if (dbCategories.length > 0) {
        setMaintenanceSettings((prev) => ({
          ...prev,
          categories: prev.categories.map((c) => {
            const db = dbCategories.find((d) => d.category === c.id);
            return db ? { ...c, enabled: db.enabled } : c;
          }),
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const loadSubscriptionData = async () => {
    setLoadingSub(true);
    try {
      const sub = await subscriptionService.getCurrentSubscription(user?.id);
      const inv = await subscriptionService.getInvoices(user?.id);
      const allPlans = subscriptionService.getPlans();
      setSubscription(sub);
      setInvoices(inv);
      setPlans(allPlans);
    } catch (error) {
      console.error('Error loading subscription', error);
    } finally {
      setLoadingSub(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await profileService.update(String(user.id), {
        name: profileData.name,
        phone: profileData.phone,
        company_name: profileData.companyName || null,
      });
      await notificationService.save(user.id, notifications);

      await Promise.all(
        paymentMethods.map((m) =>
          paymentConfigService.upsert(
            user.id,
            m.id as 'pix' | 'boleto' | 'credit_card',
            m.enabled,
            m.fields
          )
        )
      );

      await maintenanceSettingsService.saveBatch(
        user.id,
        maintenanceSettings.categories.map((c) => ({ category: c.id, enabled: c.enabled }))
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePaymentMethod = (id: string) =>
    setPaymentMethods((methods) =>
      methods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  const updatePaymentField = (methodId: string, field: string, value: string) =>
    setPaymentMethods((methods) =>
      methods.map((m) =>
        m.id === methodId ? { ...m, fields: { ...m.fields, [field]: value } } : m
      )
    );

  const handleConnectStripe = async () => {
    const { url } = await stripeService.createConnectAccountLink();
    alert(
      `Em produção, você seria redirecionado para: ${url}\n\nPara o teste, vamos assumir que deu certo.`
    );
    setStripeConnected(true);
  };

  const handleCancelSubscription = async () => {
    if (!user || !confirm('Tem certeza que deseja cancelar sua assinatura?')) return;
    try {
      await subscriptionService.cancelSubscription(user.id);
      await loadSubscriptionData();
      alert('Assinatura cancelada com sucesso.');
    } catch (err) {
      console.error('Error canceling subscription:', err);
      alert('Erro ao cancelar assinatura.');
    }
  };

  const openPlanModal = () => setShowPlansModal(true);
  const selectPlan = (planId: PlanTier) => {
    setSelectedPlanId(planId);
    setSelectedBillingCycle('annual');
    setShowPlansModal(false);
    setCheckoutStep('summary');
    setShowCheckoutModal(true);
  };

  const handleCheckoutProcess = async () => {
    setCheckoutStep('processing');
    try {
      const updatedSub = await subscriptionService.upgradeSubscription(
        selectedPlanId,
        selectedBillingCycle,
        user?.id
      );
      setSubscription(updatedSub);
      const inv = await subscriptionService.getInvoices(user?.id);
      setInvoices(inv);
      setCheckoutStep('success');
    } catch {
      alert('Erro no processamento');
      setCheckoutStep('summary');
    }
  };

  const currentPlanDetails = plans.find((p) => p.id === subscription?.planId);
  const checkoutPlanDetails = plans.find((p) => p.id === selectedPlanId);
  const checkoutTotals = checkoutPlanDetails
    ? subscriptionService.calculateTotal(selectedPlanId, selectedBillingCycle)
    : { totalBilled: 0, savings: 0, pricePerMonth: 0 };

  return {
    user,
    openUserProfile,
    activeTab,
    setActiveTab,
    isSaving,
    saveSuccess,
    handleSave,
    profileData,
    setProfileData,
    isUploadingAvatar,
    handleAvatarUpload,
    paymentMethods,
    togglePaymentMethod,
    updatePaymentField,
    expandedMethodId,
    setExpandedMethodId,
    stripeConnected,
    handleConnectStripe,
    handleCancelSubscription,
    maintenanceSettings,
    setMaintenanceSettings,
    notifications,
    setNotifications,
    subscription,
    invoices,
    plans,
    loadingSub,
    loadSubscriptionData,
    showPlansModal,
    setShowPlansModal,
    showCheckoutModal,
    setShowCheckoutModal,
    selectedPlanId,
    setSelectedPlanId,
    selectedBillingCycle,
    setSelectedBillingCycle,
    checkoutStep,
    setCheckoutStep,
    selectPlan,
    openPlanModal,
    handleCheckoutProcess,
    currentPlanDetails,
    checkoutPlanDetails,
    checkoutTotals,
  };
}
