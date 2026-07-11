import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { tenantConfigService, DEFAULT_CONFIG } from '../../../services/tenancy/tenantConfigService';
import { profileService } from '../../../services/profileService';
import { guarantorService } from '../../../services/tenancy/guarantorService';
import { storageService } from '../../../services/storageService';
import { RequirementStatus, Guarantor } from '../../../types';

export const useTenantProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showReminderSelect, setShowReminderSelect] = useState(false);

  const {
    data: config = { propertyId: user?.property_id?.toString() || '101', ...DEFAULT_CONFIG },
  } = useQuery({
    queryKey: ['tenant-config', user?.property_id],
    queryFn: () => tenantConfigService.getConfigForProperty(user?.property_id?.toString() || '101'),
    enabled: !!user?.property_id,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = useQuery<any>({
    queryKey: ['tenant-profile', user?.id],
    queryFn: () => profileService.getById(user!.id!),
    enabled: !!user?.id,
  });

  const { data: guarantor } = useQuery({
    queryKey: ['guarantor', user?.id],
    queryFn: () => guarantorService.getByTenant(user!.id!),
    enabled: !!user?.id,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [currentDocKey, setCurrentDocKey] = useState<string | null>(null);

  const [profileData, setProfileData] = useState(() => ({
    name: user?.name || profile?.name || '',
    email: user?.email || profile?.email || '',
    phone: profile?.phone || '',
    cpf: profile?.cpf || '',
    rg: profile?.rg || '',
    birthDate: '',
    maritalStatus: 'Solteiro(a)',
    residentsCount: '1',
    hasPets: 'Não',
    pets: '',
    occupation: profile?.occupation || '',
    employer: profile?.company_name || '',
    company_cnpj: profile?.company_cnpj || '',
    company_address: profile?.company_address || '',
    monthlyIncome: profile?.monthly_income ? `R$ ${profile.monthly_income.toFixed(2)}` : '',
    employmentType: 'CLT',
    admission_date: profile?.admission_date || '',
    cep: '',
    address: '',
    residenceTime: '',
    vehiclePlate: '',
    residents: '',
    emergencyName: '',
    emergencyPhone: '',
    avatar: user?.avatar || profile?.avatar_url || 'https://i.pravatar.cc/150?u=tenant',
    lastPasswordChange: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 7),
  }));

  useEffect(() => {
    if (profile) {
      setProfileData((prev) => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        cpf: profile.cpf || prev.cpf,
        rg: profile.rg || prev.rg,
        occupation: profile.occupation || prev.occupation,
        employer: profile.company_name || prev.employer,
        company_cnpj: profile.company_cnpj || prev.company_cnpj,
        company_address: profile.company_address || prev.company_address,
        monthlyIncome: profile.monthly_income
          ? `R$ ${profile.monthly_income.toFixed(2)}`
          : prev.monthlyIncome,
        admission_date: profile.admission_date || prev.admission_date,
      }));
    }
  }, [profile]);

  const [guarantorData, setGuarantorData] = useState<Guarantor>({
    tenant_id: user?.id || '',
    name: guarantor?.name || '',
    cpf: guarantor?.cpf || '',
    rg: guarantor?.rg || '',
    phone: guarantor?.phone || '',
    email: guarantor?.email || '',
    income_url: guarantor?.income_url || '',
    income_name: guarantor?.income_name || '',
    residence_url: guarantor?.residence_url || '',
    residence_name: guarantor?.residence_name || '',
  });

  const [guaranteeType, setGuaranteeType] = useState<string>(profile?.guarantee_type || '');
  const [guarantorFileIncome, setGuarantorFileIncome] = useState<File | null>(null);
  const [guarantorFileResidence, setGuarantorFileResidence] = useState<File | null>(null);

  useEffect(() => {
    if (guarantor) {
      setGuarantorData((prev) => ({
        ...prev,
        name: guarantor.name || prev.name,
        cpf: guarantor.cpf || prev.cpf,
        rg: guarantor.rg || prev.rg,
        phone: guarantor.phone || prev.phone,
        email: guarantor.email || prev.email,
        income_url: guarantor.income_url || prev.income_url,
        income_name: guarantor.income_name || prev.income_name,
        residence_url: guarantor.residence_url || prev.residence_url,
        residence_name: guarantor.residence_name || prev.residence_name,
      }));
    }
  }, [guarantor]);

  const [preferences, setPreferences] = useState({
    emailNotif: true,
    whatsappNotif: true,
    paymentReminder: true,
    reminderDays: '5 dias',
    condoAlerts: true,
  });

  const [documents, setDocuments] = useState<
    Record<string, { status: string; date: string | null }>
  >({
    rgFrente: { status: 'pending', date: null },
    rgVerso: { status: 'pending', date: null },
    cpfDoc: { status: 'pending', date: null },
    income: { status: 'pending', date: null },
    residence: { status: 'pending', date: null },
    selfie: { status: 'pending', date: null },
    guarantee: { status: 'pending', date: null },
  });

  useEffect(() => {
    if (profile?.onboarding_documents_urls) {
      const urls = profile.onboarding_documents_urls;
      setDocuments({
        rgFrente: {
          status: urls.rg_url ? 'approved' : 'pending',
          date: urls.rg_url ? new Date().toLocaleDateString() : null,
        },
        rgVerso: {
          status: urls.rg_url ? 'approved' : 'pending',
          date: urls.rg_url ? new Date().toLocaleDateString() : null,
        },
        cpfDoc: { status: profile.cpf ? 'approved' : 'pending', date: null },
        income: {
          status: urls.income_url ? 'approved' : 'pending',
          date: urls.income_url ? new Date().toLocaleDateString() : null,
        },
        residence: {
          status: urls.residence_url ? 'approved' : 'pending',
          date: urls.residence_url ? new Date().toLocaleDateString() : null,
        },
        selfie: { status: 'pending', date: null },
        guarantee: {
          status: urls.guarantee_url ? 'approved' : 'pending',
          date: urls.guarantee_url ? new Date().toLocaleDateString() : null,
        },
      });
    }
  }, [profile?.onboarding_documents_urls, profile?.cpf]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const monthlyIncomeNum = profileData.monthlyIncome
        ? parseFloat(profileData.monthlyIncome.replace(/[R$\s.]/g, '').replace(',', '.'))
        : null;

      await profileService.update(user.id, {
        name: profileData.name,
        phone: profileData.phone,
        cpf: profileData.cpf,
        rg: profileData.rg,
        company_name: profileData.employer,
        company_cnpj: profileData.company_cnpj || null,
        company_address: profileData.company_address || null,
        occupation: profileData.occupation,
        monthly_income: monthlyIncomeNum,
        admission_date: profileData.admission_date || null,
        guarantee_type: guaranteeType || null,
        onboarding_profile_status: 'submitted',
        onboarding_stage: 'documents',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      if (guaranteeType === 'fiador' && guarantorData.name) {
        if (guarantorFileIncome) {
          const incomePath = `${user.id}/guarantor_income_${Date.now()}_${guarantorFileIncome.name}`;
          const incomeUrl = await storageService.uploadFile(
            'tenant-documents',
            incomePath,
            guarantorFileIncome
          );
          if (incomeUrl) {
            guarantorData.income_url = incomeUrl;
            guarantorData.income_name = guarantorFileIncome.name;
          }
        }
        if (guarantorFileResidence) {
          const residencePath = `${user.id}/guarantor_residence_${Date.now()}_${guarantorFileResidence.name}`;
          const residenceUrl = await storageService.uploadFile(
            'tenant-documents',
            residencePath,
            guarantorFileResidence
          );
          if (residenceUrl) {
            guarantorData.residence_url = residenceUrl;
            guarantorData.residence_name = guarantorFileResidence.name;
          }
        }
        await guarantorService.upsert(guarantorData);
      } else if (guaranteeType && guaranteeType !== 'fiador') {
        await guarantorService.delete(user.id);
      }

      queryClient.invalidateQueries({ queryKey: ['tenant-profile', user.id] });
      setIsEditing(false);
      setIsSaving(false);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
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
    }
  };

  const handleReminderChange = (days: string) => {
    setPreferences({ ...preferences, reminderDays: days });
    setShowReminderSelect(false);
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

    if (!profileData.employer)
      items.push({
        id: 'employer',
        label: 'Empresa / Empregador',
        tab: 'profile',
        section: 'personal',
      });
    if (!profileData.admission_date)
      items.push({
        id: 'admission_date',
        label: 'Data de Admissão',
        tab: 'profile',
        section: 'personal',
      });

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
      items.push({ id: 'guarantee', label: 'Garantia Locatícia', tab: 'documents' });

    if (guaranteeType === 'fiador' && !guarantorData.name)
      items.push({ id: 'guarantor', label: 'Nome do Fiador', tab: 'documents' });

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
    count += 2; // employer + admission_date
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
    if (guaranteeType === 'fiador') count++;

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

  const calculateTimeAtCompany = (): string => {
    if (!profileData.admission_date) return '';
    const admission = new Date(profileData.admission_date);
    const now = new Date();
    const diffMs = now.getTime() - admission.getTime();
    const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
    );
    if (diffYears > 0) {
      return `${diffYears} ano${diffYears > 1 ? 's' : ''}${diffMonths > 0 ? ` e ${diffMonths} mes${diffMonths > 1 ? 'es' : ''}` : ''}`;
    }
    return `${diffMonths} mes${diffMonths > 1 ? 'es' : ''}`;
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
    guarantorData,
    setGuarantorData,
    guaranteeType,
    setGuaranteeType,
    guarantorFileIncome,
    setGuarantorFileIncome,
    guarantorFileResidence,
    setGuarantorFileResidence,
    calculateTimeAtCompany,
  };
};
