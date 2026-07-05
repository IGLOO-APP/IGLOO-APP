import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ChevronRight,
  Download,
  X,
  Loader2,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';

interface DocumentPreviewModalProps {
  previewUrl: string | null;
  previewTitle: string;
  previewPage: number;
  onPageChange: (page: number) => void;
  isPreviewLoading: boolean;
  apyPreviewUrl: string | null;
  previewError: string | null;
  originalUrl: string | null;
  tenant: any;
  modalActionLoading: boolean;
  modalRejectReason: string;
  showModalRejectInput: boolean;
  onRejectReasonChange: (v: string) => void;
  onShowRejectInput: (v: boolean) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  previewUrl,
  previewTitle,
  previewPage,
  onPageChange,
  isPreviewLoading,
  apyPreviewUrl,
  previewError,
  originalUrl,
  tenant,
  modalActionLoading,
  modalRejectReason,
  showModalRejectInput,
  onRejectReasonChange,
  onShowRejectInput,
  onClose,
  onApprove,
  onReject,
}) => {
  return (
    <AnimatePresence>
      {previewUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-sm'
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className='relative w-full max-w-6xl h-[95vh] md:h-full md:max-h-[90vh] bg-slate-900 rounded-3xl md:rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col'
          >
            <div className='flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 gap-3 border-b border-white/5 bg-slate-950/80 backdrop-blur-md'>
              <div className='flex items-center gap-3 md:gap-4'>
                <div className='w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5 shrink-0'>
                  <FileText size={20} />
                </div>
                <div className='min-w-0'>
                  <h3 className='text-sm md:text-base font-black text-white uppercase tracking-wider truncate'>
                    {previewTitle || 'Visualização do Documento'}
                  </h3>
                  <p className='text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest'>
                    Inspeção Digital IGLOO
                  </p>
                </div>
              </div>
              <div className='flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto'>
                {previewUrl.toLowerCase().includes('.pdf') && (
                  <div className='flex items-center gap-2 md:gap-3 bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-white/10'>
                    <button
                      onClick={() => onPageChange(Math.max(1, previewPage - 1))}
                      className='text-white/60 hover:text-white transition-colors'
                      disabled={previewPage === 1}
                    >
                      <ChevronRight size={16} className='rotate-180' />
                    </button>
                    <span className='text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest min-w-[50px] md:min-w-[60px] text-center'>
                      Pág. {previewPage}
                    </span>
                    <button
                      onClick={() => onPageChange(previewPage + 1)}
                      className='text-white/60 hover:text-white transition-colors'
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
                <div className='flex items-center gap-2 ml-auto sm:ml-0'>
                  <a
                    href={previewUrl}
                    download
                    className='p-2 md:p-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all'
                    title='Baixar Documento Original'
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={onClose}
                    className='p-2 md:p-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white border border-white/5 hover:border-white/10 transition-all'
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className='flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-slate-950/40'>
              <div className='w-full md:flex-1 bg-black/60 overflow-auto flex items-center justify-center p-4 md:p-6 relative h-[380px] md:h-auto shrink-0'>
                {isPreviewLoading && (
                  <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md'>
                    <Loader2 className='w-10 h-10 text-emerald-500 animate-spin mb-4' />
                    <p className='text-[10px] font-black text-white uppercase tracking-[0.2em] animate-pulse'>
                      Gerando Preview Inteligente...
                    </p>
                  </div>
                )}
                {previewError ? (
                  <div className='max-w-md text-center space-y-4 animate-fadeIn'>
                    <div className='w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto'>
                      <ShieldAlert size={32} />
                    </div>
                    <div>
                      <h4 className='text-white font-black uppercase tracking-tight'>
                        Falha no Carregamento
                      </h4>
                      <p className='text-xs text-slate-400 font-medium mt-2 leading-relaxed'>
                        {previewError}
                      </p>
                    </div>
                  </div>
                ) : apyPreviewUrl ? (
                  <img
                    src={apyPreviewUrl}
                    alt={previewTitle}
                    className='max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-scaleIn border border-white/5'
                  />
                ) : previewUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ||
                  previewUrl.includes('image') ||
                  !previewUrl.toLowerCase().includes('.pdf') ? (
                  <img
                    src={previewUrl}
                    alt={previewTitle}
                    className='max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/5'
                    onError={() => {
                      if (originalUrl && originalUrl !== previewUrl)
                        window.location.href = originalUrl;
                    }}
                  />
                ) : (
                  (() => {
                    let directPdfUrl = previewUrl;
                    if (directPdfUrl.includes('docs.google.com/viewer')) {
                      try {
                        const urlParams = new URLSearchParams(new URL(directPdfUrl).search);
                        const extractedUrl = urlParams.get('url');
                        if (extractedUrl) directPdfUrl = decodeURIComponent(extractedUrl);
                      } catch {
                        /* ignore invalid URL */
                      }
                    }
                    return (
                      <iframe
                        src={`${directPdfUrl}#toolbar=0&page=${previewPage}`}
                        className='w-full h-full border-none rounded-2xl'
                        title='PDF Preview'
                      />
                    );
                  })()
                )}
              </div>

              <div className='w-full md:w-[380px] border-t md:border-t-0 md:border-l border-white/10 bg-slate-900/60 backdrop-blur-md p-6 flex flex-col justify-between overflow-y-auto'>
                <div className='space-y-6'>
                  <div>
                    <h4 className='text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1'>
                      Menu de Análise
                    </h4>
                    <h3 className='text-base font-black text-white uppercase tracking-tight'>
                      Decisão e Validação
                    </h3>
                    <p className='text-[10px] text-slate-400 font-bold uppercase mt-1'>
                      Revise o documento abaixo e confirme o status.
                    </p>
                  </div>
                  <div className='p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3'>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>
                      Inquilino
                    </p>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black uppercase text-sm border border-emerald-500/20'>
                        {tenant?.name?.charAt(0) || 'I'}
                      </div>
                      <div>
                        <p className='text-xs font-black text-white uppercase tracking-tight truncate max-w-[200px]'>
                          {tenant?.name || 'Sem nome'}
                        </p>
                        <p className='text-[9px] text-slate-400 font-medium truncate max-w-[200px]'>
                          {tenant?.email}
                        </p>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[9px]'>
                      <div>
                        <span className='text-slate-500 block uppercase tracking-wider'>
                          Telefone
                        </span>
                        <span className='text-white font-bold'>{tenant?.phone || '--'}</span>
                      </div>
                      <div>
                        <span className='text-slate-500 block uppercase tracking-wider'>CPF</span>
                        <span className='text-white font-bold'>{tenant?.cpf || '--'}</span>
                      </div>
                    </div>
                  </div>
                  <div className='p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2'>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>
                      Documento Selecionado
                    </p>
                    <div className='flex items-start gap-2.5'>
                      <FileText size={18} className='text-emerald-400 mt-0.5' />
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-black text-white uppercase tracking-tight truncate'>
                          {previewTitle}
                        </p>
                        <p className='text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5'>
                          {previewUrl.toLowerCase().includes('.pdf') ? 'PDF' : 'IMAGEM'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>
                      Ações Disponíveis
                    </p>
                    <div className='flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5'>
                      <span className='text-[9px] text-slate-400 font-black uppercase tracking-wider'>
                        Status Atual:
                      </span>
                      {tenant?.onboarding_documents_status === 'approved' ? (
                        <span className='px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20'>
                          Aprovado
                        </span>
                      ) : tenant?.onboarding_documents_status === 'rejected' ? (
                        <span className='px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[8px] font-black uppercase tracking-widest border border-rose-500/20'>
                          Recusado
                        </span>
                      ) : (
                        <span className='px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase tracking-widest border border-amber-500/20 animate-pulse'>
                          Aguardando Análise
                        </span>
                      )}
                    </div>
                    {tenant?.onboarding_documents_status === 'rejected' &&
                      tenant?.onboarding_documents_rejected_reason && (
                        <div className='p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[10px] text-rose-400'>
                          <span className='font-black uppercase tracking-wider block mb-1'>
                            Motivo da Recusa:
                          </span>
                          {tenant.onboarding_documents_rejected_reason}
                        </div>
                      )}
                    {showModalRejectInput ? (
                      <div className='space-y-3 bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl animate-fadeIn'>
                        <div>
                          <label className='text-[8px] font-black text-rose-400 uppercase tracking-widest block mb-2'>
                            Motivo da Recusa
                          </label>
                          <textarea
                            value={modalRejectReason}
                            onChange={(e) => onRejectReasonChange(e.target.value)}
                            placeholder='Descreva de forma clara o que precisa ser corrigido pelo inquilino...'
                            className='w-full h-24 p-3 bg-slate-950/60 border border-rose-500/20 rounded-xl text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-rose-500 transition-all resize-none'
                          />
                        </div>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => {
                              onShowRejectInput(false);
                              onRejectReasonChange('');
                            }}
                            className='flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all'
                            disabled={modalActionLoading}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={onReject}
                            className='flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5'
                            disabled={modalActionLoading || !modalRejectReason.trim()}
                          >
                            {modalActionLoading ? (
                              <Loader2 size={12} className='animate-spin' />
                            ) : (
                              'Confirmar Recusa'
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex gap-3'>
                        <button
                          onClick={() => onShowRejectInput(true)}
                          className='flex-1 h-12 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border border-rose-500/15 hover:scale-[1.02] transition-all'
                          disabled={modalActionLoading}
                        >
                          <ThumbsDown size={14} /> Recusar Etapa
                        </button>
                        <button
                          onClick={onApprove}
                          className='flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all'
                          disabled={modalActionLoading}
                        >
                          {modalActionLoading ? (
                            <Loader2 size={14} className='animate-spin' />
                          ) : (
                            <>
                              <ThumbsUp size={14} /> Aprovar Etapa
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className='pt-4 border-t border-white/5 text-center'>
                  <p className='text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed'>
                    Aprovando ou recusando a etapa de documentos, o inquilino será notificado em
                    tempo real.
                  </p>
                </div>
              </div>
            </div>
            <div className='p-4 bg-slate-950/80 border-t border-white/5 flex items-center justify-between px-8 backdrop-blur-md'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
                <p className='text-[8px] text-emerald-500/80 font-black uppercase tracking-widest'>
                  ApyHub Preview Engine Ativo
                </p>
              </div>
              <p className='text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]'>
                Pressione ESC para fechar
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
