import React from 'react';
import {
  User, CheckCircle, Loader, XCircle, Briefcase, ShieldCheck,
  MapPin, Users, Heart, Phone, BookOpen, Building2,
} from 'lucide-react';
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

const inputClass = 'w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';
const selectClass = inputClass;
const labelClass = 'text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1';

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  tenant,
  profile,
  guaranteeType,
  setGuaranteeType,
  guarantorName, setGuarantorName,
  guarantorCpf, handleGuarantorCpfChange,
  guarantorRg, setGuarantorRg,
  guarantorPhone, setGuarantorPhone,
  guarantorEmail, setGuarantorEmail,
  step, loading, onSave,
}) => {
  const {
    name, cpf, phone, rg, birthDate, maritalStatus, nationality, rgIssuer, rgUf,
    companyName, companyCnpj, companyAddress, occupation, monthlyIncome, admissionDate,
    otherIncome, employmentType,
    cep, street, streetNumber, complement, neighborhood, city, state, residenceTime,
    adultsCount, childrenCount, currentlyPaysRent, currentRentWhere,
    tenantType, companyLegalName, companyTradeName, companyStateRegistration,
    hasSpouse, spouseName, spouseCpf, spouseRg, spouseBirthDate, spousePhone,
    spouseOccupation, spouseIncome,
    refBankName, refBankAgency, refBankAccount,
    refPersonal1Name, refPersonal1Phone, refPersonal1Relation,
    refPersonal2Name, refPersonal2Phone, refPersonal2Relation,
    setName, setPhone, setRg, setBirthDate, setMaritalStatus, setNationality,
    setRgIssuer, setRgUf,
    setCompanyName, setCompanyCnpj, setCompanyAddress, setOccupation,
    setMonthlyIncome, setAdmissionDate, setOtherIncome, setEmploymentType,
    setCep, setStreet, setStreetNumber, setComplement, setNeighborhood, setCity, setState,
    setResidenceTime,
    setAdultsCount, setChildrenCount, setCurrentlyPaysRent, setCurrentRentWhere,
    setTenantType, setCompanyLegalName, setCompanyTradeName, setCompanyStateRegistration,
    setHasSpouse, setSpouseName, setSpouseCpf, setSpouseRg, setSpouseBirthDate,
    setSpousePhone, setSpouseOccupation, setSpouseIncome,
    setRefBankName, setRefBankAgency, setRefBankAccount,
    setRefPersonal1Name, setRefPersonal1Phone, setRefPersonal1Relation,
    setRefPersonal2Name, setRefPersonal2Phone, setRefPersonal2Relation,
    handleCpfChange, handleSpouseCpfChange,
  } = profile;

  return (
    <div className='space-y-4'>
      {step.status === 'submitted' ? (
        <div className='space-y-4'>
          <div className='p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl text-blue-800 dark:text-blue-300 text-xs font-medium leading-relaxed'>
            <p className='font-bold mb-1 flex items-center gap-1.5'>
              <Loader className='animate-spin text-blue-500 shrink-0' size={14} /> Dados cadastrais enviados com sucesso!
            </p>
            Aguardando a validação jurídica do proprietário para prosseguir para a próxima etapa.
          </div>
          <div className='bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl p-4 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300'>
            <p><span className='text-slate-400 font-medium'>Nome:</span> {name}</p>
            <p><span className='text-slate-400 font-medium'>CPF:</span> {cpf}</p>
            <p><span className='text-slate-400 font-medium'>Celular:</span> {phone || 'Não informado'}</p>
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
                  {tenant.onboarding_profile_rejected_reason || 'Por favor, corrija os dados cadastrais.'}
                </p>
              </div>
            </div>
          )}

          {/* Tipo: PF / PJ */}
          <div>
            <label className={labelClass}>Tipo de Cadastro</label>
            <div className='flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl'>
              {(['pf', 'pj'] as const).map((t) => (
                <button
                  key={t}
                  type='button'
                  onClick={() => setTenantType(t)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    tenantType === t
                      ? 'bg-white dark:bg-surface-dark text-primary shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </button>
              ))}
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
            <h4 className='text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2'>
              <User size={14} /> Dados Pessoais
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className={labelClass}>Nome Completo</label>
                <input type='text' value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>CPF</label>
                <input type='text' value={cpf} onChange={handleCpfChange} placeholder='000.000.000-00' className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>RG / CNH</label>
                <input type='text' value={rg} onChange={(e) => setRg(e.target.value)} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Órgão Expeditor</label>
                <input type='text' value={rgIssuer} onChange={(e) => setRgIssuer(e.target.value)} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>UF do RG</label>
                <input type='text' value={rgUf} onChange={(e) => setRgUf(e.target.value)} maxLength={2} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Data de Nascimento</label>
                <input type='date' value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Estado Civil</label>
                <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className={selectClass}>
                  <option value=''>Selecione...</option>
                  <option value='solteiro'>Solteiro(a)</option>
                  <option value='casado'>Casado(a)</option>
                  <option value='separado'>Separado(a)</option>
                  <option value='divorciado'>Divorciado(a)</option>
                  <option value='viuvo'>Viúvo(a)</option>
                </select>
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Nacionalidade</label>
                <select value={nationality} onChange={(e) => setNationality(e.target.value)} className={selectClass}>
                  <option value=''>Selecione...</option>
                  <option value='brasileira'>Brasileira</option>
                  <option value='estrangeira'>Estrangeira</option>
                </select>
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Celular / Telefone</label>
                <input type='tel' value={phone} onChange={(e) => setPhone(e.target.value)} placeholder='(00) 90000-0000' className={inputClass} />
              </div>
            </div>
          </div>

          {/* Endereço Atual */}
          <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
            <h4 className='text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2'>
              <MapPin size={14} /> Endereço Atual
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className={labelClass}>CEP</label>
                <input type='text' value={cep} onChange={(e) => setCep(e.target.value)} placeholder='00000-000' className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Rua</label>
                <input type='text' value={street} onChange={(e) => setStreet(e.target.value)} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Número</label>
                <input type='text' value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Complemento <span className='text-slate-300'>(opcional)</span></label>
                <input type='text' value={complement} onChange={(e) => setComplement(e.target.value)} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Bairro</label>
                <input type='text' value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Cidade</label>
                <input type='text' value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>UF</label>
                <input type='text' value={state} onChange={(e) => setState(e.target.value)} maxLength={2} className={inputClass} />
              </div>
              <div className='space-y-2'>
                <label className={labelClass}>Tempo de Residência</label>
                <input type='text' value={residenceTime} onChange={(e) => setResidenceTime(e.target.value)} placeholder='Ex: 3 anos' className={inputClass} />
              </div>
            </div>
          </div>

          {/* PF: Dados Pessoais Extras / PJ: Dados da Empresa */}
          {tenantType === 'pf' ? (
            <>
              {/* Vínculo Empregatício */}
              <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
                <h4 className='text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2'>
                  <Briefcase size={14} /> Vínculo Empregatício
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className={labelClass}>Nome da Empresa</label>
                    <input type='text' value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>CNPJ da Empresa <span className='text-slate-300'>(opcional)</span></label>
                    <input type='text' value={companyCnpj} onChange={(e) => setCompanyCnpj(e.target.value)} placeholder='00.000.000/0000-00' className={inputClass} />
                  </div>
                  <div className='space-y-2 md:col-span-2'>
                    <label className={labelClass}>Endereço da Empresa</label>
                    <input type='text' value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className={inputClass} />
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>Cargo / Profissão</label>
                    <input type='text' value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputClass} />
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>Tipo de Vínculo</label>
                    <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={selectClass}>
                      <option value='CLT'>CLT</option>
                      <option value='Autônomo'>Autônomo</option>
                      <option value='PJ'>PJ / Empresário</option>
                      <option value='Aposentado'>Aposentado / Pensionista</option>
                      <option value='Outros'>Outros</option>
                    </select>
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>Salário / Renda Mensal</label>
                    <input type='text' value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder='R$ 0,00' className={inputClass} />
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>Data de Admissão</label>
                    <input type='date' value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} className={inputClass} />
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>Outros Rendimentos <span className='text-slate-300'>(opcional)</span></label>
                    <input type='text' value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} placeholder='R$ 0,00' className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Informações Residenciais */}
              <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
                <h4 className='text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2'>
                  <Users size={14} /> Informações do Imóvel
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className={labelClass}>Nº de Adultos no Imóvel</label>
                    <input type='number' min={1} value={adultsCount} onChange={(e) => setAdultsCount(e.target.value)} className={inputClass} />
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>Nº de Crianças no Imóvel</label>
                    <input type='number' min={0} value={childrenCount} onChange={(e) => setChildrenCount(e.target.value)} className={inputClass} />
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>Já paga aluguel atualmente?</label>
                    <select value={currentlyPaysRent} onChange={(e) => setCurrentlyPaysRent(e.target.value)} className={selectClass}>
                      <option value='Não'>Não</option>
                      <option value='Sim'>Sim</option>
                    </select>
                  </div>
                  {currentlyPaysRent === 'Sim' && (
                    <div className='space-y-2'>
                      <label className={labelClass}>Onde paga aluguel?</label>
                      <input type='text' value={currentRentWhere} onChange={(e) => setCurrentRentWhere(e.target.value)} className={inputClass} />
                    </div>
                  )}
                </div>
              </div>

              {/* Cônjuge */}
              {maritalStatus === 'casado' && (
                <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
                  <h4 className='text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2'>
                    <Heart size={14} /> Cônjuge
                  </h4>
                  <div className='space-y-2 mb-4'>
                    <label className={labelClass}>Possui cônjuge?</label>
                    <select value={hasSpouse} onChange={(e) => setHasSpouse(e.target.value)} className={selectClass}>
                      <option value='Não'>Não</option>
                      <option value='Sim'>Sim</option>
                    </select>
                  </div>
                  {hasSpouse === 'Sim' && (
                    <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <label className={labelClass}>Nome Completo</label>
                          <input type='text' value={spouseName} onChange={(e) => setSpouseName(e.target.value)} className={inputClass} />
                        </div>
                        <div className='space-y-2'>
                          <label className={labelClass}>CPF</label>
                          <input type='text' value={spouseCpf} onChange={handleSpouseCpfChange} placeholder='000.000.000-00' className={inputClass} />
                        </div>
                        <div className='space-y-2'>
                          <label className={labelClass}>RG</label>
                          <input type='text' value={spouseRg} onChange={(e) => setSpouseRg(e.target.value)} className={inputClass} />
                        </div>
                        <div className='space-y-2'>
                          <label className={labelClass}>Data de Nascimento</label>
                          <input type='date' value={spouseBirthDate} onChange={(e) => setSpouseBirthDate(e.target.value)} className={inputClass} />
                        </div>
                        <div className='space-y-2'>
                          <label className={labelClass}>Telefone</label>
                          <input type='text' value={spousePhone} onChange={(e) => setSpousePhone(e.target.value)} className={inputClass} />
                        </div>
                        <div className='space-y-2'>
                          <label className={labelClass}>Profissão</label>
                          <input type='text' value={spouseOccupation} onChange={(e) => setSpouseOccupation(e.target.value)} className={inputClass} />
                        </div>
                        <div className='space-y-2'>
                          <label className={labelClass}>Renda Mensal</label>
                          <input type='text' value={spouseIncome} onChange={(e) => setSpouseIncome(e.target.value)} placeholder='R$ 0,00' className={inputClass} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Referências */}
              <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
                <h4 className='text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2'>
                  <BookOpen size={14} /> Referências
                </h4>
                <div className='space-y-4'>
                  <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3'>
                      Referência Bancária <span className='text-slate-300'>(opcional)</span>
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div className='space-y-2'>
                        <label className={labelClass}>Banco</label>
                        <input type='text' value={refBankName} onChange={(e) => setRefBankName(e.target.value)} className={inputClass} />
                      </div>
                      <div className='space-y-2'>
                        <label className={labelClass}>Agência</label>
                        <input type='text' value={refBankAgency} onChange={(e) => setRefBankAgency(e.target.value)} className={inputClass} />
                      </div>
                      <div className='space-y-2'>
                        <label className={labelClass}>Conta</label>
                        <input type='text' value={refBankAccount} onChange={(e) => setRefBankAccount(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  </div>
                  <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3'>
                      Referências Pessoais <span className='text-slate-300'>(opcional)</span>
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-3'>
                        <p className='text-[9px] font-bold text-slate-400 uppercase tracking-wider'>Referência 1</p>
                        <div className='space-y-2'>
                          <input type='text' value={refPersonal1Name} onChange={(e) => setRefPersonal1Name(e.target.value)} placeholder='Nome' className={inputClass} />
                        </div>
                        <div className='space-y-2'>
                          <input type='text' value={refPersonal1Phone} onChange={(e) => setRefPersonal1Phone(e.target.value)} placeholder='Telefone' className={inputClass} />
                        </div>
                        <div className='space-y-2'>
                          <input type='text' value={refPersonal1Relation} onChange={(e) => setRefPersonal1Relation(e.target.value)} placeholder='Relação (amigo, parente...)' className={inputClass} />
                        </div>
                      </div>
                      <div className='space-y-3'>
                        <p className='text-[9px] font-bold text-slate-400 uppercase tracking-wider'>Referência 2</p>
                        <div className='space-y-2'>
                          <input type='text' value={refPersonal2Name} onChange={(e) => setRefPersonal2Name(e.target.value)} placeholder='Nome' className={inputClass} />
                        </div>
                        <div className='space-y-2'>
                          <input type='text' value={refPersonal2Phone} onChange={(e) => setRefPersonal2Phone(e.target.value)} placeholder='Telefone' className={inputClass} />
                        </div>
                        <div className='space-y-2'>
                          <input type='text' value={refPersonal2Relation} onChange={(e) => setRefPersonal2Relation(e.target.value)} placeholder='Relação (amigo, parente...)' className={inputClass} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* PJ: Dados da Empresa */
            <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
              <h4 className='text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2'>
                <Building2 size={14} /> Dados da Empresa
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2 md:col-span-2'>
                  <label className={labelClass}>Razão Social</label>
                  <input type='text' value={companyLegalName} onChange={(e) => setCompanyLegalName(e.target.value)} className={inputClass} />
                </div>
                <div className='space-y-2'>
                  <label className={labelClass}>Nome Fantasia <span className='text-slate-300'>(opcional)</span></label>
                  <input type='text' value={companyTradeName} onChange={(e) => setCompanyTradeName(e.target.value)} className={inputClass} />
                </div>
                <div className='space-y-2'>
                  <label className={labelClass}>CNPJ</label>
                  <input type='text' value={companyCnpj} onChange={(e) => setCompanyCnpj(e.target.value)} placeholder='00.000.000/0000-00' className={inputClass} />
                </div>
                <div className='space-y-2'>
                  <label className={labelClass}>Inscrição Estadual/Municipal <span className='text-slate-300'>(opcional)</span></label>
                  <input type='text' value={companyStateRegistration} onChange={(e) => setCompanyStateRegistration(e.target.value)} className={inputClass} />
                </div>
                <div className='space-y-2 md:col-span-2'>
                  <label className={labelClass}>Endereço da Empresa</label>
                  <input type='text' value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className={inputClass} />
                </div>
                <div className='space-y-2'>
                  <label className={labelClass}>Cargo do Representante</label>
                  <input type='text' value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputClass} />
                </div>
                <div className='space-y-2'>
                  <label className={labelClass}>Renda Mensal da Empresa</label>
                  <input type='text' value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder='R$ 0,00' className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* Garantia da Locação */}
          <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
            <h4 className='text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2'>
              <ShieldCheck size={14} /> Garantia da Locação
            </h4>
            <div className='space-y-2'>
              <label className={labelClass}>Tipo de Garantia</label>
              <select value={guaranteeType} onChange={(e) => setGuaranteeType(e.target.value)} className={selectClass}>
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
                    <label className={labelClass}>Nome Completo</label>
                    <input type='text' value={guarantorName} onChange={(e) => setGuarantorName(e.target.value)} className={inputClass} />
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>CPF</label>
                    <input type='text' value={guarantorCpf} onChange={handleGuarantorCpfChange} placeholder='000.000.000-00' className={inputClass} />
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>RG</label>
                    <input type='text' value={guarantorRg} onChange={(e) => setGuarantorRg(e.target.value)} className={inputClass} />
                  </div>
                  <div className='space-y-2'>
                    <label className={labelClass}>Telefone</label>
                    <input type='text' value={guarantorPhone} onChange={(e) => setGuarantorPhone(e.target.value)} placeholder='(00) 90000-0000' className={inputClass} />
                  </div>
                  <div className='space-y-2 md:col-span-2'>
                    <label className={labelClass}>E-mail</label>
                    <input type='email' value={guarantorEmail} onChange={(e) => setGuarantorEmail(e.target.value)} className={inputClass} />
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
