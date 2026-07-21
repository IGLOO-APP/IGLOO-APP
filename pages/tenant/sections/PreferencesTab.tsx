import React from 'react';
import { Bell, ChevronDown, Key, Lock, Shield, AlertCircle, LogOut } from 'lucide-react';

interface PreferencesTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preferences: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profileData: any;
  showReminderSelect: boolean;
  setShowReminderSelect: (v: boolean) => void;
  handleReminderChange: (days: string) => void;
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({
  preferences,
  setPreferences,
  profileData,
  showReminderSelect,
  setShowReminderSelect,
  handleReminderChange,
}) => {
  return (
    <div className='animate-fadeIn pb-8 space-y-8'>
      {/* Notifications */}
      <section className='lg-card lg-card-lift p-6'>
        <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
          <Bell size={18} className='text-primary' /> Central de Notificações
        </h3>
        <div className='space-y-6'>
          {[
            {
              id: 'emailNotif',
              label: 'Notificações por E-mail',
              desc: 'Receba alertas importantes no seu inbox.',
            },
            {
              id: 'whatsappNotif',
              label: 'Notificações por WhatsApp',
              desc: 'Alertas rápidos e lembretes no seu celular.',
            },
            {
              id: 'condoAlerts',
              label: 'Avisos do Condomínio',
              desc: 'Seja avisado sobre reuniões e manutenções.',
            },
          ].map((item) => (
            <div key={item.id} className='flex items-center justify-between group'>
              <div>
                <p className='text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors'>
                  {item.label}
                </p>
                <p className='text-xs text-slate-500 font-medium'>{item.desc}</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='sr-only peer'
                  checked={(preferences as any)[item.id]}
                  onChange={() =>
                    setPreferences({ ...preferences, [item.id]: !(preferences as any)[item.id] })
                  }
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}

          <div className='flex items-center justify-between group pt-4 border-t border-gray-50 dark:border-white/5'>
            <div>
              <p className='text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors'>
                Lembrete de Pagamento
              </p>
              <div className='flex items-center gap-2 mt-0.5'>
                <span className='text-xs text-slate-500 font-medium'>Aviso</span>
                <div className='relative'>
                  <button
                    onClick={() => setShowReminderSelect(!showReminderSelect)}
                    className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all'
                  >
                    {preferences.reminderDays} antes <ChevronDown size={12} />
                  </button>
                  {showReminderSelect && (
                    <div className='absolute top-full left-0 mt-2 w-32 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-xl shadow-xl z-30 py-1 animate-scaleUp'>
                      {['3 dias', '5 dias', '7 dias', '10 dias'].map((days) => (
                        <button
                          key={days}
                          onClick={() => handleReminderChange(days)}
                          className='w-full text-left px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors'
                        >
                          {days}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                className='sr-only peer'
                checked={preferences.paymentReminder}
                onChange={() =>
                  setPreferences({ ...preferences, paymentReminder: !preferences.paymentReminder })
                }
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className='lg-card lg-card-lift p-6'>
        <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-widest'>
          <Lock size={18} className='text-amber-500' /> Segurança e Privacidade
        </h3>
        <div className='space-y-6'>
          <div className='flex items-center justify-between group'>
            <div className='flex items-center gap-4'>
              <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500'>
                <Key size={20} />
              </div>
              <div>
                <p className='text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors'>
                  Alterar Senha
                </p>
                <div className='flex items-center gap-2'>
                  {new Date().getTime() - profileData.lastPasswordChange.getTime() >
                  1000 * 60 * 60 * 24 * 30 * 6 ? (
                    <div className='flex items-center gap-1.5 text-amber-500 group/tooltip relative'>
                      <AlertCircle size={14} />
                      <span className='text-[10px] font-bold uppercase tracking-widest'>
                        Recomendamos alterar
                      </span>
                      <div className='absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-40 shadow-xl'>
                        Recomendamos alterar sua senha a cada 6 meses por segurança.
                      </div>
                    </div>
                  ) : (
                    <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>
                      Última alteração há 3 meses
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button className='px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all'>
              Atualizar
            </button>
          </div>

          <div className='flex items-center justify-between group pt-4 border-t border-gray-50 dark:border-white/5'>
            <div className='flex items-center gap-4'>
              <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500'>
                <Shield size={20} />
              </div>
              <div>
                <p className='text-sm font-black text-slate-800 dark:text-slate-200'>
                  Autenticação em Duas Etapas
                </p>
                <p className='text-xs text-slate-500 font-medium'>Proteção extra para sua conta.</p>
              </div>
            </div>
            <button className='px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all'>
              Ativar 2FA
            </button>
          </div>
        </div>
      </section>

      {/* Account Management */}
      <div className='flex justify-between items-center px-2'>
        <button className='text-xs font-black text-rose-500 uppercase tracking-widest hover:underline'>
          Excluir minha conta
        </button>
        <button className='flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all'>
          <LogOut size={16} /> Sair da Conta
        </button>
      </div>
    </div>
  );
};
