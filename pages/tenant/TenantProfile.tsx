import React from 'react';
import { User, FileText, Shield, Edit2, Save, Clock, Camera } from 'lucide-react';
import { useTenantProfile } from './hooks/useTenantProfile';
import { ProfileTab } from './sections/ProfileTab';
import { DocumentsTab } from './sections/DocumentsTab';
import { PreferencesTab } from './sections/PreferencesTab';

const TenantProfile: React.FC = () => {
  const {
    profileData,
    setProfileData,
    preferences,
    setPreferences,
    documents,
    config,
    fileInputRef,
    avatarInputRef,
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
    spouse,
  } = useTenantProfile();

  return (
    <div className='flex flex-col h-full p-6'>
      {/* Hidden inputs for uploads */}
      <input type='file' ref={fileInputRef} onChange={onFileSelected} className='hidden' />
      <input type='file' ref={avatarInputRef} onChange={handleAvatarChange} className='hidden' />

      {/* --- COMPACT HORIZONTAL HEADER --- */}
      <div className='lg-card lg-card-lift p-6 sticky top-0 z-30'>
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
                    <Camera size={16} strokeWidth={1.8} className='text-white' />
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
                className='px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-black/10 dark:shadow-none'
              >
                <Edit2 size={14} strokeWidth={1.8} />
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[110px] py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white/10 text-foreground border border-white/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
            >
              <tab.icon size={14} strokeWidth={1.8} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-6 pb-24 space-y-6 scroll-smooth pt-4'>
        {activeTab === 'profile' && (
          <ProfileTab
            profileData={profileData}
            setProfileData={setProfileData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            config={config}
            pendingItems={pendingItems}
            completionPercent={completionPercent}
            getFieldClass={getFieldClass}
            handleSaveProfile={handleSaveProfile}
            setActiveTab={setActiveTab}
            calculateTimeAtCompany={calculateTimeAtCompany}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab
            documents={documents}
            config={config}
            getStatusBadge={getStatusBadge}
            handleDocUpload={handleDocUpload}
            guaranteeType={guaranteeType}
            setGuaranteeType={setGuaranteeType}
            guarantorData={guarantorData}
            setGuarantorData={setGuarantorData}
            guarantorFileIncome={guarantorFileIncome}
            setGuarantorFileIncome={setGuarantorFileIncome}
            guarantorFileResidence={guarantorFileResidence}
            setGuarantorFileResidence={setGuarantorFileResidence}
            isEditing={isEditing}
            maritalStatus={profileData.maritalStatus}
            spouse={spouse}
          />
        )}

        {activeTab === 'preferences' && (
          <PreferencesTab
            preferences={preferences}
            setPreferences={setPreferences}
            profileData={profileData}
            showReminderSelect={showReminderSelect}
            setShowReminderSelect={setShowReminderSelect}
            handleReminderChange={handleReminderChange}
          />
        )}
      </div>
    </div>
  );
};

export default TenantProfile;
