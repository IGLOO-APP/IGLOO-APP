import React from 'react';
import { User, CheckCircle, Loader, XCircle, Briefcase, ShieldCheck } from 'lucide-react';
import { Tenant } from '../../../types';
import { UseOnboardingProfileReturn } from '../../../hooks/useOnboardingProfile';
import type { OnboardingStepConfig } from '../../onboarding/types';

interface ProfileSectionProps {
  tenant: Tenant;
  profile: UseOnboardingProfileReturn;
  guaranteeType: string;
  setGuaranteeType: (t: string) => void;
  guarantorName: string;
  setGuarantorName: (v: string) => void;
  guarantorCpf: string;
  handleGuarantorCpfChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  guarantorRg: string;
  setGuarantorRg: (v: string) => void;
  guarantorPhone: string;
  setGuarantorPhone: (v: string) => void;
  guarantorEmail: string;
  setGuarantorEmail: (v: string) => void;
  step: OnboardingStepConfig;
  loading: boolean;
  onSave: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  tenant,
  profile,
  guaranteeType,
  setGuaranteeType,
  guarantorName,
  setGuarantorName,
  guarantorCpf,
  handleGuarantorCpfChange,
  guarantorRg,
  setGuarantorRg,
  guarantorPhone,
  setGuarantorPhone,
  guarantorEmail,
  setGuarantorEmail,
  step,
  loading,
  onSave,
}) => {
  const {
    name,
    cpf,
    phone,
    rg,
    companyName,
    companyCnpj,
    companyAddress,
    occupation,
    monthlyIncome,
    admissionDate,
    setName,
    setPhone,
    setRg,
    setCompanyName,
    setCompanyCnpj,
    setCompanyAddress,
    setOccupation,
    setMonthlyIncome,
    setAdmissionDate,
  } = profile;

  return (
    <div className='space-y-4'>
      {step.status === 'submitted' ? (
        <div className='space-y-4'>
          <div className='p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl text-blue-800 dark:text-blue-300 text-xs font-medium leading-relaxed'>
            <p className='font-bold mb-1 flex items-center gap-1.5'>
              <Loader className='animate-spin text-blue-500 shrink-0' size={14} /> Dados cadastrais
              enviados com sucesso!
            </p>
            Aguardando a validação jurídica do proprietário para prosseguir para a próxima etapa.
          </div>
          <div className='bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl p-4 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300'>
            <p>
              <span className='text-slate-400 font-medium'>Nome:</span> {name}
            </p>
            <p>
              <span className='text-slate-400 font-medium'>CPF:</span> {cpf}
            </p>
            <p>
              <span className='text-slate-400 font-medium'>Celular:</span>{' '}
              {phone || 'Não informado'}
            </p>
          </div>
        </div>
      ) : step.completed ? (
        <div className='p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2'>
          <CheckCircle size={18} /> Seus dados cadastrais foram validados e aprovados!
        </div>
      ) : (
        <div className='space-y-4'>
          <p className='text-xs text-slate-500 font-medium leading-relaxed'>{step.desc}</p>
          {step.status === 'rejected' && (
            <div className='p-4 bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-350 text-xs flex gap-2'>
              <XCircle size={18} className='shrink-0 mt-0.5' />
              <div>
                <p className='font-bold'>Dados Recusados</p>
                <p className='mt-0.5 font-medium'>
                  {tenant.onboarding_profile_rejected_reason ||
                    'Por favor, corrija os dados cadastrais.'}
                </p>
              </div>
            </div>
          )}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Nome Completo
              </label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                CPF
              </label>
              <input
                type='text'
                value={cpf}
                onChange={profile.handleCpfChange}
                placeholder='000.000.000-00'
                className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                RG
              </label>
              <input
                type='text'
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder='Nº do RG'
                className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              />
            </div>
            <div className='space-y-2 md:col-span-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Celular / Telefone
              </label>
              <input
                type='tel'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder='(00) 90000-0000'
                className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              />
            </div>
          </div>

          <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
            <h4 className='text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2'>
              <Briefcase size={14} /> Vínculo Empregatício
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Nome da Empresa
                </label>
                <input
                  type='text'
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  CNPJ <span className='text-slate-300'>(opcional)</span>
                </label>
                <input
                  type='text'
                  value={companyCnpj}
                  onChange={(e) => setCompanyCnpj(e.target.value)}
                  placeholder='00.000.000/0000-00'
                  className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                />
              </div>
              <div className='space-y-2 md:col-span-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Endereço da Empresa
                </label>
                <input
                  type='text'
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Cargo
                </label>
                <input
                  type='text'
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Salário
                </label>
                <input
                  type='text'
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder='R$ 0,00'
                  className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                />
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                  Data de Admissão
                </label>
                <input
                  type='date'
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                />
              </div>
            </div>
          </div>

          <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
            <h4 className='text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2'>
              <ShieldCheck size={14} /> Garantia da Locação
            </h4>
            <div className='space-y-2'>
              <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                Tipo de Garantia
              </label>
              <select
                value={guaranteeType}
                onChange={(e) => setGuaranteeType(e.target.value)}
                className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              >
                <option value=''>Selecione...</option>
                <option value='fiador'>Fiador</option>
                <option value='seguro_fianca'>Seguro Fiança</option>
                <option value='deposito_caucao'>Depósito / Caução</option>
                <option value='outros'>Outros</option>
              </select>
            </div>

            {guaranteeType === 'fiador' && (
              <div className='mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 space-y-4'>
                <p className='text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5'>
                  <User size={14} /> Dados do Fiador
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                      Nome Completo
                    </label>
                    <input
                      type='text'
                      value={guarantorName}
                      onChange={(e) => setGuarantorName(e.target.value)}
                      className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                      CPF
                    </label>
                    <input
                      type='text'
                      value={guarantorCpf}
                      onChange={handleGuarantorCpfChange}
                      placeholder='000.000.000-00'
                      className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                      RG
                    </label>
                    <input
                      type='text'
                      value={guarantorRg}
                      onChange={(e) => setGuarantorRg(e.target.value)}
                      className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                      Telefone
                    </label>
                    <input
                      type='text'
                      value={guarantorPhone}
                      onChange={(e) => setGuarantorPhone(e.target.value)}
                      placeholder='(00) 90000-0000'
                      className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    />
                  </div>
                  <div className='space-y-2 md:col-span-2'>
                    <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                      E-mail
                    </label>
                    <input
                      type='email'
                      value={guarantorEmail}
                      onChange={(e) => setGuarantorEmail(e.target.value)}
                      className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onSave}
            disabled={loading}
            className='w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50'
          >
            {loading ? <Loader className='animate-spin' size={16} /> : <CheckCircle size={16} />}
            {loading ? 'Salvando...' : 'Salvar e Enviar para Validação'}
          </button>
        </div>
      )}
    </div>
  );
};
