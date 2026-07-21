import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { tenantService } from '../../../services/tenancy/tenantService';
import { announcementService } from '../../../services/announcementService';
import { inspectionService } from '../../../services/maintenance/inspectionService';
import { useTheme } from '../../../hooks/useTheme';
import { Tenant, Property, SystemAnnouncement, OwnerAnnouncement, PaymentRecord } from '../../../types';
import type { Inspection } from '../../../services/maintenance/inspectionService';

interface OutletCtx {
  isOnboardingRequired: boolean;
  loadingOnboarding: boolean;
  tenantData: Tenant | null;
  pendingInspection: Inspection | null;
  refetchOnboarding: () => Promise<void>;
}

export function useTenantDashboard() {
  const { user, logout } = useAuth();
  const {
    isOnboardingRequired,
    loadingOnboarding,
    refetchOnboarding,
    pendingInspection: contextPendingInspection,
    tenantData: contextTenantData,
  } = useOutletContext<OutletCtx>();

  const { notifications, unreadCount, markAsRead, markAllAsRead, triggerTestNotification } =
    useNotification();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState<Tenant | null>(null);
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'late'>('pending');
  const [copied, setCopied] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showInspection, setShowInspection] = useState(false);
  const [pendingInspection, setPendingInspection] = useState<Inspection | null>(null);

  const currentTenant = contextTenantData || tenantData;

  const tenantProperty = currentTenant
    ? ({
        id: currentTenant.property_id || '',
        name: currentTenant.property || 'Seu Imóvel',
        address: currentTenant.property_address || '',
        status: 'ALUGADO' as const,
        price: `R$ ${currentTenant.contract?.monthly_value?.toLocaleString('pt-BR') || '0,00'}`,
        numeric_price: currentTenant.contract?.monthly_value,
        area: currentTenant.property_details?.area
          ? `${currentTenant.property_details.area}m²`
          : '-- m²',
        bedrooms: currentTenant.property_details?.bedrooms || 0,
        bathrooms: currentTenant.property_details?.bathrooms || 0,
        parking: currentTenant.property_details?.parking || 0,
        image:
          currentTenant.property_image ||
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=300',
        tenant: currentTenant,
        contract: currentTenant.contract
          ? {
              ...currentTenant.contract,
              value: `R$ ${currentTenant.contract.monthly_value.toLocaleString('pt-BR')}`,
            }
          : null,
      } as Property)
    : null;

  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceCopied, setInvoiceCopied] = useState(false);

  const [showCreditCard, setShowCreditCard] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const getDueBadge = (isVertical = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const dueDay = 10;
    const dueDate = new Date(currentYear, currentMonth, dueDay);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const baseClasses = `flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
      isVertical ? 'text-[11px] mt-2 w-fit' : 'text-[10px]'
    }`;

    if (paymentStatus === 'paid') {
      return (
        <span
          className={`${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`}
        >
          <CheckCircle size={12} /> Em dia
        </span>
      );
    }

    if (diffDays > 7) {
      return (
        <span
          className={`${baseClasses} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400`}
        >
          <Clock size={12} /> Vence em {diffDays} dias
        </span>
      );
    } else if (diffDays >= 3 && diffDays <= 7) {
      return (
        <span
          className={`${baseClasses} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`}
        >
          <Clock size={12} /> Vence em {diffDays} dias
        </span>
      );
    } else if (diffDays > 0 && diffDays < 3) {
      return (
        <span
          className={`${baseClasses} bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400`}
        >
          <Clock size={12} /> Vence em {diffDays} dias
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span
          className={`${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`}
        >
          <Clock size={12} /> Vence hoje
        </span>
      );
    } else {
      return (
        <span
          className={`${baseClasses} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`}
        >
          <AlertTriangle size={12} /> Atrasado {Math.abs(diffDays)} dias
        </span>
      );
    }
  };

  const getNoticeBadge = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [day, month] = dateStr.split('/').map(Number);
    const noticeDate = new Date(today.getFullYear(), month - 1, day);
    noticeDate.setHours(0, 0, 0, 0);
    const diffTime = noticeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const baseClasses = 'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider';

    if (diffDays === 0)
      return <span className={`${baseClasses} bg-orange-100 text-orange-600`}>Hoje</span>;
    if (diffDays === 1)
      return <span className={`${baseClasses} bg-orange-100 text-orange-600`}>Amanhã</span>;
    if (diffDays > 1 && diffDays < 4)
      return (
        <span className={`${baseClasses} bg-orange-100 text-orange-600`}>Em {diffDays} dias</span>
      );
    if (diffDays >= 4)
      return (
        <span className={`${baseClasses} bg-slate-100 text-slate-500`}>Em {diffDays} dias</span>
      );
    if (diffDays === -1)
      return <span className={`${baseClasses} bg-slate-100 text-slate-500`}>Ontem</span>;
    return (
      <span className={`${baseClasses} bg-slate-100 text-slate-50`}>
        Há {Math.abs(diffDays)} dias
      </span>
    );
  };

  const getFinancialCardBorder = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDay = tenantData?.contract?.payment_day || 10;
    const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (paymentStatus === 'paid') return 'border-emerald-500/30';
    if (diffDays < 0) return 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
    if (diffDays < 3) return 'border-orange-500/30';
    if (diffDays < 7) return 'border-yellow-500/30';
    return 'border-gray-100 dark:border-gray-800';
  };

  useEffect(() => {
    const abortController = new AbortController();
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await tenantService.getById(user.id.toString());
        if (abortController.signal.aborted) return;
        setTenantData(data);

        if (!data) {
          setLoading(false);
          return;
        }

        if (data?.contract?.id) {
          const payments = await tenantService.getPayments(data.contract.id.toString());
          setRecentPayments(payments.slice(0, 3));

          const currentMonthPayment = payments.find((p) => {
            const pDate = new Date(p.due_date);
            const now = new Date();
            return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
          });

          if (currentMonthPayment) {
            setPaymentStatus(currentMonthPayment.status === 'paid' ? 'paid' : 'pending');
          }
        }

        const condoName = data.property_address
          ? data.property_address.split(',')[0].split('-')[0].trim()
          : undefined;
        const [systemAnn, ownerAnn] = await Promise.all([
          announcementService.getSystemAnnouncements(),
          announcementService.getForTenant(user.id.toString(), data.property_id, condoName),
        ]);

        const combined = [...(systemAnn || []), ...(ownerAnn || [])].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        }) as SystemAnnouncement[];

        setAnnouncements(combined.slice(0, 3));

        if (data?.property_id) {
          const inspections = await inspectionService.getByProperty(data.property_id);
          const pending = inspections.find((i) => ['Pendente', 'Em Revisão', 'pendente_assinatura', 'rascunho'].includes(i.status));
          if (pending) setPendingInspection(pending);
        }
      } catch (err) {
        console.error('Error fetching tenant dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [user?.id]);

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const handleCopyPix = () => {
    const pixKey = tenantData?.owner_pix_key || '';
    if (pixKey) {
      navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      import('sonner').then(({ toast }) => toast.info('Chave Pix não disponível. Consulte o proprietário.'));
    }
  };

  const handleCopyBarcode = () => {
    import('sonner').then(({ toast }) => toast.info('Boleto não disponível para este pagamento.'));
    setInvoiceCopied(true);
    setTimeout(() => setInvoiceCopied(false), 2000);
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);
    setTimeout(() => {
      setProcessingPayment(false);
      setPaymentSuccess(true);
      setPaymentStatus('paid');
      setTimeout(() => {
        setShowCreditCard(false);
        setPaymentSuccess(false);
      }, 2000);
    }, 2500);
  };

  const validity = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const contract = tenantData?.contract;
    const startDate = contract?.start_date ? new Date(contract.start_date) : null;
    const endDate = contract?.end_date ? new Date(contract.end_date) : new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let progress = 0;
    if (startDate && endDate > startDate) {
      const totalTime = endDate.getTime() - startDate.getTime();
      const elapsedTime = today.getTime() - startDate.getTime();
      progress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
    }

    const formattedDate = endDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return { diffDays, formattedDate, progress, startDate };
  })();

  return {
    user,
    logout,
    isOnboardingRequired,
    loadingOnboarding,
    refetchOnboarding,
    contextPendingInspection,
    contextTenantData,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    triggerTestNotification,
    navigate,
    loading,
    tenantData,
    currentTenant,
    tenantProperty,
    recentPayments,
    announcements,
    paymentStatus,
    copied,
    showUserMenu,
    setShowUserMenu,
    showNotifications,
    setShowNotifications,
    isDark,
    showInspection,
    setShowInspection,
    pendingInspection,
    showInvoice,
    setShowInvoice,
    invoiceCopied,
    showCreditCard,
    setShowCreditCard,
    processingPayment,
    paymentSuccess,
    getDueBadge,
    getNoticeBadge,
    getFinancialCardBorder,
    toggleTheme,
    handleUserMenuClick,
    handleCopyPix,
    handleCopyBarcode,
    handleCardPayment,
    validity,
  };
}
