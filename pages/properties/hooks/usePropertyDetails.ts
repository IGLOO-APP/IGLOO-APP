import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertyService } from '../../../services/propertyService';
import { tenantService } from '../../../services/tenancy/tenantService';
import { calculateTenantFinancials } from '../../../utils/financialCalculations';
import { isValidUrl } from '../../../utils/validation';

export function usePropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);

  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tab: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getById(id!),
    enabled: !!id,
  });

  const images = [property?.image, ...(property?.galleryImages || [])].filter(Boolean) as string[];
  const hasImages = images.length > 0;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getTimeLabel = () => {
    if (!property) return { label: '', sub: '' };
    if (property.status === 'ALUGADO') {
      return { label: '8 meses', sub: 'alugado' };
    }
    return { label: '12 d.', sub: 'tempo vago' };
  };

  const timeInfo = getTimeLabel();

  const openGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(property?.address || '');
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    if (isValidUrl(mapsUrl)) window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const tenant = property?.tenant;
  const contract = property?.contract;

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['tenant-payments', tenant?.id],
    queryFn: () => tenantService.getPayments(tenant!.id.toString()),
    enabled: !!tenant?.id,
  });

  const financialSummary = calculateTenantFinancials(payments);
  const trustLevel = financialSummary.punctualityRate;
  const paymentScore = `${financialSummary.punctualityRate}%`;
  const paidPayments = financialSummary.paidCount;
  const isLate = financialSummary.isLate;

  const getDaysInProperty = () => {
    if (!contract?.start_date) return 'Data não disponível';
    try {
      const startStr = contract.start_date;
      let start = new Date(startStr);
      if (isNaN(start.getTime()) && startStr.includes('/')) {
        start = new Date(startStr.split('/').reverse().join('-'));
      }
      if (isNaN(start.getTime())) return 'Período Ativo';
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - start.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      return `${diffMonths} Meses (Ativo)`;
    } catch {
      return 'Período Ativo';
    }
  };

  const formattedName = tenant?.name?.replace('(Teste Inquilino)', '').trim() || 'Inquilino';

  return {
    property,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    navigate,
    images,
    hasImages,
    currentImageIndex,
    setCurrentImageIndex,
    showFullscreenImage,
    setShowFullscreenImage,
    nextImage,
    prevImage,
    timeInfo,
    openGoogleMaps,
    tenant,
    contract,
    payments,
    loadingPayments,
    financialSummary,
    trustLevel,
    paymentScore,
    paidPayments,
    isLate,
    getDaysInProperty,
    formattedName,
  };
}
