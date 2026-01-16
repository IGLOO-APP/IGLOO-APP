import React, { useState } from 'react';
import { User, Bell, CreditCard, Save, CheckCircle, Smartphone, Mail, QrCode, Barcode, Landmark, Banknote, ShieldCheck, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PaymentMethod {
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
  const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'notifications'>('financial');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- State: Financial Configuration (The core request) ---
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pix',
      name: 'Pix',
      enabled: true,
      icon: QrCode,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
      fields: { key: '12.345.678/0001-90', type: 'CNPJ' },
      description: 'Recebimento instantâneo. O inquilino verá o QR Code e o botão Copia e Cola.'
    },
    {
      id: 'boleto',
      name: 'Boleto Bancário',
      enabled: true,
      icon: Barcode,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
      fields: { bank: 'Itaú', agency: '0001', account: '12345-6', wallet: '109' },
      description: 'Geração automática de boletos. Requer convênio bancário ativo.'
    },
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      enabled: false,
      icon: CreditCard,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
      fields: { gateway: 'Mercado Pago', publicKey: 'pk_test_...', maxInstallments: '12' },
      description: 'Receba via cartão de crédito. Configure suas credenciais de API do gateway.'
    },
    {
      id: 'transfer',
      name: 'Transferência / TED',
      enabled: false,
      icon: Landmark,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      fields: { bank: '', agency: '', account: '' },
      description: 'Para inquilinos que preferem agendamento tradicional.'
    },
    {
      id: 'cash',
      name: 'Dinheiro / Presencial',
      enabled: false,
      icon: Banknote,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      fields: { instructions: 'Pagamento na administração em horário comercial.' },
      description: 'Habilita a baixa manual de pagamentos recebidos em espécie.'
    }
  ]);

  // --- State: Profile ---
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Investidor Exemplo',
    email: user?.email || 'investidor@igloo.com',
    phone: '(11) 99999-8888',
    companyName: 'Igloo Asset Management'
  });

  // --- State: Notifications ---
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    paymentReceived: true,
    latePayment: true,
    maintenance: true
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
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
        
        {/* Sidebar Navigation (Desktop) / Horizontal Tabs (Mobile) */}
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
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5 flex gap-4">
                        <ShieldCheck className="text-blue-600 dark:text-blue-400 shrink-0" size={28} />
                        <div>
                            <h3 className="font-bold text-blue-900 dark:text-blue-300">Autonomia de Recebimento</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                                Selecione quais formas de pagamento você aceita. As opções ativas aparecerão automaticamente no painel do inquilino para pagamento de aluguel e encargos.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {paymentMethods.map((method) => (
                            <div key={method.id} className={`bg-white dark:bg-surface-dark rounded-2xl border transition-all duration-300 ${method.enabled ? 'border-primary shadow-md shadow-primary/5 ring-1 ring-primary/20' : 'border-gray-200 dark:border-white/5 opacity-80'}`}>
                                <div className="p-5 flex items-start justify-between">
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${method.color}`}>
                                            <method.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{method.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">{method.description}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => togglePaymentMethod(method.id)}
                                        className={`transition-colors ${method.enabled ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}
                                    >
                                        {method.enabled ? <ToggleRight size={40} strokeWidth={1.5} /> : <ToggleLeft size={40} strokeWidth={1.5} />}
                                    </button>
                                </div>

                                {method.enabled && (
                                    <div className="px-5 pb-5 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700 bg-slate-50/50 dark:bg-white/5 rounded-b-2xl animate-slideUp">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                            {Object.keys(method.fields).map((fieldKey) => (
                                                <div key={fieldKey}>
                                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                                                        {fieldKey === 'key' ? 'Chave Pix' : 
                                                         fieldKey === 'type' ? 'Tipo de Chave' : 
                                                         fieldKey === 'bank' ? 'Banco' : 
                                                         fieldKey === 'agency' ? 'Agência' : 
                                                         fieldKey === 'account' ? 'Conta' : 
                                                         fieldKey === 'wallet' ? 'Carteira (Cobrança)' : 
                                                         fieldKey === 'gateway' ? 'Gateway / Operadora' :
                                                         fieldKey === 'publicKey' ? 'Chave Pública (API)' :
                                                         fieldKey === 'maxInstallments' ? 'Máx. Parcelas' :
                                                         'Instruções'}
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        value={method.fields[fieldKey]}
                                                        onChange={(e) => updatePaymentField(method.id, fieldKey, e.target.value)}
                                                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:text-white font-medium"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">E-mail</label>
                                    <input 
                                        value={profileData.email} 
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary transition-colors dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Telefone</label>
                                    <input 
                                        value={profileData.phone} 
                                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary transition-colors dark:text-white"
                                    />
                                </div>
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
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="text-slate-500" size={20} />
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">Push / SMS</p>
                                        <p className="text-xs text-slate-500">Notificações em tempo real no celular.</p>
                                    </div>
                                </div>
                                <button onClick={() => setNotifications({...notifications, smsAlerts: !notifications.smsAlerts})}>
                                    {notifications.smsAlerts ? <ToggleRight size={32} className="text-primary" /> : <ToggleLeft size={32} className="text-slate-300" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4">Eventos</h3>
                        <div className="space-y-4">
                            {['Pagamento Recebido', 'Pagamento em Atraso', 'Nova Solicitação de Manutenção'].map((event, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{event}</span>
                                    <ToggleRight size={32} className="text-primary cursor-pointer" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Settings;