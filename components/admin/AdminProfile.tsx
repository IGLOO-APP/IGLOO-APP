import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle2,
  Lock,
  ChevronRight,
  Fingerprint,
  Bell,
  Eye,
  CreditCard,
  Users,
  Settings,
  Megaphone,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar_url || '');

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      setIsUpdating(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          phone,
          avatar_url: avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setSuccess(true);
      setIsUpdating(false);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      console.error('Error updating profile:', err);
      setIsUpdating(false);
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-amber-500 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-amber-500/20 overflow-hidden ring-4 ring-white/10 group-hover:scale-105 transition-transform duration-500">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                name?.charAt(0) || 'A'
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:bg-amber-500 hover:text-white transition-all transform hover:rotate-12 active:scale-95 border-4 border-slate-900">
              <Camera size={18} />
            </button>
          </div>
          
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-black tracking-tight">{name || 'Administrador'}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs font-black uppercase tracking-widest border border-amber-500/30">
                {user?.admin_type === 'super' ? 'Super Admin' : 'Staff Admin'}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                <Mail size={14} /> {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <User size={18} />
              </span>
              Dados Pessoais
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-transparent focus:border-amber-500 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Telefone / WhatsApp</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-transparent focus:border-amber-500 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">URL do Avatar</label>
                <div className="relative group">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-transparent focus:border-amber-500 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  disabled={isUpdating}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                    success 
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                      : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-amber-500'
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Atualizando...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 size={18} /> Salvo com Sucesso
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Lock size={18} />
              </span>
              Segurança
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-surface-dark flex items-center justify-center shadow-sm">
                    <Lock size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Alterar Senha</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atualizada há 2 meses</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-amber-500 transition-all" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-surface-dark flex items-center justify-center shadow-sm">
                    <Fingerprint size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Autenticação em 2 Etapas</h4>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ativado</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-amber-500 transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-amber-500 rounded-[32px] p-8 text-white shadow-xl shadow-amber-500/20">
            <h3 className="text-xl font-black mb-6">Permissões Admin</h3>
            <ul className="space-y-4">
              {[
                { label: 'Gerenciar Usuários', icon: Users },
                { label: 'Ver Relatórios', icon: BarChart3 },
                { label: 'Configurações de Sistema', icon: Settings },
                { label: 'Gerenciar Comunicados', icon: Megaphone }
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                  <item.icon size={16} />
                  <span className="text-xs font-bold tracking-wide">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-amber-500/10 transition-all group">
                <Bell size={18} className="text-slate-400 group-hover:text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Notificações</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-amber-500/10 transition-all group">
                <Eye size={18} className="text-slate-400 group-hover:text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Atividades</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-amber-500/10 transition-all group col-span-2">
                <CreditCard size={18} className="text-slate-400 group-hover:text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Configurar Faturamento</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
