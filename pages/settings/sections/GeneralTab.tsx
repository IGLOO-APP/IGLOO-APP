import React from 'react';
import { User, Plus, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

interface GeneralTabProps {
  user: any;
  profileData: {
    name: string;
    email: string;
    phone: string;
    companyName: string;
    avatarUrl: string;
  };
  onProfileDataChange: (d: any) => void;
  isUploadingAvatar: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenUserProfile: () => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  user,
  profileData,
  onProfileDataChange,
  isUploadingAvatar,
  onAvatarUpload,
  onOpenUserProfile,
}) => {
  const update = (field: string, value: string) =>
    onProfileDataChange({ ...profileData, [field]: value });

  return (
    <div className='animate-fadeIn space-y-6 max-w-2xl'>
      <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5'>
        <div className='flex flex-col md:flex-row items-center gap-6 mb-8 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700'>
          <div className='relative'>
            <div className='w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-surface-dark shadow-xl bg-slate-200'>
              {profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt='Avatar'
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-slate-400'>
                  <User size={40} />
                </div>
              )}
            </div>
            <label className='absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform'>
              {isUploadingAvatar ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <Plus size={16} />
              )}
              <input
                type='file'
                className='hidden'
                accept='image/*'
                onChange={onAvatarUpload}
                disabled={isUploadingAvatar}
              />
            </label>
          </div>
          <div className='text-center md:text-left'>
            <h4 className='font-bold text-slate-900 dark:text-white'>Foto de Perfil</h4>
            <p className='text-xs text-slate-500 mt-1'>
              Clique no ícone para alterar sua imagem. Recomendado: 400x400px.
            </p>
          </div>
        </div>
        <div className='space-y-4'>
          <div>
            <label className='text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block'>
              E-mail Principal
            </label>
            <div className='flex gap-2'>
              <input
                value={profileData.email}
                disabled
                className='flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-gray-200 dark:border-gray-800 text-slate-500 outline-none cursor-not-allowed text-sm'
              />
              <button
                onClick={onOpenUserProfile}
                className='px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 dark:text-white'
              >
                Alterar e-mail <ArrowRight size={14} />
              </button>
            </div>
          </div>
          <div>
            <label className='text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block'>
              Nome Completo
            </label>
            <input
              value={profileData.name}
              onChange={(e) => update('name', e.target.value)}
              className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary transition-colors dark:text-white'
            />
          </div>
          {(user?.role === 'owner' || user?.role === 'admin') && (
            <div>
              <label className='text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block'>
                Nome da Empresa / Fantasia
              </label>
              <input
                value={profileData.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary transition-colors dark:text-white'
              />
            </div>
          )}
          <div>
            <label className='text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block'>
              Telefone / WhatsApp
            </label>
            <input
              value={profileData.phone}
              onChange={(e) => update('phone', e.target.value)}
              className='w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-primary transition-colors dark:text-white'
              placeholder='(00) 00000-0000'
            />
          </div>
        </div>
      </div>
      <div className='bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5'>
        <h3 className='font-bold text-slate-900 dark:text-white text-lg mb-4'>Segurança</h3>
        <p className='text-sm text-slate-500 mb-6'>
          Gerencie sua senha, autenticação de dois fatores e sessões ativas.
        </p>
        <button
          onClick={onOpenUserProfile}
          className='flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]'
        >
          <ShieldCheck size={24} />
          <div className='text-left'>
            <p className='text-sm'>Gerenciar Segurança e Senha</p>
            <p className='text-[10px] opacity-70 font-medium'>Proteja sua conta Igloo</p>
          </div>
          <ArrowRight size={18} className='ml-4' />
        </button>
      </div>
    </div>
  );
};
