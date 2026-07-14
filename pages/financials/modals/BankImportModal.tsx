import React, { useRef } from 'react';
import { FileUp, Check, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface MatchedTx {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  suggestedCategory?: string;
  matchedId?: string;
  matchStatus: 'perfect' | 'none';
}

interface BankImportModalProps {
  show: boolean;
  onClose: () => void;
  isProcessingFile: boolean;
  importResult: MatchedTx[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearResult: () => void;
}

export const BankImportModal: React.FC<BankImportModalProps> = ({
  show,
  onClose,
  isProcessingFile,
  importResult,
  onFileUpload,
  onClearResult,
}) => {
  const bankFileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    onClose();
    onClearResult();
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto p-0 gap-0 md:max-w-xl border border-white/10 rounded-[22px]' style={{ background: 'rgba(12,14,26,0.92)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
        <div aria-hidden='true' className='absolute inset-0 overflow-hidden pointer-events-none' style={{ borderRadius: 'inherit' }}>
          <div className='absolute w-[50vw] h-[50vw] top-[-20%] left-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-1), transparent 70%)', filter: 'blur(90px)' }} />
          <div className='absolute w-[42vw] h-[42vw] bottom-[-20%] right-[-20%] rounded-full opacity-50' style={{ background: 'radial-gradient(circle, var(--lg-blob-2), transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div className='relative z-10'>
        <DialogHeader className='px-6 py-4 border-b border-white/10 flex-shrink-0'>
          <DialogTitle className='text-xl font-bold'>Conciliação Bancária</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className='p-6 space-y-6 h-[80vh] flex flex-col'>
          {!importResult.length ? (
            <div className='flex-1 flex flex-col justify-center space-y-6'>
              <div
                onClick={() => bankFileInputRef.current?.click()}
                className={`p-10 border-2 border-dashed rounded-2xl text-center bg-white/5 group hover:border-primary transition-all cursor-pointer ${isProcessingFile ? 'opacity-50 pointer-events-none' : 'border-white/10'}`}
              >
                <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform'>
                  {isProcessingFile ? (
                    <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin' />
                  ) : (
                    <FileUp className='text-primary' size={40} />
                  )}
                </div>
                <h4 className='text-xl font-bold text-white'>
                  {isProcessingFile ? 'Processando...' : 'Importar Extrato'}
                </h4>
                <p className='text-sm text-slate-500 mt-2 max-w-xs mx-auto'>
                  Arraste seu arquivo OFX ou CSV aqui ou clique para selecionar.
                </p>
                <input
                  type='file'
                  ref={bankFileInputRef}
                  className='hidden'
                  accept='.ofx,.csv'
                  onChange={onFileUpload}
                />
              </div>

              <div className='space-y-4'>
                <h5 className='text-xs font-bold text-slate-400 uppercase tracking-widest text-center'>
                  Formatos Suportados
                </h5>
                <div className='grid grid-cols-2 gap-3'>
                  {['OFX (Padrão)', 'CSV (Excel)', 'Itaú / Nubank', 'Inter / Santander'].map(
                    (bank) => (
                      <div
                        key={bank}
                        className='px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-slate-300 flex items-center gap-2'
                      >
                        <div className='w-2 h-2 rounded-full bg-emerald-500' />
                        {bank}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className='flex-1 flex flex-col overflow-hidden'>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='font-bold text-white'>
                  Transações Identificadas
                </h4>
                <span className='text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full'>
                  {importResult.length} itens
                </span>
              </div>

              <div className='flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar'>
                {importResult.map((btx) => (
                  <div
                    key={btx.id}
                    className='p-4 rounded-xl border border-white/10 bg-white/5'
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <p className='text-xs font-bold text-slate-400 uppercase'>{btx.date}</p>
                        <p className='text-sm font-bold text-white'>
                          {btx.description}
                        </p>
                      </div>
                      <p
                        className={`font-bold ${btx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}
                      >
                        {btx.amount > 0 ? '+' : ''} R$ {btx.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className='flex items-center justify-between pt-3 border-t border-white/10'>
                      <div className='flex items-center gap-2'>
                        {btx.matchStatus === 'perfect' ? (
                          <span className='flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded'>
                            <Check size={12} strokeWidth={1.8} /> Conciliado
                          </span>
                        ) : (
                          <span className='flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-900/20 px-2 py-0.5 rounded'>
                            <AlertTriangle size={12} strokeWidth={1.8} /> Novo Lançamento
                          </span>
                        )}
                        <span className='text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded uppercase'>
                          {btx.suggestedCategory}
                        </span>
                      </div>
                      <button className='text-xs font-bold text-primary hover:underline'>
                        {btx.matchStatus === 'perfect' ? 'Ver Match' : 'Confirmar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className='pt-6 mt-auto border-t border-white/10 flex gap-3'>
                <button
                  onClick={onClearResult}
                  className='flex-1 h-12 rounded-xl bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition-all'
                >
                  Voltar
                </button>
                <button className='flex-1 h-12 rounded-full bg-gradient-to-br from-[#2f6bff] to-[#3fa9ff] text-white font-bold hover:brightness-110 transition-all active:scale-95'>
                  Efetivar Conciliação
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
