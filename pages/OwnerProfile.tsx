import React, { useState } from 'react';
import {
  User,
  Building2,
  FileText,
  ShieldCheck,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  Award,
  Clock,
  Camera,
  Save,
  Lock,
  Download,
  UploadCloud,
  MapPin,
  Globe,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OwnerProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'reputation'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Proprietário Demo',
    email: user?.email || 'proprietario@igloo.com',
    phone: '(11) 98888-7777',
    cpf: '123.456.789-00',
    cnpj: '12.345.678/0001-90',
    companyName: 'Igloo Real Estate Ltda',
    bio: 'Investidor imobiliário focado em ativos residenciais de alta liquidez.',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    website: 'www.iglooimoveis.com.br',
    avatar: user?.avatar || 'https://i.pravatar.cc/150?u=owner',
  });

  const [documents] = useState([
    { id: '1', name: 'RG_Frente.pdf', type: 'Identidade', status: 'Verificado', date: '12 Jan 2024' },
    { id: '2', name: 'Comprovante_Endereco.jpg', type: 'Residência', status: 'Verificado', date: '15 Jan 2024' },
    { id: '3', name: 'Contrato_Social.pdf', type: 'Empresa', status: 'Em Análise', date: '20 Mar 2024' },
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  return (
    <div className='flex flex-col h-full w-full max-w-5xl mx-auto bg-background-light dark:bg-background-dark'>
      {/* Header */}
      <header className='sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 py-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center transition-colors'>
        <div className='flex items-center gap-4'>
          <div className='relative group'>
            <div 
              className='w-16 h-16 rounded-2xl bg-cover bg-center border-2 border-white dark:border-surface-dark shadow-md'
              style={{ backgroundImage: `url(${profileData.avatar})` }}
            ></div>
            <button className='absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-lg shadow-lg scale-0 group-hover:scale-100 transition-transform'>
              <Camera size={12} />
            </button>
          </div>
          <div>
            <h1 className='text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
              {profileData.name}
              <div className='flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20'>
                <ShieldCheck size={10} /> Verificado
              </div>
            </h1>
            <p className='text-sm text-slate-500 font-medium'>{profileData.companyName || 'Proprietário Particular'}</p>
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

      {/* Tabs */}
      <div className='px-6 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-white/5'>
        <div className='flex gap-8'>
          {[
            { id: 'profile', label: 'Visão Geral', icon: User },
            { id: 'reputation', label: 'Reputação & Performance', icon: Award },
            { id: 'documents', label: 'Cofre de Documentos', icon: Lock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
            {/* Sidebar Stats */}
            <div className='space-y-6'>
              <div className='bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm'>
                <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4'>Status da Conta</h3>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs font-medium text-slate-500'>Plano Atual</span>
                    <span className='px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase'>Professional</span>
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
                <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4'>Contatos Rápidos</h3>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors'>
                    <div className='p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600'>
                      <Mail size={16} />
                    </div>
                    <div className='truncate'>
                      <p className='text-[10px] font-bold text-slate-400 uppercase'>E-mail</p>
                      <p className='text-xs font-bold dark:text-white truncate'>{profileData.email}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors'>
                    <div className='p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600'>
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className='text-[10px] font-bold text-slate-400 uppercase'>Telefone</p>
                      <p className='text-xs font-bold dark:text-white'>{profileData.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Form Area */}
            <div className='md:col-span-2 space-y-6'>
              <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-6'>
                <div>
                  <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4'>
                    <Building2 size={18} className='text-primary' /> Informações de Gestão
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                      <label className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>Razão Social / Nome PJ</label>
                      <input 
                        disabled={!isEditing}
                        value={profileData.companyName}
                        onChange={e => setProfileData({...profileData, companyName: e.target.value})}
                        className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm font-medium focus:border-primary outline-none transition-all'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <label className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>CNPJ / CPF</label>
                      <input 
                        disabled={!isEditing}
                        value={profileData.cnpj}
                        onChange={e => setProfileData({...profileData, cnpj: e.target.value})}
                        className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm font-medium focus:border-primary outline-none transition-all'
                      />
                    </div>
                    <div className='md:col-span-2 space-y-1.5'>
                      <label className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase'>Endereço de Faturamento</label>
                      <div className='relative'>
                        <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
                        <input 
                          disabled={!isEditing}
                          value={profileData.address}
                          onChange={e => setProfileData({...profileData, address: e.target.value})}
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
                    onChange={e => setProfileData({...profileData, bio: e.target.value})}
                    rows={4}
                    className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm font-medium focus:border-primary outline-none transition-all resize-none'
                    placeholder='Fale um pouco sobre sua atuação como investidor...'
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
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Tempo de Resposta</p>
                <p className='text-2xl font-black text-slate-900 dark:text-white'>1.5h</p>
                <p className='text-[10px] text-emerald-500 font-bold mt-1'>Top 5% da região</p>
              </div>
              <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-center'>
                <div className='w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3'>
                  <TrendingUp size={24} />
                </div>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Taxa de Ocupação</p>
                <p className='text-2xl font-black text-slate-900 dark:text-white'>98%</p>
                <p className='text-[10px] text-slate-500 font-bold mt-1'>Média: 11 meses/ano</p>
              </div>
              <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-center'>
                <div className='w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-3'>
                  <Award size={24} />
                </div>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Avaliação Média</p>
                <p className='text-2xl font-black text-slate-900 dark:text-white'>4.9/5</p>
                <p className='text-[10px] text-slate-500 font-bold mt-1'>Baseado em 12 inquilinos</p>
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
                <h4 className='text-sm font-bold text-slate-900 dark:text-white'>Cofre de Documentos Criptografado</h4>
                <p className='text-xs text-slate-500 mt-1'>Seus documentos são armazenados com criptografia de ponta a ponta.</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {documents.map(doc => (
                <div key={doc.id} className='bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all'>
                  <div className='flex items-center gap-3'>
                    <div className='p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 group-hover:text-primary transition-colors'>
                      <FileText size={24} />
                    </div>
                    <div>
                      <p className='text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]'>{doc.name}</p>
                      <div className='flex items-center gap-2 mt-0.5'>
                        <span className='text-[10px] font-medium text-slate-400'>{doc.type}</span>
                        <span className='w-1 h-1 rounded-full bg-slate-300' />
                        <span className={`text-[10px] font-bold ${doc.status === 'Verificado' ? 'text-emerald-500' : 'text-amber-500'}`}>{doc.status}</span>
                      </div>
                    </div>
                  </div>
                  <button className='p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-slate-400 transition-colors' title='Baixar'>
                    <Download size={18} />
                  </button>
                </div>
              ))}
              <button className='border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary/50 hover:text-primary transition-all group'>
                <div className='p-2 bg-slate-50 dark:bg-white/5 rounded-xl group-hover:bg-primary/10 transition-colors'>
                  <UploadCloud size={24} />
                </div>
                <span className='text-xs font-bold uppercase tracking-widest'>Adicionar Documento</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerProfile;
