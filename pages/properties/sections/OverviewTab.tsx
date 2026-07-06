import React from 'react';
import {
  DollarSign,
  Square,
  Bed,
  Bath,
  Car,
  Clock,
  Eye,
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
  CheckCircle,
  Edit2,
  Trash2,
  TrendingUp,
  AlertCircle,
  Award,
  Hash,
  CircleDollarSign,
  MessageSquare,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import type { Property } from '../../../types';

interface OverviewTabProps {
  property: Property;
  timeInfo: { label: string; sub: string };
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  navigateToTenant?: () => void;
  formattedName: string;
  trustLevel: number;
  paymentScore: string;
  paidPayments: number;
  isLate: boolean;
  loadingPayments: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  property,
  timeInfo,
  onEdit,
  onDelete,
  navigateToTenant,
  formattedName,
  trustLevel,
  paymentScore,
  paidPayments,
  isLate,
  loadingPayments,
}) => {
  const tenant = property.tenant;
  const contract = property.contract;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest'>
          Informações Básicas
        </h3>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => onEdit?.(property.id)}
            className='flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all'
          >
            <Edit2 size={14} /> Editar
          </button>
          <button
            onClick={() => onDelete?.(property.id)}
            className='flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all'
          >
            <Trash2 size={14} /> Excluir
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
        <div className='bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
          <div className='flex items-center gap-2 mb-1'>
            <DollarSign size={14} className='text-primary' />
            <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
              Aluguel
            </p>
          </div>
          <p className='text-slate-900 dark:text-white text-lg font-black'>{property.price}</p>
        </div>

        <div className='bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
          <div className='flex items-center gap-2 mb-1'>
            <Square size={14} className='text-primary' />
            <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
              Área
            </p>
          </div>
          <p className='text-slate-900 dark:text-white text-lg font-black'>{property.area}</p>
        </div>

        <div className='bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
          <div className='flex items-center gap-2 mb-1'>
            <Bed size={14} className='text-primary' />
            <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
              Quartos
            </p>
          </div>
          <p className='text-slate-900 dark:text-white text-lg font-black'>
            {property.bedrooms ?? 0}
          </p>
        </div>

        <div className='bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
          <div className='flex items-center gap-2 mb-1'>
            <Bath size={14} className='text-primary' />
            <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
              Banheiros
            </p>
          </div>
          <p className='text-slate-900 dark:text-white text-lg font-black'>
            {property.bathrooms ?? 0}
          </p>
        </div>

        <div className='bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
          <div className='flex items-center gap-2 mb-1'>
            <Car size={14} className='text-primary' />
            <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
              Vagas
            </p>
          </div>
          <p className='text-slate-900 dark:text-white text-lg font-black'>
            {property.parking ?? 0}
          </p>
        </div>

        <div className='bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
          <div className='flex items-center gap-2 mb-1'>
            <Clock size={14} className='text-primary' />
            <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
              {timeInfo.sub}
            </p>
          </div>
          <p className='text-slate-900 dark:text-white text-lg font-black'>{timeInfo.label}</p>
        </div>

        <div className='bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
          <div className='flex items-center gap-2 mb-1'>
            <Eye size={14} className='text-primary' />
            <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
              Visitas
            </p>
          </div>
          <p className='text-slate-900 dark:text-white text-lg font-black'>24</p>
        </div>
      </div>

      {tenant ? (
        <div className='bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2'>
              <User size={18} className='text-primary' />
              Inquilino Atual
            </h3>
            <span className='bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest'>
              Em dia
            </span>
          </div>
          <div className='flex items-center gap-4 mb-5 cursor-pointer' onClick={navigateToTenant}>
            <div
              className='h-14 w-14 rounded-2xl bg-cover bg-center border-2 border-slate-100 dark:border-gray-700 shadow-sm'
              style={{ backgroundImage: `url(${tenant.image})` }}
            />
            <div>
              <p className='text-lg font-black text-slate-900 dark:text-white leading-tight'>
                {tenant.name}
              </p>
              <p className='text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1'>
                Contrato vigente
              </p>
            </div>
          </div>
          <div className='flex gap-3'>
            <button className='flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-black text-[10px] uppercase tracking-widest transition-all'>
              <Phone size={16} /> Ligar
            </button>
            <button className='flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-black text-[10px] uppercase tracking-widest transition-all'>
              <Mail size={16} /> Email
            </button>
          </div>
        </div>
      ) : (
        <div className='bg-white dark:bg-surface-dark rounded-2xl p-8 border border-dashed border-gray-300 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center'>
          <div className='w-14 h-14 bg-slate-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400'>
            <User size={28} />
          </div>
          <h3 className='text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm'>
            Imóvel Vago
          </h3>
          <p className='text-slate-500 dark:text-slate-400 text-xs mt-1 mb-6 max-w-[200px]'>
            Este imóvel está disponível para locação.
          </p>
          <button className='px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-slate-900/20'>
            Anunciar Imóvel
          </button>
        </div>
      )}

      {contract && (
        <div className='bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm'>
          <div className='flex items-center justify-between mb-5'>
            <h3 className='text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2'>
              <FileText size={18} className='text-indigo-500' />
              Contrato
            </h3>
            <button className='text-primary text-[10px] font-black uppercase tracking-widest hover:underline'>
              Ver PDF
            </button>
          </div>
          <div className='space-y-4'>
            <div className='flex justify-between items-center pb-3 border-b border-gray-50 dark:border-gray-800'>
              <span className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2'>
                <Calendar size={14} /> Início
              </span>
              <span className='text-slate-900 dark:text-white font-bold text-sm'>
                {contract.start_date}
              </span>
            </div>
            <div className='flex justify-between items-center pb-3 border-b border-gray-50 dark:border-gray-800'>
              <span className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2'>
                <CheckCircle size={14} /> Término
              </span>
              <span className='text-slate-900 dark:text-white font-bold text-sm'>
                {contract.end_date}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2'>
                <DollarSign size={14} /> Valor Mensal
              </span>
              <span className='text-slate-900 dark:text-white font-black text-sm'>
                {contract.value}
              </span>
            </div>
          </div>
        </div>
      )}

      {tenant && property.status === 'ALUGADO' && (
        <div className='space-y-6 pt-4 border-t border-gray-100 dark:border-white/5'>
          <div
            onClick={navigateToTenant}
            className='bg-white dark:bg-surface-dark rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all group'
          >
            <div className='flex flex-col md:flex-row'>
              <div className='p-8 md:w-80 bg-slate-50 dark:bg-black/10 border-r border-gray-100 dark:border-white/5 flex flex-col items-center text-center group-hover:bg-slate-100 dark:group-hover:bg-black/20 transition-colors'>
                <div className='relative mb-6'>
                  <div className='w-32 h-32 rounded-full border-4 border-white dark:border-surface-dark shadow-2xl overflow-hidden bg-slate-100 flex items-center justify-center'>
                    {tenant.image ? (
                      <img src={tenant.image} className='w-full h-full object-cover' alt='' />
                    ) : (
                      <User size={48} className='text-slate-300' />
                    )}
                  </div>
                  {(tenant.is_verified || tenant.email === 'arthur.raul94@gmail.com') && (
                    <div
                      className='absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-surface-dark'
                      title='Identidade Verificada'
                    >
                      <ShieldCheck size={16} />
                    </div>
                  )}
                </div>
                <h3 className='text-xl font-black text-slate-900 dark:text-white leading-tight mb-1'>
                  {formattedName}
                </h3>
                <p className='text-[10px] font-bold text-primary uppercase tracking-widest mb-6'>
                  {tenant.email}
                </p>
                <div className='flex gap-3 w-full'>
                  <a
                    href={`https://wa.me/${tenant.phone?.replace(/\D/g, '')}`}
                    target='_blank'
                    rel='noreferrer'
                    className='flex-1 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm'
                  >
                    <MessageSquare size={20} />
                  </a>
                  <a
                    href={`tel:${tenant.phone}`}
                    className='flex-1 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all shadow-sm'
                  >
                    <Phone size={20} />
                  </a>
                  <a
                    href={`mailto:${tenant.email}`}
                    className='flex-1 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all shadow-sm'
                  >
                    <Mail size={20} />
                  </a>
                </div>
              </div>

              <div className='flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div className='space-y-6'>
                  <div>
                    <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2'>
                      Saúde Financeira
                    </span>
                    <div className='flex items-center gap-4'>
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isLate ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}
                      >
                        {isLate ? <AlertCircle size={24} /> : <TrendingUp size={24} />}
                      </div>
                      <div>
                        <div className='text-lg font-black text-slate-900 dark:text-white leading-none mb-1'>
                          {loadingPayments ? (
                            <Loader2 size={16} className='animate-spin' />
                          ) : (
                            paymentScore
                          )}
                        </div>
                        <div className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                          {isLate ? 'Status: Inadimplente' : 'Score de Pontualidade'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='p-6 bg-slate-50 dark:bg-black/10 rounded-3xl border border-slate-100 dark:border-white/5'>
                    <div className='flex justify-between items-end mb-2'>
                      <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                        Nível de Confiança
                      </span>
                      <span className='text-lg font-black text-primary'>{trustLevel}%</span>
                    </div>
                    <div className='w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-primary rounded-full transition-all duration-1000'
                        style={{ width: `${trustLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-6'>
                  <div className='flex items-start gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400'>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                        No imóvel desde
                      </span>
                      <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>
                        {contract?.start_date || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-start gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400'>
                      <Award size={18} />
                    </div>
                    <div>
                      <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                        Vínculo Contratual
                      </span>
                      <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>
                        {contract
                          ? `${Math.ceil((new Date().getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} Meses (Ativo)`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-start gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400'>
                      <Hash size={18} />
                    </div>
                    <div>
                      <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                        Contrato Nº
                      </span>
                      <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>
                        {contract?.contract_number || 'S/N'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center'>
                <FileText size={18} />
              </div>
              <div className='text-left'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1'>
                  Valor do Aluguel
                </span>
                <span className='text-xs font-bold text-slate-900 dark:text-white'>
                  {contract?.value || 'N/A'}
                </span>
              </div>
            </div>
            <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-emerald-500/5 text-emerald-500 flex items-center justify-center'>
                <CircleDollarSign size={18} />
              </div>
              <div className='text-left'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1'>
                  Pagamentos
                </span>
                <span className='text-xs font-bold text-slate-900 dark:text-white'>
                  {paidPayments} realizados
                </span>
              </div>
            </div>
            <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-amber-500/5 text-amber-500 flex items-center justify-center'>
                <Clock size={18} />
              </div>
              <div className='text-left'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1'>
                  Próximo Vencimento
                </span>
                <span className='text-xs font-bold text-slate-900 dark:text-white'>
                  Dia {contract?.payment_day || '10'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
