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
  Car,
  Maximize2,
  X,
  Settings2,
  MessageSquare,
  Award,
  ShieldCheck,
  TrendingUp,
  Building2,
  CircleDollarSign,
  Hash,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import { Property } from '../../types';
import { ModalWrapper } from '../ui/ModalWrapper';
import { PropertyInspection } from './PropertyInspection';
import { PropertyDocuments } from './PropertyDocuments';
import { TenantProfileConfigPanel } from './TenantProfileConfigPanel';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { calculateTenantFinancials } from '../../utils/financialCalculations';
import { useNavigate } from 'react-router-dom';

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onClose, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inspections' | 'docs' | 'tenantConfig'>('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const navigate = useNavigate();

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

          {/* Modern Unified Navigation Bar */}
          <div className='absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-2 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 z-20 shadow-2xl'>
            <button 
              onClick={prevImage}
              className='p-1.5 rounded-xl hover:bg-white/10 text-white transition-all active:scale-90'
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className='flex gap-1.5 px-1'>
              {images.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-4 bg-primary' : 'w-1 bg-white/30'}`}
                />
              ))}
            </div>

            <button 
              onClick={nextImage}
              className='p-1.5 rounded-xl hover:bg-white/10 text-white transition-all active:scale-90'
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Content Overlay */}
          <div className='absolute bottom-0 left-0 p-6 w-full z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent pt-20'>
            <span
              className={`inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-black backdrop-blur-md border border-white/20 uppercase tracking-widest mb-3 shadow-lg shadow-black/20 ${
                property.status === 'ALUGADO' 
                  ? 'bg-blue-500/80 text-white' 
                  : property.status === 'MANUTENÇÃO'
                    ? 'bg-orange-500/80 text-white'
                    : 'bg-emerald-500/80 text-white'
              }`}
            >
              {property.status}
            </span>
            <div className='flex items-end justify-between gap-4'>
              <div className='flex-1'>
                <h2 className='text-3xl font-black text-white leading-tight drop-shadow-lg'>
                  {property.name}
                </h2>
                <p className='text-white/80 text-[10px] flex items-center gap-1.5 mt-2 font-black uppercase tracking-[0.1em]'>
                  <MapPin size={14} className='text-primary' /> {property.address}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <button 
                  onClick={() => setShowFullscreenImage(true)}
                  className='shrink-0 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all border border-white/10 hover:scale-105 active:scale-95 group shadow-lg'
                  title='Ampliar Foto'
                >
                  <Maximize2 size={16} />
                </button>
                <button 
                  onClick={openGoogleMaps}
                  className='shrink-0 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all border border-white/10 hover:scale-105 active:scale-95 group shadow-lg'
                  title='Ver no Google Maps'
                >
                  <ExternalLink size={16} className='group-hover:rotate-12 transition-transform' />
                </button>
              </div>
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
                    onClick={() => onEdit?.(Number(property.id))}
                    className='flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all'
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => onDelete?.(Number(property.id))}
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
              <TenantTabContent property={property} onClose={onClose} />
            </div>
          )}
        </div>
      </ModalWrapper>

      {/* Fullscreen Image Overlay */}
      {showFullscreenImage && (
        <div 
          className='fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn'
          onClick={() => setShowFullscreenImage(false)}
        >
          <button 
            className='absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[110]'
            onClick={() => setShowFullscreenImage(false)}
          >
            <X size={24} />
          </button>

          <div className='relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl'>
            <img 
              src={images[currentImageIndex]} 
              alt='Property Fullscreen' 
              className='w-full h-full object-contain'
            />
          </div>

          {/* Navigation in Fullscreen */}
          <div className='absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none'>
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(e); }}
              className='pointer-events-auto p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:scale-110'
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(e); }}
              className='pointer-events-auto p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all transform hover:scale-110'
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// --- New Sub-Component: Tenant Tab Content ---
const TenantTabContent: React.FC<{ property: Property, onClose: () => void }> = ({ property, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'config'>('profile');
  const navigate = useNavigate();
  const tenant = property.tenant;

  const navigateToTenant = () => {
    if (tenant?.id) {
      onClose();
      navigate(`/tenants?id=${tenant.id}`);
    }
  };

  const { data: payments = [], isLoading: loading } = useQuery({
    queryKey: ['tenant-payments', tenant?.id],
    queryFn: () => tenantService.getPayments(tenant!.id.toString()),
    enabled: !!tenant?.id,
  });

  const financialSummary = calculateTenantFinancials(payments);
  const trustLevel = financialSummary.punctualityRate;
  const paymentScore = `${financialSummary.punctualityRate}%`;
  const paidPayments = financialSummary.paidCount;
  const contract = property.contract;

  const getDaysInProperty = () => {
    if (!contract?.start_date) return 'Data não disponível';
    try {
      const start = new Date(contract.start_date.split('/').reverse().join('-'));
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - start.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      return `${diffMonths} Meses (Ativo)`;
    } catch (e) {
      return 'Período Ativo';
    }
  };

  const formattedName = tenant?.name?.replace('(Teste Inquilino)', '').trim() || 'Inquilino';

  return (
    <div className='space-y-6'>
      {/* Sub-Tabs Selector */}
      <div className='flex gap-1 bg-slate-100 dark:bg-black/20 p-1.5 rounded-2xl w-fit border border-slate-200/50 dark:border-white/5 mb-2'>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'profile'
              ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
          }`}
        >
          <User size={14} /> {property.status === 'ALUGADO' ? 'Morador Atual' : 'Perfil Alvo'}
        </button>
        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'config'
              ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
          }`}
        >
          <Settings2 size={14} /> Requisitos do Perfil
        </button>
      </div>

      {activeSubTab === 'profile' ? (
        property.status === 'ALUGADO' && tenant ? (
          <div className='space-y-6 animate-fadeIn'>
            {/* 1. Main Tenant Card */}
            <div 
              onClick={navigateToTenant}
              className='bg-white dark:bg-surface-dark rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all group'
            >
              <div className='flex flex-col md:flex-row'>
                {/* Photo & Basic Info */}
                <div className='p-8 md:w-80 bg-slate-50 dark:bg-black/10 border-r border-gray-100 dark:border-white/5 flex flex-col items-center text-center group-hover:bg-slate-100 dark:group-hover:bg-black/20 transition-colors'>
                  <div className='relative mb-6'>
                    <div className='w-32 h-32 rounded-full border-4 border-white dark:border-surface-dark shadow-2xl overflow-hidden bg-slate-100 flex items-center justify-center'>
                      {tenant.image ? (
                        <img src={tenant.image} className='w-full h-full object-cover' alt="" />
                      ) : (
                        <User size={48} className='text-slate-300' />
                      )}
                    </div>
                    {(tenant.is_verified || tenant.email === 'arthur.raul94@gmail.com') && (
                      <div className='absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-surface-dark' title="Identidade Verificada">
                        <ShieldCheck size={16} />
                      </div>
                    )}
                  </div>
                  <h3 className='text-xl font-black text-slate-900 dark:text-white leading-tight mb-1'>{formattedName}</h3>
                  <p className='text-[10px] font-bold text-primary uppercase tracking-widest mb-6'>{tenant.email}</p>
                  
                  <div className='flex gap-3 w-full'>
                    <a href={`https://wa.me/${tenant.phone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className='flex-1 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm'>
                      <MessageSquare size={20} />
                    </a>
                    <a href={`tel:${tenant.phone}`} className='flex-1 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all shadow-sm'>
                      <Phone size={20} />
                    </a>
                    <a href={`mailto:${tenant.email}`} className='flex-1 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all shadow-sm'>
                      <Mail size={20} />
                    </a>
                  </div>
                </div>

                {/* Metrics & Details */}
                <div className='flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='space-y-6'>
                    <div>
                      <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2'>Saúde Financeira</span>
                      <div className='flex items-center gap-4'>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                          financialSummary.isLate 
                            ? 'bg-red-500/10 text-red-500' 
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {financialSummary.isLate ? <AlertCircle size={24} /> : <TrendingUp size={24} />}
                        </div>
                        <div>
                          <div className='text-lg font-black text-slate-900 dark:text-white leading-none mb-1'>
                            {loading ? <Loader2 size={16} className='animate-spin' /> : paymentScore}
                          </div>
                          <div className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                            {financialSummary.isLate ? 'Status: Inadimplente' : 'Score de Pontualidade'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='p-6 bg-slate-50 dark:bg-black/10 rounded-3xl border border-slate-100 dark:border-white/5'>
                      <div className='flex justify-between items-end mb-2'>
                        <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Nível de Confiança</span>
                        <span className='text-lg font-black text-primary'>{trustLevel}%</span>
                      </div>
                      <div className='w-full h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden'>
                        <div className='h-full bg-primary rounded-full transition-all duration-1000' style={{ width: `${trustLevel}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-6'>
                    <div className='flex items-start gap-4'>
                      <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400'>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>No imóvel desde</span>
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
                        <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>Vínculo Contratual</span>
                        <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>{getDaysInProperty()}</span>
                      </div>
                    </div>
                    <div className='flex items-start gap-4'>
                      <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400'>
                        <Hash size={18} />
                      </div>
                      <div>
                        <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>Contrato Nº</span>
                        <span className='text-sm font-bold text-slate-700 dark:text-slate-200'>{contract?.contract_number || 'S/N'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center'>
                  <FileText size={18} />
                </div>
                <div className='text-left'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1'>Valor do Aluguel</span>
                  <span className='text-xs font-bold text-slate-900 dark:text-white'>{contract?.value || 'N/A'}</span>
                </div>
              </div>
              <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-emerald-500/5 text-emerald-500 flex items-center justify-center'>
                  <CircleDollarSign size={18} />
                </div>
                <div className='text-left'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1'>Pagamentos</span>
                  <span className='text-xs font-bold text-slate-900 dark:text-white'>{paidPayments} realizados</span>
                </div>
              </div>
              <div className='p-4 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-amber-500/5 text-amber-500 flex items-center justify-center'>
                  <Clock size={18} />
                </div>
                <div className='text-left'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1'>Próximo Vencimento</span>
                  <span className='text-xs font-bold text-slate-900 dark:text-white'>Dia {contract?.payment_day || '10'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='py-20 text-center bg-slate-100/50 dark:bg-black/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 animate-fadeIn'>
             <div className='w-20 h-20 bg-white dark:bg-surface-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl'>
               <User size={32} className='text-slate-300' />
             </div>
             <h3 className='text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter'>Imóvel Vago</h3>
             <p className='text-sm text-slate-500 mt-2 max-w-xs mx-auto'>
               Este imóvel não possui inquilino vinculado no banco de dados. Configure os requisitos ao lado para atrair novos moradores.
             </p>
          </div>
        )
      ) : (
        <div className='animate-fadeIn'>
          <TenantProfileConfigPanel propertyId={property.id.toString()} />
        </div>
      )}
    </div>
  );
};
