import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useClerk } from '@clerk/clerk-react';
import { stripeService } from '../../../services/stripeService';
import { subscriptionService } from '../../../services/subscriptionService';
import { profileService } from '../../../services/profileService';
import { storageService } from '../../../services/storageService';
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

export function useSettings() {
  const { user } = useAuth();
  const { openUserProfile } = useClerk();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<
    'general' | 'financial' | 'maintenance' | 'notifications' | 'subscription' | 'tenantProfile'
  >('general');

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (location.state && (location.state as any).activeTab) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setActiveTab((location.state as any).activeTab);
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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([
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
  ]);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    phone: (user as any)?.phone || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    companyName: (user as any)?.company_name || '',
    avatarUrl: user?.avatar || '',
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user)
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        phone: (user as any).phone || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        companyName: (user as any).company_name || '',
        avatarUrl: user.avatar || '',
      });
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

  const NOTIF_PREFS_KEY = 'igloo_notification_prefs';

  const loadNotifPrefs = () => {
    try {
      const stored = localStorage.getItem(NOTIF_PREFS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      /* ignore */
    }
    return {
      emailAlerts: true,
      smsAlerts: false,
      paymentReceived: true,
      latePayment: true,
      maintenance: true,
    };
  };

  const [notifications, setNotifications] = useState(loadNotifPrefs);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoadingSub(true);
    try {
      const sub = await subscriptionService.getCurrentSubscription();
      const inv = await subscriptionService.getInvoices();
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
        company_name: profileData.companyName,
      });
      localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(notifications));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
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
      const inv = await subscriptionService.getInvoices();
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
