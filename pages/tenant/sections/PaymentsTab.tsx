import React from 'react';
import { History, Download, CheckCircle2, Clock } from 'lucide-react';

interface PaymentsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payments: any[];
  financialSummary: { totalPaid: number; totalPending: number };
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ payments, financialSummary }) => {
  return (
    <div className='animate-fadeIn space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-emerald-500/10 border border-emerald-500/20 p-[20px_24px] rounded-[var(--card-radius)]'>
          <span className='text-[length:var(--label-size)] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1'>
            Total Liquidado
          </span>
          <span className='text-[length:var(--value-size)] font-black text-emerald-600 dark:text-emerald-400'>
            R$ {financialSummary.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className='bg-amber-500/10 border border-amber-500/20 p-[20px_24px] rounded-[var(--card-radius)]'>
          <span className='text-[length:var(--label-size)] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1'>
            Total Pendente
          </span>
          <span className='text-[length:var(--value-size)] font-black text-amber-600 dark:text-amber-400'>
            R$ {financialSummary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <h2 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2'>
          <History size={16} className='text-primary' /> Histórico de Mensalidades
        </h2>
        <button className='text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl transition-all border border-slate-200 dark:border-white/10'>
          <Download size={14} /> Exportar PDF
        </button>
      </div>

      <div className='space-y-3'>
        {payments.length > 0 ? (
          payments.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (pay: any) => {
              const isLate = pay.status === 'pending' && new Date(pay.due_date) < new Date();
              const daysLate = isLate
                ? Math.floor(
                    (new Date().getTime() - new Date(pay.due_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0;
              return (
                <div
                  key={pay.id}
                  className='flex items-center justify-between p-[20px_24px] bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--card-radius)] hover:border-primary/20 transition-all shadow-sm'
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pay.status === 'paid' ? 'bg-emerald-500/15 text-emerald-500' : isLate ? 'bg-rose-500/15 text-rose-500 animate-pulse' : 'bg-amber-500/15 text-amber-500'}`}
                    >
                      {pay.status === 'paid' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <p className='font-black text-xs text-slate-800 dark:text-white'>
                        Aluguel {new Date(pay.due_date).toLocaleString('pt-BR', { month: 'long' })}
                      </p>
                      <p className='text-[10px] text-slate-400 mt-1 font-semibold'>
                        {pay.status === 'paid'
                          ? `Pago em ${new Date(pay.paid_date).toLocaleDateString('pt-BR')}`
                          : `Vence em ${new Date(pay.due_date).toLocaleDateString('pt-BR')}`}
                        {isLate && (
                          <span className='text-rose-500 ml-2 font-bold'>
                            • {daysLate} dias de atraso
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-black text-xs text-slate-900 dark:text-white'>
                      R$ {Number(pay.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span
                      className={`text-[8px] font-black tracking-widest uppercase ${pay.status === 'paid' ? 'text-emerald-500' : isLate ? 'text-rose-500' : 'text-amber-500'}`}
                    >
                      {pay.status === 'paid' ? 'CONCLUÍDO' : isLate ? 'ATRASADO' : 'PENDENTE'}
                    </span>
                  </div>
                </div>
              );
            }
          )
        ) : (
          <div className='p-16 text-center bg-[var(--card-bg)] border border-dashed border-[var(--card-border)] rounded-[var(--card-radius)]'>
            <p className='text-slate-400 text-xs font-bold'>Sem mensalidades registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
};
