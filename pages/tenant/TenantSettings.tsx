import React, { useState } from 'react';
import { Bell, Moon, Sun, Globe, Lock, Smartphone, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const TenantSettings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    maintenanceUpdates: true,
    newMessages: true,
    announcements: false,
  });

  const [language, setLanguage] = useState('pt-BR');

  const handleSave = () => {
    // Em produção: salvar preferências no perfil do banco
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Personalize sua experiência no Igloo
        </p>
      </div>

      {/* Aparência */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Aparência</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tema da interface</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Claro', icon: <Sun className="w-4 h-4" /> },
            { value: 'dark', label: 'Escuro', icon: <Moon className="w-4 h-4" /> },
            { value: 'system', label: 'Sistema', icon: <Smartphone className="w-4 h-4" /> },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value as any)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                theme === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notificações */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Notificações</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Controle o que você recebe</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: 'paymentReminders', label: 'Lembretes de pagamento', desc: 'Avisos antes do vencimento' },
            { key: 'maintenanceUpdates', label: 'Atualizações de manutenção', desc: 'Progresso dos chamados' },
            { key: 'newMessages', label: 'Novas mensagens', desc: 'Mensagens do proprietário' },
            { key: 'announcements', label: 'Comunicados gerais', desc: 'Avisos do condomínio' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Idioma */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Idioma</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Língua da interface</p>
          </div>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
          <option value="es">Español</option>
        </select>
      </div>

      {/* Segurança */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Segurança</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Conta logada via Clerk</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p><span className="font-medium">E-mail:</span> {user?.email}</p>
          <p><span className="font-medium">Autenticação:</span> Gerenciada pelo Clerk</p>
          <a
            href="https://accounts.clerk.dev/user"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline text-sm mt-2"
          >
            Gerenciar segurança da conta →
          </a>
        </div>
      </div>

      {/* Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Preferências
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TenantSettings;
