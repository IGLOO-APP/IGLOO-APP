import React from 'react';
import { User, Star, Car, Briefcase, Activity, AlertCircle, CheckCircle, Building2, Heart, BookOpen } from 'lucide-react';
import { TenantProfileConfig } from '../../../types';

interface ProfileTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profileData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setProfileData: React.Dispatch<React.SetStateAction<any>>;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  config: TenantProfileConfig;
  pendingItems: { id: string; label: string; tab: string; section?: string }[];
  completionPercent: number;
  getFieldClass: (value: string) => string;
  handleSaveProfile: (e?: React.FormEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setActiveTab: (tab: any) => void;
  calculateTimeAtCompany?: () => string;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profileData,
  setProfileData,
  isEditing,
  setIsEditing,
  config,
  pendingItems,
  completionPercent,
  getFieldClass,
  handleSaveProfile,
  setActiveTab,
  calculateTimeAtCompany,
}) => {
  return (
    <div className='animate-fadeIn pb-8 space-y-6'>
      {/* AI Score Insights Card */}
      <div className='bg-slate-900 dark:bg-surface-dark rounded-3xl p-6 text-white shadow-xl relative overflow-hidden'>
        <div className='absolute right-0 top-0 p-6 opacity-10'>
          <Star size={120} />
        </div>
        <div className='relative z-10'>
          <div className='flex justify-between items-start mb-6'>
            <div>
              <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2'>
                Seu Score IGLOO
              </p>
              <h3 className='text-5xl font-black flex items-center gap-2 tracking-tighter'>
                95<span className='text-xl text-slate-500 font-bold'>/100</span>
              </h3>
            </div>
            <div className='text-right'>
              <span className='px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest'>
                Nível Elite
              </span>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 pt-4 border-t border-white/10'>
            <div className='flex flex-col'>
              <span className='text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1'>
                Pontualidade
              </span>
              <span className='text-sm font-bold text-emerald-400'>Exemplar</span>
            </div>
            <div className='flex flex-col text-right'>
              <span className='text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1'>
                Conservação
              </span>
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
          <h4 className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest'>
            Status do Perfil
          </h4>
          <span
            className={`text-xs font-bold ${completionPercent === 100 ? 'text-emerald-500' : 'text-primary'}`}
          >
            {completionPercent}% Concluído
          </span>
        </div>
        <div className='h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-6'>
          <div
            className={`h-full transition-all duration-1000 ${completionPercent === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        {pendingItems.length > 0 ? (
          <div className='space-y-3'>
            <p className='text-[11px] text-slate-500 font-bold uppercase tracking-tight'>
              Ações pendentes para 100%:
            </p>
            <div className='flex flex-wrap gap-2'>
              {pendingItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <p className='text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight'>
              Perfil completo e verificado!
            </p>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSaveProfile} className='space-y-6'>
        {/* Tipo de Cadastro PF/PJ */}
        {config.sections.personal.occupation !== 'hidden' && (
          <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                Tipo de Cadastro
              </label>
              <div className='flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl'>
                {(['pf', 'pj'] as const).map((t) => (
                  <button
                    key={t}
                    type='button'
                    disabled={!isEditing}
                    onClick={() => setProfileData({ ...profileData, tenantType: t })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      profileData.tenantType === t
                        ? 'bg-white dark:bg-surface-dark text-primary shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    } ${!isEditing ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
                  >
                    {t === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

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
                Telefone / Celular
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
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                RG / CNH
              </label>
              <input
                type='text'
                value={profileData.rg}
                readOnly={!isEditing}
                onChange={(e) => setProfileData({ ...profileData, rg: e.target.value })}
                className={getFieldClass(profileData.rg)}
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                Data de Nascimento
              </label>
              <input
                type='date'
                value={profileData.birthDate}
                readOnly={!isEditing}
                onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                className={getFieldClass(profileData.birthDate)}
              />
            </div>
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
                <option value=''>Selecione...</option>
                <option value='solteiro'>Solteiro(a)</option>
                <option value='casado'>Casado(a)</option>
                <option value='separado'>Separado(a)</option>
                <option value='divorciado'>Divorciado(a)</option>
                <option value='viuvo'>Viúvo(a)</option>
              </select>
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                Nº de Ocupantes (Moradores)
              </label>
              <input
                type='number'
                value={profileData.residentsCount}
                readOnly={!isEditing}
                onChange={(e) => setProfileData({ ...profileData, residentsCount: e.target.value })}
                className={getFieldClass(profileData.residentsCount)}
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                Tem animais?
              </label>
              <select
                disabled={!isEditing}
                value={profileData.hasPets}
                onChange={(e) => setProfileData({ ...profileData, hasPets: e.target.value })}
                className={getFieldClass(profileData.hasPets)}
              >
                <option value='Não'>Não</option>
                <option value='Sim'>Sim</option>
              </select>
            </div>
            {profileData.hasPets === 'Sim' && (
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Especificação dos Animais
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

        {/* PF content / PJ content */}
        {profileData.tenantType === 'pj' ? (
          /* PJ: Dados da Empresa */
          <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-1 h-full bg-amber-500'></div>
            <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
              <Building2 size={18} className='text-amber-500' />
              Dados da Empresa
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2 md:col-span-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Razão Social
                </label>
                <input
                  type='text'
                  value={profileData.companyLegalName}
                  readOnly={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, companyLegalName: e.target.value })}
                  className={getFieldClass(profileData.companyLegalName)}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Nome Fantasia <span className='text-slate-300'>(opcional)</span>
                </label>
                <input
                  type='text'
                  value={profileData.companyTradeName}
                  readOnly={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, companyTradeName: e.target.value })}
                  className={getFieldClass(profileData.companyTradeName)}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  CNPJ
                </label>
                <input
                  type='text'
                  value={profileData.company_cnpj}
                  readOnly={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, company_cnpj: e.target.value })}
                  className={getFieldClass(profileData.company_cnpj)}
                  placeholder='00.000.000/0000-00'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Inscrição Estadual/Municipal <span className='text-slate-300'>(opcional)</span>
                </label>
                <input
                  type='text'
                  value={profileData.companyStateRegistration}
                  readOnly={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, companyStateRegistration: e.target.value })}
                  className={getFieldClass(profileData.companyStateRegistration)}
                />
              </div>
              <div className='space-y-2 md:col-span-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Endereço da Empresa
                </label>
                <input
                  type='text'
                  value={profileData.company_address}
                  readOnly={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, company_address: e.target.value })}
                  className={getFieldClass(profileData.company_address)}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Renda Mensal da Empresa
                </label>
                <input
                  type='text'
                  value={profileData.monthlyIncome}
                  readOnly={!isEditing}
                  onChange={(e) => setProfileData({ ...profileData, monthlyIncome: e.target.value })}
                  className={getFieldClass(profileData.monthlyIncome)}
                />
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Endereço Atual — expanded address fields */}
            <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden'>
              <div className='absolute top-0 left-0 w-1 h-full bg-emerald-500'></div>
              <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
                <Car size={18} className='text-emerald-500' />
                Endereço Atual
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    CEP
                  </label>
                  <input
                    type='text'
                    value={profileData.cep}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, cep: e.target.value })}
                    className={getFieldClass(profileData.cep)}
                    placeholder='00000-000'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Rua
                  </label>
                  <input
                    type='text'
                    value={profileData.street}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                    className={getFieldClass(profileData.street)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Número
                  </label>
                  <input
                    type='text'
                    value={profileData.streetNumber}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, streetNumber: e.target.value })}
                    className={getFieldClass(profileData.streetNumber)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Complemento <span className='text-slate-300'>(opcional)</span>
                  </label>
                  <input
                    type='text'
                    value={profileData.complement}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, complement: e.target.value })}
                    className={getFieldClass(profileData.complement)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Bairro
                  </label>
                  <input
                    type='text'
                    value={profileData.neighborhood}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, neighborhood: e.target.value })}
                    className={getFieldClass(profileData.neighborhood)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Cidade
                  </label>
                  <input
                    type='text'
                    value={profileData.city}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className={getFieldClass(profileData.city)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    UF
                  </label>
                  <input
                    type='text'
                    value={profileData.state}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    className={getFieldClass(profileData.state)}
                    maxLength={2}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Tempo de Residência
                  </label>
                  <input
                    type='text'
                    value={profileData.residenceTime}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, residenceTime: e.target.value })}
                    className={getFieldClass(profileData.residenceTime)}
                    placeholder='Ex: 3 anos'
                  />
                </div>
              </div>
            </section>

            {/* Vínculo Empregatício */}
            <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden'>
              <div className='absolute top-0 left-0 w-1 h-full bg-purple-500'></div>
              <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
                <Briefcase size={18} className='text-purple-500' />
                Vínculo Empregatício
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Nome da Empresa
                  </label>
                  <input
                    type='text'
                    value={profileData.employer}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, employer: e.target.value })}
                    className={getFieldClass(profileData.employer)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    CNPJ da Empresa <span className='text-slate-300'>(opcional)</span>
                  </label>
                  <input
                    type='text'
                    value={profileData.company_cnpj}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, company_cnpj: e.target.value })}
                    className={getFieldClass(profileData.company_cnpj)}
                    placeholder='00.000.000/0000-00'
                  />
                </div>
                <div className='space-y-2 md:col-span-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Endereço da Empresa
                  </label>
                  <input
                    type='text'
                    value={profileData.company_address}
                    readOnly={!isEditing}
                    onChange={(e) =>
                      setProfileData({ ...profileData, company_address: e.target.value })
                    }
                    className={getFieldClass(profileData.company_address)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Cargo
                  </label>
                  <input
                    type='text'
                    value={profileData.occupation}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                    className={getFieldClass(profileData.occupation)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Salário / Renda Mensal
                  </label>
                  <input
                    type='text'
                    value={profileData.monthlyIncome}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, monthlyIncome: e.target.value })}
                    className={getFieldClass(profileData.monthlyIncome)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Data de Admissão
                  </label>
                  <input
                    type='date'
                    value={profileData.admission_date}
                    readOnly={!isEditing}
                    onChange={(e) => setProfileData({ ...profileData, admission_date: e.target.value })}
                    className={getFieldClass(profileData.admission_date)}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Tempo de Empresa
                  </label>
                  <div
                    className={`flex items-center h-[48px] px-4 rounded-xl border text-sm font-bold bg-slate-50 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-400 ${isEditing ? 'border-primary/30' : ''}`}
                  >
                    {calculateTimeAtCompany
                      ? calculateTimeAtCompany()
                      : profileData.admission_date
                        ? 'Calculando...'
                        : '—'}
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                    Tipo de Vínculo
                  </label>
                  <select
                    disabled={!isEditing}
                    value={profileData.employmentType}
                    onChange={(e) => setProfileData({ ...profileData, employmentType: e.target.value })}
                    className={getFieldClass(profileData.employmentType)}
                  >
                    <option>CLT</option>
                    <option>Autônomo</option>
                    <option>Empresário / PJ</option>
                    <option>Aposentado / Pensionista</option>
                    <option>Outros</option>
                  </select>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Cônjuge — only shown for PF when casado */}
        {profileData.tenantType !== 'pj' && profileData.maritalStatus === 'casado' && (
          <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-1 h-full bg-pink-500'></div>
            <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
              <Heart size={18} className='text-pink-500' />
              Cônjuge
            </h3>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Possui cônjuge?
                </label>
                <select
                  disabled={!isEditing}
                  value={profileData.hasSpouse}
                  onChange={(e) => setProfileData({ ...profileData, hasSpouse: e.target.value })}
                  className={getFieldClass(profileData.hasSpouse)}
                >
                  <option value='Não'>Não</option>
                  <option value='Sim'>Sim</option>
                </select>
              </div>
              {profileData.hasSpouse === 'Sim' && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100 dark:border-white/10'>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Nome Completo
                    </label>
                    <input
                      type='text'
                      value={profileData.spouseName}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, spouseName: e.target.value })}
                      className={getFieldClass(profileData.spouseName)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      CPF
                    </label>
                    <input
                      type='text'
                      value={profileData.spouseCpf}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, spouseCpf: e.target.value })}
                      className={getFieldClass(profileData.spouseCpf)}
                      placeholder='000.000.000-00'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      RG
                    </label>
                    <input
                      type='text'
                      value={profileData.spouseRg}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, spouseRg: e.target.value })}
                      className={getFieldClass(profileData.spouseRg)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Data de Nascimento
                    </label>
                    <input
                      type='date'
                      value={profileData.spouseBirthDate}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, spouseBirthDate: e.target.value })}
                      className={getFieldClass(profileData.spouseBirthDate)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Telefone
                    </label>
                    <input
                      type='text'
                      value={profileData.spousePhone}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, spousePhone: e.target.value })}
                      className={getFieldClass(profileData.spousePhone)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Profissão
                    </label>
                    <input
                      type='text'
                      value={profileData.spouseOccupation}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, spouseOccupation: e.target.value })}
                      className={getFieldClass(profileData.spouseOccupation)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Renda Mensal
                    </label>
                    <input
                      type='text'
                      value={profileData.spouseIncome}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, spouseIncome: e.target.value })}
                      className={getFieldClass(profileData.spouseIncome)}
                      placeholder='R$ 0,00'
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Referências — only shown for PF */}
        {profileData.tenantType !== 'pj' && (
          <section className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-1 h-full bg-indigo-500'></div>
            <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
              <BookOpen size={18} className='text-indigo-500' />
              Referências
            </h3>
            <div className='space-y-6'>
              <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10'>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3'>
                  Referência Bancária <span className='text-slate-300'>(opcional)</span>
                </p>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Banco
                    </label>
                    <input
                      type='text'
                      value={profileData.refBankName}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, refBankName: e.target.value })}
                      className={getFieldClass(profileData.refBankName)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Agência
                    </label>
                    <input
                      type='text'
                      value={profileData.refBankAgency}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, refBankAgency: e.target.value })}
                      className={getFieldClass(profileData.refBankAgency)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                      Conta
                    </label>
                    <input
                      type='text'
                      value={profileData.refBankAccount}
                      readOnly={!isEditing}
                      onChange={(e) => setProfileData({ ...profileData, refBankAccount: e.target.value })}
                      className={getFieldClass(profileData.refBankAccount)}
                    />
                  </div>
                </div>
              </div>
              <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10'>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3'>
                  Referências Pessoais <span className='text-slate-300'>(opcional)</span>
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-3'>
                    <p className='text-[9px] font-bold text-slate-400 uppercase tracking-wider'>Referência 1</p>
                    <div className='space-y-2'>
                      <input
                        type='text'
                        value={profileData.refPersonal1Name}
                        readOnly={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, refPersonal1Name: e.target.value })}
                        placeholder='Nome'
                        className={getFieldClass(profileData.refPersonal1Name)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <input
                        type='text'
                        value={profileData.refPersonal1Phone}
                        readOnly={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, refPersonal1Phone: e.target.value })}
                        placeholder='Telefone'
                        className={getFieldClass(profileData.refPersonal1Phone)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <input
                        type='text'
                        value={profileData.refPersonal1Relation}
                        readOnly={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, refPersonal1Relation: e.target.value })}
                        placeholder='Relação (amigo, parente...)'
                        className={getFieldClass(profileData.refPersonal1Relation)}
                      />
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <p className='text-[9px] font-bold text-slate-400 uppercase tracking-wider'>Referência 2</p>
                    <div className='space-y-2'>
                      <input
                        type='text'
                        value={profileData.refPersonal2Name}
                        readOnly={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, refPersonal2Name: e.target.value })}
                        placeholder='Nome'
                        className={getFieldClass(profileData.refPersonal2Name)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <input
                        type='text'
                        value={profileData.refPersonal2Phone}
                        readOnly={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, refPersonal2Phone: e.target.value })}
                        placeholder='Telefone'
                        className={getFieldClass(profileData.refPersonal2Phone)}
                      />
                    </div>
                    <div className='space-y-2'>
                      <input
                        type='text'
                        value={profileData.refPersonal2Relation}
                        readOnly={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, refPersonal2Relation: e.target.value })}
                        placeholder='Relação (amigo, parente...)'
                        className={getFieldClass(profileData.refPersonal2Relation)}
                      />
                    </div>
                  </div>
                </div>
              </div>
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
                  onChange={(e) =>
                    setProfileData({ ...profileData, emergencyName: e.target.value })
                  }
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
                  onChange={(e) =>
                    setProfileData({ ...profileData, emergencyPhone: e.target.value })
                  }
                  className={getFieldClass(profileData.emergencyPhone)}
                />
              </div>
            </div>
          </section>
        )}
      </form>
    </div>
  );
};
