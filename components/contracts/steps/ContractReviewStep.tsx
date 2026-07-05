import React from 'react';
import { ShieldCheck, CheckCircle2, User, Eye, CheckCircle } from 'lucide-react';
import { Property } from '../../../types';
import { ContractFormData } from './useContractWizard';

interface ContractReviewStepProps {
  formData: ContractFormData;
  contractPages: string[];
  docMode: 'template' | 'upload';
  uploadedFile: File | null;
  properties: Property[];
  onShowPDFPreview: () => void;
}

export const ContractReviewStep: React.FC<ContractReviewStepProps> = ({
  formData,
  contractPages,
  docMode,
  uploadedFile,
  properties,
  onShowPDFPreview,
}) => {
  return (
    <div className='animate-fadeIn space-y-10 py-10'>
      <div className='text-center space-y-4'>
        <div className='relative inline-block'>
          <div className='w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto text-white shadow-2xl shadow-emerald-500/20 rotate-3'>
            <ShieldCheck size={48} />
          </div>
          <div className='absolute -right-2 -top-2 w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg text-emerald-500 animate-bounce'>
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div>
          <h3 className='text-4xl font-black text-slate-900 dark:text-white tracking-tighter'>
            Auditório de Conformidade
          </h3>
          <p className='text-slate-500 font-medium'>
            Validamos todos os pontos críticos. O contrato está pronto para emissão.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm'>
              <div className='flex items-start gap-4'>
                <div className='w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-800 shrink-0'>
                  <img
                    src={
                      properties.find((p) => p.name === formData.property)?.image ||
                      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'
                    }
                    className='w-full h-full object-cover'
                    alt=''
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    O Imóvel
                  </span>
                  <h4 className='text-lg font-black text-slate-900 dark:text-white leading-tight truncate'>
                    {formData.property || 'Studio Centro 01'}
                  </h4>
                  <p className='text-xs text-slate-500 font-medium truncate mt-1'>
                    Rua Augusta, 1200 - São Paulo
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-slate-900 dark:bg-white p-6 rounded-[32px] shadow-2xl shadow-slate-900/10 text-white dark:text-slate-900'>
              <div className='flex items-start gap-4'>
                <div className='w-16 h-16 rounded-2xl bg-white/10 dark:bg-slate-900/5 flex items-center justify-center border border-white/20 dark:border-slate-800/10 shrink-0'>
                  <User size={32} />
                </div>
                <div className='flex-1 min-w-0'>
                  <span className='text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest'>
                    Locatário Principal
                  </span>
                  <h4 className='text-lg font-black leading-tight truncate'>
                    {formData.tenantName || 'João Silva'}
                  </h4>
                  <p className='text-xs opacity-60 font-bold mt-1 uppercase'>
                    CPF: {formData.tenantCpf || '000.000.000-00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
              <div className='space-y-1'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  Mensalidade
                </span>
                <p className='text-xl font-black text-emerald-500 leading-none'>
                  R$ {formData.rentValue || '1.800'}
                </p>
                <span className='text-[10px] font-bold text-slate-400'>Venc. todo dia 10</span>
              </div>
              <div className='space-y-1'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  Garantia
                </span>
                <p className='text-xl font-black text-slate-900 dark:text-white leading-none'>
                  R$ {(parseFloat(formData.rentValue || '0') * 3).toLocaleString()}
                </p>
                <span className='text-[10px] font-bold text-slate-400'>3x Caução</span>
              </div>
              <div className='space-y-1'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  Início
                </span>
                <p className='text-xl font-black text-slate-900 dark:text-white leading-none'>
                  {formData.startDate
                    ? new Date(formData.startDate).toLocaleDateString('pt-BR')
                    : '15/05/2026'}
                </p>
                <span className='text-[10px] font-bold text-slate-400'>Adesão Imediata</span>
              </div>
              <div className='space-y-1'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  Documento
                </span>
                <p className='text-xl font-black text-slate-900 dark:text-white leading-none truncate'>
                  {docMode === 'upload'
                    ? uploadedFile?.name || 'Arquivo Anexo'
                    : `${contractPages.length} Páginas`}
                </p>
                <span className='text-[10px] font-bold text-slate-400 uppercase'>
                  {docMode === 'upload' ? 'Assinatura Externa' : 'Minuta Automatizada'}
                </span>
              </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-8 mt-6 pt-6 border-t border-slate-100 dark:border-white/5'>
              <div className='space-y-1'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  Multa Rescisória
                </span>
                <p className='text-xl font-black text-slate-900 dark:text-white leading-none'>
                  {formData.earlyTerminationFee}x Aluguel
                </p>
                <span className='text-[10px] font-bold text-slate-400'>Proporcional (Art. 4º)</span>
              </div>
              <div className='space-y-1'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                  Lock-in
                </span>
                <p className='text-xl font-black text-slate-900 dark:text-white leading-none'>
                  {formData.lockInPeriod} Meses
                </p>
                <span className='text-[10px] font-bold text-slate-400'>Permanência Mínima</span>
              </div>
              {formData.hasMaintenanceFee && formData.maintenanceFee && (
                <div className='space-y-1'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                    Taxa de Rateio
                  </span>
                  <p className='text-xl font-black text-primary leading-none'>
                    R$ {formData.maintenanceFee}
                  </p>
                  <span className='text-[10px] font-bold text-slate-400'>Mensal Fixo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[40px]'>
            <h5 className='text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2'>
              <ShieldCheck size={16} /> Checklist Legal
            </h5>
            <div className='space-y-4'>
              {[
                'Análise de Crédito Aprovada',
                'Conformidade Lei 8.245/91',
                'Cláusula de Reajuste (IGPM)',
                'Assinatura Digital Ativada',
                'Vigência Validada',
              ].map((item, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <div className='w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20'>
                    <CheckCircle size={12} />
                  </div>
                  <span className='text-xs font-bold text-slate-700 dark:text-slate-300'>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className='p-6 bg-slate-50 dark:bg-black/20 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10'>
            <p className='text-[10px] font-bold text-slate-500 text-center leading-relaxed'>
              Ao clicar em finalizar, o contrato será emitido e enviado para as partes coletarem as
              assinaturas digitais finais.
            </p>
          </div>

          <button
            onClick={onShowPDFPreview}
            className='w-full py-4 px-6 rounded-2xl bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95'
          >
            <Eye size={16} /> Visualizar Minuta em PDF
          </button>
        </div>
      </div>
    </div>
  );
};
