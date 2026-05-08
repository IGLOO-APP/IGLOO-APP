import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  User,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  CheckCircle2,
  CircleDollarSign,
  ArrowRight,
  ArrowLeft,
  Upload,
  PenTool,
  X,
  Plus,
  Trash2,
  MapPin,
  CreditCard,
  Clock,
  FileCheck,
  Feather,
  Eraser,
  Download,
  Save,
  Bed,
  Bath,
  Maximize,
  Eye,
  TrendingUp,
  Info,
  RotateCcw,
  ShieldCheck,
  History,
  Infinity,
  ArrowDownToDot,
  Briefcase,
  BookOpen,
  Search,
  Layers,
  Settings,
  GripVertical,
  Files,
  AlertTriangle,
  Move,
} from 'lucide-react';
import { ContractUploader } from './ContractUploader';
import { KITNET_CONTRACT_TEMPLATE } from '../../utils/contractTemplates';
import { generateFilledContract } from '../../utils/contractGenerator';
import { propertyService } from '../../services/propertyService';
import { tenantService } from '../../services/tenantService';
import { Property, Tenant } from '../../types';

interface CreateContractWizardProps {
  onClose: () => void;
  onComplete: (data: any) => void;
  initialProperty?: string;
}

const STEPS = [
  { id: 1, title: 'Imóvel', icon: Building2 },
  { id: 2, title: 'Inquilino', icon: User },
  { id: 3, title: 'Valores', icon: DollarSign },
  { id: 4, title: 'Vigência', icon: Calendar },
  { id: 5, title: 'Minuta', icon: FileText },
  { id: 6, title: 'Revisão', icon: CheckCircle },
];

// --- Helper: Paginate Text ---
const paginateContractText = (text: string): string[] => {
  const MAX_CHARS_PER_PAGE = 2200; // Adjusted for safer A4 fit with margins/signatures
  if (text.length <= MAX_CHARS_PER_PAGE) return [text];

  const pages: string[] = [];
  let remainingText = text;

  while (remainingText.length > 0) {
    if (remainingText.length <= MAX_CHARS_PER_PAGE) {
      pages.push(remainingText);
      break;
    }

    // Try to break at a double newline (paragraph) first
    let breakIndex = remainingText.lastIndexOf('\n\n', MAX_CHARS_PER_PAGE);

    // If not found or too early, try single newline
    if (breakIndex === -1 || breakIndex < MAX_CHARS_PER_PAGE * 0.6) {
      breakIndex = remainingText.lastIndexOf('\n', MAX_CHARS_PER_PAGE);
    }

    // If still not good, try space
    if (breakIndex === -1 || breakIndex < MAX_CHARS_PER_PAGE * 0.6) {
      breakIndex = remainingText.lastIndexOf(' ', MAX_CHARS_PER_PAGE);
    }

    // Fallback: Hard cut
    if (breakIndex === -1) breakIndex = MAX_CHARS_PER_PAGE;

    pages.push(remainingText.substring(0, breakIndex).trim());
    remainingText = remainingText.substring(breakIndex).trim();
  }
  return pages;
};

// --- Internal Component: Signature Pad Modal ---
const SignatureModal: React.FC<{
  onClose: () => void;
  onConfirm: (signatureDataUrl: string) => void;
}> = ({ onClose, onConfirm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
      }
    }
  }, []);

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onConfirm(canvas.toDataURL());
    }
  };

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn'>
      <div className='bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col'>
        <div className='p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-start'>
          <div>
            <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg'>
              <PenTool size={18} className='text-primary' /> Assinatura Digital
            </h3>
            <p className='text-xs text-slate-500 mt-1 font-medium'>Desenhe sua assinatura com o mouse ou toque</p>
          </div>
          <button
            onClick={onClose}
            className='p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-6 bg-slate-50 dark:bg-black/20 flex flex-col gap-4'>
          <div className='bg-white dark:bg-surface-dark rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 shadow-inner overflow-hidden cursor-crosshair relative'>
            {!isDrawing && (
              <div className='absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400'>
                <PenTool size={24} className='mb-2 opacity-40' />
                <span className='text-xs font-bold uppercase tracking-widest'>Clique e arraste para assinar</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className='w-full h-48 touch-none relative z-10'
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          
          <div className='flex items-center justify-center gap-4 text-xs font-bold'>
            <button className='text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors'>Usar fonte de assinatura</button>
            <span className='text-slate-300 dark:text-slate-600'>ou</span>
            <button className='text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors'>Carregar imagem</button>
          </div>
        </div>

        <div className='p-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-surface-dark'>
          <button
            onClick={clearCanvas}
            className='px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors flex items-center gap-2'
          >
            <Eraser size={16} /> Limpar
          </button>
          <button
            onClick={handleConfirm}
            className='px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2'
          >
            <CheckCircle size={16} /> Confirmar Assinatura
          </button>
        </div>
      </div>
    </div>
  );
};

export const CreateContractWizard: React.FC<CreateContractWizardProps> = ({
  onClose,
  onComplete,
  initialProperty,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    property: initialProperty || '',
    tenantName: '',
    tenantCpf: '',
    rentValue: '',
    depositValue: '',
    startDate: new Date().toISOString().split('T')[0], // Default to today
    duration: '30', // months
    autoRenew: false,
  });

  const [tenantSearch, setTenantSearch] = useState('');
  const [showNewTenantForm, setShowNewTenantForm] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propsData, tenantsData] = await Promise.all([
          propertyService.getAll(),
          tenantService.getAll()
        ]);
        setProperties(propsData.filter(p => p.status === 'DISPONÍVEL'));
        setTenants(tenantsData);
      } catch (error) {
        console.error('Error fetching data for wizard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEndDate = () => {
    const start = new Date(formData.startDate);
    const months = parseInt(formData.duration);
    const end = new Date(start.setMonth(start.getMonth() + months));
    return end.toLocaleDateString('pt-BR');
  };

  const getAdjustmentDate = () => {
    const start = new Date(formData.startDate);
    const adj = new Date(start.setFullYear(start.getFullYear() + 1));
    return adj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const scrollToClause = (clauseTitle: string) => {
    // Search in all pages
    for (let i = 0; i < contractPages.length; i++) {
        const text = contractPages[i].toUpperCase();
        const index = text.indexOf(clauseTitle.toUpperCase());
        
        if (index !== -1) {
            // Found it! Scroll this page into view
            const el = textareaRefs.current[i];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
                // Select the text
                setTimeout(() => {
                    el.setSelectionRange(index, index + clauseTitle.length);
                }, 300);
                return;
            }
        }
    }
  };

  // Step 5 State: Document
  const [docMode, setDocMode] = useState<'template' | 'upload'>('template');
  const [contractPages, setContractPages] = useState<string[]>(['']);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Signature State
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  // Maps page index to signature image URL
  const [signatures, setSignatures] = useState<Record<number, string>>({});
  const [signaturePositions, setSignaturePositions] = useState<Record<number, { x: number; y: number }>>({});
  const [pageToDelete, setPageToDelete] = useState<number | null>(null);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [movingSignature, setMovingSignature] = useState<number | null>(null);

  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Auto-generate contract text when entering Step 5
  useEffect(() => {
    if (currentStep === 5 && contractPages.length === 1 && contractPages[0] === '') {
      const selectedProp = properties.find(p => p.name === formData.property);
      
      const dataMap = {
        nome_proprietario: 'Investidor Exemplo', // Mock owner
        cpf_proprietario: '000.000.000-00',
        endereco_proprietario: 'São Paulo, SP',
        nome_inquilino: formData.tenantName || '_______________________',
        cpf_inquilino: formData.tenantCpf || '_______________________',
        profissao_inquilino: '_______________________',
        email_inquilino: 'email@exemplo.com',
        endereco_imovel: selectedProp?.address || formData.property || '_______________________',
        numero_unidade: 'N/A',
        ocupacao_maxima: '2',
        data_inicio: new Date(formData.startDate).toLocaleDateString('pt-BR'),
        duracao_meses: formData.duration,
        data_fim: getEndDate(),
        valor_aluguel: formData.rentValue || '0,00',
        dia_vencimento: '10',
        valor_condominio: 'Incluso',
        valor_iptu: 'Incluso',
        valor_caucao: formData.depositValue || '0,00',
        cidade_contrato: 'São Paulo',
        data_hoje: new Date().toLocaleDateString('pt-BR'),
      };

      const generated = generateFilledContract(KITNET_CONTRACT_TEMPLATE, dataMap);
      // Apply pagination logic here
      const pagedContent = paginateContractText(generated);
      setContractPages(pagedContent);
    }
  }, [currentStep, formData]);

  // Auto-resize textareas on content change or step change
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

  const canAdvance = () => {
    if (currentStep === 1) return !!formData.property;
    if (currentStep === 2) return !!formData.tenantName;
    if (currentStep === 5) {
        // Enforce signature present if in template mode, or file uploaded if in upload mode
        if (docMode === 'template') return Object.keys(signatures).length > 0;
        return !!uploadedFile;
    }
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) return;

    if (currentStep < 6) setCurrentStep(currentStep + 1);
    else
      onComplete({ ...formData, contractText: contractPages.join('\n\n'), uploadedFile, docMode });
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const updatePageContent = (index: number, content: string) => {
    const newPages = [...contractPages];
    newPages[index] = content;
    setContractPages(newPages);
  };

  const addPage = () => {
    setContractPages([...contractPages, '']);
  };

  const removePage = (index: number) => {
    if (contractPages.length > 1) {
      const newPages = contractPages.filter((_, i) => i !== index);
      setContractPages(newPages);
      // Also clean up signature if exists on removed page
      const newSignatures = { ...signatures };
      delete newSignatures[index];
      setSignatures(newSignatures);
    }
  };

  const handleSignatureConfirm = (dataUrl: string) => {
    // Add signature to the last page currently
    const lastPageIndex = contractPages.length - 1;
    setSignatures((prev) => ({
      ...prev,
      [lastPageIndex]: dataUrl,
    }));
    // Start with a reasonable default position (near bottom right)
    setSignaturePositions((prev) => ({
        ...prev,
        [lastPageIndex]: { x: 450, y: 750 }
    }));
    setShowSignatureModal(false);
    // Enter move mode automatically for the new signature
    setMovingSignature(lastPageIndex);
  };

  return (
    <div className='fixed inset-0 z-50 bg-slate-50 dark:bg-background-dark flex flex-col animate-slideUp overflow-hidden'>
      {/* Signature Modal */}
      {showSignatureModal && (
        <SignatureModal
          onClose={() => setShowSignatureModal(false)}
          onConfirm={handleSignatureConfirm}
        />
      )}

      {/* Slim Header with Navigation */}
      <div className='flex-none bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-white/5 z-40 shadow-sm'>
        <div className='max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-4 min-w-[200px]'>
            <button onClick={onClose} className='p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white'>
              <X size={20} />
            </button>
            <div className='hidden sm:block'>
              <h2 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none'>Novo Contrato</h2>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Igloo Wizard</p>
            </div>
          </div>

          {/* Wizard Steps - Compact */}
          <div className='hidden md:flex items-center gap-2'>
            {[
              { n: 1, l: 'Imóvel', i: Building2 },
              { n: 2, l: 'Inquilino', i: User },
              { n: 3, l: 'Valores', i: CircleDollarSign },
              { n: 4, l: 'Vigência', i: Calendar },
              { n: 5, l: 'Minuta', i: FileText },
              { n: 6, l: 'Revisão', i: CheckCircle2 }
            ].map((step, i) => (
              <React.Fragment key={step.n}>
                <div 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                    currentStep === step.n 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                      : currentStep > step.n 
                        ? 'text-emerald-500' 
                        : 'text-slate-300'
                  }`}
                >
                  <step.i size={12} className={currentStep === step.n ? 'animate-pulse' : ''} />
                  <span className='text-[9px] font-black uppercase tracking-widest'>{step.l}</span>
                </div>
                {i < 5 && <div className={`w-4 h-0.5 rounded-full ${currentStep > step.n ? 'bg-emerald-500/30' : 'bg-slate-100 dark:bg-white/5'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Navigation Controls - Integrated at Top */}
          <div className='flex items-center gap-3 min-w-[200px] justify-end'>
            <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className='px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-0 transition-all flex items-center gap-2'
            >
                <ArrowLeft size={14} /> Voltar
            </button>
            <div className='relative group'>
                {!canAdvance() && (
                    <div className='absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-white/10 z-50'>
                        {(() => {
                            if (currentStep === 1) return 'Selecione um imóvel';
                            if (currentStep === 2) return 'Defina o locatário';
                            if (currentStep === 5) return docMode === 'template' ? 'Assine o documento' : 'Faça o upload do documento';
                            return 'Preencha os campos obrigatórios';
                        })()}
                    </div>
                )}
                <button
                    onClick={handleNext}
                    disabled={!canAdvance()}
                    className={`px-5 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center gap-2 ${
                        !canAdvance() 
                            ? 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95'
                    }`}
                >
                    {currentStep === 6 ? 'Finalizar' : 'Próxima'}
                    <ArrowRight size={14} />
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className='md:hidden w-full h-1 bg-slate-100 dark:bg-white/5'>
        <div
          className='h-full bg-primary transition-all duration-300'
          style={{ width: `${(currentStep / 6) * 100}%` }}
        ></div>
      </div>

      {/* Main Content - Dynamic Width based on Step */}
      <div className='flex-1 overflow-y-auto bg-slate-50 dark:bg-black/20'>
        <div
          className={`mx-auto min-h-full flex flex-col transition-all duration-300 ${
            currentStep === 5 ? 'max-w-[1600px] w-full p-0' : 'max-w-4xl p-6 md:p-10'
          }`}
        >
          {currentStep === 1 && (
            <div className='space-y-8 animate-fadeIn max-w-2xl mx-auto w-full'>
              <div className='text-center'>
                <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
                  Selecione o Imóvel
                </h3>
                <p className='text-slate-500'>
                  Para qual propriedade você deseja criar este contrato?
                </p>
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
                      const cleanPrice = prop.price.replace(/\./g, '').replace(',', '.');
                      const rentVal = parseFloat(cleanPrice);
                      const depositVal = rentVal * 3;

                      setFormData({ 
                        ...formData, 
                        property: prop.name,
                        rentValue: rentVal.toString(),
                        depositValue: depositVal.toString()
                      });
                    }}
                    className={`group relative overflow-hidden rounded-3xl border-2 text-left transition-all duration-300 flex flex-col bg-white dark:bg-surface-dark ${
                      formData.property === prop.name
                        ? 'border-primary ring-4 ring-primary/10 shadow-2xl'
                        : 'border-white dark:border-white/5 hover:border-slate-200 dark:hover:border-white/20 shadow-sm hover:shadow-lg'
                    }`}
                  >
                    {/* Top Section */}
                    <div className='flex items-stretch'>
                      {/* Image */}
                      <div className='w-32 md:w-48 h-32 md:h-36 overflow-hidden shrink-0'>
                        <img 
                          src={prop.image} 
                          alt={prop.name} 
                          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                        />
                      </div>
                      
                      {/* Info */}
                      <div className='flex-1 p-4 md:p-6 flex flex-col justify-between'>
                        <div>
                          <div className='flex items-center justify-between mb-1'>
                            <span className='px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest'>
                              {prop.status}
                            </span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.property === prop.name ? 'border-primary bg-primary text-white scale-110' : 'border-slate-200 dark:border-white/5'}`}>
                              {formData.property === prop.name && <div className='w-2 h-2 bg-white rounded-full' />}
                            </div>
                          </div>
                          <h4 className={`text-lg md:text-xl font-black tracking-tight leading-tight ${formData.property === prop.name ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                            {prop.name}
                          </h4>
                          <p className='text-xs md:text-sm text-slate-500 font-medium truncate opacity-80'>
                            {prop.address}
                          </p>
                        </div>
                        
                        <div className='flex items-baseline gap-1 mt-auto'>
                          <span className='text-xs font-bold text-slate-400'>R$</span>
                          <span className='text-xl md:text-2xl font-black text-slate-900 dark:text-white'>{prop.price}</span>
                          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-tighter'>por mês</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Metrics */}
                    <div className='bg-slate-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 p-3 px-4 md:px-6 flex items-center justify-between'>
                      <div className='flex items-center gap-4 md:gap-6'>
                        <div className='flex items-center gap-1.5'>
                          <Bed size={14} className='text-slate-400' />
                          <div className='flex flex-col'>
                            <span className='text-xs font-black text-slate-900 dark:text-white leading-none'>{prop.beds}</span>
                            <span className='text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>Quartos</span>
                          </div>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <Bath size={14} className='text-slate-400' />
                          <div className='flex flex-col'>
                            <span className='text-xs font-black text-slate-900 dark:text-white leading-none'>{prop.baths}</span>
                            <span className='text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>Banh.</span>
                          </div>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <Maximize size={14} className='text-slate-400' />
                          <div className='flex flex-col'>
                            <span className='text-xs font-black text-slate-900 dark:text-white leading-none'>{prop.area}</span>
                            <span className='text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>Área</span>
                          </div>
                        </div>
                        <div className='flex items-center gap-1.5 hidden md:flex'>
                          <Clock size={14} className='text-slate-400' />
                          <div className='flex flex-col'>
                            <span className='text-xs font-black text-slate-900 dark:text-white leading-none'>{prop.vacantDays}</span>
                            <span className='text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>Vago</span>
                          </div>
                        </div>
                        <div className='flex items-center gap-1.5 hidden lg:flex'>
                          <Eye size={14} className='text-slate-400' />
                          <div className='flex flex-col'>
                            <span className='text-xs font-black text-slate-900 dark:text-white leading-none'>{prop.visits}</span>
                            <span className='text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>Visitas</span>
                          </div>
                        </div>
                      </div>

                      {formData.property === prop.name && (
                        <div className='flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest animate-slideLeft'>
                          <ArrowRight size={14} /> Selecionado
                        </div>
                      )}
                    </div>
                  </button>
                  )))
                }
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className='space-y-8 animate-fadeIn max-w-2xl mx-auto w-full'>
              <div className='text-center'>
                <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
                  Quem é o Inquilino?
                </h3>
                <p className='text-slate-500'>
                  Busque em sua base de dados ou cadastre um novo.
                </p>
              </div>

              {!showNewTenantForm ? (
                <div className='space-y-4'>
                  {/* Search Box */}
                  <div className='relative group'>
                    <User className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors' size={20} />
                    <input
                      type='text'
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                      placeholder='Buscar por nome ou CPF...'
                      className='w-full pl-12 pr-16 py-5 bg-white dark:bg-surface-dark border-2 border-transparent focus:border-primary rounded-3xl shadow-sm outline-none font-bold text-lg text-slate-900 dark:text-white transition-all placeholder-slate-300'
                      autoFocus
                    />
                    <button
                      onClick={() => setShowNewTenantForm(true)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl flex items-center justify-center transition-all'
                      title='Novo Inquilino'
                    >
                      <Plus size={24} />
                    </button>
                    {tenantSearch && (
                      <button 
                        onClick={() => setTenantSearch('')}
                        className='absolute right-14 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500'
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Results List */}
                  <div className='space-y-3'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-2'>
                      {tenantSearch ? 'Resultados da busca' : 'Inquilinos Recentes'}
                    </p>
                    <div className='grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
                      {loading ? (
                        <div className='py-10 text-center'>
                          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2'></div>
                        </div>
                      ) : (
                        tenants
                          .filter(t => 
                            t.name.toLowerCase().includes(tenantSearch.toLowerCase()) || 
                            (t.cpf && t.cpf.includes(tenantSearch))
                          )
                        .map((tenant) => (
                          <button
                            key={tenant.id}
                            onClick={() => {
                              setSelectedTenantId(tenant.id);
                              setFormData({ ...formData, tenantName: tenant.name, tenantCpf: tenant.cpf });
                            }}
                            className={`group p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                              selectedTenantId === tenant.id
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-white dark:border-white/5 bg-white dark:bg-surface-dark hover:border-slate-100 dark:hover:border-white/10'
                            }`}
                          >
                            <img src={tenant.image || `https://i.pravatar.cc/150?u=${tenant.email}`} className='w-12 h-12 rounded-full border border-slate-100 dark:border-white/5' alt="" />
                            <div className='flex-1'>
                              <h4 className='font-bold text-slate-900 dark:text-white leading-tight'>{tenant.name}</h4>
                              <p className='text-xs text-slate-400 font-medium'>{tenant.cpf} • {tenant.email}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedTenantId === tenant.id ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-white/5'}`}>
                              {selectedTenantId === tenant.id && <div className='w-1.5 h-1.5 bg-white rounded-full' />}
                            </div>
                          </button>
                          )))
                      }
                      
                      {/* Empty State */}
                      {!loading && tenants.filter(t => t.name.toLowerCase().includes(tenantSearch.toLowerCase()) || (t.cpf && t.cpf.includes(tenantSearch))).length === 0 && (
                        <div className='p-8 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10'>
                          <User size={40} className='mx-auto text-slate-300 mb-3' />
                          <p className='text-slate-500 font-bold'>Nenhum inquilino encontrado</p>
                          <button 
                            onClick={() => setShowNewTenantForm(true)}
                            className='mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all'
                          >
                            Cadastrar Novo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className='space-y-6'>
                  <div className='bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 space-y-6 animate-slideUp'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-[10px] font-black text-primary uppercase tracking-widest'>Novo Inquilino</span>
                      <button 
                        onClick={() => setShowNewTenantForm(false)}
                        className='text-xs font-bold text-slate-400 hover:text-slate-600'
                      >
                        Voltar para busca
                      </button>
                    </div>
                    <div>
                      <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1'>
                        Nome Completo
                      </label>
                      <div className='relative'>
                        <User
                          className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                          size={20}
                        />
                        <input
                          value={formData.tenantName}
                          onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                          className='w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none transition-all font-medium text-slate-900 dark:text-white'
                          placeholder='Ex: João da Silva'
                          autoFocus
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1'>
                        CPF
                      </label>
                      <div className='relative'>
                        <CreditCard
                          className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                          size={20}
                        />
                        <input
                          value={formData.tenantCpf}
                          onChange={(e) => setFormData({ ...formData, tenantCpf: e.target.value })}
                          className='w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none transition-all font-medium text-slate-900 dark:text-white'
                          placeholder='000.000.000-00'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className='space-y-8 animate-fadeIn max-w-4xl mx-auto w-full'>
              <div className='text-center'>
                <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
                  Valores do Contrato
                </h3>
                <p className='text-slate-500'>Valores sugeridos com base no perfil do imóvel selecionado.</p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-5 gap-8'>
                {/* Left: Financial Summary Card */}
                <div className='md:col-span-2 space-y-6'>
                  <div className='bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 rounded-3xl p-6 relative overflow-hidden'>
                    <div className='absolute -right-4 -top-4 text-primary/10 rotate-12'>
                      <TrendingUp size={120} />
                    </div>
                    
                    <div className='relative z-10'>
                      <div className='flex items-center gap-2 mb-4'>
                        <div className='w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center'>
                          <DollarSign size={18} />
                        </div>
                        <h4 className='font-black text-primary uppercase tracking-widest text-[10px]'>Perfil do Imóvel</h4>
                      </div>

                      <div className='space-y-4'>
                        <div>
                          <p className='text-[10px] font-bold text-slate-400 uppercase'>Aluguel Base</p>
                          <p className='text-2xl font-black text-slate-900 dark:text-white'>
                            R$ {properties.find(p => p.name === formData.property)?.price || '0,00'}
                          </p>
                        </div>
                        
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <p className='text-[10px] font-bold text-slate-400 uppercase'>Condomínio</p>
                            <p className='text-sm font-black text-emerald-500'>Incluso</p>
                          </div>
                          <div>
                            <p className='text-[10px] font-bold text-slate-400 uppercase'>IPTU</p>
                            <p className='text-sm font-black text-emerald-500'>Incluso</p>
                          </div>
                        </div>

                        <div className='pt-4 border-t border-primary/10'>
                          <p className='text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1'>
                            <Info size={10} /> Sugestão de Garantia
                          </p>
                          <p className='text-sm font-bold text-slate-600 dark:text-slate-300'>
                            3x o valor do aluguel
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400'>
                      <Building2 size={20} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-[10px] font-bold text-slate-400 uppercase'>Imóvel Selecionado</p>
                      <p className='text-sm font-bold text-slate-900 dark:text-white truncate'>{formData.property}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Adjustment Fields */}
                <div className='md:col-span-3 space-y-6'>
                  <div className='bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 space-y-8'>
                    <div>
                      <div className='flex items-center justify-between mb-2 ml-1'>
                        <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-black'>
                          Aluguel Negociado
                        </label>
                        {formData.rentValue !== properties.find(p => p.name === formData.property)?.price.replace(/\./g, '').replace(',', '.') && (
                          <button 
                            onClick={() => {
                              const base = properties.find(p => p.name === formData.property)?.price.replace(/\./g, '').replace(',', '.') || '0';
                              setFormData({...formData, rentValue: base});
                            }}
                            className='text-[10px] font-black text-primary flex items-center gap-1 hover:underline'
                          >
                            <RotateCcw size={10} /> Restaurar Base
                          </button>
                        )}
                      </div>
                      <div className='relative'>
                        <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl'>
                          R$
                        </span>
                        <input
                          type='number'
                          value={formData.rentValue}
                          onChange={(e) => setFormData({ ...formData, rentValue: e.target.value })}
                          className='w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-black/40 outline-none font-black text-3xl text-slate-900 dark:text-white transition-all'
                          placeholder='0,00'
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <div className='flex items-center justify-between mb-2 ml-1'>
                        <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-black'>
                          Caução (Garantia)
                        </label>
                        {formData.depositValue !== (parseFloat(formData.rentValue || '0') * 3).toString() && (
                          <button 
                            onClick={() => {
                              const suggested = (parseFloat(formData.rentValue || '0') * 3).toString();
                              setFormData({...formData, depositValue: suggested});
                            }}
                            className='text-[10px] font-black text-primary flex items-center gap-1 hover:underline'
                          >
                            <RotateCcw size={10} /> Sugerir 3x
                          </button>
                        )}
                      </div>
                      <div className='relative'>
                        <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl'>
                          R$
                        </span>
                        <input
                          type='number'
                          value={formData.depositValue}
                          onChange={(e) => setFormData({ ...formData, depositValue: e.target.value })}
                          className='w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-black/40 outline-none font-black text-3xl text-slate-900 dark:text-white transition-all'
                          placeholder='0,00'
                        />
                      </div>
                      <div className='mt-4 p-4 bg-slate-50 dark:bg-black/30 rounded-2xl border border-slate-100 dark:border-white/5'>
                        <p className='text-xs text-slate-500 leading-relaxed font-medium'>
                          O valor da garantia é retido para cobrir eventuais danos ou inadimplência ao final do contrato. O padrão de mercado é de até 3 vezes o valor do aluguel.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className='space-y-8 animate-fadeIn max-w-4xl mx-auto w-full'>
              <div className='text-center'>
                <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>Vigência</h3>
                <p className='text-slate-500'>Defina o período de validade e regras de renovação.</p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-5 gap-8'>
                {/* Left: Timeline Display */}
                <div className='md:col-span-2 space-y-6'>
                  <div className='bg-white dark:bg-surface-dark p-6 rounded-3xl border border-slate-100 dark:border-white/5 relative'>
                    <div className='absolute left-10 top-16 bottom-16 w-0.5 bg-dashed border-l-2 border-dashed border-slate-200 dark:border-white/10'></div>
                    
                    <div className='space-y-12 relative z-10'>
                      <div className='flex items-start gap-4'>
                        <div className='w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20'>
                          <ArrowRight size={14} />
                        </div>
                        <div>
                          <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Início do Contrato</p>
                          <p className='text-lg font-black text-slate-900 dark:text-white'>
                            {new Date(formData.startDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-start gap-4'>
                        <div className='w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center'>
                          <ArrowDownToDot size={14} />
                        </div>
                        <div>
                          <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Duração Total</p>
                          <div className='flex items-center gap-2'>
                            <span className='px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-sm font-black'>
                              {formData.duration} Meses
                            </span>
                            <span className='text-xs text-slate-400 font-medium'>Periodo padrão</span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-start gap-4'>
                        <div className='w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg'>
                          <ShieldCheck size={14} />
                        </div>
                        <div>
                          <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Término Estimado</p>
                          <p className='text-lg font-black text-slate-900 dark:text-white'>
                            {getEndDate()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 flex items-center gap-3'>
                    <History size={20} className='text-indigo-500' />
                    <div className='flex-1'>
                      <p className='text-[10px] font-bold text-indigo-400 uppercase leading-none mb-1'>Primeiro Reajuste</p>
                      <p className='text-xs font-bold text-indigo-900 dark:text-indigo-200'>Aniversário em {getAdjustmentDate()}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Controls */}
                <div className='md:col-span-3 space-y-6'>
                  <div className='bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 space-y-8'>
                    <div>
                      <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-4 ml-1'>
                        Quanto tempo durará o contrato?
                      </label>
                      <div className='grid grid-cols-3 gap-3'>
                        {[12, 30, 36].map((m) => (
                          <button
                            key={m}
                            onClick={() => setFormData({ ...formData, duration: m.toString() })}
                            className={`py-4 rounded-2xl border-2 font-black transition-all ${
                              formData.duration === m.toString()
                                ? 'border-primary bg-primary/5 text-primary scale-[1.02] shadow-md'
                                : 'border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-black/20 text-slate-400 hover:border-slate-200'
                            }`}
                          >
                            {m} Meses
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1'>
                        Data de Início
                      </label>
                      <div className='relative'>
                        <Calendar
                          className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                          size={20}
                        />
                        <input
                          type='date'
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className='w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-black/20 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-black/40 outline-none font-bold text-slate-900 dark:text-white transition-all'
                        />
                      </div>
                    </div>

                    <div
                      onClick={() => setFormData({ ...formData, autoRenew: !formData.autoRenew })}
                      className={`relative group flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all overflow-hidden ${
                        formData.autoRenew 
                          ? 'bg-emerald-500/5 border-emerald-500/30' 
                          : 'bg-slate-50 dark:bg-black/20 border-transparent hover:border-slate-200'
                      }`}
                    >
                      {formData.autoRenew && (
                        <div className='absolute -right-4 -bottom-4 text-emerald-500/10 rotate-12'>
                          <Infinity size={100} />
                        </div>
                      )}
                      
                      <div
                        className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
                          formData.autoRenew 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110' 
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-transparent text-slate-300'
                        }`}
                      >
                        {formData.autoRenew ? <Infinity size={24} /> : <RotateCcw size={20} />}
                      </div>
                      
                      <div className='relative z-10'>
                        <p className={`text-lg font-black ${formData.autoRenew ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          Renovação Automática
                        </p>
                        <p className='text-sm text-slate-500 font-medium'>
                          Deseja prorrogar o contrato por tempo indeterminado após o término?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Document Generation/Upload */}
          {currentStep === 5 && (
            <div className='flex flex-col h-full animate-fadeIn'>
              {/* Reimagined Legal Workspace Toolbar - Premium Glassmorphism */}
              <div className='flex-none h-14 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 z-30'>
                <div className='flex items-center gap-6'>
                  {/* Breadcrumbs */}
                  <div className='flex items-center gap-2 text-xs'>
                    <span className='font-bold text-slate-400'>Novo Contrato</span>
                    <ArrowRight size={12} className='text-slate-300' />
                    <span className='font-black text-slate-900 dark:text-white'>Minuta</span>
                  </div>

                  <div className='h-4 w-px bg-slate-200 dark:bg-white/10'></div>

                  {/* Formatting Group */}
                  <div className='flex items-center gap-1'>
                    {[
                      { i: 'B', l: 'Negrito' }, { i: 'I', l: 'Itálico' }, { i: 'U', l: 'Sublinhado' }
                    ].map(tool => (
                      <button key={tool.l} className='w-8 h-8 flex items-center justify-center rounded-lg text-sm font-serif font-black text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 transition-all' title={tool.l}>
                        {tool.i}
                      </button>
                    ))}
                  </div>

                  <div className='h-4 w-px bg-slate-200 dark:bg-white/10'></div>

                  {/* View Mode Group */}
                  <div className='flex gap-1 p-1 bg-slate-100 dark:bg-black/20 rounded-xl'>
                    <button
                      onClick={() => setIsReadingMode(false)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        !isReadingMode ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <BookOpen size={12} /> Editor
                    </button>
                    <button
                      onClick={() => setIsReadingMode(true)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        isReadingMode ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Eye size={12} /> Leitura
                    </button>
                  </div>

                  <div className='h-4 w-px bg-slate-200 dark:bg-white/10'></div>

                  {/* Doc Source Group */}
                  <div className='flex gap-1 p-1 bg-slate-100 dark:bg-black/20 rounded-xl'>
                    <button
                      onClick={() => setDocMode('template')}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        docMode === 'template' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <FileText size={12} /> Minuta Automatizada
                    </button>
                    <button
                      onClick={() => setDocMode('upload')}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        docMode === 'upload' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Upload size={12} /> Anexar Externo
                    </button>
                  </div>

                  <div className='h-4 w-px bg-slate-200 dark:bg-white/10'></div>

                  {/* Status Group */}
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-1.5' title='Trabalho protegido na nuvem Igloo'>
                      <ShieldCheck size={14} className='text-emerald-500' />
                      <span className='text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block'>Protocolo Seguro</span>
                    </div>
                    <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                      {contractPages.join(' ').split(/\s+/).filter(Boolean).length} Palavras
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Workspace Area */}
              <div className='flex-1 flex overflow-hidden bg-slate-50 dark:bg-black/40'>
                {/* Left Drawer: Clause Navigator - Only in Template Mode */}
                {!isReadingMode && docMode === 'template' && (
                  <div className='w-[220px] bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-white/5 hidden lg:flex flex-col shrink-0'>
                    <div className='p-4 border-b border-slate-100 dark:border-white/5'>
                      <div className='relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-300' size={14} />
                        <input 
                          type="text" 
                          placeholder="Buscar cláusula..."
                          className='w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/20 rounded-lg text-xs font-bold outline-none border border-transparent focus:border-primary/50 transition-all'
                        />
                      </div>
                    </div>

                    <div className='p-4 border-b border-slate-100 dark:border-white/5'>
                      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2'>
                          <Files size={12} /> PÁGINAS DO CONTRATO
                      </p>
                      <div className='space-y-1'>
                          {contractPages.map((_, i) => (
                              <button
                                  key={i}
                                  onClick={() => {
                                      const el = textareaRefs.current[i];
                                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}
                                  className='w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left flex items-center justify-between group transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5'
                              >
                                  <span className='text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary'>Página {i + 1}</span>
                              </button>
                          ))}
                      </div>
                    </div>

                    <div className='flex-1 overflow-y-auto p-4 space-y-1'>
                      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2'>
                          <GripVertical size={12} /> CLÁUSULAS RÁPIDAS
                      </p>
                      {[
                        'DAS PARTES', 'DO OBJETO', 'DO VALOR', 'DA GARANTIA', 
                        'DAS OBRIGAÇÕES', 'DA RESCISÃO', 'DO FORO'
                      ].map((clause, i) => (
                        <button 
                          key={i}
                          onClick={() => scrollToClause(clause)}
                          className='w-full min-h-[36px] px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left flex items-center justify-between group transition-all'
                        >
                          <div className='flex items-center gap-2'>
                            <Plus size={14} className='text-slate-400 group-hover:text-primary transition-colors' />
                            <span className='text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary'>{clause}</span>
                          </div>
                          <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                            <CheckCircle size={14} className='text-emerald-500' />
                          </div>
                        </button>
                      ))}

                      <div className='pt-4'>
                        <button className='w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-dashed border-slate-200 dark:border-white/10'>
                          Adicionar cláusula extra
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Center: Document Editor */}
                <div className='flex-1 flex flex-col relative bg-slate-50 dark:bg-surface-dark transition-colors duration-500 overflow-hidden'>
                  {docMode === 'template' ? (
                    <div className='flex flex-col h-full overflow-y-auto p-4 md:py-12 items-center custom-scrollbar relative scroll-smooth'>
                      {contractPages.map((pageContent, index) => (
                        <div
                          key={index}
                          onClick={(e) => {
                              if (signatures[index] || movingSignature === index) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const x = e.clientX - rect.left;
                                  const y = e.clientY - rect.top;
                                  setSignaturePositions(prev => ({
                                      ...prev,
                                      [index]: { x, y }
                                  }));
                                  if (movingSignature === index) setMovingSignature(null);
                              }
                          }}
                          className={`relative group/page w-full max-w-4xl min-h-[1080px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.4)] mb-20 flex flex-col transition-all duration-300 ring-1 ring-slate-200/50 dark:ring-white/5 rounded-[4px] overflow-visible shrink-0 ${signatures[index] ? 'cursor-crosshair' : ''}`}
                        >
                          <textarea
                            ref={(el) => { textareaRefs.current[index] = el; }}
                            value={pageContent}
                            onChange={(e) => {
                                updatePageContent(index, e.target.value);
                                // Auto-grow internal textarea
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            className='w-full flex-1 p-[80px] bg-transparent border-none resize-none focus:ring-0 font-serif text-[15px] leading-relaxed text-slate-900 placeholder-slate-300 outline-none relative z-10 overflow-hidden'
                            placeholder={`Conteúdo da Página ${index + 1}...`}
                            spellCheck={false}
                          />

                          {/* Signature Layer - Integrated & Draggable */}
                          {signatures[index] && signaturePositions[index] && (
                            <div 
                                className={`absolute group/sig animate-in zoom-in-50 duration-300 z-30 cursor-grab active:cursor-grabbing px-4 py-2 rounded-xl hover:bg-slate-50/50 transition-colors ${movingSignature === index ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                style={{ 
                                    left: `${signaturePositions[index].x}px`, 
                                    top: `${signaturePositions[index].y}px`,
                                    transform: 'translate(-50%, -50%)',
                                    pointerEvents: 'auto'
                                }}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setMovingSignature(index);
                                }}
                            >
                              <div className='relative'>
                                <img src={signatures[index]} className='h-24 mix-blend-multiply opacity-90 group-hover/sig:opacity-100 select-none' alt="" onDragStart={(e) => e.preventDefault()} />
                                <div className='absolute -bottom-4 left-0 right-0 border-t border-slate-400 pt-1 whitespace-nowrap opacity-60'>
                                  <p className='text-[8px] font-serif text-slate-500 uppercase tracking-tighter'>Autenticação Digital Igloo</p>
                                </div>
                                
                                {/* Drag Handle Hint */}
                                <div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-md opacity-0 group-hover/sig:opacity-100 transition-all flex items-center gap-1 shadow-lg whitespace-nowrap'>
                                    <Move size={10} /> Arrastar para posicionar
                                </div>
                                
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newSigs = {...signatures};
                                        delete newSigs[index];
                                        setSignatures(newSigs);
                                    }}
                                    className='absolute -right-6 -top-6 w-8 h-8 bg-white shadow-xl rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover/sig:opacity-100 transition-all hover:scale-110 border border-slate-100'
                                >
                                    <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Document Interaction Layer - Active during move or signature placement */}
                          {(movingSignature === index || (!signatures[index] && showSignatureModal)) && (
                              <div 
                                  className='absolute inset-0 z-40 bg-primary/5 cursor-crosshair'
                                  onMouseMove={(e) => {
                                      if (movingSignature === index) {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          const x = e.clientX - rect.left;
                                          const y = e.clientY - rect.top;
                                          setSignaturePositions(prev => ({ ...prev, [index]: { x, y } }));
                                      }
                                  }}
                                  onClick={(e) => {
                                      if (movingSignature === index) {
                                          setMovingSignature(null);
                                      } else {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          const x = e.clientX - rect.left;
                                          const y = e.clientY - rect.top;
                                          setSignaturePositions(prev => ({ ...prev, [index]: { x, y } }));
                                      }
                                  }}
                              />
                          )}
                          
                          {index > 0 && (
                            <button
                                onClick={() => setPageToDelete(index)}
                                className='absolute -right-12 top-0 p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 shadow-sm opacity-0 group-hover/page:opacity-100 transition-all transform hover:scale-110 z-20'
                                title='Remover Página'
                            >
                                <X size={20} />
                            </button>
                          )}

                          {/* Delete Confirmation Overlay */}
                          {pageToDelete === index && (
                             <div className='absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-8 animate-fadeIn'>
                                 <div className='text-center space-y-6 max-w-sm'>
                                     <div className='w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-red-500/10'>
                                         <AlertTriangle size={40} />
                                     </div>
                                     <div>
                                         <h4 className='text-xl font-black text-slate-900'>Excluir Página {index + 1}?</h4>
                                         <p className='text-slate-500 font-medium text-sm mt-2'>
                                             Esta ação é irreversível e todo o conteúdo digitado nesta página será perdido permanentemente.
                                         </p>
                                     </div>
                                     <div className='flex items-center gap-3'>
                                         <button 
                                             onClick={() => setPageToDelete(null)}
                                             className='flex-1 px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all'
                                         >
                                             Cancelar
                                         </button>
                                         <button 
                                             onClick={() => {
                                                 removePage(index);
                                                 setPageToDelete(null);
                                             }}
                                             className='flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all'
                                         >
                                             Sim, Excluir
                                         </button>
                                     </div>
                                 </div>
                             </div>
                           )}

                           <div className='absolute bottom-4 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest'>
                                Pag. {index + 1}
                           </div>
                        </div>
                      ))}

                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center h-full p-12'>
                       <div className='w-full max-w-[680px] bg-white dark:bg-surface-dark p-12 rounded-[40px] shadow-2xl border border-slate-100 dark:border-white/5 text-center'>
                          <ContractUploader onUploadComplete={(file) => setUploadedFile(file)} />
                       </div>
                    </div>
                  )}

                  {/* FAB Button for signature - Right corner */}
                  {!isReadingMode && (
                    <div className='absolute right-6 bottom-6 z-40'>
                      <button
                        onClick={() => setShowSignatureModal(true)}
                        className='px-6 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all text-sm font-black uppercase tracking-widest'
                        title='Assinar Documento'
                      >
                        <PenTool size={18} />
                        Assinar Documento
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Drawer: Contract Intelligence - Hidden in Reading Mode */}
                {!isReadingMode && (
                  <div className='w-[220px] bg-white dark:bg-surface-dark border-l border-slate-200 dark:border-white/5 hidden xl:flex flex-col shrink-0'>
                    <div className='p-4 border-b border-slate-100 dark:border-white/5'>
                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2'>
                          <Layers size={12} /> INTELIGÊNCIA
                        </p>
                        <div className='space-y-4'>
                            {/* Integrated Property View */}
                            {(() => {
                                const prop = properties.find(p => p.name === formData.property);
                                return (
                                    <div className='p-3 rounded-2xl bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 shadow-sm group/prop transition-all hover:border-primary/20'>
                                        <div className='flex flex-col gap-3'>
                                            <div className='w-full h-24 rounded-xl overflow-hidden shadow-md border-2 border-white dark:border-slate-800'>
                                                <img src={prop?.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop'} className='w-full h-full object-cover' alt="" />
                                            </div>
                                            <div className='min-w-0'>
                                                <span className='text-[8px] font-black text-emerald-500 uppercase tracking-tighter'>Imóvel Selecionado</span>
                                                <h5 className='text-[10px] font-black text-slate-900 dark:text-white truncate leading-tight'>{formData.property || 'Não definido'}</h5>
                                                <p className='text-[8px] font-bold text-slate-400 truncate uppercase mt-0.5'>{prop?.address || 'Endereço pendente'}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Integrated Tenant View */}
                            <div className='p-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 transition-all'>
                                <div className='flex flex-col gap-3'>
                                    <div className='flex items-center gap-2'>
                                      <div className='w-8 h-8 rounded-lg bg-white/10 dark:bg-slate-900/5 flex items-center justify-center border border-white/20 dark:border-slate-900/10'>
                                          <User size={14} />
                                      </div>
                                      <span className='text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter'>Locatário</span>
                                    </div>
                                    <div className='min-w-0'>
                                        <h5 className='text-xs font-black truncate leading-tight'>{formData.tenantName || 'Nome do Inquilino'}</h5>
                                        <p className='text-[9px] font-bold opacity-60 truncate uppercase mt-0.5'>Doc: {formData.tenantCpf || '000.000.000-00'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Quick Card */}
                            <div className='p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-3'>
                                <div className='flex items-center gap-2'>
                                    <div className='w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20'>
                                        <CircleDollarSign size={14} />
                                    </div>
                                    <div>
                                        <span className='text-[8px] font-black text-emerald-600 uppercase tracking-tighter block leading-none'>Mensalidade</span>
                                        <span className='text-xs font-black text-slate-900 dark:text-white'>R$ {formData.rentValue || '0,00'}</span>
                                    </div>
                                </div>
                                <div className='pt-2 border-t border-emerald-500/10 text-right'>
                                    <span className='text-[8px] font-black text-slate-500 uppercase tracking-tighter block leading-none'>Garantia</span>
                                    <span className='text-[10px] font-bold text-slate-600 dark:text-slate-400'>3 meses</span>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className='animate-fadeIn space-y-10 py-10'>
              {/* Review Header */}
              <div className='text-center space-y-4'>
                <div className='relative inline-block'>
                    <div className='w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto text-white shadow-2xl shadow-emerald-500/20 rotate-3'>
                        <ShieldCheck size={48} />
                    </div>
                    <div className='absolute -right-2 -top-2 w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg text-emerald-500 animate-bounce'>
                        <CheckCircle2 size={24} />
                    </div>
                </div>
                <div>
                    <h3 className='text-4xl font-black text-slate-900 dark:text-white tracking-tighter'>Auditório de Conformidade</h3>
                    <p className='text-slate-500 font-medium'>Validamos todos os pontos críticos. O contrato está pronto para emissão.</p>
                </div>
              </div>

              {/* Advanced Review Dashboard */}
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto'>
                
                {/* Left: Summary Assets */}
                <div className='lg:col-span-2 space-y-6'>
                    {/* Main Details Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Property Snapshot */}
                        <div className='bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm'>
                            <div className='flex items-start gap-4'>
                                <div className='w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-800 shrink-0'>
                                    <img 
                                        src={properties.find(p => p.name === formData.property)?.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'} 
                                        className='w-full h-full object-cover' 
                                        alt="" 
                                    />
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>O Imóvel</span>
                                    <h4 className='text-lg font-black text-slate-900 dark:text-white leading-tight truncate'>{formData.property || 'Studio Centro 01'}</h4>
                                    <p className='text-xs text-slate-500 font-medium truncate mt-1'>Rua Augusta, 1200 - São Paulo</p>
                                </div>
                            </div>
                        </div>

                        {/* Tenant Snapshot */}
                        <div className='bg-slate-900 dark:bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-900/10 text-white dark:text-slate-900'>
                            <div className='flex items-start gap-4'>
                                <div className='w-16 h-16 rounded-2xl bg-white/10 dark:bg-slate-900/5 flex items-center justify-center border border-white/20 dark:border-slate-800/10 shrink-0'>
                                    <User size={32} />
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <span className='text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest'>Locatário Principal</span>
                                    <h4 className='text-lg font-black leading-tight truncate'>{formData.tenantName || 'João Silva'}</h4>
                                    <p className='text-xs opacity-60 font-bold mt-1 uppercase'>CPF: {formData.tenantCpf || '000.000.000-00'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financials & Term Section */}
                    <div className='bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl'>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
                            <div className='space-y-1'>
                                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>Mensalidade</span>
                                <p className='text-xl font-black text-emerald-500 leading-none'>R$ {formData.rentValue || '1.800'}</p>
                                <span className='text-[10px] font-bold text-slate-400'>Venc. todo dia 10</span>
                            </div>
                            <div className='space-y-1'>
                                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>Garantia</span>
                                <p className='text-xl font-black text-slate-900 dark:text-white leading-none'>R$ {(parseFloat(formData.rentValue || '0') * 3).toLocaleString()}</p>
                                <span className='text-[10px] font-bold text-slate-400'>3x Caução</span>
                            </div>
                            <div className='space-y-1'>
                                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>Início</span>
                                <p className='text-xl font-black text-slate-900 dark:text-white leading-none'>{formData.startDate ? new Date(formData.startDate).toLocaleDateString('pt-BR') : '15/05/2026'}</p>
                                <span className='text-[10px] font-bold text-slate-400'>Adesão Imediata</span>
                            </div>
                            <div className='space-y-1'>
                                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>Documento</span>
                                <p className='text-xl font-black text-slate-900 dark:text-white leading-none truncate'>
                                    {docMode === 'upload' ? (uploadedFile?.name || 'Arquivo Anexo') : `${contractPages.length} Páginas`}
                                </p>
                                <span className='text-[10px] font-bold text-slate-400 uppercase'>{docMode === 'upload' ? 'Assinatura Externa' : 'Minuta Automatizada'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Legal Checklist */}
                <div className='space-y-6'>
                    <div className='bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[40px]'>
                        <h5 className='text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2'>
                            <ShieldCheck size={16} /> Checklist Legal
                        </h5>
                        <div className='space-y-4'>
                            {[
                                'Análise de Crédito Aprovada',
                                'Conformidade Lei 8.245/91',
                                'Cláusula de Reajuste (IGPM)',
                                'Assinatura Digital Ativada',
                                'Vigência Validada'
                            ].map((item, i) => (
                                <div key={i} className='flex items-center gap-3'>
                                    <div className='w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20'>
                                        <CheckCircle size={12} />
                                    </div>
                                    <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='p-6 bg-slate-50 dark:bg-black/20 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10'>
                        <p className='text-[10px] font-bold text-slate-500 text-center leading-relaxed'>
                            Ao clicar em finalizar, o contrato será emitido e enviado para as partes coletarem as assinaturas digitais finais.
                        </p>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
