import React from 'react';
import { User, Mail, Phone, Home, Hash, Clock, MapPin } from 'lucide-react';

interface OverviewTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tenant: any;
  financialSummary: { punctualityRate: number; totalPaid: number; totalPending: number };
  contractProgress: number;
  remainingTime: string;
  formattedPhone: string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  tenant,
  financialSummary,
  contractProgress,
  remainingTime,
  formattedPhone,
}) => {
  return (
    <div className='animate-fadeIn space-y-6'>
      <div className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--card-radius)] p-[20px_24px] shadow-sm flex flex-wrap items-center gap-y-4 gap-x-8'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400'>
            <User size={16} />
          </div>
          <div>
            <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block'>
              Inquilino
            </span>
            <span className='text-sm font-bold text-slate-900 dark:text-white'>{tenant.name}</span>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400'>
            <Mail size={16} />
          </div>
          <div>
            <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block'>
              E-mail
            </span>
            <span className='text-sm font-bold text-slate-900 dark:text-white'>{tenant.email}</span>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400'>
            <Phone size={16} />
          </div>
          <div>
            <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block'>
              Telefone
            </span>
            <span className='text-sm font-bold text-slate-900 dark:text-white'>
              {formattedPhone}
            </span>
          </div>
        </div>
        {tenant.property && (
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400'>
              <Home size={16} />
            </div>
            <div>
              <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block'>
                Imóvel
              </span>
              <span className='text-sm font-bold text-slate-900 dark:text-white'>
                {tenant.property}
              </span>
            </div>
          </div>
        )}
        {tenant.contract && (
          <>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400'>
                <Hash size={16} />
              </div>
              <div>
                <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block'>
                  Contrato
                </span>
                <span className='text-sm font-bold text-slate-900 dark:text-white font-mono'>
                  CTR-{String(tenant.contract.id).substring(0, 6).toUpperCase()}
                </span>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400'>
                <Clock size={16} className='text-amber-500' />
              </div>
              <div>
                <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block'>
                  Vigência
                </span>
                <span className='text-sm font-bold text-amber-600 dark:text-amber-400'>
                  {remainingTime} restantes
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--card-radius)] p-[20px_24px] shadow-sm col-span-2 flex flex-col justify-between'>
          <div>
            <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block mb-2'>
              Imóvel Atual
            </span>
            <h3 className='text-[length:var(--value-size)] font-black text-slate-900 dark:text-white'>
              {tenant.property || 'Imóvel vinculado'}
            </h3>
            <p className='text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold'>
              <MapPin size={12} className='text-primary' />{' '}
              {tenant.property_address || 'Endereço indisponível'}
            </p>
          </div>
          <div className='flex items-center gap-6 mt-6 border-t border-slate-100 dark:border-white/5 pt-4'>
            <div>
              <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase block tracking-wider'>
                Mensalidade
              </span>
              <span className='text-[length:var(--value-size)] font-black text-slate-900 dark:text-white'>
                R${' '}
                {Number(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className='w-px h-8 bg-slate-100 dark:bg-white/10' />
            <div>
              <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase block tracking-wider'>
                Dia Vencimento
              </span>
              <span className='text-[length:var(--value-size)] font-black text-slate-900 dark:text-white'>
                Todo dia {tenant.contract?.payment_day || '10'}
              </span>
            </div>
          </div>
        </div>
        <div className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[var(--card-radius)] p-[20px_24px] shadow-sm flex flex-col justify-between'>
          <div>
            <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block mb-2'>
              Vigência de Contrato
            </span>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-xs font-bold text-slate-900 dark:text-white'>
                {contractProgress}% Concluído
              </span>
            </div>
            <div className='w-full h-2.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden'>
              <div
                className='h-full bg-primary rounded-full'
                style={{ width: `${contractProgress}%` }}
              ></div>
            </div>
          </div>
          <div className='flex justify-between text-[11px] font-semibold text-slate-500 mt-4'>
            <div>
              <span className='block text-[9px] uppercase tracking-wider text-slate-400'>
                Início
              </span>
              <span className='text-slate-900 dark:text-white font-bold'>
                {tenant.contract
                  ? new Date(tenant.contract.start_date).toLocaleDateString('pt-BR')
                  : '-'}
              </span>
            </div>
            <div className='text-right'>
              <span className='block text-[9px] uppercase tracking-wider text-slate-400'>
                Término
              </span>
              <span className='text-slate-900 dark:text-white font-bold'>
                {tenant.contract
                  ? new Date(tenant.contract.end_date).toLocaleDateString('pt-BR')
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-[var(--card-bg)] border border-[var(--card-border)] p-[20px_24px] rounded-[var(--card-radius)] shadow-sm'>
          <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block mb-1'>
            Pontualidade Média
          </span>
          <span className='text-[length:var(--value-size)] font-black text-emerald-500'>
            {financialSummary.punctualityRate}%
          </span>
        </div>
        <div className='bg-[var(--card-bg)] border border-[var(--card-border)] p-[20px_24px] rounded-[var(--card-radius)] shadow-sm'>
          <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block mb-1'>
            Total Liquidado
          </span>
          <span className='text-[length:var(--value-size)] font-black text-slate-900 dark:text-white'>
            R$ {financialSummary.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className='bg-[var(--card-bg)] border border-[var(--card-border)] p-[20px_24px] rounded-[var(--card-radius)] shadow-sm'>
          <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block mb-1'>
            Total em Aberto
          </span>
          <span
            className={`text-[length:var(--value-size)] font-black ${financialSummary.totalPending > 0 ? 'text-amber-500' : 'text-slate-950 dark:text-white'}`}
          >
            R$ {financialSummary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className='bg-[var(--card-bg)] border border-[var(--card-border)] p-[20px_24px] rounded-[var(--card-radius)] shadow-sm'>
          <span className='text-[length:var(--label-size)] font-black text-slate-400 uppercase tracking-widest block mb-1'>
            Mensalidade
          </span>
          <span className='text-[length:var(--value-size)] font-black text-primary'>
            R${' '}
            {Number(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR', {
              minimumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
