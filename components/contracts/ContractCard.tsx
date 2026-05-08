import React from 'react';
import {
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  PenTool,
  RefreshCw,
} from 'lucide-react';
import { Contract } from '../../types';
import { getStatusColor, getStatusLabel } from '../../utils/contractLogic';

interface ContractCardProps {
  contract: Contract;
  onClick: (contract: Contract) => void;
  onRenew?: (contract: Contract) => void;
}

export const ContractCard: React.FC<ContractCardProps> = ({ contract, onClick, onRenew }) => {
  const statusColor = getStatusColor(contract.status);
  const statusLabel = getStatusLabel(contract.status);

  // Determine if contract needs renewal (expired or expiring in < 30 days)
  const today = new Date();
  const endDate = new Date(contract.end_date);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const needsRenewal = diffDays <= 30 && contract.status !== 'renewed' && contract.status !== 'cancelled' && contract.status !== 'draft';

  // Calculate signature progress
  const signedCount = contract.signers.filter((s) => s.status === 'signed').length;
  const totalSigners = contract.signers.length;
  const progress = totalSigners > 0 ? (signedCount / totalSigners) * 100 : 0;

  return (
    <div
      onClick={() => onClick(contract)}
      className='group bg-white dark:bg-surface-dark p-6 rounded-[24px] border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer relative overflow-hidden'
    >
      {/* Background Watermark */}
      <div className='absolute -right-8 -bottom-8 text-slate-100 dark:text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-500'>
        <FileText size={160} strokeWidth={0.5} />
      </div>

      {/* Side Status Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColor.split(' ')[0]}`}></div>

      <div className='relative z-10'>
        <div className='flex justify-between items-start mb-4'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-[0.15em] border ${statusColor} shadow-sm`}>
                {statusLabel}
              </span>
              {needsRenewal && onRenew && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenew(contract);
                  }}
                  className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm'
                >
                  <RefreshCw size={10} /> Renovar
                </button>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200/50 dark:border-white/5'>
                Ref: {contract.contract_number}
              </span>
            </div>
            <h3 className='text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight mt-2'>
              {contract.property}
            </h3>
          </div>

          {/* Official Value Seal */}
          <div className='flex flex-col items-end'>
            <div className='bg-slate-900 dark:bg-white px-3 py-1 rounded-tr-xl rounded-bl-xl shadow-lg'>
              <span className='text-[9px] font-black text-white dark:text-slate-900 uppercase tracking-[0.2em] opacity-80'>Valor Mensal</span>
              <p className='text-sm font-black text-white dark:text-slate-900 font-mono'>{contract.value}</p>
            </div>
            <div className='flex items-center gap-1 mt-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest'>
              <CheckCircle2 size={10} /> Vencimento dia {contract.payment_day || '--'}
            </div>
          </div>
        </div>

        <div className='space-y-4 mb-6'>
          <div className='flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5'>
            <div className='w-8 h-8 rounded-xl bg-white dark:bg-surface-dark flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/5'>
              <Users size={16} />
            </div>
            <div className='flex flex-col'>
              <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>Locatário</span>
              <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>{contract.tenant_name}</span>
            </div>
          </div>

          <div className='flex items-center justify-between gap-4'>
            <div className='flex-1 flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5'>
              <div className='w-8 h-8 rounded-xl bg-white dark:bg-surface-dark flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/5'>
                <Calendar size={16} />
              </div>
              <div className='flex flex-col'>
                <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>Término em</span>
                <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>
                  {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {contract.status === 'expiring_soon' && (
              <div className='flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200/50 dark:border-amber-500/20'>
                <Clock size={14} className='text-amber-500' />
                <span className='text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest'>
                  {contract.days_remaining} dias
                </span>
              </div>
            )}
          </div>

          {contract.status === 'pending_signature' && (
            <div className='bg-blue-50/50 dark:bg-blue-500/5 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-500/20'>
              <div className='flex justify-between items-center mb-2'>
                <div className='flex items-center gap-2'>
                  <PenTool size={12} className='text-blue-500' />
                  <span className='text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]'>Assinaturas Coletadas</span>
                </div>
                <span className='text-[10px] font-black text-blue-700 dark:text-blue-300'>
                  {signedCount}/{totalSigners}
                </span>
              </div>
              <div className='w-full h-1.5 bg-blue-100 dark:bg-white/10 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-blue-500 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Signature Line Area */}
        <div className='flex items-center justify-between pt-4 border-t border-dashed border-slate-200 dark:border-white/10'>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2 mb-1'>
              <PenTool size={12} className='text-slate-300' />
              <div className='h-[1px] w-16 bg-slate-200 dark:bg-white/10'></div>
            </div>
            <span className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>Linha de Autenticação Igloo</span>
          </div>
          
          <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0'>
            <div className='flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-primary/20'>
              Ver Detalhes <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
