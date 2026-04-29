import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Car, 
  Users, 
  Heart, 
  Activity, 
  FileText, 
  Download, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Shield, 
  Bell, 
  ChevronRight, 
  LogOut, 
  ArrowLeft,
  Camera,
  FileCheck,
  Key,
  Edit,
  Save,
  X,
  Lock,
  Star,
  ChevronDown,
  Edit2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { ModalWrapper } from '../../components/ui/ModalWrapper';
import { useAuth } from '../../context/AuthContext';
import { tenantConfigService } from '../../services/tenantConfigService';
import { TenantProfileConfig, RequirementStatus } from '../../types';

const TenantProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showReminderSelect, setShowReminderSelect] = useState(false);

  // Profile Config (Ajuste Controle Total)
  const config = tenantConfigService.getConfigForProperty(user?.property_id?.toString() || '101'); 

  // File Upload Refs and State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [currentDocKey, setCurrentDocKey] = useState<string | null>(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Inquilino Demo',
    email: user?.email || 'inquilino@exemplo.com',
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
    avatar:
      user?.avatar ||
      'https://i.pravatar.cc/150?u=tenant',
    lastPasswordChange: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 7), // 7 meses atrás (mock para alerta)
  });

  // Settings State
  const [preferences, setPreferences] = useState({
    emailNotif: true,
    whatsappNotif: true,
    paymentReminder: true,
    reminderDays: '5 dias',
    condoAlerts: true,
  });

  const [documents, setDocuments] = useState<any>({
    rg: { status: 'approved', date: '10/01/2024' },
    income: { status: 'pending', date: null },
    residence: { status: 'review', date: '01/03/2024' },
    guarantee: { status: 'pending', date: null },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      alert('Perfil atualizado com sucesso!');
    }, 1500);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (key: string) => {
    setCurrentDocKey(key);
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentDocKey) {
      setDocuments({
        ...documents,
        [currentDocKey]: { status: 'review', date: new Date().toLocaleDateString() },
      });
      alert('Documento enviado para análise!');
    }
  };

  const handleReminderChange = (days: string) => {
    setPreferences({ ...preferences, reminderDays: days });
    setShowReminderSelect(false);
    alert(`Lembrete alterado para ${days} antes do vencimento`);
  };

  // --- Logic for Completion Percentage (Updated Ajuste Controle Total) ---
  const getPendingItems = () => {
    const items: { id: string; label: string; tab: string; section?: string }[] = [];

    // Personal (Fixed required)
    if (!profileData.name)
      items.push({ id: 'name', label: 'Nome Completo', tab: 'profile', section: 'personal' });
    if (!profileData.phone)
      items.push({ id: 'phone', label: 'Telefone', tab: 'profile', section: 'personal' });
    if (!profileData.cpf) items.push({ id: 'cpf', label: 'CPF', tab: 'profile', section: 'personal' });

    // Personal (Configurable)
    if (config.sections.personal.occupation === 'required' && !profileData.occupation)
      items.push({ id: 'occupation', label: 'Profissão', tab: 'profile', section: 'personal' });

    // Residential (Configurable)
    if (config.sections.residential.vehicle === 'required' && !profileData.vehiclePlate)
      items.push({ id: 'vehiclePlate', label: 'Veículo', tab: 'profile', section: 'residential' });
    if (config.sections.residential.pets === 'required' && !profileData.pets)
      items.push({ id: 'pets', label: 'Pets', tab: 'profile', section: 'residential' });
    if (config.sections.residential.residents === 'required' && !profileData.residents)
      items.push({ id: 'residents', label: 'Moradores', tab: 'profile', section: 'residential' });

    // Emergency (Configurable)
    if (config.sections.emergency.status === 'required' && (!profileData.emergencyName || !profileData.emergencyPhone))
      items.push({
        id: 'emergencyName',
        label: 'Contato de Emergência',
        tab: 'profile',
        section: 'emergency',
      });

    // Documents (Configurable)
    if (config.sections.requiredDocs.id_card === 'required' && documents.rg.status === 'pending')
      items.push({ id: 'id_card', label: 'RG ou CNH', tab: 'documents' });
    if (config.sections.requiredDocs.income === 'required' && documents.income.status === 'pending')
      items.push({ id: 'income', label: 'Comprovante de Renda', tab: 'documents' });
    if (config.sections.requiredDocs.residence === 'required' && documents.residence.status === 'pending')
      items.push({ id: 'residence', label: 'Comp. de Residência', tab: 'documents' });
    if (config.sections.requiredDocs.guarantee === 'required' && documents.guarantee.status === 'pending')
      items.push({ id: 'guarantee', label: 'Apólice / Garantia', tab: 'documents' });

    // Custom Documents (Configurable)
    config.sections.requiredDocs.custom.forEach(custom => {
      if (custom.status === 'required') {
        const docStatus = documents[custom.id]?.status || 'pending';
        if (docStatus === 'pending') {
          items.push({ id: custom.id, label: custom.label, tab: 'documents' });
        }
      }
    });

    return items;
  };

  const pendingItems = getPendingItems();
  
  // Total possible required items based on config
  const getTotalRequiredCount = () => {
    let count = 3; // Name, Phone, CPF are always fixed required
    if (config.sections.personal.occupation === 'required') count++;
    if (config.sections.residential.vehicle === 'required') count++;
    if (config.sections.residential.pets === 'required') count++;
    if (config.sections.residential.residents === 'required') count++;
    if (config.sections.emergency.status === 'required') count++;
    if (config.sections.requiredDocs.id_card === 'required') count++;
    if (config.sections.requiredDocs.income === 'required') count++;
    if (config.sections.requiredDocs.residence === 'required') count++;
    if (config.sections.requiredDocs.guarantee === 'required') count++;
    
    // Custom required docs
    count += config.sections.requiredDocs.custom.filter(c => c.status === 'required').length;
    
    return count;
  };

  const totalRequired = getTotalRequiredCount();
  const completionPercent = totalRequired > 0 
    ? Math.round(((totalRequired - pendingItems.length) / totalRequired) * 100) 
    : 100;

  const getStatusBadge = (status: string, requirementStatus: RequirementStatus = 'required') => {
    if (status === 'approved')
      return <span className='min-w-[80px] text-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider'>APROVADO</span>;
    if (status === 'review')
      return <span className='min-w-[80px] text-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider'>EM ANÁLISE</span>;
    
    if (requirementStatus === 'optional') return null;
    
    return <span className='min-w-[80px] text-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider'>PENDENTE</span>;
  };

  const getFieldClass = (value: string) => {
    return `w-full px-4 py-3 rounded-xl border transition-all text-sm font-bold ${
      isEditing 
        ? 'bg-white dark:bg-surface-dark border-primary/30 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white' 
        : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400 cursor-default'
    }`;
  };

  return (
    <div className='flex flex-col h-full bg-background-light dark:bg-background-dark'>
      {/* Hidden inputs for uploads */}
      <input type='file' ref={fileInputRef} onChange={onFileSelected} className='hidden' />
      <input type='file' ref={avatarInputRef} onChange={handleAvatarChange} className='hidden' />

      {/* --- COMPACT HORIZONTAL HEADER --- */}
      <div className='px-6 py-6 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark sticky top-0 z-30'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='relative group'>
              <div
                className={`w-14 h-14 rounded-full border-2 border-primary/20 bg-cover bg-center ${isEditing ? 'cursor-pointer hover:opacity-80' : ''} shadow-lg shadow-black/5`}
                style={{ backgroundImage: `url("${profileData.avatar}")` }}
                onClick={() => isEditing && avatarInputRef.current?.click()}
              >
                {isEditing && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]'>
                    <Camera size={16} className='text-white' />
                  </div>
                )}
              </div>
            </div>
            <div>
              <h1 className='text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight'>
                {profileData.name}
              </h1>
              <div className='flex items-center gap-2 mt-0.5'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  {profileData.occupation}
                </span>
                <span className='w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10'></span>
                <span className='text-[10px] font-black text-emerald-500 uppercase tracking-widest'>Inquilino Nível 5</span>
              </div>
            </div>
          </div>

          <div className='flex gap-2'>
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className='px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all'
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className='px-6 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2 active:scale-95'
                >
                  {isSaving ? <Clock size={14} className='animate-spin' /> : <Save size={14} />}
                  Salvar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className='px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-black/10 dark:shadow-none'
              >
                <Edit2 size={14} />
                Editar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div className='px-6 pt-4 pb-2 sticky top-[105px] z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md'>
        <div className='flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl overflow-x-auto hide-scrollbar'>
          {[
            { id: 'profile', label: 'Meus Dados', icon: User },
            { id: 'documents', label: 'Documentação', icon: FileText },
            { id: 'preferences', label: 'Configurações', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[110px] py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-6 pb-24 space-y-6 scroll-smooth pt-4'>
        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && (
          <div className='animate-fadeIn pb-8 space-y-6'>
            {/* AI Score Insights Card */}
            <div className='bg-slate-900 dark:bg-surface-dark rounded-3xl p-6 text-white shadow-xl relative overflow-hidden'>
              <div className='absolute right-0 top-0 p-6 opacity-10'>
                <Star size={120} />
              </div>
              <div className='relative z-10'>
                <div className='flex justify-between items-start mb-6'>
                  <div>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2'>Seu Score IGLOO</p>
                    <h3 className='text-5xl font-black flex items-center gap-2 tracking-tighter'>
                      95<span className='text-xl text-slate-500 font-bold'>/100</span>
                    </h3>
                  </div>
                  <div className='text-right'>
                    <span className='px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest'>Nível Elite</span>
                  </div>
                </div>
                
                <div className='grid grid-cols-2 gap-4 pt-4 border-t border-white/10'>
                  <div className='flex flex-col'>
                    <span className='text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1'>Pontualidade</span>
                    <span className='text-sm font-bold text-emerald-400'>Exemplar</span>
                  </div>
                  <div className='flex flex-col text-right'>
                    <span className='text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1'>Conservação</span>
                    <span className='text-sm font-bold text-primary'>Nota 9.5</span>
                  </div>
                </div>
                <p className='text-[10px] text-slate-400 font-medium mt-4 italic'>
                  * Este score é visível para o proprietário e ajuda em futuras renovações.
                </p>
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className='bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5'>
              <div className='flex justify-between items-center mb-4'>
                <h4 className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest'>Status do Perfil</h4>
                <span className={`text-xs font-bold ${completionPercent === 100 ? 'text-emerald-500' : 'text-primary'}`}>{completionPercent}% Concluído</span>
              </div>
              <div className='h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-6'>
                <div 
                  className={`h-full transition-all duration-1000 ${completionPercent === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              {pendingItems.length > 0 ? (
                <div className='space-y-3'>
                  <p className='text-[11px] text-slate-500 font-bold uppercase tracking-tight'>Ações pendentes para 100%:</p>
                  <div className='flex flex-wrap gap-2'>
                    {pendingItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.tab as any);
                          if (item.tab === 'profile') setIsEditing(true);
                        }}
                        className='px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-primary/50 hover:text-primary transition-all flex items-center gap-1.5'
                      >
                        <AlertCircle size={12} className='text-orange-500' />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20'>
                  <CheckCircle size={20} className='text-emerald-500' />
                  <p className='text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight'>Perfil completo e verificado!</p>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className='space-y-6'>
              {/* Personal Info */}
              <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden'>
                <div className='absolute top-0 left-0 w-1 h-full bg-blue-500'></div>
                <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
                  <User size={18} className='text-blue-500' /> 
                  Informações Pessoais
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Nome Completo
                    </label>
                    <input
                      type='text'
                      value={profileData.name}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className={getFieldClass(profileData.name)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      E-mail
                    </label>
                    <input
                      type='email'
                      value={profileData.email}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className={getFieldClass(profileData.email)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Telefone
                    </label>
                    <input
                      type='text'
                      value={profileData.phone}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className={getFieldClass(profileData.phone)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      CPF
                    </label>
                    <input
                      type='text'
                      value={profileData.cpf}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, cpf: e.target.value })}
                      className={getFieldClass(profileData.cpf)}
                    />
                  </div>
                  {config.sections.personal.occupation !== 'hidden' && (
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                        Profissão
                      </label>
                      <input
                        type='text'
                        value={profileData.occupation}
                        readOnly={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                        className={getFieldClass(profileData.occupation)}
                      />
                    </div>
                  )}
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Estado Civil
                    </label>
                    <select
                      disabled={!isEditing}
                      value={profileData.maritalStatus}
                      onChange={(e) => setProfileData({ ...profileData, maritalStatus: e.target.value })}
                      className={getFieldClass(profileData.maritalStatus)}
                    >
                      <option>Solteiro(a)</option>
                      <option>Casado(a)</option>
                      <option>Divorciado(a)</option>
                      <option>Viúvo(a)</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Residential Info */}
              {(config.sections.residential.vehicle !== 'hidden' || 
                config.sections.residential.pets !== 'hidden' || 
                config.sections.residential.residents !== 'hidden') && (
                <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden'>
                  <div className='absolute top-0 left-0 w-1 h-full bg-emerald-500'></div>
                  <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
                    <Car size={18} className='text-emerald-500' /> 
                    Dados Residenciais
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {config.sections.residential.vehicle !== 'hidden' && (
                      <div className='space-y-2'>
                        <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                          Placa do Veículo
                        </label>
                        <input
                          type='text'
                          value={profileData.vehiclePlate}
                          readOnly={!isEditing}
                          placeholder='Ex: ABC-1234'
                          onChange={(e) => setProfileData({ ...profileData, vehiclePlate: e.target.value })}
                          className={getFieldClass(profileData.vehiclePlate)}
                        />
                      </div>
                    )}
                    {config.sections.residential.residents !== 'hidden' && (
                      <div className='space-y-2'>
                        <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                          Moradores
                        </label>
                        <input
                          type='text'
                          value={profileData.residents}
                          readOnly={!isEditing}
                          onChange={(e) => setProfileData({ ...profileData, residents: e.target.value })}
                          className={getFieldClass(profileData.residents)}
                        />
                      </div>
                    )}
                    {config.sections.residential.pets !== 'hidden' && (
                      <div className='md:col-span-2 space-y-2'>
                        <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                          Animais de Estimação
                        </label>
                        <input
                          type='text'
                          value={profileData.pets}
                          readOnly={!isEditing}
                          onChange={(e) => setProfileData({ ...profileData, pets: e.target.value })}
                          className={getFieldClass(profileData.pets)}
                        />
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Emergency Contact */}
              {config.sections.emergency.status !== 'hidden' && (
                <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden'>
                  <div className='absolute top-0 left-0 w-1 h-full bg-red-500'></div>
                  <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
                    <Activity size={18} className='text-red-500' /> 
                    Contato de Emergência
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                        Nome do Contato
                      </label>
                      <input
                        type='text'
                        value={profileData.emergencyName}
                        readOnly={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, emergencyName: e.target.value })}
                        className={getFieldClass(profileData.emergencyName)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                        Telefone de Emergência
                      </label>
                      <input
                        type='text'
                        value={profileData.emergencyPhone}
                        readOnly={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, emergencyPhone: e.target.value })}
                        className={getFieldClass(profileData.emergencyPhone)}
                      />
                    </div>
                  </div>
                </section>
              )}
            </form>
          </div>
        )}

        {/* --- DOCUMENTATION TAB --- */}
        {activeTab === 'documents' && (
          <div className='animate-fadeIn pb-8 space-y-8'>
            {/* 1. Property Docs */}
            <section>
              <div className='px-1 mb-4'>
                <h3 className='font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-widest'>
                  <Key className='text-primary' size={20} /> Documentos do Imóvel
                </h3>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
                  Compartilhado pelo proprietário
                </p>
              </div>
              <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm'>
                {[
                  { id: 'contract', name: 'Contrato de Locação Assinado', icon: FileCheck, date: '10/01/2024', active: config.sections.sharedDocs.contract },
                  { id: 'inspection', name: 'Laudo de Vistoria de Entrada', icon: Camera, date: '08/01/2024', active: config.sections.sharedDocs.inspection },
                  { id: 'rules', name: 'Regimento Interno do Condomínio', icon: Shield, date: '01/01/2024', active: config.sections.sharedDocs.rules },
                ].filter(doc => doc.active).map((doc, i) => (
                  <div
                    key={doc.id}
                    className='flex items-center justify-between p-5 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='p-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 group-hover:text-primary transition-colors'>
                        <doc.icon size={22} />
                      </div>
                      <div>
                        <span className='text-sm font-black text-slate-800 dark:text-slate-200 block mb-0.5'>
                          {doc.name}
                        </span>
                        <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
                          Disponível desde {doc.date}
                        </span>
                      </div>
                    </div>
                    <button className='p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-white/10 transition-all'>
                      <Download size={22} />
                    </button>
                  </div>
                ))}

                {/* Custom Shared Docs */}
                {config.sections.sharedDocs.custom.filter(doc => doc.active).map((doc, i) => (
                  <div
                    key={doc.id}
                    className='flex items-center justify-between p-5 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='p-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 group-hover:text-primary transition-colors'>
                        <FileCheck size={22} />
                      </div>
                      <div>
                        <span className='text-sm font-black text-slate-800 dark:text-slate-200 block mb-0.5'>
                          {doc.label}
                        </span>
                        <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
                          Documento Complementar
                        </span>
                      </div>
                    </div>
                    <button className='p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-white/10 transition-all'>
                      <Download size={22} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* SEPARATOR */}
            <div className='h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent my-10'></div>

            {/* 2. Personal Docs */}
            <section>
              <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 px-1 text-sm uppercase tracking-widest'>
                <FileText className='text-indigo-500' size={20} /> Meus Documentos
              </h3>
              <div className='grid gap-4'>
                {[
                  { id: 'id_card', label: 'RG ou CNH', desc: 'Frente e Verso', status: config.sections.requiredDocs.id_card },
                  { id: 'income', label: 'Comprovante de Renda', desc: 'Holerite ou Extrato', status: config.sections.requiredDocs.income },
                  { id: 'residence', label: 'Comp. de Residência', desc: 'Conta de luz/água', status: config.sections.requiredDocs.residence },
                  { id: 'guarantee', label: 'Apólice / Garantia', desc: 'Doc. do seguro fiança', status: config.sections.requiredDocs.guarantee },
                ].filter(doc => doc.status !== 'hidden').map((doc) => {
                  const docState = documents[doc.id] || { status: 'pending', date: null };
                  return (
                    <div
                      key={doc.id}
                      className='bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/20'
                    >
                      <div className='flex items-center gap-4'>
                        <div className={`p-3 rounded-xl ${docState.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'} dark:bg-opacity-10`}>
                          <FileText size={22} />
                        </div>
                        <div>
                          <h4 className='text-sm font-black text-slate-900 dark:text-white leading-tight mb-0.5'>
                            {doc.label}
                          </h4>
                          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                            {doc.desc}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-4 ml-auto md:ml-0'>
                        {docState.date && (
                          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline'>
                            Enviado em {docState.date}
                          </span>
                        )}
                        {getStatusBadge(docState.status, doc.status as RequirementStatus)}
                        <div className='flex flex-col items-center gap-1'>
                          <button
                            onClick={() => handleDocUpload(doc.id)}
                            className='p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all active:scale-95'
                          >
                            <Upload size={20} />
                          </button>
                          <span className='text-[9px] font-bold text-slate-400 uppercase'>PDF ou imagem, máx. 5MB</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Required Docs */}
                {config.sections.requiredDocs.custom.filter(doc => doc.status !== 'hidden').map((doc) => {
                  const docState = documents[doc.id] || { status: 'pending', date: null };
                  return (
                    <div
                      key={doc.id}
                      className='bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/20'
                    >
                      <div className='flex items-center gap-4'>
                        <div className={`p-3 rounded-xl ${docState.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'} dark:bg-opacity-10`}>
                          <FileText size={22} />
                        </div>
                        <div>
                          <h4 className='text-sm font-black text-slate-900 dark:text-white leading-tight mb-0.5'>
                            {doc.label}
                          </h4>
                          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                            {doc.description || 'Documento exigido'}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-4 ml-auto md:ml-0'>
                        {docState.date && (
                          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline'>
                            Enviado em {docState.date}
                          </span>
                        )}
                        {getStatusBadge(docState.status, doc.status as RequirementStatus)}
                        <div className='flex flex-col items-center gap-1'>
                          <button
                            onClick={() => handleDocUpload(doc.id)}
                            className='p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all active:scale-95'
                          >
                            <Upload size={20} />
                          </button>
                          <span className='text-[9px] font-bold text-slate-400 uppercase'>PDF ou imagem, máx. 5MB</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'preferences' && (
          <div className='animate-fadeIn pb-8 space-y-8'>
            {/* Notifications */}
            <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5'>
              <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
                <Bell size={18} className='text-primary' /> Central de Notificações
              </h3>
              <div className='space-y-6'>
                {[
                  { id: 'emailNotif', label: 'Notificações por E-mail', desc: 'Receba alertas importantes no seu inbox.' },
                  { id: 'whatsappNotif', label: 'Notificações por WhatsApp', desc: 'Alertas rápidos e lembretes no seu celular.' },
                  { id: 'condoAlerts', label: 'Avisos do Condomínio', desc: 'Seja avisado sobre reuniões e manutenções.' },
                ].map((item) => (
                  <div key={item.id} className='flex items-center justify-between group'>
                    <div>
                      <p className='text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors'>
                        {item.label}
                      </p>
                      <p className='text-xs text-slate-500 font-medium'>{item.desc}</p>
                    </div>
                    <label className='relative inline-flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        className='sr-only peer'
                        checked={(preferences as any)[item.id]}
                        onChange={() => setPreferences({ ...preferences, [item.id]: !(preferences as any)[item.id] })}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}

                <div className='flex items-center justify-between group pt-4 border-t border-gray-50 dark:border-white/5'>
                  <div>
                    <p className='text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors'>
                      Lembrete de Pagamento
                    </p>
                    <div className='flex items-center gap-2 mt-0.5'>
                      <span className='text-xs text-slate-500 font-medium'>Aviso</span>
                      <div className='relative'>
                        <button 
                          onClick={() => setShowReminderSelect(!showReminderSelect)}
                          className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all'
                        >
                          {preferences.reminderDays} antes <ChevronDown size={12} />
                        </button>
                        {showReminderSelect && (
                          <div className='absolute top-full left-0 mt-2 w-32 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-xl shadow-xl z-30 py-1 animate-scaleUp'>
                            {['3 dias', '5 dias', '7 dias', '10 dias'].map((days) => (
                              <button
                                key={days}
                                onClick={() => handleReminderChange(days)}
                                className='w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors'
                              >
                                {days}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      className='sr-only peer'
                      checked={preferences.paymentReminder}
                      onChange={() => setPreferences({ ...preferences, paymentReminder: !preferences.paymentReminder })}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5'>
              <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
                <Lock size={18} className='text-amber-500' /> Segurança e Privacidade
              </h3>
              <div className='space-y-6'>
                <div className='flex items-center justify-between group'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500'>
                      <Key size={20} />
                    </div>
                    <div>
                      <p className='text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors'>
                        Alterar Senha
                      </p>
                      <div className='flex items-center gap-2'>
                        {new Date().getTime() - profileData.lastPasswordChange.getTime() > 1000 * 60 * 60 * 24 * 30 * 6 ? (
                          <div className='flex items-center gap-1.5 text-amber-500 group/tooltip relative'>
                            <AlertCircle size={14} />
                            <span className='text-[10px] font-bold uppercase tracking-widest'>Recomendamos alterar</span>
                            <div className='absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-40 shadow-xl'>
                              Recomendamos alterar sua senha a cada 6 meses por segurança.
                            </div>
                          </div>
                        ) : (
                          <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Última alteração há 3 meses</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className='px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all'>
                    Atualizar
                  </button>
                </div>

                <div className='flex items-center justify-between group pt-4 border-t border-gray-50 dark:border-white/5'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500'>
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className='text-sm font-black text-slate-800 dark:text-slate-200'>
                        Autenticação em Duas Etapas
                      </p>
                      <p className='text-xs text-slate-500 font-medium'>Proteção extra para sua conta.</p>
                    </div>
                  </div>
                  <button className='px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all'>
                    Ativar 2FA
                  </button>
                </div>
              </div>
            </section>

            {/* Account Management */}
            <div className='flex justify-between items-center px-2'>
              <button className='text-xs font-black text-rose-500 uppercase tracking-widest hover:underline'>
                Excluir minha conta
              </button>
              <button className='flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all'>
                <LogOut size={16} /> Sair da Conta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantProfile;
