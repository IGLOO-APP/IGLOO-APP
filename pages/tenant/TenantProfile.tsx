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
    handleCepChange,
    spouse,
  } = useTenantProfile();

  return (
    <div className='flex flex-col h-full overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6'>
      {/* Hidden inputs for uploads */}
      <input type='file' ref={fileInputRef} onChange={onFileSelected} className='hidden' />
      <input type='file' ref={avatarInputRef} onChange={handleAvatarChange} className='hidden' />

      {/* --- CLEAN COMPACT TOP BAR --- */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40'>
        <div className='flex items-center gap-4'>
          <div className='relative group shrink-0'>
            <div
              className={`w-12 h-12 rounded-full border-2 border-primary/20 bg-cover bg-center ${isEditing ? 'cursor-pointer hover:opacity-80' : ''} shadow-md`}
              style={{ backgroundImage: `url("${profileData.avatar}")` }}
              onClick={() => isEditing && avatarInputRef.current?.click()}
            >
              {isEditing && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]'>
                  <Camera size={16} strokeWidth={1.8} className='text-white' />
                </div>
              )}
            </div>
          </div>
          <div>
            <h1 className='text-xl font-bold text-foreground tracking-tight'>
              {profileData.name}
            </h1>
            <p className='text-xs text-muted-foreground font-medium mt-0.5'>
              {profileData.occupation || 'Inquilino Igloo'}
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
                onClick={handleSaveProfile}
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
              <Edit2 size={14} strokeWidth={1.8} />
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      {/* --- STANDARD IGLOO UNDERLINED TABS NAVIGATION --- */}
      <div className='border-b border-border'>
        <div className='flex gap-8 overflow-x-auto hide-scrollbar'>
          {[
            { id: 'profile', label: 'Meus Dados', icon: User },
            { id: 'documents', label: 'Documentação', icon: FileText },
            { id: 'preferences', label: 'Configurações', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(tab.id as any)}
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
            handleCepChange={handleCepChange}
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
