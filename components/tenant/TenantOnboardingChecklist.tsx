import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  ChevronRight, 
  ChevronDown,
  FileText, 
  User, 
  Upload, 
  ClipboardCheck, 
  Sparkles,
  PenTool,
  AlertCircle,
  FileCheck,
  Building2,
  Calendar,
  Hash,
  Banknote,
  Scale,
  ScrollText,
  ShieldCheck,
  Loader,
  Lock,
  Key,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Tenant } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

interface TenantOnboardingChecklistProps {
  tenant: Tenant;
  pendingInspection: any;
  onStepComplete: () => void;
  onOpenInspection: () => void;
}

export const TenantOnboardingChecklist: React.FC<TenantOnboardingChecklistProps> = ({
  tenant,
  pendingInspection,
  onStepComplete,
  onOpenInspection
}) => {
  const { user } = useAuth();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Profile state — pre-populate from Clerk user if available
  const [name, setName] = useState(tenant.name || user?.name || '');
  const [cpf, setCpf] = useState(tenant.cpf || '');
  const [phone, setPhone] = useState(tenant.phone || '');

  // Step 2: Documents state
  const [rgFile, setRgFile] = useState<File | null>(null);
  const [incomeFile, setIncomeFile] = useState<File | null>(null);

  // Step 3: Contract state
  const [typedSignature, setTypedSignature] = useState('');
  const [fullContract, setFullContract] = useState<any | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  // Sync profile fields if tenant updates (keep Clerk name as fallback)
  useEffect(() => {
    if (tenant) {
      setName(tenant.name || user?.name || '');
      setCpf(tenant.cpf || '');
      setPhone(tenant.phone || '');
    }
  }, [tenant?.email]);

  // Fetch full contract details when contract step is opened
  useEffect(() => {
    if (expandedStep === 'contract' && tenant.contract?.id && !fullContract) {
      setLoadingContract(true);
      supabase
        .from('contracts')
        .select(`
          *,
          property:properties(id, name, address, image_url, bedrooms, bathrooms, area),
          tenant_profile:profiles!contracts_tenant_id_fkey(id, name, email, cpf, phone),
          owner_profile:profiles!contracts_owner_id_fkey(id, name, email)
        `)
        .eq('id', tenant.contract.id.toString())
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data) setFullContract(data);
          else if (error) {
            supabase
              .from('contracts')
              .select(`*, property:properties(id, name, address, image_url)`)
              .eq('id', tenant.contract!.id.toString())
              .maybeSingle()
              .then(({ data: d2 }) => { if (d2) setFullContract(d2); });
          }
          setLoadingContract(false);
        });
    }
  }, [expandedStep, tenant.contract?.id]);

  // Auto-sync inspection completion if the inspection is finished
  useEffect(() => {
    const syncInspectionState = async () => {
      // If there is no pending inspection, but the inspection step status is pending, and contract is signed
      const contractSigned = tenant.onboarding_contract_status === 'approved' || tenant.contract?.status === 'active';
      if (!pendingInspection && tenant.onboarding_inspection_status === 'pending' && contractSigned) {
        try {
          await supabase
            .from('profiles')
            .update({
              onboarding_inspection_status: 'approved',
              onboarding_stage: 'keys'
            })
            .eq('email', tenant.email);
          onStepComplete();
        } catch (err) {
          console.error('Error syncing inspection state:', err);
        }
      }
    };
    syncInspectionState();
  }, [pendingInspection, tenant.onboarding_inspection_status, tenant.onboarding_contract_status, tenant.contract?.status]);

  // Steps configuration
  const steps = [
    {
      id: 'profile',
      title: 'Dados Cadastrais',
      desc: 'Preencha seus dados de identificação e contato.',
      completed: tenant.onboarding_profile_status === 'approved',
      status: tenant.onboarding_profile_status || 'pending',
      unlocked: true,
      icon: User,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 'documents',
      title: 'Envio de Documentos',
      desc: 'Suba fotos ou PDFs do seu documento de identidade e comprovante de renda.',
      completed: tenant.onboarding_documents_status === 'approved',
      status: tenant.onboarding_documents_status || 'pending',
      unlocked: tenant.onboarding_profile_status === 'approved',
      icon: Upload,
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      id: 'contract',
      title: 'Contrato de Locação',
      desc: 'Revise e assine o contrato de locação do seu novo lar.',
      completed: tenant.onboarding_contract_status === 'approved' || tenant.contract?.status === 'active',
      status: tenant.onboarding_contract_status || (tenant.contract?.status === 'active' ? 'approved' : 'pending'),
      unlocked: tenant.onboarding_documents_status === 'approved',
      icon: PenTool,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      id: 'inspection',
      title: 'Laudo de Vistoria de Entrada',
      desc: 'Revise o laudo de vistoria e informe qualquer divergência.',
      completed: tenant.onboarding_inspection_status === 'approved' || !pendingInspection,
      status: tenant.onboarding_inspection_status || (!pendingInspection ? 'approved' : 'pending'),
      unlocked: tenant.onboarding_contract_status === 'approved' || tenant.contract?.status === 'active',
      icon: ClipboardCheck,
      color: 'text-orange-500 bg-orange-500/10'
    },
    {
      id: 'keys',
      title: 'Entrega das Chaves',
      desc: 'Liberação final e entrega das chaves do seu imóvel.',
      completed: tenant.onboarding_stage === 'completed',
      status: tenant.onboarding_stage === 'completed' ? 'approved' : 'pending',
      unlocked: tenant.onboarding_inspection_status === 'approved' || !pendingInspection,
      icon: Key,
      color: 'text-emerald-500 bg-emerald-500/10'
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // Auto-expand the first incomplete and unlocked step on status changes
  useEffect(() => {
    if (!expandedStep) {
      const activeStep = steps.find(s => !s.completed && s.unlocked);
      if (activeStep) {
        setExpandedStep(activeStep.id);
      }
    }
  }, [
    tenant.onboarding_profile_status,
    tenant.onboarding_documents_status,
    tenant.onboarding_contract_status,
    tenant.onboarding_inspection_status,
    tenant.onboarding_stage
  ]);

  const toggleExpand = (stepId: string, unlocked: boolean) => {
    if (!unlocked) {
      setErrorMsg('Esta etapa está bloqueada. Por favor, conclua a aprovação das etapas anteriores.');
      return;
    }
    setErrorMsg(null);
    if (expandedStep === stepId) {
      setExpandedStep(null);
    } else {
      setExpandedStep(stepId);
    }
  };

  // Save/Submit Profile Action
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setErrorMsg('Por favor, preencha seu nome.');
      return;
    }
    if (!cpf.trim() || cpf.replace(/\D/g, '').length < 11) {
      setErrorMsg('Por favor, insira um CPF válido.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name, 
          cpf: cpf.replace(/\D/g, ''), 
          phone,
          onboarding_profile_status: 'submitted',
          onboarding_stage: 'profile' // Remains in profile stage until owner approves
        })
        .eq('email', tenant.email);

      if (error) throw error;

      setExpandedStep(null);
      onStepComplete();
    } catch (err: any) {
      console.error('Error updating profile onboarding:', err);
      setErrorMsg('Erro ao salvar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Documents Action
  const handleUploadDocs = async () => {
    if (!rgFile || !incomeFile) {
      setErrorMsg('Por favor, selecione ambos os arquivos de documentos.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      // Upload both files to Supabase Storage bucket "tenant-documents"
      const timestamp = Date.now();
      const rgPath   = `${tenant.id}/${timestamp}_rg_${rgFile.name}`;
      const incPath  = `${tenant.id}/${timestamp}_income_${incomeFile.name}`;

      const [rgUrl, incomeUrl] = await Promise.all([
        storageService.uploadFile('tenant-documents', rgPath, rgFile),
        storageService.uploadFile('tenant-documents', incPath, incomeFile),
      ]);

      if (!rgUrl || !incomeUrl) {
        throw new Error('Falha no upload para o storage. Verifique as permissões do bucket.');
      }

      const docUrls = {
        rg_name:    rgFile.name,
        rg_url:     rgUrl,
        income_name: incomeFile.name,
        income_url:  incomeUrl,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_documents_status: 'submitted',
          onboarding_documents_urls: docUrls
        })
        .eq('email', tenant.email);

      if (error) throw error;

      // Also create records in property_documents if property_id is linked
      if (tenant.property_id) {
        await supabase.from('property_documents').insert([
          {
            property_id: tenant.property_id,
            name: `RG/CNH - ${tenant.name}`,
            category: 'Jurídico',
            type: rgFile.type.includes('pdf') ? 'PDF' : 'Imagem',
            size: `${(rgFile.size / 1024 / 1024).toFixed(2)} MB`,
            status: 'Pendente',
            url: rgUrl
          },
          {
            property_id: tenant.property_id,
            name: `Comp. Renda - ${tenant.name}`,
            category: 'Financeiro',
            type: incomeFile.type.includes('pdf') ? 'PDF' : 'Imagem',
            size: `${(incomeFile.size / 1024 / 1024).toFixed(2)} MB`,
            status: 'Pendente',
            url: incomeUrl
          }
        ]);
      }

      setExpandedStep(null);
      onStepComplete();
    } catch (err: any) {
      console.error('Error submitting documents:', err);
      setErrorMsg(err?.message || 'Erro ao enviar documentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Sign Contract Action
  const handleSignContract = async () => {
    if (!typedSignature.trim()) {
      setErrorMsg('Por favor, digite seu nome completo para assinar.');
      return;
    }
    if (!tenant.contract?.id) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      // Sign the contract in DB
      const { error: contractErr } = await supabase
        .from('contracts')
        .update({ status: 'active' })
        .eq('id', tenant.contract.id.toString());

      if (contractErr) throw contractErr;

      // Update onboarding status
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ 
          onboarding_contract_status: 'approved',
          onboarding_stage: 'inspection'
        })
        .eq('email', tenant.email);

      if (profileErr) throw profileErr;

      setExpandedStep(null);
      onStepComplete();
    } catch (err: any) {
      console.error('Error signing contract:', err);
      setErrorMsg('Erro ao assinar o contrato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    setCpf(value);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 space-y-8 animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 bg-primary/10 rounded-3xl text-primary animate-bounce">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          Boas-vindas ao seu novo lar!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto text-sm">
          Falta pouco para liberar seu acesso completo. Por favor, conclua as etapas abaixo para finalizarmos seu onboarding.
        </p>
      </div>

      {/* PROGRESS TRACKER */}
      <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Progresso Geral
          </span>
          <span className="text-sm font-black text-primary">
            {progressPercent}% Concluído
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="mt-4 flex justify-between text-[11px] text-slate-400 font-medium">
          <span>{completedCount} de {steps.length} tarefas feitas</span>
          {progressPercent === 100 && (
            <span className="text-emerald-500 font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
              <CheckCircle size={12} /> Tudo pronto!
            </span>
          )}
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex gap-3 text-red-700 dark:text-red-300">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* LIST OF STEPS */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isExpanded = expandedStep === step.id;
          const isCompleted = step.completed;
          const isUnlocked = step.unlocked;

          return (
            <div 
              key={step.id} 
              className={`bg-white dark:bg-surface-dark border rounded-3xl shadow-sm overflow-hidden transition-all duration-300 ${
                !isUnlocked 
                  ? 'border-slate-100 dark:border-white/5 opacity-50' 
                  : isCompleted 
                  ? 'border-emerald-100 dark:border-emerald-900/10 opacity-90' 
                  : isExpanded 
                  ? 'border-primary ring-1 ring-primary/20 scale-[1.01]' 
                  : 'border-gray-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              {/* Header card button */}
              <button
                onClick={() => toggleExpand(step.id, isUnlocked)}
                disabled={!isUnlocked}
                className={`w-full p-5 flex items-center justify-between text-left focus:outline-none ${!isUnlocked ? 'cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${step.color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                        Passo 0{idx + 1}
                      </span>
                      {!isUnlocked ? (
                        <span className="bg-slate-100 dark:bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock size={8} /> Bloqueado
                        </span>
                      ) : isCompleted ? (
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                          Concluído
                        </span>
                      ) : step.status === 'submitted' ? (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse">
                          Em Análise
                        </span>
                      ) : step.status === 'rejected' ? (
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                          Pendente Correção
                        </span>
                      ) : (
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                          Pendente
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <div>
                  {!isUnlocked ? (
                    <Lock size={18} className="text-slate-350" />
                  ) : isExpanded ? (
                    <ChevronDown size={20} className="text-slate-450" />
                  ) : (
                    <ChevronRight size={20} className="text-slate-450" />
                  )}
                </div>
              </button>

              {/* Collapsible content body */}
              {isUnlocked && isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-black/5 animate-slideDown">
                  
                  {/* STEP 1 DETAIL: PROFILE */}
                  {step.id === 'profile' && (
                    <div className="space-y-4">
                      {step.status === 'submitted' ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl text-blue-800 dark:text-blue-300 text-xs font-medium leading-relaxed">
                            <p className="font-bold mb-1 flex items-center gap-1.5"><Loader className="animate-spin text-blue-500 shrink-0" size={14} /> Dados cadastrais enviados com sucesso!</p>
                            Aguardando a validação jurídica do proprietário para prosseguir para a próxima etapa.
                          </div>
                          <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl p-4 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <p><span className="text-slate-400 font-medium">Nome:</span> {name}</p>
                            <p><span className="text-slate-400 font-medium">CPF:</span> {cpf}</p>
                            <p><span className="text-slate-400 font-medium">Celular:</span> {phone || 'Não informado'}</p>
                          </div>
                        </div>
                      ) : isCompleted ? (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                          <CheckCircle size={18} /> Seus dados cadastrais foram validados e aprovados!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            {step.desc}
                          </p>
                          {step.status === 'rejected' && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-350 text-xs flex gap-2">
                              <XCircle size={18} className="shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">Dados Recusados</p>
                                <p className="mt-0.5 font-medium">{tenant.onboarding_profile_rejected_reason || 'Por favor, corrija os dados cadastrais.'}</p>
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Nome Completo
                              </label>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                CPF
                              </label>
                              <input
                                type="text"
                                value={cpf}
                                onChange={handleCpfChange}
                                placeholder="000.000.000-00"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Celular / Telefone
                              </label>
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(00) 90000-0000"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
                          >
                            {loading ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />} 
                            {loading ? 'Salvando...' : 'Salvar e Enviar para Validação'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2 DETAIL: DOCUMENTS */}
                  {step.id === 'documents' && (
                    <div className="space-y-4">
                      {step.status === 'submitted' ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl text-blue-800 dark:text-blue-300 text-xs font-medium leading-relaxed">
                            <p className="font-bold mb-1 flex items-center gap-1.5"><Loader className="animate-spin text-blue-500 shrink-0" size={14} /> Documentos em análise</p>
                            O proprietário está revisando seus comprovantes e documento de identidade.
                          </div>
                          <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl p-4 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                            <p><span className="text-slate-400 font-medium">Documento ID:</span> {tenant.onboarding_documents_urls?.rg_name || 'Enviado'}</p>
                            <p><span className="text-slate-400 font-medium">Comp. Renda:</span> {tenant.onboarding_documents_urls?.income_name || 'Enviado'}</p>
                          </div>
                        </div>
                      ) : isCompleted ? (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                          <CheckCircle size={18} /> Todos os documentos foram auditados e aprovados!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            {step.desc}
                          </p>
                          {step.status === 'rejected' && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-350 text-xs flex gap-2">
                              <XCircle size={18} className="shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">Documentação Recusada</p>
                                <p className="mt-0.5 font-medium">{tenant.onboarding_documents_rejected_reason || 'Por favor, envie comprovantes legíveis.'}</p>
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Document 1: RG/CNH */}
                            <div className="p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-dark flex flex-col items-center justify-center text-center space-y-2 relative group hover:border-primary/50 transition-colors">
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setRgFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                <Upload size={20} />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {rgFile ? rgFile.name : 'RG ou CNH'}
                              </span>
                              <span className="text-[10px] text-slate-400">PDF, JPG ou PNG</span>
                            </div>

                            {/* Document 2: Income Proof */}
                            <div className="p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-dark flex flex-col items-center justify-center text-center space-y-2 relative group hover:border-primary/50 transition-colors">
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setIncomeFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                <Upload size={20} />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {incomeFile ? incomeFile.name : 'Comprovante de Renda'}
                              </span>
                              <span className="text-[10px] text-slate-400">Holerite ou Declaração</span>
                            </div>
                          </div>

                          <button
                            onClick={handleUploadDocs}
                            disabled={loading || !rgFile || !incomeFile}
                            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
                          >
                            {loading ? <Loader className="animate-spin" size={16} /> : <FileCheck size={16} />} 
                            {loading ? 'Enviando arquivos...' : 'Enviar Documentos para Validação'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 3 DETAIL: CONTRACT */}
                  {step.id === 'contract' && (
                    <div className="space-y-5">
                      {isCompleted ? (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                          <CheckCircle size={18} /> Seu contrato foi assinado eletronicamente e está ativo.
                        </div>
                      ) : (
                        <>
                          {loadingContract ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader className="animate-spin text-primary" size={24} />
                            </div>
                          ) : (
                            <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
                              {/* Document Header */}
                              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-5">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <ScrollText size={20} />
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">IGLOO IMÓVEIS</p>
                                    <h3 className="text-sm font-black leading-tight">Contrato de Locação Residencial</h3>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  <span className="flex items-center gap-1.5 text-[10px] bg-white/10 px-2.5 py-1 rounded-full font-bold">
                                    <Hash size={10} /> Ref: {fullContract?.contract_number || tenant.contract?.id?.toString().slice(0,8).toUpperCase()}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                                    <ShieldCheck size={10} /> Documento Autenticado
                                  </span>
                                </div>
                              </div>

                              <div className="p-5 space-y-5 text-left">
                                {/* Parties */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">LOCADOR (Proprietário)</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{fullContract?.owner_profile?.name || 'Proprietário'}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{fullContract?.owner_profile?.email || '—'}</p>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">LOCATÁRIO (Inquilino)</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{fullContract?.tenant_profile?.name || tenant.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{fullContract?.tenant_profile?.email || tenant.email}</p>
                                  </div>
                                </div>

                                {/* Property */}
                                {(fullContract?.property || tenant.property) && (
                                  <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4">
                                    <Building2 size={20} className="text-primary shrink-0" />
                                    <div>
                                      <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">IMÓVEL OBJETO DO CONTRATO</p>
                                      <p className="text-sm font-black text-slate-900 dark:text-white">{fullContract?.property?.name || tenant.property}</p>
                                      <p className="text-xs text-slate-500">{fullContract?.property?.address || tenant.property_address}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Key Terms */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5">
                                    <Banknote size={16} className="text-emerald-500 mx-auto mb-1" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Valor</p>
                                    <p className="text-xs font-black text-slate-900 dark:text-white">R$ {(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR')}</p>
                                    <p className="text-[9px] text-slate-400">por mês</p>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5">
                                    <Calendar size={16} className="text-blue-500 mx-auto mb-1" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Vencimento</p>
                                    <p className="text-xs font-black text-slate-900 dark:text-white">Dia {tenant.contract?.payment_day || '--'}</p>
                                    <p className="text-[9px] text-slate-400">todo mês</p>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5">
                                    <Calendar size={16} className="text-violet-500 mx-auto mb-1" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Início</p>
                                    <p className="text-xs font-black text-slate-900 dark:text-white">{tenant.contract?.start_date ? new Date(tenant.contract.start_date).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' }) : '--'}</p>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5">
                                    <Calendar size={16} className="text-orange-500 mx-auto mb-1" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Término</p>
                                    <p className="text-xs font-black text-slate-900 dark:text-white">{tenant.contract?.end_date ? new Date(tenant.contract.end_date).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' }) : '--'}</p>
                                  </div>
                                </div>

                                {/* Clauses */}
                                <div className="border-t border-slate-100 dark:border-white/5 pt-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Scale size={14} className="text-slate-400" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cláusulas Principais</p>
                                  </div>
                                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                    <p><span className="font-black text-slate-800 dark:text-white">1. OBJETO:</span> O locador cede ao locatário, para fins residenciais, o imóvel descrito acima, pelo prazo e valor estipulados.</p>
                                    <p><span className="font-black text-slate-800 dark:text-white">2. PAGAMENTO:</span> O aluguel deverá ser pago até o dia {tenant.contract?.payment_day || '--'} de cada mês, diretamente pela plataforma IGLOO.</p>
                                    <p><span className="font-black text-slate-800 dark:text-white">3. CONSERVAÇÃO:</span> O locatário se compromete a manter o imóvel em boas condições, devolvendo-o no estado em que o recebeu.</p>
                                    <p><span className="font-black text-slate-800 dark:text-white">4. VISTORIA:</span> A vistoria de entrada deverá ser concluída e assinada pelas partes em até 5 dias úteis após a entrega das chaves.</p>
                                    <p><span className="font-black text-slate-800 dark:text-white">5. RESCISÃO:</span> Em caso de rescisão antecipada, aplicam-se as penalidades previstas na Lei do Inquilinato (Lei 8.245/91).</p>
                                  </div>
                                </div>

                                {/* PDF Link if available */}
                                {fullContract?.pdf_url && (
                                  <a
                                    href={fullContract.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 border border-primary/30 text-primary rounded-xl text-xs font-bold hover:bg-primary/5 transition-colors"
                                  >
                                    <FileText size={14} /> Visualizar PDF Completo
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* SIGNATURE AREA */}
                          <div className="bg-white dark:bg-surface-dark border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 text-left">
                            <div className="flex items-center gap-2">
                              <PenTool size={16} className="text-primary" />
                              <p className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-wider">Assinatura Eletrônica</p>
                            </div>
                            <p className="text-xs text-slate-500">Ao digitar seu nome completo abaixo, você confirma que leu e concorda com todos os termos do contrato acima.</p>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Digite seu nome completo para assinar
                              </label>
                              <input
                                type="text"
                                value={typedSignature}
                                onChange={(e) => setTypedSignature(e.target.value)}
                                placeholder={tenant.name}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-medium italic text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base"
                              />
                              {typedSignature && (
                                <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded-xl">
                                  <p className="text-sm text-primary font-serif italic">{typedSignature}</p>
                                  <span className="text-[9px] font-black text-slate-400 uppercase">{new Date().toLocaleDateString('pt-BR')}</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={handleSignContract}
                              disabled={loading || !typedSignature.trim()}
                              className="w-full h-12 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40"
                            >
                              {loading ? <Loader className="animate-spin" size={16} /> : <PenTool size={16} />} 
                              {loading ? 'Processando...' : 'Assinar Contrato de Locação'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* STEP 4 DETAIL: INSPECTION */}
                  {step.id === 'inspection' && (
                    <div className="space-y-4">
                      {isCompleted ? (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                          <CheckCircle size={18} /> Vistoria de entrada validada e concluída!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                              <ClipboardCheck size={24} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 dark:text-white text-center">
                                Laudo de Entrada Pendente
                              </h4>
                              <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                                Revise os cômodos e itens do imóvel informando qualquer avaria para validação do proprietário.
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={onOpenInspection}
                            className="w-full h-12 bg-orange-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-orange-650 active:scale-[0.99] transition-all"
                          >
                            <ClipboardCheck size={16} /> Abrir Vistoria de Entrada
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 5 DETAIL: KEYS HANDOVER */}
                  {step.id === 'keys' && (
                    <div className="space-y-4">
                      {isCompleted ? (
                        <div className="text-center p-6 space-y-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
                            <ShieldCheck size={36} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Onboarding Concluído!</h4>
                            <p className="text-xs text-slate-500 mt-1">Sua chave foi liberada pelo proprietário e seu acesso ao painel do inquilino está 100% liberado.</p>
                          </div>
                          <button
                            onClick={onStepComplete}
                            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98"
                          >
                            Entrar no Painel do Inquilino
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-6 space-y-4 bg-slate-50 dark:bg-white/5 border border-gray-150 dark:border-white/5 rounded-2xl">
                          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
                            <Key size={28} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Aguardando Liberação das Chaves</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                              Parabéns! Você concluiu todas as etapas obrigatórias. O proprietário foi notificado e fará a entrega física e liberação das chaves em breve.
                            </p>
                          </div>
                          <div className="text-[10px] font-black uppercase text-amber-600 bg-amber-500/5 py-1 px-3.5 rounded-full inline-block">
                            Notificação enviada ao proprietário
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
