
import React, { useState, useEffect, useRef } from 'react';
import { User, FileText, Upload, Shield, CheckCircle, Wallet, MapPin, Activity, AlertCircle, Camera, Save, Mail, Phone, Calendar, Briefcase, CreditCard, ChevronRight, Check, Key, FileCheck, Settings, Bell, Car, Dog, Download, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TenantProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'preferences'>('documents');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // File Upload Refs and State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentDocKey, setCurrentDocKey] = useState<string | null>(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '(11) 99876-5432',
    cpf: '123.456.789-00',
    birthDate: '1990-05-15',
    maritalStatus: 'Solteiro(a)',
    occupation: 'Desenvolvedor de Software',
    nationality: 'Brasileiro(a)',
    vehiclePlate: '',
    residents: 'Eu e minha esposa',
    pets: '1 Cachorro (Porte Pequeno)',
    emergencyContact: 'Maria - (11) 99999-9999'
  });

  // Settings State
  const [preferences, setPreferences] = useState({
      emailNotif: true,
      whatsappNotif: true,
      paymentReminder: true,
      condoAlerts: true
  });

  // States for document upload simulation
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'uploading' | 'completed'>>({
    'rg': 'completed',
    'cpf': 'completed',
    'civil': 'pending',
    'income': 'pending',
    'residence': 'pending',
    'guarantee': 'pending'
  });

  const completedCount = Object.values(uploadStatus).filter(s => s === 'completed').length;
  const totalDocs = Object.keys(uploadStatus).length;
  const progressPercentage = Math.round((completedCount / totalDocs) * 100);

  const triggerFileSelect = (key: string) => {
    setCurrentDocKey(key);
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentDocKey) {
        setUploadStatus(prev => ({ ...prev, [currentDocKey]: 'uploading' }));
        e.target.value = '';
        setTimeout(() => {
            setUploadStatus(prev => ({ ...prev, [currentDocKey]: 'completed' }));
            setCurrentDocKey(null);
        }, 2000);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const UploadButton = ({ docKey, label }: { docKey: string, label: string }) => {
    const status = uploadStatus[docKey];
    if (status === 'completed') {
        return (
            <div className="flex items-center gap-2">
                <button 
                    className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary/30 shadow-sm"
                    title="Visualizar Documento"
                >
                    <Eye size={18} />
                </button>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg text-sm font-bold w-full md:w-auto justify-center shadow-sm border border-emerald-100 dark:border-emerald-900/30 cursor-default">
                    <CheckCircle size={16} />
                    <span>Enviado</span>
                </div>
            </div>
        );
    }
    return (
        <button 
            onClick={() => triggerFileSelect(docKey)}
            disabled={status === 'uploading'}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all w-full md:w-auto justify-center disabled:opacity-70 shadow-sm active:scale-95"
        >
            {status === 'uploading' ? (
                <>Enviando...</>
            ) : (
                <>
                    <Upload size={16} />
                    <span>Enviar {label}</span>
                </>
            )}
        </button>
    );
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto md:max-w-4xl relative bg-background-light dark:bg-background-dark">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />

      <header className="sticky top-0 z-10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors">
         <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie seus dados e documentos</p>
         </div>
         <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            {user?.name.charAt(0)}
         </div>
      </header>

      <div className="px-6 py-4">
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl overflow-x-auto hide-scrollbar">
            {[
                { id: 'documents', label: 'Docs', icon: FileText },
                { id: 'profile', label: 'Dados', icon: User },
                { id: 'preferences', label: 'Preferências', icon: Settings }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[100px] py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
        
        {activeTab === 'documents' && (
            <div className="space-y-6 animate-fadeIn">
                
                {/* Property Docs Section */}
                <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Key className="text-primary" size={20} /> Documentos do Imóvel
                    </h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Contrato de Locação Assinado', icon: FileCheck },
                            { name: 'Laudo de Vistoria de Entrada', icon: Camera },
                            { name: 'Manual do Proprietário', icon: FileText },
                            { name: 'Regimento Interno do Condomínio', icon: Shield }
                        ].map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-primary/30 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white dark:bg-white/5 text-slate-500 group-hover:text-primary transition-colors">
                                        <doc.icon size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{doc.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-white/10 transition-colors"
                                        title="Visualizar"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button 
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-white/10 transition-colors"
                                        title="Baixar"
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Summary Widget */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-surface-dark dark:to-black p-5 rounded-2xl shadow-lg text-white">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">Envio de Documentos</h3>
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-lg border border-white/10">
                            {completedCount} de {totalDocs} enviados
                        </span>
                    </div>
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                        <div 
                            className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Document Sections */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-black/20 rounded-xl">
                            <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">RG e CPF</p>
                                <p className="text-xs text-slate-500">Documento de identificação oficial.</p>
                            </div>
                            <UploadButton docKey="rg" label="RG/CPF" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-black/20 rounded-xl">
                            <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">Comprovante de Renda</p>
                                <p className="text-xs text-slate-500">Holerite ou Extrato Bancário.</p>
                            </div>
                            <UploadButton docKey="income" label="Comprovante" />
                        </div>
                    </div>
                </section>
            </div>
        )}

        {activeTab === 'profile' && (
            <div className="animate-fadeIn pb-8">
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center relative">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-surface-dark shadow-lg bg-cover bg-center" 
                             style={{ backgroundImage: `url("${user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf'}")` }}>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-dark transition-colors">
                            <Camera size={16} />
                        </div>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{profileData.name}</h3>
                </div>

                <form onSubmit={handleSaveProfile} className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-5">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nome Completo</label>
                            <input 
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">CPF</label>
                            <input 
                                type="text"
                                value={profileData.cpf}
                                onChange={(e) => setProfileData({...profileData, cpf: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1"><Car size={14}/> Veículo (Placa)</label>
                            <input 
                                type="text"
                                value={profileData.vehiclePlate}
                                onChange={(e) => setProfileData({...profileData, vehiclePlate: e.target.value})}
                                placeholder="ABC-1234"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1"><Dog size={14}/> Pets</label>
                            <input 
                                type="text"
                                value={profileData.pets}
                                onChange={(e) => setProfileData({...profileData, pets: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className={`w-full md:w-auto md:min-w-[200px] h-12 flex items-center justify-center gap-2 rounded-xl text-white font-bold shadow-lg transition-all active:scale-[0.98] ${
                                saveSuccess 
                                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25' 
                                : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100'
                            }`}
                        >
                            {isSaving ? (
                                <>Salvando...</>
                            ) : saveSuccess ? (
                                <><CheckCircle size={20} /> Salvo com Sucesso!</>
                            ) : (
                                <><Save size={20} /> Salvar Alterações</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {activeTab === 'preferences' && (
            <div className="animate-fadeIn space-y-4">
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Notificações</h3>
                    <div className="space-y-4">
                        {[
                            { id: 'emailNotif', label: 'Alertas por Email', desc: 'Receba boletos e avisos importantes.' },
                            { id: 'whatsappNotif', label: 'Mensagens WhatsApp', desc: 'Contato direto do proprietário.' },
                            { id: 'paymentReminder', label: 'Lembrete de Pagamento', desc: 'Aviso 3 dias antes do vencimento.' },
                            { id: 'condoAlerts', label: 'Avisos do Condomínio', desc: 'Manutenções e comunicados gerais.' },
                        ].map((pref) => (
                            <div key={pref.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/20">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{pref.label}</p>
                                    <p className="text-xs text-slate-500">{pref.desc}</p>
                                </div>
                                <div 
                                    onClick={() => setPreferences({ ...preferences, [pref.id]: !(preferences as any)[pref.id] })}
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                                        (preferences as any)[pref.id] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                                        (preferences as any)[pref.id] ? 'translate-x-6' : 'translate-x-0'
                                    }`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default TenantProfile;
