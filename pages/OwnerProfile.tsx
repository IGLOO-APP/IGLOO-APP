import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { propertyService } from '../services/propertyService';
import { contractService } from '../services/tenancy/contractService';
import { documentService } from '../services/documentService';

interface VaultDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  size?: string;
}

const OwnerProfile: React.FC = () => {
  const { user } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'reputation'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Dynamic Portfolio Metrics State
  const [stats, setStats] = useState({
    totalProperties: 0,
    occupiedProperties: 0,
    activeContracts: 0,
    occupancyRate: 0,
    totalTenants: 0,
  });

  // Vault Documents State
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    companyName: '',
    bio: '',
    address: '',
    avatar: '',
  });

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [profile, properties, contracts, userDocs] = await Promise.all([
          profileService.getById(user.id).catch(() => null),
          propertyService.getAll().catch(() => []),
          contractService.getAll().catch(() => []),
          documentService.getByUser(user.id).catch(() => []),
        ]);

        if (profile) {
          setProfileData({
            name: profile.name || user.name || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
            cpf: profile.cpf || '',
            companyName: profile.company_name || profile.company_cnpj || '',
            bio: ((profile as Record<string, unknown>).occupation as string) || '',
            address: profile.company_address || '',
            avatar: profile.avatar_url || user.avatar || '',
          });
        }

        const totalProps = properties.length;
        const occupiedProps = properties.filter(
          (p) => p.status === 'ALUGADO'
        ).length;
        const activeCount = contracts.filter((c) => c.status === 'active').length;
        const rate = totalProps > 0 ? Math.round((occupiedProps / totalProps) * 100) : 0;

        setStats({
          totalProperties: totalProps,
          occupiedProperties: occupiedProps,
          activeContracts: activeCount,
          occupancyRate: rate,
          totalTenants: activeCount,
        });

        if (userDocs && userDocs.length > 0) {
          setVaultDocs(
            userDocs.map((d) => ({
              id: d.id,
              name: d.name,
              url: d.url || '#',
              uploadedAt: d.uploadDate,
              size: d.size,
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching owner profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
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
        occupation: profileData.bio || null,
        company_address: profileData.address || null,
      });

      const { toast } = await import('sonner');
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving owner profile:', err);
      const { toast } = await import('sonner');
      toast.error('Erro ao salvar as alterações do perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingAvatar(true);
    try {
      const publicUrl = await profileService.uploadAvatar(user.id, file);
      setProfileData((prev) => ({ ...prev, avatar: publicUrl }));
      const { toast } = await import('sonner');
      toast.success('Foto de perfil atualizada!');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      const { toast } = await import('sonner');
      toast.error('Erro ao fazer upload da imagem.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    const { toast } = await import('sonner');
    toast.loading('Enviando documento para o Cofre...', { id: 'vault-upload' });

    try {
      const created = await documentService.uploadVaultDocument(user.id, file);
      if (created) {
        setVaultDocs((prev) => [
          {
            id: created.id,
            name: created.name,
            url: created.url || '#',
            uploadedAt: created.uploadDate,
            size: created.size,
          },
          ...prev,
        ]);
        toast.success('Documento adicionado ao Cofre com sucesso!', { id: 'vault-upload' });
      } else {
        toast.error('Não foi possível salvar o documento.', { id: 'vault-upload' });
      }
    } catch (err) {
      console.error('Error uploading vault document:', err);
      toast.error('Erro ao enviar documento.', { id: 'vault-upload' });
    }
  };

  const handleRemoveDoc = async (id: string) => {
    const { toast } = await import('sonner');
    try {
      const success = await documentService.delete(id);
      if (success) {
        setVaultDocs((prev) => prev.filter((d) => d.id !== id));
        toast.success('Documento removido.');
      } else {
        toast.error('Erro ao remover documento.');
      }
    } catch (err) {
      console.error('Error removing document:', err);
      toast.error('Erro ao remover documento.');
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-full gap-3 p-8'>
        <Loader className='animate-spin text-primary' size={32} />
        <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest'>
          Carregando Perfil...
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full w-full max-w-6xl mx-auto p-4 md:p-8 space-y-6 overflow-y-auto'>
      {/* Hidden file inputs */}
      <input
        type='file'
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        accept='image/*'
        className='hidden'
      />
      <input type='file' ref={docInputRef} onChange={handleDocUpload} className='hidden' />

      {/* --- TOP BAR HEADER --- */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40'>
        <div className='flex items-center gap-4'>
          <div className='relative group shrink-0'>
            <div
              className={`w-14 h-14 rounded-2xl bg-cover bg-center border-2 border-primary/20 shadow-md ${
                isEditing ? 'cursor-pointer hover:opacity-80' : ''
              }`}
              style={{
                backgroundImage: `url(${
                  profileData.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                })`,
              }}
              onClick={() => isEditing && avatarInputRef.current?.click()}
            >
              {isEditing && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]'>
                  {isUploadingAvatar ? (
                    <Loader size={18} className='animate-spin text-white' />
                  ) : (
                    <Camera size={18} strokeWidth={1.8} className='text-white' />
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className='text-xl font-bold text-foreground tracking-tight flex items-center gap-2'>
              {profileData.name || 'Proprietário Igloo'}
              <span className='flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20'>
                <ShieldCheck size={10} /> Verificado
              </span>
            </h1>
            <p className='text-xs text-muted-foreground font-medium mt-0.5'>
              {profileData.companyName || 'Investidor Imobiliário'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 self-end sm:self-auto'>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className='px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted transition-all'
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className='px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95'
              >
                {isSaving ? (
                  <Clock size={14} strokeWidth={1.8} className='animate-spin' />
                ) : (
                  <Save size={14} strokeWidth={1.8} />
                )}
                Salvar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className='px-5 py-2 rounded-xl bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 active:scale-95 shadow-sm'
            >
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      {/* --- STANDARD UNDERLINED TABS --- */}
      <div className='border-b border-border'>
        <div className='flex gap-8 overflow-x-auto hide-scrollbar'>
          {[
            { id: 'profile', label: 'Visão Geral', icon: User },
            { id: 'reputation', label: 'Reputação & Performance', icon: Award },
            { id: 'documents', label: 'Cofre de Documentos', icon: Lock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'profile' | 'documents' | 'reputation')}
              className={`flex items-center gap-2 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-black'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={15} strokeWidth={1.8} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- TAB CONTENT AREA --- */}
      <div className='pb-16 space-y-6 animate-fadeIn'>
        {/* TAB 1: VISÃO GERAL */}
        {activeTab === 'profile' && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-6'>
              {/* Account status card */}
              <div className='lg-card lg-card-lift p-5 space-y-4'>
                <h3 className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2'>
                  Status da Conta
                </h3>
                <div className='space-y-3.5 text-xs'>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground font-medium'>Plano Ativo</span>
                    <span className='px-2.5 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-black uppercase tracking-wider border border-primary/20'>
                      Elite Pro
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground font-medium'>Imóveis Sob Gestão</span>
                    <span className='font-bold text-foreground'>{stats.totalProperties}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground font-medium'>Contratos Ativos</span>
                    <span className='font-bold text-foreground'>{stats.activeContracts}</span>
                  </div>
                  <hr className='border-border/40' />
                  <div className='p-3 bg-muted/40 rounded-xl space-y-2'>
                    <div className='flex justify-between text-[10px] font-bold text-muted-foreground uppercase'>
                      <span>Ocupação do Portfólio</span>
                      <span>{stats.occupancyRate}%</span>
                    </div>
                    <div className='w-full h-1.5 bg-muted rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-emerald-500 rounded-full transition-all duration-500'
                        style={{ width: `${Math.max(5, stats.occupancyRate)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick contacts card */}
              <div className='lg-card lg-card-lift p-5 space-y-4'>
                <h3 className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/40 pb-2'>
                  Contatos Rápidos
                </h3>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/30'>
                    <div className='p-2 bg-blue-500/10 text-blue-500 rounded-lg shrink-0'>
                      <Mail size={16} strokeWidth={1.8} />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[10px] font-bold text-muted-foreground uppercase'>E-mail</p>
                      <p className='text-xs font-bold text-foreground truncate'>
                        {profileData.email}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/30'>
                    <div className='p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0'>
                      <Phone size={16} strokeWidth={1.8} />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-[10px] font-bold text-muted-foreground uppercase'>
                        Telefone
                      </p>
                      <p className='text-xs font-bold text-foreground truncate'>
                        {profileData.phone || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main edit form */}
            <div className='md:col-span-2 space-y-6'>
              <div className='lg-card lg-card-lift p-6 space-y-6'>
                <div>
                  <h3 className='font-bold text-foreground flex items-center gap-2 mb-4 border-b border-border/40 pb-3 text-sm'>
                    <Building2 size={18} className='text-primary' strokeWidth={1.8} />
                    Informações de Gestão
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                      <label className='text-xs font-bold text-muted-foreground uppercase'>
                        Razão Social / Nome PJ
                      </label>
                      <input
                        disabled={!isEditing}
                        value={profileData.companyName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, companyName: e.target.value })
                        }
                        placeholder='Ex: Igloo Imóveis Ltda'
                        className='w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm font-medium focus:border-primary outline-none transition-all disabled:opacity-75'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label className='text-xs font-bold text-muted-foreground uppercase'>
                        CNPJ / CPF
                      </label>
                      <input
                        disabled={!isEditing}
                        value={profileData.cpf}
                        onChange={(e) => setProfileData({ ...profileData, cpf: e.target.value })}
                        placeholder='000.000.000-00'
                        className='w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm font-medium focus:border-primary outline-none transition-all disabled:opacity-75'
                      />
                    </div>
                    <div className='md:col-span-2 space-y-1.5'>
                      <label className='text-xs font-bold text-muted-foreground uppercase'>
                        Endereço de Faturamento
                      </label>
                      <div className='relative'>
                        <MapPin
                          className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                          size={16}
                          strokeWidth={1.8}
                        />
                        <input
                          disabled={!isEditing}
                          value={profileData.address}
                          onChange={(e) =>
                            setProfileData({ ...profileData, address: e.target.value })
                          }
                          placeholder='Av. Paulista, 1000 - São Paulo, SP'
                          className='w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm font-medium focus:border-primary outline-none transition-all disabled:opacity-75'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='font-bold text-foreground flex items-center gap-2 mb-4 border-b border-border/40 pb-3 text-sm'>
                    <FileText size={18} className='text-primary' strokeWidth={1.8} />
                    Bio / Apresentação
                  </h3>
                  <textarea
                    disabled={!isEditing}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    placeholder='Fale um pouco sobre sua atuação como investidor imobiliário...'
                    className='w-full px-4 py-3 rounded-xl bg-muted/40 border border-border text-sm font-medium focus:border-primary outline-none transition-all resize-none disabled:opacity-75'
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REPUTAÇÃO & PERFORMANCE */}
        {activeTab === 'reputation' && (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='lg-card lg-card-lift p-6 text-center space-y-2'>
                <div className='w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-1'>
                  <Clock size={24} strokeWidth={1.8} />
                </div>
                <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
                  Tempo Médio de Resposta
                </p>
                <p className='text-3xl font-black text-foreground'>&lt; 1h</p>
                <span className='inline-block text-[10px] text-emerald-500 font-bold px-2 py-0.5 bg-emerald-500/10 rounded-full'>
                  Excelente agilidade
                </span>
              </div>

              <div className='lg-card lg-card-lift p-6 text-center space-y-2'>
                <div className='w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-1'>
                  <TrendingUp size={24} strokeWidth={1.8} />
                </div>
                <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
                  Taxa de Ocupação Real
                </p>
                <p className='text-3xl font-black text-foreground'>{stats.occupancyRate}%</p>
                <span className='inline-block text-[10px] text-muted-foreground font-bold'>
                  {stats.occupiedProperties} de {stats.totalProperties} imóveis alugados
                </span>
              </div>

              <div className='lg-card lg-card-lift p-6 text-center space-y-2'>
                <div className='w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-1'>
                  <Award size={24} strokeWidth={1.8} />
                </div>
                <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
                  Contratos Ativos
                </p>
                <p className='text-3xl font-black text-foreground'>{stats.activeContracts}</p>
                <span className='inline-block text-[10px] text-muted-foreground font-bold'>
                  {stats.totalTenants} inquilinos ativos
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COFRE DE DOCUMENTOS */}
        {activeTab === 'documents' && (
          <div className='space-y-6'>
            <div className='lg-card p-4 flex items-center justify-between gap-4 border border-primary/20 bg-primary/5'>
              <div className='flex items-center gap-3.5'>
                <div className='p-2.5 bg-primary text-primary-foreground rounded-xl shrink-0 shadow-md'>
                  <Lock size={20} strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className='text-xs font-bold text-foreground uppercase tracking-wider'>
                    Cofre de Documentos Criptografado
                  </h4>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Guarde escrituras, CNH e comprovantes com total privacidade e segurança.
                  </p>
                </div>
              </div>
              <button
                onClick={() => docInputRef.current?.click()}
                className='px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-primary/90 transition-all shrink-0 flex items-center gap-2 active:scale-95'
              >
                <UploadCloud size={16} strokeWidth={1.8} />
                Adicionar Documento
              </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {vaultDocs.map((doc) => (
                <div
                  key={doc.id}
                  className='flex items-center justify-between lg-card lg-card-lift p-4 hover:border-primary/20 transition-all'
                >
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <div className='w-9 h-9 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm flex items-center justify-center text-primary shrink-0'>
                      <FileText size={18} strokeWidth={1.8} />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-xs font-semibold text-foreground truncate'>{doc.name}</p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        {doc.size} • {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-1.5 shrink-0'>
                    <a
                      href={doc.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-8 h-8 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center'
                      title='Visualizar Documento'
                    >
                      <Search size={14} strokeWidth={1.8} />
                    </a>
                    <button
                      onClick={() => handleRemoveDoc(doc.id)}
                      className='w-8 h-8 rounded-lg bg-white/5 text-muted-foreground hover:text-red-500 transition-all flex items-center justify-center'
                      title='Remover Documento'
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => docInputRef.current?.click()}
                className='border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all group min-h-[90px]'
              >
                <div className='p-2.5 bg-muted/40 rounded-xl group-hover:bg-primary/10 transition-colors'>
                  <UploadCloud size={20} strokeWidth={1.8} />
                </div>
                <span className='text-xs font-bold uppercase tracking-widest'>
                  Enviar Novo Arquivo
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
