
import React, { useState, useEffect } from 'react';
import { User, Bell, CreditCard, Save, CheckCircle, Smartphone, Mail, QrCode, Barcode, Landmark, Banknote, ShieldCheck, ToggleLeft, ToggleRight, ArrowRight, Crown, Check, AlertTriangle, Download, X, Loader2, CreditCard as CardIcon, Plus, Settings as SettingsIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { stripeService } from '../services/stripeService';
import { subscriptionService } from '../services/subscriptionService';
import { Subscription, Plan, BillingCycle, Invoice, PlanTier } from '../types';
import { ModalWrapper } from '../components/ui/ModalWrapper';

interface PaymentMethodConfig {
  id: string;
  name: string;
  enabled: boolean;
  icon: any;
  color: string;
  fields: Record<string, string>;
  description: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'notifications' | 'subscription'>('financial');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  // --- Subscription State ---
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingSub, setLoadingSub] = useState(false);
  
  // Modals
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  
  // Checkout Flow State
  const [selectedPlanId, setSelectedPlanId] = useState<PlanTier>('professional');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>('annual');
  const [checkoutStep, setCheckoutStep] = useState<'summary' | 'payment' | 'processing' | 'success'>('summary');

  // --- Financial Config State ---
  const [expandedMethodId, setExpandedMethodId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([
    {
      id: 'pix',
      name: 'Pix',
      enabled: true,
      icon: QrCode,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
      fields: { key: '12.345.678/0001-90', type: 'CNPJ' },
      description: 'Recebimento instantâneo via QR Code e Copia e Cola.'
    },
    {
      id: 'boleto',
      name: 'Boleto Bancário',
      enabled: true,
      icon: Barcode,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
      fields: { bank: 'Itaú', agency: '0001', account: '12345-6', wallet: '109' },
      description: 'Emissão automática com registro. Requer convênio.'
    },
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      enabled: false,
      icon: CreditCard,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
      fields: { gateway: 'Mercado Pago', publicKey: 'pk_test_...', maxInstallments: '12' },
      description: 'Receba via cartão. Taxas de gateway aplicáveis.'
    }
  ]);

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Investidor Exemplo',
    email: user?.email || 'investidor@igloo.com',
    phone: '(11) 99999-8888',
    companyName: 'Igloo Asset Management'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    paymentReceived: true,
    latePayment: true,
    maintenance: true
  });

  // --- Effects ---
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
          console.error("Error loading subscription", error);
      } finally {
          setLoadingSub(false);
      }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m)
    );
  };

  const updatePaymentField = (methodId: string, field: string, value: string) => {
    setPaymentMethods(methods => 
        methods.map(m => 
            m.id === methodId 
            ? { ...m, fields: { ...m.fields, [field]: value } } 
            : m
        )
    );
  };

  const handleConnectStripe = async () => {
      const { url } = await stripeService.createConnectAccountLink();
      alert(`Em produção, você seria redirecionado para: ${url}\n\nPara o teste, vamos assumir que deu certo.`);
      setStripeConnected(true);
  };

  // --- Subscription Handlers ---

  const openPlanModal = () => {
      setShowPlansModal(true);
  };

  const selectPlan = (planId: PlanTier) => {
      setSelectedPlanId(planId);
      setSelectedBillingCycle('annual'); // Default to annual for savings
      setShowPlansModal(false);
      setCheckoutStep('summary');
      setShowCheckoutModal(true);
  };

  const handleCheckoutProcess = async () => {
      setCheckoutStep('processing');
      try {
          const updatedSub = await subscriptionService.upgradeSubscription(selectedPlanId, selectedBillingCycle);
          setSubscription(updatedSub);
          // Refresh invoices
          const inv = await subscriptionService.getInvoices();
          setInvoices(inv);
          setCheckoutStep('success');
      } catch (error) {
          alert("Erro no processamento");
          setCheckoutStep('summary');
      }
  };

  const currentPlanDetails = plans.find(p => p.id === subscription?.planId);
  const checkoutPlanDetails = plans.find(p => p.id === selectedPlanId);
  const checkoutTotals = checkoutPlanDetails ? subscriptionService.calculateTotal(selectedPlanId, selectedBillingCycle) : { totalBilled: 0, savings: 0, pricePerMonth: 0 };

  const renderPaymentFields = (method: PaymentMethodConfig) => {
      if (method.id === 'pix') {
          return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl animate-fadeIn">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo de Chave</label>
                      <select 
                        value={method.fields.type}
                        onChange={(e) => updatePaymentField(method.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white"
                      >
                          <option value="CPF">CPF</option>
                          <option value="CNPJ">CNPJ</option>
                          <option value="Email">E-mail</option>
                          <option value="Phone">Telefone</option>
                          <option value="Random">Aleatória</option>
                      </select>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Chave Pix</label>
                      <input 
                        value={method.fields.key}
                        onChange={(e) => updatePaymentField(method.id, 'key', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white font-mono"
                        placeholder="Insira sua chave"
                      />
                  </div>
              </div>
          );
      }

      if (method.id === 'boleto') {
          return (
              <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl animate-fadeIn">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Banco</label>
                      <input 
                        value={method.fields.bank}
                        onChange={(e) => updatePaymentField(method.id, 'bank', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Carteira</label>
                      <input 
                        value={method.fields.wallet}
                        onChange={(e) => updatePaymentField(method.id, 'wallet', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Agência</label>
                      <input 
                        value={method.fields.agency}
                        onChange={(e) => updatePaymentField(method.id, 'agency', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Conta</label>
                      <input 
                        value={method.fields.account}
                        onChange={(e) => updatePaymentField(method.id, 'account', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white"
                      />
                  </div>
              </div>
          );
      }

      if (method.id === 'credit_card') {
          return (
              <div className="space-y-4 mt-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl animate-fadeIn">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Gateway de Pagamento</label>
                      <select 
                        value={method.fields.gateway}
                        onChange={(e) => updatePaymentField(method.id, 'gateway', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white"
                      >
                          <option value="Stripe">Stripe</option>
                          <option value="Mercado Pago">Mercado Pago</option>
                          <option value="Pagar.me">Pagar.me</option>
                          <option value="Iugu">Iugu</option>
                      </select>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Chave Pública (Public Key)</label>
                      <input 
                        value={method.fields.publicKey}
                        onChange={(e) => updatePaymentField(method.id, 'publicKey', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white font-mono"
                        placeholder="pk_test_..."
                        type="password"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Parcelamento Máximo</label>
                      <select 
                        value={method.fields.maxInstallments}
                        onChange={(e) => updatePaymentField(method.id, 'maxInstallments', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-sm focus:border-primary outline-none dark:text-white"
                      >
                          <option value="1">À vista (1x)</option>
                          <option value="3">Até 3x</option>
                          <option value="6">Até 6x</option>
                          <option value="12">Até 12x</option>
                      </select>
                  </div>
              </div>
          );
      }
      return null;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto md:max-w-5xl relative bg-background-light dark:bg-background-dark">
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-5 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors">
         <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Configurações</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Administração do sistema</p>
         </div>
         <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${
                saveSuccess 
                ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20'
            }`}
         >
            {isSaving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar Alterações'}
            {!isSaving && !saveSuccess && <Save size={18} />}
            {saveSuccess && <CheckCircle size={18} />}
         </button>
      </header>

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Navigation */}
        <nav className="shrink-0 md:w-64 bg-background-light dark:bg-background-dark border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/5 p-4 flex md:flex-col gap-2 overflow-x-auto hide-scrollbar">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
                <User size={20} /> Perfil e Empresa
            </button>
            <button 
                onClick={() => setActiveTab('financial')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'financial' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
                <CreditCard size={20} /> Financeiro
                <span className="ml-auto bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full hidden md:block">Admin</span>
            </button>
            <button 
                onClick={() => setActiveTab('subscription')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'subscription' ? 'bg-white dark:bg-surface-dark shadow-sm text-indigo-500 font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
                <Crown size={20} /> Plano e Assinatura
            </button>
            <button 
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'notifications' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary font-bold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
                <Bell size={20} /> Notificações
            </button>
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            
            {/* --- TAB: FINANCIAL (ADMIN) --- */}
            {activeTab === 'financial' && (
                <div className="animate-fadeIn space-y-6">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h3 className="font-bold text-xl flex items-center gap-2"><CreditCard /> Stripe Connect</h3>
                                <p className="text-indigo-100 text-sm mt-2 max-w-md">
                                    Conecte sua conta bancária para receber pagamentos de aluguéis automaticamente via Cartão e Pix com split de taxas.
                                </p>
                            </div>
                            {stripeConnected ? (
                                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                                    <CheckCircle size={20} className="text-emerald-300" />
                                    Conta Conectada
                                </div>
                            ) : (
                                <button 
                                    onClick={handleConnectStripe}
                                    className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2"
                                >
                                    Conectar Agora <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <div key={method.id} className={`bg-white dark:bg-surface-dark rounded-2xl border transition-all duration-300 ${method.enabled ? 'border-primary shadow-md shadow-primary/5 ring-1 ring-primary/20' : 'border-gray-200 dark:border-white/5 opacity-80'}`}>
                                <div className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${method.color}`}>
                                                <method.icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{method.name}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">{method.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setExpandedMethodId(expandedMethodId === method.id ? null : method.id)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-colors"
                                                title="Configurar"
                                            >
                                                <SettingsIcon size={20} />
                                            </button>
                                            <button 
                                                onClick={() => togglePaymentMethod(method.id)}
                                                className={`transition-colors ${method.enabled ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}
                                                title={method.enabled ? "Desativar" : "Ativar"}
                                            >
                                                {method.enabled ? <ToggleRight size={40} strokeWidth={1.5} /> : <ToggleLeft size={40} strokeWidth={1.5} />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Expandable Configuration Area */}
                                    {expandedMethodId === method.id && (
                                        <div className="border-t border-gray-100 dark:border-white/5 mt-4 pt-2">
                                            {renderPaymentFields(method)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ... (Rest of the tabs: Subscription, General, Notifications - Keep unchanged) ... */}
            
            {/* --- TAB: SUBSCRIPTION --- */}
            {activeTab === 'subscription' && (
                loadingSub ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : subscription && currentPlanDetails ? (
                <div className="animate-fadeIn space-y-6 max-w-4xl">
                    {/* ... Subscription Content ... */}
                    {/* Active Plan Card */}
                    <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Plano Atual</span>
                                    {subscription.status === 'active' && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Ativo</span>}
                                    {subscription.status === 'trialing' && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Período de Teste</span>}
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{currentPlanDetails.name}</h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm">{currentPlanDetails.description}</p>
                                
                                <div className="mt-6 flex flex-col gap-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        R$ {subscription.amount.toFixed(2)} <span className="text-slate-400 font-normal">/ {subscription.billingCycle === 'monthly' ? 'mês' : subscription.billingCycle === 'semiannual' ? 'semestre' : 'ano'}</span>
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {subscription.trialEndsAt ? `Teste gratuito até ${new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}` : `Próxima cobrança em ${new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}`}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col justify-center gap-3 min-w-[200px]">
                                <button 
                                    onClick={openPlanModal}
                                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95"
                                >
                                    Alterar Plano
                                </button>
                                <button className="w-full py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                    Cancelar Assinatura
                                </button>
                            </div>
                        </div>
                        
                        {/* Usage Stats */}
                        <div className="bg-slate-50 dark:bg-black/20 p-6 border-t border-gray-200 dark:border-white/5">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Uso do Plano</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Properties Limit */}
                                <div>
                                    <div className="flex justify-between text-xs mb-2 font-bold text-slate-700 dark:text-slate-300">
                                        <span>Imóveis</span>
                                        <span>{subscription.usage.properties} / {currentPlanDetails.limits.properties === -1 ? '∞' : currentPlanDetails.limits.properties}</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary rounded-full" 
                                            style={{ width: `${currentPlanDetails.limits.properties === -1 ? 5 : (subscription.usage.properties / currentPlanDetails.limits.properties) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {/* Tenants Limit */}
                                <div>
                                    <div className="flex justify-between text-xs mb-2 font-bold text-slate-700 dark:text-slate-300">
                                        <span>Inquilinos</span>
                                        <span>{subscription.usage.tenants} / {currentPlanDetails.limits.tenants === -1 ? '∞' : currentPlanDetails.limits.tenants}</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-500 rounded-full" 
                                            style={{ width: `${currentPlanDetails.limits.tenants === -1 ? 5 : (subscription.usage.tenants / currentPlanDetails.limits.tenants) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {/* Storage Limit */}
                                <div>
                                    <div className="flex justify-between text-xs mb-2 font-bold text-slate-700 dark:text-slate-300">
                                        <span>Armazenamento</span>
                                        <span>{subscription.usage.storage_used_gb} GB / {currentPlanDetails.limits.storage_gb} GB</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full" 
                                            style={{ width: `${(subscription.usage.storage_used_gb / currentPlanDetails.limits.storage_gb) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method & Invoices */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Payment Method */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Método de Pagamento</h3>
                            {subscription.paymentMethod ? (
                                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center shadow-sm text-slate-600 dark:text-slate-300">
                                            <CardIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}</p>
                                            <p className="text-xs text-slate-500">Padrão</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-primary hover:underline">Alterar</button>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500">Nenhum método salvo.</div>
                            )}
                        </div>

                        {/* Invoices */}
                        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white">Histórico de Faturas</h3>
                                <button className="text-xs font-bold text-primary hover:underline">Ver tudo</button>
                            </div>
                            <div className="space-y-3">
                                {invoices.length > 0 ? invoices.slice(0, 3).map(inv => (
                                    <div key={inv.id} className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md">
                                                <CheckCircle size={14} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 dark:text-slate-200">{new Date(inv.date).toLocaleDateString()}</p>
                                                <p className="text-xs text-slate-500">{inv.number}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-900 dark:text-white">R$ {inv.amount.toFixed(2)}</span>
                                            <button className="text-slate-400 hover:text-primary"><Download size={16} /></button>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-500 text-center py-4">Nenhuma fatura gerada ainda.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                ) : (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <AlertTriangle className="text-amber-500 mb-4" size={40} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Erro ao carregar assinatura</h3>
                        <p className="text-slate-500 mt-2 mb-6">Não foi possível carregar os detalhes do plano. Tente novamente.</p>
                        <button onClick={loadSubscriptionData} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold shadow-lg">
                            Tentar Novamente
                        </button>
                    </div>
                )
            )}

            {/* --- TAB: GENERAL --- */}
            {activeTab === 'general' && (
                <div className="animate-fadeIn space-y-6 max-w-2xl">
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Dados do Proprietário</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Nome Completo</label>
                                <input 
                                    value={profileData.name} 
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary transition-colors dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Nome da Empresa / Fantasia</label>
                                <input 
                                    value={profileData.companyName} 
                                    onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary transition-colors dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: NOTIFICATIONS --- */}
            {activeTab === 'notifications' && (
                <div className="animate-fadeIn space-y-6 max-w-2xl">
                    <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Canais de Alerta</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                                <div className="flex items-center gap-3">
                                    <Mail className="text-slate-500" size={20} />
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">E-mail</p>
                                        <p className="text-xs text-slate-500">Receber resumos e alertas por e-mail.</p>
                                    </div>
                                </div>
                                <button onClick={() => setNotifications({...notifications, emailAlerts: !notifications.emailAlerts})}>
                                    {notifications.emailAlerts ? <ToggleRight size={32} className="text-primary" /> : <ToggleLeft size={32} className="text-slate-300" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>

      {/* PLANS MODAL */}
      {showPlansModal && (
          <ModalWrapper onClose={() => setShowPlansModal(false)} title="Planos e Preços" className="md:max-w-6xl">
              <div className="flex flex-col h-[85vh] bg-slate-50 dark:bg-black/20">
                  <div className="p-6 text-center shrink-0">
                      <div className="inline-flex bg-white dark:bg-surface-dark p-1 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 mb-6">
                          {(['monthly', 'semiannual', 'annual'] as BillingCycle[]).map((cycle) => (
                              <button
                                key={cycle}
                                onClick={() => setSelectedBillingCycle(cycle)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedBillingCycle === cycle ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                              >
                                  {cycle === 'monthly' ? 'Mensal' : cycle === 'semiannual' ? 'Semestral (-10%)' : 'Anual (-20%)'}
                              </button>
                          ))}
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto px-6 pb-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                          {plans.filter(p => p.id !== 'free').map(plan => {
                              const pricing = subscriptionService.calculateTotal(plan.id, selectedBillingCycle);
                              const isCurrent = subscription?.planId === plan.id;
                              
                              return (
                                  <div key={plan.id} className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all ${
                                      plan.highlight 
                                      ? 'bg-white dark:bg-surface-dark border-indigo-500 shadow-xl scale-105 z-10' 
                                      : 'bg-white/50 dark:bg-surface-dark/50 border-gray-200 dark:border-white/5 hover:border-indigo-200'
                                  }`}>
                                      {plan.highlight && (
                                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                              Mais Popular
                                          </div>
                                      )}
                                      
                                      <div className="mb-6">
                                          <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                                          <p className="text-sm text-slate-500 mt-2 h-10">{plan.description}</p>
                                      </div>

                                      <div className="mb-6">
                                          <p className="flex items-baseline gap-1">
                                              <span className="text-3xl font-black text-slate-900 dark:text-white">R$ {pricing.pricePerMonth.toFixed(2)}</span>
                                              <span className="text-slate-500 text-sm font-medium">/mês</span>
                                          </p>
                                          <p className="text-xs text-slate-400 mt-1">Cobrado {selectedBillingCycle === 'monthly' ? 'mensalmente' : selectedBillingCycle === 'semiannual' ? `R$ ${pricing.totalBilled.toFixed(2)} a cada 6 meses` : `R$ ${pricing.totalBilled.toFixed(2)} anualmente`}</p>
                                          {pricing.savings > 0 && (
                                              <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">
                                                  Economize R$ {pricing.savings.toFixed(2)}
                                              </span>
                                          )}
                                      </div>

                                      <div className="flex-1 space-y-3 mb-8">
                                          {plan.features.map((feat, i) => (
                                              <div key={i} className={`flex items-start gap-2 text-sm ${feat.included ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 line-through decoration-slate-300'}`}>
                                                  {feat.included ? <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> : <X size={16} className="text-slate-300 shrink-0 mt-0.5" />}
                                                  <span className="leading-tight">{feat.text}</span>
                                              </div>
                                          ))}
                                      </div>

                                      <button 
                                          onClick={() => !isCurrent && selectPlan(plan.id)}
                                          disabled={isCurrent}
                                          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                                              isCurrent 
                                              ? 'bg-slate-100 dark:bg-white/10 text-slate-400 cursor-default' 
                                              : plan.highlight 
                                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 active:scale-95' 
                                                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-lg active:scale-95'
                                          }`}
                                      >
                                          {isCurrent ? 'Plano Atual' : 'Selecionar Plano'}
                                      </button>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </ModalWrapper>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && checkoutPlanDetails && (
          <ModalWrapper onClose={() => setShowCheckoutModal(false)} title="Finalizar Assinatura" className="md:max-w-lg">
              <div className="p-6 bg-background-light dark:bg-background-dark">
                  {checkoutStep === 'summary' && (
                      <div className="space-y-6 animate-fadeIn">
                          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
                              <h3 className="font-bold text-slate-900 dark:text-white flex justify-between items-center">
                                  <span>Plano {checkoutPlanDetails.name}</span>
                                  <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase px-2 py-1 rounded">{selectedBillingCycle === 'annual' ? 'Anual' : selectedBillingCycle === 'semiannual' ? 'Semestral' : 'Mensal'}</span>
                              </h3>
                              <div className="mt-4 space-y-2 text-sm">
                                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                      <span>Preço do Plano</span>
                                      <span>R$ {checkoutTotals.totalBilled.toFixed(2)}</span>
                                  </div>
                                  {checkoutTotals.savings > 0 && (
                                      <div className="flex justify-between text-emerald-600 font-bold">
                                          <span>Desconto Aplicado</span>
                                          <span>- R$ {checkoutTotals.savings.toFixed(2)}</span>
                                      </div>
                                  )}
                                  <div className="border-t border-gray-200 dark:border-white/10 pt-2 flex justify-between text-lg font-black text-slate-900 dark:text-white">
                                      <span>Total Hoje</span>
                                      <span>R$ {checkoutTotals.totalBilled.toFixed(2)}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-3">
                              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Método de Pagamento</h4>
                              {subscription?.paymentMethod ? (
                                  <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark">
                                      <CardIcon size={20} className="text-slate-500" />
                                      <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}</span>
                                  </div>
                              ) : (
                                  <button className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-slate-500 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5">
                                      <Plus size={16} /> Adicionar Cartão
                                  </button>
                              )}
                          </div>

                          <button 
                              onClick={handleCheckoutProcess}
                              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                              Confirmar e Assinar <ArrowRight size={20} />
                          </button>
                      </div>
                  )}

                  {checkoutStep === 'processing' && (
                      <div className="py-20 flex flex-col items-center justify-center text-center animate-fadeIn">
                          <Loader2 size={48} className="text-primary animate-spin mb-4" />
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Processando pagamento...</h3>
                          <p className="text-slate-500 text-sm mt-2">Por favor, não feche esta janela.</p>
                      </div>
                  )}

                  {checkoutStep === 'success' && (
                      <div className="py-10 flex flex-col items-center justify-center text-center animate-scaleUp">
                          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                              <CheckCircle size={40} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Parabéns!</h3>
                          <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-8">
                              Sua assinatura do plano <strong>{checkoutPlanDetails.name}</strong> foi confirmada. Você já tem acesso a todos os recursos.
                          </p>
                          <button 
                              onClick={() => { setShowCheckoutModal(false); setShowPlansModal(false); }}
                              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
                          >
                              Continuar para o Dashboard
                          </button>
                      </div>
                  )}
              </div>
          </ModalWrapper>
      )}

    </div>
  );
};

export default Settings;
