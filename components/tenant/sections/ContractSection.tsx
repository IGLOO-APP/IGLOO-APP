import React from 'react';
import {
  CheckCircle,
  Loader,
  Clock,
  PenTool,
  CloudUpload,
  ArrowLeft,
  Download,
  FileText,
  ScrollText,
  Building2,
  Banknote,
  Calendar,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import { Tenant } from '../../../types';
import type { OnboardingStepConfig } from '../../onboarding/types';

interface ContractSectionProps {
  tenant: Tenant;
  step: OnboardingStepConfig;
  fullContract: any | null;
  loadingContract: boolean;
  contractMethod: 'digital' | 'manual' | null;
  setContractFlowMethod: (m: 'digital' | 'manual' | null) => void;
  typedSignature: string;
  setTypedSignature: (v: string) => void;
  manualContractFile: File | null;
  setManualContractFile: (f: File | null) => void;
  mergedLoading: boolean;
  onSign: () => void;
  onManualUpload: () => void;
}

export const ContractSection: React.FC<ContractSectionProps> = ({
  tenant,
  step,
  fullContract,
  loadingContract,
  contractMethod,
  setContractFlowMethod,
  typedSignature,
  setTypedSignature,
  manualContractFile,
  setManualContractFile,
  mergedLoading,
  onSign,
  onManualUpload,
}) => {
  return (
    <div className='space-y-5'>
      {step.completed ? (
        <div className='p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2'>
          <CheckCircle size={18} /> Seu contrato foi assinado eletronicamente e está ativo.
        </div>
      ) : tenant.onboarding_contract_status === 'submitted' ? (
        <div className='p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-[32px] text-center space-y-4'>
          <div className='w-16 h-16 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center mx-auto'>
            <Clock size={32} />
          </div>
          <div>
            <h4 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight'>
              Contrato em Auditoria
            </h4>
            <p className='text-xs text-slate-500 mt-2'>
              Você enviou o contrato assinado manualmente. O proprietário está revisando o documento
              para validar sua integração.
            </p>
          </div>
        </div>
      ) : (
        <>
          {!contractMethod ? (
            <div className='space-y-6 animate-fadeIn'>
              <div className='p-6 bg-slate-900 text-white rounded-[32px] space-y-2 relative overflow-hidden'>
                <div className='absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl' />
                <h4 className='text-lg font-black uppercase tracking-tight relative z-10'>
                  Escolha como assinar
                </h4>
                <p className='text-xs text-slate-400 font-medium relative z-10'>
                  Selecione a opção que for mais conveniente para você.
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <button
                  onClick={() => setContractFlowMethod('digital')}
                  className='group p-8 bg-white dark:bg-surface-dark border-2 border-slate-100 dark:border-white/5 rounded-[40px] hover:border-primary transition-all text-left space-y-4'
                >
                  <div className='w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <PenTool size={28} />
                  </div>
                  <div>
                    <h5 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                      Assinatura Digital
                    </h5>
                    <p className='text-[10px] text-slate-500 font-medium mt-1'>
                      Rápido, seguro e 100% online através da nossa plataforma.
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setContractFlowMethod('manual')}
                  className='group p-8 bg-white dark:bg-surface-dark border-2 border-slate-100 dark:border-white/5 rounded-[40px] hover:border-primary transition-all text-left space-y-4'
                >
                  <div className='w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <CloudUpload size={28} />
                  </div>
                  <div>
                    <h5 className='text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                      Upload Manual
                    </h5>
                    <p className='text-[10px] text-slate-500 font-medium mt-1'>
                      Baixe o PDF, assine fisicamente e envie a cópia digitalizada.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className='animate-fadeIn space-y-6'>
              <button
                onClick={() => setContractFlowMethod(null)}
                className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-4'
              >
                <ArrowLeft size={12} /> Alterar método de assinatura
              </button>
              {contractMethod === 'digital' ? (
                <>
                  {loadingContract ? (
                    <div className='flex items-center justify-center py-8'>
                      <Loader className='animate-spin text-primary' size={24} />
                    </div>
                  ) : (
                    <div className='bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg'>
                      <div className='bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-5'>
                        <div className='flex items-center gap-3 mb-3'>
                          <div className='w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center'>
                            <ScrollText size={20} />
                          </div>
                          <div>
                            <p className='text-[9px] font-black uppercase tracking-[0.2em] text-slate-400'>
                              IGLOO IMÓVEIS
                            </p>
                            <h3 className='text-sm font-black leading-tight'>
                              Contrato de Locação Residencial
                            </h3>
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-3'>
                          <span className='flex items-center gap-1.5 text-[10px] bg-white/10 px-2.5 py-1 rounded-full font-bold'>
                            <Hash size={10} /> Ref:{' '}
                            {fullContract?.contract_number ||
                              tenant.contract?.id?.toString().slice(0, 8).toUpperCase()}
                          </span>
                          <span className='flex items-center gap-1.5 text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold'>
                            <ShieldCheck size={10} /> Documento Autenticado
                          </span>
                        </div>
                      </div>
                      <div className='p-5 space-y-5 text-left'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                          <div className='bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5'>
                            <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2'>
                              LOCADOR (Proprietário)
                            </p>
                            <p className='text-sm font-black text-slate-900 dark:text-white'>
                              {fullContract?.owner_profile?.name || 'Proprietário'}
                            </p>
                            <p className='text-xs text-slate-500 mt-0.5'>
                              {fullContract?.owner_profile?.email || '—'}
                            </p>
                          </div>
                          <div className='bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5'>
                            <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2'>
                              LOCATÁRIO (Inquilino)
                            </p>
                            <p className='text-sm font-black text-slate-900 dark:text-white'>
                              {fullContract?.tenant_profile?.name || tenant.name}
                            </p>
                            <p className='text-xs text-slate-500 mt-0.5'>
                              {fullContract?.tenant_profile?.email || tenant.email}
                            </p>
                          </div>
                        </div>
                        {(fullContract?.property || tenant.property) && (
                          <div className='flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl p-4'>
                            <Building2 size={20} className='text-primary shrink-0' />
                            <div>
                              <p className='text-[9px] font-black text-primary/60 uppercase tracking-widest'>
                                IMÓVEL OBJETO DO CONTRATO
                              </p>
                              <p className='text-sm font-black text-slate-900 dark:text-white'>
                                {fullContract?.property?.name || tenant.property}
                              </p>
                              <p className='text-xs text-slate-500'>
                                {fullContract?.property?.address || tenant.property_address}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-center'>
                          <div className='bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5'>
                            <Banknote size={16} className='text-emerald-500 mx-auto mb-1' />
                            <p className='text-[9px] font-bold text-slate-400 uppercase'>Valor</p>
                            <p className='text-xs font-black text-slate-900 dark:text-white'>
                              R$ {(tenant.contract?.monthly_value || 0).toLocaleString('pt-BR')}
                            </p>
                            <p className='text-[9px] text-slate-400'>por mês</p>
                          </div>
                          <div className='bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5'>
                            <Calendar size={16} className='text-blue-500 mx-auto mb-1' />
                            <p className='text-[9px] font-bold text-slate-400 uppercase'>
                              Vencimento
                            </p>
                            <p className='text-xs font-black text-slate-900 dark:text-white'>
                              Dia {tenant.contract?.payment_day || '--'}
                            </p>
                            <p className='text-[9px] text-slate-400'>todo mês</p>
                          </div>
                          <div className='bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5'>
                            <Calendar size={16} className='text-violet-500 mx-auto mb-1' />
                            <p className='text-[9px] font-bold text-slate-400 uppercase'>Início</p>
                            <p className='text-xs font-black text-slate-900 dark:text-white'>
                              {tenant.contract?.start_date
                                ? new Date(tenant.contract.start_date).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit',
                                  })
                                : '--'}
                            </p>
                          </div>
                          <div className='bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-100 dark:border-white/5'>
                            <Calendar size={16} className='text-orange-500 mx-auto mb-1' />
                            <p className='text-[9px] font-bold text-slate-400 uppercase'>Término</p>
                            <p className='text-xs font-black text-slate-900 dark:text-white'>
                              {tenant.contract?.end_date
                                ? new Date(tenant.contract.end_date).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit',
                                  })
                                : '--'}
                            </p>
                          </div>
                        </div>
                        {fullContract?.pdf_url && (
                          <a
                            href={fullContract.pdf_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center justify-center gap-2 w-full py-2.5 border border-primary/30 text-primary rounded-xl text-xs font-bold hover:bg-primary/5 transition-colors'
                          >
                            <FileText size={14} /> Visualizar PDF Completo
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  <div className='bg-white dark:bg-surface-dark border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 text-left'>
                    <div className='flex items-center gap-2'>
                      <PenTool size={16} className='text-primary' />
                      <p className='text-xs font-black text-slate-700 dark:text-white uppercase tracking-wider'>
                        Assinatura Eletrônica
                      </p>
                    </div>
                    <p className='text-xs text-slate-500'>
                      Ao digitar seu nome completo abaixo, você confirma que leu e concorda com
                      todos os termos do contrato acima.
                    </p>
                    <div className='space-y-2'>
                      <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                        Digite seu nome completo para assinar
                      </label>
                      <input
                        type='text'
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        placeholder={tenant.name}
                        className='w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-medium italic text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base'
                      />
                      {typedSignature && (
                        <div className='flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded-xl'>
                          <p className='text-sm text-primary font-serif italic'>{typedSignature}</p>
                          <span className='text-[9px] font-black text-slate-400 uppercase'>
                            {new Date().toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={onSign}
                      disabled={mergedLoading || !typedSignature.trim()}
                      className='w-full h-12 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40'
                    >
                      {mergedLoading ? (
                        <Loader className='animate-spin' size={16} />
                      ) : (
                        <PenTool size={16} />
                      )}
                      {mergedLoading ? 'Processando...' : 'Assinar Contrato de Locação'}
                    </button>
                  </div>
                </>
              ) : (
                <div className='space-y-6 animate-fadeIn'>
                  <div className='p-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[32px] text-center space-y-6'>
                    <div className='w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto'>
                      <Download size={32} />
                    </div>
                    <div>
                      <h4 className='text-base font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                        Baixe o Contrato
                      </h4>
                      <p className='text-xs text-slate-500 mt-2'>
                        Faça o download do documento PDF, imprima, assine e digitalize para nos
                        enviar de volta.
                      </p>
                    </div>
                    <a
                      href={fullContract?.pdf_url || '#'}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-3 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl'
                    >
                      <FileText size={18} /> Baixar PDF para Assinar
                    </a>
                  </div>
                  <div className='p-10 bg-white dark:bg-black/20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[40px] flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/40 transition-all cursor-pointer group'>
                    <div className='w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all flex items-center justify-center'>
                      <CloudUpload size={32} />
                    </div>
                    <div>
                      <p className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight'>
                        Upload do Contrato Assinado
                      </p>
                      <p className='text-[10px] text-slate-500 font-medium mt-2 max-w-[280px]'>
                        Envie o arquivo PDF digitalizado com sua assinatura física.
                      </p>
                    </div>
                    <input
                      type='file'
                      className='hidden'
                      id='tenant-contract-upload'
                      accept='.pdf'
                      onChange={(e) => e.target.files && setManualContractFile(e.target.files[0])}
                    />
                    <label
                      htmlFor='tenant-contract-upload'
                      className='px-8 py-3 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest cursor-pointer hover:scale-105 transition-all'
                    >
                      {manualContractFile ? manualContractFile.name : 'Selecionar Arquivo PDF'}
                    </label>
                    {manualContractFile && (
                      <button
                        onClick={onManualUpload}
                        disabled={mergedLoading}
                        className='w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all'
                      >
                        {mergedLoading ? (
                          <Loader className='animate-spin' size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Finalizar e Enviar para o Proprietário
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
