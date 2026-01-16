import React, { useState, useEffect } from 'react';
import { Plus, Calendar, PlayCircle, Clock, History, AlertTriangle, X, Building2, User, ChevronDown, FileText, Calculator, Printer, ShieldAlert, Upload, Send, CheckCheck, Fingerprint, Lock, Eye, Download, MessageCircle, AlertCircle } from 'lucide-react';
import { KITNET_CONTRACT_TEMPLATE, KITNET_RULES_TEMPLATE } from '../utils/contractTemplates';
import { generateFilledContract, getMockContractData } from '../utils/contractGenerator';
import { ContractUploader } from '../components/contracts/ContractUploader';
import { generateSignatureRequestMessage, captureSignerMetadata } from '../utils/signatureLogic';
import { SignatureAudit, Contract } from '../types';

const Contracts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [selectedContractForSign, setSelectedContractForSign] = useState<Contract | null>(null);
  
  // New Contract Flow State
  const [creationMode, setCreationMode] = useState<'template' | 'upload' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [signRequestStep, setSignRequestStep] = useState<1 | 2 | 3>(1); // 1: Method, 2: Upload/Gen, 3: Select Tenant
  
  // Signing State
  const [isSigning, setIsSigning] = useState(false);
  const [auditData, setAuditData] = useState<SignatureAudit | null>(null);

  // Contract Generation State
  const [docType, setDocType] = useState<'contract' | 'rules'>('contract');
  const [previewContent, setPreviewContent] = useState('');
  
  // Tenant Selection State
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedTenantContact, setSelectedTenantContact] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');

  // Contract Breakdown State (Template)
  const [rentValue, setRentValue] = useState('');
  const [condoValue, setCondoValue] = useState('');
  const [iptuValue, setIptuValue] = useState('');
  const [feeValue, setFeeValue] = useState('');
  const [totalValue, setTotalValue] = useState(0);

  // Updated Mock Data with specific statuses for UX demo
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: 1,
      property: 'Apto 104 - Centro',
      start_date: '10 Out 2023',
      end_date: '10 Out 2024',
      value: 'R$ 1.500',
      status: 'pending_signature', // "Pendente de Envio" logic simulation or "Aguardando"
      sent_date: undefined, // Not sent yet
      pdf_url: '#',
      audit_trail: undefined
    },
    {
      id: 2,
      property: 'Kitnet 05 - Jardins',
      tenant: 'João Silva',
      tenant_phone: '5511999999999',
      start_date: '01 Jan 2024',
      end_date: '01 Jan 2026',
      value: 'R$ 1.200',
      status: 'pending_signature',
      sent_date: '2024-03-10T10:00:00Z', // Sent 2 days ago
      viewed_by_tenant: true, // Tenant saw it but didn't sign
      pdf_url: '#',
    },
    {
      id: 3,
      property: 'Studio 22 - Vila Madalena',
      tenant: 'Maria Oliveira',
      start_date: '01 Fev 2024',
      end_date: '01 Fev 2026',
      value: 'R$ 1.800',
      status: 'active', // Signed
      audit_trail: {
          signed_at: '2024-02-01T14:30:00Z',
          signer_ip: '201.123.45.67',
          user_agent: 'Mozilla/5.0...',
          signer_identifier: 'maria@email.com',
          document_hash: 'a1b2c3d4e5f6...',
          integrity_verified: true
      }
    },
    {
        id: 4,
        property: 'Loft Industrial',
        tenant: 'Carlos Pereira',
        start_date: '15 Mar 2023',
        end_date: '15 Mar 2024', // Expiring Soon (assuming today is Mar 2024)
        value: 'R$ 2.400',
        status: 'active',
        audit_trail: { signed_at: '...', signer_ip: '...', user_agent: '...', signer_identifier: '...', document_hash: '...', integrity_verified: true }
    }
  ]);

  useEffect(() => {
    const r = parseFloat(rentValue) || 0;
    const c = parseFloat(condoValue) || 0;
    const i = parseFloat(iptuValue) || 0;
    const f = parseFloat(feeValue) || 0;
    setTotalValue(r + c + i + f);
  }, [rentValue, condoValue, iptuValue, feeValue]);

  // Generate preview when form opens or doc type changes
  useEffect(() => {
      if (showAddForm && creationMode === 'template') {
          const template = docType === 'contract' ? KITNET_CONTRACT_TEMPLATE : KITNET_RULES_TEMPLATE;
          const mockData = getMockContractData();
          if (rentValue) mockData.valor_aluguel = rentValue;
          
          const content = generateFilledContract(template, mockData);
          setPreviewContent(content);
      }
  }, [showAddForm, docType, rentValue, creationMode]);

  const handleOpenSignModal = (contract: Contract) => {
      setSelectedContractForSign(contract);
      setSignModalOpen(true);
      // Generate preview content for existing contracts if strictly template based
      // For demo, we just reuse the template text if it's not an uploaded file
      const template = KITNET_CONTRACT_TEMPLATE;
      const mockData = getMockContractData();
      setPreviewContent(generateFilledContract(template, mockData));
  };

  const handleDigitalSignature = async () => {
      setIsSigning(true);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const audit = await captureSignerMetadata(selectedContractForSign?.tenant || 'tenant@email.com');
      
      setAuditData(audit);
      setIsSigning(false);
      
      // Update contract list status locally
      if (selectedContractForSign) {
          setContracts(prev => prev.map(c => c.id === selectedContractForSign.id ? { ...c, status: 'active', audit_trail: audit } : c));
      }
  };

  const handleResetForm = () => {
      setShowAddForm(false);
      setSignRequestStep(1);
      setCreationMode(null);
      setUploadedFile(null);
      setSelectedTenant('');
      setGeneratedMessage('');
  };

  const handleProceedToTenant = () => {
      setSignRequestStep(3);
      // Simulate message generation
      const msg = generateSignatureRequestMessage(
          "Investidor Exemplo", 
          selectedTenant || "Inquilino", 
          "Imóvel Selecionado", 
          "https://igloo.app/sign/contract-123"
      );
      setGeneratedMessage(msg);
  };

  const handleSendWhatsApp = (contract: Contract) => {
      const msg = encodeURIComponent(`Olá, segue o link para assinatura do contrato: https://igloo.app/sign/${contract.id}`);
      window.open(`https://wa.me/${contract.tenant_phone || ''}?text=${msg}`, '_blank');
  };

  // Helper to determine status display
  const getStatusDisplay = (contract: Contract) => {
      // Logic for Expiring Soon
      const endDate = new Date(contract.end_date);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (contract.status === 'active' && diffDays <= 30 && diffDays > 0) {
          return { label: 'Vencendo em breve', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle };
      }

      if (contract.status === 'active') {
          return { label: 'Assinado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCheck };
      }

      if (contract.status === 'pending_signature') {
          if (!contract.sent_date) {
              return { label: 'Pendente de Envio', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Send };
          }
          return { label: 'Aguardando Assinatura', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock };
      }

      return { label: 'Rascunho', color: 'bg-gray-100 text-gray-500', icon: FileText };
  };

  return (
    <div className="h-full flex flex-col w-full max-w-md mx-auto md:max-w-4xl relative">
       <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark px-4 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/5 transition-colors">
         <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Gestão de Contratos</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Status e Assinaturas</p>
         </div>
         <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-surface-dark text-primary shadow-sm border border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
         >
            <Plus size={24} />
         </button>
       </header>

       <div className="px-4 py-2">
         <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            <button onClick={() => setActiveTab('all')} className={`flex h-9 shrink-0 items-center gap-x-2 rounded-full px-4 shadow-sm transition-all ${activeTab === 'all' ? 'bg-primary text-white' : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'}`}>
                <span className="text-sm font-bold">Todos</span>
            </button>
            <button onClick={() => setActiveTab('pending')} className={`flex h-9 shrink-0 items-center gap-x-2 rounded-full px-4 shadow-sm transition-all ${activeTab === 'pending' ? 'bg-primary text-white' : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'}`}>
                <span className="text-sm font-medium">Pendentes</span>
            </button>
            <button onClick={() => setActiveTab('active')} className={`flex h-9 shrink-0 items-center gap-x-2 rounded-full px-4 shadow-sm transition-all ${activeTab === 'active' ? 'bg-primary text-white' : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'}`}>
                <span className="text-sm font-medium">Ativos</span>
            </button>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
          {contracts.map(contract => {
             const statusInfo = getStatusDisplay(contract);
             const StatusIcon = statusInfo.icon;

             return (
             <div key={contract.id} className={`flex flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden transition-all hover:shadow-md`}>
                 {/* Header Status Bar */}
                 <div className={`px-4 py-2 flex justify-between items-center border-b ${statusInfo.color.replace('bg-', 'bg-opacity-20 bg-').replace('text-', 'text-opacity-100 ')} dark:bg-opacity-10`}>
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${statusInfo.color.split(' ')[1]}`}>
                        <StatusIcon size={14} />
                        {statusInfo.label}
                    </div>
                    {contract.sent_date && !contract.audit_trail && (
                        <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                            <Clock size={10} /> Enviado há 2 dias
                        </span>
                    )}
                 </div>

                 <div className="flex p-4 gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 font-bold text-lg">
                        {contract.tenant ? contract.tenant.charAt(0) : <User size={20} />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{contract.property}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{contract.tenant || 'Inquilino não atribuído'}</p>
                        
                        {/* Visual Feedback: Viewed */}
                        {contract.viewed_by_tenant && !contract.audit_trail && (
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/10 w-fit px-2 py-0.5 rounded-full animate-pulse">
                                <Eye size={10} /> Visualizado pelo inquilino
                            </div>
                        )}
                    </div>
                    <div className="text-right flex flex-col justify-center">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{contract.value}</span>
                        <span className="text-[10px] text-slate-400">Mensal</span>
                    </div>
                 </div>
                 
                 {/* Action Footer */}
                 <div className="px-4 pb-4 pt-0 flex gap-2">
                     {statusInfo.label === 'Pendente de Envio' && (
                         <button 
                            onClick={() => handleSendWhatsApp(contract)}
                            className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                         >
                             <MessageCircle size={14} /> Enviar por WhatsApp
                         </button>
                     )}

                     {statusInfo.label === 'Aguardando Assinatura' && (
                         <button 
                            className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                         >
                             <Send size={14} /> Reenviar Link
                         </button>
                     )}

                     {(statusInfo.label === 'Assinado' || statusInfo.label === 'Vencendo em breve') && (
                         <button 
                            className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                         >
                             <Download size={14} /> Baixar PDF
                         </button>
                     )}
                     
                     <button 
                        onClick={() => handleOpenSignModal(contract)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-slate-400 hover:text-primary hover:border-primary transition-colors"
                        title="Visualizar"
                     >
                         <Eye size={16} />
                     </button>
                 </div>
             </div>
          )})}
       </div>

       {/* SIGNING MODAL (Tenant View Simulation) */}
       {signModalOpen && selectedContractForSign && (
           <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-fadeIn">
               <div className="w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-3xl bg-background-light dark:bg-background-dark rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp ring-1 ring-white/10">
                   <div className="flex-none flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5">
                       <h2 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                           <Fingerprint className="text-primary" size={24} /> Assinatura Digital
                       </h2>
                       <button onClick={() => setSignModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white"><X size={24} /></button>
                   </div>

                   <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-black/20 p-4 md:p-8">
                       {!auditData ? (
                           <div className="max-w-2xl mx-auto bg-white text-black p-8 shadow-xl min-h-[500px] text-[10px] md:text-xs leading-relaxed font-serif whitespace-pre-wrap select-none relative">
                               {previewContent}
                               <div className="mt-12 border-t pt-4">
                                   <p className="font-bold">ASSINATURAS</p>
                                   <div className="mt-8 border-b border-black w-1/2"></div>
                                   <p>LOCADOR: Imobiliária Igloo Ltda</p>
                                   <div className="mt-8 border-b border-black w-1/2"></div>
                                   <p>LOCATÁRIO: {selectedContractForSign.tenant || 'Inquilino'}</p>
                               </div>
                           </div>
                       ) : (
                           <div className="max-w-2xl mx-auto space-y-4 animate-fadeIn">
                               <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center">
                                   <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-200">
                                       <CheckCheck size={32} />
                                   </div>
                                   <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">Documento Assinado com Sucesso!</h3>
                                   <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">Todas as partes foram notificadas.</p>
                               </div>

                               {/* Audit Trail Card */}
                               <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                   <div className="bg-slate-50 dark:bg-white/5 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                       <Lock size={16} className="text-slate-500" />
                                       <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Trilha de Auditoria e Integridade</span>
                                   </div>
                                   <div className="p-4 space-y-3">
                                       <div className="grid grid-cols-2 gap-4 text-xs">
                                           <div>
                                               <span className="block text-slate-400 uppercase font-bold text-[10px]">Data/Hora UTC</span>
                                               <span className="font-mono text-slate-800 dark:text-slate-200">{auditData.signed_at}</span>
                                           </div>
                                           <div>
                                               <span className="block text-slate-400 uppercase font-bold text-[10px]">IP do Signatário</span>
                                               <span className="font-mono text-slate-800 dark:text-slate-200">{auditData.signer_ip}</span>
                                           </div>
                                       </div>
                                       <div>
                                           <span className="block text-slate-400 uppercase font-bold text-[10px]">Hash do Documento (SHA-256)</span>
                                           <span className="font-mono text-[10px] break-all text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-black/30 p-1.5 rounded">{auditData.document_hash}</span>
                                       </div>
                                       <div>
                                           <span className="block text-slate-400 uppercase font-bold text-[10px]">Dispositivo / User Agent</span>
                                           <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 truncate block">{auditData.user_agent}</span>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       )}
                   </div>

                   <div className="flex-none p-4 md:p-6 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/5 z-20">
                       {!auditData ? (
                           <div className="space-y-4">
                               <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                   <input type="checkbox" className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" id="accept-terms" />
                                   <label htmlFor="accept-terms" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                                       Li e concordo com os termos do contrato. Reconheço que minha assinatura digital possui validade jurídica conforme MP 2.200-2/2001.
                                   </label>
                               </div>
                               <button 
                                   onClick={handleDigitalSignature}
                                   disabled={isSigning}
                                   className="w-full h-14 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-wait"
                               >
                                   {isSigning ? (
                                       <>Assinando...</>
                                   ) : (
                                       <><Fingerprint size={24} /> Assinar Digitalmente</>
                                   )}
                               </button>
                           </div>
                       ) : (
                           <button 
                               onClick={() => setSignModalOpen(false)}
                               className="w-full h-12 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold transition-all"
                           >
                               Fechar
                           </button>
                       )}
                   </div>
               </div>
           </div>
       )}

       {/* CREATE / UPLOAD MODAL */}
       {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-fadeIn">
             <div className="w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-3xl bg-background-light dark:bg-background-dark rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp ring-1 ring-white/10">
                <div className="flex-none flex items-center justify-between px-6 pb-4 pt-6 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-white/5">
                   <button onClick={handleResetForm} className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-white">Cancelar</button>
                   <h2 className="text-slate-900 dark:text-white text-lg font-bold">Novo Contrato</h2>
                   <div className="w-16"></div>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
                   
                   {/* STEP 1: SELECT METHOD */}
                   {signRequestStep === 1 && (
                       <div className="p-6 md:p-12 flex flex-col items-center gap-6">
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center">Como deseja criar este contrato?</h3>
                           
                           <div className="grid md:grid-cols-2 gap-4 w-full max-w-2xl">
                               <button 
                                   onClick={() => { setCreationMode('upload'); setSignRequestStep(2); }}
                                   className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white dark:bg-surface-dark border-2 border-transparent hover:border-primary shadow-sm hover:shadow-md transition-all group"
                               >
                                   <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                       <Upload className="w-8 h-8 text-slate-500 group-hover:text-primary" />
                                   </div>
                                   <div className="text-center">
                                       <h4 className="font-bold text-slate-900 dark:text-white text-lg">Upload de Arquivo</h4>
                                       <p className="text-sm text-slate-500 mt-1">Tenho um PDF ou DOCX pronto.</p>
                                   </div>
                               </button>

                               <button 
                                   onClick={() => { setCreationMode('template'); setSignRequestStep(2); }}
                                   className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white dark:bg-surface-dark border-2 border-transparent hover:border-primary shadow-sm hover:shadow-md transition-all group"
                               >
                                   <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                       <FileText className="w-8 h-8 text-slate-500 group-hover:text-primary" />
                                   </div>
                                   <div className="text-center">
                                       <h4 className="font-bold text-slate-900 dark:text-white text-lg">Gerar Modelo</h4>
                                       <p className="text-sm text-slate-500 mt-1">Usar modelo padrão Igloo.</p>
                                   </div>
                               </button>
                           </div>
                       </div>
                   )}

                   {/* STEP 2: UPLOAD OR TEMPLATE FILL */}
                   {signRequestStep === 2 && (
                       <div className="flex flex-col md:flex-row h-full">
                           <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                               {creationMode === 'upload' ? (
                                   <div className="space-y-6">
                                       <div className="flex items-center gap-2 mb-2">
                                           <button onClick={() => setSignRequestStep(1)} className="text-sm text-slate-500 hover:underline">Voltar</button>
                                           <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upload do Contrato</h3>
                                       </div>
                                       <ContractUploader onUploadComplete={(file) => setUploadedFile(file)} />
                                   </div>
                               ) : (
                                   // Existing Template Form Logic
                                   <div className="space-y-6">
                                       <div className="flex items-center gap-2 mb-2">
                                           <button onClick={() => setSignRequestStep(1)} className="text-sm text-slate-500 hover:underline">Voltar</button>
                                           <h3 className="font-bold text-lg text-slate-900 dark:text-white">Preencher Dados</h3>
                                       </div>
                                       {/* ... (Existing inputs for rentValue, condoValue etc from previous implementation) ... */}
                                       <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase text-slate-500">Aluguel</label>
                                                <input type="number" value={rentValue} onChange={e => setRentValue(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10" placeholder="0,00" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-bold uppercase text-slate-500">Condomínio</label>
                                                <input type="number" value={condoValue} onChange={e => setCondoValue(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10" placeholder="0,00" />
                                            </div>
                                       </div>
                                   </div>
                               )}
                           </div>

                           <div className="flex-1 bg-slate-100 dark:bg-black/20 p-6 border-l border-gray-200 dark:border-white/5 flex flex-col">
                               {creationMode === 'template' ? (
                                   <div className="bg-white text-black p-8 shadow-lg h-full overflow-y-auto text-[10px] leading-relaxed font-serif whitespace-pre-wrap">
                                       {previewContent}
                                   </div>
                               ) : (
                                   <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                       <Eye size={48} className="mb-4 opacity-50" />
                                       <p>A pré-visualização do arquivo enviado aparecerá aqui.</p>
                                   </div>
                               )}
                               
                               <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                                   <button 
                                       onClick={() => setSignRequestStep(3)}
                                       disabled={creationMode === 'upload' && !uploadedFile}
                                       className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all disabled:opacity-50"
                                   >
                                       Continuar para Envio <Send size={18} />
                                   </button>
                               </div>
                           </div>
                       </div>
                   )}

                   {/* STEP 3: SELECT TENANT & SEND */}
                   {signRequestStep === 3 && (
                       <div className="p-6 md:p-12 max-w-2xl mx-auto space-y-8">
                           <div className="text-center">
                               <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Quem deve assinar?</h3>
                               <p className="text-slate-500 mt-2">Selecione o inquilino para enviar a solicitação de assinatura.</p>
                           </div>

                           <div className="space-y-4">
                               <div className="relative">
                                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                   <select 
                                       className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 appearance-none outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white font-medium"
                                       onChange={(e) => {
                                           const selected = e.target.value;
                                           setSelectedTenant(selected);
                                           setSelectedTenantContact(selected === 'João Silva' ? '(11) 99999-9999' : '(21) 98888-8888');
                                           if (selected) handleProceedToTenant();
                                       }}
                                   >
                                       <option value="">Selecione um Inquilino...</option>
                                       <option value="João Silva">João Silva (Apt 101)</option>
                                       <option value="Maria Oliveira">Maria Oliveira (Kitnet 05)</option>
                                   </select>
                                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                               </div>

                               {generatedMessage && (
                                   <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 animate-fadeIn">
                                       <div className="flex justify-between items-center mb-3">
                                           <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                               <Send size={14} /> Mensagem Pronta
                                           </span>
                                           <button className="text-xs font-bold text-emerald-600 hover:underline" onClick={() => navigator.clipboard.writeText(generatedMessage)}>Copiar</button>
                                       </div>
                                       <div className="bg-white dark:bg-black/20 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-mono border border-emerald-100 dark:border-white/5">
                                           {generatedMessage}
                                       </div>
                                       <div className="flex gap-3 mt-4">
                                           <button className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20">
                                               Enviar via WhatsApp
                                           </button>
                                           <button className="flex-1 h-10 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-slate-800 dark:text-white rounded-lg font-bold text-sm transition-colors">
                                               Enviar via E-mail
                                           </button>
                                       </div>
                                   </div>
                               )}
                           </div>
                       </div>
                   )}
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default Contracts;