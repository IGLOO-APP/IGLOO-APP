import React, { useState } from 'react';
import {
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Calendar,
  CheckCircle,
  DollarSign,
  ClipboardCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  Square,
  Clock,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Property } from '../../types';
import { ModalWrapper } from '../ui/ModalWrapper';
import { PropertyInspection } from './PropertyInspection';
import { PropertyDocuments } from './PropertyDocuments';
import { TenantProfileConfigPanel } from './TenantProfileConfigPanel';

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onClose, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inspections' | 'docs' | 'tenantConfig'>('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use real gallery images if available, fallback to mock for demo if empty
  const images = property.galleryImages && property.galleryImages.length > 0 
    ? [property.image, ...property.galleryImages]
    : [
        property.image,
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1000',
      ];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getTimeLabel = (property: Property) => {
    if (property.status === 'ALUGADO') {
      return { label: '8 meses', sub: 'alugado' };
    }
    return { label: '12 d.', sub: 'tempo vago' };
  };

  const timeInfo = getTimeLabel(property);

  const openGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(property.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <>
      <ModalWrapper
        onClose={onClose}
        className='md:max-w-3xl bg-background-light dark:bg-background-dark'
      >
        {/* Multi-Photo Carousel */}
        <div className='h-64 w-full relative group shrink-0 overflow-hidden bg-slate-900'>
          {/* Photos */}
          <div 
            className='absolute inset-0 bg-cover bg-center transition-all duration-500 ease-in-out transform'
            style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
          />

          {/* Gradients */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent'></div>
          <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent'></div>

          {/* Navigation Arrows */}
          <div className='absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button 
              onClick={prevImage}
              className='p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all transform hover:scale-110'
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextImage}
              className='p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all transform hover:scale-110'
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Dots Pagination */}
          <div className='absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5 z-10'>
            {images.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>

          {/* Content Overlay */}
          <div className='absolute bottom-0 left-0 p-6 w-full z-10'>
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-black ring-1 ring-inset uppercase tracking-widest mb-2 bg-white/90 backdrop-blur-sm ${property.status_color?.replace('bg-', 'text-').replace('/10', '')}`}
            >
              {property.status}
            </span>
            <div className='flex items-end justify-between'>
              <div>
                <h2 className='text-2xl font-black text-white leading-tight shadow-sm'>
                  {property.name}
                </h2>
                <p className='text-gray-200 text-xs flex items-center gap-1 mt-1 font-bold uppercase tracking-wider'>
                  <MapPin size={14} /> {property.address}
                </p>
              </div>
              <button 
                onClick={openGoogleMaps}
                className='p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all'
                title='Ver no Google Maps'
              >
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className='bg-white dark:bg-surface-dark px-6 border-b border-gray-100 dark:border-white/5 shrink-0 overflow-x-auto hide-scrollbar'>
          <div className='flex gap-8'>
            {[
              { id: 'overview', label: 'Visão Geral', icon: User },
              { id: 'inspections', label: 'Vistorias', icon: ClipboardCheck },
              { id: 'docs', label: 'Documentos', icon: FileText },
              { id: 'tenantConfig', label: 'Perfil do Inquilino', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6 bg-background-light dark:bg-background-dark scroll-smooth'>
          {activeTab === 'overview' && (
            <div className='space-y-6 animate-fadeIn'>
              <div className='flex items-center justify-between'>
                <h3 className='text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest'>Informações Básicas</h3>
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
              
              {/* Key Stats Grid */}
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                <div className='bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
                  <div className='flex items-center gap-2 mb-1'>
                    <DollarSign size={14} className='text-primary' />
                    <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
                      Aluguel
                    </p>
                  </div>
                  <p className='text-slate-900 dark:text-white text-lg font-black'>
                    {property.price}
                  </p>
                </div>

                <div className='bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Square size={14} className='text-primary' />
                    <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
                      Área
                    </p>
                  </div>
                  <p className='text-slate-900 dark:text-white text-lg font-black'>
                    {property.area}
                  </p>
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
                    <Clock size={14} className='text-primary' />
                    <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
                      {timeInfo.sub}
                    </p>
                  </div>
                  <p className='text-slate-900 dark:text-white text-lg font-black'>
                    {timeInfo.label}
                  </p>
                </div>

                <div className='bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Eye size={14} className='text-primary' />
                    <p className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest'>
                      Visitas
                    </p>
                  </div>
                  <p className='text-slate-900 dark:text-white text-lg font-black'>
                    24
                  </p>
                </div>
              </div>

              {/* Tenant Info */}
              {property.tenant ? (
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
                  <div className='flex items-center gap-4 mb-5'>
                    <div
                      className='h-14 w-14 rounded-2xl bg-cover bg-center border-2 border-slate-100 dark:border-gray-700 shadow-sm'
                      style={{ backgroundImage: `url(${property.tenant.image})` }}
                    ></div>
                    <div>
                      <p className='text-lg font-black text-slate-900 dark:text-white leading-tight'>
                        {property.tenant.name}
                      </p>
                      <p className='text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1'>Contrato vigente</p>
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
                  <h3 className='text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm'>Imóvel Vago</h3>
                  <p className='text-slate-500 dark:text-slate-400 text-xs mt-1 mb-6 max-w-[200px]'>
                    Este imóvel está disponível para locação.
                  </p>
                  <button className='px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-slate-900/20'>
                    Anunciar Imóvel
                  </button>
                </div>
              )}

              {/* Contract Info */}
              {property.contract && (
                <div className='bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm'>
                  <div className='flex items-center justify-between mb-5'>
                    <h3 className='text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest flex items-center gap-2'>
                      <FileText size={18} className='text-indigo-500' />
                      Contrato
                    </h3>
                    <button className='text-primary text-[10px] font-black uppercase tracking-widest hover:underline'>Ver PDF</button>
                  </div>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center pb-3 border-b border-gray-50 dark:border-gray-800'>
                      <span className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2'>
                        <Calendar size={14} /> Início
                      </span>
                      <span className='text-slate-900 dark:text-white font-bold text-sm'>
                        {property.contract.start_date}
                      </span>
                    </div>
                    <div className='flex justify-between items-center pb-3 border-b border-gray-50 dark:border-gray-800'>
                      <span className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2'>
                        <CheckCircle size={14} /> Término
                      </span>
                      <span className='text-slate-900 dark:text-white font-bold text-sm'>
                        {property.contract.end_date}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2'>
                        <DollarSign size={14} /> Valor Mensal
                      </span>
                      <span className='text-slate-900 dark:text-white font-black text-sm'>
                        {property.contract.value}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inspections' && (
            <div className='animate-fadeIn'>
              <PropertyInspection property={property} onClose={() => setActiveTab('overview')} initialView='list' />
            </div>
          )}

          {activeTab === 'docs' && (
            <div className='animate-fadeIn'>
              <PropertyDocuments property={property} onClose={() => setActiveTab('overview')} />
            </div>
          )}

          {activeTab === 'tenantConfig' && (
            <div className='animate-fadeIn'>
              <TenantProfileConfigPanel propertyId={property.id.toString()} />
            </div>
          )}
        </div>
      </ModalWrapper>
    </>
  );
};
