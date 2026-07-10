import { useState, useEffect, useRef, useCallback } from 'react';
import { Property, Tenant } from '../../../types';
import { propertyService } from '../../../services/propertyService';
import { tenantService } from '../../../services/tenancy/tenantService';
import { adminService } from '../../../services/adminService';
import { KITNET_CONTRACT_TEMPLATE } from '../../../utils/contractTemplates';
import { generateFilledContract } from '../../../utils/contractGenerator';

export interface ContractFormData {
  property: string;
  propertyId: string;
  tenantName: string;
  tenantCpf: string;
  tenantEmail: string;
  tenantPhone: string;
  rentValue: string;
  depositValue: string;
  startDate: string;
  duration: string;
  paymentDay: string;
  autoRenew: boolean;
  hasMaintenanceFee: boolean;
  maintenanceFee: string;
  earlyTerminationFee: string;
  lockInPeriod: string;
  condominiumValue: string;
  iptuValue: string;
  landlordName: string;
}

const MAX_CHARS_PER_PAGE = 2200;

const paginateContractText = (text: string): string[] => {
  if (text.length <= MAX_CHARS_PER_PAGE) return [text];
  const pages: string[] = [];
  let remainingText = text;
  while (remainingText.length > 0) {
    if (remainingText.length <= MAX_CHARS_PER_PAGE) {
      pages.push(remainingText);
      break;
    }
    let breakIndex = remainingText.lastIndexOf('\n\n', MAX_CHARS_PER_PAGE);
    if (breakIndex === -1 || breakIndex < MAX_CHARS_PER_PAGE * 0.6) {
      breakIndex = remainingText.lastIndexOf('\n', MAX_CHARS_PER_PAGE);
    }
    if (breakIndex === -1 || breakIndex < MAX_CHARS_PER_PAGE * 0.6) {
      breakIndex = remainingText.lastIndexOf(' ', MAX_CHARS_PER_PAGE);
    }
    if (breakIndex === -1) breakIndex = MAX_CHARS_PER_PAGE;
    pages.push(remainingText.substring(0, breakIndex).trim());
    remainingText = remainingText.substring(breakIndex).trim();
  }
  return pages;
};

export const STEPS = [
  { id: 1, title: 'Imóvel' },
  { id: 2, title: 'Inquilino' },
  { id: 3, title: 'Valores' },
  { id: 4, title: 'Vigência' },
  { id: 5, title: 'Minuta' },
  { id: 6, title: 'Revisão' },
];

export interface ContractWizardData {
  property_id: string;
  tenant_id: string | null;
  startDate: string;
  duration: string;
  rentValue: string;
  depositValue: string;
  paymentDay: string;
  hasMaintenanceFee: boolean;
  maintenanceFee: string;
  earlyTerminationFee: string;
  lockInPeriod: string;
  condominiumValue: string;
  iptuValue: string;
  ownerName: string;
  ownerEmail: string;
  tenantName: string;
  tenantCpf: string;
  tenantEmail: string;
  tenantPhone: string;
  property: string;
  contractText: string;
  uploadedFile: File | null;
  docMode: string;
  signaturePayloads: {
    pageIndex: number;
    signatureDataUrl: string;
    position: { xPercent: number; yPercent: number };
  }[];
}

export function useContractWizard(
  initialProperty?: string,
  onComplete?: (data: ContractWizardData) => void,
  currentUser?: { id: string; name: string }
) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [formData, setFormData] = useState<ContractFormData>({
    property: initialProperty || '',
    propertyId: '',
    tenantName: '',
    tenantCpf: '',
    tenantEmail: '',
    tenantPhone: '',
    rentValue: '',
    depositValue: '',
    startDate: new Date().toISOString().split('T')[0],
    duration: '30',
    paymentDay: '10',
    autoRenew: false,
    hasMaintenanceFee: false,
    maintenanceFee: '',
    earlyTerminationFee: '3',
    lockInPeriod: '6',
    condominiumValue: '',
    iptuValue: '',
    landlordName: currentUser?.name || 'Proprietário',
  });

  const [tenantSearch, setTenantSearch] = useState('');
  const [showNewTenantForm, setShowNewTenantForm] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const [docMode, setDocMode] = useState<'template' | 'upload'>('template');
  const [contractPages, setContractPages] = useState<string[]>(['']);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [signatures, setSignatures] = useState<Record<number, string>>({});
  const [signaturePositions, setSignaturePositions] = useState<
    Record<number, { x: number; y: number }>
  >({});
  const [movingSignature, setMovingSignature] = useState<number | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pendingSignatureRole, setPendingSignatureRole] = useState<'owner' | 'tenant'>('owner');

  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, sigX: 0, sigY: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propsData, tenantsData] = await Promise.all([
          propertyService.getAll(),
          tenantService.getAll(),
        ]);
        setProperties(propsData);
        setTenants(tenantsData);
      } catch (error) {
        console.error('Error fetching data for wizard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEndDate = useCallback(() => {
    const start = new Date(formData.startDate);
    const months = parseInt(formData.duration);
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    return end.toLocaleDateString('pt-BR');
  }, [formData.startDate, formData.duration]);

  const getAdjustmentDate = useCallback(() => {
    const start = new Date(formData.startDate);
    const adj = new Date(start);
    adj.setFullYear(adj.getFullYear() + 1);
    return adj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [formData.startDate]);

  const getContractDataMap = useCallback(() => {
    const selectedProp = properties.find((p) => p.name === formData.property);
    const contractText = contractPages.join('\n\n');
    return {
      nome_proprietario: formData.landlordName || 'Proprietário',
      cpf_proprietario: '000.000.000-00',
      endereco_proprietario: 'São Paulo, SP',
      nome_inquilino: formData.tenantName || '_______________________',
      cpf_inquilino: formData.tenantCpf || '_______________________',
      profissao_inquilino: '_______________________',
      email_inquilino: formData.tenantEmail || 'email@exemplo.com',
      endereco_imovel: selectedProp?.address || formData.property || '_______________________',
      numero_unidade: 'N/A',
      ocupacao_maxima: '2',
      data_inicio: formData.startDate
        ? new Date(formData.startDate).toLocaleDateString('pt-BR')
        : '',
      duracao_meses: formData.duration,
      data_fim: getEndDate(),
      valor_aluguel: formData.rentValue || '0,00',
      dia_vencimento: formData.paymentDay || '10',
      valor_condominio: formData.condominiumValue ? `R$ ${formData.condominiumValue}` : 'Incluso',
      valor_iptu: formData.iptuValue ? `R$ ${formData.iptuValue}` : 'Incluso',
      valor_caucao: formData.depositValue || '0,00',
      valor_taxa_rateio:
        formData.hasMaintenanceFee && formData.maintenanceFee
          ? formData.maintenanceFee
          : '0,00 (Não aplicável)',
      multa_rescisoria_meses: formData.earlyTerminationFee || '3',
      periodo_lockin: formData.lockInPeriod || '6',
      cidade_contrato: 'São Paulo',
      data_hoje: new Date().toLocaleDateString('pt-BR'),
      property: formData.property,
      tenantName: formData.tenantName,
      tenantCpf: formData.tenantCpf,
      startDate: formData.startDate,
      duration: formData.duration,
      rentValue: formData.rentValue,
      depositValue: formData.depositValue,
      hasMaintenanceFee: formData.hasMaintenanceFee,
      maintenanceFee: formData.maintenanceFee,
      earlyTerminationFee: formData.earlyTerminationFee,
      lockInPeriod: formData.lockInPeriod,
      propertyName: selectedProp?.name,
      propertyAddress: selectedProp?.address,
      contractText,
      landlordName: formData.landlordName || 'Proprietário',
    };
  }, [formData, properties, contractPages, getEndDate]);

  useEffect(() => {
    const loadAndFillContract = async () => {
      if (currentStep === 5 && contractPages.length === 1 && contractPages[0] === '') {
        let templateContent = KITNET_CONTRACT_TEMPLATE;
        try {
          const dbTemplate = await adminService.getContractTemplate('kitnet_contract');
          if (dbTemplate && dbTemplate.content) templateContent = dbTemplate.content;
        } catch (error) {
          console.warn('Error loading dynamic template, falling back to static template:', error);
        }
        const generated = generateFilledContract(templateContent, getContractDataMap());
        setContractPages(paginateContractText(generated));
      }
    };
    loadAndFillContract();
  }, [currentStep, formData, getContractDataMap, contractPages]);

  useEffect(() => {
    if (currentStep === 5) {
      textareaRefs.current.forEach((textarea) => {
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        }
      });
    }
  }, [contractPages, currentStep]);

  const canAdvance = useCallback(() => {
    if (currentStep === 1) return !!formData.property && !!formData.propertyId;
    if (currentStep === 2) return !!formData.tenantName && !!formData.tenantCpf;
    if (currentStep === 3) {
      const rent = parseFloat(formData.rentValue);
      return !isNaN(rent) && rent > 0;
    }
    if (currentStep === 4) {
      if (!formData.startDate) return false;
      const start = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) return false;
      const pd = parseInt(formData.paymentDay);
      if (isNaN(pd) || pd < 1 || pd > 31) return false;
      return true;
    }
    if (currentStep === 5) {
      if (docMode === 'template') return Object.keys(signatures).length > 0;
      return !!uploadedFile;
    }
    return true;
  }, [
    currentStep,
    formData.property,
    formData.propertyId,
    formData.tenantName,
    formData.tenantCpf,
    formData.rentValue,
    formData.startDate,
    formData.paymentDay,
    docMode,
    signatures,
    uploadedFile,
  ]);

  const handleComplete = useCallback(() => {
    const TOTAL_WIDTH = 850;
    const TOTAL_HEIGHT = 1030;
    const signaturePayloads = Object.entries(signatures).map(([pageIdx, dataUrl]) => {
      const index = parseInt(pageIdx);
      const pos = signaturePositions[index] ?? { x: 650, y: 900 };
      return {
        pageIndex: index,
        signatureDataUrl: dataUrl,
        position: {
          xPercent: parseFloat(((pos.x / TOTAL_WIDTH) * 100).toFixed(2)),
          yPercent: parseFloat(((pos.y / TOTAL_HEIGHT) * 100).toFixed(2)),
        },
      };
    });
    return {
      property_id: formData.propertyId,
      tenant_id: selectedTenantId,
      startDate: formData.startDate,
      duration: formData.duration,
      rentValue: formData.rentValue,
      depositValue: formData.depositValue,
      paymentDay: formData.paymentDay,
      hasMaintenanceFee: formData.hasMaintenanceFee,
      maintenanceFee: formData.maintenanceFee,
      earlyTerminationFee: formData.earlyTerminationFee,
      lockInPeriod: formData.lockInPeriod,
      condominiumValue: formData.condominiumValue,
      iptuValue: formData.iptuValue,
      ownerName: formData.landlordName,
      ownerEmail: '',
      tenantName: formData.tenantName,
      tenantCpf: formData.tenantCpf,
      tenantEmail: formData.tenantEmail,
      tenantPhone: formData.tenantPhone,
      property: formData.property,
      contractText: contractPages.join('\n\n'),
      uploadedFile,
      docMode,
      signaturePayloads,
    };
  }, [
    formData,
    selectedTenantId,
    contractPages,
    uploadedFile,
    docMode,
    signatures,
    signaturePositions,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (!canAdvance()) return;
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      setSaving(true);
      onComplete?.(handleComplete());
    }
  }, [canAdvance, currentStep, onComplete, handleComplete]);

  const updatePageContent = (index: number, content: string) => {
    setContractPages((prev) => {
      const next = [...prev];
      next[index] = content;
      return next;
    });
  };

  const addPage = () => setContractPages((prev) => [...prev, '']);
  const removePage = (index: number) => {
    if (contractPages.length <= 1) return;
    setContractPages((prev) => prev.filter((_, i) => i !== index));
    setSignatures((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const SIGNATURE_FIELDS = {
    owner: { x: 244, y: 985 },
    tenant: { x: 652, y: 985 },
  };

  const handleSignatureConfirm = (dataUrl: string, role?: 'owner' | 'tenant') => {
    const lastPageIndex = contractPages.length - 1;
    const targetRole = role || pendingSignatureRole;
    const pos = SIGNATURE_FIELDS[targetRole];
    setSignatures((prev) => ({ ...prev, [lastPageIndex]: dataUrl }));
    setSignaturePositions((prev) => ({ ...prev, [lastPageIndex]: pos }));
    setShowSignatureModal(false);
    setMovingSignature(lastPageIndex);
  };

  const scrollToClause = (clauseTitle: string) => {
    for (let i = 0; i < contractPages.length; i++) {
      const text = contractPages[i].toUpperCase();
      const index = text.indexOf(clauseTitle.toUpperCase());
      if (index !== -1) {
        const el = textareaRefs.current[i];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
          setTimeout(() => el.setSelectionRange(index, index + clauseTitle.length), 300);
          return;
        }
      }
    }
  };

  return {
    currentStep,
    setCurrentStep,
    loading,
    saving,
    setSaving,
    properties,
    tenants,
    formData,
    setFormData,
    tenantSearch,
    setTenantSearch,
    showNewTenantForm,
    setShowNewTenantForm,
    selectedTenantId,
    setSelectedTenantId,
    docMode,
    setDocMode,
    contractPages,
    uploadedFile,
    setUploadedFile,
    signatures,
    setSignatures,
    signaturePositions,
    setSignaturePositions,
    movingSignature,
    setMovingSignature,
    showSignatureModal,
    setShowSignatureModal,
    showPDFPreview,
    setShowPDFPreview,
    textareaRefs,
    isDraggingRef,
    dragStartRef,
    getEndDate,
    getAdjustmentDate,
    getContractDataMap,
    canAdvance,
    handleNext,
    handleBack,
    handleComplete,
    updatePageContent,
    addPage,
    removePage,
    handleSignatureConfirm,
    pendingSignatureRole,
    setPendingSignatureRole,
    scrollToClause,
  };
}
