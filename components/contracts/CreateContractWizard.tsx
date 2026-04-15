import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  User,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
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
} from 'lucide-react';
import { ContractUploader } from './ContractUploader';
import { KITNET_CONTRACT_TEMPLATE } from '../../utils/contractTemplates';
import { generateFilledContract } from '../../utils/contractGenerator';

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
        <div className='p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center'>
          <h3 className='font-bold text-slate-900 dark:text-white flex items-center gap-2'>
            <PenTool size={18} /> Assinatura Digital
          </h3>
          <button
            onClick={onClose}
            className='p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500'
          >
            <X size={20} />
          </button>
        </div>

        <div className='p-4 bg-slate-50 dark:bg-black/20'>
          <div className='bg-white rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 shadow-inner overflow-hidden cursor-crosshair relative'>
            <canvas
              ref={canvasRef}
              className='w-full h-64 touch-none'
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className='absolute bottom-2 left-4 text-[10px] text-slate-300 pointer-events-none select-none'>
              Assine dentro da caixa
            </div>
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
  
  const mockProperties = [
    {
      id: 1,
      name: 'Studio Centro 01',
      address: 'Rua Augusta, 150 - Consolação',
      price: '1.800,00',
      type: 'Residencial',
      status: 'Disponível',
      beds: 1,
      baths: 1,
      area: '32m²',
      vacantDays: '12 d.',
      visits: 24,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 2,
      name: 'Garden Loft Jardins',
      address: 'Al. Campinas, 980 - Jardins',
      price: '4.500,00',
      type: 'Residencial',
      status: 'Disponível',
      beds: 2,
      baths: 2,
      area: '85m²',
      vacantDays: '5 d.',
      visits: 42,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 3,
      name: 'Kitnet Vila Olímpia',
      address: 'Rua das Olimpíadas, 45 - V. Olímpia',
      price: '2.200,00',
      type: 'Residencial',
      status: 'Disponível',
      beds: 1,
      baths: 1,
      area: '28m²',
      vacantDays: '2 d.',
      visits: 12,
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=400',
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=400',
    }
  ];

  const mockTenants = [
    { id: 1, name: 'João Silva', cpf: '123.456.789-00', email: 'joao@teste.com', avatar: 'https://i.pravatar.cc/150?u=joao' },
    { id: 2, name: 'Maria Oliveira', cpf: '987.654.321-11', email: 'maria@teste.com', avatar: 'https://i.pravatar.cc/150?u=maria' },
    { id: 3, name: 'Carlos Pereira', cpf: '456.789.123-22', email: 'carlos@teste.com', avatar: 'https://i.pravatar.cc/150?u=carlos' },
    { id: 4, name: 'Ana Costa', cpf: '234.567.890-33', email: 'ana@teste.com', avatar: 'https://i.pravatar.cc/150?u=ana' },
  ];

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
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

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

  // Step 5 State: Document
  const [docMode, setDocMode] = useState<'template' | 'upload'>('template');
  const [contractPages, setContractPages] = useState<string[]>(['']);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Signature State
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  // Maps page index to signature image URL
  const [signatures, setSignatures] = useState<Record<number, string>>({});

  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Auto-generate contract text when entering Step 5
  useEffect(() => {
    if (currentStep === 5 && contractPages.length === 1 && contractPages[0] === '') {
      const dataMap = {
        nome_proprietario: 'Investidor Exemplo', // Mock owner
        cpf_proprietario: '000.000.000-00',
        endereco_proprietario: 'São Paulo, SP',
        nome_inquilino: formData.tenantName || '_______________________',
        cpf_inquilino: formData.tenantCpf || '_______________________',
        profissao_inquilino: '_______________________',
        email_inquilino: 'email@exemplo.com',
        endereco_imovel: formData.property || '_______________________',
        numero_unidade: 'N/A',
        ocupacao_maxima: '2',
        data_inicio: new Date(formData.startDate).toLocaleDateString('pt-BR'),
        duracao_meses: formData.duration,
        data_fim: new Date(
          new Date(formData.startDate).setMonth(
            new Date(formData.startDate).getMonth() + parseInt(formData.duration)
          )
        ).toLocaleDateString('pt-BR'),
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

  const handleNext = () => {
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
    setShowSignatureModal(false);
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

      {/* Header */}
      <header className='flex-none bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between shadow-sm z-20'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onClose}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors'
            title='Cancelar'
          >
            <X size={24} />
          </button>
          <div>
            <h1 className='text-lg font-bold text-slate-900 dark:text-white leading-none'>
              Novo Contrato
            </h1>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium'>
              Assistente de Criação
            </p>
          </div>
        </div>

        {/* Desktop Stepper */}
        <div className='hidden md:flex items-center'>
          {STEPS.map((step, index) => (
            <div key={step.id} className='flex items-center'>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                  currentStep === step.id
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                    : currentStep > step.id
                      ? 'text-emerald-500'
                      : 'text-slate-300'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStep === step.id
                      ? 'bg-primary text-white'
                      : currentStep > step.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-white/10'
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle size={14} /> : step.id}
                </div>
                <span className='text-xs font-bold uppercase'>{step.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-white/5'}`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </header>

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
          className={`mx-auto p-6 md:p-10 min-h-full flex flex-col transition-all duration-300 ${
            currentStep === 5 ? 'max-w-[1600px] w-full' : 'max-w-4xl'
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
                {mockProperties.map((prop) => (
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
                ))}
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
                      {mockTenants
                        .filter(t => 
                          t.name.toLowerCase().includes(tenantSearch.toLowerCase()) || 
                          t.cpf.includes(tenantSearch)
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
                            <img src={tenant.avatar} className='w-12 h-12 rounded-full border border-slate-100 dark:border-white/5' alt="" />
                            <div className='flex-1'>
                              <h4 className='font-bold text-slate-900 dark:text-white leading-tight'>{tenant.name}</h4>
                              <p className='text-xs text-slate-400 font-medium'>{tenant.cpf} • {tenant.email}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedTenantId === tenant.id ? 'border-primary bg-primary text-white' : 'border-slate-200 dark:border-white/5'}`}>
                              {selectedTenantId === tenant.id && <div className='w-1.5 h-1.5 bg-white rounded-full' />}
                            </div>
                          </button>
                        ))
                      }
                      
                      {/* Empty State */}
                      {mockTenants.filter(t => t.name.toLowerCase().includes(tenantSearch.toLowerCase()) || t.cpf.includes(tenantSearch)).length === 0 && (
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
                            R$ {mockProperties.find(p => p.name === formData.property)?.price || '0,00'}
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
                        {formData.rentValue !== mockProperties.find(p => p.name === formData.property)?.price.replace(/\./g, '').replace(',', '.') && (
                          <button 
                            onClick={() => {
                              const base = mockProperties.find(p => p.name === formData.property)?.price.replace(/\./g, '').replace(',', '.') || '0';
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
              {/* Professional Legal Toolbar */}
              <div className='flex-none bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-white/5 p-4 py-3 flex items-center justify-between shadow-sm z-30'>
                <div className='flex items-center gap-6'>
                  <div className='flex items-center gap-2'>
                    <div className='w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg'>
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h4 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight'>Legal Workspace</h4>
                      <p className='text-[10px] font-bold text-slate-400 flex items-center gap-1'>
                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500'></span> Editando Minuta
                      </p>
                    </div>
                  </div>

                  <div className='h-8 w-px bg-slate-100 dark:bg-white/5'></div>

                  <div className='flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl'>
                    <button
                      onClick={() => setDocMode('template')}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        docMode === 'template' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      <BookOpen size={14} /> Editor
                    </button>
                    <button
                      onClick={() => setDocMode('upload')}
                      className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                        docMode === 'upload' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      <Upload size={14} /> Próprio
                    </button>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='text-right hidden sm:block'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-tighter'>Palavras</p>
                    <p className='text-sm font-black text-slate-900 dark:text-white'>
                      {contractPages.join(' ').split(/\s+/).length}
                    </p>
                  </div>
                  <div className='h-8 w-px bg-slate-100 dark:bg-white/5'></div>
                  <button 
                    onClick={handleNext}
                    className='px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all'
                  >
                    Próximo Passo
                  </button>
                </div>
              </div>

              {/* Main Workspace Area */}
              <div className='flex-1 flex overflow-hidden bg-slate-100 dark:bg-black/40'>
                {/* Left Drawer: Clause Navigator */}
                <div className='w-72 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-white/5 hidden lg:flex flex-col shrink-0'>
                  <div className='p-4 border-b border-slate-100 dark:border-white/5'>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-300' size={14} />
                      <input 
                        type="text" 
                        placeholder="Buscar cláusula..."
                        className='w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-black/20 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary'
                      />
                    </div>
                  </div>
                  <div className='flex-1 overflow-y-auto p-2 space-y-1'>
                    {[
                      'DAS PARTES', 'DO OBJETO', 'DO VALOR', 'DA GARANTIA', 
                      'DAS OBRIGAÇÕES', 'DA RESCISÃO', 'DO FORO'
                    ].map((clause, i) => (
                      <button 
                        key={i}
                        className='w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left flex items-center justify-between group transition-all'
                      >
                        <span className='text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary'>{clause}</span>
                        <div className='w-5 h-5 rounded-md bg-slate-100 dark:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                          <ArrowRight size={10} className='text-slate-400' />
                        </div>
                      </button>
                    ))}
                    
                    <div className='mt-8 pt-4 border-t border-slate-100 dark:border-white/5 mx-2'>
                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3'>Variáveis Injetadas</p>
                        <div className='space-y-2 px-2'>
                            {[
                                {k: 'Inquilino', v: formData.tenantName},
                                {k: 'Imóvel', v: formData.property},
                                {k: 'Mensalidade', v: `R$ ${formData.rentValue}`}
                            ].map((v, i) => (
                                <div key={i} className='p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex flex-col'>
                                    <span className='text-[8px] font-black text-emerald-600 uppercase'>{v.k}</span>
                                    <span className='text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate'>{v.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                </div>

                {/* Center: Document Editor */}
                <div className='flex-1 flex flex-col relative'>
                  {docMode === 'template' ? (
                    <div className='flex flex-col h-full overflow-y-auto p-4 md:p-12 items-center bg-slate-200/50 dark:bg-black/60 custom-scrollbar'>
                      {contractPages.map((pageContent, index) => (
                        <div
                          key={index}
                          className='relative group/page w-full max-w-[210mm] min-h-[297mm] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] mb-12 flex flex-col transform transition-transform hover:scale-[1.005]'
                        >
                          {/* Signature Layer */}
                          {signatures[index] && (
                            <div className='absolute right-[25mm] bottom-[40mm] pointer-events-none'>
                              <img src={signatures[index]} className='h-20 mix-blend-multiply transition-opacity opacity-90' alt="" />
                              <div className='border-t border-black w-48 mt-1'>
                                <p className='text-[10px] font-serif text-black uppercase'>Assinado Digitalmente</p>
                              </div>
                            </div>
                          )}

                          <textarea
                            ref={(el) => { textareaRefs.current[index] = el; }}
                            value={pageContent}
                            onChange={(e) => {
                              updatePageContent(index, e.target.value);
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            className='w-full flex-1 p-[25mm] bg-transparent border-none resize-none focus:ring-0 font-serif text-base leading-relaxed text-slate-900 placeholder-slate-300'
                            placeholder={`Conteúdo da Página ${index + 1}...`}
                            spellCheck={false}
                          />
                          
                          {index > 0 && (
                            <button
                              onClick={() => removePage(index)}
                              className='absolute -right-12 top-0 p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 shadow-sm opacity-0 group-hover/page:opacity-100 transition-all transform hover:scale-110'
                              title='Remover Página'
                            >
                                <X size={20} />
                            </button>
                          )}

                          <div className='absolute bottom-8 right-12 text-[10px] font-black text-slate-300 uppercase tracking-widest'>
                            Pag. {index + 1}
                          </div>
                        </div>
                      ))}

                      {/* Floating Workspace Toolbar */}
                      <div className='fixed right-10 bottom-10 flex flex-col gap-4 z-40'>
                        <button
                          onClick={() => setShowSignatureModal(true)}
                          className='w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all'
                          title='Coletar Assinatura'
                        >
                          <Feather size={24} />
                        </button>
                        <button
                          onClick={addPage}
                          className='w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all'
                          title='Nova Página'
                        >
                          <Plus size={28} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='p-12 flex flex-col items-center justify-center h-full'>
                       <div className='w-full max-w-2xl bg-white dark:bg-surface-dark p-12 rounded-[40px] shadow-2xl border border-slate-100 dark:border-white/5 text-center'>
                          <ContractUploader onUploadComplete={(file) => setUploadedFile(file)} />
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className='space-y-8 animate-fadeIn h-full flex flex-col justify-center items-center'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/20 ring-4 ring-white dark:ring-surface-dark'>
                  <FileCheck size={40} />
                </div>
                <h3 className='text-3xl font-extrabold text-slate-900 dark:text-white mb-2'>
                  Tudo Pronto!
                </h3>
                <p className='text-lg text-slate-500 max-w-md mx-auto'>
                  Revise os detalhes abaixo antes de gerar o contrato final.
                </p>
              </div>

              <div className='w-full max-w-lg bg-white dark:bg-surface-dark rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden'>
                <div className='bg-slate-50 dark:bg-white/5 p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center'>
                  <span className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                    Resumo do Contrato
                  </span>
                  <span className='bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded'>
                    Rascunho
                  </span>
                </div>
                <div className='p-6 space-y-4'>
                  <div className='flex justify-between items-center border-b border-dashed border-slate-200 dark:border-white/10 pb-4'>
                    <span className='text-slate-500 font-medium text-sm'>Imóvel</span>
                    <div className='text-right'>
                      <span className='block font-bold text-slate-900 dark:text-white'>
                        {formData.property}
                      </span>
                      <span className='text-xs text-slate-400'>Residencial</span>
                    </div>
                  </div>
                  <div className='flex justify-between items-center border-b border-dashed border-slate-200 dark:border-white/10 pb-4'>
                    <span className='text-slate-500 font-medium text-sm'>Inquilino</span>
                    <span className='block font-bold text-slate-900 dark:text-white'>
                      {formData.tenantName}
                    </span>
                  </div>
                  <div className='flex justify-between items-center border-b border-dashed border-slate-200 dark:border-white/10 pb-4'>
                    <span className='text-slate-500 font-medium text-sm'>Valor Mensal</span>
                    <span className='font-bold text-emerald-600 text-xl'>
                      R$ {formData.rentValue}
                    </span>
                  </div>
                  <div className='flex justify-between items-center pt-2'>
                    <span className='text-slate-500 font-medium text-sm'>Documento</span>
                    <span className='font-bold text-slate-700 dark:text-slate-300 text-right flex items-center gap-2'>
                      {docMode === 'upload' ? <Upload size={14} /> : <FileText size={14} />}
                      {docMode === 'upload'
                        ? uploadedFile
                          ? uploadedFile.name
                          : 'Pendente'
                        : `Minuta Automática (${contractPages.length} pgs)`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className='flex-none p-6 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark z-20'>
        <div className='max-w-4xl mx-auto flex justify-between items-center'>
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className='px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-2'
          >
            <ArrowLeft size={18} /> Voltar
          </button>
          <button
            onClick={handleNext}
            className='px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 text-base'
          >
            {currentStep === 6 ? 'Criar Contrato' : 'Próximo'}
            {currentStep < 6 && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
