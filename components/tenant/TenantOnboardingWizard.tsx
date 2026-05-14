import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  ChevronRight, 
  FileText, 
  User, 
  ShieldCheck, 
  ClipboardCheck, 
  Upload, 
  Camera, 
  Info, 
  Sparkles,
  ArrowRight,
  PenTool,
  Check,
  AlertCircle
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { Tenant, Property, Contract } from '../../types';
import { tenantConfigService } from '../../services/tenantConfigService';
import { PropertyInspection } from '../properties/PropertyInspection';
import { ContractDetails } from '../contracts/ContractDetails';

interface TenantOnboardingWizardProps {
  tenant: Tenant;
  property: Property | null;
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'contract' | 'profile' | 'documents' | 'inspection' | 'done';

export const TenantOnboardingWizard: React.FC<TenantOnboardingWizardProps> = ({
  tenant,
  property,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Logic to determine initial step based on data
  useEffect(() => {
    // If contract is pending signature, that's first
    if (tenant.contract?.status === 'pending_signature') {
      // Keep welcome for a moment then move
    }
  }, [tenant]);

  const handleNext = (next: OnboardingStep) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(next);
      setIsAnimating(false);
    }, 300);
  };

  const config = tenantConfigService.getConfigForProperty(tenant.property_id || '101');

  // Helper to check if profile is "mostly" complete
  const isProfileComplete = !!(tenant.name && tenant.cpf);

  return (
    <ModalWrapper 
      onClose={() => {}} // Forced flow, no close button by default
      className="md:max-w-2xl p-0 overflow-hidden"
      showCloseButton={false}
    >
      <div className={`min-h-[500px] flex flex-col bg-background-light dark:bg-background-dark transition-all duration-300 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
        
        {/* --- STEP 1: WELCOME --- */}
        {currentStep === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fadeIn">
            <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 transform rotate-3">
              <Sparkles size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                Boas-vindas ao seu novo lar!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                Olá, <span className="text-primary font-bold">{tenant.name.split(' ')[0]}</span>. O proprietário do imóvel <span className="font-bold text-slate-700 dark:text-slate-200">{property?.name || 'seu imóvel'}</span> convidou você para o IGLOO. 
                <br /><br />
                Vamos configurar tudo em 2 minutos?
              </p>
            </div>
            <button 
              onClick={() => handleNext(tenant.contract?.status === 'pending_signature' ? 'contract' : 'profile')}
              className="group h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
            >
              Começar Agora <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* --- STEP 2: CONTRACT --- */}
        {currentStep === 'contract' && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="p-8 pb-0">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">Passo 01: Segurança Jurídica</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">Assinatura Digital</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Revise e assine o contrato de locação para oficializar sua estadia.</p>
            </div>
            
            <div className="flex-1 px-8 overflow-y-auto">
              <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contrato Digital</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Locação {property?.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 dark:border-white/5">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Valor Mensal</p>
                      <p className="font-black text-slate-900 dark:text-white">R$ {tenant.contract?.monthly_value.toLocaleString('pt-BR')}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vencimento</p>
                      <p className="font-black text-slate-900 dark:text-white">Todo dia {tenant.contract?.payment_day}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-black/10 flex gap-4">
              <button 
                onClick={() => handleNext('profile')}
                className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                <PenTool size={20} /> Assinar e Continuar
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: PROFILE --- */}
        {currentStep === 'profile' && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="p-8 pb-0">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">Passo 02: Seu Cadastro</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">Complete seus dados</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">O proprietário solicitou os seguintes dados para conformidade.</p>
            </div>

            <div className="flex-1 px-8 space-y-5 overflow-y-auto">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF / Identidade</label>
                  <input type="text" defaultValue={tenant.cpf} placeholder="000.000.000-00" className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
               </div>
               {config.sections.personal.occupation === 'required' && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profissão / Ocupação</label>
                    <input type="text" placeholder="Ex: Desenvolvedor" className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                 </div>
               )}
               {config.sections.residential.vehicle === 'required' && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Placa do Veículo</label>
                    <input type="text" placeholder="ABC-1234" className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                 </div>
               )}
            </div>

            <div className="p-8 flex gap-4">
               <button 
                onClick={() => handleNext('documents')}
                className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Próximo Passo <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 4: DOCUMENTS --- */}
        {currentStep === 'documents' && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="p-8 pb-0">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest">Passo 03: Documentação</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">Envie os documentos</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Suba fotos ou PDFs dos documentos obrigatórios.</p>
            </div>

            <div className="flex-1 px-8 space-y-4 overflow-y-auto">
               {[
                 { id: 'id_card', label: 'RG ou CNH', status: config.sections.requiredDocs.id_card },
                 { id: 'income', label: 'Comprovante de Renda', status: config.sections.requiredDocs.income },
               ].filter(doc => doc.status !== 'hidden').map((doc) => (
                 <div key={doc.id} className="p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <Upload size={20} />
                       </div>
                       <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{doc.label}</span>
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-2 rounded-lg hover:bg-primary hover:text-white transition-all">Selecionar</button>
                 </div>
               ))}
            </div>

            <div className="p-8 flex gap-4">
               <button 
                onClick={() => handleNext('inspection')}
                className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Próximo Passo <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 5: INSPECTION --- */}
        {currentStep === 'inspection' && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="p-8 pb-0">
               <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest">Passo Final: Entrega do Imóvel</span>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">Revise a Vistoria</h2>
               <p className="text-sm text-slate-500 font-medium mb-6">Confira o estado do imóvel no laudo de entrada preparado pelo proprietário.</p>
            </div>

            <div className="flex-1 px-8 overflow-y-auto">
               <div className="p-6 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-3xl flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                     <ClipboardCheck size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Laudo de Entrada Disponível</h4>
                    <p className="text-xs text-slate-500 mt-1">Existem 12 itens para você revisar nos próximos dias.</p>
                  </div>
                  <button className="text-[10px] font-black text-white uppercase tracking-widest bg-orange-500 px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                     Abrir Vistoria Agora
                  </button>
               </div>
            </div>

            <div className="p-8 flex gap-4">
               <button 
                onClick={() => handleNext('done')}
                className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Concluir Tudo <CheckCircle size={20} />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 6: DONE --- */}
        {currentStep === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fadeIn">
            <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 animate-scaleUp">
              <Check size={48} strokeWidth={4} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                Tudo Pronto!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                Seu perfil está configurado e pronto para o uso. Você já pode acessar boletos, contratos e falar com o proprietário.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex gap-3 text-left max-w-xs">
               <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
               <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  Sua pontualidade nos pagamentos e o cuidado com o imóvel aumentam seu <strong>Score IGLOO</strong>.
               </p>
            </div>
            <button 
              onClick={onComplete}
              className="h-14 px-12 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
            >
              Entrar no Dashboard
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};
