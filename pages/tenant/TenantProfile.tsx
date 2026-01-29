
import React, { useState, useRef, useEffect } from 'react';
import { 
    User, FileText, Upload, Shield, CheckCircle, Wallet, MapPin, Activity, 
    AlertCircle, Camera, Save, Mail, Phone, Calendar, Briefcase, CreditCard, 
    ChevronRight, Check, Key, FileCheck, Settings, Bell, Car, Dog, Download, 
    Eye, Lock, Edit2, RefreshCw, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TenantProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // File Upload Refs and State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
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
    vehiclePlate: '',
    residents: 'Eu e minha esposa',
    pets: '1 Cachorro (Porte Pequeno)',
    emergencyName: 'Maria Silva',
    emergencyPhone: '(11) 99999-9999',
    avatar: user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf'
  });

  // Settings State
  const [preferences, setPreferences] = useState({
      emailNotif: true,
      whatsappNotif: true,
      paymentReminder: true,
      condoAlerts: true,
      marketing: false
  });

  // Document Upload State
  const [documents, setDocuments] = useState<Record<string, { status: 'pending' | 'analyzing' | 'approved', file?: string }>>({
    'rg': { status: 'approved' },
    'income': { status: 'analyzing' },
    'residence': { status: 'pending' },
    'guarantee': { status: 'pending' }
  });

  // --- Logic for Completion Percentage ---
  const calculateCompletion = () => {
      let totalPoints = 0;
      let earnedPoints = 0;

      // Profile Fields (60%)
      const fields = ['name', 'phone', 'cpf', 'birthDate', 'occupation', 'emergencyName', 'emergencyPhone'];
      fields.forEach(f => {
          totalPoints += 10;
          if ((profileData as any)[f]) earnedPoints += 10;
      });

      // Documents (40%)
      Object.keys(documents).forEach(doc => {
          totalPoints += 15;
          if (documents[doc].status !== 'pending') earnedPoints += 15;
      });

      return Math.min(100, Math.round((earnedPoints / totalPoints) * 100));
  };

  const completion = calculateCompletion();

  // --- Handlers ---

  const triggerFileSelect = (key: string) => {
    setCurrentDocKey(key);
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentDocKey) {
        // Simulate upload
        setDocuments(prev => ({
            ...prev,
            [currentDocKey]: { status: 'analyzing', file: file.name }
        }));
        setTimeout(() => {
            // Simulate approval for demo
            setDocuments(prev => ({
                ...prev,
                [currentDocKey]: { ...prev[currentDocKey], status: 'approved' }
            }));
        }, 3000);
    }
    e.target.value = ''; // Reset input
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setProfileData(prev => ({ ...prev, avatar: ev.target!.result as string }));
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        setIsEditing(false);
    }, 1000);
  };

  // --- Render Helpers ---

  const StatusBadge = ({ status }: { status: string }) => {
      if (status === 'approved') return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/30"><CheckCircle size={12}/> Aprovado</span>;
      if (status === 'analyzing') return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/30"><RefreshCw size={12} className="animate-spin"/> Em Análise</span>;
      return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-900/30"><AlertCircle size={12}/> Pendente</span>;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto md:max-w-4xl relative bg-background-light dark:bg-background-dark">
      {/* Hidden Inputs */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
      <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors">
         <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${completion === 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${completion}%` }}></div>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{completion}% completo</span>
            </div>
         </div>
         {isEditing ? (
             <button 
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-red-500 transition-colors"
             >
                 <X size={20} />
             </button>
         ) : (
             <button 
                onClick={() => { setActiveTab('profile'); setIsEditing(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all active:scale-95"
             >
                 <Edit2 size={14} /> Editar
             </button>
         )}
      </header>

      {/* Tabs */}
      <div className="px-6 py-4">
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl overflow-x-auto hide-scrollbar">
            {[
                { id: 'profile', label: 'Meus Dados', icon: User },
                { id: 'documents', label: 'Documentação', icon: FileText },
                { id: 'preferences', label: 'Configurações', icon: Settings }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[110px] py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6 scroll-smooth">
        
        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && (
            <div className="animate-fadeIn pb-8">
                {/* Avatar Section */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center relative">
                    <div className="relative group">
                        <div 
                            onClick={() => isEditing && avatarInputRef.current?.click()}
                            className={`w-28 h-28 rounded-full border-4 border-white dark:border-surface-dark shadow-lg bg-cover bg-center transition-all ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                            style={{ backgroundImage: `url("${profileData.avatar}")` }}
                        ></div>
                        {isEditing && (
                            <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer pointer-events-none">
                                <Camera size={16} />
                            </div>
                        )}
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{profileData.name}</h3>
                    <p className="text-sm text-slate-500">{profileData.occupation}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    
                    {/* Personal Info */}
                    <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <User size={18} className="text-blue-500" /> Informações Pessoais
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nome Completo</label>
                                <input 
                                    disabled={!isEditing}
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">CPF</label>
                                <input 
                                    disabled={true} // CPF usually locked
                                    value={profileData.cpf}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 opacity-70 cursor-not-allowed font-medium text-sm dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Telefone</label>
                                <input 
                                    disabled={!isEditing}
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 disabled:opacity-60 focus:border-primary outline-none transition-all font-medium text-sm dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Profissão</label>
                                <input 
                                    disabled={!isEditing}
                                    value={profileData.occupation}
                                    onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 disabled:opacity-60 focus:border-primary outline-none transition-all font-medium text-sm dark:text-white"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Residential Info */}
                    <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Car size={18} className="text-orange-500" /> Dados Residenciais
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Veículo (Placa)</label>
                                <input 
                                    disabled={!isEditing}
                                    value={profileData.vehiclePlate}
                                    onChange={(e) => setProfileData({...profileData, vehiclePlate: e.target.value})}
                                    placeholder="Não possui"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 disabled:opacity-60 focus:border-primary outline-none transition-all font-medium text-sm dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Pets</label>
                                <input 
                                    disabled={!isEditing}
                                    value={profileData.pets}
                                    onChange={(e) => setProfileData({...profileData, pets: e.target.value})}
                                    placeholder="Não possui"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 disabled:opacity-60 focus:border-primary outline-none transition-all font-medium text-sm dark:text-white"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Moradores</label>
                                <input 
                                    disabled={!isEditing}
                                    value={profileData.residents}
                                    onChange={(e) => setProfileData({...profileData, residents: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 disabled:opacity-60 focus:border-primary outline-none transition-all font-medium text-sm dark:text-white"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Emergency Contact */}
                    <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-red-500" /> Contato de Emergência
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nome</label>
                                <input 
                                    disabled={!isEditing}
                                    value={profileData.emergencyName}
                                    onChange={(e) => setProfileData({...profileData, emergencyName: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 disabled:opacity-60 focus:border-primary outline-none transition-all font-medium text-sm dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Telefone</label>
                                <input 
                                    disabled={!isEditing}
                                    value={profileData.emergencyPhone}
                                    onChange={(e) => setProfileData({...profileData, emergencyPhone: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 disabled:opacity-60 focus:border-primary outline-none transition-all font-medium text-sm dark:text-white"
                                />
                            </div>
                        </div>
                    </section>

                    {isEditing && (
                        <div className="pt-2 sticky bottom-0 z-10 pb-4 bg-background-light dark:bg-background-dark">
                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full h-14 flex items-center justify-center gap-2 rounded-xl text-white font-bold shadow-xl transition-all active:scale-[0.98] bg-primary hover:bg-primary-dark"
                            >
                                {isSaving ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Salvando...</span> : <><Save size={20} /> Salvar Alterações</>}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        )}

        {/* --- DOCUMENTS TAB --- */}
        {activeTab === 'documents' && (
            <div className="space-y-8 animate-fadeIn">
                
                {/* 1. Property Docs (Read Only) */}
                <section>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 flex items-center gap-2 px-1">
                        <Key className="text-primary" size={20} /> Documentos do Imóvel
                    </h3>
                    <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                        {[
                            { name: 'Contrato de Locação Assinado', icon: FileCheck, date: '10/01/2024' },
                            { name: 'Laudo de Vistoria de Entrada', icon: Camera, date: '08/01/2024' },
                            { name: 'Regimento Interno do Condomínio', icon: Shield, date: '01/01/2024' }
                        ].map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 group-hover:text-primary transition-colors">
                                        <doc.icon size={20} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">{doc.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Disponível desde {doc.date}</span>
                                    </div>
                                </div>
                                <button className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-white/10 transition-colors">
                                    <Download size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Personal Docs (Upload) */}
                <section>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 flex items-center gap-2 px-1">
                        <FileText className="text-indigo-500" size={20} /> Meus Documentos
                    </h3>
                    <div className="grid gap-4">
                        {[
                            { id: 'rg', label: 'RG ou CNH', desc: 'Frente e Verso' },
                            { id: 'income', label: 'Comprovante de Renda', desc: 'Holerite ou Extrato' },
                            { id: 'residence', label: 'Comp. de Residência', desc: 'Conta de luz/água' },
                            { id: 'guarantee', label: 'Apólice / Garantia', desc: 'Doc. do seguro fiança' }
                        ].map((doc) => {
                            const status = documents[doc.id].status;
                            return (
                                <div key={doc.id} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${status === 'approved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-500 dark:bg-white/10'}`}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{doc.label}</p>
                                            <p className="text-xs text-slate-500">{doc.desc}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <StatusBadge status={status} />
                                        {status !== 'approved' && (
                                            <button 
                                                onClick={() => triggerFileSelect(doc.id)}
                                                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm active:scale-95 whitespace-nowrap"
                                            >
                                                <Upload size={14} /> Enviar
                                            </button>
                                        )}
                                        {status === 'approved' && (
                                            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                <Eye size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        )}

        {/* --- PREFERENCES TAB --- */}
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
                            { id: 'marketing', label: 'Ofertas e Parceiros', desc: 'Descontos em serviços de mudança/limpeza.' },
                        ].map((pref) => (
                            <div key={pref.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setPreferences({ ...preferences, [pref.id]: !(preferences as any)[pref.id] })}>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{pref.label}</p>
                                    <p className="text-xs text-slate-500">{pref.desc}</p>
                                </div>
                                <div 
                                    className={`w-11 h-6 rounded-full p-1 transition-colors relative ${
                                        (preferences as any)[pref.id] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${
                                        (preferences as any)[pref.id] ? 'left-[calc(100%-1.25rem)]' : 'left-1'
                                    }`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Segurança</h3>
                    <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-white/10 rounded-lg text-slate-500 group-hover:text-primary transition-colors">
                                <Lock size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Alterar Senha</p>
                                <p className="text-xs text-slate-500">Última alteração há 3 meses</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400 group-hover:text-primary" />
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default TenantProfile;
