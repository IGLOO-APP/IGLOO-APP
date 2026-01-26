import React, { useState, useEffect, useRef } from 'react';
import { Building2, User, FileText, DollarSign, Calendar, CheckCircle, ArrowRight, ArrowLeft, Upload, PenTool, X, Plus, Trash2, MapPin, CreditCard, Clock, FileCheck, Feather, Eraser, Download, Save } from 'lucide-react';
import { ContractUploader } from './ContractUploader';
import { KITNET_CONTRACT_TEMPLATE } from '../../utils/contractTemplates';
import { generateFilledContract } from '../../utils/contractGenerator';

interface CreateContractWizardProps {
    onClose: () => void;
    onComplete: (data: any) => void;
}

const STEPS = [
    { id: 1, title: 'Imóvel', icon: Building2 },
    { id: 2, title: 'Inquilino', icon: User },
    { id: 3, title: 'Valores', icon: DollarSign },
    { id: 4, title: 'Vigência', icon: Calendar },
    { id: 5, title: 'Minuta', icon: FileText },
    { id: 6, title: 'Revisão', icon: CheckCircle }
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
const SignatureModal: React.FC<{ onClose: () => void; onConfirm: (signatureDataUrl: string) => void }> = ({ onClose, onConfirm }) => {
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <PenTool size={18} /> Assinatura Digital
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-black/20">
                    <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 shadow-inner overflow-hidden cursor-crosshair relative">
                        <canvas
                            ref={canvasRef}
                            className="w-full h-64 touch-none"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                        <div className="absolute bottom-2 left-4 text-[10px] text-slate-300 pointer-events-none select-none">
                            Assine dentro da caixa
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-surface-dark">
                    <button 
                        onClick={clearCanvas}
                        className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Eraser size={16} /> Limpar
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
                    >
                        <CheckCircle size={16} /> Confirmar Assinatura
                    </button>
                </div>
            </div>
        </div>
    );
};

export const CreateContractWizard: React.FC<CreateContractWizardProps> = ({ onClose, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        property: '',
        tenantName: '',
        tenantCpf: '',
        rentValue: '',
        depositValue: '',
        startDate: new Date().toISOString().split('T')[0], // Default to today
        duration: '30', // months
        autoRenew: false
    });

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
                nome_proprietario: "Investidor Exemplo", // Mock owner
                cpf_proprietario: "000.000.000-00",
                endereco_proprietario: "São Paulo, SP",
                nome_inquilino: formData.tenantName || "_______________________",
                cpf_inquilino: formData.tenantCpf || "_______________________",
                profissao_inquilino: "_______________________",
                email_inquilino: "email@exemplo.com",
                endereco_imovel: formData.property || "_______________________",
                numero_unidade: "N/A",
                ocupacao_maxima: "2",
                data_inicio: new Date(formData.startDate).toLocaleDateString('pt-BR'),
                duracao_meses: formData.duration,
                data_fim: new Date(new Date(formData.startDate).setMonth(new Date(formData.startDate).getMonth() + parseInt(formData.duration))).toLocaleDateString('pt-BR'),
                valor_aluguel: formData.rentValue || "0,00",
                dia_vencimento: "10",
                valor_condominio: "Incluso",
                valor_iptu: "Incluso",
                valor_caucao: formData.depositValue || "0,00",
                cidade_contrato: "São Paulo",
                data_hoje: new Date().toLocaleDateString('pt-BR')
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
            textareaRefs.current.forEach(textarea => {
                if (textarea) {
                    textarea.style.height = 'auto';
                    textarea.style.height = textarea.scrollHeight + 'px';
                }
            });
        }
    }, [contractPages, currentStep]);

    const handleNext = () => {
        if (currentStep < 6) setCurrentStep(currentStep + 1);
        else onComplete({ ...formData, contractText: contractPages.join('\n\n'), uploadedFile, docMode });
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
        setSignatures(prev => ({
            ...prev,
            [lastPageIndex]: dataUrl
        }));
        setShowSignatureModal(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-background-dark flex flex-col animate-slideUp overflow-hidden">
            
            {/* Signature Modal */}
            {showSignatureModal && (
                <SignatureModal 
                    onClose={() => setShowSignatureModal(false)}
                    onConfirm={handleSignatureConfirm}
                />
            )}

            {/* Header */}
            <header className="flex-none bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors"
                        title="Cancelar"
                    >
                        <X size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Novo Contrato</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Assistente de Criação</p>
                    </div>
                </div>
                
                {/* Desktop Stepper */}
                <div className="hidden md:flex items-center">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                                currentStep === step.id 
                                ? 'bg-primary/10 text-primary ring-1 ring-primary/20' 
                                : currentStep > step.id 
                                    ? 'text-emerald-500' 
                                    : 'text-slate-300'
                            }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    currentStep === step.id 
                                    ? 'bg-primary text-white' 
                                    : currentStep > step.id 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-slate-100 dark:bg-white/10'
                                }`}>
                                    {currentStep > step.id ? <CheckCircle size={14} /> : step.id}
                                </div>
                                <span className="text-xs font-bold uppercase">{step.title}</span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`w-8 h-0.5 mx-1 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-white/5'}`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </header>

            {/* Mobile Progress Bar */}
            <div className="md:hidden w-full h-1 bg-slate-100 dark:bg-white/5">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(currentStep / 6) * 100}%` }}></div>
            </div>

            {/* Main Content - Dynamic Width based on Step */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black/20">
                <div className={`mx-auto p-6 md:p-10 min-h-full flex flex-col transition-all duration-300 ${
                    currentStep === 5 ? 'max-w-[1600px] w-full' : 'max-w-4xl'
                }`}>
                    
                    {currentStep === 1 && (
                        <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto w-full">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Selecione o Imóvel</h3>
                                <p className="text-slate-500">Para qual propriedade você deseja criar este contrato?</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {['Apt 101 - Centro', 'Kitnet 05 - Jardins', 'Studio 22 - Vila Madalena'].map(prop => (
                                    <button 
                                        key={prop}
                                        onClick={() => setFormData({...formData, property: prop})}
                                        className={`group relative p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 ${
                                            formData.property === prop 
                                            ? 'border-primary bg-white dark:bg-surface-dark shadow-lg shadow-primary/10' 
                                            : 'border-white dark:border-white/5 bg-white dark:bg-surface-dark hover:border-slate-200 dark:hover:border-white/20'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                            formData.property === prop ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                                        }`}>
                                            <Building2 size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-bold text-lg ${formData.property === prop ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{prop}</h4>
                                            <p className="text-sm text-slate-500">Residencial • Disponível</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.property === prop ? 'border-primary' : 'border-slate-200 dark:border-slate-700'}`}>
                                            {formData.property === prop && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto w-full">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quem é o Inquilino?</h3>
                                <p className="text-slate-500">Informe os dados da pessoa que irá alugar o imóvel.</p>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            value={formData.tenantName}
                                            onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none transition-all font-medium text-slate-900 dark:text-white"
                                            placeholder="Ex: João da Silva"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">CPF</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            value={formData.tenantCpf}
                                            onChange={(e) => setFormData({...formData, tenantCpf: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none transition-all font-medium text-slate-900 dark:text-white"
                                            placeholder="000.000.000-00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto w-full">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Valores do Contrato</h3>
                                <p className="text-slate-500">Defina o aluguel mensal e o valor da garantia.</p>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Aluguel Mensal</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">R$</span>
                                        <input 
                                            type="number"
                                            value={formData.rentValue}
                                            onChange={(e) => setFormData({...formData, rentValue: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none font-bold text-2xl text-slate-900 dark:text-white transition-all"
                                            placeholder="0,00"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Caução (Garantia)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">R$</span>
                                        <input 
                                            type="number"
                                            value={formData.depositValue}
                                            onChange={(e) => setFormData({...formData, depositValue: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none font-bold text-2xl text-slate-900 dark:text-white transition-all"
                                            placeholder="0,00"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><CheckCircle size={12}/> Recomendado: 3x o valor do aluguel.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto w-full">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Vigência</h3>
                                <p className="text-slate-500">Datas e duração do contrato.</p>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Data de Início</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input 
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none font-medium text-slate-900 dark:text-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">Duração</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <select 
                                                value={formData.duration}
                                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-black/40 outline-none font-medium text-slate-900 dark:text-white appearance-none transition-all"
                                            >
                                                <option value="12">12 Meses</option>
                                                <option value="24">24 Meses</option>
                                                <option value="30">30 Meses</option>
                                                <option value="36">36 Meses</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div 
                                    onClick={() => setFormData({...formData, autoRenew: !formData.autoRenew})}
                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.autoRenew ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 dark:bg-black/20 border-transparent'}`}
                                >
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${formData.autoRenew ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent'}`}>
                                        {formData.autoRenew && <CheckCircle size={16} />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${formData.autoRenew ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>Renovação Automática</p>
                                        <p className="text-xs text-slate-500">Prorrogar por igual período automaticamente.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Document Generation/Upload */}
                    {currentStep === 5 && (
                        <div className="space-y-6 animate-fadeIn h-full flex flex-col">
                            
                            {/* Editor Header Toolbar */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Minuta do Contrato</h3>
                                    <p className="text-slate-500 text-sm">Gere o documento automaticamente ou faça upload.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setDocMode('template')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                            docMode === 'template' 
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <PenTool size={16} /> Editor
                                    </button>
                                    <button 
                                        onClick={() => setDocMode('upload')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                            docMode === 'upload' 
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <Upload size={16} /> Upload
                                    </button>
                                </div>
                            </div>

                            {/* Full Screen Editor Container */}
                            <div className="flex-1 min-h-[75vh] border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-100 dark:bg-black/20 overflow-hidden shadow-inner flex flex-col relative group">
                                {docMode === 'template' ? (
                                    <div className="flex flex-col h-full relative">
                                        
                                        {/* Status Bar */}
                                        <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-white/5 p-2 px-6 flex justify-between items-center shrink-0 shadow-sm z-10">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Visualização de Impressão (A4)</span>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-900/30">
                                                {contractPages.length} Páginas
                                            </span>
                                        </div>
                                        
                                        {/* Document Scroll Area */}
                                        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-200/50 dark:bg-black/40 flex flex-col items-center gap-8 scroll-smooth">
                                            {contractPages.map((pageContent, index) => (
                                                <div key={index} className="relative group/page w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl transition-all hover:shadow-xl flex flex-col">
                                                    
                                                    {/* Delete Page Button */}
                                                    {index > 0 && (
                                                        <button 
                                                            onClick={() => removePage(index)}
                                                            className="absolute -right-12 top-0 p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 shadow-sm opacity-0 group-hover/page:opacity-100 transition-all transform hover:scale-110"
                                                            title="Remover Página"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    )}

                                                    {/* Page Content - Auto Resizing Textarea */}
                                                    <textarea 
                                                        ref={(el) => { textareaRefs.current[index] = el; }}
                                                        value={pageContent}
                                                        onChange={(e) => {
                                                            updatePageContent(index, e.target.value);
                                                            e.target.style.height = 'auto';
                                                            e.target.style.height = e.target.scrollHeight + 'px';
                                                        }}
                                                        className="w-full flex-1 p-[25mm] pb-4 bg-transparent border-none resize-none focus:ring-0 font-serif text-base leading-relaxed text-slate-900 placeholder-slate-300 overflow-hidden"
                                                        placeholder={`Conteúdo da Página ${index + 1}...`}
                                                        spellCheck={false}
                                                    />

                                                    {/* Signature Image Layer */}
                                                    {signatures[index] && (
                                                        <div className="px-[25mm] pb-[25mm]">
                                                            <img src={signatures[index]} alt="Assinatura" className="h-24 mix-blend-multiply opacity-90" />
                                                            <div className="border-t border-black w-64 pt-1">
                                                                <p className="text-xs font-serif text-black">Assinatura Digital</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Page Number */}
                                                    <div className="absolute bottom-8 right-10 text-[10px] text-slate-300 font-sans font-bold uppercase tracking-widest pointer-events-none select-none">
                                                        Página {index + 1}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Action Buttons at the bottom of the scroll */}
                                            <div className="pb-10 opacity-50 hover:opacity-100 transition-opacity">
                                                <p className="text-xs text-slate-500 text-center mb-2">Fim do documento</p>
                                                <div className="w-2 h-2 bg-slate-300 rounded-full mx-auto"></div>
                                            </div>
                                        </div>

                                        {/* Floating Toolbar inside Editor */}
                                        <div className="absolute right-6 bottom-6 flex flex-col gap-3 z-30">
                                            <button 
                                                onClick={() => setShowSignatureModal(true)}
                                                className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 tooltip-trigger"
                                                title="Inserir Assinatura"
                                            >
                                                <Feather size={20} />
                                            </button>
                                            <button 
                                                onClick={addPage}
                                                className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                                                title="Adicionar Nova Página"
                                            >
                                                <Plus size={24} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-10 h-full flex flex-col items-center justify-center bg-white dark:bg-surface-dark">
                                        <ContractUploader 
                                            onUploadComplete={(file) => setUploadedFile(file)}
                                        />
                                        {uploadedFile && (
                                            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-4 w-full max-w-md">
                                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 truncate">{uploadedFile.name}</p>
                                                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Pronto para assinatura</p>
                                                </div>
                                                <CheckCircle size={20} className="text-emerald-500" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-8 animate-fadeIn h-full flex flex-col justify-center items-center">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/20 ring-4 ring-white dark:ring-surface-dark">
                                    <FileCheck size={40} />
                                </div>
                                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Tudo Pronto!</h3>
                                <p className="text-lg text-slate-500 max-w-md mx-auto">Revise os detalhes abaixo antes de gerar o contrato final.</p>
                            </div>

                            <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden">
                                <div className="bg-slate-50 dark:bg-white/5 p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumo do Contrato</span>
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">Rascunho</span>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-white/10 pb-4">
                                        <span className="text-slate-500 font-medium text-sm">Imóvel</span>
                                        <div className="text-right">
                                            <span className="block font-bold text-slate-900 dark:text-white">{formData.property}</span>
                                            <span className="text-xs text-slate-400">Residencial</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-white/10 pb-4">
                                        <span className="text-slate-500 font-medium text-sm">Inquilino</span>
                                        <span className="block font-bold text-slate-900 dark:text-white">{formData.tenantName}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-white/10 pb-4">
                                        <span className="text-slate-500 font-medium text-sm">Valor Mensal</span>
                                        <span className="font-bold text-emerald-600 text-xl">R$ {formData.rentValue}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-slate-500 font-medium text-sm">Documento</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300 text-right flex items-center gap-2">
                                            {docMode === 'upload' ? <Upload size={14}/> : <FileText size={14}/>}
                                            {docMode === 'upload' 
                                                ? (uploadedFile ? uploadedFile.name : 'Pendente') 
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
            <div className="flex-none p-6 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark z-20">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button 
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Voltar
                    </button>
                    <button 
                        onClick={handleNext}
                        className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 text-base"
                    >
                        {currentStep === 6 ? 'Criar Contrato' : 'Próximo'}
                        {currentStep < 6 && <ArrowRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};