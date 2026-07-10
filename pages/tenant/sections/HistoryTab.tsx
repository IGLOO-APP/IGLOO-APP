import React from 'react';
import {
  Clock,
  FileText,
  FilePlus,
  Send,
  PenTool,
  Eye,
  XCircle,
  CheckCircle2,
  Wrench,
} from 'lucide-react';

interface HistoryTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tenant: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payments: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maintenance: any[];
  contractHistory: { action: string; description: string; date: string; performed_by?: string }[];
  timelineFilter: 'all' | 'payments' | 'maintenance' | 'contracts';
  onFilterChange: (f: 'all' | 'payments' | 'maintenance' | 'contracts') => void;
}

const contractEventConfig: Record<string, { title: string; icon: any; color: string }> = {
  created: { title: 'Contrato Criado', icon: FilePlus, color: 'bg-blue-500 text-white' },
  sent: { title: 'Enviado para Assinatura', icon: Send, color: 'bg-amber-500 text-white' },
  signed: { title: 'Assinado', icon: PenTool, color: 'bg-emerald-500 text-white' },
  viewed: { title: 'Visualizado', icon: Eye, color: 'bg-indigo-500 text-white' },
  cancelled: { title: 'Contrato Rescindido', icon: XCircle, color: 'bg-red-500 text-white' },
  renewed: { title: 'Contrato Renovado', icon: FileText, color: 'bg-purple-500 text-white' },
};

export const HistoryTab: React.FC<HistoryTabProps> = ({
  tenant,
  payments,
  maintenance,
  contractHistory,
  timelineFilter,
  onFilterChange,
}) => {
  const allEvents = [
    ...(tenant.contract
      ? [
          {
            id: 'c-start',
            type: 'contracts' as const,
            date: tenant.contract.start_date,
            title: 'Contrato Ativado',
            desc: `Assinatura de locação para o imóvel ${tenant.property}`,
            icon: FileText,
            color: 'bg-primary text-white',
          },
        ]
      : []),
    ...contractHistory.map((ev, i) => {
      const cfg = contractEventConfig[ev.action] || {
        title: ev.action,
        icon: FileText,
        color: 'bg-slate-500 text-white',
      };
      return {
        id: `ch-${i}`,
        type: 'contracts' as const,
        date: ev.date,
        title: cfg.title,
        desc: ev.description + (ev.performed_by ? ` — ${ev.performed_by}` : ''),
        icon: cfg.icon,
        color: cfg.color,
      };
    }),
    ...payments.map((p: any) => ({
      id: `pay-${p.id}`,
      type: 'payments' as const,
      date: p.paid_date || p.due_date,
      title: p.status === 'paid' ? 'Mensalidade Recebida' : 'Fatura Registrada',
      desc: `Aluguel Ref: ${new Date(p.due_date).toLocaleString('pt-BR', { month: 'long' })} • R$ ${Number(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: p.status === 'paid' ? CheckCircle2 : Clock,
      color: p.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white',
    })),
    ...maintenance.map((m: any) => ({
      id: `maint-${m.id}`,
      type: 'maintenance' as const,
      date: m.created_at,
      title: m.title,
      desc: m.status === 'completed' ? 'Manutenção resolvida' : 'Chamado aberto em andamento',
      icon: m.status === 'completed' ? CheckCircle2 : Wrench,
      color: m.status === 'completed' ? 'bg-primary text-white' : 'bg-slate-700 text-white',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered =
    timelineFilter === 'all' ? allEvents : allEvents.filter((e) => e.type === timelineFilter);

  return (
    <div className='animate-fadeIn space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h3 className='text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest'>
            <Clock size={14} className='text-primary' /> Linha do Tempo
          </h3>
          <p className='text-[9px] text-slate-400 font-bold uppercase mt-0.5'>
            Histórico completo de eventos
          </p>
        </div>
        <div className='flex items-center gap-2 flex-wrap'>
          {(
            [
              ['all', 'Todos'],
              ['payments', 'Financeiro'],
              ['maintenance', 'Chamados'],
              ['contracts', 'Contratos'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => onFilterChange(val)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${timelineFilter === val ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className='py-16 text-center'>
          <Clock size={36} className='text-slate-200 dark:text-white/10 mx-auto mb-3' />
          <p className='text-slate-400 font-bold text-xs'>Sem registros históricos.</p>
        </div>
      ) : (
        <div className='space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-white/5'>
          {filtered.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ev: any) => (
              <div key={ev.id} className='relative flex gap-5 items-start'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-background-light dark:border-background-dark ${ev.color}`}
                >
                  <ev.icon size={14} />
                </div>
                <div className='flex-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--card-radius)] p-[20px_24px] shadow-sm'>
                  <div className='flex justify-between items-start gap-2 mb-1'>
                    <h4 className='text-xs font-black text-slate-800 dark:text-white'>
                      {ev.title}
                    </h4>
                    <span className='text-[9px] font-bold text-slate-400 text-right leading-tight'>
                      {new Date(ev.date).toLocaleDateString('pt-BR')}
                      <br />
                      {new Date(ev.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className='text-xs text-slate-500 leading-normal font-semibold'>{ev.desc}</p>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
