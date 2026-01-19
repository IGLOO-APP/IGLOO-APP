import React, { useState, useEffect, useRef } from 'react';
import { User, FileText, Upload, Shield, CheckCircle, Wallet, MapPin, Activity, AlertCircle, Camera, Save, Mail, Phone, Calendar, Briefcase, CreditCard, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TenantProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents'>('documents');
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
    nationality: 'Brasileiro(a)'
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
        // Start upload simulation
        setUploadStatus(prev => ({ ...prev, [currentDocKey]: 'uploading' }));
        
        // Reset input so the same file can be selected again if needed
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
    // Simulate API call
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
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg text-sm font-bold w-full md:w-auto justify-center shadow-sm border border-emerald-100 dark:border-emerald-900/30 cursor-default">
                <CheckCircle size={16} />
                <span>Enviado</span>
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
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.jpg,.jpeg,.png"
      />

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
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
            <button 
                onClick={() => setActiveTab('documents')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'documents' ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <FileText size={16} /> Documentação
            </button>
            <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'profile' ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <User size={16} /> Dados Pessoais
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
        
        {activeTab === 'documents' && (
            <div className="space-y-6 animate-fadeIn">
                
                {/* Progress Summary Widget */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-surface-dark dark:to-black p-5 rounded-2xl shadow-lg text-white">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">Status da Documentação</h3>
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
                    <p className="text-xs text-slate-300 mt-3 flex items-center gap-2">
                        {progressPercentage === 100 ? (
                            <><CheckCircle size={14} className="text-emerald-400" /> Documentação completa! Aguardando aprovação.</>
                        ) : (
                            <><AlertCircle size={14} className="text-orange-400" /> Complete o envio para agilizar a análise.</>
                        )}
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3">
                    <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0" size={24} />
                    <div>
                        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">Análise Cadastral</h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                            O proprietário ou a imobiliária realizará uma análise cadastral e de crédito. Mantenha seus documentos atualizados.
                        </p>
                    </div>
                </div>

                {/* 1. Documentos Pessoais */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Documentos Pessoais</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Cópias autenticadas necessárias</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-black/20 rounded-xl">
                            <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">RG e CPF</p>
                                <p className="text-xs text-slate-500">Documento de identificação oficial com foto.</p>
                            </div>
                            <UploadButton docKey="rg" label="RG/CPF" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-black/20 rounded-xl">
                            <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">Certidão de Estado Civil</p>
                                <p className="text-xs text-slate-500">Nascimento, casamento ou averbação.</p>
                            </div>
                            <UploadButton docKey="civil" label="Certidão" />
                        </div>
                    </div>
                </section>

                {/* 2. Comprovação de Renda */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Comprovação de Renda</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Mínimo 3x o valor do aluguel</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl space-y-3">
                            <div className="flex items-start gap-2">
                                <Check size={16} className="text-emerald-500 mt-0.5" />
                                <p className="text-sm text-slate-700 dark:text-slate-300">3 últimos contracheques (holerites)</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Check size={16} className="text-emerald-500 mt-0.5" />
                                <p className="text-sm text-slate-700 dark:text-slate-300">Cópia da carteira de trabalho</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Check size={16} className="text-emerald-500 mt-0.5" />
                                <p className="text-sm text-slate-700 dark:text-slate-300">Declaração de Imposto de Renda</p>
                            </div>
                            <div className="pt-2">
                                <UploadButton docKey="income" label="Comprovantes" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Comprovante de Residência */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Residência Atual</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Conta recente (Luz, Água ou Telefone)</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-black/20 rounded-xl">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Endereço atual cadastrado.</p>
                        <UploadButton docKey="residence" label="Conta" />
                    </div>
                </section>

                {/* 4. Garantia Locatícia */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Garantia Locatícia</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Modalidade escolhida</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 relative">
                            <div className="absolute top-3 right-3 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Selecionado</div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Caução</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                                Depósito de 3 meses de aluguel.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 opacity-60 bg-gray-50 dark:bg-black/20">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Outros</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                                Fiador, Seguro Fiança ou Título.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Análise de Crédito */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-surface-dark dark:to-black rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <Activity className="text-emerald-400" size={24} />
                            <div>
                                <h3 className="font-bold text-lg">Análise de Crédito</h3>
                                <p className="text-xs text-slate-400">Serasa / SPC</p>
                            </div>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Pré-Aprovado
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                            <span>Score</span>
                            <span>Alto</span>
                        </div>
                        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-primary w-[85%] rounded-full"></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-3 leading-relaxed opacity-80">
                            Histórico de crédito "Nome Limpo". Isso agiliza a aprovação.
                        </p>
                    </div>
                </section>
            </div>
        )}

        {activeTab === 'profile' && (
            <div className="animate-fadeIn pb-8">
                {/* Header Avatar Section */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center relative">
                    <div className="relative group cursor-pointer">
                        <div className="w-28 h-28 rounded-full border-4 border-white dark:border-surface-dark shadow-lg bg-cover bg-center" 
                             style={{ backgroundImage: `url("${user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjajTkjuEiAjZGgvWpvqoX_CS2JuzKJpLPQGJ7J8xY4UJh4fjwFHdw2m73Ijiwx6Y6mmq04a_GCQDADaO1JShHv72xfvolA170ZWAb0BWs9-CTJ7FHsPNnfmxaBxvHdfHrZUp9qwzpDsIMxmJmZjpyVaz7NGMlFhbVPw8BvgyA-Abb9BUw78bITJXxne_mvd6qyOViOlbSmn8YCpmYsAq9AZPBDQhOyJRCJXC1MXWLNEfkhz9UICWr4N4dc5hQ8WZBp3fIWv95oeLf'}")` }}>
                        </div>
                        <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-dark transition-colors">
                            <Camera size={18} />
                        </div>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{profileData.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Inquilino desde 2024</p>
                </div>

                <form onSubmit={handleSaveProfile} className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-5">
                    <div className="flex items-center gap-2 mb-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <User className="text-primary" size={20} />
                        <h3 className="font-bold text-slate-900 dark:text-white">Dados Pessoais</h3>
                    </div>

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
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text"
                                    value={profileData.cpf}
                                    onChange={(e) => setProfileData({...profileData, cpf: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Data de Nascimento</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="date"
                                    value={profileData.birthDate}
                                    onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Estado Civil</label>
                            <div className="relative">
                                <select 
                                    value={profileData.maritalStatus}
                                    onChange={(e) => setProfileData({...profileData, maritalStatus: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm appearance-none"
                                >
                                    <option>Solteiro(a)</option>
                                    <option>Casado(a)</option>
                                    <option>Divorciado(a)</option>
                                    <option>Viúvo(a)</option>
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={18} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Profissão</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text"
                                    value={profileData.occupation}
                                    onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nacionalidade</label>
                            <input 
                                type="text"
                                value={profileData.nationality}
                                onChange={(e) => setProfileData({...profileData, nationality: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Phone className="text-primary" size={20} />
                            <h3 className="font-bold text-slate-900 dark:text-white">Contato</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Telefone / WhatsApp</label>
                                <input 
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">E-mail (Login)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-transparent text-slate-500 dark:text-slate-400 font-medium text-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>
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

      </div>
    </div>
  );
};

export default TenantProfile;