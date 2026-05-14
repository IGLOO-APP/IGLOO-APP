import React, { useState } from 'react';
import { 
  Building2, 
  ChevronRight, 
  Plus, 
  Wallet, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Check,
  CreditCard,
  Target,
  Rocket
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { useNavigate } from 'react-router-dom';

interface OwnerOnboardingWizardProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'property' | 'financial' | 'vetting' | 'done';

export const OwnerOnboardingWizard: React.FC<OwnerOnboardingWizardProps> = ({
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  
  const handleNext = (next: OnboardingStep) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(next);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <ModalWrapper 
      onClose={() => {}} // Forced flow
      className="md:max-w-2xl p-0 overflow-hidden"
      showCloseButton={false}
    >
      <div className={`min-h-[500px] flex flex-col bg-background-light dark:bg-background-dark transition-all duration-300 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
        
        {/* --- STEP 1: WELCOME --- */}
        {currentStep === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fadeIn">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-2xl shadow-black/20 transform -rotate-3">
              <Rocket size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                Hora de escalar sua gestão imobiliária.
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                O IGLOO foi desenhado para proprietários que buscam profissionalismo e agilidade. 
                <br /><br />
                Vamos configurar seu ambiente em 4 passos simples.
              </p>
            </div>
            <button 
              onClick={() => handleNext('property')}
              className="group h-14 px-10 bg-primary text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              Vamos lá <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* --- STEP 2: PROPERTY --- */}
        {currentStep === 'property' && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="p-8 pb-0">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">Passo 01: Seus Ativos</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">Cadastre seu primeiro imóvel</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Sem imóveis, não há gestão. Você pode começar com um cadastro básico e detalhar depois.</p>
            </div>
            
            <div className="flex-1 px-8 flex items-center justify-center">
              <div className="w-full p-8 bg-white dark:bg-surface-dark border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center text-center space-y-4 group hover:border-primary transition-all cursor-pointer">
                 <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-primary transition-all">
                    <Plus size={32} strokeWidth={3} />
                 </div>
                 <div>
                   <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Novo Imóvel</p>
                   <p className="text-xs text-slate-400 font-medium">Apartamento, Casa ou Comercial</p>
                 </div>
              </div>
            </div>

            <div className="p-8 flex gap-4">
              <button 
                onClick={() => handleNext('financial')}
                className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Próximo Passo <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: FINANCIAL --- */}
        {currentStep === 'financial' && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="p-8 pb-0">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">Passo 02: Recebimentos</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">Onde você recebe?</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Configure sua chave PIX para que os inquilinos paguem direto na sua conta.</p>
            </div>

            <div className="flex-1 px-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chave PIX Principal</label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="CPF, E-mail ou Chave Aleatória" className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
               </div>
               <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex gap-3">
                  <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    Seus dados bancários são usados apenas para gerar os informativos de pagamento para o inquilino. O IGLOO não movimenta seu dinheiro.
                  </p>
               </div>
            </div>

            <div className="p-8 flex gap-4">
               <button 
                onClick={() => handleNext('vetting')}
                className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Próximo Passo <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 4: VETTING --- */}
        {currentStep === 'vetting' && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="p-8 pb-0">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">Passo 03: Regras de Locação</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">Exigências do Perfil</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Defina o que é obrigatório para seus inquilinos fornecerem no primeiro acesso.</p>
            </div>

            <div className="flex-1 px-8 space-y-4">
               {[
                 { icon: CreditCard, label: 'Comprovação de Renda', desc: 'Holerites ou extratos bancários' },
                 { icon: ShieldCheck, label: 'Documentos Oficiais', desc: 'RG/CNH e CPF' },
                 { icon: Target, label: 'Dados de Veículo', desc: 'Placa e modelo para o condomínio' },
               ].map((item, idx) => (
                 <div key={idx} className="p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary">
                       <item.icon size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.label}</p>
                       <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                    </div>
                    <div className="ml-auto">
                       <div className="w-10 h-6 bg-primary rounded-full relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-8 flex gap-4">
               <button 
                onClick={() => handleNext('done')}
                className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Concluir Configuração <CheckCircle size={20} />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 5: DONE --- */}
        {currentStep === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fadeIn">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 animate-scaleUp">
              <Check size={48} strokeWidth={4} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                Está Tudo Pronto!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                Você acaba de profissionalizar sua gestão. Seu dashboard está pronto para monitorar seus ativos e rendimentos.
              </p>
            </div>
            <button 
              onClick={onComplete}
              className="h-14 px-12 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              Começar a Gerir
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

const CheckCircle = ({ size }: { size: number }) => (
  <Check size={size} strokeWidth={3} />
);
