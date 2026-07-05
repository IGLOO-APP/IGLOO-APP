import React from 'react';
import {
  Copy,
  CheckCircle,
  CreditCard,
  Barcode,
  AlertTriangle,
  Award,
  Star,
  Camera,
  FileText,
  MessageCircle,
  Key,
  Calendar,
  MapPin,
} from 'lucide-react';
import { PropertyCard } from '../../../components/properties/PropertyCard';
import CommunicationHub from '../../../components/announcements/CommunicationHub';
import { getRemainingContractTime } from '../../../utils/formatters';

interface FinancialCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tenantProperty: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tenantData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentPayments: any[];
  copied: boolean;
  validity: {
    diffDays: number;
    formattedDate: string;
    progress: number;
    startDate: Date | null;
  };
  getFinancialCardBorder: () => string;
  getDueBadge: (isVertical?: boolean) => React.ReactNode;
  onCopyPix: () => void;
  onOpenCreditCard: () => void;
  onOpenInvoice: () => void;
  onNavigate: (path: string) => void;
}

export const FinancialCard: React.FC<FinancialCardProps> = ({
  tenantProperty,
  tenantData,
  recentPayments,
  copied,
  validity,
  getFinancialCardBorder,
  getDueBadge,
  onCopyPix,
  onOpenCreditCard,
  onOpenInvoice,
  onNavigate,
}) => {
  return (
    <>
      {/* Communication Hub */}
      <div className='px-6 mb-4'>
        <CommunicationHub
          tenantPropertyId={tenantData?.property_id}
          condoName={
            tenantData?.property_address
              ? tenantData.property_address.split(',')[0].split('-')[0].trim()
              : undefined
          }
        />
      </div>

      {/* Property & Contract Info */}
      <div className='px-6 mb-8 animate-fadeIn'>
        {tenantProperty ? (
          <PropertyCard
            property={tenantProperty}
            onClick={() => {}}
            viewMode='list'
            isTenant={true}
          />
        ) : (
          <div className='p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-3'>
            <MapPin size={32} className='text-slate-300' />
            <p className='text-sm font-bold text-slate-400 uppercase tracking-widest'>
              Imóvel não vinculado
            </p>
          </div>
        )}
      </div>

      {/* Contract Validity */}
      <div className='px-6 mb-8'>
        <div className='bg-white dark:bg-surface-dark rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500'>
                <Calendar size={20} />
              </div>
              <div>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  Vigência do Contrato
                </p>
                <p className='text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight'>
                  Até {validity.formattedDate}
                </p>
              </div>
            </div>

            {tenantData?.contract && (
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  validity.diffDays < 0
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : validity.diffDays < 30
                      ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}
              >
                {getRemainingContractTime(tenantData.contract.end_date)}
              </span>
            )}
          </div>

          <div className='space-y-2'>
            <div className='h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden'>
              <div
                className={`h-full transition-all duration-1000 ease-out rounded-full ${
                  validity.diffDays < 30 ? 'bg-orange-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${validity.progress}%` }}
              />
            </div>
            <div className='flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest'>
              <span>
                Início:{' '}
                {validity.startDate?.toLocaleDateString('pt-BR', {
                  month: 'short',
                  year: 'numeric',
                }) || '--'}
              </span>
              <span>{Math.round(validity.progress)}% concluído</span>
            </div>
          </div>

          {validity.diffDays <= 90 && (
            <button
              onClick={() => onNavigate('/tenant/messages')}
              className={`w-full py-3 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all active:scale-[0.98] border-2 ${
                validity.diffDays < 30
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
              }`}
            >
              {validity.diffDays < 0
                ? 'Contrato Vencido • Regularizar agora'
                : validity.diffDays < 30
                  ? 'Vencendo em breve • Falar com proprietário'
                  : 'Renovação antecipada • Consultar condições'}
            </button>
          )}
        </div>
      </div>

      {/* Payment Card */}
      <div className='px-6 mb-6'>
        <div
          className={`bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border-2 transition-all duration-300 relative overflow-hidden ${getFinancialCardBorder()}`}
        >
          <div className='flex justify-between items-start mb-6'>
            <div>
              <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2'>
                Próximo Vencimento
              </p>
              <h3 className='text-5xl font-black text-slate-900 dark:text-white tracking-tighter'>
                R$ {tenantData?.contract?.monthly_value?.toLocaleString('pt-BR') || '0,00'}
              </h3>
              {getDueBadge(true)}
            </div>
          </div>

          <div className='flex gap-6 mb-8 pb-4 border-b border-gray-100 dark:border-gray-800 overflow-x-auto hide-scrollbar'>
            <div className='shrink-0'>
              <p className='text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1'>
                Total Mensal
              </p>
              <p className='text-sm font-bold text-slate-600 dark:text-slate-400'>
                R$ {tenantData?.contract?.monthly_value?.toLocaleString('pt-BR') || '0,00'}
              </p>
            </div>
          </div>

          <div className='space-y-3'>
            <button
              onClick={onCopyPix}
              className='w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 dark:shadow-none'
            >
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              {copied ? 'Código Pix Copiado!' : 'Copiar Código Pix'}
            </button>
            <div className='flex gap-3'>
              <button
                onClick={onOpenCreditCard}
                className='flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all'
              >
                <CreditCard size={18} />
                Cartão
              </button>
              <button
                onClick={onOpenInvoice}
                className='flex-1 h-12 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors'
              >
                <Barcode size={18} />
                Boleto
              </button>
            </div>
          </div>

          <div className='mt-8 pt-4 border-t border-gray-100 dark:border-gray-800/50'>
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 px-1'>
              Últimos Pagamentos
            </p>
            <div className='space-y-4'>
              {recentPayments.length > 0 ? (
                recentPayments.map((p, i) => (
                  <div key={i} className='flex items-center justify-between px-1'>
                    <span className='text-sm text-slate-600 dark:text-slate-400 font-bold tracking-tight'>
                      {new Date(p.due_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        p.status === 'paid' ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {p.status === 'paid' ? (
                        <>
                          <CheckCircle size={14} /> Pago
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={14} /> Pendente
                        </>
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <div className='text-center py-2 text-slate-400 text-[10px] font-bold uppercase'>
                  Nenhum histórico disponível
                </div>
              )}
              <button
                onClick={() => onNavigate('/tenant/payments')}
                className='text-[11px] font-black text-primary uppercase tracking-widest hover:underline w-full text-center mt-6 pt-2'
              >
                Ver histórico completo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Score */}
      <div className='px-6 mb-6'>
        <div className='bg-slate-900 dark:bg-surface-dark rounded-3xl p-6 text-white shadow-xl relative overflow-hidden'>
          <div className='absolute right-0 top-0 p-6 opacity-10'>
            <Award size={100} />
          </div>
          <div className='flex justify-between items-start relative z-10'>
            <div>
              <p className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2'>
                Seu Score
              </p>
              <h3 className='text-4xl font-black flex items-center gap-2 tracking-tighter'>
                95<span className='text-xl text-slate-500 font-bold'>/100</span>
              </h3>
              <div className='flex gap-1.5 mt-3'>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className='text-yellow-400 fill-yellow-400 shadow-yellow-400/20'
                  />
                ))}
              </div>
            </div>
            <div className='text-right'>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
                Inquilino Nível
              </p>
              <p className='text-xl font-black text-yellow-400 tracking-tight'>5 Estrelas!</p>
            </div>
          </div>
          <p className='text-[10px] text-slate-500 font-medium mt-4 italic'>
            Seu histórico como inquilino nos últimos 12 meses
          </p>
          <div className='mt-5 pt-5 border-t border-white/10 flex justify-between'>
            <div className='flex flex-col'>
              <span className='text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1'>
                Pontualidade
              </span>
              <span className='text-sm font-bold text-emerald-400'>100%</span>
            </div>
            <div className='flex flex-col text-right'>
              <span className='text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1'>
                Cuidado
              </span>
              <span className='text-sm font-bold text-primary'>90%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className='px-6 mb-6'>
        <h3 className='text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-1'>
          Acesso Rápido
        </h3>
        <div className='grid grid-cols-4 gap-4'>
          {[
            {
              icon: Camera,
              label: 'Enviar Foto',
              desc: 'Registre problemas',
              color: 'bg-blue-100 text-blue-600',
              action: () => onNavigate('/tenant/maintenance'),
            },
            {
              icon: FileText,
              label: 'Docs',
              desc: 'Contratos e docs',
              color: 'bg-purple-100 text-purple-600',
              action: () => onNavigate('/tenant/profile'),
            },
            {
              icon: MessageCircle,
              label: 'Chat',
              desc: 'Fale com o dono',
              color: 'bg-emerald-100 text-emerald-600',
              action: () => onNavigate('/tenant/maintenance'),
            },
            {
              icon: Key,
              label: 'Chaves',
              desc: 'Segunda via',
              color: 'bg-amber-100 text-amber-600',
              action: () => alert('Solicitação de chave enviada!'),
            },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className='flex flex-col items-center group'>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm ${item.color} dark:bg-opacity-20 mb-3`}
              >
                <item.icon size={26} />
              </div>
              <span className='text-[11px] font-black text-slate-900 dark:text-white text-center leading-none mb-1'>
                {item.label}
              </span>
              <span className='text-[9px] font-medium text-slate-400 dark:text-slate-500 text-center leading-tight px-1'>
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
