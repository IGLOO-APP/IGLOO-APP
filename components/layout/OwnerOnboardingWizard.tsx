import React, { useState, useEffect } from 'react';
import {
  Plus,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Check,
  CreditCard,
  Target,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import { ModalWrapper } from '../ui/ModalWrapper';
import { useNavigate } from 'react-router-dom';
import { Joyride, STATUS } from 'react-joyride';
type JoyrideEventData = { action: string; index: number; status: string; type: string };
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { formatCPF, formatCNPJ } from '../../utils/formatters';

interface OwnerOnboardingWizardProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'property' | 'financial' | 'vetting' | 'done';

type PixKeyType = 'CPF' | 'CNPJ' | 'Email' | 'Phone' | 'Random';

// Steps — options like disableBeacon and spotlightClicks are per-step via Partial<Options>
const joyrideSteps = [
  {
    target: '.step-property-action',
    content:
      'Comece cadastrando sua primeira unidade. É aqui que a gestão do seu patrimônio começa!',
    spotlightClicks: true,
    disableBeacon: true,
    placement: 'bottom' as const,
  },
  {
    target: '.step-pix-input',
    content:
      'Configure seu PIX. Geramos o QR Code automaticamente para seus inquilinos pagarem direto na sua conta.',
    disableBeacon: true,
    placement: 'bottom' as const,
  },
];

export const OwnerOnboardingWizard: React.FC<OwnerOnboardingWizardProps> = ({
  onComplete,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  // PIX key states
  const [pixType, setPixType] = useState<PixKeyType>('CPF');
  const [pixKey, setPixKey] = useState('');

  // Vetting rules — real React state (not decorative switches)
  const [rules, setRules] = useState({
    income: true,
    documents: true,
    vehicle: false,
  });

  // Joyride control states
  const [joyrideStepIndex, setJoyrideStepIndex] = useState(0);
  const [runJoyride, setRunJoyride] = useState(false);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);

  // Activate correct Joyride step when wizard step changes
  useEffect(() => {
    if (currentStep === 'property') {
      setJoyrideStepIndex(0);
      setRunJoyride(true);
    } else if (currentStep === 'financial') {
      setJoyrideStepIndex(1);
      setRunJoyride(true);
    } else {
      setRunJoyride(false);
    }
  }, [currentStep]);

  const handleNext = (next: OnboardingStep) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(next);
      setIsAnimating(false);
    }, 300);
  };

  const handleJoyrideCallback = (data: JoyrideEventData) => {
    const { action, index, status, type } = data;

    if (type === 'step:after') {
      if (index === 0 && action === 'next') {
        handleNext('financial');
      } else if (index === 1 && action === 'next') {
        handleNext('vetting');
      }
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunJoyride(false);
    }
  };

  // Persist completion to Supabase — no sessionStorage
  const handleCompleteConfig = async () => {
    if (user?.id) {
      setIsSavingOnboarding(true);
      try {
        await profileService.update(user.id, {
          has_completed_onboarding: true,
        });
      } catch (err) {
        console.error('Error saving onboarding state:', err);
      } finally {
        setIsSavingOnboarding(false);
      }
    }
    handleNext('done');
  };

  // PIX input formatter — applies mask based on selected key type
  const handlePixKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (pixType === 'CPF') {
      val = formatCPF(val);
    } else if (pixType === 'CNPJ') {
      val = formatCNPJ(val);
    }
    setPixKey(val);
  };

  // Toggle a vetting rule
  const toggleRule = (key: keyof typeof rules) => {
    setRules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ModalWrapper
      onClose={() => {}} // Forced flow — user must complete the wizard
      className="md:max-w-2xl p-0 overflow-hidden"
      showCloseButton={false}
    >
      {/* React-Joyride — renders above the modal via z-index: 10000 */}
      <Joyride
        steps={joyrideSteps}
        run={runJoyride}
        stepIndex={joyrideStepIndex}
        onEvent={handleJoyrideCallback}
        continuous={true}
        options={{
          zIndex: 10000,
          primaryColor: '#0f172a',
          showProgress: true,
        }}
        styles={{
          tooltip: {
            borderRadius: '1.25rem',
            padding: '1.25rem',
            fontFamily: 'inherit',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonPrimary: {
            backgroundColor: '#0f172a',
            borderRadius: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '11px',
            padding: '10px 18px',
          },
        }}
      />

      <div
        className={`min-h-[500px] flex flex-col bg-background-light dark:bg-background-dark transition-all duration-300 ${
          isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
        }`}
      >
        {/* ─── STEP 1: WELCOME ─── */}
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
                O IGLOO foi desenhado para proprietários que buscam
                profissionalismo e agilidade.
                <br />
                <br />
                Vamos configurar seu ambiente em 4 passos simples.
              </p>
            </div>
            <button
              onClick={() => handleNext('property')}
              className="group h-14 px-10 bg-primary text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              Vamos lá{' '}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        )}

        {/* ─── STEP 2: PROPERTY ─── */}
        {currentStep === 'property' && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="p-8 pb-0">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                Passo 01: Seus Ativos
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">
                Cadastre seu primeiro imóvel
              </h2>
              <p className="text-sm text-slate-500 font-medium mb-6">
                Sem imóveis, não há gestão. Você pode começar com um cadastro
                básico e detalhar depois.
              </p>
            </div>

            <div className="flex-1 px-8 flex items-center justify-center">
              {/* Joyride target: .step-property-action */}
              <div
                className="step-property-action w-full p-8 bg-white dark:bg-surface-dark border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center text-center space-y-4 group hover:border-primary transition-all cursor-pointer"
                onClick={() =>
                  navigate('/properties', { state: { openAdd: true } })
                }
                role="button"
                aria-label="Cadastrar novo imóvel"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-primary transition-all">
                  <Plus size={32} strokeWidth={3} />
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Novo Imóvel
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    Apartamento, Casa ou Comercial
                  </p>
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

        {/* ─── STEP 3: FINANCIAL (PIX) ─── */}
        {currentStep === 'financial' && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="p-8 pb-0">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                Passo 02: Recebimentos
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">
                Onde você recebe?
              </h2>
              <p className="text-sm text-slate-500 font-medium mb-6">
                Configure sua chave PIX para que os inquilinos paguem direto na
                sua conta.
              </p>
            </div>

            <div className="flex-1 px-8 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* PIX Key Type selector */}
                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">
                      Tipo de Chave
                    </label>
                    <select
                      value={pixType}
                      onChange={(e) => {
                        setPixType(e.target.value as PixKeyType);
                        setPixKey(''); // reset value on type change
                      }}
                      className="w-full h-14 px-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white text-sm"
                    >
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="Email">E-mail</option>
                      <option value="Phone">Telefone</option>
                      <option value="Random">Aleatória</option>
                    </select>
                  </div>

                  {/* PIX Key input — Joyride target: .step-pix-input */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">
                      Chave PIX Principal
                    </label>
                    <div className="relative">
                      <Wallet
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        id="pix-key-input"
                        type={pixType === 'Email' ? 'email' : 'text'}
                        value={pixKey}
                        onChange={handlePixKeyChange}
                        placeholder={
                          pixType === 'CPF'
                            ? '000.000.000-00'
                            : pixType === 'CNPJ'
                            ? '00.000.000/0000-00'
                            : pixType === 'Email'
                            ? 'seu@email.com'
                            : pixType === 'Phone'
                            ? '(00) 00000-0000'
                            : 'Chave Aleatória'
                        }
                        className="step-pix-input w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex gap-3">
                <ShieldCheck
                  size={20}
                  className="text-emerald-500 shrink-0 mt-0.5"
                />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Seus dados bancários são usados apenas para gerar os
                  informativos de pagamento para o inquilino. O IGLOO não
                  movimenta seu dinheiro.
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

        {/* ─── STEP 4: VETTING (Regras de Locação) ─── */}
        {currentStep === 'vetting' && (
          <div className="flex-1 flex flex-col animate-fadeIn">
            <div className="p-8 pb-0">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                Passo 03: Regras de Locação
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">
                Exigências do Perfil
              </h2>
              <p className="text-sm text-slate-500 font-medium mb-6">
                Defina o que é obrigatório para seus inquilinos fornecerem no
                primeiro acesso.
              </p>
            </div>

            <div className="flex-1 px-8 space-y-4">
              {(
                [
                  {
                    icon: CreditCard,
                    label: 'Comprovação de Renda',
                    desc: 'Holerites ou extratos bancários',
                    key: 'income' as const,
                  },
                  {
                    icon: ShieldCheck,
                    label: 'Documentos Oficiais',
                    desc: 'RG/CNH e CPF',
                    key: 'documents' as const,
                  },
                  {
                    icon: Target,
                    label: 'Dados de Veículo',
                    desc: 'Placa e modelo para o condomínio',
                    key: 'vehicle' as const,
                  },
                ] satisfies Array<{
                  icon: React.ElementType;
                  label: string;
                  desc: string;
                  key: keyof typeof rules;
                }>
              ).map((item) => (
                <div
                  key={item.key}
                  className="p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {item.desc}
                    </p>
                  </div>
                  <div className="ml-auto">
                    {/* Real toggle — drives useState, not decorative */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={rules[item.key]}
                      aria-label={`Toggle ${item.label}`}
                      onClick={() => toggleRule(item.key)}
                      className={`w-10 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        rules[item.key]
                          ? 'bg-primary'
                          : 'bg-slate-200 dark:bg-white/10'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
                          rules[item.key] ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 flex gap-4">
              <button
                onClick={handleCompleteConfig}
                disabled={isSavingOnboarding}
                className="flex-1 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingOnboarding ? 'Salvando...' : 'Concluir Configuração'}
                <Check size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 5: DONE ─── */}
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
                Você acaba de profissionalizar sua gestão. Seu dashboard está
                pronto para monitorar seus ativos e rendimentos.
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
