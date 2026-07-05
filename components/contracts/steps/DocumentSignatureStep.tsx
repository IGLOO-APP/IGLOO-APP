import React from 'react';
import { PenTool, Move, X } from 'lucide-react';
import { SignaturePad } from '../signature/SignaturePad';

interface DocumentSignatureStepProps {
  contractPages: string[];
  signatures: Record<number, string>;
  signaturePositions: Record<number, { x: number; y: number }>;
  movingSignature: number | null;
  showSignatureModal: boolean;
  textareaRefs: React.MutableRefObject<(HTMLTextAreaElement | null)[]>;
  isDraggingRef: React.MutableRefObject<boolean>;
  dragStartRef: React.MutableRefObject<{
    mouseX: number;
    mouseY: number;
    sigX: number;
    sigY: number;
  }>;
  formData: { landlordName: string; tenantName: string };
  onUpdatePageContent: (index: number, content: string) => void;
  onShowSignatureModal: (show: boolean) => void;
  onSignatureConfirm: (dataUrl: string) => void;
  onMoveSignature: (index: number | null) => void;
  onRemoveSignature: (index: number) => void;
}

export const DocumentSignatureStep: React.FC<DocumentSignatureStepProps> = ({
  contractPages,
  signatures,
  signaturePositions,
  movingSignature,
  showSignatureModal,
  textareaRefs,
  isDraggingRef,
  dragStartRef,
  formData,
  onUpdatePageContent,
  onShowSignatureModal,
  onSignatureConfirm,
  onMoveSignature,
  onRemoveSignature,
}) => {
  return (
    <div className='flex-1 flex flex-col lg:flex-row items-stretch bg-slate-100 dark:bg-black/40 p-6 gap-6 overflow-y-auto animate-fadeIn'>
      {showSignatureModal && (
        <SignaturePad onClose={() => onShowSignatureModal(false)} onConfirm={onSignatureConfirm} />
      )}

      <div className='flex-1 flex flex-col items-center gap-10 overflow-y-auto pr-2'>
        {contractPages.map((pageContent, index) => (
          <div
            key={index}
            className='relative group/page w-full max-w-4xl min-h-[1080px] bg-white dark:bg-surface-dark shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col rounded-lg overflow-visible shrink-0 border border-slate-200/60 dark:border-white/5'
          >
            <div className='absolute top-6 left-16 right-16 flex justify-between items-center text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest pointer-events-none select-none border-b border-slate-100 dark:border-white/5 pb-2 z-0'>
              <span>Contrato de Locação</span>
              <span>
                Página {index + 1} de {contractPages.length}
              </span>
            </div>

            <textarea
              ref={(el) => {
                textareaRefs.current[index] = el;
              }}
              value={pageContent}
              onChange={(e) => onUpdatePageContent(index, e.target.value)}
              style={{ pointerEvents: signatures[index] ? 'none' : 'auto' }}
              className='w-full flex-1 p-16 pt-20 bg-transparent border-none resize-none focus:ring-0 font-serif text-[15px] leading-relaxed text-slate-800 dark:text-slate-200 text-justify outline-none relative z-10 overflow-hidden shadow-none'
              placeholder={`Conteúdo da Página ${index + 1}...`}
              spellCheck={false}
            />

            {signatures[index] && signaturePositions[index] && (
              <div
                className={`absolute z-30 cursor-grab active:cursor-grabbing select-none p-2 rounded-xl transition-shadow ${movingSignature === index ? 'ring-2 ring-primary ring-offset-4 dark:ring-offset-surface-dark shadow-2xl bg-primary/5' : 'hover:bg-slate-500/5'}`}
                style={{
                  left: `${signaturePositions[index].x}px`,
                  top: `${signaturePositions[index].y}px`,
                  transform: 'translate(-50%, -50%)',
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  isDraggingRef.current = true;
                  onMoveSignature(index);
                  dragStartRef.current = {
                    mouseX: e.clientX,
                    mouseY: e.clientY,
                    sigX: signaturePositions[index].x,
                    sigY: signaturePositions[index].y,
                  };
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    if (!isDraggingRef.current) return;
                    const deltaX = moveEvent.clientX - dragStartRef.current.mouseX;
                    const deltaY = moveEvent.clientY - dragStartRef.current.mouseY;
                    signaturePositions[index] = {
                      x: Math.max(80, Math.min(780, dragStartRef.current.sigX + deltaX)),
                      y: Math.max(80, Math.min(1000, dragStartRef.current.sigY + deltaY)),
                    };
                  };
                  const onMouseUp = () => {
                    isDraggingRef.current = false;
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              >
                <div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap shadow-md pointer-events-none opacity-90'>
                  <Move size={10} /> Arraste para posicionar
                </div>
                <img
                  src={signatures[index]}
                  className='h-16 object-contain mix-blend-multiply dark:invert opacity-95 select-none pointer-events-none'
                  alt='Assinatura Digital'
                  draggable={false}
                />
                <div className='border-t border-slate-300 dark:border-slate-600 mt-1 pt-1 min-w-[140px] text-center pointer-events-none'>
                  <p className='text-[8px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight'>
                    Autenticação Eletrônica Igloo
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onRemoveSignature(index);
                  }}
                  className='absolute -right-3 -top-3 w-6 h-6 bg-white dark:bg-surface-dark shadow-md rounded-full flex items-center justify-center text-red-500 hover:text-red-600 hover:scale-110 transition-all border border-slate-100 dark:border-white/5 pointer-events-auto z-50'
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {index === contractPages.length - 1 && (
              <div className='mt-auto p-16 pt-0 grid grid-cols-2 gap-12 relative z-20'>
                <div
                  className='border-t-2 border-dashed border-slate-200 dark:border-white/10 pt-4 text-center relative cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl p-4 transition-all group/sigarea'
                  onClick={() => onShowSignatureModal(true)}
                >
                  <div className='absolute inset-0 border-2 border-dashed border-primary/40 bg-primary/[0.02] rounded-xl opacity-0 group-hover/sigarea:opacity-100 transition-opacity flex items-center justify-center z-30 shadow-inner'>
                    <span className='text-[10px] font-black text-primary uppercase tracking-widest bg-white dark:bg-surface-dark px-3 py-1.5 rounded-md shadow-sm'>
                      Assinar digitalmente aqui
                    </span>
                  </div>
                  <p className='font-sans font-bold text-slate-800 dark:text-white text-sm'>
                    {formData.landlordName || 'Investidor Exemplo'}
                  </p>
                  <span className='text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 block'>
                    LOCADOR (PROPRIETÁRIO)
                  </span>
                </div>
                <div className='border-t-2 border-dashed border-slate-200 dark:border-white/10 pt-4 text-center p-4 opacity-60'>
                  <p className='font-sans font-bold text-slate-800 dark:text-white text-sm'>
                    {formData.tenantName || 'Aguardando Cadastro...'}
                  </p>
                  <span className='text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 block'>
                    LOCATÁRIO (INQUILINO)
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='w-full lg:w-[380px] p-6 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 shrink-0 flex flex-col justify-between shadow-xl h-fit sticky top-6'>
        <div className='space-y-6'>
          <div>
            <span className='px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest block w-fit mb-2'>
              Assinatura Digital
            </span>
            <h4 className='text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase'>
              Gestão de Firmas
            </h4>
            <p className='text-xs text-slate-500 font-medium mt-1'>
              Arraste a sua rubrica eletrônica para o local adequado em cada folha ou clique na área
              demarcada ao final.
            </p>
          </div>

          <button
            onClick={() => onShowSignatureModal(true)}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md ${Object.keys(signatures).length > 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 shadow-slate-900/10'}`}
          >
            <PenTool size={16} />{' '}
            {Object.keys(signatures).length > 0 ? 'Assinatura Coletada ✓' : 'Inserir Nova Firma'}
          </button>

          {movingSignature !== null && (
            <button
              onClick={() => onMoveSignature(null)}
              className='w-full py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors'
            >
              Concluir Posicionamento Atual
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
