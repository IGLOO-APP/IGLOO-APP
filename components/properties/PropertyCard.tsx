import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, FilePlus2, Bed, Bath, Square, Clock, Eye, User } from 'lucide-react';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  onClick: (property: Property) => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onCreateContract?: (property: Property) => void;
  viewMode?: 'list' | 'grid' | 'compact';
  className?: string;
  isTenant?: boolean;
}

// Derives the left-border accent color from contract status
function getStatusBorder(property: Property): string {
  if (property.status === 'DISPONÍVEL') return ''; // no extra border

  if (property.contract) {
    if (property.contract.status === 'expired') {
      return 'border-l-[3px] border-l-red-500';
    }
    if (property.contract.status === 'expiring_soon' || (property.contract.days_remaining !== undefined && property.contract.days_remaining <= 30)) {
      return 'border-l-[3px] border-l-amber-400';
    }
  }

  if (property.status === 'ALUGADO') {
    return 'border-l-[3px] border-l-emerald-500';
  }

  return '';
}

// Vacancy time (mock 12d) or tenancy duration (mock 8m)
function getTimeLabel(property: Property): { label: string; sub: string } {
  if (property.status === 'DISPONÍVEL') {
    return { label: '12 d.', sub: 'tempo vago' };
  }

  if (property.contract?.start_date) {
    const start = new Date(property.contract.start_date);
    const now = new Date();
    const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    
    if (diffMonths === 0) return { label: 'Recente', sub: 'alugado' };
    if (diffMonths === 1) return { label: '1 mês', sub: 'alugado' };
    return { label: `${diffMonths} meses`, sub: 'alugado' };
  }

  return { label: '8 meses', sub: 'alugado' };
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  onEdit,
  onDelete,
  onCreateContract,
  viewMode = 'list',
  className = '',
  isTenant = false,
}) => {
  const navigate = useNavigate();
  const borderClass = getStatusBorder(property);
  const timeInfo = getTimeLabel(property);
  const isAvailable = property.status === 'DISPONÍVEL';
  const tenantName = property.tenant?.name;

  /* ─── COMPACT / DASHBOARD CARD ──────────────────────────── */
  if (viewMode === 'compact') {
    return (
      <article
        onClick={() => !isTenant && onClick(property)}
        className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 transition-all duration-200 ${!isTenant ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer active-tap' : 'cursor-default'} aspect-[4/5] ${borderClass} ${className}`}
      >
        {/* Photo Container */}
        <div className='h-full w-full relative overflow-hidden bg-slate-900'>
          {property.image ? (
            <div
              className='absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110'
              style={{ backgroundImage: `url(${property.image})` }}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-white/10 text-[10px] font-black uppercase tracking-[0.3em] select-none'>
                Meu Igloo
              </span>
            </div>
          )}
          {/* Overlay Gradient for readability */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity' />
          
          {/* Content Over Photo */}
          <div className='absolute bottom-0 left-0 right-0 p-3'>
             <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[8px] font-bold ring-1 ring-inset uppercase tracking-wide mb-1.5 ${property.status_color || 'bg-gray-100 text-gray-600'}`}
            >
              {property.status}
            </span>
            <h3 className='text-xs font-black text-white leading-tight line-clamp-1 uppercase tracking-tight'>
              {property.name}
            </h3>
            <p className='text-[10px] text-white/70 font-medium line-clamp-1'>
              {property.price} / mês
            </p>
          </div>

          {/* Mini Edit Action on Hover */}
          <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
             <div className='bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white'>
                <Eye size={12} />
             </div>
          </div>
        </div>
      </article>
    );
  }

  /* ─── GRID CARD ─────────────────────────────────────────── */
  if (viewMode === 'grid') {
    return (
      <article
        onClick={() => !isTenant && onClick(property)}
        className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 transition-all duration-200 ${!isTenant ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer active-tap' : 'cursor-default'} ${borderClass} ${className}`}
      >
        {/* Photo Container */}
        <div className='flex-grow min-h-[160px] w-full relative overflow-hidden bg-slate-900 rounded-t-2xl'>
          {property.image ? (
            <div
              className='absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110'
              style={{ backgroundImage: `url(${property.image})` }}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-white/10 text-xl font-black uppercase tracking-[0.4em] select-none'>
                Meu Igloo
              </span>
            </div>
          )}
          {/* Status badge overlay */}
          <div className='absolute top-3 left-3'>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset uppercase tracking-wide backdrop-blur-sm ${property.status_color || 'bg-gray-100 text-gray-600'}`}
            >
              {property.status}
            </span>
          </div>
          {/* Actions */}
          <div className='absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(property.id); }}
              aria-label='Editar'
              className='flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:bg-white shadow-sm transition-colors'
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(property.id); }}
              aria-label='Excluir'
              className='flex h-7 w-7 items-center justify-center rounded-lg bg-red-50/90 dark:bg-red-900/70 text-red-600 dark:text-red-400 hover:bg-red-100 shadow-sm transition-colors'
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex flex-col flex-1 p-4 gap-3'>
          {/* Name + address */}
          <div>
            <h3 className='text-base font-bold text-slate-900 dark:text-white leading-tight line-clamp-1'>
              {property.name}
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1'>
              {property.address}
            </p>
          </div>

          {/* Price */}
          <div>
            <p className='text-xl font-extrabold text-slate-900 dark:text-white leading-none'>
              {property.status === 'ALUGADO' ? (property.contract?.value || property.price) : property.price}
            </p>
            <p className='text-[10px] text-slate-400 font-medium mt-0.5'>por mês</p>
          </div>

          {/* Compact metrics */}
          {(property.bedrooms || (property.area && property.area !== '0m²' && property.area !== 'nullm²')) && (
            <div className='flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400'>
              {property.bedrooms ? (
                <span className='flex items-center gap-1'>
                  <Bed size={13} className='text-primary/70' />
                  <span className='font-bold text-slate-700 dark:text-slate-200'>{property.bedrooms}</span>
                </span>
              ) : null}
              {property.bedrooms && property.area && property.area !== '0m²' && property.area !== 'nullm²' && (
                <span className='w-px h-3 bg-gray-200 dark:bg-white/10' />
              )}
              {property.area && property.area !== '0m²' && property.area !== 'nullm²' ? (
                <span className='flex items-center gap-1'>
                  <Square size={13} className='text-primary/70' />
                  <span className='font-bold text-slate-700 dark:text-slate-200'>{property.area}</span>
                </span>
              ) : null}
            </div>
          )}

          {/* Action */}
          <div className='mt-auto'>
            {isAvailable && onCreateContract ? (
              <button
                onClick={(e) => { e.stopPropagation(); onCreateContract(property); }}
                className='w-full flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all active-tap'
              >
                <FilePlus2 size={14} /> Criar Contrato
              </button>
            ) : tenantName ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/tenants');
                }}
                className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors'
              >
                <User size={13} className='text-slate-400' />
                <span className='truncate'>{tenantName}</span>
              </button>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  /* ─── LIST CARD ──────────────────────────────────────────── */
  return (
    <article
      onClick={() => !isTenant && onClick(property)}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 transition-all duration-200 ${!isTenant ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer active-tap' : 'cursor-default'} ${borderClass} ${className}`}
    >
      {/* ── ZONE SUPERIOR ──────────────────────────────────── */}
      <div className='flex items-stretch'>
        {/* Photo Container */}
        <div className='w-[120px] shrink-0 relative overflow-hidden bg-slate-900 rounded-tl-2xl rounded-bl-2xl'>
          {property.image ? (
            <div
              className='absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110'
              style={{ backgroundImage: `url(${property.image})` }}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-white/10 text-[8px] font-black uppercase tracking-[0.3em] select-none text-center px-2'>
                Meu Igloo
              </span>
            </div>
          )}
        </div>

        {/* Info — two columns */}
        <div className='flex flex-1 min-w-0 p-4 gap-4'>
          {/* Left column: badge + name + address */}
          <div className='flex-1 min-w-0 flex flex-col justify-center gap-1.5'>
            <span
              className={`inline-flex self-start items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset uppercase tracking-wide ${property.status_color || 'bg-gray-100 text-gray-600'}`}
            >
              {property.status}
            </span>
            <h3 className='text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-1'>
              {property.name}
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400 line-clamp-1'>
              {property.address}
            </p>
          </div>

          {/* Right column: price + actions */}
          <div className='flex flex-col items-end justify-between shrink-0'>
            <div className='flex gap-1 h-6'>
            </div>

            {/* Price */}
            <div className='text-right'>
              <p className='text-xl font-extrabold text-slate-900 dark:text-white leading-none'>
                {property.status === 'ALUGADO' ? (property.contract?.value || property.price) : property.price}
              </p>
              <p className='text-[10px] text-slate-400 font-medium mt-0.5'>por mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── DIVISOR ────────────────────────────────────────── */}
      <div className='mx-4 border-t border-gray-100 dark:border-white/5' />

      {/* ── ZONE INFERIOR — métricas + ação ────────────────── */}
      <div className='flex items-center px-4 py-3 gap-3'>
        {/* Metrics row */}
        <div className='flex flex-1 items-center gap-0 overflow-hidden'>

          {/* Quartos */}
          {property.bedrooms ? (
            <>
              <div className='flex items-center gap-1.5 pr-3'>
                <Bed size={14} className='text-slate-400 shrink-0' />
                <div className='flex flex-col leading-none'>
                  <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>{property.bedrooms}</span>
                  <span className='text-[9px] text-slate-400 font-medium uppercase tracking-wide'>quartos</span>
                </div>
              </div>
              <div className='w-px h-6 bg-gray-100 dark:bg-white/10 shrink-0 mx-0.5' />
            </>
          ) : null}

          {/* Banheiros */}
          {property.bathrooms ? (
            <>
              <div className='flex items-center gap-1.5 px-3'>
                <Bath size={14} className='text-slate-400 shrink-0' />
                <div className='flex flex-col leading-none'>
                  <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>{property.bathrooms}</span>
                  <span className='text-[9px] text-slate-400 font-medium uppercase tracking-wide'>banheiros</span>
                </div>
              </div>
              <div className='w-px h-6 bg-gray-100 dark:bg-white/10 shrink-0 mx-0.5' />
            </>
          ) : null}

          {/* Área */}
          {property.area && property.area !== '0m²' && property.area !== 'nullm²' ? (
            <>
              <div className='flex items-center gap-1.5 px-3'>
                <Square size={14} className='text-slate-400 shrink-0' />
                <div className='flex flex-col leading-none'>
                  <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>{property.area}</span>
                  <span className='text-[9px] text-slate-400 font-medium uppercase tracking-wide'>área total</span>
                </div>
              </div>
              <div className='w-px h-6 bg-gray-100 dark:bg-white/10 shrink-0 mx-0.5' />
            </>
          ) : null}

          {/* Tempo / Visualizações */}
          <div className='flex items-center gap-1.5 px-3'>
            <Clock size={14} className='text-slate-400 shrink-0' />
            <div className='flex flex-col leading-none'>
              <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>{timeInfo.label}</span>
              <span className='text-[9px] text-slate-400 font-medium uppercase tracking-wide'>{timeInfo.sub}</span>
            </div>
          </div>

          {!isTenant && (
            <>
              <div className='hidden sm:block w-px h-6 bg-gray-100 dark:bg-white/10 shrink-0 mx-0.5' />

              {/* Views */}
              <div className='hidden sm:flex items-center gap-1.5 pl-3'>
                <Eye size={14} className='text-slate-400 shrink-0' />
                <div className='flex flex-col leading-none'>
                  <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>24</span>
                  <span className='text-[9px] text-slate-400 font-medium uppercase tracking-wide'>visitas</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right action */}
        <div className='shrink-0'>
          {isAvailable && onCreateContract ? (
            <button
              onClick={(e) => { e.stopPropagation(); onCreateContract(property); }}
              className='flex h-9 px-3 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all active-tap whitespace-nowrap'
            >
              <FilePlus2 size={14} /> Criar Contrato
            </button>
          ) : tenantName ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/tenants');
              }}
              className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap max-w-[140px] hover:bg-slate-100 dark:hover:bg-white/10 transition-colors'
            >
              <User size={13} className='text-slate-400 shrink-0' />
              <span className='truncate'>{tenantName}</span>
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
};
