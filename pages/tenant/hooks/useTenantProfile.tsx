import { useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { tenantConfigService } from '../../../services/tenancy/tenantConfigService';
import { TenantProfileConfig, RequirementStatus } from '../../../types';

export const useTenantProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showReminderSelect, setShowReminderSelect] = useState(false);

  const config: TenantProfileConfig = tenantConfigService.getConfigForProperty(
    user?.property_id?.toString() || '101'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [currentDocKey, setCurrentDocKey] = useState<string | null>(null);

  const [profileData, setProfileData] = useState(() => ({
    name: user?.name || 'Inquilino Demo',
    email: user?.email || 'inquilino@exemplo.com',
    phone: '(11) 99876-5432',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    birthDate: '1990-05-15',
    maritalStatus: 'Solteiro(a)',
    residentsCount: '2',
    hasPets: 'Sim',
    pets: '1 Cachorro (Porte Pequeno)',
    occupation: 'Desenvolvedor de Software',
    employer: 'Tech Solutions Ltda',
    monthlyIncome: 'R$ 8.500,00',
    employmentType: 'CLT',
    cep: '01310-100',
    address: 'Av. Paulista, 1000, Apto 121 - São Paulo, SP',
    residenceTime: '2 anos',
    vehiclePlate: '',
    residents: 'Eu e minha esposa',
    emergencyName: 'Maria Silva',
    emergencyPhone: '(11) 99999-9999',
    avatar: user?.avatar || 'https://i.pravatar.cc/150?u=tenant',
    lastPasswordChange: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 7),
  }));

  const [preferences, setPreferences] = useState({
    emailNotif: true,
    whatsappNotif: true,
    paymentReminder: true,
    reminderDays: '5 dias',
    condoAlerts: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [documents, setDocuments] = useState<any>({
    rgFrente: { status: 'approved', date: '10/01/2024' },
    rgVerso: { status: 'approved', date: '10/01/2024' },
    cpfDoc: { status: 'approved', date: '10/01/2024' },
    income: { status: 'pending', date: null },
    residence: { status: 'review', date: '01/03/2024' },
    selfie: { status: 'pending', date: null },
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

  const getPendingItems = () => {
    const items: { id: string; label: string; tab: string; section?: string }[] = [];

    if (!profileData.name)
      items.push({ id: 'name', label: 'Nome Completo', tab: 'profile', section: 'personal' });
    if (!profileData.phone)
      items.push({ id: 'phone', label: 'Telefone', tab: 'profile', section: 'personal' });
    if (!profileData.cpf)
      items.push({ id: 'cpf', label: 'CPF', tab: 'profile', section: 'personal' });

    if (config.sections.personal.occupation === 'required' && !profileData.occupation)
      items.push({ id: 'occupation', label: 'Profissão', tab: 'profile', section: 'personal' });

    if (config.sections.residential.vehicle === 'required' && !profileData.vehiclePlate)
      items.push({ id: 'vehiclePlate', label: 'Veículo', tab: 'profile', section: 'residential' });
    if (config.sections.residential.pets === 'required' && !profileData.pets)
      items.push({ id: 'pets', label: 'Pets', tab: 'profile', section: 'residential' });
    if (config.sections.residential.residents === 'required' && !profileData.residents)
      items.push({ id: 'residents', label: 'Moradores', tab: 'profile', section: 'residential' });

    if (
      config.sections.emergency.status === 'required' &&
      (!profileData.emergencyName || !profileData.emergencyPhone)
    )
      items.push({
        id: 'emergencyName',
        label: 'Contato de Emergência',
        tab: 'profile',
        section: 'emergency',
      });

    if (
      config.sections.requiredDocs.id_card === 'required' &&
      documents.rgFrente.status === 'pending'
    )
      items.push({ id: 'rgFrente', label: 'RG ou CNH (Frente)', tab: 'documents' });
    if (
      config.sections.requiredDocs.id_card === 'required' &&
      documents.rgVerso.status === 'pending'
    )
      items.push({ id: 'rgVerso', label: 'RG ou CNH (Verso)', tab: 'documents' });
    if (documents.cpfDoc.status === 'pending')
      items.push({ id: 'cpfDoc', label: 'Documento CPF', tab: 'documents' });
    if (config.sections.requiredDocs.income === 'required' && documents.income.status === 'pending')
      items.push({ id: 'income', label: 'Comprovante de Renda', tab: 'documents' });
    if (
      config.sections.requiredDocs.residence === 'required' &&
      documents.residence.status === 'pending'
    )
      items.push({ id: 'residence', label: 'Comp. de Residência', tab: 'documents' });
    if (documents.selfie.status === 'pending')
      items.push({ id: 'selfie', label: 'Selfie com Documento', tab: 'documents' });
    if (
      config.sections.requiredDocs.guarantee === 'required' &&
      documents.guarantee.status === 'pending'
    )
      items.push({ id: 'guarantee', label: 'Apólice / Garantia', tab: 'documents' });

    config.sections.requiredDocs.custom.forEach((custom) => {
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

  const getTotalRequiredCount = () => {
    let count = 3;
    if (config.sections.personal.occupation === 'required') count++;
    if (config.sections.residential.vehicle === 'required') count++;
    if (config.sections.residential.pets === 'required') count++;
    if (config.sections.residential.residents === 'required') count++;
    if (config.sections.emergency.status === 'required') count++;
    if (config.sections.requiredDocs.id_card === 'required') count += 2;
    count += 1;
    if (config.sections.requiredDocs.income === 'required') count++;
    if (config.sections.requiredDocs.residence === 'required') count++;
    count += 1;
    if (config.sections.requiredDocs.guarantee === 'required') count++;

    count += config.sections.requiredDocs.custom.filter((c) => c.status === 'required').length;

    return count;
  };

  const totalRequired = getTotalRequiredCount();
  const completionPercent =
    totalRequired > 0
      ? Math.round(((totalRequired - pendingItems.length) / totalRequired) * 100)
      : 100;

  const getStatusBadge = (status: string, requirementStatus: RequirementStatus = 'required') => {
    if (status === 'approved')
      return (
        <span className='min-w-[80px] text-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider'>
          APROVADO
        </span>
      );
    if (status === 'review')
      return (
        <span className='min-w-[80px] text-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider'>
          EM ANÁLISE
        </span>
      );

    if (requirementStatus === 'optional') return null;

    return (
      <span className='min-w-[80px] text-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider'>
        PENDENTE
      </span>
    );
  };

  const getFieldClass = () => {
    return `w-full px-4 py-3 rounded-xl border transition-all text-sm font-bold ${
      isEditing
        ? 'bg-white dark:bg-surface-dark border-primary/30 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white'
        : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400 cursor-default'
    }`;
  };

  return {
    profileData,
    setProfileData,
    preferences,
    setPreferences,
    documents,
    setDocuments,
    config,
    fileInputRef,
    avatarInputRef,
    currentDocKey,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    isSaving,
    setIsSaving,
    showReminderSelect,
    setShowReminderSelect,
    handleSaveProfile,
    handleAvatarChange,
    handleDocUpload,
    onFileSelected,
    handleReminderChange,
    pendingItems,
    totalRequired,
    completionPercent,
    getStatusBadge,
    getFieldClass,
  };
};
