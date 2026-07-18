import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, FilePlus2, Bed, Bath, Square, Clock, Eye, User } from 'lucide-react';
import { Property } from '../../types';
import { Button } from '@/components/ui/button';

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

// Vacancy time (mock 12d) or tenancy duration (mock 8m)  
function getTimeLabel(property: Property): { label: string; sub: string } {
  if (property.status === 'DISPONÍVEL') {
    return { label: '12 d.', sub: 'tempo vago' };
  }

  if (property.contract?.start_date) {
    const startStr = property.contract.start_date;
    let start = new Date(startStr);

    if (isNaN(start.getTime()) && startStr.includes('/')) {
      start = new Date(startStr.split('/').reverse().join('-'));
    }

    if (!isNaN(start.getTime())) {
      const now = new Date();
      const diffMonths =
        (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

      if (diffMonths <= 0) return { label: 'Recente', sub: 'alugado' };
      if (diffMonths === 1) return { label: '1 mês', sub: 'alugado' };
      return { label: `${diffMonths} meses`, sub: 'alugado' };
    }
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
  const timeInfo = getTimeLabel(property);
  const isAvailable = property.status === 'DISPONÍVEL';
  const tenantName = property.tenant?.name;

  /* ─── COMPACT / DASHBOARD CARD ──────────────────────────── */
  if (viewMode === 'compact') {
    return (
      <div
        onClick={() => !isTenant && onClick(property)}
        className={`lg-card lg-card-lift group flex flex-col overflow-hidden ${!isTenant ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer active-tap' : 'cursor-default'} aspect-[4/5] p-0 gap-0 ${className}`}
      >
        {/* Photo Container */}
        <div className='h-full w-full relative overflow-hidden rounded-2xl'>
          {property.image ? (
            <div
              className='absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 will-change-transform'
              style={{ backgroundImage: `url(${property.image})` }}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center bg-white/5'>
              <span className='text-white/10 text-[10px] font-black uppercase tracking-[0.3em] select-none'>
                Meu Igloo
              </span>
            </div>
          )}
          {/* Overlay Gradient for readability */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity' />

          {/* Content Over Photo */}
          <div className='absolute bottom-0 left-0 right-0 p-3'>
            <span className='inline-flex items-center rounded-md px-1.5 py-0.5 text-[8px] font-bold bg-white/10 text-slate-300 border border-white/10 uppercase tracking-wide mb-1.5'>
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
              <Eye size={12} strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── GRID CARD ─────────────────────────────────────────── */
  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => !isTenant && onClick(property)}
        className={`lg-card lg-card-lift group flex flex-col ${!isTenant ? 'cursor-pointer active-tap' : 'cursor-default'} h-[360px] w-full p-0 gap-0 ${className}`}
      >
        {/* Photo Container */}
        <div className='h-44 w-full shrink-0 relative overflow-hidden rounded-t-2xl'>
          {property.image ? (
            <div
              className='absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 will-change-transform'
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
            <span className='inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10 uppercase tracking-wide backdrop-blur-sm'>
              {property.status}
            </span>
          </div>
          {/* Actions */}
          <div className='absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(property.id);
              }}
              aria-label='Editar'
              className='flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-slate-400 hover:bg-white/20 transition-colors'
            >
              <Edit2 size={13} strokeWidth={1.8} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(property.id);
              }}
              aria-label='Excluir'
              className='flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors'
            >
              <Trash2 size={13} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Content — fixed row heights for strict consistency */}
        <div className='flex flex-col flex-1 p-4'>
          {/* Name + address */}
          <div className='h-[50px] overflow-hidden'>
            <h3 className='text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-1'>
              {property.name}
            </h3>
            <p
              className='text-[11px] text-slate-400 mt-0.5 line-clamp-2'
              title={property.address}
            >
              {property.address}
            </p>
          </div>

          {/* Price — fixed height */}
          <div className='h-[46px] flex flex-col justify-center'>
            <p className='text-lg font-extrabold text-slate-900 dark:text-white leading-none'>
              {property.status === 'ALUGADO'
                ? property.contract?.value || property.price
                : property.price}
            </p>
            <p className='text-[9px] text-slate-400 font-medium mt-0.5'>por mês</p>
          </div>

          {/* Compact metrics + tenant inline — fixed height */}
          <div className='h-[24px] flex items-center gap-2 text-[11px] text-slate-400'>
            {property.bedrooms ? (
              <span className='flex items-center gap-1'>
                <Bed size={12} strokeWidth={1.8} className='text-primary/70' />
                <span className='font-bold text-slate-900 dark:text-white'>{property.bedrooms}</span>
              </span>
            ) : null}
            {property.area && property.area !== '0m²' && property.area !== 'nullm²' && (
              <>
                <span className='w-px h-3 bg-white/10' />
                <span className='flex items-center gap-1'>
                  <Square size={12} strokeWidth={1.8} className='text-primary/70' />
                  <span className='font-bold text-slate-900 dark:text-white'>{property.area}</span>
                </span>
              </>
            )}
            {tenantName && (
              <>
                <span className='w-px h-3 bg-white/10' />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/tenants');
                  }}
                  className='flex items-center gap-1 hover:text-primary transition-colors'
                >
                  <User size={12} strokeWidth={1.8} className='text-slate-400' />
                  <span className='font-bold text-slate-400 truncate max-w-[100px]'>
                    {tenantName}
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Action — fixed height, shows button or empty spacer */}
          <div className='mt-auto h-8'>
            {isAvailable && onCreateContract ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateContract(property);
                }}
                variant='glass'
                className='w-full h-8 text-xs font-bold'
              >
                <FilePlus2 size={13} strokeWidth={1.8} className='mr-1.5' /> Criar Contrato
              </Button>
            ) : (
              <div className='h-8' />
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─── LIST CARD ──────────────────────────────────────────── */
  return (
    <div
      onClick={() => !isTenant && onClick(property)}
      className={`lg-card lg-card-lift group flex flex-col overflow-hidden ${!isTenant ? 'cursor-pointer active-tap' : 'cursor-default'} p-0 gap-0 ${className}`}
    >
      {/* ── ZONE SUPERIOR ──────────────────────────────────── */}
      <div className='flex items-stretch'>
        {/* Photo Container */}
        <div className='w-[120px] shrink-0 relative overflow-hidden rounded-tl-2xl rounded-bl-2xl'>
          {property.image ? (
            <div
              className='absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110'
              style={{ backgroundImage: `url(${property.image})` }}
            />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center bg-white/5'>
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
            <span className='inline-flex self-start items-center rounded-md px-2 py-0.5 text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10 uppercase tracking-wide'>
              {property.status}
            </span>
            <h3 className='text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-1'>
              {property.name}
            </h3>
            <p className='text-xs text-slate-400 line-clamp-1'>{property.address}</p>
          </div>

          {/* Right column: price + actions */}
          <div className='flex flex-col items-end justify-between shrink-0'>
            <div className='flex gap-1 h-6'></div>

            {/* Price */}
            <div className='text-right'>
              <p className='text-xl font-extrabold text-slate-900 dark:text-white leading-none'>
                {property.status === 'ALUGADO'
                  ? property.contract?.value || property.price
                  : property.price}
              </p>
              <p className='text-[10px] text-slate-400 font-medium mt-0.5'>por mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── DIVISOR ────────────────────────────────────────── */}
      <div className='mx-4 border-t border-white/10' />

      {/* ── ZONE INFERIOR — métricas + ação ────────────────── */}
      <div className='flex items-center px-4 py-3 gap-3'>
        {/* Metrics row */}
        <div className='flex flex-1 items-center gap-0 overflow-hidden'>
          {/* Quartos */}
          {property.bedrooms ? (
            <>
              <div className='flex items-center gap-1.5 pr-3'>
                <Bed size={14} strokeWidth={1.8} className='text-slate-400 shrink-0' />
                <div className='flex flex-col leading-none'>
                  <span className='text-sm font-bold text-slate-900 dark:text-white'>
                    {property.bedrooms}
                  </span>
                  <span className='text-[9px] text-slate-400 font-medium uppercase tracking-wide'>
                    quartos
                  </span>
                </div>
              </div>
              <div className='w-px h-6 bg-white/10 shrink-0 mx-0.5' />
            </>
          ) : null}

          {/* Banheiros */}
          {property.bathrooms ? (
            <>
              <div className='flex items-center gap-1.5 px-3'>
                <Bath size={14} strokeWidth={1.8} className='text-slate-400 shrink-0' />
                <div className='flex flex-col leading-none'>
                  <span className='text-sm font-bold text-slate-900 dark:text-white'>
                    {property.bathrooms}
                  </span>
                  <span className='text-[9px] text-slate-400 font-medium uppercase tracking-wide'>
                    banheiros
                  </span>
                </div>
              </div>
              <div className='w-px h-6 bg-white/10 shrink-0 mx-0.5' />
            </>
          ) : null}

          {/* Área */}
          {property.area && property.area !== '0m²' && property.area !== 'nullm²' ? (
            <>
              <div className='flex items-center gap-1.5 px-3'>
                <Square size={14} strokeWidth={1.8} className='text-slate-400 shrink-0' />
                <div className='flex flex-col leading-none'>
                  <span className='text-sm font-bold text-slate-900 dark:text-white'>{property.area}</span>
                  <span className='text-[9px] text-slate-400 font-medium uppercase tracking-wide'>
                    área total
                  </span>
                </div>
              </div>
              <div className='w-px h-6 bg-white/10 shrink-0 mx-0.5' />
            </>
          ) : null}

          {/* Tempo */}
          <div className='flex items-center gap-1.5 px-3'>
            <Clock size={14} strokeWidth={1.8} className='text-slate-400 shrink-0' />
            <div className='flex flex-col leading-none'>
              <span className='text-sm font-bold text-slate-900 dark:text-white'>{timeInfo.label}</span>
              <span className='text-[9px] text-slate-400 font-medium uppercase tracking-wide'>
                {timeInfo.sub}
              </span>
            </div>
          </div>

          {!isTenant && (
            <>
              <div className='hidden sm:block w-px h-6 bg-white/10 shrink-0 mx-0.5' />

              {/* Views */}
              <div className='hidden sm:flex items-center gap-1.5 pl-3'>
                <Eye size={14} strokeWidth={1.8} className='text-slate-400 shrink-0' />
                <div className='flex flex-col leading-none'>
                  <span className='text-sm font-bold text-slate-900 dark:text-white'>24</span>
                  <span className='text-[9px] text-slate-400 font-medium uppercase tracking-wide'>
                    visitas
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right action */}
        <div className='shrink-0'>
          {isAvailable && onCreateContract ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onCreateContract(property);
              }}
              variant='glass'
              className='h-9 px-3 text-xs font-bold whitespace-nowrap'
            >
              <FilePlus2 size={14} strokeWidth={1.8} className='mr-1.5' /> Criar Contrato
            </Button>
          ) : tenantName ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/tenants');
              }}
              variant='outline'
              className='flex h-9 items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-slate-400 hover:text-white whitespace-nowrap max-w-[140px] hover:bg-white/10 transition-colors'
            >
              <User size={13} strokeWidth={1.8} className='text-slate-400 shrink-0' />
              <span className='truncate'>{tenantName}</span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
