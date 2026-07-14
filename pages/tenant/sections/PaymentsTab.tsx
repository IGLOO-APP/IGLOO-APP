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
        <div className='lg-card lg-card-lift p-6'>
          <span className='text-xs font-medium text-muted-foreground block mb-1'>
            Total Liquidado
          </span>
          <span className='text-lg font-bold text-emerald-500'>
            R$ {financialSummary.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className='lg-card lg-card-lift p-6'>
          <span className='text-xs font-medium text-muted-foreground block mb-1'>
            Total Pendente
          </span>
          <span className='text-lg font-bold text-amber-500'>
            R$ {financialSummary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className='flex justify-between items-center'>
        <h2 className='text-xs font-semibold text-foreground flex items-center gap-2'>
          <History size={16} strokeWidth={1.8} className='text-primary' /> Histórico de Mensalidades
        </h2>
        <button className='text-xs font-medium text-muted-foreground flex items-center gap-2 hover:text-foreground bg-white/5 px-4 py-2 rounded-xl transition-all border border-white/10'>
          <Download size={14} strokeWidth={1.8} /> Exportar PDF
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
                  className='flex items-center justify-between lg-card lg-card-lift p-6 hover:border-primary/20 transition-all'
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pay.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : isLate ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}
                    >
                      {pay.status === 'paid' ? (
                        <CheckCircle2 size={20} strokeWidth={1.8} />
                      ) : (
                        <Clock size={20} strokeWidth={1.8} />
                      )}
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-foreground'>
                        Aluguel {new Date(pay.due_date).toLocaleString('pt-BR', { month: 'long' })}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1 font-semibold'>
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
                    <p className='text-xs font-semibold text-foreground'>
                      R$ {Number(pay.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span
                      className={`text-[10px] font-medium tracking-widest uppercase ${pay.status === 'paid' ? 'text-emerald-500' : isLate ? 'text-rose-500' : 'text-amber-500'}`}
                    >
                      {pay.status === 'paid' ? 'CONCLUÍDO' : isLate ? 'ATRASADO' : 'PENDENTE'}
                    </span>
                  </div>
                </div>
              );
            }
          )
        ) : (
          <div className='lg-card lg-card-lift p-16 text-center'>
            <p className='text-muted-foreground text-xs font-bold'>Sem mensalidades registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
};
