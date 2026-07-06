import React from 'react';
import { Building2, Bed, Bath, Maximize, Clock, Eye, ArrowRight } from 'lucide-react';
import { Property } from '../../../types';

interface PropertySelectionStepProps {
  loading: boolean;
  properties: Property[];
  selectedProperty: string;
  onSelect: (
    propertyId: string,
    propertyName: string,
    rentValue: string,
    depositValue: string
  ) => void;
}

export const PropertySelectionStep: React.FC<PropertySelectionStepProps> = ({
  loading,
  properties,
  selectedProperty,
  onSelect,
}) => {
  return (
    <div className='space-y-8 animate-fadeIn max-w-2xl mx-auto w-full'>
      <div className='text-center'>
        <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
          Selecione o Imóvel
        </h3>
        <p className='text-slate-500'>Para qual propriedade você deseja criar este contrato?</p>
      </div>
      <div className='flex flex-col gap-4'>
        {loading ? (
          <div className='flex flex-col items-center justify-center py-20 text-slate-400'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2'></div>
            <p className='text-xs font-bold uppercase tracking-widest'>Buscando imóveis...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className='text-center py-10 bg-white dark:bg-surface-dark rounded-3xl border border-dashed border-slate-200 dark:border-white/10'>
            <Building2 className='mx-auto text-slate-300 mb-2' />
            <p className='text-sm font-bold text-slate-500'>Nenhum imóvel disponível encontrado.</p>
          </div>
        ) : (
          properties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => {
                const cleanPrice = prop.price.replace(/[^\d,]/g, '').replace(',', '.');
                const rentVal = parseFloat(cleanPrice) || 0;
                onSelect(prop.id, prop.name, rentVal.toString(), (rentVal * 3).toString());
              }}
              className={`group relative overflow-hidden rounded-3xl border-2 text-left transition-all duration-300 flex flex-col bg-white dark:bg-surface-dark ${
                selectedProperty === prop.name
                  ? 'border-primary ring-4 ring-primary/10 shadow-2xl'
                  : 'border-white dark:border-white/5 hover:border-slate-200 dark:hover:border-white/20 shadow-sm hover:shadow-lg'
              }`}
            >
              <div className='flex items-stretch'>
                <div className='w-32 md:w-48 h-32 md:h-36 overflow-hidden shrink-0'>
                  <img
                    src={prop.image}
                    alt={prop.name}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                  />
                </div>
                <div className='flex-1 p-4 md:p-6 flex flex-col justify-between'>
                  <div>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest'>
                        {prop.status}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedProperty === prop.name ? 'border-primary bg-primary text-white scale-110' : 'border-slate-200 dark:border-white/5'}`}
                      >
                        {selectedProperty === prop.name && (
                          <div className='w-2 h-2 bg-white rounded-full' />
                        )}
                      </div>
                    </div>
                    <h4
                      className={`text-lg md:text-xl font-black tracking-tight leading-tight ${selectedProperty === prop.name ? 'text-primary' : 'text-slate-900 dark:text-white'}`}
                    >
                      {prop.name}
                    </h4>
                    <p className='text-xs md:text-sm text-slate-500 font-medium truncate opacity-80'>
                      {prop.address}
                    </p>
                  </div>
                  <div className='flex items-baseline gap-1 mt-auto'>
                    <span className='text-xs font-bold text-slate-400'>R$</span>
                    <span className='text-xl md:text-2xl font-black text-slate-900 dark:text-white'>
                      {prop.price}
                    </span>
                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>
                      por mês
                    </span>
                  </div>
                </div>
              </div>
              <div className='bg-slate-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 p-3 px-4 md:px-6 flex items-center justify-between'>
                <div className='flex items-center gap-4 md:gap-6'>
                  {[
                    { icon: Bed, value: prop.beds, label: 'Quartos' },
                    { icon: Bath, value: prop.baths, label: 'Banh.' },
                    { icon: Maximize, value: prop.area, label: 'Área' },
                    { icon: Clock, value: prop.vacantDays, label: 'Vago', hide: 'md' },
                    { icon: Eye, value: prop.visits, label: 'Visitas', hide: 'lg' },
                  ].map(({ icon: Icon, value, label, hide }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-1.5 ${hide ? `hidden ${hide}:flex` : ''}`}
                    >
                      <Icon size={14} className='text-slate-400' />
                      <div className='flex flex-col'>
                        <span className='text-xs font-black text-slate-900 dark:text-white leading-none'>
                          {value ?? 0}
                        </span>
                        <span className='text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>
                          {label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedProperty === prop.name && (
                  <div className='flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest animate-slideLeft'>
                    <ArrowRight size={14} /> Selecionado
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
