import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  ClipboardCheck,
  FileText,
  User,
  ExternalLink,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { GlassmorphismNav } from '../../components/ui/GlassmorphismNav';
import { usePropertyDetails } from './hooks/usePropertyDetails';
import { OverviewTab } from './sections/OverviewTab';
import { InspectionsTab } from './sections/InspectionsTab';
import { DocsTab } from './sections/DocsTab';
import { TenantConfigTab } from './sections/TenantConfigTab';
import { UtilitiesTab } from './sections/UtilitiesTab';
import { ImageViewerModal } from './modals/ImageViewerModal';
import { propertyService } from '../../services/propertyService';

const PropertyDetailsPage: React.FC = () => {
  const h = usePropertyDetails();

  if (h.isLoading) {
    return (
      <div className='p-8 space-y-6 bg-background-light dark:bg-background-dark min-h-screen animate-pulse'>
        <div className='h-4 w-36 bg-gray-200 dark:bg-white/10 rounded' />
        <div className='h-64 w-full bg-gray-200 dark:bg-white/10 rounded-[32px]' />
        <div className='h-11 bg-gray-200 dark:bg-white/10 rounded-xl' />
        <div className='grid grid-cols-3 gap-4'>
          <div className='h-24 bg-gray-200 dark:bg-white/10 rounded-2xl' />
          <div className='h-24 bg-gray-200 dark:bg-white/10 rounded-2xl' />
          <div className='h-24 bg-gray-200 dark:bg-white/10 rounded-2xl' />
        </div>
      </div>
    );
  }

  if (h.error || !h.property) {
    return (
      <div className='p-8 flex flex-col items-center justify-center text-center space-y-4 bg-background-light dark:bg-background-dark min-h-screen'>
        <div className='w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/20 text-red-500 flex items-center justify-center'>
          <ShieldAlert size={40} />
        </div>
        <h2 className='text-lg font-black text-slate-900 dark:text-white'>Imóvel não encontrado</h2>
        <p className='text-sm text-slate-500 max-w-md'>
          O imóvel que você está procurando não existe ou foi removido.
        </p>
        <Link
          to='/properties'
          className='px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest'
        >
          Voltar para Imóveis
        </Link>
      </div>
    );
  }

  const { property } = h;

  return (
    <div className='flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden transition-colors duration-300'>
      {/* Breadcrumb */}
      <div className='px-8 pt-4 pb-1'>
        <div className='flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest'>
          <Link
            to='/properties'
            className='hover:text-primary transition-colors flex items-center gap-1'
          >
            <ArrowLeft size={13} /> Imóveis
          </Link>
          <span>/</span>
          <span className='text-slate-700 dark:text-slate-200 font-black'>{property.name}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className='px-8 pt-4 pb-2 flex justify-center'>
        <GlassmorphismNav
          activeTab={h.activeTab}
          onChange={h.setActiveTab}
          items={[
              { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
              { id: 'inspections', label: 'Vistorias', icon: ClipboardCheck },
              { id: 'docs', label: 'Documentos', icon: FileText },
              { id: 'tenantConfig', label: 'Perfil do Inquilino', icon: User },
              { id: 'utilities', label: 'Utilidades', icon: Zap },
            ]}
          />
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-8 pt-4 pb-32'>
          {h.activeTab === 'overview' && (
            <>
              {/* Photo Carousel */}
              <div className='h-64 w-full relative group shrink-0 overflow-hidden bg-slate-900 mb-6 rounded-[32px] shadow-sm'>
                {h.hasImages ? (
                  <div
                    className='absolute inset-0 bg-cover bg-center transition-all duration-500 ease-in-out transform'
                    style={{ backgroundImage: `url(${h.images[h.currentImageIndex]})` }}
                  />
                ) : (
                  <div className='absolute inset-0 flex items-center justify-center bg-slate-900'>
                    <span className='text-white/10 text-4xl font-black uppercase tracking-[0.4em] select-none'>
                      Meu Igloo
                    </span>
                  </div>
                )}

                <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent' />
                <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent' />

                {h.images.length > 1 && (
                  <div className='absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-2 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 z-20 shadow-2xl'>
                    <button
                      onClick={h.prevImage}
                      className='p-1.5 rounded-xl hover:bg-white/10 text-white transition-all active:scale-90'
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className='flex gap-1.5 px-1'>
                      {h.images.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 rounded-full transition-all duration-300 ${i === h.currentImageIndex ? 'w-4 bg-primary' : 'w-1 bg-white/30'}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={h.nextImage}
                      className='p-1.5 rounded-xl hover:bg-white/10 text-white transition-all active:scale-90'
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

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
                        onClick={() => h.setShowFullscreenImage(true)}
                        className='shrink-0 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all border border-white/10 hover:scale-105 active:scale-95 group shadow-lg'
                        title='Ampliar Foto'
                      >
                        <Maximize2 size={16} />
                      </button>
                      <button
                        onClick={h.openGoogleMaps}
                        className='shrink-0 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl transition-all border border-white/10 hover:scale-105 active:scale-95 group shadow-lg'
                        title='Ver no Google Maps'
                      >
                        <ExternalLink
                          size={16}
                          className='group-hover:rotate-12 transition-transform'
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <OverviewTab
                property={property}
                timeInfo={h.timeInfo}
                onEdit={(id) => h.navigate(`/properties?id=${id}`)}
                onDelete={async (id) => {
                  if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
                    await propertyService.delete(String(id));
                    h.navigate('/properties');
                  }
                }}
                navigateToTenant={() => h.tenant?.id && h.navigate(`/tenants/${h.tenant.id}`)}
                formattedName={h.formattedName}
                trustLevel={h.trustLevel}
                paymentScore={h.paymentScore}
                paidPayments={h.paidPayments}
                isLate={h.isLate}
                loadingPayments={h.loadingPayments}
              />
            </>
          )}
          {h.activeTab === 'inspections' && <InspectionsTab property={property} />}
          {h.activeTab === 'docs' && (
            <div className='bg-white dark:bg-surface-dark rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8'>
              <DocsTab property={property} />
            </div>
          )}
          {h.activeTab === 'tenantConfig' && <TenantConfigTab property={property} />}
          {h.activeTab === 'utilities' && <UtilitiesTab property={property} />}
        </div>

      {h.showFullscreenImage && (
        <ImageViewerModal
          images={h.images}
          currentIndex={h.currentImageIndex}
          onClose={() => h.setShowFullscreenImage(false)}
          onPrev={h.prevImage}
          onNext={h.nextImage}
        />
      )}
    </div>
  );
};

export default PropertyDetailsPage;
