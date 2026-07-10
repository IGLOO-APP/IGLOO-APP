import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  FileText,
  ShieldCheck,
  TrendingUp,
  Mail,
  Phone,
  Award,
  Clock,
  Camera,
  Save,
  Lock,
  UploadCloud,
  MapPin,
  Loader,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';

const OwnerProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'reputation'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cnpj: '',
    companyName: '',
    bio: '',
    address: '',
    website: '',
    avatar: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const profile = await profileService.getById(user.id);
        if (profile) {
          setProfileData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            cpf: profile.cpf || '',
            cnpj: '',
            companyName: profile.company_name || '',
            bio: '',
            address: '',
            website: '',
            avatar: profile.avatar_url || '',
          });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await profileService.update(user.id, {
        name: profileData.name || null,
        phone: profileData.phone || null,
        cpf: profileData.cpf || null,
        company_name: profileData.companyName || null,
      });
      setIsEditing(false);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader className='animate-spin' size={32} />
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full w-full max-w-5xl mx-auto bg-background-light dark:bg-background-dark'>
      <header className='sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors'>
        <div className='flex items-center gap-4'>
          <div className='relative group'>
            <div
              className='w-16 h-16 rounded-2xl bg-cover bg-center border-2 border-white dark:border-surface-dark shadow-md'
              style={{
                backgroundImage: `url(${profileData.avatar || 'https://i.pravatar.cc/150?u=owner'})`,
              }}
            ></div>
            <button className='absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-lg shadow-lg scale-0 group-hover:scale-100 transition-transform'>
              <Camera size={12} />
            </button>
          </div>
          <div>
            <h1 className='text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
              {profileData.name || 'Proprietário'}
              <div className='flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20'>
                <ShieldCheck size={10} /> Verificado
              </div>
            </h1>
            <p className='text-sm text-slate-500 font-medium'>
              {profileData.companyName || 'Proprietário Particular'}
            </p>
          </div>
        </div>

        <div className='flex gap-3'>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className='px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700'
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className='px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all'
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
                {!isSaving && <Save size={18} />}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className='px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-all'
            >
              Editar Perfil
            </button>
          )}
        </div>
      </header>

      <div className='px-6 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5'>
        <div className='flex gap-8'>
          {[
            { id: 'profile', label: 'Visão Geral', icon: User },
            { id: 'reputation', label: 'Reputação & Performance', icon: Award },
            { id: 'documents', label: 'Cofre de Documentos', icon: Lock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'profile' | 'documents' | 'reputation')}
              className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
        {activeTab === 'profile' && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn'>
            <div className='space-y-6'>
              <div className='bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4'>
                  Status da Conta
                </h3>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs font-medium text-slate-500'>Plano Atual</span>
                    <span className='px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase'>
                      Professional
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs font-medium text-slate-500'>Membro desde</span>
                    <span className='text-xs font-bold dark:text-white'>Jan 2024</span>
                  </div>
                  <hr className='border-slate-50 dark:border-white/5' />
                  <div className='p-3 bg-slate-50 dark:bg-white/5 rounded-xl space-y-2'>
                    <div className='flex justify-between text-[10px] font-bold text-slate-400 uppercase'>
                      <span>Uso de Armazenamento</span>
                      <span>45%</span>
                    </div>
                    <div className='w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                      <div className='h-full bg-primary w-[45%]' />
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4'>
                  Contatos Rápidos
                </h3>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors'>
                    <div className='p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600'>
                      <Mail size={16} />
                    </div>
                    <div className='truncate'>
                      <p className='text-[10px] font-bold text-slate-400 uppercase'>E-mail</p>
                      <p className='text-xs font-bold dark:text-white truncate'>
                        {profileData.email}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors'>
                    <div className='p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600'>
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className='text-[10px] font-bold text-slate-400 uppercase'>Telefone</p>
                      <p className='text-xs font-bold dark:text-white'>
                        {profileData.phone || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='md:col-span-2 space-y-6'>
              <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-6'>
                <div>
                  <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4'>
                    <Building2 size={18} className='text-primary' /> Informações de Gestão
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                      <label className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>
                        Razão Social / Nome PJ
                      </label>
                      <input
                        disabled={!isEditing}
                        value={profileData.companyName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, companyName: e.target.value })
                        }
                        className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm font-medium focus:border-primary outline-none transition-all'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>
                        CNPJ / CPF
                      </label>
                      <input
                        disabled={!isEditing}
                        value={profileData.cpf}
                        onChange={(e) => setProfileData({ ...profileData, cpf: e.target.value })}
                        className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm font-medium focus:border-primary outline-none transition-all'
                      />
                    </div>
                    <div className='md:col-span-2 space-y-1.5'>
                      <label className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>
                        Endereço de Faturamento
                      </label>
                      <div className='relative'>
                        <MapPin
                          className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                          size={16}
                        />
                        <input
                          disabled={!isEditing}
                          value={profileData.address}
                          onChange={(e) =>
                            setProfileData({ ...profileData, address: e.target.value })
                          }
                          placeholder='Endereço não cadastrado'
                          className='w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm font-medium focus:border-primary outline-none transition-all'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className='border-slate-50 dark:border-white/5' />

                <div>
                  <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4'>
                    <FileText size={18} className='text-primary' /> Bio / Apresentação
                  </h3>
                  <textarea
                    disabled={!isEditing}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    placeholder='Fale um pouco sobre sua atuação como investidor...'
                    className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm font-medium focus:border-primary outline-none transition-all resize-none'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reputation' && (
          <div className='space-y-6 animate-fadeIn'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-center'>
                <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-3'>
                  <Clock size={24} />
                </div>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
                  Tempo de Resposta
                </p>
                <p className='text-2xl font-black text-slate-900 dark:text-white'>1.5h</p>
                <p className='text-[10px] text-emerald-500 font-bold mt-1'>Top 5% da região</p>
              </div>
              <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-center'>
                <div className='w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3'>
                  <TrendingUp size={24} />
                </div>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
                  Taxa de Ocupação
                </p>
                <p className='text-2xl font-black text-slate-900 dark:text-white'>98%</p>
                <p className='text-[10px] text-slate-500 font-bold mt-1'>Média: 11 meses/ano</p>
              </div>
              <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-center'>
                <div className='w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-3'>
                  <Award size={24} />
                </div>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
                  Avaliação Média
                </p>
                <p className='text-2xl font-black text-slate-900 dark:text-white'>4.9/5</p>
                <p className='text-[10px] text-slate-500 font-bold mt-1'>
                  Baseado em 12 inquilinos
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className='space-y-6 animate-fadeIn'>
            <div className='bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-start gap-4'>
              <div className='p-2 bg-primary text-white rounded-xl shadow-lg'>
                <Lock size={20} />
              </div>
              <div>
                <h4 className='text-sm font-bold text-slate-900 dark:text-white'>
                  Cofre de Documentos Criptografado
                </h4>
                <p className='text-xs text-slate-500 mt-1'>
                  Seus documentos são armazenados com criptografia de ponta a ponta.
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all'>
                <div className='flex items-center gap-3'>
                  <div className='p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 group-hover:text-primary transition-colors'>
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className='text-sm font-bold text-slate-900 dark:text-white'>
                      Nenhum documento enviado
                    </p>
                    <p className='text-[10px] font-medium text-slate-400'>
                      Faça upload dos seus documentos
                    </p>
                  </div>
                </div>
              </div>
              <button className='border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary/50 hover:text-primary transition-all group'>
                <div className='p-2 bg-slate-50 dark:bg-white/5 rounded-xl group-hover:bg-primary/10 transition-colors'>
                  <UploadCloud size={24} />
                </div>
                <span className='text-xs font-bold uppercase tracking-widest'>
                  Adicionar Documento
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerProfile;
