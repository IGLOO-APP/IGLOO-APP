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
      <div className='lg-card lg-card-lift p-6 flex flex-wrap items-center gap-y-4 gap-x-8'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm text-muted-foreground'>
            <User size={16} strokeWidth={1.8} />
          </div>
          <div>
            <span className='text-xs font-medium text-muted-foreground block'>Inquilino</span>
            <span className='text-sm font-bold text-foreground'>{tenant.name}</span>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm text-muted-foreground'>
            <Mail size={16} strokeWidth={1.8} />
          </div>
          <div>
            <span className='text-xs font-medium text-muted-foreground block'>E-mail</span>
            <span className='text-sm font-bold text-foreground'>{tenant.email}</span>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm text-muted-foreground'>
            <Phone size={16} strokeWidth={1.8} />
          </div>
          <div>
            <span className='text-xs font-medium text-muted-foreground block'>Telefone</span>
            <span className='text-sm font-bold text-foreground'>{formattedPhone}</span>
          </div>
        </div>
        {tenant.property && (
          <div className='flex items-center gap-3'>
            <div className='p-2.5 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm text-muted-foreground'>
              <Home size={16} strokeWidth={1.8} />
            </div>
            <div>
              <span className='text-xs font-medium text-muted-foreground block'>Imóvel</span>
              <span className='text-sm font-bold text-foreground'>{tenant.property}</span>
            </div>
          </div>
        )}
        {tenant.contract && (
          <>
            <div className='flex items-center gap-3'>
              <div className='p-2.5 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm text-muted-foreground'>
                <Hash size={16} strokeWidth={1.8} />
              </div>
              <div>
                <span className='text-xs font-medium text-muted-foreground block'>Contrato</span>
                <span className='text-sm font-bold text-foreground font-mono'>
                  CTR-{String(tenant.contract.id).substring(0, 6).toUpperCase()}
                </span>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='p-2.5 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm text-muted-foreground'>
                <Clock size={16} strokeWidth={1.8} className='text-amber-500' />
              </div>
              <div>
                <span className='text-xs font-medium text-muted-foreground block'>Vigência</span>
                <span className='text-sm font-bold text-amber-600 dark:text-amber-400'>
                  {remainingTime} restantes
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='lg-card lg-card-lift p-6 col-span-2 flex flex-col justify-between'>
          <div>
            <span className='text-xs font-medium text-muted-foreground block mb-2'>
              Imóvel Atual
            </span>
            <h3 className='text-lg font-bold text-foreground'>
              {tenant.property || 'Imóvel vinculado'}
            </h3>
            <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1 font-semibold'>
              <MapPin size={12} strokeWidth={1.8} className='text-primary' />{' '}
              {tenant.property_address || 'Endereço indisponível'}
            </p>
          </div>
          <div className='flex items-center gap-6 mt-6 border-t border-border pt-4'>
            <div>
              <span className='text-xs font-medium text-muted-foreground block'>Mensalidade</span>
              <span className='text-lg font-bold text-foreground'>
                R${' '}
                {Number(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className='w-px h-8 bg-slate-100 dark:bg-white/10' />
            <div>
              <span className='text-xs font-medium text-muted-foreground block'>
                Dia Vencimento
              </span>
              <span className='text-lg font-bold text-foreground'>
                Todo dia {tenant.contract?.payment_day || '10'}
              </span>
            </div>
          </div>
        </div>
        <div className='lg-card lg-card-lift p-6 flex flex-col justify-between'>
          <div>
            <span className='text-xs font-medium text-muted-foreground block mb-2'>
              Vigência de Contrato
            </span>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-xs font-semibold text-foreground'>
                {contractProgress}% Concluído
              </span>
            </div>
            <div className='w-full h-2 bg-muted/50 rounded-full overflow-hidden'>
              <div
                className='h-full bg-primary rounded-full'
                style={{ width: `${contractProgress}%` }}
              ></div>
            </div>
          </div>
          <div className='flex justify-between text-xs font-semibold text-muted-foreground mt-4'>
            <div>
              <span className='block text-xs text-muted-foreground'>Início</span>
              <span className='text-foreground font-bold'>
                {tenant.contract
                  ? new Date(tenant.contract.start_date).toLocaleDateString('pt-BR')
                  : '-'}
              </span>
            </div>
            <div className='text-right'>
              <span className='block text-xs text-muted-foreground'>Término</span>
              <span className='text-foreground font-bold'>
                {tenant.contract
                  ? new Date(tenant.contract.end_date).toLocaleDateString('pt-BR')
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='lg-card lg-card-lift p-5'>
          <span className='text-xs font-medium text-muted-foreground block mb-1'>
            Pontualidade Média
          </span>
          <span className='text-lg font-bold text-emerald-500'>
            {financialSummary.punctualityRate}%
          </span>
        </div>
        <div className='lg-card lg-card-lift p-5'>
          <span className='text-xs font-medium text-muted-foreground block mb-1'>
            Total Liquidado
          </span>
          <span className='text-lg font-bold text-foreground'>
            R$ {financialSummary.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className='lg-card lg-card-lift p-5'>
          <span className='text-xs font-medium text-muted-foreground block mb-1'>
            Total em Aberto
          </span>
          <span
            className={`text-lg font-bold ${financialSummary.totalPending > 0 ? 'text-amber-500' : 'text-foreground'}`}
          >
            R$ {financialSummary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </span>
        </div>
        <div className='lg-card lg-card-lift p-5'>
          <span className='text-xs font-medium text-muted-foreground block mb-1'>Mensalidade</span>
          <span className='text-lg font-bold text-primary'>
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
