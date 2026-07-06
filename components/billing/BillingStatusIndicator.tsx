import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, MessageCircle, Clock } from 'lucide-react';
import { BillingStatus } from '../../types/billing';
import { billingService } from '../../services/billingService';

interface BillingStatusIndicatorProps {
  contractId: string;
  ownerId: string;
}

const STATUS_CONFIG = {
  em_dia: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    label: 'Em dia',
  },
  vencendo: {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    label: 'Próximo ao vencimento',
  },
  atrasado: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    label: 'Atrasado',
  },
  critico: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    label: 'Atraso crítico',
  },
};

export const BillingStatusIndicator: React.FC<BillingStatusIndicatorProps> = ({
  contractId,
  ownerId,
}) => {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const list = await billingService.getPendingBilling(ownerId);
        const found = list.find((b) => b.contract_id === contractId);
        setBillingStatus(found ?? null);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [contractId, ownerId]);

  if (loading) {
    return <div className='w-16 h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse' />;
  }

  if (!billingStatus) return null;

  const config = STATUS_CONFIG[billingStatus.status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl ${config.bg}`}>
      <Icon size={14} className={config.color} />
      <div className='text-left'>
        <p className={`text-[9px] font-black uppercase tracking-widest ${config.color}`}>
          {config.label}
        </p>
        {billingStatus.days_overdue > 0 && (
          <p className='text-[8px] text-slate-400 font-medium'>
            {billingStatus.days_overdue} dia(s)
          </p>
        )}
      </div>
      {billingStatus.reminders_count > 0 && (
        <div className='flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-surface-dark rounded-lg'>
          <MessageCircle size={10} className='text-primary' />
          <span className='text-[8px] font-black text-slate-500'>
            {billingStatus.reminders_count}
          </span>
        </div>
      )}
    </div>
  );
};
