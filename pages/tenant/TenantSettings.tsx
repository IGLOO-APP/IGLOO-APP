import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Globe, Lock, Smartphone, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { notificationService, NotificationPrefs } from '../../services/notificationService';

const TenantSettings: React.FC = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? 'dark' : 'light';
  const setTheme = (val: string) => {
    if ((val === 'dark' && !isDark) || (val === 'light' && isDark)) {
      toggleTheme();
    }
  };
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email_alerts: true,
    sms_alerts: false,
    payment_received: true,
    late_payment: true,
    maintenance_updates: true,
    payment_reminders: true,
    new_messages: true,
    announcements: false,
  });

  const [language, setLanguage] = useState('pt-BR');

  useEffect(() => {
    if (user) {
      notificationService
        .get(user.id)
        .then((prefs) => setNotifications(prefs))
        .catch(() => {});
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await notificationService.save(user.id, notifications);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving notification prefs:', err);
      const { toast } = await import('sonner');
      toast.error('Erro ao salvar preferências.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto px-4 py-8 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Configurações</h1>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
          Personalize sua experiência no Igloo
        </p>
      </div>

      {/* Aparência */}
      <div className='lg-card lg-card-lift p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2.5 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm'>
            <Sun className='w-5 h-5 text-purple-600 dark:text-purple-400' strokeWidth={1.8} />
          </div>
          <div>
            <h2 className='font-semibold text-gray-900 dark:text-white'>Aparência</h2>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Tema da interface</p>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-3'>
          {[
            { value: 'light', label: 'Claro', icon: <Sun className='w-4 h-4' strokeWidth={1.8} /> },
            {
              value: 'dark',
              label: 'Escuro',
              icon: <Moon className='w-4 h-4' strokeWidth={1.8} />,
            },
            {
              value: 'system',
              label: 'Sistema',
              icon: <Smartphone className='w-4 h-4' strokeWidth={1.8} />,
            },
          ].map((opt) => (
            <button
              key={opt.value}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setTheme(opt.value as any)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                theme === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notificações */}
      <div className='lg-card lg-card-lift p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2.5 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm'>
            <Bell className='w-5 h-5 text-blue-600 dark:text-blue-400' strokeWidth={1.8} />
          </div>
          <div>
            <h2 className='font-semibold text-gray-900 dark:text-white'>Notificações</h2>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Controle o que você recebe</p>
          </div>
        </div>

        <div className='space-y-3'>
          {[
            {
              key: 'payment_reminders',
              label: 'Lembretes de pagamento',
              desc: 'Avisos antes do vencimento',
            },
            {
              key: 'maintenance_updates',
              label: 'Atualizações de manutenção',
              desc: 'Progresso dos chamados',
            },
            { key: 'new_messages', label: 'Novas mensagens', desc: 'Mensagens do proprietário' },
            { key: 'announcements', label: 'Comunicados gerais', desc: 'Avisos do condomínio' },
          ].map((item) => (
            <div key={item.key} className='flex items-center justify-between py-2'>
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>{item.label}</p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>{item.desc}</p>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [item.key]: !prev[item.key as keyof typeof prev],
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications]
                    ? 'bg-primary'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Idioma */}
      <div className='lg-card lg-card-lift p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2.5 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm'>
            <Globe className='w-5 h-5 text-green-600 dark:text-green-400' strokeWidth={1.8} />
          </div>
          <div>
            <h2 className='font-semibold text-gray-900 dark:text-white'>Idioma</h2>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Língua da interface</p>
          </div>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className='w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent'
        >
          <option value='pt-BR'>Português (Brasil)</option>
          <option value='en-US'>English (US)</option>
          <option value='es'>Español</option>
        </select>
      </div>

      {/* Segurança */}
      <div className='lg-card lg-card-lift p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2.5 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm'>
            <Lock className='w-5 h-5 text-orange-600 dark:text-orange-400' strokeWidth={1.8} />
          </div>
          <div>
            <h2 className='font-semibold text-gray-900 dark:text-white'>Segurança</h2>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Conta logada via Clerk</p>
          </div>
        </div>
        <div className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
          <p>
            <span className='font-medium'>E-mail:</span> {user?.email}
          </p>
          <p>
            <span className='font-medium'>Autenticação:</span> Gerenciada pelo Clerk
          </p>
          <a
            href='https://accounts.clerk.dev/user'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1 text-primary hover:underline text-sm mt-2'
          >
            Gerenciar segurança da conta →
          </a>
        </div>
      </div>

      {/* Salvar */}
      <div className='flex justify-end'>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saving ? (
            'Salvando...'
          ) : saved ? (
            <>
              <CheckCircle className='w-4 h-4' strokeWidth={1.8} />
              Salvo!
            </>
          ) : (
            <>
              <Save className='w-4 h-4' strokeWidth={1.8} />
              Salvar Preferências
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TenantSettings;
