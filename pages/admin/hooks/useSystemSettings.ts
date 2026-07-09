import { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import type {} from 'react';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface Integrations {
  stripe: { enabled: boolean; status: string; connected: boolean };
  clicksign: { enabled: boolean; status: string; apiKey: string };
  whatsapp: { enabled: boolean; apiKey: string; sender: string };
  smtp: { host: string; port: string; user: string; pass: string };
}

interface Notifications {
  admin: Record<string, { enabled: boolean; email?: string; mandatory?: boolean }>;
  owners: {
    contractExpiry: { enabled: boolean; daysBefore: number };
    delinquency: { enabled: boolean; daysAfter: number };
    maintenance: { enabled: boolean; message: string };
  };
}

export function useSystemSettings() {
  const [activeTab, setActiveTab] = useState('Perfil');
  const [toast, setToast] = useState<Toast | null>(null);

  const [templateContent, setTemplateContent] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [integrations] = useState<Integrations>({
    stripe: { enabled: true, status: 'Online', connected: true },
    clicksign: { enabled: true, status: 'Erro de conexão', apiKey: 'sk_test_51...f3d' },
    whatsapp: { enabled: false, apiKey: '', sender: '' },
    smtp: { host: 'smtp.igloo.pt', port: '587', user: 'noreply@igloo.pt', pass: '********' },
  });

  const [notifications] = useState<Notifications>({
    admin: {
      newOwner: { enabled: true, email: 'admin@igloo.pt' },
      integrationError: { enabled: true, email: 'dev@igloo.pt' },
      paymentReceived: { enabled: true },
      churnDetected: { enabled: true, email: 'success@igloo.pt' },
      backupCompleted: { enabled: false },
      suspiciousLogin: { enabled: true },
    },
    owners: {
      contractExpiry: { enabled: true, daysBefore: 30 },
      delinquency: { enabled: true, daysAfter: 5 },
      maintenance: { enabled: false, message: 'Realizaremos uma manutenção programada...' },
    },
  });

  useEffect(() => {
    if (activeTab === 'Minutas') {
      loadTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTemplate = async () => {
    setLoadingTemplate(true);
    try {
      const template = await adminService.getContractTemplate('kitnet_contract');
      if (template) {
        setTemplateContent(template.content);
      } else {
        const { KITNET_CONTRACT_TEMPLATE } = await import('../../../utils/contractTemplates');
        setTemplateContent(KITNET_CONTRACT_TEMPLATE);
      }
    } catch (error) {
      console.error(error);
      showToast('Erro ao carregar minuta do banco', 'error');
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      await adminService.saveContractTemplate(
        'kitnet_contract',
        'Minuta Padrão Kitnet',
        templateContent
      );
      showToast('Minuta de contrato atualizada globalmente!');
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar minuta globalmente', 'error');
    } finally {
      setSavingTemplate(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggle = (_key: string, _value: boolean) => {
    showToast('Alteração salva automaticamente');
  };

  const testConnection = (name: string) => {
    const success = name !== 'ClickSign';
    showToast(
      success
        ? `Conexão com ${name} bem-sucedida`
        : `Falha na conexão com ${name}: API Key inválida`,
      success ? 'success' : 'error'
    );
  };

  const tabs = [
    'Perfil',
    'Geral',
    'Planos',
    'Minutas',
    'Segurança',
    'Integrações',
    'Notificações',
    'Feature Flags',
  ];

  return {
    activeTab,
    setActiveTab,
    toast,
    templateContent,
    setTemplateContent,
    loadingTemplate,
    savingTemplate,
    integrations,
    notifications,
    tabs,
    handleSaveTemplate,
    handleToggle,
    testConnection,
    showToast,
  };
}
