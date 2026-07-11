import React from 'react';
import {
  CheckCircle,
  Loader,
  XCircle,
  Upload,
  User,
  DollarSign,
  Banknote,
  Landmark,
  Clock,
  Copy,
  FileCheck,
  HelpCircle,
} from 'lucide-react';
import { Tenant } from '../../../types';
import { UseOnboardingDocumentsReturn } from '../../../hooks/useOnboardingDocuments';
import type { OnboardingStepConfig } from '../../onboarding/types';

interface DocumentsSectionProps {
  tenant: Tenant;
  docs: UseOnboardingDocumentsReturn;
  step: OnboardingStepConfig;
  onUpload: () => void;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  tenant,
  docs,
  step,
  onUpload,
}) => {
  const monthlyValue = tenant.contract?.monthly_value || 0;
  const depositAmount = monthlyValue * 3;

  return (
    <div className='space-y-4'>
      {step.status === 'submitted' ? (
        <div className='space-y-4'>
          <div className='p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl text-blue-800 dark:text-blue-300 text-xs font-medium leading-relaxed'>
            <p className='font-bold mb-1 flex items-center gap-1.5'>
              <Loader className='animate-spin text-blue-500 shrink-0' size={14} /> Documentos em
              análise
            </p>
            O proprietário está revisando seus comprovantes e documento de identidade.
          </div>
          <div className='bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl p-4 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300'>
            <p>
              <span className='text-slate-400 font-medium'>Documento ID:</span>{' '}
              {tenant.onboarding_documents_urls?.rg_name || 'Enviado'}
            </p>
            <p>
              <span className='text-slate-400 font-medium'>Comp. Renda:</span>{' '}
              {tenant.onboarding_documents_urls?.income_name || 'Enviado'}
            </p>
          </div>
        </div>
      ) : step.completed ? (
        <div className='p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2'>
          <CheckCircle size={18} /> Todos os documentos foram auditados e aprovados!
        </div>
      ) : (
        <div className='space-y-4'>
          <p className='text-xs text-slate-500 font-medium leading-relaxed'>{step.desc}</p>
          {step.status === 'rejected' && (
            <div className='p-4 bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-800 dark:text-red-350 text-xs flex gap-2'>
              <XCircle size={18} className='shrink-0 mt-0.5' />
              <div>
                <p className='font-bold'>Documentação Recusada</p>
                <p className='mt-0.5 font-medium'>
                  {tenant.onboarding_documents_rejected_reason ||
                    'Por favor, envie comprovantes legíveis.'}
                </p>
              </div>
            </div>
          )}

          <div className='p-5 bg-primary/5 border border-primary/20 rounded-2xl'>
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
              VALOR PREVISTO DE GARANTIA
            </p>
            <p className='text-2xl font-black text-slate-900 dark:text-white'>
              R$ {depositAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className='text-[10px] text-slate-400 font-medium mt-1'>
              {monthlyValue > 0
                ? `Baseado em 3x o aluguel mensal (R$ ${monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`
                : 'Aguardando valor do contrato'}
            </p>
          </div>

          {(() => {
            const hasDeposit =
              docs.ownerConfig?.accepts_deposit &&
              (docs.ownerConfig.pix_enabled || docs.ownerConfig.bank_transfer_enabled);
            const hasGuarantor = docs.ownerConfig?.accepts_guarantor;
            const neitherAvailable = docs.ownerConfig && !hasDeposit && !hasGuarantor;
            const onlyOne = docs.ownerConfig && (hasDeposit ? 1 : 0) + (hasGuarantor ? 1 : 0) === 1;

            if (!docs.ownerConfig) {
              return (
                <div className='p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-3'>
                  <HelpCircle size={16} className='text-amber-500 shrink-0' />
                  <p className='text-xs font-medium text-amber-700 dark:text-amber-300'>
                    Aguardando configuração do proprietário...
                  </p>
                </div>
              );
            }

            if (neitherAvailable) {
              return (
                <div className='p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3'>
                  <XCircle size={16} className='text-red-500 shrink-0' />
                  <p className='text-xs font-medium text-red-700 dark:text-red-300'>
                    O proprietário ainda não configurou as opções de garantia. Aguarde.
                  </p>
                </div>
              );
            }

            return (
              <div className='space-y-2'>
                {!onlyOne && (
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                    Selecione a Modalidade de Garantia
                  </p>
                )}
                {onlyOne && (
                  <p className='text-[10px] font-medium text-slate-400 ml-1'>
                    Modalidade configurada pelo proprietário:
                  </p>
                )}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {hasDeposit && (
                    <button
                      type='button'
                      onClick={() => !onlyOne && docs.setGuaranteeType('deposito_caucao')}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        onlyOne ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        docs.guaranteeType === 'deposito_caucao'
                          ? 'border-[rgba(19,200,236,0.5)] bg-[rgba(19,200,236,0.06)]'
                          : 'border-gray-100 dark:border-white/7 bg-white dark:bg-surface-dark hover:border-primary/30'
                      }`}
                    >
                      <div className='w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mb-3'>
                        <DollarSign size={20} className='text-amber-500' />
                      </div>
                      <p className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider'>
                        Depósito Caução
                      </p>
                      <p className='text-[10px] text-slate-400 font-medium mt-1 leading-relaxed'>
                        Pagamento antecipado de 3 meses de aluguel via Pix ou depósito bancário
                      </p>
                    </button>
                  )}
                  {hasGuarantor && (
                    <button
                      type='button'
                      onClick={() => !onlyOne && docs.setGuaranteeType('fiador')}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        onlyOne ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        docs.guaranteeType === 'fiador'
                          ? 'border-[rgba(19,200,236,0.5)] bg-[rgba(19,200,236,0.06)]'
                          : 'border-gray-100 dark:border-white/7 bg-white dark:bg-surface-dark hover:border-primary/30'
                      }`}
                    >
                      <div className='w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-3'>
                        <User size={20} className='text-blue-500' />
                      </div>
                      <p className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider'>
                        Fiador
                      </p>
                      <p className='text-[10px] text-slate-400 font-medium mt-1 leading-relaxed'>
                        Apresentação de fiador com documentação para análise
                      </p>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          <div className='pt-2'>
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3'>
              Documentos Obrigatórios
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-dark flex flex-col items-center justify-center text-center space-y-2 relative group hover:border-primary/50 transition-colors'>
                <input
                  type='file'
                  accept='image/*,application/pdf'
                  onChange={(e) => docs.setRgFile(e.target.files?.[0] || null)}
                  className='absolute inset-0 opacity-0 cursor-pointer'
                />
                <div className='w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors'>
                  <Upload size={20} />
                </div>
                <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                  {docs.rgFile ? docs.rgFile.name : 'RG ou CNH'}
                </span>
                <span className='text-[10px] text-slate-400'>PDF, JPG ou PNG</span>
              </div>
              <div className='p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-dark flex flex-col items-center justify-center text-center space-y-2 relative group hover:border-primary/50 transition-colors'>
                <input
                  type='file'
                  accept='image/*,application/pdf'
                  onChange={(e) => docs.setIncomeFile(e.target.files?.[0] || null)}
                  className='absolute inset-0 opacity-0 cursor-pointer'
                />
                <div className='w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors'>
                  <Upload size={20} />
                </div>
                <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                  {docs.incomeFile ? docs.incomeFile.name : 'Comprovante de Renda'}
                </span>
                <span className='text-[10px] text-slate-400'>Holerite ou Declaração</span>
              </div>
              <div className='p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-dark flex flex-col items-center justify-center text-center space-y-2 relative group hover:border-primary/50 transition-colors'>
                <input
                  type='file'
                  accept='image/*,application/pdf'
                  onChange={(e) => docs.setResidenceFile(e.target.files?.[0] || null)}
                  className='absolute inset-0 opacity-0 cursor-pointer'
                />
                <div className='w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors'>
                  <Upload size={20} />
                </div>
                <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                  {docs.residenceFile ? docs.residenceFile.name : 'Comp. de Residência'}
                </span>
                <span className='text-[10px] text-slate-400'>Conta de luz/água/gás</span>
              </div>
            </div>
          </div>

          {docs.guaranteeType === 'deposito_caucao' && docs.ownerConfig && (
            <div className='p-5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl space-y-4'>
              <p className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2'>
                <Banknote size={16} /> Instruções de Pagamento
              </p>

              {docs.ownerConfig.pix_enabled && docs.ownerConfig.bank_transfer_enabled && (
                <div className='flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl'>
                  <button
                    type='button'
                    onClick={() => docs.setPaymentTabMode('pix')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                      docs.paymentTabMode === 'pix'
                        ? 'bg-white dark:bg-surface-dark text-primary shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Pix
                  </button>
                  <button
                    type='button'
                    onClick={() => docs.setPaymentTabMode('bank')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                      docs.paymentTabMode === 'bank'
                        ? 'bg-white dark:bg-surface-dark text-primary shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Transferência
                  </button>
                </div>
              )}

              {docs.ownerConfig?.pix_enabled &&
                (!docs.ownerConfig?.bank_transfer_enabled || docs.paymentTabMode === 'pix') && (
                  <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2'>
                      CHAVE PIX DO PROPRIETÁRIO
                    </p>
                    <div className='flex items-center gap-2'>
                      <code className='flex-1 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-surface-dark px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 truncate'>
                        {docs.ownerConfig.pix_key || '—'}
                      </code>
                      <button
                        type='button'
                        onClick={() => {
                          if (docs.ownerConfig!.pix_key) {
                            void navigator.clipboard.writeText(docs.ownerConfig!.pix_key);
                            docs.setCopiedPix(true);
                            setTimeout(() => docs.setCopiedPix(false), 2000);
                          }
                        }}
                        className='shrink-0 w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-primary/10 transition-colors'
                      >
                        <Copy
                          size={16}
                          className={docs.copiedPix ? 'text-emerald-500' : 'text-slate-400'}
                        />
                      </button>
                    </div>
                    {docs.ownerConfig.pix_key_type && (
                      <p className='text-[10px] text-slate-400 mt-1'>
                        Tipo de chave: {docs.ownerConfig.pix_key_type}
                      </p>
                    )}
                    <p className='text-xs font-bold text-slate-700 dark:text-slate-300 mt-2'>
                      Valor a transferir: R${' '}
                      {depositAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}

              {docs.ownerConfig.bank_transfer_enabled &&
                (!docs.ownerConfig.pix_enabled || docs.paymentTabMode === 'bank') && (
                  <div className='p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1'>
                      <Landmark size={12} /> DADOS BANCÁRIOS
                    </p>
                    <div className='space-y-1 text-xs'>
                      <p>
                        <span className='text-slate-400 font-medium'>Banco:</span>{' '}
                        <span className='font-bold text-slate-700 dark:text-slate-300'>
                          {docs.ownerConfig.bank_name || '—'}
                        </span>
                      </p>
                      <p>
                        <span className='text-slate-400 font-medium'>Agência:</span>{' '}
                        <span className='font-bold text-slate-700 dark:text-slate-300'>
                          {docs.ownerConfig.bank_agency || '—'}
                        </span>
                      </p>
                      <p>
                        <span className='text-slate-400 font-medium'>Conta:</span>{' '}
                        <span className='font-bold text-slate-700 dark:text-slate-300'>
                          {docs.ownerConfig.bank_account || '—'}
                        </span>
                      </p>
                      <p>
                        <span className='text-slate-400 font-medium'>Titular:</span>{' '}
                        <span className='font-bold text-slate-700 dark:text-slate-300'>
                          {docs.ownerConfig.account_holder_name || '—'}
                        </span>
                      </p>
                    </div>
                    <p className='text-xs font-bold text-slate-700 dark:text-slate-300 mt-2'>
                      Valor a transferir: R${' '}
                      {depositAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}

              <div className='p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-dark flex flex-col items-center justify-center text-center space-y-2 relative group hover:border-primary/50 transition-colors'>
                <input
                  type='file'
                  accept='image/*,application/pdf'
                  onChange={(e) => docs.setPaymentReceiptFile(e.target.files?.[0] || null)}
                  className='absolute inset-0 opacity-0 cursor-pointer'
                />
                <div className='w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors'>
                  <Upload size={20} />
                </div>
                <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                  {docs.paymentReceiptFile
                    ? docs.paymentReceiptFile.name
                    : 'Comprovante de Pagamento'}
                </span>
                <span className='text-[10px] text-slate-400'>PDF, JPG ou PNG (max 10MB)</span>
              </div>
              {docs.paymentReceiptFile && (
                <p className='text-[10px] font-medium text-amber-500 flex items-center gap-1'>
                  <Clock size={12} /> AGUARDANDO ANÁLISE
                </p>
              )}
            </div>
          )}

          {docs.guaranteeType === 'fiador' && (
            <div className='p-5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl space-y-4'>
              <p className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2'>
                <User size={16} /> Dados do Fiador
              </p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                    Nome Completo
                  </label>
                  <input
                    type='text'
                    value={docs.guarantorName}
                    onChange={(e) => docs.setGuarantorName(e.target.value)}
                    className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                    Data de Nascimento
                  </label>
                  <input
                    type='date'
                    value={docs.guarantorBirthDate}
                    onChange={(e) => docs.setGuarantorBirthDate(e.target.value)}
                    className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                    CPF
                  </label>
                  <input
                    type='text'
                    value={docs.guarantorCpf}
                    onChange={docs.handleGuarantorCpfChange}
                    placeholder='000.000.000-00'
                    maxLength={14}
                    className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                    RG
                  </label>
                  <input
                    type='text'
                    value={docs.guarantorRg}
                    onChange={(e) => docs.setGuarantorRg(e.target.value)}
                    className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                    Telefone <span className='text-slate-300'>(opcional)</span>
                  </label>
                  <input
                    type='text'
                    value={docs.guarantorPhone}
                    onChange={(e) => docs.setGuarantorPhone(e.target.value)}
                    placeholder='(00) 90000-0000'
                    className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                    E-mail <span className='text-slate-300'>(opcional)</span>
                  </label>
                  <input
                    type='email'
                    value={docs.guarantorEmail}
                    onChange={(e) => docs.setGuarantorEmail(e.target.value)}
                    className='w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-surface-dark font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  />
                </div>
              </div>

              <div className='border-t border-gray-100 dark:border-white/10 pt-4'>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3'>
                  Documentos do Fiador
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-dark flex flex-col items-center justify-center text-center space-y-2 relative group hover:border-primary/50 transition-colors'>
                    <input
                      type='file'
                      accept='image/*,application/pdf'
                      onChange={(e) => docs.setGuarantorRgFile(e.target.files?.[0] || null)}
                      className='absolute inset-0 opacity-0 cursor-pointer'
                    />
                    <div className='w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors'>
                      <Upload size={20} />
                    </div>
                    <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                      {docs.guarantorRgFile ? docs.guarantorRgFile.name : 'RG do Fiador'}
                    </span>
                    <span className='text-[10px] text-slate-400'>PDF, JPG ou PNG</span>
                  </div>
                  <div className='p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-surface-dark flex flex-col items-center justify-center text-center space-y-2 relative group hover:border-primary/50 transition-colors'>
                    <input
                      type='file'
                      accept='image/*,application/pdf'
                      onChange={(e) =>
                        docs.setGuarantorIncomeProofFile(e.target.files?.[0] || null)
                      }
                      className='absolute inset-0 opacity-0 cursor-pointer'
                    />
                    <div className='w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors'>
                      <Upload size={20} />
                    </div>
                    <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                      {docs.guarantorIncomeProofFile
                        ? docs.guarantorIncomeProofFile.name
                        : 'Comprovante de Renda'}
                    </span>
                    <span className='text-[10px] text-slate-400'>
                      Últimos 3 holerites ou declaração de IR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onUpload}
            disabled={
              docs.loading ||
              !docs.rgFile ||
              !docs.incomeFile ||
              !docs.guaranteeType ||
              (docs.guaranteeType === 'deposito_caucao' && !docs.paymentReceiptFile) ||
              (docs.guaranteeType === 'fiador' &&
                (!docs.guarantorName ||
                  !docs.guarantorBirthDate ||
                  !docs.guarantorRg ||
                  !docs.guarantorRgFile ||
                  !docs.guarantorIncomeProofFile))
            }
            className='w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50'
          >
            {docs.loading ? <Loader className='animate-spin' size={16} /> : <FileCheck size={16} />}
            {docs.loading ? 'Enviando arquivos...' : 'Enviar Documentos para Validação'}
          </button>
        </div>
      )}
    </div>
  );
};
