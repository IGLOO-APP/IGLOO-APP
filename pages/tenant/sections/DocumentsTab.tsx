import React from 'react';
import {
  FileText,
  FileCheck,
  Download,
  Upload,
  Key,
  Camera,
  Shield,
  User,
  MapPin,
} from 'lucide-react';
import { TenantProfileConfig, RequirementStatus, Guarantor } from '../../../types';

interface DocumentsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents: any;
  config: TenantProfileConfig;
  getStatusBadge: (status: string, requirementStatus?: RequirementStatus) => React.ReactNode;
  handleDocUpload: (key: string) => void;
  guaranteeType?: string;
  setGuaranteeType?: (type: string) => void;
  guarantorData?: Guarantor;
  setGuarantorData?: React.Dispatch<React.SetStateAction<Guarantor>>;
  guarantorFileIncome?: File | null;
  setGuarantorFileIncome?: React.Dispatch<React.SetStateAction<File | null>>;
  guarantorFileResidence?: File | null;
  setGuarantorFileResidence?: React.Dispatch<React.SetStateAction<File | null>>;
  isEditing?: boolean;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  documents,
  config,
  getStatusBadge,
  handleDocUpload,
  guaranteeType = '',
  setGuaranteeType,
  guarantorData,
  setGuarantorData,
  guarantorFileIncome,
  setGuarantorFileIncome,
  guarantorFileResidence,
  setGuarantorFileResidence,
  isEditing,
}) => {
  return (
    <div className='animate-fadeIn pb-8 space-y-8'>
      {/* 1. Property Docs */}
      <section>
        <div className='px-1 mb-4'>
          <h3 className='font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-widest'>
            <Key className='text-primary' size={20} /> Documentos do Imóvel
          </h3>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
            Compartilhado pelo proprietário
          </p>
        </div>
        <div className='bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm'>
          {[
            {
              id: 'contract',
              name: 'Contrato de Locação Assinado',
              icon: FileCheck,
              date: '10/01/2024',
              active: config.sections.sharedDocs.contract,
            },
            {
              id: 'inspection',
              name: 'Laudo de Vistoria de Entrada',
              icon: Camera,
              date: '08/01/2024',
              active: config.sections.sharedDocs.inspection,
            },
            {
              id: 'rules',
              name: 'Regimento Interno do Condomínio',
              icon: Shield,
              date: '01/01/2024',
              active: config.sections.sharedDocs.rules,
            },
          ]
            .filter((doc) => doc.active)
            .map((doc) => (
              <div
                key={doc.id}
                className='flex items-center justify-between p-5 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group'
              >
                <div className='flex items-center gap-4'>
                  <div className='p-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 group-hover:text-primary transition-colors'>
                    <doc.icon size={22} />
                  </div>
                  <div>
                    <span className='text-sm font-black text-slate-800 dark:text-slate-200 block mb-0.5'>
                      {doc.name}
                    </span>
                    <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
                      Disponível desde {doc.date}
                    </span>
                  </div>
                </div>
                <button className='p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-white/10 transition-all'>
                  <Download size={22} />
                </button>
              </div>
            ))}

          {/* Custom Shared Docs */}
          {config.sections.sharedDocs.custom
            .filter((doc) => doc.active)
            .map((doc) => (
              <div
                key={doc.id}
                className='flex items-center justify-between p-5 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group'
              >
                <div className='flex items-center gap-4'>
                  <div className='p-3 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 group-hover:text-primary transition-colors'>
                    <FileCheck size={22} />
                  </div>
                  <div>
                    <span className='text-sm font-black text-slate-800 dark:text-slate-200 block mb-0.5'>
                      {doc.label}
                    </span>
                    <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
                      Documento Complementar
                    </span>
                  </div>
                </div>
                <button className='p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-white/10 transition-all'>
                  <Download size={22} />
                </button>
              </div>
            ))}
        </div>
      </section>

      {/* SEPARATOR */}
      <div className='h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent my-10'></div>

      {/* 2. Personal Docs */}
      <section>
        <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 px-1 text-sm uppercase tracking-widest'>
          <FileText className='text-indigo-500' size={20} /> Meus Documentos
        </h3>
        <div className='grid gap-4'>
          {[
            {
              id: 'rgFrente',
              label: 'RG ou CNH (Frente)',
              desc: 'Frente do documento com foto',
              status: config.sections.requiredDocs.id_card,
            },
            {
              id: 'rgVerso',
              label: 'RG ou CNH (Verso)',
              desc: 'Verso do documento',
              status: config.sections.requiredDocs.id_card,
            },
            {
              id: 'cpfDoc',
              label: 'CPF',
              desc: 'Comprovante ou cartão de CPF',
              status: 'required',
            },
            {
              id: 'income',
              label: 'Comprovante de Renda',
              desc: 'Holerite ou Extrato bancário',
              status: config.sections.requiredDocs.income,
            },
            {
              id: 'residence',
              label: 'Comp. de Residência',
              desc: 'Conta de luz/água recente',
              status: config.sections.requiredDocs.residence,
            },
            {
              id: 'selfie',
              label: 'Selfie com Documento',
              desc: 'Selfie segurando o documento ao lado do rosto',
              status: 'required',
            },
            {
              id: 'guarantee',
              label: 'Apólice / Garantia',
              desc: 'Doc. do seguro fiança ou garantia',
              status: config.sections.requiredDocs.guarantee,
            },
          ]
            .filter((doc) => doc.status !== 'hidden')
            .map((doc) => {
              const docState = documents[doc.id] || { status: 'pending', date: null };
              return (
                <div
                  key={doc.id}
                  className='bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/20'
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`p-3 rounded-xl ${docState.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'} dark:bg-opacity-10`}
                    >
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 className='text-sm font-black text-slate-900 dark:text-white leading-tight mb-0.5'>
                        {doc.label}
                      </h4>
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                        {doc.desc}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-4 ml-auto md:ml-0'>
                    {docState.date && (
                      <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline'>
                        Enviado em {docState.date}
                      </span>
                    )}
                    {getStatusBadge(docState.status, doc.status as RequirementStatus)}
                    <div className='flex flex-col items-center gap-1'>
                      <button
                        onClick={() => handleDocUpload(doc.id)}
                        className='p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all active:scale-95'
                      >
                        <Upload size={20} />
                      </button>
                      <span className='text-[9px] font-bold text-slate-400 uppercase'>
                        PDF ou imagem, máx. 5MB
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Custom Required Docs */}
          {config.sections.requiredDocs.custom
            .filter((doc) => doc.status !== 'hidden')
            .map((doc) => {
              const docState = documents[doc.id] || { status: 'pending', date: null };
              return (
                <div
                  key={doc.id}
                  className='bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/20'
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`p-3 rounded-xl ${docState.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'} dark:bg-opacity-10`}
                    >
                      <FileText size={22} />
                    </div>
                    <div>
                      <h4 className='text-sm font-black text-slate-900 dark:text-white leading-tight mb-0.5'>
                        {doc.label}
                      </h4>
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                        {doc.description || 'Documento exigido'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-4 ml-auto md:ml-0'>
                    {docState.date && (
                      <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline'>
                        Enviado em {docState.date}
                      </span>
                    )}
                    {getStatusBadge(docState.status, doc.status as RequirementStatus)}
                    <div className='flex flex-col items-center gap-1'>
                      <button
                        onClick={() => handleDocUpload(doc.id)}
                        className='p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all active:scale-95'
                      >
                        <Upload size={20} />
                      </button>
                      <span className='text-[9px] font-bold text-slate-400 uppercase'>
                        PDF ou imagem, máx. 5MB
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* 3. Garantia da Locação */}
      {config.sections.requiredDocs.guarantee !== 'hidden' && setGuaranteeType && (
        <>
          <div className='h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent my-10'></div>

          <section>
            <h3 className='font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 px-1 text-sm uppercase tracking-widest'>
              <Shield className='text-amber-500' size={20} /> Garantia da Locação
            </h3>

            <div className='bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-6'>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                  Tipo de Garantia
                </label>
                <select
                  disabled={!isEditing}
                  value={guaranteeType}
                  onChange={(e) => setGuaranteeType(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl border transition-all text-sm font-bold bg-white dark:bg-surface-dark border-primary/30 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white'
                >
                  <option value=''>Selecione o tipo de garantia...</option>
                  <option value='fiador'>Fiador</option>
                  <option value='seguro_fianca'>Seguro Fiança</option>
                  <option value='deposito_caucao'>Depósito / Caução</option>
                  <option value='outros'>Outros</option>
                </select>
              </div>

              {/* Fiador Form */}
              {guaranteeType === 'fiador' && setGuarantorData && (
                <div className='space-y-4 pt-4 border-t border-gray-100 dark:border-white/5'>
                  <div className='flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-300'>
                    <User size={16} className='text-amber-500' />
                    Dados do Fiador
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                        Nome Completo
                      </label>
                      <input
                        type='text'
                        value={guarantorData?.name || ''}
                        readOnly={!isEditing}
                        onChange={(e) =>
                          setGuarantorData &&
                          setGuarantorData({ ...guarantorData, name: e.target.value } as Guarantor)
                        }
                        className='w-full px-4 py-3 rounded-xl border transition-all text-sm font-bold bg-white dark:bg-surface-dark border-primary/30 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                        CPF
                      </label>
                      <input
                        type='text'
                        value={guarantorData?.cpf || ''}
                        readOnly={!isEditing}
                        onChange={(e) =>
                          setGuarantorData &&
                          setGuarantorData({ ...guarantorData, cpf: e.target.value } as Guarantor)
                        }
                        className='w-full px-4 py-3 rounded-xl border transition-all text-sm font-bold bg-white dark:bg-surface-dark border-primary/30 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                        RG
                      </label>
                      <input
                        type='text'
                        value={guarantorData?.rg || ''}
                        readOnly={!isEditing}
                        onChange={(e) =>
                          setGuarantorData &&
                          setGuarantorData({ ...guarantorData, rg: e.target.value } as Guarantor)
                        }
                        className='w-full px-4 py-3 rounded-xl border transition-all text-sm font-bold bg-white dark:bg-surface-dark border-primary/30 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                        Telefone
                      </label>
                      <input
                        type='text'
                        value={guarantorData?.phone || ''}
                        readOnly={!isEditing}
                        onChange={(e) =>
                          setGuarantorData &&
                          setGuarantorData({ ...guarantorData, phone: e.target.value } as Guarantor)
                        }
                        className='w-full px-4 py-3 rounded-xl border transition-all text-sm font-bold bg-white dark:bg-surface-dark border-primary/30 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                        E-mail
                      </label>
                      <input
                        type='email'
                        value={guarantorData?.email || ''}
                        readOnly={!isEditing}
                        onChange={(e) =>
                          setGuarantorData &&
                          setGuarantorData({ ...guarantorData, email: e.target.value } as Guarantor)
                        }
                        className='w-full px-4 py-3 rounded-xl border transition-all text-sm font-bold bg-white dark:bg-surface-dark border-primary/30 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white'
                      />
                    </div>
                  </div>

                  {/* Fiador Document Uploads */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4'>
                    <div className='p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-dark flex flex-col items-center justify-center text-center space-y-2 relative group hover:border-primary/50 transition-colors'>
                      <input
                        type='file'
                        accept='image/*,application/pdf'
                        disabled={!isEditing}
                        onChange={(e) =>
                          setGuarantorFileIncome &&
                          setGuarantorFileIncome(e.target.files?.[0] || null)
                        }
                        className='absolute inset-0 opacity-0 cursor-pointer'
                      />
                      <Upload
                        size={20}
                        className='text-slate-400 group-hover:text-primary transition-colors'
                      />
                      <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                        {guarantorFileIncome
                          ? guarantorFileIncome.name
                          : 'Comprovante de Renda do Fiador'}
                      </span>
                      <span className='text-[10px] text-slate-400'>PDF, JPG ou PNG</span>
                      {guarantorData?.income_url && !guarantorFileIncome && (
                        <span className='text-[10px] text-emerald-500 font-bold'>
                          Documento já enviado
                        </span>
                      )}
                    </div>
                    <div className='p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-dark flex flex-col items-center justify-center text-center space-y-2 relative group hover:border-primary/50 transition-colors'>
                      <input
                        type='file'
                        accept='image/*,application/pdf'
                        disabled={!isEditing}
                        onChange={(e) =>
                          setGuarantorFileResidence &&
                          setGuarantorFileResidence(e.target.files?.[0] || null)
                        }
                        className='absolute inset-0 opacity-0 cursor-pointer'
                      />
                      <MapPin
                        size={20}
                        className='text-slate-400 group-hover:text-primary transition-colors'
                      />
                      <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                        {guarantorFileResidence
                          ? guarantorFileResidence.name
                          : 'Comprovante de Residência do Fiador'}
                      </span>
                      <span className='text-[10px] text-slate-400'>PDF, JPG ou PNG</span>
                      {guarantorData?.residence_url && !guarantorFileResidence && (
                        <span className='text-[10px] text-emerald-500 font-bold'>
                          Documento já enviado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {guaranteeType && guaranteeType !== 'fiador' && (
                <div className='p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl text-blue-800 dark:text-blue-300 text-xs font-medium'>
                  {guaranteeType === 'seguro_fianca' &&
                    'Você selecionou Seguro Fiança. Envie o documento da apólice na seção "Meus Documentos" acima.'}
                  {guaranteeType === 'deposito_caucao' &&
                    'Você selecionou Depósito / Caução. O valor será definido no contrato de locação.'}
                  {guaranteeType === 'outros' &&
                    'Você selecionou outra forma de garantia. Consulte o proprietário para mais detalhes.'}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
